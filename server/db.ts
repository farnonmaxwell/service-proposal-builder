import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subscriptions, proposals, lineItems, companySettings, templates, signatures, Proposal, Subscription, CompanySettings, LineItem, Template, Signature } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getSubscription(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubscription(data: typeof subscriptions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subscriptions).values(data);
  return result;
}

export async function updateSubscription(id: number, data: Partial<typeof subscriptions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

export async function getCompanySettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companySettings).where(eq(companySettings.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertCompanySettings(userId: number, data: Partial<typeof companySettings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getCompanySettings(userId);
  if (existing) {
    return db.update(companySettings).set(data).where(eq(companySettings.userId, userId));
  } else {
    return db.insert(companySettings).values({ userId, ...data });
  }
}

export async function getProposals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proposals).where(eq(proposals.userId, userId)).orderBy(desc(proposals.createdAt));
}

export async function getProposal(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProposal(data: typeof proposals.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(proposals).values(data);
  return result;
}

export async function updateProposal(id: number, data: Partial<typeof proposals.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(proposals).set(data).where(eq(proposals.id, id));
}

export async function getLineItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lineItems).where(eq(lineItems.userId, userId)).orderBy(desc(lineItems.createdAt));
}

export async function createLineItem(data: typeof lineItems.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(lineItems).values(data);
  return result;
}

export async function deleteLineItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(lineItems).where(eq(lineItems.id, id));
}

export async function getTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(templates).orderBy(templates.trade);
}

export async function getTemplate(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSignature(data: typeof signatures.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(signatures).values(data);
  return result;
}

export async function getSignature(proposalId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(signatures).where(eq(signatures.proposalId, proposalId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Admin helpers
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, activeSubscriptions: 0, monthlySubscriptions: 0, lifetimeSubscriptions: 0, totalProposals: 0, totalRevenue: 0, proposalsByStatus: { draft: 0, sent: 0, viewed: 0, signed: 0, declined: 0 } };

  const [allUsers, allSubs, allProposals] = await Promise.all([
    db.select().from(users),
    db.select().from(subscriptions),
    db.select().from(proposals),
  ]);

  const activeSubs = allSubs.filter((s) => s.status === "active");
  const monthlySubs = activeSubs.filter((s) => s.plan === "monthly");
  const lifetimeSubs = activeSubs.filter((s) => s.plan === "lifetime");
  const totalRevenue = monthlySubs.length * 39 + lifetimeSubs.length * 99;

  const byStatus = { draft: 0, sent: 0, viewed: 0, signed: 0, declined: 0 };
  for (const p of allProposals) {
    if (p.status in byStatus) byStatus[p.status as keyof typeof byStatus]++;
  }

  return {
    totalUsers: allUsers.length,
    activeSubscriptions: activeSubs.length,
    monthlySubscriptions: monthlySubs.length,
    lifetimeSubscriptions: lifetimeSubs.length,
    totalProposals: allProposals.length,
    totalRevenue,
    proposalsByStatus: byStatus,
  };
}

export async function getRecentUsers(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit);
}

export async function getRecentSubscriptions(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt)).limit(limit);
}

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, sent: 0, sentThisMonth: 0, signed: 0, avgDealSize: 0, closeRate: 0 };

  const all = await db.select().from(proposals).where(eq(proposals.userId, userId));
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sent = all.filter((p) => p.status !== "draft");
  const sentThisMonth = all.filter((p) => p.sentAt && new Date(p.sentAt) >= startOfMonth);
  const signed = all.filter((p) => p.status === "signed");
  const totalValue = signed.reduce((s, p) => s + parseFloat(p.total || "0"), 0);
  const avgDealSize = signed.length > 0 ? totalValue / signed.length : 0;
  const closeRate = sent.length > 0 ? (signed.length / sent.length) * 100 : 0;

  return {
    total: all.length,
    sent: sent.length,
    sentThisMonth: sentThisMonth.length,
    signed: signed.length,
    avgDealSize,
    closeRate: Math.round(closeRate),
  };
}

