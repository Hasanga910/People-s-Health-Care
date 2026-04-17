import { useState, useEffect, useCallback } from "react";
import CashierLayout from "../../components/CashierLayout";

const API   = "http://localhost:5001/api";
const token = () => sessionStorage.getItem("token");
const authH = () => ({ Authorization: `Bearer ${token()}` });
const jsonH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token()}` });

function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-2xl text-white text-sm font-medium shadow-2xl
      ${type === "success" ? "bg-emerald-600" : "bg-red-500"}`}
      style={{ animation: "slideIn .3s ease" }}>
      {type === "success" ? "✅" : "❌"} {msg}
    </div>
  );
}

function BillModal({ bill, onClose, onPaid, onSent, onLabNotified }) {
  const [loading,     setLoading]     = useState(false);
  const [sending,     setSending]     = useState(false);
  const [notifying,   setNotifying]   = useState(false);
  const [error,       setError]       = useState("");

  const DOCTOR_CHARGE  = bill.doctorCharge ?? 1000;
  const drugTotal      = (bill.lines    || []).reduce((s, l) => s + l.lineTotal, 0);
  const labTotal       = (bill.labLines || []).reduce((s, l) => s + l.price,     0);
  const grandTotal     = drugTotal + labTotal + DOCTOR_CHARGE;
  const isPaid         = bill.paymentStatus === "paid";
  const isSent         = bill.sentToPatient === true;
  const hasLabs        = bill.hasLabTests && (bill.labLines || []).length > 0;
  const isLabNotified  = bill.labNotified === true;

  const handlePrint = () => {
    const printContent = `<!DOCTYPE html><html><head><title>Receipt - ${bill.billNumber}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:13px;color:#111;padding:24px;max-width:480px;margin:0 auto}
.clinic-name{font-size:17px;font-weight:700;text-align:center}.clinic-sub{font-size:11px;color:#666;text-align:center;margin-top:2px;margin-bottom:12px}
.divider{border-top:1px dashed #ccc;margin:10px 0}.row{display:flex;justify-content:space-between;margin-bottom:4px}
.label{color:#888;font-size:11px;margin-bottom:2px}.bold{font-weight:700}
.section-title{font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.05em;margin:10px 0 5px}
table{width:100%;border-collapse:collapse;margin-bottom:6px}th{font-size:10px;font-weight:600;color:#888;text-align:left;padding:4px 6px;border-bottom:1px solid #eee}
th.right{text-align:right}th.center{text-align:center}td{font-size:12px;padding:5px 6px;border-bottom:1px solid #f5f5f5}td.right{text-align:right}td.center{text-align:center}
.totals{background:#f9f9f9;border-radius:6px;padding:10px;margin-top:10px}.total-row{display:flex;justify-content:space-between;margin-bottom:5px;font-size:12px}
.total-row.main{font-size:14px;font-weight:700;border-top:1px solid #ddd;padding-top:6px;margin-top:4px;color:#1a6b2a}
.badge{display:inline-block;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700}.paid-badge{background:#dcfce7;color:#15803d}
.footer{text-align:center;font-size:11px;color:#999;margin-top:18px}
.special-note{border:1.5px solid #b91c1c;border-radius:5px;padding:10px 12px;margin-top:12px;background:#fff5f5}
.special-note-header{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.special-note-title{font-size:11px;font-weight:700;color:#b91c1c;text-transform:uppercase;letter-spacing:.06em}
.special-note-body{font-size:11px;color:#7f1d1d;line-height:1.55;margin-bottom:8px}
.special-note table{margin-top:6px;margin-bottom:0}
.special-note th{color:#b91c1c;border-bottom:1px solid #fca5a5}
.special-note td{border-bottom:1px solid #fee2e2}
.special-note td.reason{color:#b91c1c;font-weight:600;font-size:11px}
@media print{body{padding:10px}}</style>
<script>window.onload=function(){setTimeout(function(){window.print();},300);}</script></head><body>
<div class="clinic-name">People's Health Care</div>
<div class="clinic-sub">Galle Road, Matara · 0777 883 343</div>
<div class="divider"></div>
<div class="row">
  <div><div class="label">Bill To</div><div class="bold">${bill.patientName}</div>
  ${bill.patientId ? `<div style="font-size:11px;color:#2563eb">${bill.patientId}</div>` : ""}
  ${bill.channelingNo ? `<div style="font-size:11px;color:#555">Ch. #${bill.channelingNo}</div>` : ""}
  <div style="font-size:11px;color:#888;margin-top:3px">Rx: ${bill.prescriptionRef}</div>
  <div style="font-size:11px;color:#888">Dr. ${bill.doctorName}</div></div>
  <div style="text-align:right"><div class="label">Bill No.</div>
  <div style="font-size:12px;font-family:monospace">${bill.billNumber}</div>
  <div style="margin-top:5px"><span class="badge paid-badge">✓ PAID</span></div>
  <div style="font-size:11px;color:#888;margin-top:3px">${new Date(bill.paidAt).toLocaleString()}</div></div>
</div>
<div class="divider"></div>
${(bill.lines||[]).length>0?`<div class="section-title">Dispensed Medications</div>
<table><thead><tr><th>Medication</th><th class="center">Qty</th><th class="right">Unit Price</th><th class="right">Total</th></tr></thead>
<tbody>${bill.lines.map(i=>`<tr><td>${i.medicationName}</td><td class="center">${i.qtyDispensed}</td><td class="right">LKR ${i.unitPrice.toLocaleString()}</td><td class="right">LKR ${i.lineTotal.toLocaleString()}</td></tr>`).join("")}</tbody></table>`:""}
${(bill.labLines||[]).length>0?`<div class="section-title">Lab Tests</div>
<table><thead><tr><th>Test</th><th class="right">Price</th></tr></thead>
<tbody>${bill.labLines.map(l=>`<tr><td>${l.testName}</td><td class="right">LKR ${l.price.toLocaleString()}</td></tr>`).join("")}</tbody></table>`:""}
<div class="totals">
${(bill.lines||[]).length>0?`<div class="total-row"><span>Medications Subtotal</span><span>LKR ${drugTotal.toLocaleString()}</span></div>`:""}
${labTotal>0?`<div class="total-row" style="color:#7c3aed"><span>Lab Tests Subtotal</span><span>LKR ${labTotal.toLocaleString()}</span></div>`:""}
<div class="total-row" style="color:#1d4ed8"><span>Doctor Consultation Fee</span><span>LKR ${DOCTOR_CHARGE.toLocaleString()}</span></div>
<div class="total-row main"><span>Total</span><span>LKR ${grandTotal.toLocaleString()}</span></div>
<div style="font-size:11px;color:#888;text-align:right;margin-top:4px">💵 Cash · ${new Date(bill.paidAt).toLocaleString()}</div>
</div>
${(bill.unavailableLines||[]).length>0?`
<div class="divider"></div>
<div class="special-note">
  <div class="special-note-header">
    <span style="font-size:13px">⚠</span>
    <span class="special-note-title">Special Note — Medications Not Dispensed</span>
  </div>
  <p class="special-note-body">The following prescribed medication(s) could not be dispensed due to current stock unavailability. Please obtain these from an external pharmacy at your earliest convenience and notify your attending physician.</p>
  <table>
    <thead><tr><th>Medication</th><th>Dosage / Duration</th><th class="right">Reason</th></tr></thead>
    <tbody>${(bill.unavailableLines||[]).map(l=>`<tr>
      <td style="font-weight:600">${l.medicationName}</td>
      <td style="color:#888;font-size:11px">${[l.dosage,l.duration].filter(Boolean).join(' · ')||'—'}</td>
      <td class="right reason">${l.availability==='out_of_stock'?'Out of Stock':'Not in Formulary'}</td>
    </tr>`).join('')}</tbody>
  </table>
</div>`:''}
<div class="footer">Thank you for choosing People's Health Care</div>
</body></html>`;
    const w = window.open("","_blank","width=560,height=750");
    w.document.write(printContent);
    w.document.close();
  };

  const handlePay = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/bills/${bill._id}/pay`, {
        method: "PATCH", headers: jsonH(),
        body: JSON.stringify({ paymentMethod: "Cash" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onPaid(data.bill);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleSendToPatient = async () => {
    setSending(true); setError("");
    try {
      const res  = await fetch(`${API}/bills/${bill._id}/send-to-patient`, {
        method: "PATCH", headers: jsonH(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onSent(data.bill);
    } catch (e) { setError(e.message); }
    finally { setSending(false); }
  };

  const handleNotifyLab = async () => {
    setNotifying(true); setError("");
    try {
      const res  = await fetch(`${API}/bills/${bill._id}/notify-lab`, {
        method: "PATCH", headers: jsonH(),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      onLabNotified(data.bill);
    } catch (e) { setError(e.message); }
    finally { setNotifying(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[93vh] overflow-y-auto">
        <div className="px-6 py-5 sticky top-0 z-10 rounded-t-3xl flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D2137, #01579B)" }}>
          <div>
            <p className="text-white/60 text-xs">{isPaid ? "Receipt" : "Collect Payment"}</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display',serif" }}>{bill.billNumber}</h3>
            <p className="text-white/60 text-xs mt-0.5">
              {new Date(bill.createdAt).toLocaleDateString()} · {new Date(bill.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">❌ {error}</div>}

          {bill.hasUnavailable && (bill.unavailableLines||[]).length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-red-100 border-b border-red-200">
                <span className="text-lg">❌</span>
                <div>
                  <p className="text-sm font-bold text-red-800">Drugs Not Dispensed</p>
                  <p className="text-xs text-red-600 mt-0.5">Inform patient — these medications were not available</p>
                </div>
              </div>
              <div className="divide-y divide-red-100">
                {bill.unavailableLines.map((l,i) => (
                  <div key={i} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-red-900">{l.medicationName}</p>
                        {(l.dosage||l.duration) && <p className="text-xs text-red-600 mt-0.5">{l.dosage} · {l.duration}</p>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 mt-0.5 ${
                        l.availability==="out_of_stock"?"bg-red-200 text-red-800":"bg-orange-100 text-orange-800"}`}>
                        {l.availability==="out_of_stock"?"Out of Stock":"Not in Formulary"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bill.hasNote && bill.noteContent && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl px-4 py-3 flex items-start gap-3">
              <span className="text-xl flex-shrink-0">📝</span>
              <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Pharmacist Note</p>
                <p className="text-sm text-amber-900">{bill.noteContent}</p>
              </div>
            </div>
          )}

          <div className="text-center border-b border-dashed border-gray-200 pb-4">
            <h3 className="font-bold text-gray-800" style={{ fontFamily: "'Playfair Display',serif" }}>People's Health Care</h3>
            <p className="text-xs text-gray-500 mt-0.5">Galle Road, Matara · 0777 883 343</p>
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Bill To</p>
              <p className="font-semibold text-gray-800">{bill.patientName}</p>
              {bill.patientId && <p className="text-xs text-blue-600 font-mono font-semibold">{bill.patientId}</p>}
              {bill.channelingNo && <p className="text-xs text-gray-500">Ch. #{bill.channelingNo}</p>}
              <p className="text-xs text-gray-400 mt-1 font-mono">Rx: {bill.prescriptionRef}</p>
              <p className="text-xs text-gray-400">Dr. {bill.doctorName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Bill No.</p>
              <p className="text-sm font-mono text-gray-700">{bill.billNumber}</p>
              <span className={`inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                isPaid?"bg-blue-100 text-blue-700":"bg-red-100 text-red-600"}`}>
                {isPaid?"✅ PAID":"⏳ UNPAID"}
              </span>
              {isPaid && isSent && <div className="mt-1 text-xs text-blue-600 font-semibold">📨 Sent to Patient</div>}
              {isPaid && isLabNotified && <div className="mt-1 text-xs font-semibold" style={{color:"#15803d"}}>🧪 Lab Notified</div>}
            </div>
          </div>

          {(bill.lines||[]).length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Dispensed Medications</p>
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400">Medication</th>
                      <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-400">Qty</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">Unit</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bill.lines.map((item,i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.medicationName}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700">{item.qtyDispensed}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-700">LKR {item.unitPrice}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">LKR {item.lineTotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(bill.labLines||[]).length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">🧪 Lab Tests</p>
              <div className="rounded-2xl border border-purple-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-purple-400">Test</th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold text-purple-400">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {bill.labLines.map((lab,i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{lab.testName}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800">LKR {lab.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(bill.unavailableLines||[]).length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Not Dispensed</p>
              <div className="rounded-2xl border border-red-100 overflow-hidden bg-red-50/50">
                {bill.unavailableLines.map((item,i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-red-100 last:border-0">
                    <span className="text-sm text-red-800 font-medium">{item.medicationName}</span>
                    <span className="text-xs text-red-500 font-semibold">
                      {item.availability==="out_of_stock"?"Out of stock":"Not available"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            {(bill.lines||[]).length > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Medications Subtotal</span><span>LKR {drugTotal.toLocaleString()}</span>
              </div>
            )}
            {labTotal > 0 && (
              <div className="flex justify-between text-sm font-semibold text-purple-700 bg-purple-50 rounded-xl px-3 py-2">
                <span>🧪 Lab Tests Subtotal</span><span>LKR {labTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold text-blue-700 bg-blue-50 rounded-xl px-3 py-2">
              <span>Doctor Consultation Fee</span><span>LKR {DOCTOR_CHARGE.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base text-gray-800">
              <span>Total</span>
              <span style={{ color: "#01579B" }}>LKR {grandTotal.toLocaleString()}</span>
            </div>
            {isPaid && (
              <div className="text-xs text-gray-400 text-right">
                💵 Cash · {new Date(bill.paidAt).toLocaleString()}
              </div>
            )}
          </div>

          {!isPaid && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <span className="text-lg">💵</span>
                <span className="text-sm font-semibold text-blue-800">Cash Payment</span>
              </div>
              <button onClick={handlePay} disabled={loading}
                className="w-full py-3.5 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #01579B, #0277BD)" }}>
                {loading ? "Processing…" : `💵 Collect LKR ${grandTotal.toLocaleString()}`}
              </button>
            </div>
          )}

          {isPaid && (
            <div className={`rounded-2xl border-2 p-4 ${isSent?"border-blue-100 bg-blue-50":"border-indigo-100 bg-indigo-50"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{isSent?"📨":"📤"}</span>
                  <div>
                    <p className="text-sm font-bold text-indigo-900">
                      {isSent?"Bill Sent to Patient":"Send Bill to Patient"}
                    </p>
                    <p className="text-xs text-indigo-600 mt-0.5">
                      {isSent
                        ?"Patient can view & download this receipt in their portal"
                        :"Make this paid receipt visible in the patient's billing portal"}
                    </p>
                  </div>
                </div>
                {!isSent ? (
                  <button onClick={handleSendToPatient} disabled={sending}
                    className="flex-shrink-0 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #3730a3, #4f46e5)" }}>
                    {sending ? "Sending…" : "Send →"}
                  </button>
                ) : (
                  <span className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold">✓ Sent</span>
                )}
              </div>
            </div>
          )}

          {/* ── Notify Laboratory block — only shown if bill has lab tests ── */}
          {isPaid && hasLabs && (
            <div className={`rounded-2xl border-2 p-4 ${isLabNotified ? "border-blue-200 bg-blue-50" : "border-teal-200 bg-teal-50"}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{isLabNotified ? "🧪" : "🔔"}</span>
                  <div>
                    <p className="text-sm font-bold text-teal-900">
                      {isLabNotified ? "Laboratory Notified" : "Notify Laboratory"}
                    </p>
                    <p className="text-xs text-teal-700 mt-0.5">
                      {isLabNotified
                        ? `Lab notified at ${bill.labNotifiedAt ? new Date(bill.labNotifiedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "—"} · ${(bill.labLines||[]).length} test${(bill.labLines||[]).length!==1?"s":""}`
                        : `Inform the lab that payment is confirmed for ${(bill.labLines||[]).length} lab test${(bill.labLines||[]).length!==1?"s":""}`}
                    </p>
                    {isLabNotified && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(bill.labLines||[]).map((l,i)=>(
                          <span key={i} className="text-xs bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">🧪 {l.testName}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {!isLabNotified ? (
                  <button onClick={handleNotifyLab} disabled={notifying}
                    className="flex-shrink-0 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                    style={{ background: "linear-gradient(135deg, #0f766e, #0d9488)" }}>
                    {notifying ? "Notifying…" : "🔔 Notify Lab"}
                  </button>
                ) : (
                  <span className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold">✓ Done</span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              🖨️ Print Receipt
            </button>
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CashierBilling() {
  const [bills,    setBills]    = useState([]);
  const [summary,  setSummary]  = useState({});
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("filter");
    if (p) setFilter(p);
  }, []);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const tzOffset = -new Date().getTimezoneOffset();
      const params = new URLSearchParams({ limit: "300", tzOffset: String(tzOffset) });
      if (search) params.set("search", search);
      const res  = await fetch(`${API}/bills?${params}`, { headers: authH() });
      const data = await res.json();
      if (data.success) { setBills(data.bills || []); setSummary(data.summary || {}); }
    } catch { showToast("Cannot connect to server", "error"); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handlePaid = (updatedBill) => {
    setBills(prev => prev.map(b => b._id === updatedBill._id ? updatedBill : b));
    setSelected(updatedBill);
    fetchBills();
    showToast(`Payment collected — LKR ${updatedBill.totalAmount.toLocaleString()}`);
  };

  const handleSent = (updatedBill) => {
    setBills(prev => prev.map(b => b._id === updatedBill._id ? updatedBill : b));
    setSelected(updatedBill);
    showToast("Bill sent to patient portal successfully");
  };

  const handleLabNotified = (updatedBill) => {
    setBills(prev => prev.map(b => b._id === updatedBill._id ? updatedBill : b));
    setSelected(updatedBill);
    showToast(`🧪 Laboratory notified — ${(updatedBill.labLines||[]).length} test${(updatedBill.labLines||[]).length!==1?"s":""} flagged`);
  };

  const totalBillCount    = summary.totalCount ?? bills.length;
  const todayCollected    = summary.todayCollected ?? 0;
  const totalOutstanding  = bills.filter(b => b.paymentStatus === "unpaid").reduce((s, b) => s + b.totalAmount, 0);
  const unavailableCount  = bills.filter(b => b.hasUnavailable).length;
  const selectedLive     = selected ? bills.find(b => b._id === selected._id) ?? selected : null;

  const filtered = bills.filter(b => {
    const matchFilter = (() => {
      if (filter === "unpaid")      return b.paymentStatus === "unpaid";
      if (filter === "paid")        return b.paymentStatus === "paid";
      if (filter === "unavailable") return b.hasUnavailable;
      if (filter === "noted")       return (b.hasNote && b.noteContent) || b.hasUnavailable;
      if (filter === "sent")        return b.sentToPatient === true;
      return true;
    })();
    const matchSearch = !search || [b.patientName, b.billNumber, b.prescriptionRef]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <CashierLayout activePage="Sales & Billing">
      <style>{`@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

      {toast       && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      {selectedLive && (
        <BillModal bill={selectedLive} onClose={() => setSelected(null)} onPaid={handlePaid} onSent={handleSent} onLabNotified={handleLabNotified} />
      )}

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display',serif" }}>
              Sales & Billing
            </h1>
            <p className="text-sm text-gray-400 mt-1">Collect payments · {totalBillCount} total bills</p>
          </div>
          <button onClick={fetchBills}
            className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
            🔄 Refresh
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Today's Collections", value: `LKR ${todayCollected.toLocaleString()}`,   sub: `${new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}`, icon: "💸", color: "#01579B", bg: "#E3F2FD" },
            { label: "Outstanding",         value: `LKR ${totalOutstanding.toLocaleString()}`, sub: `${summary.unpaidCount||0} unpaid`,                           icon: "⏳", color: "#B71C1C", bg: "#FFEBEE" },
            { label: "Total Bills",         value: totalBillCount,                              sub: "All records",                                                icon: "🧾", color: "#1565C0", bg: "#E3F2FD" },
            { label: "Missing Drug Bills",  value: unavailableCount,                            sub: "Needs patient info",                                         icon: "❌", color: "#E65100", bg: "#FFF3E0" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: s.bg }}>{s.icon}</div>
                <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              </div>
              <div className="font-bold" style={{ fontFamily: "'Playfair Display',serif", color: s.color, fontSize: "1.1rem" }}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {bills.some(b => b.paymentStatus === "unpaid") && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Outstanding Payments</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {summary.unpaidCount || 0} bill(s) pending — <strong>LKR {totalOutstanding.toLocaleString()}</strong>
                {unavailableCount > 0 && <span className="ml-2 text-orange-700 font-bold">· {unavailableCount} with missing drugs</span>}
              </p>
            </div>
            <div className="flex gap-2">
              {unavailableCount > 0 && (
                <button onClick={() => setFilter("unavailable")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition">
                  Missing →
                </button>
              )}
              <button onClick={() => setFilter("unpaid")}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-700 text-white hover:bg-amber-800 transition">
                Unpaid →
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48 relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input type="text" placeholder="Search patient, bill no., or Rx…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all",         label: "All" },
              { key: "unpaid",      label: "⏳ Unpaid" },
              { key: "paid",        label: "✅ Paid" },
              { key: "sent",        label: "📨 Sent to Patient" },
              { key: "unavailable", label: "❌ Missing Drugs" },
              { key: "noted",       label: "📝 Notes" },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                  filter === f.key ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={filter === f.key ? { background: "linear-gradient(135deg,#01579B,#0277BD)" } : {}}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3 animate-pulse">🧾</div>
            <p className="text-sm text-gray-400">Loading bills…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3">🧾</div>
            <p className="text-gray-500 font-medium">No bills found</p>
            <p className="text-xs text-gray-400 mt-1">Bills appear when the pharmacy dispenses prescriptions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(bill => (
              <div key={bill._id}
                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden ${
                  bill.hasUnavailable && bill.paymentStatus !== "paid"
                    ? "border-red-200 ring-1 ring-red-100"
                    : bill.hasNote && bill.paymentStatus === "unpaid"
                      ? "border-amber-200"
                      : "border-gray-100"
                }`}>

                {bill.hasUnavailable && bill.paymentStatus !== "paid" && (
                  <div className="px-5 py-2.5 bg-red-50 border-b border-red-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm">❌</span>
                      <p className="text-xs font-bold text-red-800">Drugs not dispensed:</p>
                      {(bill.unavailableLines||[]).map((l,i) => (
                        <span key={i} className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
                          {l.medicationName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!bill.hasUnavailable && bill.hasNote && bill.noteContent && bill.paymentStatus !== "paid" && (
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-amber-50 border-b border-amber-200">
                    <span>📝</span>
                    <p className="text-xs font-semibold text-amber-800 flex-1 truncate">Note: {bill.noteContent}</p>
                  </div>
                )}

                {bill.sentToPatient && bill.paymentStatus === "paid" && (
                  <div className="flex items-center gap-3 px-5 py-2 bg-blue-50 border-b border-blue-100">
                    <span className="text-sm">📨</span>
                    <p className="text-xs font-semibold text-blue-700">Sent to patient portal</p>
                  </div>
                )}

                {bill.labNotified && bill.paymentStatus === "paid" && (
                  <div className="flex items-center gap-3 px-5 py-2 bg-blue-50 border-b border-blue-100">
                    <span className="text-sm">🧪</span>
                    <p className="text-xs font-semibold text-blue-700">
                      Laboratory notified
                      {bill.labNotifiedAt && <span className="font-normal text-blue-600 ml-1">· {new Date(bill.labNotifiedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: bill.paymentStatus==="paid"?"linear-gradient(135deg,#01579B,#0277BD)":"#9CA3AF" }}>
                    {bill.patientName.split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-bold text-gray-800">{bill.patientName}</span>
                      {bill.channelingNo && (
                        <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Ch. #{bill.channelingNo}</span>
                      )}
                      <span className="text-xs text-gray-400">Dr. {bill.doctorName}</span>
                    </div>
                    <div className="text-xs text-gray-500">{bill.billNumber} · Rx: {bill.prescriptionRef}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(bill.createdAt).toLocaleString([],{dateStyle:"short",timeStyle:"short"})}
                      {(bill.lines||[]).length > 0 && <span className="ml-1">· {bill.lines.length} drug{bill.lines.length!==1?"s":""} dispensed</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 mr-3">
                    <div className="text-base font-bold" style={{ color: bill.paymentStatus==="paid"?"#01579B":"#B71C1C" }}>
                      LKR {bill.totalAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                      bill.paymentStatus==="paid"?"bg-blue-100 text-blue-700 border-blue-200":"bg-amber-100 text-amber-700 border-amber-200"
                    }`}>
                      {bill.paymentStatus==="paid"?"✅ Paid":"⏳ Unpaid"}
                    </span>
                    <button onClick={() => setSelected(bill)} className="text-xs font-semibold text-blue-700 hover:underline">
                      {bill.paymentStatus==="paid"?"View Receipt →":"Open →"}
                    </button>
                    {bill.paymentStatus === "paid" && !bill.sentToPatient && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const res  = await fetch(`${API}/bills/${bill._id}/send-to-patient`,{method:"PATCH",headers:jsonH()});
                            const data = await res.json();
                            if (!data.success) throw new Error(data.message);
                            setBills(prev => prev.map(b => b._id===bill._id ? data.bill : b));
                            showToast("Bill sent to patient portal");
                          } catch(err) { showToast(err.message,"error"); }
                        }}
                        className="text-xs font-semibold px-2 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
                        📤 Send
                      </button>
                    )}
                    {bill.paymentStatus === "paid" && bill.hasLabTests && (bill.labLines||[]).length > 0 && !bill.labNotified && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const res  = await fetch(`${API}/bills/${bill._id}/notify-lab`,{method:"PATCH",headers:jsonH()});
                            const data = await res.json();
                            if (!data.success) throw new Error(data.message);
                            setBills(prev => prev.map(b => b._id===bill._id ? data.bill : b));
                            showToast(`🧪 Lab notified — ${(data.bill.labLines||[]).length} test${(data.bill.labLines||[]).length!==1?"s":""}`);
                          } catch(err) { showToast(err.message,"error"); }
                        }}
                        className="text-xs font-semibold px-2 py-1 rounded-lg text-white hover:opacity-90 transition"
                        style={{ background: "linear-gradient(135deg,#0f766e,#0d9488)" }}>
                        🔔 Notify Lab
                      </button>
                    )}
                    {bill.paymentStatus === "paid" && bill.labNotified && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-100 text-blue-700 border border-blue-200">
                        🧪 Lab Notified
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-50 px-5 py-2.5 bg-gray-50 flex flex-wrap gap-2">
                  {(bill.lines||[]).map((item,i) => (
                    <span key={i} className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      {item.medicationName} × {item.qtyDispensed}
                    </span>
                  ))}
                  {(bill.labLines||[]).map((lab,i) => (
                    <span key={`lab${i}`} className="text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                      🧪 {lab.testName}
                    </span>
                  ))}
                  {(bill.unavailableLines||[]).map((item,i) => (
                    <span key={`u${i}`} className="text-xs text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full line-through">
                      {item.medicationName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CashierLayout>
  );
}
