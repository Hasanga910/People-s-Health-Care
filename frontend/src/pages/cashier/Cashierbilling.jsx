import { useState } from "react";
import CashierLayout from "../../components/CashierLayout";

const SALES = [
  {
    id: "SALE-2026-0045", rxId: "RX-2026-0089", patient: "Kamal Perera", age: 54, channeling: "012",
    date: "15 Feb 2026", time: "08:45 AM",
    items: [
      { name: "Metformin 500mg",  qty: 60, unit: "tablets", unitPrice: 12, total: 720 },
      { name: "Lisinopril 10mg",  qty: 30, unit: "tablets", unitPrice: 16, total: 480 },
    ],
    subtotal: 1200, discount: 0, total: 1200, paid: true, method: "Cash",
  },
  {
    id: "SALE-2026-0044", rxId: "RX-2026-0088", patient: "Suresh Jayasinghe", age: 52, channeling: "015",
    date: "15 Feb 2026", time: "10:50 AM",
    items: [
      { name: "Atorvastatin 10mg", qty: 30, unit: "tablets", unitPrice: 14, total: 420 },
      { name: "Amlodipine 5mg",    qty: 30, unit: "tablets", unitPrice: 12, total: 360 },
      { name: "Aspirin 75mg",      qty: 30, unit: "tablets", unitPrice: 6,  total: 180 },
    ],
    subtotal: 960, discount: 120, total: 840, paid: true, method: "Card",
  },
  {
    id: "SALE-2026-0043", rxId: "RX-2026-0087", patient: "Kumari Wijesinghe", age: 35, channeling: "014",
    date: "14 Feb 2026", time: "02:30 PM",
    items: [
      { name: "Amoxicillin 500mg",  qty: 21, unit: "capsules", unitPrice: 18, total: 378 },
      { name: "Paracetamol 500mg",  qty: 10, unit: "tablets",  unitPrice: 7,  total: 70  },
    ],
    subtotal: 448, discount: 0, total: 448, paid: true, method: "Cash",
  },
  {
    id: "SALE-2026-0042", rxId: "RX-2026-0086", patient: "Anura Dissanayake", age: 61, channeling: "011",
    date: "14 Feb 2026", time: "04:00 PM",
    items: [
      { name: "Metformin 500mg",    qty: 60, unit: "tablets",  unitPrice: 12, total: 720 },
      { name: "Omeprazole 20mg",    qty: 30, unit: "capsules", unitPrice: 15, total: 450 },
      { name: "Vitamin D3 1000 IU", qty: 60, unit: "tablets",  unitPrice: 9,  total: 540 },
      { name: "Amlodipine 5mg",     qty: 30, unit: "tablets",  unitPrice: 12, total: 360 },
    ],
    subtotal: 2070, discount: 207, total: 1863, paid: false, method: "—",
  },
  {
    id: "SALE-2026-0041", rxId: "RX-2026-0085", patient: "Priya Gamage", age: 42, channeling: "013",
    date: "13 Feb 2026", time: "11:15 AM",
    items: [
      { name: "Lisinopril 10mg", qty: 30, unit: "tablets", unitPrice: 16, total: 480 },
    ],
    subtotal: 480, discount: 0, total: 480, paid: true, method: "Cash",
  },
];

