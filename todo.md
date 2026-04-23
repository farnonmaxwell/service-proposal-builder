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
- [ ] Step 4: Pricing table (line items, qty, unit price, totals) - MVP stub
- [x] Step 5: Timeline/milestones
- [x] Step 6: Terms & conditions (pre-filled, editable)
- [x] Step 7: Company branding (logo upload, colors, contact)
- [x] Step 8: Preview & send

## Pricing Table
- [ ] Line item editor (description, qty, unit, unit price, total) - MVP stub
- [ ] Subtotal calculation - MVP stub
- [ ] Tax toggle - MVP stub
- [ ] Discount line - MVP stub
- [ ] Grand total - MVP stub
- [ ] Good/Better/Best tiered pricing (optional 3-column) - future
- [ ] Save custom line items to library - MVP stub

## E-Signature (Stub)
- [ ] Canvas-based signature drawing - MVP stub
- [ ] Capture name, date, IP address - MVP stub
- [ ] Store locally (no DocuSign integration) - MVP stub

## PDF Export
- [ ] Professional PDF with company branding - MVP stub
- [ ] Auto-generated filename: [Company]-[Client]-[Date].pdf - MVP stub
- [ ] Email proposal to client (stub - mailto link) - MVP stub

## Company Settings
- [ ] Logo upload - MVP stub
- [x] Company name, address, phone, email, license number
- [x] Default terms and conditions
- [x] Default payment terms
- [ ] Saved line items library - MVP stub

## Template Library (8+ Trades)
- [ ] Roofing (repair + full replacement) - needs seed data
- [ ] Plumbing (service call + remodel) - needs seed data
- [ ] Landscaping (maintenance contract + design/build) - needs seed data
- [ ] Painting (interior + exterior) - needs seed data
- [ ] HVAC (installation + service agreement) - needs seed data
- [ ] Electrical (panel upgrade + new construction) - needs seed data
- [ ] General Contractor (remodel + new build) - needs seed data
- [ ] Pressure Washing / Cleaning - needs seed data

## Admin Dashboard
- [ ] Total users count - future
- [ ] Subscriptions count & revenue - future
- [ ] Proposals created count - future
- [ ] Revenue tracking - future

## Branding & Design
- [x] Colors: slate blue (#475569), white, warm gray, accent green (#22c55e)
- [x] Mobile-first responsive design
- [x] No stock photos (CSS gradients, icons, geometric patterns)
- [x] No em dashes (use regular dashes/commas)
- [x] No Manus branding on product
- [x] Professional, trustworthy tone

## Deployment & GitHub
- [x] Create README.md with tech stack, env vars, local run instructions
- [ ] Save checkpoint
- [ ] Deploy live to Manus
- [ ] Push source code to GitHub (farnonmaxwell/service-proposal-builder)
