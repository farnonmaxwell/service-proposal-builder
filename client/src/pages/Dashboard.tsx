import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  FileText,
  Plus,
  Settings,
  TrendingUp,
  DollarSign,
  Send,
  CheckCircle2,
  Trash2,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { getLoginUrl } from "@/const";

const STATUS_LABELS = ["all", "draft", "sent", "viewed", "signed", "declined"] as const;
type StatusFilter = (typeof STATUS_LABELS)[number];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-yellow-100 text-yellow-800",
  signed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
};

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: allProposals, isLoading } = trpc.proposals.list.useQuery(
    {},
    { enabled: isAuthenticated }
  );
  const { data: stats } = trpc.proposals.stats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: subscription } = trpc.subscription.get.useQuery(undefined, { enabled: isAuthenticated });
  const deleteProposal = trpc.proposals.delete.useMutation();
  const updateProposal = trpc.proposals.update.useMutation();
  const utils = trpc.useUtils();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-sm">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to continue</h2>
          <p className="text-slate-600 mb-4">Access your proposals and dashboard.</p>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white w-full"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            Sign In
          </Button>
        </Card>
      </div>
    );
  }

  const filteredProposals =
    statusFilter === "all"
      ? allProposals || []
      : (allProposals || []).filter((p) => p.status === statusFilter);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this proposal? This cannot be undone.")) return;
    try {
      await deleteProposal.mutateAsync({ id });
      utils.proposals.list.invalidate();
      utils.proposals.stats.invalidate();
      toast.success("Proposal deleted");
    } catch {
      toast.error("Failed to delete proposal");
    }
  };

  const handleStatusChange = async (
    id: number,
    status: "draft" | "sent" | "viewed" | "signed" | "declined"
  ) => {
    try {
      await updateProposal.mutateAsync({ id, status });
      utils.proposals.list.invalidate();
      utils.proposals.stats.invalidate();
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const hasSubscription = subscription?.status === "active";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-0.5">Welcome back, {user?.name || "there"}</p>
          </div>
          <div className="flex gap-3 items-center">
            {user?.role === "admin" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="flex items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => navigate("/builder")}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Proposal
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Subscription Banner */}
        {!hasSubscription && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-blue-900">
                Upgrade to unlock PDF export and e-signatures
              </p>
              <p className="text-sm text-blue-700">Choose monthly ($39) or lifetime ($99) access</p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate("/#pricing")}
            >
              Upgrade Now
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <span className="text-sm text-slate-500">Total Proposals</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">{stats?.total ?? 0}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-slate-500">Sent This Month</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats?.sentThisMonth ?? 0}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-slate-500">Close Rate</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats?.closeRate ?? 0}%</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm text-slate-500">Avg Deal Size</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">
              ${(stats?.avgDealSize ?? 0).toFixed(0)}
            </div>
          </Card>
        </div>

        {/* Proposals List */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Proposals</h2>
            <div className="flex flex-wrap gap-1">
              {STATUS_LABELS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    statusFilter === s
                      ? "bg-slate-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading proposals...</div>
          ) : filteredProposals.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-1">
                {statusFilter === "all" ? "No proposals yet" : `No ${statusFilter} proposals`}
              </h3>
              <p className="text-slate-500 text-sm mb-4">
                {statusFilter === "all"
                  ? "Create your first proposal to get started"
                  : "Try a different filter"}
              </p>
              {statusFilter === "all" && (
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white"
                  onClick={() => navigate("/builder")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Proposal
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredProposals.map((proposal) => (
                <div key={proposal.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 truncate">
                          {proposal.clientName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            STATUS_COLORS[proposal.status]
                          }`}
                        >
                          {proposal.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-500 flex-wrap">
                        <span>{format(new Date(proposal.createdAt), "MMM d, yyyy")}</span>
                        {proposal.total && parseFloat(proposal.total) > 0 && (
                          <span className="font-medium text-slate-700">
                            ${parseFloat(proposal.total).toFixed(2)}
                          </span>
                        )}
                        {proposal.clientEmail && (
                          <span className="truncate">{proposal.clientEmail}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={proposal.status}
                        onChange={(e) =>
                          handleStatusChange(
                            proposal.id,
                            e.target.value as
                              | "draft"
                              | "sent"
                              | "viewed"
                              | "signed"
                              | "declined"
                          )
                        }
                        className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="viewed">Viewed</option>
                        <option value="signed">Signed</option>
                        <option value="declined">Declined</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/proposal/${proposal.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(proposal.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card
            className="p-6 cursor-pointer hover:shadow-md transition-shadow border-dashed"
            onClick={() => navigate("/builder")}
          >
            <Plus className="w-8 h-8 text-green-500 mb-3" />
            <h3 className="font-semibold text-slate-900">New Proposal</h3>
            <p className="text-sm text-slate-500 mt-1">Start from a trade template</p>
          </Card>
          <Card
            className="p-6 cursor-pointer hover:shadow-md transition-shadow border-dashed"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-8 h-8 text-slate-500 mb-3" />
            <h3 className="font-semibold text-slate-900">Company Settings</h3>
            <p className="text-sm text-slate-500 mt-1">Update branding and defaults</p>
          </Card>
          <Card
            className="p-6 cursor-pointer hover:shadow-md transition-shadow border-dashed"
            onClick={() => {
              const signed = allProposals?.filter((p) => p.status === "signed").length || 0;
              const total = allProposals?.length || 0;
              toast.info(
                `${signed} of ${total} proposals signed (${stats?.closeRate ?? 0}% close rate)`
              );
            }}
          >
            <CheckCircle2 className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-semibold text-slate-900">View Stats</h3>
            <p className="text-sm text-slate-500 mt-1">Track your close rate</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