function ReceiptModal({ sale, onClose, onMarkPaid }) {
  if (!sale) return null;
  const [method, setMethod] = useState("Cash");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D2137, #2E7D32)" }}>
          <div>
            <p className="text-white/60 text-xs">Receipt</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{sale.id}</h3>
            <p className="text-white/60 text-xs mt-0.5">{sale.date} · {sale.time}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="text-center border-b border-dashed border-gray-200 pb-4">
            <h3 className="font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>People's Health Care</h3>
            <p className="text-xs text-gray-500">Galle Road, Matara · 0777 883 343</p>
            <p className="text-xs text-gray-500 mt-1">Cashier: PHC Cashier Staff</p>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Bill To</p>
              <p className="font-semibold text-gray-800">{sale.patient}</p>
              <p className="text-xs text-gray-500">Age {sale.age} · Ch. #{sale.channeling}</p>
              <p className="text-xs font-mono text-gray-400 mt-1">Rx: {sale.rxId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Date</p>
              <p className="text-sm text-gray-700">{sale.date}</p>
              <p className="text-xs text-gray-500">{sale.time}</p>
              <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${sale.paid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {sale.paid ? "✅ PAID" : "⏳ UNPAID"}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400">Item</th>
                <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-400">Qty</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">Price</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">Total</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {sale.items.map(item => (
                  <tr key={item.name}>
                    <td className="px-4 py-3"><div className="text-sm font-medium text-gray-800">{item.name}</div><div className="text-xs text-gray-400">{item.unit}</div></td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">{item.qty}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">LKR {item.unitPrice}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">LKR {item.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>LKR {sale.subtotal.toLocaleString()}</span></div>
            {sale.discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>- LKR {sale.discount.toLocaleString()}</span></div>}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base text-gray-800">
              <span>Total</span><span style={{ color: "#2E7D32" }}>LKR {sale.total.toLocaleString()}</span>
            </div>
            {sale.paid && <div className="text-xs text-gray-400 text-right">Payment: {sale.method}</div>}
          </div>
          {!sale.paid && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Method</label>
                <div className="flex gap-2">
                  {["Cash", "Card", "Online"].map(m => (
                    <label key={m} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition text-sm font-medium ${method === m ? "border-green-400 bg-green-50 text-green-800" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="accent-green-600"/>
                      {m === "Cash" ? "💵" : m === "Card" ? "💳" : "📱"} {m}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={() => { onMarkPaid(sale.id, method); onClose(); }}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
                💳 Collect Payment — LKR {sale.total.toLocaleString()}
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/></svg>
              Print Receipt
            </button>
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CashierBilling() {
  const [sales, setSales]           = useState(SALES);
  const [selectedSale, setSelected] = useState(null);
  const [filter, setFilter]         = useState("All");
  const [search, setSearch]         = useState("");

  const handleMarkPaid = (id, method) => {
    setSales(prev => prev.map(s => s.id === id ? { ...s, paid: true, method } : s));
  };

  const totalRevenue  = sales.filter(s => s.paid).reduce((a,s) => a + s.total, 0);
  const unpaidTotal   = sales.filter(s => !s.paid).reduce((a,s) => a + s.total, 0);
  const todaySales    = sales.filter(s => s.date === "15 Feb 2026");
  const todayRevenue  = todaySales.filter(s => s.paid).reduce((a,s) => a + s.total, 0);

  const filtered = sales.filter(s => {
    const matchFilter = filter === "All" || (filter === "Paid" ? s.paid : !s.paid);
    const matchSearch = s.patient.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) || s.rxId.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // pass the live sale (may have been updated to paid)
  const selectedLive = selectedSale ? sales.find(s => s.id === selectedSale.id) || null : null;

  return (
    <CashierLayout activePage="Sales & Billing">
      {selectedLive && <ReceiptModal sale={selectedLive} onClose={() => setSelected(null)} onMarkPaid={handleMarkPaid}/>}

      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Sales & Billing</h1>
          <p className="text-sm text-gray-400 mt-1">Collect payments and manage patient bills</p>
        </div>

        {/* Summary */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Today's Collections", value: `LKR ${todayRevenue.toLocaleString()}`,  sub: `${todaySales.filter(s=>s.paid).length} sales`,        icon: "💰", color: "#2E7D32", bg: "#E8F5E9" },
            { label: "Total Revenue",        value: `LKR ${totalRevenue.toLocaleString()}`,  sub: "All time paid",                                         icon: "📈", color: "#1565C0", bg: "#E3F2FD" },
            { label: "Outstanding",          value: `LKR ${unpaidTotal.toLocaleString()}`,   sub: `${sales.filter(s=>!s.paid).length} unpaid`,             icon: "⏳", color: "#B71C1C", bg: "#FFEBEE" },
            { label: "Total Transactions",   value: sales.length,                            sub: "All records",                                           icon: "🧾", color: "#37474F", bg: "#ECEFF1" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ background: s.bg }}>{s.icon}</div>
                <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              </div>
              <div className="font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color, fontSize: "1.1rem" }}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Unpaid alert */}
        {sales.some(s => !s.paid) && (
          <div className="bg-green-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Outstanding Payments</p>
              <p className="text-xs text-amber-700 mt-1">
                {sales.filter(s=>!s.paid).length} bill(s) pending — <strong>LKR {unpaidTotal.toLocaleString()}</strong> to collect.
              </p>
            </div>
            <button onClick={() => setFilter("Unpaid")}
              className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-xl bg-amber-700 text-white hover:bg-amber-800 transition">
              View Unpaid
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48 relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input type="text" placeholder="Search patient, sale ID, or Rx..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"/>
          </div>
          <div className="flex gap-2">
            {["All","Paid","Unpaid"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === f ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                style={filter === f ? { background: "linear-gradient(135deg, #2E7D32, #00897B)" } : {}}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Sales list */}
        <div className="space-y-3">
          {filtered.map(sale => (
            <div key={sale.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden ${!sale.paid ? "border-amber-100" : "border-gray-100"}`}>
              <div className="flex items-center gap-4 px-6 py-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: sale.paid ? "linear-gradient(135deg, #2E7D32, #00897B)" : "#9CA3AF" }}>
                  {sale.patient.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-gray-800">{sale.patient}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Age {sale.age}</span>
                    <span className="font-mono text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Ch. #{sale.channeling}</span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">{sale.items.map(i=>i.name).join(" · ")}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{sale.date} · {sale.time} · {sale.id}</div>
                </div>
                <div className="text-right flex-shrink-0 mr-4">
                  <div className="text-base font-bold" style={{ color: sale.paid ? "#2E7D32" : "#B71C1C" }}>
                    LKR {sale.total.toLocaleString()}
                  </div>
                  {sale.discount > 0 && <div className="text-xs text-green-600">- LKR {sale.discount.toLocaleString()} disc.</div>}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${sale.paid ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-green-700 border-amber-200"}`}>
                    {sale.paid ? "✅ Paid" : "⏳ Unpaid"}
                  </span>
                  <button onClick={() => setSelected(sale)} className="text-xs font-semibold text-green-700 hover:underline">
                    {sale.paid ? "View Receipt →" : "Collect Payment →"}
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-50 px-6 py-3 bg-gray-50 flex flex-wrap gap-3">
                {sale.items.map(item => (
                  <span key={item.name} className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-gray-300"/>
                    {item.name} × {item.qty}
                  </span>
                ))}
                <span className="ml-auto text-xs text-gray-400">{sale.items.length} items</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">🧾</div>
              <div className="text-gray-500 font-medium">No sales records found</div>
            </div>
          )}
        </div>
      </div>
    </CashierLayout>
  );
}