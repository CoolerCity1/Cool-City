-- Automatisches Posten neuer Wissen-Beiträge auf X und LinkedIn (Warteschlange)
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_entries(id) on delete cascade,
  channel text not null check (channel in ('x','linkedin')),
  status text not null default 'pending' check (status in ('pending','processing','sent','failed','skipped')),
  attempts int not null default 0,
  external_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (content_id, channel)
);
alter table public.social_posts enable row level security;
create policy staff_select on public.social_posts for select to authenticated using ((select private.has_role(array['admin','editor','viewer'])));
create policy staff_update on public.social_posts for update to authenticated using ((select private.has_role(array['admin','editor']))) with check ((select private.has_role(array['admin','editor'])));
create index if not exists social_posts_status_idx on public.social_posts (status, created_at);

-- Sprachen, deren Beiträge gepostet werden (kommagetrennt), Standard: de
insert into private.settings (key, value) values ('social_locales', 'de') on conflict (key) do nothing;

create or replace function private.queue_social_posts()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare locs text[];
begin
  if new.content_type <> 'article' or new.status <> 'published' then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'published' then return new; end if;
  select string_to_array(replace(coalesce((select value from private.settings where key = 'social_locales'), 'de'), ' ', ''), ',') into locs;
  if not (new.locale = any(locs)) then return new; end if;
  insert into public.social_posts (content_id, channel) values (new.id, 'x'), (new.id, 'linkedin')
  on conflict (content_id, channel) do nothing;
  return new;
end $$;

drop trigger if exists content_social_queue on public.content_entries;
create trigger content_social_queue after insert or update of status on public.content_entries
  for each row execute function private.queue_social_posts();

-- Fällige Aufträge übernehmen (inkl. hängender Aufträge > 15 Min.)
create or replace function public.social_claim(p_secret text, p_limit int default 10)
returns table (id uuid, channel text, attempts int, slug text, locale text, title text, teaser text)
language plpgsql
security definer
set search_path to ''
as $$
#variable_conflict use_column
begin
  perform private.assert_server(p_secret);
  return query
  with due as (
    select s.id from public.social_posts s
    join public.content_entries c on c.id = s.content_id
    where c.status = 'published'
      and (s.status = 'pending' or (s.status = 'processing' and s.updated_at < now() - interval '15 minutes'))
      and s.attempts < 3
    order by s.created_at
    limit greatest(1, least(p_limit, 25))
    for update of s skip locked
  ), upd as (
    update public.social_posts s set status = 'processing', attempts = s.attempts + 1, updated_at = now()
    from due where s.id = due.id
    returning s.id, s.channel, s.attempts, s.content_id
  )
  select upd.id, upd.channel, upd.attempts, c.slug, c.locale, c.title, c.teaser
  from upd join public.content_entries c on c.id = upd.content_id;
end $$;

create or replace function public.social_complete(p_secret text, p_id uuid, p_ok boolean, p_external_id text default null, p_error text default null, p_skip boolean default false)
returns void
language plpgsql
security definer
set search_path to ''
as $$
begin
  perform private.assert_server(p_secret);
  update public.social_posts set
    status = case when p_skip then 'skipped' when p_ok then 'sent' when attempts >= 3 then 'failed' else 'pending' end,
    external_id = coalesce(left(p_external_id, 200), external_id),
    error = case when p_ok then null else left(p_error, 1000) end,
    sent_at = case when p_ok then now() else sent_at end,
    updated_at = now()
  where id = p_id;
end $$;

revoke all on function public.social_claim(text, int) from public;
revoke all on function public.social_complete(text, uuid, boolean, text, text, boolean) from public;
grant execute on function public.social_claim(text, int) to anon, authenticated, service_role;
grant execute on function public.social_complete(text, uuid, boolean, text, text, boolean) to anon, authenticated, service_role;
