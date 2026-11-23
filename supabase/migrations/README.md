# Migrationen

Bereits auf das Supabase-Projekt `tgzevhqybqwgrpurlurl` angewendet (Historie in `supabase_migrations.schema_migrations`):

1. `cool_city_core_schema` – Tabellen, Indizes, RLS-Policies, Rollenfunktion `private.has_role`, Storage-Buckets
2. `cool_city_server_rpcs` – Server-Secret-geschützte RPCs (`submit_lead`, `register_webinar`, `claim_email`, …), Storage-Policies

Lokale Dateien erzeugen (einmalig, mit Supabase CLI):

```bash
supabase link --project-ref tgzevhqybqwgrpurlurl
supabase db pull
```

Neue Schemaänderungen immer als neue Datei hier anlegen und mit `supabase db push` anwenden.
Das Server-Secret liegt bewusst **nicht** in einer Migration, sondern wird separat gesetzt:
`insert into private.settings (key, value) values ('server_rpc_secret', '<wert>') on conflict (key) do update set value = excluded.value;`
