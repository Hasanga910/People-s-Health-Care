import { useState, useEffect } from "react";
import LabLayout from "../../components/LabLayout";
import api from "../../services/api";

const STATUS_CONFIG = {
  pending:        { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-200",  bar: "#fbbf24", icon: "⏳", label: "Pending" },
  payment_pending:{ bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200", bar: "#fb923c", icon: "💳", label: "Awaiting Payment" },
  pre_check:      { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", bar: "#a78bfa", icon: "📋", label: "Pre Check" },
  sample_received:{ bg: "bg-cyan-100",   text: "text-cyan-700",   border: "border-cyan-200",   bar: "#22d3ee", icon: "💉", label: "Sample Received" },
  in_progress:    { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200",   bar: "#60a5fa", icon: "🔬", label: "In Progress" },
  completed:      { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  bar: "#4ade80", icon: "✅", label: "Completed" },
};

// The 5-step workflow shown in the detail modal progress bar
// pending → pre_check → sample_received → in_progress → completed
const WORKFLOW_STEPS = [
  { key: "pending",        label: "Pending",
        desc: "Request from doctor" },
  { key: "pre_check",      label: "Pre Check",
        desc: "Conditions sent to patient" },
  { key: "sample_received",label: "Sample Received", desc: "Sample collected" },
  { key: "in_progress",    label: "In Progress",    desc: "Entering test results" },
  { key: "completed",      label: "Completed",      desc: "Report submitted" },
];

// ─── Payment Confirmation Modal ─────────────────────────────────────────────
function PaymentConfirmModal({ request, onConfirm, onClose }) {
  const [paymentId, setPaymentId] = useState("");
  const [msg, setMsg]             = useState(null);
  const [loading, setLoading]     = useState(false);

  const handleConfirm = async () => {
    if (!paymentId.trim()) return setMsg({ type: "error", text: "Please enter a Payment ID." });
    setLoading(true);
    setMsg(null);
    try {
      await onConfirm(request, paymentId.trim());
    } catch (err) {
      // Show the exact backend error message on screen
      const errText =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.data?.details && err.response.data.details.join(", ")) ||
        err.message ||
        "Unknown error";
      setMsg({ type: "error", text: "❌ " + errText });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-5 rounded-t-3xl" style={{ background: "linear-gradient(135deg, #0D2137, #0D47A1)" }}>
          <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            💳 Payment Confirmation
          </h3>
          <p className="text-white/60 text-xs mt-1">Enter the Payment ID received from Pharmacy</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-2xl p-4 text-sm">
            <div className="font-semibold text-gray-800">{request.patientName}</div>
            <div className="text-xs text-gray-500 mt-1">
              Request: <span className="font-mono text-blue-700">{request.labRequestId}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {request.tests?.map(t => (
                <span key={t.name} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{t.name}</span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Payment ID (from Pharmacy)
            </label>
            <input
              type="text"
              value={paymentId}
              onChange={e => setPaymentId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleConfirm()}
              placeholder="e.g. PAY-2026-0042"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {msg && (
            <div className={`text-xs rounded-xl px-4 py-3 break-words ${msg.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700"}`}>
              {msg.text}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={loading}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={loading}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0D47A1, #1565C0)" }}>
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Confirming…
                </>
              ) : "Confirm Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pre-Conditions Modal ───────────────────────────────────────────────────
function PreConditionsModal({ labResults, onClose, onDone }) {
  const [currentIdx, setCurrentIdx]       = useState(0);
  const [templates, setTemplates]         = useState({});
  const [checkboxes, setCheckboxes]       = useState({});
  const [answers, setAnswers]             = useState({});
  const [loadingTemplate, setLoadingTemplate] = useState(true);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState(null);

  const current = labResults[currentIdx];

  useEffect(() => { loadTemplate(current.testName); }, [currentIdx]);

  const loadTemplate = async (testName) => {
    if (templates[testName]) { setLoadingTemplate(false); return; }
    setLoadingTemplate(true);
    setError(null);
    try {
      const res = await api.get(`/lab-results/pre-conditions/${encodeURIComponent(testName)}`);
      const tpl = res.data.template;
      setTemplates(prev => ({ ...prev, [testName]: tpl }));
      setCheckboxes(prev => ({ ...prev, [testName]: tpl.checkboxes.map(label => ({ label, checked: false })) }));
      setAnswers(prev => ({ ...prev, [testName]: tpl.shortAnswers.map(q => ({ question: q.question, answer: "" })) }));
    } catch (err) {
      setError("Could not load pre-conditions: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingTemplate(false);
    }
  };

  const toggleCheck = (testName, i) =>
    setCheckboxes(prev => ({ ...prev, [testName]: prev[testName].map((c, idx) => idx === i ? { ...c, checked: !c.checked } : c) }));

  const updateAnswer = (testName, i, value) =>
    setAnswers(prev => ({ ...prev, [testName]: prev[testName].map((q, idx) => idx === i ? { ...q, answer: value } : q) }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.put(`/lab-results/${current._id}/pre-conditions`, {
        checkboxes:   checkboxes[current.testName] || [],
        shortAnswers: answers[current.testName] || [],
      });
      if (currentIdx < labResults.length - 1) {
        setCurrentIdx(i => i + 1);
      } else {
        onDone();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const cbs = checkboxes[current?.testName] || [];
  const ans = answers[current?.testName] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 rounded-t-3xl" style={{ background: "linear-gradient(135deg, #6A1B9A, #4527A0)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs">Pre-Test Conditions · {currentIdx + 1} of {labResults.length}</p>
              <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                📋 {current?.testName}
              </h3>
              <p className="text-white/60 text-xs mt-0.5">{labResults[0]?.patientName || "Patient"}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          {labResults.length > 1 && (
            <div className="flex gap-2 mt-3">
              {labResults.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition ${i <= currentIdx ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 space-y-5">
          {loadingTemplate ? (
            <div className="text-center py-8 text-gray-400">Loading pre-conditions…</div>
          ) : (
            <>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Verify before collecting sample</p>
                <div className="space-y-3">
                  {cbs.map((item, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                      <div onClick={() => toggleCheck(current.testName, i)}
                        className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition cursor-pointer
                          ${item.checked ? "bg-purple-600 border-purple-600" : "border-gray-300 group-hover:border-purple-400"}`}>
                        {item.checked && (
                          <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
                            <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm leading-relaxed ${item.checked ? "text-gray-800" : "text-gray-500"}`}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {ans.length > 0 && (
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Additional Questions</p>
                  {ans.map((q, i) => (
                    <div key={i}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{q.question}</label>
                      <textarea value={q.answer} onChange={e => updateAnswer(current.testName, i, e.target.value)}
                        placeholder="Type your answer…" rows={2}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"/>
                    </div>
                  ))}
                </div>
              )}

              {error && <div className="bg-red-50 text-red-600 text-xs px-4 py-2 rounded-xl border border-red-200">{error}</div>}

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} disabled={saving}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #6A1B9A, #4527A0)" }}>
                  {saving ? (
                    <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
                  ) : currentIdx < labResults.length - 1 ? "Save & Next Test →" : "✅ Confirm & Mark Sample Received"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Request Detail Modal ───────────────────────────────────────────────────
function RequestDetailModal({ request, onClose, onPaymentConfirm, onGoToUpload }) {
  const statusKey  = request.status || "pending";
  const currentIdx = WORKFLOW_STEPS.findIndex(s => s.key === statusKey);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between rounded-t-3xl"
          style={{ background: "linear-gradient(135deg, #0D2137, #0D47A1)" }}>
          <div>
            <p className="text-white/60 text-xs">Lab Request</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{request.labRequestId}</h3>
            <p className="text-white/60 text-xs mt-0.5">
              {new Date(request.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              {request.channelingNo ? ` · Ch. #${request.channelingNo}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0D47A1, #1565C0)" }}>
              {request.patientName?.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-800">{request.patientName}</div>
              <div className="text-xs text-gray-500">{request.channelingNo ? `Ch. #${request.channelingNo}` : "No channeling no."}</div>
            </div>
            {request.priority === "Urgent" && (
              <span className="text-xs bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full border border-red-200">🚨 Urgent</span>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Workflow Progress</p>
            <div className="flex items-center gap-1">
              {WORKFLOW_STEPS.map((step, i) => {
                const done   = currentIdx >= i;
                const active = statusKey === step.key;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${done ? "text-white" : "bg-gray-100 text-gray-400"}`}
                        style={done ? { background: "linear-gradient(135deg, #0D47A1, #1565C0)" } : {}}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span className={`text-xs mt-1 text-center leading-tight ${active ? "text-blue-700 font-semibold" : "text-gray-400"}`}>
                        {step.label}
                      </span>
                      <span className="text-xs text-gray-300 text-center leading-tight hidden lg:block">
                        {step.desc}
                      </span>
                    </div>
                    {i < WORKFLOW_STEPS.length - 1 && <div className={`h-0.5 flex-1 mb-6 mx-1 ${currentIdx > i ? "bg-blue-500" : "bg-gray-100"}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tests Requested</p>
            <div className="flex flex-wrap gap-2">
              {request.tests?.map(t => (
                <span key={t.name} className="text-sm bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-xl font-medium">
                  🧪 {t.name}
                </span>
              ))}
            </div>
          </div>

          {request.clinicalNotes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Doctor's Notes</p>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-700">📝 {request.clinicalNotes}</div>
            </div>
          )}

          {statusKey === "pending" && (
            <button onClick={() => onPaymentConfirm(request)}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #E65100, #BF360C)" }}>
              💳 Confirm Payment from Pharmacy
            </button>
          )}
          {(statusKey === "pre_check" || statusKey === "sample_received" || statusKey === "in_progress") && (
            <button onClick={() => onGoToUpload(request)}
              className="w-full py-3 rounded-xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg, #0D47A1, #1565C0)" }}>
              📤 Go to Upload Results
            </button>
          )}
          <button onClick={onClose}
            className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function LabTestRequests() {
  const [requests, setRequests]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [selected, setSelected]             = useState(null);
  const [paymentTarget, setPaymentTarget]   = useState(null);
  const [preCondTarget, setPreCondTarget]   = useState(null);
  const [statusFilter, setStatusFilter]     = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [search, setSearch]                 = useState("");

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/lab-requests");
      setRequests(res.data.labRequests || []);
    } catch {
      setError("Failed to load lab requests.");
    } finally {
      setLoading(false);
    }
  };

  // ── KEY FIX: only send labRequestRef, appointmentId, testName, paymentId
  // The backend now looks up doctorId and patientId from the DB itself
  const handlePaymentConfirm = async (request, paymentId) => {
    const createdResults = [];

    for (const test of request.tests) {
      const res = await api.post("/lab-results", {
        labRequestRef: request.labRequestId,          // backend uses this to look up doctorId
        appointmentId: request.channelingNo || request._id,
        testName:      test.name,
        paymentId,
      });
      // attach patientName for the PreConditionsModal header
      const created = { ...res.data.result, patientName: request.patientName };
      createdResults.push(created);
    }

    await api.put(`/lab-requests/${request._id}/lab-status`, { status: "in_progress" });

    setPaymentTarget(null);
    setSelected(null);
    setPreCondTarget(createdResults);   // opens PreConditionsModal immediately
    fetchRequests();
  };

  const handlePreCondDone = () => {
    setPreCondTarget(null);
    fetchRequests();
  };

  const counts = {
    pending:     requests.filter(r => r.status === "pending").length,
    in_progress: requests.filter(r => r.status === "in_progress").length,
    completed:   requests.filter(r => r.status === "completed").length,
  };

  const filtered = requests.filter(r => {
    const matchSearch   = r.patientName?.toLowerCase().includes(search.toLowerCase()) || r.labRequestId?.includes(search);
    const matchStatus   = statusFilter === "All" || r.status === statusFilter;
    const matchPriority = priorityFilter === "All" || r.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <LabLayout activePage="Test Requests">
      {selected && !paymentTarget && !preCondTarget && (
        <RequestDetailModal
          request={selected}
          onClose={() => setSelected(null)}
          onPaymentConfirm={(req) => setPaymentTarget(req)}
          onGoToUpload={() => { window.location.href = "/lab/upload"; }}
        />
      )}
      {paymentTarget && (
        <PaymentConfirmModal
          request={paymentTarget}
          onConfirm={handlePaymentConfirm}
          onClose={() => setPaymentTarget(null)}
        />
      )}
      {preCondTarget && (
        <PreConditionsModal
          labResults={preCondTarget}
          onClose={() => setPreCondTarget(null)}
          onDone={handlePreCondDone}
        />
      )}

      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Test Requests</h1>
          <p className="text-sm text-gray-400 mt-1">Manage and process incoming laboratory test requests</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pending",     value: counts.pending,     color: "#E65100", bg: "#FFF3E0" },
            { label: "In Progress", value: counts.in_progress, color: "#1565C0", bg: "#E3F2FD" },
            { label: "Completed",   value: counts.completed,   color: "#1565C0", bg: "#E3F2FD" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48 relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input type="text" placeholder="Search patient or ID…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "pending", "in_progress", "completed"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition capitalize ${statusFilter === s ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                style={statusFilter === s ? { background: "linear-gradient(135deg, #0D47A1, #1565C0)" } : {}}>
                {s === "All" ? "All" : STATUS_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>
          <button onClick={() => setPriorityFilter(priorityFilter === "Urgent" ? "All" : "Urgent")}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${priorityFilter === "Urgent" ? "bg-red-500 text-white border-red-400" : "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"}`}>
            🚨 Urgent Only
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">Loading requests…</div>
        ) : error ? (
          <div className="bg-red-50 rounded-2xl border border-red-100 p-8 text-center text-red-600">{error}</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
              return (
                <div key={req._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer"
                  onClick={() => setSelected(req)}>
                  <div className="flex items-center gap-4 px-6 py-4">
                    <div className="w-1.5 h-12 rounded-full flex-shrink-0" style={{ background: cfg.bar }}/>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #0D47A1, #1565C0)" }}>
                      {req.patientName?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-gray-800">{req.patientName}</span>
                        {req.channelingNo && <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Ch. #{req.channelingNo}</span>}
                        {req.priority === "Urgent" && <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-200">🚨 Urgent</span>}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {req.tests?.slice(0, 3).map(t => (
                          <span key={t.name} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{t.name}</span>
                        ))}
                        {req.tests?.length > 3 && <span className="text-xs text-gray-400">+{req.tests.length - 3}</span>}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()} · {req.labRequestId}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <span>{cfg.icon}</span> {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400">View Details →</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-4xl mb-3">🧪</div>
                <div className="text-gray-500 font-medium">No requests found</div>
              </div>
            )}
          </div>
        )}
      </div>
    </LabLayout>
  );
}