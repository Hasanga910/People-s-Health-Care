import { useState } from "react";
import PharmacyLayout from "../../components/PharmacyLayout";

const INVENTORY = [
  { id: "MED-001", name: "Metformin 500mg", category: "Antidiabetic", stock: 18, reorder: 50, unit: "tablets", costPrice: 8, sellPrice: 12, expiry: "Dec 2026", supplier: "Hemas Pharmaceuticals", location: "Shelf A2", status: "Low Stock" },
  { id: "MED-002", name: "Amlodipine 5mg", category: "Antihypertensive", stock: 24, reorder: 60, unit: "tablets", costPrice: 9, sellPrice: 14, expiry: "Aug 2026", supplier: "Asiri Pharma", location: "Shelf A3", status: "Low Stock" },
  { id: "MED-003", name: "Amoxicillin 500mg Capsules", category: "Antibiotic", stock: 144, reorder: 100, unit: "capsules", costPrice: 12, sellPrice: 18, expiry: "Jun 2026", supplier: "GlaxoSmithKline", location: "Shelf B1", status: "In Stock" },
  { id: "MED-004", name: "Amoxicillin 250mg Syrup", category: "Antibiotic", stock: 6, reorder: 20, unit: "bottles", costPrice: 280, sellPrice: 420, expiry: "Apr 2026", supplier: "GlaxoSmithKline", location: "Shelf B2", status: "Critical" },
  { id: "MED-005", name: "Lisinopril 10mg", category: "Antihypertensive", stock: 88, reorder: 60, unit: "tablets", costPrice: 14, sellPrice: 20, expiry: "Oct 2026", supplier: "Hemas Pharmaceuticals", location: "Shelf A4", status: "In Stock" },
  { id: "MED-006", name: "Normal Saline 500ml", category: "IV Fluid", stock: 3, reorder: 15, unit: "bags", costPrice: 180, sellPrice: 260, expiry: "Sep 2026", supplier: "Baxter Lanka", location: "Cold Storage", status: "Critical" },
  { id: "MED-007", name: "Paracetamol 500mg", category: "Analgesic", stock: 320, reorder: 100, unit: "tablets", costPrice: 4, sellPrice: 7, expiry: "Nov 2026", supplier: "Local Generic", location: "Shelf C1", status: "In Stock" },
  { id: "MED-008", name: "Omeprazole 20mg", category: "Antacid", stock: 72, reorder: 60, unit: "capsules", costPrice: 10, sellPrice: 15, expiry: "Jul 2026", supplier: "Asiri Pharma", location: "Shelf C2", status: "In Stock" },
  { id: "MED-009", name: "Atorvastatin 10mg", category: "Statin", stock: 55, reorder: 60, unit: "tablets", costPrice: 12, sellPrice: 18, expiry: "Mar 2027", supplier: "Hemas Pharmaceuticals", location: "Shelf A5", status: "In Stock" },
  { id: "MED-010", name: "Vitamin D3 1000 IU", category: "Supplement", stock: 42, reorder: 50, unit: "tablets", costPrice: 5, sellPrice: 9, expiry: "Jan 2027", supplier: "Local Generic", location: "Shelf D1", status: "Low Stock" },
];

const CATEGORIES = ["All", "Antidiabetic", "Antihypertensive", "Antibiotic", "IV Fluid", "Analgesic", "Antacid", "Statin", "Supplement"];

