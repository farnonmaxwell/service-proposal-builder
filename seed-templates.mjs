import { getDb } from "./server/db.ts";
import { templates } from "./drizzle/schema.ts";

const tradeTemplates = [
  {
    name: "Roof Repair",
    trade: "Roofing",
    category: "repair",
    scopeTemplate: "Inspect roof for damage, repair leaks, replace damaged shingles, and ensure proper drainage.",
    termsTemplate: "50% deposit required to schedule work. Remaining balance due upon completion. Warranty on all repairs: 5 years.",
    timelineTemplate: "Day 1: Inspection and assessment. Day 2-3: Repairs and cleanup.",
  },
  {
    name: "Full Roof Replacement",
    trade: "Roofing",
    category: "replacement",
    scopeTemplate: "Remove existing roof, inspect deck, install new underlayment, install new shingles, and complete cleanup.",
    termsTemplate: "30% deposit to schedule. 40% upon removal of old roof. 30% upon completion. 10-year warranty on materials and labor.",
    timelineTemplate: "Day 1: Removal. Day 2-3: Installation. Day 4: Cleanup and inspection.",
  },
  {
    name: "Plumbing Service Call",
    trade: "Plumbing",
    category: "service",
    scopeTemplate: "Diagnose plumbing issue, provide repair estimate, and complete repairs as approved.",
    termsTemplate: "Service call fee: $75. Additional labor billed at $85/hour. Materials marked up 20%.",
    timelineTemplate: "Same-day or next-day service available. Typical service call: 1-2 hours.",
  },
  {
    name: "Bathroom Remodel",
    trade: "Plumbing",
    category: "remodel",
    scopeTemplate: "Rough-in plumbing for new fixtures, install new vanity, toilet, and shower/tub with updated piping.",
    termsTemplate: "50% deposit. 25% at rough-in inspection. 25% upon completion. 1-year warranty on all work.",
    timelineTemplate: "Week 1: Demolition and rough-in. Week 2: Fixture installation and finishing.",
  },
  {
    name: "Landscape Maintenance",
    trade: "Landscaping",
    category: "maintenance",
    scopeTemplate: "Weekly lawn mowing, edging, trimming, and debris removal. Seasonal mulch and fertilizer applications.",
    termsTemplate: "Monthly service: $150-300 depending on property size. Billed monthly in advance.",
    timelineTemplate: "Ongoing weekly service. Seasonal upgrades available.",
  },
  {
    name: "Landscape Design & Build",
    trade: "Landscaping",
    category: "design",
    scopeTemplate: "Design custom landscape layout, install new plantings, hardscaping, irrigation system, and outdoor lighting.",
    termsTemplate: "50% design deposit. 50% upon completion. Payment plan available for projects over $5,000.",
    timelineTemplate: "Design phase: 2 weeks. Installation: 2-4 weeks depending on scope.",
  },
  {
    name: "Interior Painting",
    trade: "Painting",
    category: "interior",
    scopeTemplate: "Prepare surfaces, prime as needed, apply 2 coats of quality paint to all interior walls and trim.",
    termsTemplate: "50% deposit. 50% upon completion. 2-year warranty against peeling or fading.",
    timelineTemplate: "Typical home: 3-5 days depending on size and prep work needed.",
  },
  {
    name: "Exterior Painting",
    trade: "Painting",
    category: "exterior",
    scopeTemplate: "Pressure wash exterior, repair damaged wood, prime, and apply 2 coats of exterior paint to all surfaces.",
    termsTemplate: "50% deposit. 50% upon completion. 3-year warranty on all exterior work.",
    timelineTemplate: "Typical home: 5-7 days depending on weather and surface condition.",
  },
];

async function seedTemplates() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database not available");
      process.exit(1);
    }

    for (const template of tradeTemplates) {
      await db.insert(templates).values(template);
      console.log(`✓ Created template: ${template.name}`);
    }

    console.log(`\n✓ Seeded ${tradeTemplates.length} templates`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding templates:", error);
    process.exit(1);
  }
}

seedTemplates();
