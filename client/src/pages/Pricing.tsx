import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ArrowLeft, Zap, Crown } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState<"monthly" | "lifetime" | null>(null);

  const { data: subscription } = trpc.subscription.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const createCheckout = trpc.subscription.createCheckout.useMutation();
  const activateSub = trpc.subscription.activate.useMutation();
  const utils = trpc.useUtils();

  const handleSubscribe = async (plan: "monthly" | "lifetime") => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoading(plan);
    try {
      const result = await createCheckout.mutateAsync({ plan, coupon: coupon || undefined });
      if (result.stub) {
        // Stub mode: directly activate for demo purposes
        await activateSub.mutateAsync({ plan });
        utils.subscription.get.invalidate();
        toast.success(
          `${plan === "lifetime" ? "Lifetime ($99)" : "Monthly ($39)"} plan activated! (Stripe TEST MODE)`
        );
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const hasSubscription = subscription?.status === "active";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Choose Your Plan</h1>
            <p className="text-slate-500 text-sm">Professional proposals for trade contractors</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {hasSubscription && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="font-semibold text-green-900">
              You have an active {subscription?.plan === "lifetime" ? "Lifetime" : "Monthly"} plan
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Monthly Plan */}
          <Card className="p-8 border-2 border-slate-200 hover:border-slate-400 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Monthly</h2>
                <p className="text-sm text-slate-500">Cancel anytime</p>
              </div>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">$39</span>
              <span className="text-slate-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited proposals",
                "8 trade templates",
                "PDF export with branding",
                "E-signature capture",
                "Proposal tracking",
                "Line items library",
                "Email support",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-slate-700 hover:bg-slate-800 text-white"
              onClick={() => handleSubscribe("monthly")}
              disabled={loading !== null || hasSubscription}
            >
              {loading === "monthly" ? "Processing..." : hasSubscription ? "Current Plan" : "Start Monthly - $39/mo"}
            </Button>
          </Card>

          {/* Lifetime Plan */}
          <Card className="p-8 border-2 border-green-400 relative hover:border-green-500 transition-colors">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                BEST VALUE
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Lifetime</h2>
                <p className="text-sm text-slate-500">One-time payment</p>
              </div>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">$99</span>
              <span className="text-slate-500"> one-time</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Monthly",
                "Lifetime access - no recurring fees",
                "All future template updates",
                "Priority support",
                "Good/Better/Best pricing tiers",
                "Custom branding colors",
                "Early access to new features",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleSubscribe("lifetime")}
              disabled={loading !== null || hasSubscription}
            >
              {loading === "lifetime" ? "Processing..." : hasSubscription ? "Current Plan" : "Get Lifetime Access - $99"}
            </Button>
          </Card>
        </div>

        {/* Coupon Code */}
        <div className="max-w-sm mx-auto">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Have a coupon code?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (coupon) {
                  toast.success(`Coupon "${coupon}" applied!`);
                } else {
                  toast.error("Please enter a coupon code");
                }
              }}
            >
              Apply
            </Button>
          </div>
        </div>

        {/* Stripe Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Payments processed securely via Stripe (TEST MODE). No real charges will be made.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            30-day money-back guarantee on all plans.
          </p>
        </div>
      </div>
    </div>
  );
}
