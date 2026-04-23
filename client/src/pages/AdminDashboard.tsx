import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Users, FileText, DollarSign, TrendingUp, ArrowLeft, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const { data: stats } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const { data: recentUsers } = trpc.admin.recentUsers.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const { data: recentSubs } = trpc.admin.recentSubscriptions.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-sm">
          <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
          <p className="text-slate-600 mb-4">You need admin privileges to view this page.</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active Subscriptions",
      value: stats?.activeSubscriptions ?? 0,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Proposals Created",
      value: stats?.totalProposals ?? 0,
      icon: FileText,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
    {
      label: "Total Revenue",
      value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Dashboard
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Platform overview and management</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Admin</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Revenue Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Subscription Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">Monthly ($39/mo)</div>
                  <div className="text-sm text-slate-500">{stats?.monthlySubscriptions ?? 0} active</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">
                    ${((stats?.monthlySubscriptions ?? 0) * 39).toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">MRR</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">Lifetime ($99)</div>
                  <div className="text-sm text-slate-500">{stats?.lifetimeSubscriptions ?? 0} purchased</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">
                    ${((stats?.lifetimeSubscriptions ?? 0) * 99).toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">one-time</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-semibold text-slate-900">Total Revenue</div>
                <div className="font-bold text-green-700">${(stats?.totalRevenue ?? 0).toFixed(2)}</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Proposal Activity</h2>
            <div className="space-y-3">
              {[
                { label: "Draft", value: stats?.proposalsByStatus?.draft ?? 0, color: "bg-slate-200" },
                { label: "Sent", value: stats?.proposalsByStatus?.sent ?? 0, color: "bg-blue-200" },
                { label: "Viewed", value: stats?.proposalsByStatus?.viewed ?? 0, color: "bg-yellow-200" },
                { label: "Signed", value: stats?.proposalsByStatus?.signed ?? 0, color: "bg-green-200" },
                { label: "Declined", value: stats?.proposalsByStatus?.declined ?? 0, color: "bg-red-200" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-slate-600">{row.label}</div>
                  <div className="flex-1 bg-slate-100 rounded-full h-2">
                    <div
                      className={`${row.color} h-2 rounded-full transition-all`}
                      style={{
                        width: `${stats?.totalProposals ? (row.value / stats.totalProposals) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="w-8 text-sm font-medium text-slate-900 text-right">{row.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Users */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Users</h2>
          {recentUsers && recentUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Name</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Email</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Role</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-900">{u.name || "-"}</td>
                      <td className="py-2 px-3 text-slate-600">{u.email || "-"}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-slate-100 text-slate-700"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {format(new Date(u.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No users yet.</p>
          )}
        </Card>

        {/* Recent Subscriptions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Subscriptions</h2>
          {recentSubs && recentSubs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">User</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Plan</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Status</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Amount</th>
                    <th className="text-left py-2 px-3 font-semibold text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSubs.map((sub) => (
                    <tr key={sub.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-900">{sub.userId}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.plan === "lifetime" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {sub.plan === "lifetime" ? "Lifetime $99" : "Monthly $39"}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-900 font-medium">
                        ${sub.plan === "lifetime" ? "99.00" : "39.00"}
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {format(new Date(sub.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No subscriptions yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
