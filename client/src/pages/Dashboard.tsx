import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Plus, FileText, Eye, CheckCircle2, X } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: proposals, isLoading } = trpc.proposals.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: subscription } = trpc.subscription.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-800",
    sent: "bg-blue-100 text-blue-800",
    viewed: "bg-yellow-100 text-yellow-800",
    signed: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    draft: <FileText className="w-4 h-4" />,
    sent: <Eye className="w-4 h-4" />,
    viewed: <Eye className="w-4 h-4" />,
    signed: <CheckCircle2 className="w-4 h-4" />,
    declined: <X className="w-4 h-4" />,
  };

  const stats = {
    total: proposals?.length || 0,
    sent: proposals?.filter((p) => p.status !== "draft").length || 0,
    signed: proposals?.filter((p) => p.status === "signed").length || 0,
    avgDealSize:
      proposals && proposals.length > 0
        ? (
            proposals.reduce((sum, p) => sum + (parseFloat(p.total?.toString() || "0") || 0), 0) /
            proposals.length
          ).toFixed(2)
        : "0",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/settings")}>
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

      {/* Subscription Status */}
      {!subscription && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-blue-900">
                Upgrade to unlock PDF export and e-signatures
              </h3>
              <p className="text-sm text-blue-700">
                Choose monthly ($39) or lifetime ($99) access
              </p>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate("/pricing")}
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm text-slate-600 mb-1">Total Proposals</div>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-slate-600 mb-1">Sent</div>
            <div className="text-3xl font-bold text-blue-600">{stats.sent}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-slate-600 mb-1">Signed</div>
            <div className="text-3xl font-bold text-green-600">{stats.signed}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-slate-600 mb-1">Avg Deal Size</div>
            <div className="text-3xl font-bold text-slate-900">${stats.avgDealSize}</div>
          </Card>
        </div>

        {/* Proposals List */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">Recent Proposals</h2>
            <select className="px-3 py-2 border border-slate-300 rounded-md text-sm">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="signed">Signed</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : proposals && proposals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {proposals.map((proposal) => (
                    <tr key={proposal.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {proposal.clientName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        ${parseFloat(proposal.total?.toString() || "0").toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[proposal.status]
                          }`}
                        >
                          {statusIcons[proposal.status]}
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {format(new Date(proposal.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/proposal/${proposal.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No proposals yet
              </h3>
              <p className="text-slate-600 mb-6">
                Create your first proposal to get started
              </p>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => navigate("/builder")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Proposal
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
