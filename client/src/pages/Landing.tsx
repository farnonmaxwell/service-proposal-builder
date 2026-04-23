import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { CheckCircle2, FileText, Zap, Clock, DollarSign, BarChart3 } from "lucide-react";

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const trades = [
    { name: "Roofing", icon: "🏠" },
    { name: "Plumbing", icon: "🔧" },
    { name: "Landscaping", icon: "🌿" },
    { name: "Painting", icon: "🎨" },
    { name: "HVAC", icon: "❄️" },
    { name: "Electrical", icon: "⚡" },
    { name: "General Contractor", icon: "🏗️" },
    { name: "Pressure Washing", icon: "💧" },
  ];

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-green-500" />,
      title: "Professional Templates",
      description: "8+ trade-specific templates with pre-written scope, pricing, and terms",
    },
    {
      icon: <Zap className="w-8 h-8 text-green-500" />,
      title: "Create in Minutes",
      description: "Build polished proposals in under 10 minutes with our guided workflow",
    },
    {
      icon: <DollarSign className="w-8 h-8 text-green-500" />,
      title: "Smart Pricing",
      description: "Line item editor with tax, discounts, and tiered pricing options",
    },
    {
      icon: <Clock className="w-8 h-8 text-green-500" />,
      title: "Timeline & Milestones",
      description: "Set project timelines and payment milestones directly in proposals",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-500" />,
      title: "Track Everything",
      description: "Monitor proposal status, close rates, and average deal size",
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-green-500" />,
      title: "E-Signature Ready",
      description: "Collect signatures and track signed proposals automatically",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-700">
            Service Proposal Builder
          </div>
          <div className="flex gap-4">
            <Button variant="outline" asChild>
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
            <Button className="bg-green-500 hover:bg-green-600 text-white" asChild>
              <a href={getLoginUrl()}>Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-slate-900 mb-6">
          Professional Proposals in Minutes
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Create branded, professional proposals with pricing tables, timelines, terms, and e-signatures. Built for trades and home service businesses.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white" asChild>
            <a href={getLoginUrl()}>Start Free Trial</a>
          </Button>
          <Button size="lg" variant="outline">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Template Gallery */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Trade-Specific Templates
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trades.map((trade) => (
              <Card key={trade.name} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">{trade.icon}</div>
                <h3 className="font-semibold text-slate-900">{trade.name}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="p-8 hover:shadow-lg transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Monthly Plan */}
            <Card className="p-8 bg-slate-800 border-slate-700">
              <h3 className="text-2xl font-bold mb-2">Monthly</h3>
              <div className="text-4xl font-bold text-green-400 mb-6">$39<span className="text-lg">/month</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Unlimited proposals
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  All templates included
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  E-signature support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Proposal tracking
                </li>
              </ul>
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white" asChild>
                <a href={getLoginUrl()}>Choose Monthly</a>
              </Button>
            </Card>

            {/* Lifetime Plan */}
            <Card className="p-8 bg-green-500 border-green-600 ring-2 ring-green-400">
              <div className="text-sm font-semibold text-green-900 mb-2">BEST VALUE</div>
              <h3 className="text-2xl font-bold mb-2 text-white">Lifetime</h3>
              <div className="text-4xl font-bold text-white mb-6">$99<span className="text-lg"> one-time</span></div>
              <ul className="space-y-3 mb-8 text-white">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Unlimited proposals forever
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  All templates included
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  E-signature support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Proposal tracking
                </li>
              </ul>
              <Button className="w-full bg-white hover:bg-slate-100 text-green-600 font-semibold" asChild>
                <a href={getLoginUrl()}>Choose Lifetime</a>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg text-slate-900 mb-2">
                Can I use this on mobile?
              </h3>
              <p className="text-slate-600">
                Yes! Service Proposal Builder is fully responsive and works on phones, tablets, and desktops.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-lg text-slate-900 mb-2">
                Do you store my client data?
              </h3>
              <p className="text-slate-600">
                Your proposals and client information are stored securely. You own all your data and can export anytime.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-lg text-slate-900 mb-2">
                Can I customize templates?
              </h3>
              <p className="text-slate-600">
                Absolutely. Start with our templates and customize scope, pricing, terms, and branding to match your business.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-lg text-slate-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-slate-600">
                Yes, create an account and try the builder for free. Upgrade anytime to unlock PDF export and e-signatures.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to look professional without hiring a designer?
          </h2>
          <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white" asChild>
            <a href={getLoginUrl()}>Get Started Now</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>Service Proposal Builder - Built for trades and home service businesses</p>
          <p className="text-sm mt-2">Max Farnon Digital</p>
        </div>
      </footer>
    </div>
  );
}
