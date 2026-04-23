# Service Proposal Builder

A professional, trade-focused SaaS application for creating branded proposals with pricing tables, timelines, terms, and e-signatures in under 10 minutes.

## Overview

Service Proposal Builder is designed for trades and home service businesses (roofers, plumbers, landscapers, painters, HVAC, electricians, general contractors, and pressure washing services) to create professional proposals without hiring a designer.

**Key Features:**
- 8+ trade-specific templates with pre-written scope, pricing, and terms
- Multi-step proposal builder workflow
- Professional PDF export with company branding
- E-signature support (canvas-based signature capture)
- Proposal tracking with status monitoring (Draft, Sent, Viewed, Signed, Declined)
- Line item library for reusable pricing components
- Company settings and branding customization
- Stripe integration for $39/month or $99 one-time lifetime access

## Tech Stack

- **Frontend:** React 19, Tailwind CSS 4, TypeScript
- **Backend:** Express 4, tRPC 11, Node.js
- **Database:** MySQL/TiDB with Drizzle ORM
- **Authentication:** JWT-based sessions with Manus OAuth
- **Payments:** Stripe (TEST MODE)
- **File Storage:** S3-compatible storage for PDFs and logos
- **Testing:** Vitest

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL or TiDB database
- Stripe test account (for payment processing)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/farnonmaxwell/service-proposal-builder.git
   cd service-proposal-builder
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the project root with:
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/proposal_builder
   JWT_SECRET=your-secret-key-here
   STRIPE_PUBLIC_KEY=pk_test_your_key
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_MONTHLY_PRICE_ID=price_your_monthly_id
   STRIPE_LIFETIME_PRICE_ID=price_your_lifetime_id
   ```

4. **Run database migrations:**
   ```bash
   pnpm drizzle-kit migrate
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`

6. **Run tests:**
   ```bash
   pnpm test
   ```

## Project Structure

```
service-proposal-builder/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (Landing, Dashboard, etc.)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client setup
│   │   ├── App.tsx        # Main router
│   │   └── index.css      # Global styles
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   ├── stripe.ts          # Stripe service helpers
│   └── _core/             # Framework infrastructure
├── drizzle/               # Database schema & migrations
│   └── schema.ts          # Drizzle ORM table definitions
├── storage/               # S3 file storage helpers
└── shared/                # Shared constants & types
```

## Key Pages

- **Landing Page** (`/`) - Hero, features, pricing, FAQ
- **Dashboard** (`/dashboard`) - Proposal list, stats, quick actions
- **Proposal Builder** (`/builder`) - 8-step workflow for creating proposals
- **Settings** (`/settings`) - Company profile, branding, defaults
- **Admin Dashboard** - User/subscription/revenue tracking (future)

## Database Schema

### Core Tables

- **users** - User accounts with roles (user/admin)
- **subscriptions** - Monthly/lifetime subscription tracking
- **proposals** - Proposal documents with client info and status
- **line_items** - Reusable pricing line items
- **company_settings** - Company branding and defaults
- **templates** - Trade-specific proposal templates
- **signatures** - E-signature data capture
- **templates** - Pre-built templates by trade

## Authentication

Authentication uses JWT-based sessions with Manus OAuth. Users sign up with email/password and receive a session cookie. Protected routes check the JWT token in the session.

## Stripe Integration

Stripe is configured in TEST MODE. Two subscription options:
- **Monthly:** $39/month (recurring)
- **Lifetime:** $99 one-time (permanent access)

Coupon code support is stubbed and ready for implementation.

## Email Handling

Email capture fields are currently stubbed to `console.log`. Update the email handlers in `server/routers.ts` to integrate with your email service.

## PDF Export

PDF export functionality is stubbed. Implement using a library like `pdfkit` or `html2pdf` to generate professional PDFs with company branding.

## E-Signature

E-signature uses HTML5 Canvas for drawing signatures. Signatures are stored locally in the database with signer name, date, and IP address. No integration with DocuSign or similar services.

## Deployment

This app is built for deployment on Manus. To deploy:

1. Save a checkpoint: `webdev_save_checkpoint`
2. Deploy: `webdev_deploy_project`
3. Push to GitHub: `git push origin main`

## Development Workflow

1. Update database schema in `drizzle/schema.ts`
2. Generate migrations: `pnpm drizzle-kit generate`
3. Apply migrations: `pnpm drizzle-kit migrate`
4. Add query helpers in `server/db.ts`
5. Create tRPC procedures in `server/routers.ts`
6. Build UI in `client/src/pages/`
7. Write tests in `server/*.test.ts`
8. Run tests: `pnpm test`

## Branding & Design

- **Colors:** Slate blue (#475569), white, warm gray, accent green (#22c55e)
- **Typography:** System fonts with Tailwind CSS
- **Design Approach:** Mobile-first responsive design, no stock photos
- **Tone:** Professional, trustworthy, "look professional without hiring a designer"

## Contributing

This is a private project for Max Farnon Digital. For issues or feature requests, contact the development team.

## License

MIT

## Support

For support or questions, contact Max Farnon Digital.

---

Built with React, Express, tRPC, and Tailwind CSS. Deployed on Manus.
