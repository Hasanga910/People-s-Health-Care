import DashboardLayout from "../components/DashboardLayout";

const staffList = [
  { id: "STF-001", name: "Ms. Saduni Perera", role: "Pharmacy Staff", status: "Active", joined: "Mar 2024", contact: "0771234567" },
  { id: "STF-002", name: "Mr. Rajeewa Bandara", role: "Lab Technician", status: "Active", joined: "Jun 2023", contact: "0712345678" },
  { id: "STF-003", name: "Ms. Niluka Fernandopulle", role: "Receptionist", status: "Active", joined: "Jan 2025", contact: "0768901234" },
  { id: "STF-004", name: "Mr. Chaminda Gunawardene", role: "Lab Technician", status: "Inactive", joined: "Sep 2022", contact: "0751234567" },
];

const monthlyTrends = [
  { month: "Sep", appointments: 142, revenue: 218400 },
  { month: "Oct", appointments: 168, revenue: 264500 },
  { month: "Nov", appointments: 155, revenue: 242800 },
  { month: "Dec", appointments: 131, revenue: 198600 },
  { month: "Jan", appointments: 176, revenue: 289200 },
  { month: "Feb", appointments: 94, revenue: 148600 },
];

const maxRevenue = Math.max(...monthlyTrends.map((m) => m.revenue));

const recentPatients = [
  { id: "PHC-0098", name: "Premalatha Kularathne", regDate: "Feb 14, 2026", visits: 1 },
  { id: "PHC-0097", name: "Sanjeewa Liyanage", regDate: "Feb 13, 2026", visits: 2 },
  { id: "PHC-0096", name: "Hiruni Dharmasena", regDate: "Feb 12, 2026", visits: 1 },
  { id: "PHC-0095", name: "Thilanka Rajapaksa", regDate: "Feb 11, 2026", visits: 4 },
];

const statusBadge = {
  "Active": "bg-emerald-100 text-emerald-700",
  "Inactive": "bg-slate-100 text-slate-500",
};

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin" pageTitle="Administration Overview">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-3xl p-6 flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-sm mb-1">Administration Panel</p>
            <h2 className="text-xl font-black text-white">People's Health Care</h2>
            <p className="text-slate-400 text-xs mt-1">System overview & management dashboard</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-white font-black text-3xl">98</p>
            <p className="text-slate-300 text-xs">registered patients</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Patients", value: "98", icon: "👥", color: "blue", sub: "+4 this week" },
            { label: "Monthly Revenue", value: "LKR 148,600", icon: "💰", color: "emerald", sub: "Feb 2026 (partial)" },
            { label: "Active Staff", value: "3", icon: "🧑‍⚕️", color: "violet", sub: "4 total, 1 inactive" },
            { label: "Appointments (Feb)", value: "94", icon: "📅", color: "cyan", sub: "14 days in" },
          ].map((s) => {
            const colors = {
              blue: "bg-blue-50 border-blue-100 text-blue-700",
              emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
              violet: "bg-violet-50 border-violet-100 text-violet-700",
              cyan: "bg-cyan-50 border-cyan-100 text-cyan-700",
            };
            return (
              <div key={s.label} className={`rounded-2xl p-5 border ${colors[s.color]}`}>
                <span className="text-2xl block mb-2">{s.icon}</span>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs font-bold mt-0.5 opacity-90">{s.label}</p>
                <p className="text-xs opacity-60 mt-0.5">{s.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Monthly Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Revenue & appointment trends (last 6 months)</p>
            </div>
            <div className="p-6">
              <div className="flex items-end gap-4 h-44">
                {monthlyTrends.map((m) => {
                  const heightPct = (m.revenue / maxRevenue) * 100;
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative group">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          <p className="font-bold">{m.month}</p>
                          <p>LKR {m.revenue.toLocaleString()}</p>
                          <p>{m.appointments} appointments</p>
                        </div>
                        <div
                          className="w-full rounded-xl bg-gradient-to-t from-blue-900 to-blue-600 hover:from-cyan-700 hover:to-cyan-500 transition-all cursor-pointer"
                          style={{ height: `${heightPct * 1.44}px` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{m.month}</span>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-900" />
                  <span className="text-xs text-slate-500">Revenue (LKR)</span>
                </div>
                <p className="text-xs text-slate-400">Hover bars for details</p>
              </div>
            </div>
          </div>

          {/* Quick Stats + Actions */}
          <div className="space-y-5">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: "👤", label: "Add Staff Member", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                  { icon: "🏥", label: "Manage Equipment", color: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
                  { icon: "📊", label: "Billing Turnover Report", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                  { icon: "📋", label: "All Appointments", color: "bg-slate-50 text-slate-700 hover:bg-slate-100" },
                  { icon: "⚙", label: "System Settings", color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
                ].map((action) => (
                  <button
                    key={action.label}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${action.color}`}
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 text-sm mb-4">System Status</h3>
              <div className="space-y-3">
                {[
                  { module: "Appointment System", status: "Online" },
                  { module: "Pharmacy Module", status: "Online" },
                  { module: "Laboratory Module", status: "Online" },
                  { module: "Billing System", status: "Online" },
                ].map((s) => (
                  <div key={s.module} className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">{s.module}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-600">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Staff Management */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Staff Management</h3>
              <p className="text-xs text-slate-400 mt-0.5">Active and inactive staff accounts</p>
            </div>
            <button className="text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 px-4 py-2 rounded-xl transition-all">
              + Add Staff
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Staff ID</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Joined</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Contact</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{staff.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold flex-shrink-0">
                          {staff.name.charAt(4)}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{staff.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{staff.role}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{staff.joined}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{staff.contact}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge[staff.status]}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button className="text-xs font-semibold text-blue-700 hover:underline">Edit</button>
                        <button className={`text-xs font-semibold ${staff.status === "Active" ? "text-red-500 hover:text-red-700" : "text-emerald-600 hover:text-emerald-800"}`}>
                          {staff.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Patient Registrations */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Recent Patient Registrations</h3>
              <p className="text-xs text-slate-400 mt-0.5">Newest patient accounts</p>
            </div>
            <button className="text-xs font-semibold text-slate-700 hover:underline">View All Patients</button>
          </div>
          <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {recentPatients.map((p) => (
              <div key={p.id} className="px-6 py-5">
                <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold mb-3">
                  {p.name.charAt(0)}
                </div>
                <p className="text-xs font-mono text-slate-400">{p.id}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{p.name}</p>
                <p className="text-xs text-slate-400 mt-1">{p.regDate}</p>
                <p className="text-xs text-blue-600 font-semibold mt-1">{p.visits} visit{p.visits > 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
