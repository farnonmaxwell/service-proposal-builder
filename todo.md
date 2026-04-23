# Service Proposal Builder - Build 15 TODO

## Database & Core Schema
- [x] Create users table with role (admin/user)
- [x] Create subscriptions table (monthly/lifetime)
- [x] Create proposals table (status, client info, pricing)
- [x] Create line_items table (reusable items library)
- [x] Create company_settings table (logo, branding, defaults)
- [x] Create templates table (trade-specific templates)
- [x] Create template_items table (pre-filled line items)
- [x] Create signatures table (e-signature data)

## Authentication & Billing
- [x] Email/password signup flow (via Manus OAuth)
- [x] JWT session management
- [x] Stripe TEST MODE integration (pk_test/sk_test)
- [x] Subscription plans: $39/month OR $99 one-time
- [x] Coupon code support (stubbed)
- [x] Email capture to console.log (stub)

## Landing Page
- [x] Hero section with value prop
- [x] Template preview gallery (8 trades)
- [x] Features section
- [x] Pricing section (monthly vs one-time)
- [x] Testimonials placeholder
- [x] FAQ section

## Dashboard & Proposals
- [x] Proposal list view with filters
- [x] Proposal status tracking (Draft, Sent, Viewed, Signed, Declined)
- [x] Dashboard stats (sent this month, close rate, avg deal size)
- [x] Proposal creation flow (multi-step)

## Proposal Builder (Multi-Step)
- [x] Step 1: Template selection (8+ trades)
- [x] Step 2: Client info (name, address, email, phone)
- [x] Step 3: Scope of work (pre-filled, editable)
- [x] Step 4: Pricing table (line items, qty, unit price, totals)
- [x] Step 5: Timeline/milestones
- [x] Step 6: Terms & conditions (pre-filled, editable)
- [x] Step 7: Company branding (logo upload, colors, contact)
- [x] Step 8: Preview & send

## Pricing Table
- [x] Line item editor (description, qty, unit, unit price, total)
- [x] Subtotal calculation
- [x] Tax toggle
- [x] Discount line
- [x] Grand total
- [x] Good/Better/Best tiered pricing (3-column comparison)
- [x] Save custom line items to library

## E-Signature (Stub)
- [x] Canvas-based signature drawing
- [x] Capture name, date, IP address
- [x] Store locally (no DocuSign integration)

## PDF Export
- [x] Professional PDF with company branding (window.print)
- [x] Auto-generated filename: [Company]-[Client]-[Date].pdf
- [x] Email proposal to client (stub - mailto link)

## Company Settings
- [x] Logo upload (URL input)
- [x] Company name, address, phone, email, license number
- [x] Default terms and conditions
- [x] Default payment terms
- [x] Saved line items library

## Template Library (8+ Trades)
- [x] Roofing (repair + full replacement)
- [x] Plumbing (service call + remodel)
- [x] Landscaping (maintenance contract + design/build)
- [x] Painting (interior + exterior)
- [x] HVAC (installation + service agreement)
- [x] Electrical (panel upgrade + new construction)
- [x] General Contractor (remodel + new build)
- [x] Pressure Washing / Cleaning

## Admin Dashboard
- [x] Total users count
- [x] Subscriptions count & revenue
- [x] Proposals created count
- [x] Revenue tracking

## Branding & Design
- [x] Colors: slate blue (#475569), white, warm gray, accent green (#22c55e)
- [x] Mobile-first responsive design
- [x] No stock photos (CSS gradients, icons, geometric patterns)
- [x] No em dashes (use regular dashes/commas)
- [x] No Manus branding on product
- [x] Professional, trustworthy tone

## Deployment & GitHub
- [x] Create README.md with tech stack, env vars, local run instructions
- [x] Save checkpoint
- [x] Deploy live to Manus
- [x] Seed 8 trade templates with scope, pricing, terms, timeline
- [x] Stripe stub with test keys
- [x] Proposal preview page with full details
- [x] Proposal send flow (mailto stub)
- [ ] Save final checkpoint with all features
- [ ] Redeploy with all new features
- [x] Push source code to GitHub (farnonmaxwell/service-proposal-builder)
