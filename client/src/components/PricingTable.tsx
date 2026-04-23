import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export type LineItem = {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
};

export type PricingTier = {
  name: string;
  items: LineItem[];
};

export type PricingData = {
  mode: "standard" | "tiered";
  items: LineItem[];
  tiers: PricingTier[];
  taxRate: number;
  taxEnabled: boolean;
  discount: number;
  discountType: "fixed" | "percent";
};

type Props = {
  value: PricingData;
  onChange: (data: PricingData) => void;
  savedItems?: Array<{ id: number; description: string; unit: string | null; unitPrice: string }>;
  onSaveItem?: (item: { description: string; unit: string; unitPrice: string }) => void;
};

function newItem(): LineItem {
  return { id: crypto.randomUUID(), description: "", qty: 1, unit: "each", unitPrice: 0 };
}

function calcSubtotal(items: LineItem[]) {
  return items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
}

export default function PricingTable({ value, onChange, savedItems, onSaveItem }: Props) {
  const [showSaved, setShowSaved] = useState(false);

  const updateField = (field: keyof PricingData, val: unknown) => {
    onChange({ ...value, [field]: val });
  };

  const updateItem = (idx: number, field: keyof LineItem, val: string | number) => {
    const items = [...value.items];
    items[idx] = { ...items[idx], [field]: val };
    onChange({ ...value, items });
  };

  const addItem = () => {
    onChange({ ...value, items: [...value.items, newItem()] });
  };

  const removeItem = (idx: number) => {
    const items = value.items.filter((_, i) => i !== idx);
    onChange({ ...value, items });
  };

  const addSavedItem = (saved: { description: string; unit: string | null; unitPrice: string }) => {
    const item: LineItem = {
      id: crypto.randomUUID(),
      description: saved.description,
      qty: 1,
      unit: saved.unit || "each",
      unitPrice: parseFloat(saved.unitPrice),
    };
    onChange({ ...value, items: [...value.items, item] });
    setShowSaved(false);
  };

  const updateTierItem = (tierIdx: number, itemIdx: number, field: keyof LineItem, val: string | number) => {
    const tiers = [...value.tiers];
    const items = [...tiers[tierIdx].items];
    items[itemIdx] = { ...items[itemIdx], [field]: val };
    tiers[tierIdx] = { ...tiers[tierIdx], items };
    onChange({ ...value, tiers });
  };

  const addTierItem = (tierIdx: number) => {
    const tiers = [...value.tiers];
    tiers[tierIdx] = { ...tiers[tierIdx], items: [...tiers[tierIdx].items, newItem()] };
    onChange({ ...value, tiers });
  };

  const removeTierItem = (tierIdx: number, itemIdx: number) => {
    const tiers = [...value.tiers];
    tiers[tierIdx] = { ...tiers[tierIdx], items: tiers[tierIdx].items.filter((_, i) => i !== itemIdx) };
    onChange({ ...value, tiers });
  };

  const subtotal = calcSubtotal(value.items);
  const taxAmount = value.taxEnabled ? subtotal * (value.taxRate / 100) : 0;
  const discountAmount =
    value.discountType === "percent"
      ? subtotal * (value.discount / 100)
      : value.discount;
  const total = subtotal + taxAmount - discountAmount;

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-3">
        <button
          onClick={() => updateField("mode", "standard")}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            value.mode === "standard"
              ? "bg-slate-700 text-white border-slate-700"
              : "bg-white text-slate-700 border-slate-300 hover:border-slate-500"
          }`}
        >
          Standard Pricing
        </button>
        <button
          onClick={() => {
            if (value.tiers.length === 0) {
              onChange({
                ...value,
                mode: "tiered",
                tiers: [
                  { name: "Good", items: [newItem()] },
                  { name: "Better", items: [newItem()] },
                  { name: "Best", items: [newItem()] },
                ],
              });
            } else {
              updateField("mode", "tiered");
            }
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            value.mode === "tiered"
              ? "bg-slate-700 text-white border-slate-700"
              : "bg-white text-slate-700 border-slate-300 hover:border-slate-500"
          }`}
        >
          Good / Better / Best
        </button>
      </div>

      {value.mode === "standard" && (
        <>
          {/* Saved Items Picker */}
          {savedItems && savedItems.length > 0 && (
            <div>
              <button
                onClick={() => setShowSaved(!showSaved)}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                {showSaved ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Add from saved items library
              </button>
              {showSaved && (
                <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden">
                  {savedItems.map((si) => (
                    <button
                      key={si.id}
                      onClick={() => addSavedItem(si)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 flex justify-between items-center"
                    >
                      <span className="text-sm text-slate-900">{si.description}</span>
                      <span className="text-sm text-slate-500">${parseFloat(si.unitPrice).toFixed(2)} / {si.unit || "each"}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border border-slate-200">
                  <th className="px-3 py-2 text-left font-semibold text-slate-700">Description</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-700 w-20">Qty</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-700 w-24">Unit</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-700 w-28">Unit Price</th>
                  <th className="px-3 py-2 text-right font-semibold text-slate-700 w-28">Total</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {value.items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-2 py-2">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                        placeholder="Description"
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        type="number"
                        value={item.qty}
                        min={0}
                        onChange={(e) => updateItem(idx, "qty", parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm text-right"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={item.unit}
                        onChange={(e) => updateItem(idx, "unit", e.target.value)}
                        placeholder="each"
                        className="h-8 text-sm"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          min={0}
                          step={0.01}
                          onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="h-8 text-sm text-right pl-5"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900">
                      ${(item.qty * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-4 h-4 mr-1" />
              Add Line Item
            </Button>
            {onSaveItem && value.items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const last = value.items[value.items.length - 1];
                  if (last.description && last.unitPrice > 0) {
                    onSaveItem({ description: last.description, unit: last.unit, unitPrice: last.unitPrice.toString() });
                  }
                }}
              >
                Save last item to library
              </Button>
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-slate-200 pt-4 space-y-2 max-w-sm ml-auto">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {/* Tax Toggle */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.taxEnabled}
                  onChange={(e) => updateField("taxEnabled", e.target.checked)}
                  className="rounded"
                />
                Tax
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={value.taxRate}
                  min={0}
                  max={100}
                  step={0.1}
                  onChange={(e) => updateField("taxRate", parseFloat(e.target.value) || 0)}
                  className="h-7 w-20 text-sm text-right"
                  disabled={!value.taxEnabled}
                />
                <span className="text-slate-500">%</span>
                <span className="w-20 text-right">${taxAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Discount</span>
              <div className="flex items-center gap-2">
                <select
                  value={value.discountType}
                  onChange={(e) => updateField("discountType", e.target.value)}
                  className="h-7 text-sm border border-slate-300 rounded px-1"
                >
                  <option value="fixed">$</option>
                  <option value="percent">%</option>
                </select>
                <Input
                  type="number"
                  value={value.discount}
                  min={0}
                  step={0.01}
                  onChange={(e) => updateField("discount", parseFloat(e.target.value) || 0)}
                  className="h-7 w-20 text-sm text-right"
                />
                <span className="w-20 text-right text-red-600">-${discountAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}

      {value.mode === "tiered" && (
        <div className="grid grid-cols-3 gap-4">
          {value.tiers.map((tier, tierIdx) => {
            const tierSubtotal = calcSubtotal(tier.items);
            return (
              <Card key={tier.name} className={`p-4 ${tier.name === "Best" ? "ring-2 ring-green-500" : ""}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-900 text-lg">{tier.name}</h3>
                  {tier.name === "Best" && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                      Recommended
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-4">
                  ${tierSubtotal.toFixed(2)}
                </div>
                <div className="space-y-2 mb-4">
                  {tier.items.map((item, itemIdx) => (
                    <div key={item.id} className="flex gap-2 items-center">
                      <Input
                        value={item.description}
                        onChange={(e) => updateTierItem(tierIdx, itemIdx, "description", e.target.value)}
                        placeholder="Item"
                        className="h-7 text-xs flex-1"
                      />
                      <div className="relative w-20">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          min={0}
                          step={0.01}
                          onChange={(e) => updateTierItem(tierIdx, itemIdx, "unitPrice", parseFloat(e.target.value) || 0)}
                          className="h-7 text-xs text-right pl-4"
                        />
                      </div>
                      <button
                        onClick={() => removeTierItem(tierIdx, itemIdx)}
                        className="text-slate-300 hover:text-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => addTierItem(tierIdx)}>
                  <Plus className="w-3 h-3 mr-1" />
                  Add item
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
