import PharmacyLayout from "../../components/PharmacyLayout";

const QUEUE = [
  { rxId: "RX-2026-0092", patient: "Nimesha Silva", age: 29, channeling: "019", time: "09:10 AM", medications: ["Amoxicillin 500mg × 21", "Paracetamol 500mg × 10"], status: "Pending", priority: false },
  { rxId: "RX-2026-0091", patient: "Ruwan Fernando", age: 47, channeling: "017", time: "09:35 AM", medications: ["Atorvastatin 10mg × 30", "Amlodipine 5mg × 30", "Aspirin 75mg × 30", "Ramipril 5mg × 30"], status: "Processing", priority: true },
  { rxId: "RX-2026-0090", patient: "Dilani Bandara", age: 38, channeling: "016", time: "10:05 AM", medications: ["Metformin 500mg × 60", "Glipizide 5mg × 30"], status: "Ready", priority: false },
  { rxId: "RX-2026-0089", patient: "Kamal Perera", age: 54, channeling: "012", time: "08:20 AM", medications: ["Metformin 500mg × 60", "Lisinopril 10mg × 30"], status: "Dispensed", priority: false },
];

const LOW_STOCK = [
  { name: "Metformin 500mg", category: "Antidiabetic", stock: 18, reorder: 50, unit: "tabs", critical: true },
  { name: "Amlodipine 5mg", category: "Antihypertensive", stock: 24, reorder: 60, unit: "tabs", critical: false },
  { name: "Amoxicillin 250mg Syrup", category: "Antibiotic", stock: 6, reorder: 20, unit: "bottles", critical: true },
  { name: "Normal Saline 500ml", category: "IV Fluid", stock: 3, reorder: 15, unit: "bags", critical: true },
];

const RECENT_SALES = [
  { rxId: "RX-2026-0088", patient: "Suresh Jayasinghe", total: 1840, items: 3, time: "Yesterday, 3:20 PM" },
  { rxId: "RX-2026-0087", patient: "Kumari Wijesinghe", total: 560, items: 1, time: "Yesterday, 2:45 PM" },
  { rxId: "RX-2026-0086", patient: "Anura Dissanayake", total: 2150, items: 4, time: "Yesterday, 1:30 PM" },
];

