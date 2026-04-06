import DashboardLayout from "../components/DashboardLayout";

const dispensingQueue = [
  { rxId: "RX-20260214-001", patient: "Kamal Perera", patientId: "PHC-0042", time: "8:45 AM", items: 3, status: "Pending", priority: false },
  { rxId: "RX-20260214-002", patient: "Nimesha Silva", patientId: "PHC-0091", time: "9:10 AM", items: 1, status: "Pending", priority: false },
  { rxId: "RX-20260214-003", patient: "Ruwan Fernando", patientId: "PHC-0018", time: "9:35 AM", items: 4, status: "Processing", priority: true },
  { rxId: "RX-20260214-004", patient: "Dilani Bandara", patientId: "PHC-0054", time: "10:05 AM", items: 2, status: "Ready", priority: false },
];

const lowStockItems = [
  { name: "Metformin 500mg", category: "Antidiabetic", stock: 18, reorderLevel: 50, unit: "tabs" },
  { name: "Amlodipine 5mg", category: "Antihypertensive", stock: 24, reorderLevel: 60, unit: "tabs" },
  { name: "Amoxicillin 250mg Syrup", category: "Antibiotic", stock: 6, reorderLevel: 20, unit: "bottles" },
  { name: "Normal Saline 500ml", category: "IV Fluid", stock: 3, reorderLevel: 15, unit: "bags" },
];

const recentSales = [
  { rxId: "RX-20260213-009", patient: "Suresh Jayasinghe", total: "LKR 1,840", items: 3, time: "Yesterday, 3:20 PM" },
  { rxId: "RX-20260213-008", patient: "Kumari Wijesinghe", total: "LKR 560", items: 1, time: "Yesterday, 2:45 PM" },
  { rxId: "RX-20260213-007", patient: "Anura Dissanayake", total: "LKR 2,150", items: 4, time: "Yesterday, 1:30 PM" },
];

const statusBadge = {
  "Pending": "bg-amber-100 text-amber-700",
  "Processing": "bg-blue-100 text-blue-700",
  "Ready": "bg-emerald-100 text-emerald-700",
  "Dispensed": "bg-slate-100 text-slate-600",
};

export default function PharmacyDashboard() {
  return (
    <DashboardLayout role="pharmacy" pageTitle="Pharmacy Overview">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-3xl p-6 flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm mb-1">People's Health Care</p>
            <h2 className="text-xl font-black text-white">Pharmacy Management</h2>
            <p className="text-emerald-200 text-xs mt-1">
              {new Date().toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-white font-black text-3xl">4</p>
            <p className="text-emerald-200 text-xs">prescriptions in queue</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Queue", value: "4", sub: "awaiting dispensing", icon: "💊", color: "emerald" },
            { label: "Today's Sales", value: "LKR 12,840", sub: "18 prescriptions", icon: "💰", color: "blue" },
            { label: "Low Stock Alerts", value: "4", sub: "items need reorder", icon: "⚠️", color: "amber" },
            { label: "Total SKUs", value: "184", sub: "medicines tracked", icon: "📦", color: "slate" },
          ].map((s) => {
            const colors = {
              emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
              blue: "bg-blue-50 border-blue-100 text-blue-700",
              amber: "bg-amber-50 border-amber-100 text-amber-700",
              slate: "bg-slate-50 border-slate-200 text-slate-700",
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

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Dispensing Queue */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Dispensing Queue</h3>
                <p className="text-xs text-slate-400 mt-0.5">Prescriptions awaiting fulfilment</p>
              </div>
              <button className="text-xs font-semibold text-emerald-700 hover:underline">View All</button>
            </div>
            <div className="divide-y divide-slate-50">
              {dispensingQueue.map((rx) => (
                <div key={rx.rxId} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      💊
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 truncate">{rx.patient}</p>
                      {rx.priority && (
                        <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full flex-shrink-0">Priority</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{rx.patientId} · {rx.rxId}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{rx.items} item{rx.items > 1 ? "s" : ""} · Received {rx.time}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge[rx.status]}`}>
                      {rx.status}
                    </span>
                    <button className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl transition-all">
                      Dispense
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Low Stock + Quick Actions */}
          <div className="space-y-6">
            {/* Low Stock Alerts */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">Low Stock Alerts</h3>
                  <span className="text-xs bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded-full">4 items</span>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {lowStockItems.map((item) => (
                  <div key={item.name} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.category}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-red-600">{item.stock}</p>
                        <p className="text-xs text-slate-400">{item.unit} left</p>
                      </div>
                    </div>
                    {/* Stock bar */}
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${Math.min((item.stock / item.reorderLevel) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Reorder level: {item.reorderLevel} {item.unit}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                <button className="w-full text-xs font-bold text-red-600 hover:text-red-800 transition-colors text-center">
                  Notify Supplier for All Low-Stock Items →
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: "📦", label: "Add to Inventory", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
                  { icon: "🔍", label: "Search Medicine", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                  { icon: "📊", label: "Sales Report", color: "bg-slate-50 text-slate-700 hover:bg-slate-100" },
                  { icon: "🧾", label: "Generate Bill", color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
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
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Recent Transactions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest dispensed prescriptions</p>
            </div>
            <button className="text-xs font-semibold text-emerald-700 hover:underline">Sales Report</button>
          </div>
          <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {recentSales.map((sale) => (
              <div key={sale.rxId} className="px-6 py-5">
                <p className="text-xs font-mono text-slate-400">{sale.rxId}</p>
                <p className="text-base font-bold text-slate-800 mt-1">{sale.patient}</p>
                <p className="text-xs text-slate-400 mt-0.5">{sale.items} items · {sale.time}</p>
                <p className="text-lg font-black text-emerald-700 mt-3">{sale.total}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
