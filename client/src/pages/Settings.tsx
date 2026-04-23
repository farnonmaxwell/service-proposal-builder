import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Image } from "lucide-react";

export default function Settings() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    phone: "",
    email: "",
    licenseNumber: "",
    logoUrl: "",
    primaryColor: "#475569",
    accentColor: "#22c55e",
    defaultTerms: "",
    defaultPaymentTerms: "",
  });
  const [newItem, setNewItem] = useState({ description: "", unit: "each", unitPrice: "" });

  const { data: settings } = trpc.companySettings.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: savedItems, refetch: refetchItems } = trpc.lineItems.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const updateSettings = trpc.companySettings.upsert.useMutation();
  const createItem = trpc.lineItems.create.useMutation();
  const deleteItem = trpc.lineItems.delete.useMutation();

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        licenseNumber: settings.licenseNumber || "",
        logoUrl: settings.logoUrl || "",
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
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const handleAddItem = async () => {
    if (!newItem.description || !newItem.unitPrice) {
      toast.error("Description and unit price are required");
      return;
    }
    try {
      await createItem.mutateAsync({
        description: newItem.description,
        unit: newItem.unit,
        unitPrice: newItem.unitPrice,
      });
      setNewItem({ description: "", unit: "each", unitPrice: "" });
      refetchItems();
      toast.success("Line item saved to library");
    } catch {
      toast.error("Failed to save line item");
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteItem.mutateAsync({ id });
      refetchItems();
      toast.success("Line item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Company Settings</h1>
            <p className="text-slate-500 mt-0.5">Manage your company profile, branding, and defaults</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <Card className="p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Company Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <Input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Acme Roofing & Contracting"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                <Input
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="License #12345"
                />
              </div>
            </div>
          </Card>

          {/* Logo */}
          <Card className="p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Company Logo</h2>
            <p className="text-sm text-slate-500 mb-4">
              Enter the URL of your company logo. It will appear on all proposals.
            </p>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                  <Input
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                {formData.logoUrl && (
                  <div className="mt-6">
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="h-12 w-auto border border-slate-200 rounded-lg p-1 bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
              {!formData.logoUrl && (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center bg-slate-50">
                  <Image className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Enter a logo URL above to preview it here</p>
                </div>
              )}
            </div>
          </Card>

          {/* Branding */}
          <Card className="p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Branding Colors</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    placeholder="#475569"
                    className="font-mono"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Used for proposal header and accents</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-12 h-10 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <Input
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    placeholder="#22c55e"
                    className="font-mono"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Used for buttons and highlights</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: formData.primaryColor }}>
              <p className="text-white text-sm font-medium">Preview: {formData.companyName || "Your Company Name"}</p>
              <p className="text-white/80 text-xs mt-0.5">Proposal header preview</p>
            </div>
          </Card>

          {/* Default Terms */}
          <Card className="p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Default Terms</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Payment Terms</label>
                <Input
                  value={formData.defaultPaymentTerms}
                  onChange={(e) => setFormData({ ...formData, defaultPaymentTerms: e.target.value })}
                  placeholder="e.g., 50% deposit, 50% upon completion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Default Terms and Conditions
                </label>
                <textarea
                  value={formData.defaultTerms}
                  onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                  placeholder="Enter your standard terms and conditions..."
                />
                <p className="text-xs text-slate-400 mt-1">
                  These will pre-fill the Terms step in new proposals
                </p>
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white"
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>

        {/* Saved Line Items Library */}
        <Card className="p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Saved Line Items Library</h2>
          <p className="text-sm text-slate-500 mb-6">
            Save frequently used line items here. They will be available to insert in any proposal.
          </p>

          {/* Add New Item */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Add New Item</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="col-span-3 md:col-span-1">
                <Input
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Description"
                />
              </div>
              <div>
                <Input
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  placeholder="Unit (each, sq ft...)"
                />
              </div>
              <div>
                <Input
                  type="number"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                  placeholder="Unit Price ($)"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <Button
              onClick={handleAddItem}
              disabled={createItem.isPending}
              className="bg-slate-700 hover:bg-slate-800 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add to Library
            </Button>
          </div>

          {/* Saved Items List */}
          {savedItems && savedItems.length > 0 ? (
            <div className="space-y-2">
              {savedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-900 text-sm">{item.description}</span>
                    <span className="text-slate-400 text-sm ml-2">
                      {item.unit} - ${parseFloat(item.unitPrice).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-slate-400 hover:text-red-500 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No saved items yet. Add your first item above.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
