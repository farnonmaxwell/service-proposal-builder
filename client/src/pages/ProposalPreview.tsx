import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { format } from "date-fns";
import { useState, useRef } from "react";
import { toast } from "sonner";
import ESignatureCanvas from "@/components/ESignatureCanvas";
import { Download, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

type PricingItem = { description: string; qty: number; unit: string; unitPrice: number };
type PricingData = {
  mode?: string;
  items?: PricingItem[];
  taxEnabled?: boolean;
  taxRate?: number;
  discount?: number;
  discountType?: string;
};

export default function ProposalPreview() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const proposalId = parseInt(params.id || "0");
  const [showSignature, setShowSignature] = useState(false);
  const [signed, setSigned] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { data: proposal, refetch } = trpc.proposals.get.useQuery(
    { id: proposalId },
    { enabled: isAuthenticated && proposalId > 0 }
  );
  const { data: settings } = trpc.companySettings.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: sig } = trpc.signatures.get.useQuery(
    { proposalId },
    { enabled: isAuthenticated && proposalId > 0 }
  );
  const updateProposal = trpc.proposals.update.useMutation();
  const createSignature = trpc.signatures.create.useMutation();

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading proposal...</div>
      </div>
    );
  }

  const pricingData = (proposal.pricingData as PricingData) || {};
  const items: PricingItem[] = pricingData.items || [];
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const taxAmount = pricingData.taxEnabled ? subtotal * ((pricingData.taxRate || 0) / 100) : 0;
  const discountAmount =
    pricingData.discountType === "percent"
      ? subtotal * ((pricingData.discount || 0) / 100)
      : pricingData.discount || 0;
  const total = subtotal + taxAmount - discountAmount;

  const companyName = settings?.companyName || "Your Company";
  const clientName = proposal.clientName;
  const dateStr = format(new Date(proposal.createdAt), "yyyy-MM-dd");
  const filename = `${companyName.replace(/\s+/g, "-")}-${clientName.replace(/\s+/g, "-")}-${dateStr}.pdf`;

  const handleMarkSent = async () => {
    await updateProposal.mutateAsync({ id: proposalId, status: "sent", sentAt: new Date() });
    toast.success("Proposal marked as Sent");
    refetch();
  };

  const handleSign = async (data: { signerName: string; signatureDataUrl: string; ipAddress: string }) => {
    await createSignature.mutateAsync({ proposalId, ...data });
    await updateProposal.mutateAsync({ id: proposalId, status: "signed", signedAt: new Date() });
    setSigned(true);
    setShowSignature(false);
    toast.success("Proposal signed successfully!");
    refetch();
  };

  const handlePrint = () => {
    // Set document title to enforce filename when saving as PDF
    const originalTitle = document.title;
    document.title = filename;
    window.print();
    // Restore after print dialog closes
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  const mailtoLink = `mailto:${proposal.clientEmail || ""}?subject=Proposal from ${companyName}&body=Please find your proposal attached. Total: $${total.toFixed(2)}`;

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-800",
    sent: "bg-blue-100 text-blue-800",
    viewed: "bg-yellow-100 text-yellow-800",
    signed: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Action Bar - hidden on print */}
      <div className="bg-white border-b border-slate-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-3 items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[proposal.status]}`}>
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </span>
            {proposal.status === "draft" && (
              <Button variant="outline" onClick={handleMarkSent}>
                Mark as Sent
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href={mailtoLink}>
                <Mail className="w-4 h-4 mr-2" />
                Email Client
              </a>
            </Button>
            <Button className="bg-slate-700 hover:bg-slate-800 text-white" onClick={handlePrint}>
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <p className="text-xs text-slate-400">PDF filename: {filename}</p>
        </div>
      </div>

      {/* Proposal Document */}
      <div className="max-w-4xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
        <div ref={printRef} className="bg-white shadow-lg print:shadow-none">
          {/* Header */}
          <div
            className="p-8 text-white"
            style={{ backgroundColor: settings?.primaryColor || "#475569" }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{companyName}</h1>
                {settings?.address && <p className="mt-1 opacity-90">{settings.address}</p>}
                {settings?.phone && <p className="opacity-90">{settings.phone}</p>}
                {settings?.email && <p className="opacity-90">{settings.email}</p>}
                {settings?.licenseNumber && (
                  <p className="opacity-80 text-sm mt-1">License: {settings.licenseNumber}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">PROPOSAL</div>
                <div className="mt-2 opacity-90">
                  <div>Date: {format(new Date(proposal.createdAt), "MMMM d, yyyy")}</div>
                  <div>Proposal #: {proposal.id}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="px-8 py-6 border-b border-slate-200 bg-slate-50">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Prepared For
                </h2>
                <div className="font-semibold text-slate-900 text-lg">{proposal.clientName}</div>
                {proposal.clientAddress && (
                  <div className="text-slate-600 mt-1">{proposal.clientAddress}</div>
                )}
                {proposal.clientEmail && (
                  <div className="text-slate-600">{proposal.clientEmail}</div>
                )}
                {proposal.clientPhone && (
                  <div className="text-slate-600">{proposal.clientPhone}</div>
                )}
              </div>
              <div>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Summary
                </h2>
                <div className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</div>
                <div className="text-sm text-slate-500 mt-1">Total Project Value</div>
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          {proposal.scopeOfWork && (
            <div className="px-8 py-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Scope of Work</h2>
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {proposal.scopeOfWork}
              </div>
            </div>
          )}

          {/* Pricing Table */}
          {items.length > 0 && (
            <div className="px-8 py-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Pricing</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border border-slate-200">
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Description</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-700">Qty</th>
                    <th className="px-4 py-2 text-left font-semibold text-slate-700">Unit</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-700">Unit Price</th>
                    <th className="px-4 py-2 text-right font-semibold text-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-slate-900">{item.description}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{item.qty}</td>
                      <td className="px-4 py-3 text-slate-600">{item.unit}</td>
                      <td className="px-4 py-3 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        ${(item.qty * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 space-y-1 max-w-xs ml-auto text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {pricingData.taxEnabled && (
                  <div className="flex justify-between text-slate-600">
                    <span>Tax ({pricingData.taxRate}%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {proposal.timeline && (
            <div className="px-8 py-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Project Timeline</h2>
              <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                {proposal.timeline}
              </div>
            </div>
          )}

          {/* Terms */}
          {proposal.terms && (
            <div className="px-8 py-6 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Terms and Conditions</h2>
              <div className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                {proposal.terms}
              </div>
            </div>
          )}

          {/* Signature Block */}
          <div className="px-8 py-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Authorization</h2>
            {sig || signed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-green-800">Proposal Signed</span>
                </div>
                {sig?.signatureDataUrl && (
                  <img
                    src={sig.signatureDataUrl}
                    alt="Signature"
                    className="h-16 border-b border-slate-300 mb-2"
                  />
                )}
                <div className="text-sm text-slate-600">
                  <div>Signed by: <strong>{sig?.signerName}</strong></div>
                  <div>Date: {sig ? format(new Date(sig.signedAt), "MMMM d, yyyy h:mm a") : format(new Date(), "MMMM d, yyyy h:mm a")}</div>
                  {sig?.ipAddress && <div>IP: {sig.ipAddress}</div>}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="border-b-2 border-slate-300 h-16 mb-2 flex items-end pb-2">
                    <span className="text-slate-400 text-sm">Client Signature</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <div>Name: {proposal.clientName}</div>
                    <div>Date: _______________</div>
                  </div>
                  <Button
                    className="mt-4 bg-green-500 hover:bg-green-600 text-white print:hidden"
                    onClick={() => setShowSignature(true)}
                  >
                    Sign This Proposal
                  </Button>
                </div>
                <div>
                  <div className="border-b-2 border-slate-300 h-16 mb-2 flex items-end pb-2">
                    <span className="text-slate-400 text-sm">Contractor Signature</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <div>Name: {companyName}</div>
                    <div>Date: {format(new Date(proposal.createdAt), "MMMM d, yyyy")}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-8 py-4 text-center text-white text-sm"
            style={{ backgroundColor: settings?.primaryColor || "#475569" }}
          >
            <p>{companyName} - Thank you for your business</p>
          </div>
        </div>

        {/* E-Signature Modal */}
        {showSignature && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
            <Card className="w-full max-w-xl p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Sign Proposal</h2>
              <ESignatureCanvas
                onSave={handleSign}
                onCancel={() => setShowSignature(false)}
              />
            </Card>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .bg-white, .bg-white * { visibility: visible; }
          .bg-white { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
