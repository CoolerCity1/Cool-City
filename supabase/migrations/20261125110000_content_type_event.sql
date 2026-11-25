-- Öffentliche Branchentermine (Messen, Kongresse, Ausstellungen) als Inhaltstyp "event"
alter table public.content_entries drop constraint content_entries_content_type_check;
alter table public.content_entries add constraint content_entries_content_type_check
  check (content_type = any (array['article','page_block','fact','faq','legal','event']));
