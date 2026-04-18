import { useState, useEffect } from "react";
import PatientLayout from "../../components/PatientLayout";
import api from "../../services/api";

// ─── PDF Generator ─────────────────────────────────────────────────────────
function generatePDF(result) {
  const patientName = result.patientName || result.patientId?.name || "Patient";
  const { testName, results, testId, completedAt } = result;
  const date = completedAt
    ? new Date(completedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  const rows = results?.parameters?.map(p => {
    const abnormal = ["High", "Low", "Positive", "Reactive"].includes(p.flag);
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #E0F2F1;font-size:13px;">${p.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E0F2F1;font-weight:700;font-size:13px;color:${abnormal ? "#B71C1C" : "#00695C"};">
        ${p.value || "—"} ${p.unit || ""}
        ${p.flag && p.flag !== "Normal" ? `<span style="font-size:11px;color:#B71C1C;"> (${p.flag})</span>` : ""}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #E0F2F1;font-size:12px;color:#888;">${p.ref || ""}</td>
    </tr>`;
  }).join("") || "";

  const findings = results?.checkboxFindings?.filter(f => f.checked)
    .map(f => `<li style="margin:4px 0;font-size:13px;">${f.label}</li>`).join("") || "";

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<style>body{font-family:'Segoe UI',sans-serif;margin:0;padding:0;}@media print{body{-webkit-print-color-adjust:exact;}}</style>
</head><body><div style="max-width:720px;margin:0 auto;padding:40px;">
<div style="background:linear-gradient(135deg,#0D2137,#006064);color:#fff;padding:28px 32px;border-radius:12px 12px 0 0;">
  <div style="display:flex;justify-content:space-between;">
    <div><div style="font-size:22px;font-weight:700;font-family:Georgia,serif;">People's Health Care</div>
    <div style="font-size:12px;opacity:0.7;">Laboratory Services · Certified Medical Laboratory</div></div>
    <div style="text-align:right;"><div style="font-size:11px;opacity:0.7;">Report ID</div>
    <div style="font-size:16px;font-weight:700;font-family:monospace;">${testId}</div>
    <div style="font-size:11px;opacity:0.7;">${date}</div></div>
  </div>
</div>
<div style="background:#E0F2F1;padding:16px 32px;display:flex;justify-content:space-between;border-bottom:2px solid #006064;">
  <div><div style="font-size:11px;color:#555;text-transform:uppercase;">Patient</div>
  <div style="font-size:17px;font-weight:700;color:#0D2137;">${patientName}</div></div>
  <div style="text-align:right;"><div style="font-size:11px;color:#555;text-transform:uppercase;">Test</div>
  <div style="font-size:17px;font-weight:700;color:#006064;">${testName}</div></div>
</div>
<div style="margin-top:24px;">
  <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#006064;margin-bottom:12px;">Test Parameters</div>
  <table style="width:100%;border-collapse:collapse;border:1px solid #E0F2F1;">
    <thead><tr style="background:#F0FAF9;">
      <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#00695C;">Parameter</th>
      <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#00695C;">Result</th>
      <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#00695C;">Reference Range</th>
    </tr></thead>
    <tbody>${rows || '<tr><td colspan="3" style="padding:16px;text-align:center;color:#aaa;">No parameters recorded</td></tr>'}</tbody>
  </table>
</div>
${findings ? `<div style="margin-top:24px;"><div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#006064;margin-bottom:12px;">Clinical Findings</div>
<ul style="margin:0;padding:16px 16px 16px 36px;background:#F9FFFE;border:1px solid #E0F2F1;border-radius:8px;">${findings}</ul></div>` : ""}
${results?.labNotes ? `<div style="margin-top:24px;"><div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#006064;margin-bottom:12px;">Lab Notes</div>
<div style="background:#FFFDE7;border:1px solid #FFF9C4;border-radius:8px;padding:16px;font-size:13px;color:#555;">${results.labNotes}</div></div>` : ""}
<div style="margin-top:40px;padding-top:20px;border-top:1px solid #E0E0E0;display:flex;justify-content:space-between;font-size:11px;color:#aaa;">
  <div>Performed by: <strong style="color:#555;">${results?.performedBy || "Lab Staff"}</strong></div>
  <div>This report is confidential and intended only for the patient and requesting physician.</div>
</div></div></body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ─── Result Detail Modal ───────────────────────────────────────────────────
function ResultModal({ result, onClose }) {
  if (!result) return null;
  const isFlagged = result.results?.parameters?.some(p => ["High", "Low", "Positive", "Reactive"].includes(p.flag));
  const formatDate = iso => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between rounded-t-3xl"
          style={{ background: "linear-gradient(135deg, #7B1FA2, #1565C0)" }}>
          <div>
            <p className="text-white/60 text-xs">Laboratory Report</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{result.testId}</h3>
            <p className="text-white/60 text-xs mt-0.5">{result.testName} · Completed {formatDate(result.completedAt)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-5">
          {isFlagged && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-red-800">⚠️ Some values are outside the normal range</p>
              <p className="text-xs text-red-700 mt-1">Please consult your doctor at your earliest convenience.</p>
            </div>
          )}
          {result.results?.checkboxFindings?.some(f => f.checked) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Clinical Findings</p>
              <div className="space-y-1.5">
                {result.results.checkboxFindings.filter(f => f.checked).map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-teal-500 mt-0.5">✓</span><span>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.results?.parameters?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Test Parameters</p>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Parameter</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Result</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {result.results.parameters.map((p, i) => {
                      const abnormal = ["High", "Low", "Positive", "Reactive"].includes(p.flag);
                      return (
                        <tr key={i} className={abnormal ? "bg-red-50" : ""}>
                          <td className="px-4 py-3 text-gray-700 text-xs font-medium">{p.name}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold text-sm ${abnormal ? "text-red-600" : "text-green-700"}`}>
                              {p.value || "—"} {p.unit}
                              {p.flag && p.flag !== "Normal" && p.flag !== "" && <span className="ml-1 text-xs">({p.flag})</span>}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{p.ref}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {result.results?.labNotes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lab Notes</p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 border border-gray-100">{result.results.labNotes}</div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => generatePDF(result)}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #7B1FA2, #1565C0)" }}>
              📥 Download PDF
            </button>
            <button onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function PatientLabResults() {
  const [results, setResults]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [filter, setFilter]                 = useState("All");

  // ── FEATURE 2: fasting notifications ─────────────────────────────────────
  const [notifications, setNotifications]   = useState([]);
  const [, setTick] = useState(0);  // forces re-render every minute to update countdown

  useEffect(() => {
    fetchResults();
    fetchNotifications();

    // Refresh notifications every 60 seconds so countdowns stay live
    const id = setInterval(() => {
      setTick(t => t + 1);
      fetchNotifications();
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await api.get("/lab-results?status=completed");
      setResults(res.data.results || []);
    } catch (err) { setError("Failed to load lab results."); }
    finally { setLoading(false); }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/lab-results/patient-notifications");
      setNotifications(res.data.notifications || []);
    } catch { /* silent — notifications are a bonus */ }
  };

  const isFlagged = r => r.results?.parameters?.some(p => ["High", "Low", "Positive", "Reactive"].includes(p.flag));
  const flaggedCount = results.filter(isFlagged).length;

  const filtered = results.filter(r => {
    if (filter === "All")     return true;
    if (filter === "Flagged") return isFlagged(r);
    if (filter === "Normal")  return !isFlagged(r);
    return true;
  });

  const formatDate = iso => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const formatTime = iso => iso ? new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

  // Split notifications into "ready" and "still waiting"
  const readyNotifs   = notifications.filter(n => n.fastingHours > 0 && n.isReady);
  const waitingNotifs = notifications.filter(n => n.fastingHours > 0 && !n.isReady);

  return (
    <PatientLayout activePage="Lab Results">
      {selectedResult && <ResultModal result={selectedResult} onClose={() => setSelectedResult(null)}/>}

      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Lab Results & Reports
          </h1>
          <p className="text-sm text-gray-400 mt-1">Your diagnostic test results from People's Health Care Laboratory</p>
        </div>

        {/* ── FEATURE 2: "Submit sample now" notifications ─────────────── */}
        {readyNotifs.length > 0 && (
          <div className="space-y-3">
            {readyNotifs.map(n => (
              <div key={n._id} className="bg-green-50 border-2 border-green-400 rounded-2xl p-4 flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">🟢</div>
                <div className="flex-1">
                  <p className="font-bold text-green-800">You can now submit your sample!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your <span className="font-semibold">{n.testName}</span> test required {n.fastingHours} hour(s) of fasting.
                    Your fasting period started at <span className="font-semibold">{formatTime(n.sentAt)}</span> and is now complete.
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Please visit the laboratory as soon as possible to submit your sample. Test ID: <span className="font-mono">{n.testId}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FEATURE 2: Still waiting / countdown ─────────────────────── */}
        {waitingNotifs.length > 0 && (
          <div className="space-y-3">
            {waitingNotifs.map(n => (
              <div key={n._id} className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">⏳</div>
                <div className="flex-1">
                  <p className="font-bold text-amber-800">Fasting in Progress — {n.testName}</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Pre-conditions were sent to you at <span className="font-semibold">{formatTime(n.sentAt)}</span>.
                    You must fast for <span className="font-semibold">{n.fastingHours} hour(s)</span>.
                  </p>
                  <div className="mt-3 bg-amber-100 rounded-xl px-4 py-2 inline-flex items-center gap-3">
                    <span className="text-lg">⏱️</span>
                    <div>
                      <div className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Time Remaining</div>
                      <div className="text-lg font-bold text-amber-800">{n.remainingTime}</div>
                    </div>
                    <div className="ml-4">
                      <div className="text-xs text-amber-600 font-semibold uppercase tracking-wide">You Can Submit At</div>
                      <div className="text-lg font-bold text-amber-800">{formatTime(n.readyAt)}</div>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    Please do not eat or drink (except water) until the fasting period ends.
                    You will be notified when it is time to submit your sample.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Reports",    value: results.length,                                    color: "#1565C0", bg: "#E3F2FD" },
            { label: "All Completed",    value: results.filter(r => r.status === "completed").length, color: "#00897B", bg: "#E0F2F1" },
            { label: "Flagged Values",   value: flaggedCount,                                       color: "#B71C1C", bg: "#FFEBEE" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {flaggedCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="text-xl flex-shrink-0">🚨</div>
            <div>
              <p className="text-sm font-semibold text-red-800">Attention Required</p>
              <p className="text-xs text-red-700 mt-1">
                {flaggedCount} of your recent lab report{flaggedCount > 1 ? "s contain" : " contains"} values outside the normal range.
                Please consult your doctor as soon as possible.
              </p>
            </div>
          </div>
        )}

        {/* Filter buttons */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-2">
          {["All", "Normal", "Flagged"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f ? f === "Flagged" ? "bg-red-500 text-white shadow-md" : "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={filter === f && f !== "Flagged" ? { background: "linear-gradient(135deg, #1565C0, #00ACC1)" } : {}}>
              {f === "Flagged" && "⚠️ "}{f}
            </button>
          ))}
        </div>

        {/* Results list */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">Loading your lab results…</div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl border border-red-100 p-8 text-center text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-4xl mb-3">🧪</div>
            <div className="text-gray-500 font-medium">No lab results found</div>
            <div className="text-gray-400 text-sm mt-1">Results will appear here once your tests are completed</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(result => {
              const flagged = isFlagged(result);
              return (
                <div key={result._id}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden ${flagged ? "border-red-200" : "border-gray-100"}`}>
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: flagged ? "#FFEBEE" : "#F3E5F5" }}>
                      {flagged ? "⚠️" : "🧪"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-mono text-xs text-gray-400">{result.testId}</span>
                        <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{result.testName}</span>
                        {flagged && <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full border border-red-200">Abnormal Values</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">Completed: {formatDate(result.completedAt)} · Appt: {result.appointmentId}</div>
                      {result.results?.performedBy && <div className="text-xs text-gray-400">By: {result.results.performedBy}</div>}
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">✅ Ready</span>
                      <button onClick={() => setSelectedResult(result)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition"
                        style={{ background: "linear-gradient(135deg, #7B1FA2, #1565C0)" }}>
                        View Report →
                      </button>
                    </div>
                  </div>
                  {result.results?.parameters?.length > 0 && (
                    <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex flex-wrap gap-3">
                      {result.results.parameters.slice(0, 3).map((p, i) => {
                        const abn = ["High", "Low", "Positive", "Reactive"].includes(p.flag);
                        return (
                          <div key={i} className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${abn ? "bg-red-400" : "bg-green-400"}`}/>
                            <span className="text-xs text-gray-500">{p.name}:</span>
                            <span className={`text-xs font-semibold ${abn ? "text-red-600" : "text-gray-700"}`}>{p.value} {p.unit}</span>
                          </div>
                        );
                      })}
                      {result.results.parameters.length > 3 && <span className="text-xs text-gray-400">+{result.results.parameters.length - 3} more</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}
