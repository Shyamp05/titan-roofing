# Titan Roofing Website

Static roofing website built for GitHub + Vercel deployment, with Supabase Postgres as the lead database.

## Free Stack

- GitHub: source control.
- Vercel Hobby: deploy the static site and serverless API from your GitHub repo.
- Supabase Free: Postgres database for quote leads.

## Files

- `index.html`: public roofing website and quote form.
- `admin.html`: private lead dashboard at `/admin`.
- `api/leads.js`: Vercel serverless API for saving and reading leads.
- `database/schema.sql`: Supabase table, indexes, and security policies.
- `vercel.json`: Vercel clean URL and security header config.

## Supabase Setup

1. Create a free Supabase project.
2. Open Supabase SQL Editor.
3. Run all SQL from `database/schema.sql`.
4. Open Project Settings, then API.
5. Copy:
   - Project URL
   - `service_role` key

## Vercel Setup

Add these environment variables in Vercel project settings:

```text
SUPABASE_URL=your Supabase Project URL
SUPABASE_SERVICE_ROLE_KEY=your Supabase service_role key
ADMIN_TOKEN=any long password you choose
```

Do not put the service role key in frontend JavaScript. It belongs only in Vercel environment variables.

## Deploy

1. Push this folder to GitHub.
2. Import the GitHub repo into Vercel.
3. Add the environment variables above.
4. Deploy.

After deploy:

```text
https://your-project.vercel.app
https://your-project.vercel.app/admin
```

## Local Checks

```bash
npm run check
```

The form needs the Vercel API plus Supabase environment variables to save to the database. Without those variables, the site still loads, but form submissions show a database configuration message.
