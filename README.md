# HelpHub

> Self-serve knowledge base & FAQ widget for indie SaaS — HelpKit, but $9/mo

**[helphub.threestack.io](https://helphub.threestack.io)** | Built by ThreeStack

## What is HelpHub?

Stop answering the same questions twice. HelpHub gives your SaaS a searchable, embeddable help center in minutes — no Notion required.

- ✍️ Write articles in a clean Markdown editor
- 🔍 In-app search widget (1 line of JS to embed)
- 🌐 SEO-friendly public help center at yourdomain.com/help
- 📊 Analytics: track views, searches, helpful ratings
- 🔗 Custom domain support on Indie plan

**Pricing:** Free (10 articles) · Indie $9/mo · Pro $19/mo

## Stack

- **Frontend:** Next.js 15, TailwindCSS, shadcn/ui
- **Backend:** Next.js API routes, PostgreSQL (Drizzle ORM)
- **Widget:** Vanilla JS (IIFE, 3KB gzipped)
- **Auth:** NextAuth v5
- **Payments:** Stripe
- **Deploy:** helphub.threestack.io (Coolify)

## Development

```bash
pnpm install
cp .env.example .env.local
pnpm db:push
pnpm dev
```
