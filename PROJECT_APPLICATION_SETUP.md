# Revee Brand Project Applications

## Supabase

1. Rode a migration:

```sql
supabase/migrations/001_create_project_applications.sql
```

2. Publique a Edge Function:

```bash
supabase functions deploy send-application-email
```

3. Configure os secrets da Edge Function:

```bash
supabase secrets set RESEND_API_KEY="sua-chave-resend"
supabase secrets set APPLICATION_TO_EMAIL="reveebrand@gmail.com"
supabase secrets set RESEND_FROM_EMAIL="Revee Brand <email@seudominio.com>"
```

## Netlify

Configure estas variáveis de ambiente no painel da Netlify:

```bash
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
```

O front-end envia a aplicação para `/.netlify/functions/submit-application`.
A Function da Netlify salva no Supabase e chama a Edge Function `send-application-email`.

Nenhuma chave sensível fica exposta no navegador.