const STATUS_CONFIG = {
  Pending:    { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-200",  bar: "#fbbf24", icon: "⏳" },
  Processing: { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200",   bar: "#60a5fa", icon: "🔄" },
  Ready:      { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  bar: "#4ade80", icon: "✅" },
  Dispensed:  { bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-200",   bar: "#9ca3af", icon: "📦" },
};

export default function PharmacyDashboard() {
  const pendingCount = QUEUE.filter(q => q.status === "Pending" || q.status === "Processing").length;
  const criticalStock = LOW_STOCK.filter(s => s.critical).length;

  return (
    <PharmacyLayout activePage="Dashboard">
      <div className="p-6 space-y-6">

        {/* Welcome banner */}
        <div
          className="rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #2E7D32 60%, #00897B 100%)" }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10">
            <svg viewBox="0 0 200 200" fill="white"><circle cx="150" cy="100" r="90" /><circle cx="40" cy="40" r="50" /></svg>
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm">Good Morning 👋</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem", color: "white" }}>
              Pharmacy Management
            </h2>
            <p className="text-white/60 text-sm mt-1">
              <span className="text-green-200 font-bold">{pendingCount} prescriptions</span> in queue
              {criticalStock > 0 && <span className="ml-2 text-red-300 font-bold">· {criticalStock} critical stock alerts</span>}
            </p>
          </div>
          <div className="relative flex gap-3 flex-shrink-0">
            <a href="/pharmacy/queue"
              className="px-5 py-2.5 bg-white text-green-900 rounded-xl text-sm font-semibold hover:bg-green-50 transition shadow">
              💊 View Queue
            </a>
            <a href="/pharmacy/inventory"
              className="px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition">
              📦 Inventory
            </a>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "In Queue", value: QUEUE.filter(q => q.status !== "Dispensed").length, icon: "💊", color: "#2E7D32", bg: "#E8F5E9" },
            { label: "Today's Revenue", value: "LKR 12,840", icon: "💰", color: "#1565C0", bg: "#E3F2FD" },
            { label: "Low Stock Alerts", value: LOW_STOCK.length, icon: "⚠️", color: "#E65100", bg: "#FFF3E0" },
            { label: "Total SKUs Tracked", value: "184", icon: "📦", color: "#37474F", bg: "#ECEFF1" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: card.bg }}>
                {card.icon}
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.6rem", color: card.color }}>
                {card.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Dispensing queue — 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-800">Dispensing Queue</h3>
                <p className="text-xs text-gray-400 mt-0.5">Prescriptions from today's consultations</p>
              </div>
              <a href="/pharmacy/queue" className="text-sm font-medium text-green-700 hover:underline">View All</a>
            </div>

            <div className="divide-y divide-gray-50">
              {QUEUE.map((rx) => {
                const style = STATUS_CONFIG[rx.status];
                return (
                  <div key={rx.rxId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                    <div className="w-1 h-12 rounded-full flex-shrink-0" style={{ background: style.bar }} />

                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "#E8F5E9", color: "#2E7D32" }}>
                      {rx.channeling}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-semibold text-gray-800">{rx.patient}</span>
                        {rx.priority && (
                          <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-200">🚨 Priority</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {rx.medications.slice(0, 2).join(", ")}
                        {rx.medications.length > 2 && ` +${rx.medications.length - 2} more`}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{rx.time} · {rx.rxId}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${style.bg} ${style.text} ${style.border}`}>
                        <span>{style.icon}</span> {rx.status}
                      </span>
                      {rx.status === "Ready" && (
                        <button className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition"
                          style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
                          Dispense
                        </button>
                      )}
                      {rx.status === "Pending" && (
                        <button className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition"
                          style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                          Prepare
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-5">
            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "View Dispensing Queue", href: "/pharmacy/queue", icon: "📋", color: "#2E7D32", bg: "#E8F5E9" },
                  { label: "Check Inventory", href: "/pharmacy/inventory", icon: "📦", color: "#1565C0", bg: "#E3F2FD" },
                  { label: "Sales & Billing", href: "/pharmacy/billing", icon: "💳", color: "#37474F", bg: "#ECEFF1" },
                  { label: "Reorder Report", href: "/pharmacy/inventory", icon: "🔄", color: "#E65100", bg: "#FFF3E0" },
                ].map((action) => (
                  <a key={action.label} href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: action.bg }}>
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">{action.label}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300 group-hover:text-gray-500">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Low stock alert */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100">
                <h3 className="font-semibold text-gray-800 text-sm">Low Stock Alerts</h3>
                <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                  {criticalStock} critical
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {LOW_STOCK.map((item) => {
                  const pct = Math.round((item.stock / item.reorder) * 100);
                  return (
                    <div key={item.name} className="px-5 py-3 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {item.critical && <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />}
                          <span className="text-sm font-medium text-gray-800 truncate">{item.name}</span>
                        </div>
                        <span className={`text-xs font-bold flex-shrink-0 ml-2 ${item.critical ? "text-red-600" : "text-amber-600"}`}>
                          {item.stock} {item.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${item.critical ? "bg-red-400" : "bg-amber-400"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Reorder at {item.reorder} {item.unit}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent sales */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-800">Recent Sales</h3>
              <p className="text-xs text-gray-400 mt-0.5">Yesterday's completed dispensals</p>
            </div>
            <a href="/pharmacy/billing" className="text-sm font-medium text-green-700 hover:underline">View All Sales</a>
          </div>
          <div className="divide-y divide-gray-50">
            {RECENT_SALES.map((sale) => (
              <div key={sale.rxId} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
                  💊
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800">{sale.patient}</div>
                  <div className="text-xs text-gray-400">{sale.rxId} · {sale.items} items · {sale.time}</div>
                </div>
                <div className="text-sm font-bold text-green-700 flex-shrink-0">LKR {sale.total.toLocaleString()}</div>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full border border-green-200 flex-shrink-0">
                  ✅ Dispensed
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PharmacyLayout>
  );
}