const STATUS_CONFIG = {
  "In Stock": { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", dot: "bg-green-400" },
  "Low Stock": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
  "Critical":  { bg: "bg-red-100",   text: "text-red-600",   border: "border-red-200",   dot: "bg-red-500" },
  "Out of Stock": { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" },
};

function AddStockModal({ item, onClose }) {
  const [qty, setQty] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [expiry, setExpiry] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D2137, #2E7D32)" }}>
          <div>
            <p className="text-white/60 text-xs">Stock Management</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              {item ? "Add Stock" : "Add New Medicine"}
            </h3>
            {item && <p className="text-white/60 text-xs mt-0.5">{item.name}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {item && (
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-500">{item.category} · Current stock: <span className="font-semibold text-amber-600">{item.stock} {item.unit}</span></p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Quantity to Add ({item?.unit || "units"})
            </label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)}
              placeholder="e.g. 100"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition"
              style={{ "--tw-ring-color": "#2E7D32" }} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Batch Number</label>
            <input type="text" value={batchNo} onChange={e => setBatchNo(e.target.value)}
              placeholder="e.g. BT-2026-0042"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Expiry Date</label>
            <input type="month" value={expiry} onChange={e => setExpiry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition" />
          </div>

          {qty && item && (
            <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
              ✅ New stock: <strong>{item.stock + parseInt(qty || 0)} {item.unit}</strong> (was {item.stock})
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
              Add Stock
            </button>
            <button onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PharmacyInventory() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [addStockItem, setAddStockItem] = useState(null);
  const [addNew, setAddNew] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const criticalCount = INVENTORY.filter(i => i.status === "Critical").length;
  const lowCount = INVENTORY.filter(i => i.status === "Low Stock").length;

  const filtered = INVENTORY.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || item.category === category;
    const matchStatus = statusFilter === "All" || item.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <PharmacyLayout activePage="Inventory">
      {(addStockItem || addNew) && (
        <AddStockModal item={addStockItem} onClose={() => { setAddStockItem(null); setAddNew(false); }} />
      )}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Medicine Inventory
            </h1>
            <p className="text-sm text-gray-400 mt-1">Track and manage pharmacy stock levels</p>
          </div>
          <button onClick={() => setAddNew(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Medicine
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total SKUs", value: INVENTORY.length, color: "#2E7D32", bg: "#E8F5E9" },
            { label: "In Stock", value: INVENTORY.filter(i => i.status === "In Stock").length, color: "#00897B", bg: "#E0F2F1" },
            { label: "Low Stock", value: lowCount, color: "#E65100", bg: "#FFF3E0" },
            { label: "Critical", value: criticalCount, color: "#B71C1C", bg: "#FFEBEE" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Critical alert */}
        {criticalCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">🚨</span>
            <div>
              <p className="text-sm font-semibold text-red-800">Critical Stock Alert</p>
              <p className="text-xs text-red-700 mt-1">
                {INVENTORY.filter(i => i.status === "Critical").map(i => i.name).join(", ")} — stock is critically low. Place reorder immediately.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-48 relative">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input type="text" placeholder="Search medicine or ID..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 transition"
                style={{ "--tw-ring-color": "#2E7D32" }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["All", "In Stock", "Low Stock", "Critical"].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                    statusFilter === s ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={statusFilter === s ? { background: "linear-gradient(135deg, #2E7D32, #00897B)" } : {}}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  category === c ? "bg-green-100 text-green-800 font-semibold" : "text-gray-500 hover:bg-gray-100"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Medicine</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Category</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Stock</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Price</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Expiry</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(item => {
                  const style = STATUS_CONFIG[item.status];
                  const pct = Math.min(Math.round((item.stock / (item.reorder * 1.5)) * 100), 100);
                  const isExpanded = expandedId === item.id;

                  return (
                    <>
                      <tr key={item.id} className="hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                            <div>
                              <div className="text-sm font-semibold text-gray-800">{item.name}</div>
                              <div className="text-xs text-gray-400">{item.id} · {item.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{item.category}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-sm font-semibold text-gray-800">{item.stock} <span className="text-xs text-gray-400 font-normal">{item.unit}</span></div>
                          <div className="w-20 bg-gray-100 rounded-full h-1.5 mt-1">
                            <div className={`h-1.5 rounded-full ${item.status === "Critical" ? "bg-red-400" : item.status === "Low Stock" ? "bg-amber-400" : "bg-green-400"}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-xs text-gray-500">Cost: LKR {item.costPrice}</div>
                          <div className="text-sm font-semibold text-green-700">Sell: LKR {item.sellPrice}</div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{item.expiry}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={e => { e.stopPropagation(); setAddStockItem(item); }}
                            className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition hover:opacity-90"
                            style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
                            + Stock
                          </button>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isExpanded && (
                        <tr key={`${item.id}-expanded`} className="bg-green-50/50">
                          <td colSpan={7} className="px-5 py-4 border-t border-green-100">
                            <div className="flex flex-wrap gap-6 text-sm">
                              <div><span className="text-xs text-gray-400 block">Supplier</span><span className="font-medium text-gray-700">{item.supplier}</span></div>
                              <div><span className="text-xs text-gray-400 block">Reorder Level</span><span className="font-medium text-gray-700">{item.reorder} {item.unit}</span></div>
                              <div><span className="text-xs text-gray-400 block">Location</span><span className="font-medium text-gray-700">{item.location}</span></div>
                              <div><span className="text-xs text-gray-400 block">Margin</span><span className="font-medium text-green-700">LKR {item.sellPrice - item.costPrice} / {item.unit.replace("s","")}</span></div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📦</div>
              <div className="text-gray-500 font-medium">No medicines found</div>
            </div>
          )}
        </div>
      </div>
    </PharmacyLayout>
  );
}
