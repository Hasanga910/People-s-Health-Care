import { useState, useEffect, useCallback } from "react";
import CashierLayout from "../../components/CashierLayout";

const API         = "http://localhost:5001/api";
const token       = () => sessionStorage.getItem("token");
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 20 20"
          fill={i <= rating ? "#F59E0B" : "none"}
          stroke={i <= rating ? "#F59E0B" : "#D1D5DB"}
          strokeWidth={1.5} className="w-3.5 h-3.5">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

export default function CashierDashboard() {
  const [bills,   setBills]   = useState([]);
  const [summary, setSummary] = useState({ unpaidCount: 0, unpaidAmount: 0, paidCount: 0, paidAmount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchBills = useCallback(async () => {
    try {
      // Send client timezone offset so backend calculates "today" correctly
      const tzOffset = -new Date().getTimezoneOffset(); // e.g. +330 for UTC+5:30
      const res  = await fetch(`${API}/bills?limit=1000&tzOffset=${tzOffset}`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        setBills(data.bills || []);
        setSummary(data.summary || {});
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  // Use backend-computed today's collections (timezone-correct)
  const todayPaidAmount = summary.todayCollected ?? 0;
  const unpaidBills     = bills.filter(b => b.paymentStatus === "unpaid");
  const notedBills      = unpaidBills.filter(b => b.hasNote);
  const outstandingAmt  = unpaidBills.reduce((s, b) => s + b.totalAmount, 0);

  const recentBills = bills.slice(0, 6);

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
            <p className="text-white/70 text-sm">Good day 👋</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem", color: "white" }}>
              Cashier Dashboard
            </h2>
            <p className="text-white/60 text-sm mt-1">
              <span className="text-amber-200 font-bold">LKR {todayPaidAmount.toLocaleString()}</span> collected today
              {unpaidBills.length > 0 && (
                <span className="ml-2 text-red-300 font-bold">
                  · {summary.unpaidCount} unpaid bill{summary.unpaidCount > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
          <div className="relative flex gap-3 flex-shrink-0">
            <a href="/cashier/billing"
              className="px-5 py-2.5 bg-white text-blue-900 rounded-xl text-sm font-semibold hover:bg-blue-50 transition shadow">
              💳 View Bills
            </a>
          </div>
        </div>

        {/* ── NOTE-FLAGGED BILLS ALERT — prominent highlight ── */}
        {notedBills.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 bg-amber-100 border-b border-amber-200">
              <span className="text-xl">📝</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-900">
                  {notedBills.length} Bill{notedBills.length > 1 ? "s" : ""} with Pharmacist Notes
                </p>
                <p className="text-xs text-amber-700 mt-0.5">These patients have special notes — please read before collecting payment</p>
              </div>
            </div>
            <div className="divide-y divide-amber-100">
              {notedBills.map(bill => (
                <div key={bill._id} className="flex items-start gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-xl bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xs flex-shrink-0">
                    {bill.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-800">{bill.patientName}</span>
                      <span className="text-xs text-gray-500">{bill.billNumber}</span>
                      <span className="text-xs font-mono text-gray-400">Rx: {bill.prescriptionRef}</span>
                    </div>
                    <div className="mt-1 bg-amber-100 rounded-lg px-3 py-1.5 text-xs text-amber-800">
                      📝 {bill.noteContent}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-red-600">LKR {bill.totalAmount.toLocaleString()}</div>
                    <a href="/cashier/billing"
                      className="text-xs text-amber-700 font-semibold hover:underline mt-0.5 block">
                      Collect →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Today's Collections", value: `LKR ${todayPaidAmount.toLocaleString()}`,    icon: "💸", color: "#01579B", bg: "#E3F2FD" },
            { label: "Unpaid Bills",         value: unpaidBills.length,                               icon: "⏳", color: "#B71C1C", bg: "#FFEBEE" },
            { label: "Outstanding Amount",   value: `LKR ${outstandingAmt.toLocaleString()}`,          icon: "🧾", color: "#1565C0", bg: "#E3F2FD" },
            { label: "Bills with Notes",     value: notedBills.length,                                icon: "📝", color: "#E65100", bg: "#FFF3E0" },
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

          {/* Recent bills */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-800">Recent Bills</h3>
                <p className="text-xs text-gray-400 mt-0.5">Latest pharmacy bills from dispensary</p>
              </div>
              <a href="/cashier/billing" className="text-sm font-medium text-blue-700 hover:underline">View All</a>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading bills…</div>
            ) : recentBills.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No bills yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentBills.map(bill => (
                  <div key={bill._id} className={`flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition ${bill.hasNote && bill.paymentStatus === "unpaid" ? "bg-amber-50/50" : ""}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: bill.paymentStatus === "paid" ? "linear-gradient(135deg, #01579B, #0277BD)" : "#9CA3AF" }}>
                      {bill.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">{bill.patientName}</span>
                        {bill.hasNote && bill.paymentStatus === "unpaid" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">📝 Note</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">{bill.billNumber} · {bill.prescriptionRef}</div>
                    </div>
                    <div className="text-sm font-bold flex-shrink-0" style={{ color: bill.paymentStatus === "paid" ? "#01579B" : "#B71C1C" }}>
                      LKR {bill.totalAmount.toLocaleString()}
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex-shrink-0 ${
                      bill.paymentStatus === "paid" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-red-100 text-red-600 border-red-200"
                    }`}>
                      {bill.paymentStatus === "paid" ? "✅ Paid" : "⏳ Unpaid"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Process Payment",        href: "/cashier/billing",  icon: "💳", color: "#01579B", bg: "#E3F2FD" },
                  { label: "View Unpaid Bills",       href: "/cashier/billing?filter=unpaid", icon: "⏳", color: "#B71C1C", bg: "#FFEBEE" },
                  { label: "Bills with Notes",        href: "/cashier/billing?filter=noted",  icon: "📝", color: "#E65100", bg: "#FFF3E0" },
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

            {/* Unpaid summary */}
            {unpaidBills.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <p className="text-sm font-bold text-red-800 mb-1">⏳ Outstanding</p>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.5rem", color: "#B71C1C" }}>
                  LKR {(summary.unpaidAmount || 0).toLocaleString()}
                </p>
                <p className="text-xs text-red-600 mt-1">{summary.unpaidCount} bill{summary.unpaidCount > 1 ? "s" : ""} pending collection</p>
                <a href="/cashier/billing"
                  className="mt-3 block text-center text-xs font-semibold py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition">
                  Collect Now →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </CashierLayout>
  );
}
