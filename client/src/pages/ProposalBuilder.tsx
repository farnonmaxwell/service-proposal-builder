import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

type Step = "template" | "client" | "scope" | "pricing" | "timeline" | "terms" | "branding" | "preview";

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
    pricingData: [] as Array<{ description: string; qty: number; unitPrice: number }>,
  });

  const { data: templates } = trpc.templates.list.useQuery();
  const createProposal = trpc.proposals.create.useMutation();

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const steps: Step[] = ["template", "client", "scope", "pricing", "timeline", "terms", "branding", "preview"];
  const stepIndex = steps.indexOf(step);

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStep(steps[stepIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStep(steps[stepIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    try {
      await createProposal.mutateAsync({
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        templateId: formData.templateId || undefined,
        scopeOfWork: formData.scopeOfWork,
      });
      toast.success("Proposal created!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to create proposal");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-slate-900">Create Proposal</h1>
          <p className="text-slate-600 mt-1">Step {stepIndex + 1} of {steps.length}</p>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2">
            {steps.map((s, idx) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  idx <= stepIndex ? "bg-green-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 mb-8">
          {step === "template" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Select a Template
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {templates?.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setFormData({ ...formData, templateId: template.id })}
                    className={`p-4 border-2 rounded-lg transition-colors text-left ${
                      formData.templateId === template.id
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-semibold text-slate-900">{template.name}</div>
                    <div className="text-sm text-slate-600">{template.trade}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFormData({ ...formData, templateId: null })}
                className={`mt-4 p-4 border-2 rounded-lg transition-colors text-left w-full ${
                  formData.templateId === null
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="font-semibold text-slate-900">Start Blank</div>
                <div className="text-sm text-slate-600">No template</div>
              </button>
            </div>
          )}

          {step === "client" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Client Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Client Name *
                  </label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Address
                  </label>
                  <Input
                    value={formData.clientAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, clientAddress: e.target.value })
                    }
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, clientEmail: e.target.value })
                    }
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Phone
                  </label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, clientPhone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          )}

          {step === "scope" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Scope of Work
              </h2>
              <textarea
                value={formData.scopeOfWork}
                onChange={(e) =>
                  setFormData({ ...formData, scopeOfWork: e.target.value })
                }
                className="w-full h-64 p-4 border border-slate-300 rounded-lg font-mono text-sm"
                placeholder="Describe the work to be performed..."
              />
            </div>
          )}

          {step === "pricing" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Pricing
              </h2>
              <p className="text-slate-600 mb-4">
                Line item pricing coming soon. For now, enter details in the scope section.
              </p>
            </div>
          )}

          {step === "timeline" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Timeline & Milestones
              </h2>
              <textarea
                value={formData.timeline}
                onChange={(e) =>
                  setFormData({ ...formData, timeline: e.target.value })
                }
                className="w-full h-64 p-4 border border-slate-300 rounded-lg font-mono text-sm"
                placeholder="Week 1: Planning and preparation..."
              />
            </div>
          )}

          {step === "terms" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Terms & Conditions
              </h2>
              <textarea
                value={formData.terms}
                onChange={(e) =>
                  setFormData({ ...formData, terms: e.target.value })
                }
                className="w-full h-64 p-4 border border-slate-300 rounded-lg font-mono text-sm"
                placeholder="Payment terms, warranty, cancellation policy..."
              />
            </div>
          )}

          {step === "branding" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Company Branding
              </h2>
              <p className="text-slate-600 mb-4">
                Customize your company logo, colors, and contact info in Settings.
              </p>
              <Button variant="outline" onClick={() => navigate("/settings")}>
                Go to Settings
              </Button>
            </div>
          )}

          {step === "preview" && (
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Preview & Confirm
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium text-slate-900">Client:</span>
                  <span className="text-slate-600 ml-2">{formData.clientName}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-900">Email:</span>
                  <span className="text-slate-600 ml-2">{formData.clientEmail}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-900">Phone:</span>
                  <span className="text-slate-600 ml-2">{formData.clientPhone}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={stepIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          {stepIndex < steps.length - 1 ? (
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleNext}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleSubmit}
              disabled={createProposal.isPending}
            >
              {createProposal.isPending ? "Creating..." : "Create Proposal"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