export async function seedTemplates() {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(templates).limit(1);
  if (existing.length > 0) return; // Already seeded

  const tradeTemplates = [
    {
      name: "Roof Repair",
      trade: "Roofing",
      category: "repair",
      isDefault: 1,
      scopeTemplate: `Scope of Work - Roof Repair

1. Inspect full roof surface for damage, missing shingles, and compromised flashing
2. Remove and replace damaged or missing shingles (up to 10 squares)
3. Re-seal all flashing around chimneys, vents, and skylights
4. Apply roofing cement to any visible cracks or gaps
5. Clean gutters and downspouts of debris
6. Final inspection and photo documentation
7. Remove all debris and leave property clean`,
      termsTemplate: `Payment Terms:
- 50% deposit required to schedule work
- Remaining 50% due upon completion

Warranty:
- All repair work warranted for 5 years against defects in workmanship
- Manufacturer warranty applies to all materials used

Exclusions:
- Structural deck damage discovered during repair will be quoted separately
- Interior water damage remediation is not included

Cancellation:
- 48-hour notice required to reschedule without penalty`,
      timelineTemplate: `Project Timeline:

Day 1: Site assessment and material delivery
Day 2: Repair work and flashing
Day 3 (if needed): Final repairs, cleanup, and inspection

Note: Timeline subject to weather conditions. We will reschedule if unsafe conditions exist.`,
    },
    {
      name: "Full Roof Replacement",
      trade: "Roofing",
      category: "replacement",
      isDefault: 1,
      scopeTemplate: `Scope of Work - Full Roof Replacement

1. Remove all existing roofing materials down to deck
2. Inspect and repair roof deck as needed (additional charges may apply)
3. Install ice and water shield in valleys and eaves
4. Install synthetic underlayment over entire roof
5. Install new architectural shingles per manufacturer specifications
6. Install new ridge cap and hip shingles
7. Replace all pipe boots, vents, and flashing
8. Install new drip edge along all eaves and rakes
9. Clean gutters and inspect for damage
10. Remove all debris and haul away
11. Final inspection with photo documentation`,
      termsTemplate: `Payment Terms:
- 30% deposit to schedule and order materials
- 40% upon completion of tear-off
- 30% upon final completion and inspection

Warranty:
- 10-year workmanship warranty
- Manufacturer warranty on all shingles (typically 25-50 years)
- All flashing and accessories warranted for 5 years

Permits:
- All required permits included in price
- Homeowner responsible for HOA approval if applicable`,
      timelineTemplate: `Project Timeline:

Day 1: Material delivery and staging
Day 2: Complete tear-off of existing roof
Day 3: Deck inspection, repairs, and underlayment installation
Day 4: Shingle installation
Day 5: Flashing, ridge cap, cleanup, and final inspection

Total estimated duration: 4-5 days (weather permitting)`,
    },
    {
      name: "Plumbing Service Call",
      trade: "Plumbing",
      category: "service",
      isDefault: 1,
      scopeTemplate: `Scope of Work - Plumbing Service Call

1. Diagnose reported plumbing issue
2. Provide written estimate for all recommended repairs
3. Complete approved repairs with quality materials
4. Test all affected fixtures and connections
5. Verify no leaks or issues remain
6. Clean work area and remove debris`,
      termsTemplate: `Service Call Terms:
- Service call fee: $75 (applied to repair cost if work is approved)
- Labor: $95/hour after first hour
- Materials: Cost + 20%
- Payment due upon completion

Warranty:
- 1-year warranty on all labor
- Manufacturer warranty on parts

Emergency Service:
- After-hours emergency calls: Additional $50 surcharge`,
      timelineTemplate: `Service Timeline:

Same-day or next-day service available for standard calls.
Emergency service available 24/7 (additional charges apply).

Typical service call duration: 1-3 hours depending on complexity.`,
    },
    {
      name: "Bathroom Remodel",
      trade: "Plumbing",
      category: "remodel",
      isDefault: 1,
      scopeTemplate: `Scope of Work - Bathroom Plumbing Remodel

1. Demolition of existing fixtures and removal
2. Rough-in plumbing for new layout (if applicable)
3. Install new supply lines and shut-off valves
4. Install new toilet with wax ring and supply line
5. Install new vanity with faucet and drain assembly
6. Install new shower/tub valve and trim
7. Connect all drain lines and test for leaks
8. Install new exhaust fan wiring (if included)
9. Final inspection and cleanup`,
      termsTemplate: `Payment Schedule:
- 50% deposit to begin work
- 25% at rough-in inspection
- 25% upon final completion

Warranty:
- 2-year warranty on all plumbing work
- Manufacturer warranty on all fixtures

Change Orders:
- Any changes to original scope require written approval
- Changes may affect timeline and pricing`,
      timelineTemplate: `Project Timeline:

Week 1:
- Day 1-2: Demolition and rough-in plumbing
- Day 3: Inspection (if required)

Week 2:
- Day 1-2: Fixture installation
- Day 3: Final connections and testing
- Day 4: Cleanup and walkthrough`,
    },
    {
      name: "Landscape Maintenance",
      trade: "Landscaping",
      category: "maintenance",
      isDefault: 1,
      scopeTemplate: `Scope of Work - Landscape Maintenance

Weekly Services:
1. Lawn mowing (front and back yard)
2. String trimming around all edges, beds, and obstacles
3. Edging along all hardscape surfaces
4. Blowing of clippings from all hard surfaces
5. Debris removal from lawn and beds

Monthly Services:
6. Shrub and hedge trimming
7. Weed control in all planting beds
8. Inspection and reporting of any issues

Seasonal Services (included):
9. Spring fertilizer application
10. Fall aeration and overseeding (if applicable)`,
      termsTemplate: `Service Agreement Terms:
- Monthly billing in advance
- 30-day notice required to cancel service
- Services performed weather permitting
- Rain delays will be made up within 3 business days

Pricing:
- Monthly rate based on property size assessment
- Additional services quoted separately

Damage Policy:
- We carry full liability insurance
- Any damage caused by our crew will be repaired at our expense`,
      timelineTemplate: `Service Schedule:

Weekly visits: Same day each week (day to be confirmed at signup)
Monthly extras: Performed during regular visit in the last week of each month
Seasonal services: Spring (March-April) and Fall (October-November)

First visit: Within 5 business days of contract signing`,
    },
    {
      name: "Landscape Design & Build",
      trade: "Landscaping",
      category: "design",
      isDefault: 1,
      scopeTemplate: `Scope of Work - Landscape Design & Installation

Design Phase:
1. Site assessment and measurements
2. Custom landscape design plan (2 revisions included)
3. Plant selection and material specifications
4. Client approval of final design

Installation Phase:
5. Site preparation and grading
6. Installation of all plantings per approved design
7. Mulch installation in all planting beds (3" depth)
8. Irrigation system installation and programming
9. Landscape lighting installation
10. Hardscape elements (walkways, edging, borders)
11. Final cleanup and client walkthrough`,
      termsTemplate: `Payment Schedule:
- 50% deposit upon design approval
- 25% at start of installation
- 25% upon completion

Design Revisions:
- 2 design revisions included
- Additional revisions: $150 each

Plant Warranty:
- 1-year warranty on all installed plants
- Warranty void if irrigation system is not maintained

Irrigation:
- Annual startup and winterization not included (quoted separately)`,
      timelineTemplate: `Project Timeline:

Design Phase (2-3 weeks):
- Week 1: Site visit and initial design
- Week 2: Revisions and client approval

Installation Phase (2-4 weeks depending on scope):
- Week 1: Site prep, grading, irrigation rough-in
- Week 2: Planting and mulch
- Week 3: Hardscape and lighting
- Week 4: Final details, cleanup, and walkthrough`,
    },
    {
      name: "Interior Painting",
      trade: "Painting",
      category: "interior",
      isDefault: 1,
      scopeTemplate: `Scope of Work - Interior Painting

Preparation:
1. Move and protect furniture (client to clear small items)
2. Fill all nail holes and minor wall imperfections
3. Sand and prime repaired areas
4. Tape and protect all trim, windows, and floors
5. Prime new drywall or heavily stained areas as needed

Painting:
6. Apply 2 coats of premium interior paint to all walls
7. Apply 2 coats of semi-gloss to all trim and doors
8. Apply 2 coats to ceilings (if included)
9. Cut in all edges by hand for clean lines

Cleanup:
10. Remove all tape and protective coverings
11. Touch up any imperfections
12. Return furniture to original position
13. Final walkthrough with client`,
      termsTemplate: `Payment Terms:
- 50% deposit to schedule
- 50% upon completion and client approval

Paint Selection:
- Client to select colors prior to start date
- We recommend Sherwin-Williams or Benjamin Moore
- Paint cost included in quote (up to 2 colors per room)

Warranty:
- 2-year warranty against peeling, cracking, or fading
- Touch-up paint left with client at completion

Prep Work:
- Extensive drywall repairs quoted separately
- Wallpaper removal quoted separately`,
      timelineTemplate: `Project Timeline:

Typical single room: 1 day
Typical 3-bedroom home: 3-5 days

Day 1: Prep work, patching, priming
Day 2-3: First and second coats on walls
Day 4: Trim and doors
Day 5: Touch-ups, cleanup, and walkthrough`,
    },
    {
      name: "Exterior Painting",
      trade: "Painting",
      category: "exterior",
      isDefault: 1,
      scopeTemplate: `Scope of Work - Exterior Painting

Preparation:
1. Pressure wash all exterior surfaces (1500-2000 PSI)
2. Allow 24-48 hours drying time
3. Scrape all loose and peeling paint
4. Sand rough edges smooth
5. Caulk all gaps, cracks, and seams
6. Prime all bare wood and repaired areas
7. Protect all landscaping, windows, and non-painted surfaces

Painting:
8. Apply 2 coats of premium exterior paint to all siding
9. Apply 2 coats of trim paint to all fascia, soffits, and trim
10. Paint all doors and shutters (if included)
11. Paint foundation if included in scope

Cleanup:
12. Remove all protective coverings
13. Final inspection and touch-ups
14. Client walkthrough`,
      termsTemplate: `Payment Terms:
- 50% deposit to schedule
- 50% upon completion

Warranty:
- 3-year warranty on all exterior work
- Warranty requires annual cleaning of painted surfaces

Weather Policy:
- We do not paint in rain or temperatures below 50F
- Timeline may be extended due to weather
- No penalty for weather delays

Wood Rot:
- Rotted wood discovered during prep will be quoted separately
- We recommend addressing all rot before painting`,
      timelineTemplate: `Project Timeline:

Day 1: Pressure washing
Day 2 (after drying): Prep work - scraping, sanding, caulking, priming
Day 3-4: First coat on all surfaces
Day 5: Second coat and trim
Day 6: Touch-ups, cleanup, and final walkthrough

Total: 5-7 days (weather permitting)`,
    },
    {
      name: "HVAC Installation",
      trade: "HVAC",
      category: "installation",
      isDefault: 1,
      scopeTemplate: `Scope of Work - HVAC System Installation

1. Remove and dispose of existing HVAC equipment
2. Install new high-efficiency air handler/furnace
3. Install new condensing unit (exterior)
4. Install new refrigerant line set (if needed)
5. Install new thermostat and wiring
6. Connect to existing ductwork (inspect and seal as needed)
7. Charge system with refrigerant
8. Test all functions: heating, cooling, and fan modes
9. Register equipment warranty with manufacturer
10. Provide homeowner orientation on system operation`,
      termsTemplate: `Payment Terms:
- 50% deposit upon contract signing
- 50% upon system startup and client acceptance

Permits:
- All required permits included
- Final inspection to be scheduled with local authority

Warranty:
- 1-year labor warranty
- Manufacturer equipment warranty (typically 10 years parts, 5 years compressor)
- Extended warranty options available

Maintenance:
- Annual maintenance agreement available at $149/year
- Filter changes are homeowner responsibility`,
      timelineTemplate: `Installation Timeline:

Day 1:
- Remove old equipment
- Install new air handler/furnace
- Install new line set and electrical connections

Day 2:
- Install condensing unit
- Charge system and test
- Thermostat programming and client orientation

Total: 1-2 days for standard replacement`,
    },
    {
      name: "HVAC Service Agreement",
      trade: "HVAC",
      category: "service",
      isDefault: 1,
      scopeTemplate: `Scope of Work - HVAC Annual Service Agreement

Spring Tune-Up (Cooling):
1. Replace air filter
2. Clean evaporator and condenser coils
3. Check refrigerant levels
4. Inspect electrical connections and components
5. Lubricate all moving parts
6. Test thermostat calibration
7. Check condensate drain and pan

Fall Tune-Up (Heating):
8. Replace air filter
9. Inspect heat exchanger for cracks
10. Clean burners and ignition system
11. Check gas pressure and connections
12. Test safety controls and limits
13. Inspect flue and venting
14. Test all heating modes`,
      termsTemplate: `Service Agreement Terms:
- Annual fee covers 2 tune-ups (spring and fall)
- Priority scheduling for service calls
- 15% discount on all repairs
- No overtime charges for service calls

Payment:
- Annual payment in advance
- Monthly payment option available (+$10/month)

Cancellation:
- 30-day written notice to cancel
- Pro-rated refund for unused services`,
      timelineTemplate: `Service Schedule:

Spring tune-up: March - May (scheduled at your convenience)
Fall tune-up: September - November (scheduled at your convenience)

Each visit: Approximately 1-2 hours
Scheduling: We will contact you 2 weeks before each service is due`,
    },
    {
      name: "Electrical Panel Upgrade",
      trade: "Electrical",
      category: "panel",
      isDefault: 1,
      scopeTemplate: `Scope of Work - Electrical Panel Upgrade

1. Obtain all required permits
2. Coordinate with utility company for temporary power shutoff
3. Remove existing electrical panel
4. Install new 200-amp main breaker panel
5. Transfer all existing circuits to new panel
6. Label all circuits clearly
7. Install new grounding system if needed
8. Install whole-home surge protection
9. Final inspection with local authority
10. Restore power and test all circuits`,
      termsTemplate: `Payment Terms:
- 50% deposit to schedule and order materials
- 50% upon completion and passing final inspection

Permits:
- All permits included in price
- Final inspection required by local authority
- We coordinate all inspections

Warranty:
- 2-year labor warranty
- Manufacturer warranty on panel (typically 10 years)

Utility Coordination:
- We contact utility company for shutoff
- Typical shutoff window: 4-6 hours`,
      timelineTemplate: `Project Timeline:

Day 1 (preparation):
- Permit application (1-2 weeks for approval)
- Material ordering

Installation Day:
- Morning: Utility shutoff coordination
- 8am-2pm: Panel removal and installation
- 2pm-4pm: Circuit transfer and labeling
- 4pm-5pm: Inspection and power restoration

Total project: 1 day installation (after permit approval)`,
    },
    {
      name: "General Contractor Remodel",
      trade: "General Contractor",
      category: "remodel",
      isDefault: 1,
      scopeTemplate: `Scope of Work - Home Remodel

Project Management:
1. Coordinate all subcontractors and trades
2. Obtain all required permits
3. Schedule and manage all inspections
4. Provide weekly progress updates to client

Demolition:
5. Selective demolition per approved plans
6. Debris removal and disposal

Construction:
7. Framing modifications per approved plans
8. Rough-in coordination (electrical, plumbing, HVAC)
9. Insulation installation
10. Drywall installation and finishing
11. Interior trim and millwork
12. Flooring installation
13. Cabinet and countertop installation
14. Fixture and appliance installation
15. Painting (interior)
16. Final punch list and cleanup`,
      termsTemplate: `Payment Schedule:
- 10% deposit upon contract signing
- 25% at demolition completion
- 25% at rough-in inspection
- 25% at drywall completion
- 15% upon final completion

Change Orders:
- All changes must be in writing
- Changes may affect timeline and cost
- Client to approve all change orders before work proceeds

Permits and Inspections:
- All permits included
- Client responsible for HOA approvals

Warranty:
- 1-year workmanship warranty on all work
- Subcontractor warranties passed through to client`,
      timelineTemplate: `Project Timeline:

Phase 1 - Planning (2-4 weeks):
- Permit applications and approvals
- Material selections and ordering

Phase 2 - Demolition (1 week)

Phase 3 - Rough-In (2-3 weeks):
- Framing, electrical, plumbing, HVAC

Phase 4 - Inspections (1 week)

Phase 5 - Close-In (2-3 weeks):
- Insulation, drywall, tape and finish

Phase 6 - Finishes (3-4 weeks):
- Flooring, cabinets, trim, paint

Phase 7 - Final (1 week):
- Fixtures, appliances, punch list

Total estimated duration: 12-16 weeks`,
    },
    {
      name: "Pressure Washing",
      trade: "Pressure Washing",
      category: "cleaning",
      isDefault: 1,
      scopeTemplate: `Scope of Work - Pressure Washing Service

Exterior Surfaces:
1. House siding (all sides)
2. Driveway and walkways
3. Patio and deck surfaces
4. Fence (if applicable)
5. Gutters (exterior face)

Process:
- Pre-treat all surfaces with appropriate cleaning solution
- Pressure wash at appropriate PSI for each surface type
- Rinse thoroughly to remove all cleaning agents
- Inspect for any areas requiring additional attention
- Final walkthrough with client

Note: Soft wash technique used on siding and painted surfaces to prevent damage`,
      termsTemplate: `Payment Terms:
- Payment due upon completion
- Check, cash, or credit card accepted

Satisfaction Guarantee:
- If not satisfied, we will return within 48 hours to address any concerns

Weather Policy:
- Services rescheduled in case of rain
- No charge for weather rescheduling

Exclusions:
- Window cleaning not included
- Roof washing quoted separately
- Deck staining/sealing quoted separately`,
      timelineTemplate: `Service Timeline:

Typical home exterior: 3-5 hours
Driveway only: 1-2 hours
Full property: 5-8 hours

Scheduling: Available Monday-Saturday, 8am-5pm
Same-week scheduling usually available`,
    },
  ];

  for (const t of tradeTemplates) {
    await db.insert(templates).values(t);
  }
  console.log(`[DB] Seeded ${tradeTemplates.length} templates`);
}

export async function deleteProposal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(proposals).where(eq(proposals.id, id));
}
