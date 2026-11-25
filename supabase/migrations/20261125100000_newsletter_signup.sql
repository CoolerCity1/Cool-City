-- Eigenständige Newsletter-Anmeldung (Footer, Teaser) mit Double-Opt-in
alter table public.newsletter_subscriptions
  add column if not exists source text,
  add column if not exists doi_sent_at timestamptz;

create or replace function public.subscribe_newsletter(p_secret text, p jsonb)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $$
declare
  em text := lower(trim(p->>'email'));
  loc text := coalesce(nullif(p->>'locale',''), 'de');
  src text := left(nullif(p->>'source',''), 200);
  cid uuid;
  sub public.newsletter_subscriptions%rowtype;
  tok uuid := null;
begin
  perform private.assert_server(p_secret);
  if em is null or em !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(em) > 254 then raise exception 'invalid_email'; end if;
  if loc not in ('de','en','es','it','fr','pt') then loc := 'de'; end if;

  select id into cid from public.contacts where lower(email) = em;
  select * into sub from public.newsletter_subscriptions where lower(email) = em;

  if not found then
    insert into public.newsletter_subscriptions (contact_id, email, locale, doi_status, consented_at, source, doi_sent_at)
    values (cid, em, loc, 'pending', now(), src, now())
    returning doi_token into tok;
  elsif sub.doi_status = 'confirmed' then
    tok := null; -- bereits bestätigt: keine erneute Mail, gleiche Antwort nach außen
  elsif sub.doi_status = 'pending' and sub.doi_sent_at > now() - interval '10 minutes' then
    tok := null; -- Missbrauchsschutz: höchstens eine Bestätigungsmail je 10 Minuten
  else
    update public.newsletter_subscriptions
       set doi_status = 'pending',
           doi_token = case when sub.doi_status = 'unsubscribed' then gen_random_uuid() else sub.doi_token end,
           locale = loc, consented_at = now(), unsubscribed_at = null,
           source = coalesce(src, sub.source), doi_sent_at = now(),
           contact_id = coalesce(sub.contact_id, cid)
     where id = sub.id
    returning doi_token into tok;
  end if;

  insert into public.consent_records (contact_id, purpose, text_version, granted, evidence)
  values (cid, 'newsletter', coalesce(p->>'newsletter_version','2026-11-v1'), true,
          jsonb_build_object('form', 'newsletter_signup', 'email', em, 'source', src, 'locale', loc, 'status', 'doi_pending', 'at', now()));

  return jsonb_build_object('token', tok);
end $$;

revoke all on function public.subscribe_newsletter(text, jsonb) from public;
grant execute on function public.subscribe_newsletter(text, jsonb) to anon, authenticated, service_role;
