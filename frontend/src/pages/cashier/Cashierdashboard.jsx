import CashierLayout from "../../components/CashierLayout";

const RECENT_SALES = [
  { id: "SALE-2026-0045", patient: "Kamal Perera",      total: 1200, items: 2, time: "08:45 AM", paid: true  },
  { id: "SALE-2026-0044", patient: "Suresh Jayasinghe", total: 840,  items: 3, time: "10:50 AM", paid: true  },
  { id: "SALE-2026-0043", patient: "Kumari Wijesinghe", total: 448,  items: 2, time: "02:30 PM", paid: true  },
  { id: "SALE-2026-0042", patient: "Anura Dissanayake", total: 1863, items: 4, time: "04:00 PM", paid: false },
];

const RECENT_FEEDBACK = [
  { patient: "Nimal Fernando",  rating: 5, comment: "Excellent service, very professional staff.", time: "1 hr ago" },
  { patient: "Amali Jayasena",  rating: 4, comment: "Good experience overall, waiting time was a bit long.", time: "3 hrs ago" },
  { patient: "Ruwan Fernando",  rating: 5, comment: "Doctor was very thorough. Highly recommend.", time: "Yesterday" },
];

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 20 20" fill={i <= rating ? "#F59E0B" : "none"} stroke={i <= rating ? "#F59E0B" : "#D1D5DB"} strokeWidth={1.5} className="w-3.5 h-3.5">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

export default function CashierDashboard() {
  const todayRevenue  = RECENT_SALES.filter(s => s.paid).reduce((a,s) => a + s.total, 0);
  const unpaidCount   = RECENT_SALES.filter(s => !s.paid).length;
  const avgRating     = (RECENT_FEEDBACK.reduce((a,f) => a + f.rating, 0) / RECENT_FEEDBACK.length).toFixed(1);

  return (
    <CashierLayout activePage="Dashboard">
      <div className="p-6 space-y-6">

        {/* Welcome banner */}
        <div className="rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #01579B 60%, #0277BD 100%)" }}>
          <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10">
            <svg viewBox="0 0 200 200" fill="white"><circle cx="150" cy="100" r="90"/><circle cx="40" cy="40" r="50"/></svg>
          </div>
          <div className="relative">
            <p className="text-white/70 text-sm">Good Morning 👋</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem", color: "white" }}>
              Cashier Dashboard
            </h2>
            <p className="text-white/60 text-sm mt-1">
              <span className="text-blue-200 font-bold">LKR {todayRevenue.toLocaleString()}</span> collected today
              {unpaidCount > 0 && <span className="ml-2 text-red-300 font-bold">· {unpaidCount} unpaid bill{unpaidCount > 1 ? "s" : ""}</span>}
            </p>
          </div>
          <div className="relative flex gap-3 flex-shrink-0">
            <a href="/cashier/billing"
              className="px-5 py-2.5 bg-white text-green-900 rounded-xl text-sm font-semibold hover:bg-green-50 transition shadow">
              💳 View Bills
            </a>
            <a href="/cashier/feedback"
              className="px-5 py-2.5 bg-white/10 border border-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/20 transition">
              ⭐ Feedback
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Today's Collections", value: `LKR ${todayRevenue.toLocaleString()}`, icon: "💰", color: "#01579B", bg: "#E1F5FE" },
            { label: "Unpaid Bills",         value: unpaidCount,                            icon: "⏳", color: "#B71C1C", bg: "#FFEBEE" },
            { label: "Total Transactions",   value: RECENT_SALES.length,                   icon: "🧾", color: "#1565C0", bg: "#E3F2FD" },
            { label: "Avg. Rating Today",    value: `${avgRating} / 5`,                    icon: "⭐", color: "#37474F", bg: "#ECEFF1" },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: card.bg }}>
                {card.icon}
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.4rem", color: card.color }}>
                {card.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Recent sales — 2 cols */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-800">Today's Sales</h3>
                <p className="text-xs text-gray-400 mt-0.5">Billing transactions for today</p>
              </div>
              <a href="/cashier/billing" className="text-sm font-medium text-green-700 hover:underline">View All</a>
            </div>
            <div className="divide-y divide-gray-50">
              {RECENT_SALES.map(sale => (
                <div key={sale.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: sale.paid ? "linear-gradient(135deg, #01579B, #0277BD)" : "#9CA3AF" }}>
                    {sale.patient.split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{sale.patient}</div>
                    <div className="text-xs text-gray-400">{sale.id} · {sale.items} items · {sale.time}</div>
                  </div>
                  <div className="text-sm font-bold flex-shrink-0" style={{ color: sale.paid ? "#01579B" : "#B71C1C" }}>
                    LKR {sale.total.toLocaleString()}
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${
                    sale.paid ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-600 border-red-200"
                  }`}>
                    {sale.paid ? "✅ Paid" : "⏳ Unpaid"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-5">
            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Process Payment",  href: "/cashier/billing",  icon: "💳", color: "#01579B", bg: "#E1F5FE" },
                  { label: "View All Bills",   href: "/cashier/billing",  icon: "🧾", color: "#1565C0", bg: "#E3F2FD" },
                  { label: "Patient Feedback", href: "/cashier/feedback", icon: "⭐", color: "#37474F", bg: "#ECEFF1" },
                ].map(action => (
                  <a key={action.label} href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: action.bg }}>{action.icon}</div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">{action.label}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300 group-hover:text-gray-500">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Recent feedback */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Recent Feedback</h3>
                <a href="/cashier/feedback" className="text-xs font-medium text-green-700 hover:underline">View All</a>
              </div>
              <div className="divide-y divide-gray-50">
                {RECENT_FEEDBACK.map((fb, i) => (
                  <div key={i} className="px-5 py-3 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-800">{fb.patient}</span>
                      <Stars rating={fb.rating}/>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{fb.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">{fb.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CashierLayout>
  );
}