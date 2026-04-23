import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    phone: "",
    email: "",
    licenseNumber: "",
    primaryColor: "#475569",
    accentColor: "#22c55e",
    defaultTerms: "",
    defaultPaymentTerms: "",
  });

  const { data: settings } = trpc.companySettings.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateSettings = trpc.companySettings.upsert.useMutation();

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        licenseNumber: settings.licenseNumber || "",
        primaryColor: settings.primaryColor || "#475569",
        accentColor: settings.accentColor || "#22c55e",
        defaultTerms: settings.defaultTerms || "",
        defaultPaymentTerms: settings.defaultPaymentTerms || "",
      });
    }
  }, [settings]);

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(formData);
      toast.success("Settings updated!");
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your company profile and branding</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <Card className="p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Company Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Company Name
                </label>
                <Input
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  placeholder="Your Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Address
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Phone
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="info@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  License Number
                </label>
                <Input
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  placeholder="License #"
                />
              </div>
            </div>
          </Card>

          {/* Branding */}
          <Card className="p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Branding</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        setFormData({ ...formData, primaryColor: e.target.value })
                      }
                      className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) =>
                        setFormData({ ...formData, primaryColor: e.target.value })
                      }
                      placeholder="#475569"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1">
                    Accent Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) =>
                        setFormData({ ...formData, accentColor: e.target.value })
                      }
                      className="w-12 h-10 rounded border border-slate-300 cursor-pointer"
                    />
                    <Input
                      value={formData.accentColor}
                      onChange={(e) =>
                        setFormData({ ...formData, accentColor: e.target.value })
                      }
                      placeholder="#22c55e"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Default Terms */}
          <Card className="p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Default Terms</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Default Payment Terms
                </label>
                <Input
                  value={formData.defaultPaymentTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultPaymentTerms: e.target.value })
                  }
                  placeholder="e.g., 50% deposit, 50% upon completion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Default Terms & Conditions
                </label>
                <textarea
                  value={formData.defaultTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultTerms: e.target.value })
                  }
                  className="w-full h-32 p-4 border border-slate-300 rounded-lg font-mono text-sm"
                  placeholder="Enter your standard terms and conditions..."
                />
              </div>
            </div>
          </Card>

          {/* Logo Upload */}
          <Card className="p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Company Logo</h2>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">
                Logo upload coming soon. For now, use your company name in proposals.
              </p>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
