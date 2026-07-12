# Revee Brand Project Applications

## Supabase

1. Rode as migrations, em ordem:

```sql
supabase/migrations/001_create_project_applications.sql
supabase/migrations/002_simplify_project_application.sql
```

2. Publique a Edge Function:

```bash
supabase functions deploy send-application-email
```

3. Configure os secrets da Edge Function. Para enviar ao cliente, o remetente precisa pertencer a um domínio verificado no Resend:

```bash
supabase secrets set RESEND_API_KEY="sua-chave-resend"
supabase secrets set APPLICATION_TO_EMAIL="reveebrand@gmail.com"
supabase secrets set RESEND_FROM_EMAIL="Revee Brand <contato@reveebrand.com>"
```

## Netlify

Configure estas variáveis de ambiente no painel da Netlify:

```bash
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
RESEND_API_KEY="sua-chave-resend"
RESEND_FROM_EMAIL="Revee Brand <contato@reveebrand.com>"
APPLICATION_TO_EMAIL="reveebrand@gmail.com"
NEWSLETTER_TO_EMAIL="reveebrand@gmail.com"
```

Depois de salvar as variáveis, faça um novo deploy em **Deploys > Trigger deploy > Clear cache and deploy site**.

O front-end envia a aplicação para `/.netlify/functions/submit-application`.
A Function da Netlify salva primeiro no Supabase e só então chama a Edge Function `send-application-email`. O lead permanece salvo e o formulário retorna sucesso mesmo se algum e-mail falhar.

O formulário do Journal envia nome e e-mail para `/.netlify/functions/subscribe-journal`. A Function envia uma notificação para `NEWSLETTER_TO_EMAIL`; se `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER_PREFIX` e `MAILCHIMP_AUDIENCE_ID` também estiverem configurados, a pessoa é adicionada ao Mailchimp.

Nenhuma chave sensível fica exposta no navegador.
