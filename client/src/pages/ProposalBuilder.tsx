import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { toast } from "sonner";
import PricingTable, { PricingData } from "@/components/PricingTable";

type Step = "template" | "client" | "scope" | "pricing" | "timeline" | "terms" | "branding" | "preview";

const STEPS: { key: Step; label: string }[] = [
  { key: "template", label: "Template" },
  { key: "client", label: "Client" },
  { key: "scope", label: "Scope" },
  { key: "pricing", label: "Pricing" },
  { key: "timeline", label: "Timeline" },
  { key: "terms", label: "Terms" },
  { key: "branding", label: "Branding" },
  { key: "preview", label: "Preview" },
];

const defaultPricing: PricingData = {
  mode: "standard",
  items: [],
  tiers: [],
  taxRate: 8.5,
  taxEnabled: false,
  discount: 0,
  discountType: "fixed",
};

export default function ProposalBuilder() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("template");
  const [formData, setFormData] = useState({
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    clientPhone: "",
    templateId: null as number | null,
    scopeOfWork: "",
    timeline: "",
    terms: "",
    pricing: defaultPricing,
  });

  const { data: templates } = trpc.templates.list.useQuery();
  const { data: settings } = trpc.companySettings.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: savedItems } = trpc.lineItems.list.useQuery(undefined, { enabled: isAuthenticated });
  const createProposal = trpc.proposals.create.useMutation();
  const updateProposal = trpc.proposals.update.useMutation();
  const createLineItem = trpc.lineItems.create.useMutation();
  const utils = trpc.useUtils();

  // Pre-fill from template when selected
  useEffect(() => {
    if (formData.templateId && templates) {
      const tpl = templates.find((t) => t.id === formData.templateId);
      if (tpl) {
        setFormData((prev) => ({
          ...prev,
          scopeOfWork: prev.scopeOfWork || tpl.scopeTemplate || "",
          terms: prev.terms || tpl.termsTemplate || "",
          timeline: prev.timeline || tpl.timelineTemplate || "",
        }));
      }
    }
  }, [formData.templateId, templates]);

  // Pre-fill terms from company defaults
  useEffect(() => {
    if (settings?.defaultTerms && !formData.terms) {
      setFormData((prev) => ({ ...prev, terms: settings.defaultTerms || "" }));
    }
  }, [settings]);

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const handleNext = () => {
    if (step === "client" && !formData.clientName.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1].key);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStep(STEPS[stepIndex - 1].key);
    }
  };

  const handleSubmit = async () => {
    if (!formData.clientName.trim()) {
      toast.error("Client name is required");
      return;
    }
    try {
      const subtotal = formData.pricing.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
      const taxAmount = formData.pricing.taxEnabled
        ? subtotal * (formData.pricing.taxRate / 100)
        : 0;
      const discountAmount =
        formData.pricing.discountType === "percent"
          ? subtotal * (formData.pricing.discount / 100)
          : formData.pricing.discount;
      const total = subtotal + taxAmount - discountAmount;

      const result = await createProposal.mutateAsync({
        clientName: formData.clientName,
        clientAddress: formData.clientAddress || undefined,
        clientEmail: formData.clientEmail || undefined,
        clientPhone: formData.clientPhone || undefined,
        templateId: formData.templateId || undefined,
        scopeOfWork: formData.scopeOfWork || undefined,
      });

      // Get the inserted ID from the result
      const insertId = (result as unknown as { insertId: number }).insertId;
      if (insertId) {
        await updateProposal.mutateAsync({
          id: insertId,
          timeline: formData.timeline || undefined,
          terms: formData.terms || undefined,
          pricingData: formData.pricing,
          subtotal: subtotal.toFixed(2),
          tax: taxAmount.toFixed(2),
          discount: discountAmount.toFixed(2),
          total: total.toFixed(2),
        });
      }

      utils.proposals.list.invalidate();
      toast.success("Proposal created!");
      navigate(insertId ? `/proposal/${insertId}` : "/dashboard");
    } catch (error) {
      toast.error("Failed to create proposal");
    }
  };

  const handleSaveLineItem = async (item: { description: string; unit: string; unitPrice: string }) => {
    try {
      await createLineItem.mutateAsync(item);
      utils.lineItems.list.invalidate();
      toast.success("Item saved to library");
    } catch {
      toast.error("Failed to save item");
    }
  };

  const companyName = settings?.companyName || user?.name || "Your Company";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-900">New Proposal</h1>
            <p className="text-sm text-slate-500">Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex].label}</p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1">
            {STEPS.map((s, idx) => (
              <div key={s.key} className="flex items-center">
                <button
                  onClick={() => idx < stepIndex && setStep(s.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    s.key === step
                      ? "bg-slate-700 text-white"
                      : idx < stepIndex
                      ? "bg-green-100 text-green-800 cursor-pointer hover:bg-green-200"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {idx < stepIndex ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={`w-4 h-0.5 mx-0.5 ${idx < stepIndex ? "bg-green-300" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="p-8 mb-6">

          {/* Step 1: Template */}
          {step === "template" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Choose a Template</h2>
              <p className="text-slate-500 mb-6 text-sm">Select a trade template to pre-fill scope, terms, and timeline - or start blank.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {templates?.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setFormData({ ...formData, templateId: template.id })}
                    className={`p-4 border-2 rounded-xl transition-all text-left ${
                      formData.templateId === template.id
                        ? "border-green-500 bg-green-50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="font-semibold text-slate-900 text-sm">{template.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{template.trade}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFormData({ ...formData, templateId: null })}
                className={`p-4 border-2 rounded-xl transition-all text-left w-full ${
                  formData.templateId === null
                    ? "border-green-500 bg-green-50"
                    : "border-dashed border-slate-300 hover:border-slate-400"
                }`}
              >
                <div className="font-semibold text-slate-700">Start Blank</div>
                <div className="text-xs text-slate-400">No template - build from scratch</div>
              </button>
            </div>
          )}

          {/* Step 2: Client */}
          {step === "client" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Client Information</h2>
              <p className="text-slate-500 mb-6 text-sm">Enter the client details for this proposal.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-900 mb-1">Client Name *</label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-900 mb-1">Address</label>
                  <Input
                    value={formData.clientAddress}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">Phone</label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Scope */}
          {step === "scope" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Scope of Work</h2>
              <p className="text-slate-500 mb-6 text-sm">
                {formData.templateId ? "Pre-filled from your template - edit as needed." : "Describe the work to be performed."}
              </p>
              <textarea
                value={formData.scopeOfWork}
                onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
                className="w-full h-72 p-4 border border-slate-300 rounded-lg text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-500"
                placeholder="Describe the scope of work in detail..."
              />
            </div>
          )}

          {/* Step 4: Pricing */}
          {step === "pricing" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Pricing</h2>
              <p className="text-slate-500 mb-6 text-sm">Build your pricing table with line items, tax, and discounts.</p>
              <PricingTable
                value={formData.pricing}
                onChange={(pricing) => setFormData({ ...formData, pricing })}
                savedItems={savedItems?.map((i) => ({
                  id: i.id,
                  description: i.description,
                  unit: i.unit,
                  unitPrice: i.unitPrice,
                }))}
                onSaveItem={handleSaveLineItem}
              />
            </div>
          )}

          {/* Step 5: Timeline */}
          {step === "timeline" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Timeline & Milestones</h2>
              <p className="text-slate-500 mb-6 text-sm">
                {formData.templateId ? "Pre-filled from your template - edit as needed." : "Set project timeline and payment milestones."}
              </p>
              <textarea
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                className="w-full h-64 p-4 border border-slate-300 rounded-lg text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-500"
                placeholder="Week 1: Site preparation and materials delivery&#10;Week 2: Primary work phase&#10;Week 3: Finishing and cleanup&#10;Final payment due upon completion"
              />
            </div>
          )}

          {/* Step 6: Terms */}
          {step === "terms" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Terms & Conditions</h2>
              <p className="text-slate-500 mb-6 text-sm">
                {formData.terms ? "Pre-filled from your template or company defaults - edit as needed." : "Enter your standard terms and conditions."}
              </p>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                className="w-full h-64 p-4 border border-slate-300 rounded-lg text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-500"
                placeholder="1. Payment Terms: 50% deposit required to begin work. Remaining balance due upon completion.&#10;2. Warranty: All work guaranteed for 1 year from completion date.&#10;3. Changes: Any changes to scope must be agreed in writing and may affect pricing."
              />
            </div>
          )}

          {/* Step 7: Branding */}
          {step === "branding" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Company Branding</h2>
              <p className="text-slate-500 mb-6 text-sm">Your proposal will use the branding from your company settings.</p>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: settings?.primaryColor || "#475569" }}
                  >
                    {companyName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{companyName}</div>
                    {settings?.address && <div className="text-sm text-slate-500">{settings.address}</div>}
                    {settings?.phone && <div className="text-sm text-slate-500">{settings.phone}</div>}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border border-slate-200"
                      style={{ backgroundColor: settings?.primaryColor || "#475569" }}
                    />
                    <span className="text-xs text-slate-600">Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border border-slate-200"
                      style={{ backgroundColor: settings?.accentColor || "#22c55e" }}
                    />
                    <span className="text-xs text-slate-600">Accent</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="mt-4" onClick={() => navigate("/settings")}>
                Update Company Settings
              </Button>
            </div>
          )}

          {/* Step 8: Preview */}
          {step === "preview" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Review & Create</h2>
              <p className="text-slate-500 mb-6 text-sm">Review your proposal before creating it.</p>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Client Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-slate-500">Name:</span> <span className="text-slate-900 font-medium">{formData.clientName || "-"}</span></div>
                    <div><span className="text-slate-500">Email:</span> <span className="text-slate-900">{formData.clientEmail || "-"}</span></div>
                    <div><span className="text-slate-500">Phone:</span> <span className="text-slate-900">{formData.clientPhone || "-"}</span></div>
                    <div><span className="text-slate-500">Address:</span> <span className="text-slate-900">{formData.clientAddress || "-"}</span></div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3">Pricing Summary</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Line items:</span>
                      <span className="text-slate-900">{formData.pricing.items.length}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-green-600">
                        ${(() => {
                          const sub = formData.pricing.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
                          const tax = formData.pricing.taxEnabled ? sub * (formData.pricing.taxRate / 100) : 0;
                          const disc = formData.pricing.discountType === "percent" ? sub * (formData.pricing.discount / 100) : formData.pricing.discount;
                          return (sub + tax - disc).toFixed(2);
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
                {formData.scopeOfWork && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-2">Scope of Work</h3>
                    <p className="text-sm text-slate-600 line-clamp-3">{formData.scopeOfWork}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={stepIndex === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          {stepIndex < STEPS.length - 1 ? (
            <Button className="bg-green-500 hover:bg-green-600 text-white" onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleSubmit}
              disabled={createProposal.isPending || updateProposal.isPending}
            >
              {createProposal.isPending ? "Creating..." : "Create Proposal"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
