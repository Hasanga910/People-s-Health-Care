import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

const recentBills = [
  {
    billId: "BILL-2026-0098", patientId: "PHC-0042", patient: "Kamal Perera",
    date: "Feb 14, 2026", consultation: 600, medicines: 1240, labTests: 1800,
    total: 3640, status: "Paid", paymentMethod: "Cash",
  },
  {
    billId: "BILL-2026-0097", patientId: "PHC-0091", patient: "Nimesha Silva",
    date: "Feb 14, 2026", consultation: 600, medicines: 560, labTests: 0,
    total: 1160, status: "Unpaid", paymentMethod: null,
  },
  {
    billId: "BILL-2026-0096", patientId: "PHC-0018", patient: "Ruwan Fernando",
    date: "Feb 13, 2026", consultation: 600, medicines: 2080, labTests: 2500,
    total: 5180, status: "Paid", paymentMethod: "Cash",
  },
  {
    billId: "BILL-2026-0095", patientId: "PHC-0054", patient: "Dilani Bandara",
    date: "Feb 13, 2026", consultation: 600, medicines: 340, labTests: 1200,
    total: 2140, status: "Unpaid", paymentMethod: null,
  },
];

const labFees = [
  { test: "Full Blood Count (FBC)", fee: 800 },
  { test: "Blood Glucose", fee: 400 },
  { test: "Lipid Profile", fee: 1200 },
  { test: "Urine Analysis", fee: 500 },
  { test: "ECG", fee: 1500 },
  { test: "HbA1c", fee: 1800 },
  { test: "Serum Creatinine", fee: 600 },
  { test: "Thyroid Function (TSH)", fee: 2200 },
];

const statusBadge = {
  "Paid": "bg-emerald-100 text-emerald-700",
  "Unpaid": "bg-red-100 text-red-600",
};

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [medicineTotal, setMedicineTotal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const toggleTest = (test) => {
    setSelectedTests((prev) =>
      prev.includes(test.test) ? prev.filter((t) => t !== test.test) : [...prev, test.test]
    );
  };

  const labTotal = labFees.filter((f) => selectedTests.includes(f.test)).reduce((s, f) => s + f.fee, 0);
  const medTotal = parseFloat(medicineTotal) || 0;
  const grandTotal = 600 + medTotal + labTotal;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    }, 1500);
  };

  const filteredBills = recentBills.filter((b) =>
    b.patient.toLowerCase().includes(search.toLowerCase()) ||
    b.billId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="pharmacy" pageTitle="Billing & Payments">
      <div className="space-y-6">
        {/* Success Toast */}
        {generated && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-bold text-sm">Bill Generated Successfully!</p>
              <p className="text-xs text-emerald-100">Total: LKR {grandTotal.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Revenue Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Today's Revenue", value: "LKR 38,240", icon: "💰", color: "emerald" },
            { label: "Paid Bills", value: "14", icon: "✅", color: "blue" },
            { label: "Unpaid Bills", value: "3", icon: "🧾", color: "amber" },
            { label: "This Month", value: "LKR 284,600", icon: "📊", color: "violet" },
          ].map((s) => {
            const colors = {
              emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
              blue: "bg-blue-50 border-blue-100 text-blue-700",
              amber: "bg-amber-50 border-amber-100 text-amber-700",
              violet: "bg-violet-50 border-violet-100 text-violet-700",
            };
            return (
              <div key={s.label} className={`rounded-2xl p-5 border ${colors[s.color]}`}>
                <span className="text-2xl block mb-2">{s.icon}</span>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-xs font-semibold mt-0.5 opacity-80">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Generate Bill Panel */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">Generate Bill</h3>
                <p className="text-xs text-slate-400 mt-0.5">Create a new bill for a patient visit</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Patient Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Patient ID / Name</label>
                  <input
                    type="text"
                    placeholder="Enter Patient ID or search name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Bill Date</label>
                  <input
                    type="date"
                    defaultValue="2026-02-14"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                {/* Charges */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Charge Breakdown</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Doctor Consultation</span>
                    <span className="text-sm font-bold text-slate-800">LKR 600.00</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-600">Medicines</span>
                    </div>
                    <input
                      type="number"
                      value={medicineTotal}
                      onChange={(e) => setMedicineTotal(e.target.value)}
                      placeholder="Enter total (LKR)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-slate-600 mb-2">Laboratory Tests</p>
                    <div className="space-y-1.5">
                      {labFees.map((lab) => (
                        <label
                          key={lab.test}
                          className="flex items-center justify-between cursor-pointer hover:bg-white rounded-xl px-2 py-1 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedTests.includes(lab.test)}
                              onChange={() => toggleTest(lab)}
                              className="accent-blue-900 w-3.5 h-3.5"
                            />
                            <span className="text-xs text-slate-600">{lab.test}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700">LKR {lab.fee.toLocaleString()}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">Grand Total</span>
                    <span className="text-xl font-black text-blue-900">
                      LKR {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating…
                    </>
                  ) : (
                    "🧾 Generate & Print Bill"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Bills */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-full">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800">Recent Bills</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{recentBills.length} records</p>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search bills…"
                    className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all"
                  />
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {filteredBills.map((bill) => (
                  <div key={bill.billId} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-slate-800">{bill.patient}</p>
                          <span className="text-xs text-slate-400">({bill.patientId})</span>
                        </div>
                        <p className="text-xs font-mono text-slate-400">{bill.billId} · {bill.date}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span>Consultation: LKR {bill.consultation.toLocaleString()}</span>
                          {bill.medicines > 0 && <span>Medicines: LKR {bill.medicines.toLocaleString()}</span>}
                          {bill.labTests > 0 && <span>Lab: LKR {bill.labTests.toLocaleString()}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge[bill.status]}`}>
                          {bill.status}
                        </span>
                        <p className="text-lg font-black text-slate-800">LKR {bill.total.toLocaleString()}</p>
                        {bill.status === "Unpaid" && (
                          <button className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-xl transition-all">
                            Mark Paid
                          </button>
                        )}
                        {bill.status === "Paid" && (
                          <span className="text-xs text-slate-400">Cash</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
