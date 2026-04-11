import { useState, useEffect, useCallback } from "react";
import PharmacyLayout from "../../components/PharmacyLayout";
import api from "../../services/api";

// ── Status config (matches backend pharmacyStatus enum) ────────
const STATUS_CONFIG = {
  pending:     { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-200",  bar: "#fbbf24", icon: "⏳", label: "Pending"     },
  in_progress: { bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200",   bar: "#60a5fa", icon: "🔄", label: "In Progress" },
  dispensed:   { bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-200",   bar: "#d1d5db", icon: "📦", label: "Dispensed"   },
};

function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// ── Dispense confirmation modal ────────────────────────────────
function DispenseModal({ rx, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D2137, #2E7D32)" }}>
          <div>
            <p className="text-white/60 text-xs">Dispense Prescription</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              {rx.prescriptionId}
            </h3>
            <p className="text-white/60 text-xs mt-0.5">
              {rx.patientName} · Ch. #{rx.channelingNo || "—"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Patient</p>
              <p className="font-bold text-gray-800">{rx.patientName}</p>
              <p className="text-xs text-gray-500 font-mono">{rx.patientId || "—"} · Ch. #{rx.channelingNo || "—"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Prescribed By</p>
              <p className="font-bold text-gray-800 text-sm">{rx.doctorName}</p>
              <p className="text-xs text-gray-500">Issued: {formatTime(rx.createdAt)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Medications to Dispense</p>
            <div className="space-y-2">
              {rx.medications?.map((med, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center text-lg flex-shrink-0">💊</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{med.name}</p>
                    <p className="text-xs text-gray-500">{med.dosage} · {med.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {rx.clinicalNotes && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase mb-1">Doctor's Notes</p>
              <p className="text-sm text-blue-800">{rx.clinicalNotes}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
              {loading ? "Dispensing…" : "✅ Confirm & Dispense"}
            </button>
            <button onClick={onClose} disabled={loading}
              className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function PharmacyQueue() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [filter,         setFilter]        = useState("All");
  const [dispenseRx,     setDispenseRx]    = useState(null);
  const [expandedId,     setExpandedId]    = useState(null);
  const [actionLoading,  setActionLoading] = useState(null); // rx._id being acted on
  const [toast,          setToast]         = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Load today's prescriptions (pending + in_progress only) ──
  // The backend getPrescriptions returns pending + dispensed by default;
  // pharmacy needs all non-dispensed ones to manage the queue.
  const loadPrescriptions = useCallback(async () => {
    try {
      const res = await api.get("/prescriptions?limit=100");
      setPrescriptions(res.data.prescriptions || []);
    } catch {
      showToast("Failed to load prescriptions", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPrescriptions(); }, [loadPrescriptions]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const iv = setInterval(loadPrescriptions, 30_000);
    return () => clearInterval(iv);
  }, [loadPrescriptions]);

  // ── Mark In Progress ──────────────────────────────────────────
  // Called when pharmacy clicks "Start Preparing"
  const handleStartPreparing = async (rx) => {
    setActionLoading(rx._id);
    try {
      const res = await api.put(`/prescriptions/${rx._id}/in-progress`);
      setPrescriptions(prev => prev.map(p => p._id === rx._id ? res.data.prescription : p));
      showToast(`${rx.prescriptionId} — preparation started`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Mark Dispensed ────────────────────────────────────────────
  const handleDispense = async () => {
    if (!dispenseRx) return;
    setActionLoading(dispenseRx._id);
    try {
      const res = await api.put(`/prescriptions/${dispenseRx._id}/dispense`);
      setPrescriptions(prev => prev.map(p => p._id === dispenseRx._id ? res.data.prescription : p));
      showToast(`${dispenseRx.prescriptionId} — dispensed successfully`);
      setDispenseRx(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to dispense", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filter & counts ───────────────────────────────────────────
  const pending    = prescriptions.filter(p => p.pharmacyStatus === "pending").length;
  const inProgress = prescriptions.filter(p => p.pharmacyStatus === "in_progress").length;
  const dispensed  = prescriptions.filter(p => p.pharmacyStatus === "dispensed").length;

  const filtered = prescriptions.filter(rx => {
    if (filter === "All")         return rx.pharmacyStatus !== "dispensed"; // hide dispensed in "All"
    if (filter === "Pending")     return rx.pharmacyStatus === "pending";
    if (filter === "In Progress") return rx.pharmacyStatus === "in_progress";
    if (filter === "Dispensed")   return rx.pharmacyStatus === "dispensed";
    return true;
  });

  return (
    <PharmacyLayout activePage="Dispensing Queue">

      {/* ── Toast ──────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl border shadow-lg text-sm font-medium ${
          toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* ── Dispense modal ──────────────────────────────────── */}
      {dispenseRx && (
        <DispenseModal
          rx={dispenseRx}
          onClose={() => setDispenseRx(null)}
          onConfirm={handleDispense}
          loading={actionLoading === dispenseRx._id}
        />
      )}

      <div className="p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Dispensing Queue
            </h1>
            <p className="text-sm text-gray-400 mt-1">Process prescriptions from today's consultations</p>
          </div>
          <button onClick={loadPrescriptions}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Pending",        value: pending,    color: "#E65100", bg: "#FFF3E0" },
            { label: "In Progress",    value: inProgress, color: "#1565C0", bg: "#E3F2FD" },
            { label: "Dispensed Today",value: dispensed,  color: "#37474F", bg: "#ECEFF1" },
            { label: "Queue Total",    value: pending + inProgress, color: "#2E7D32", bg: "#E8F5E9" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-2">
          {["All", "Pending", "In Progress", "Dispensed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={filter === f ? { background: "linear-gradient(135deg, #1565C0, #00ACC1)" } : {}}>
              {f}
              {f === "Pending"     && pending    > 0 && <span className="ml-1.5 text-xs bg-white/30 px-1.5 py-0.5 rounded-full">{pending}</span>}
              {f === "In Progress" && inProgress > 0 && <span className="ml-1.5 text-xs bg-white/30 px-1.5 py-0.5 rounded-full">{inProgress}</span>}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(rx => {
              const style     = STATUS_CONFIG[rx.pharmacyStatus] || STATUS_CONFIG.pending;
              const isExpanded = expandedId === rx._id;
              const isActing   = actionLoading === rx._id;

              return (
                <div key={rx._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">

                  {/* Row */}
                  <div className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => setExpandedId(isExpanded ? null : rx._id)}>
                    <div className="w-1.5 h-12 rounded-full flex-shrink-0" style={{ background: style.bar }}/>

                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                      💊
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-semibold text-gray-800">{rx.patientName}</span>
                        {rx.channelingNo && (
                          <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            Ch. #{rx.channelingNo}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {rx.medications?.map(m => m.name).join(" · ")}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {formatTime(rx.createdAt)} · <span className="font-mono">{rx.prescriptionId}</span> · {rx.medications?.length || 0} items
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${style.bg} ${style.text} ${style.border}`}>
                        {style.icon} {style.label}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{rx.doctorName}</span>
                    </div>

                    <svg viewBox="0 0 20 20" fill="currentColor"
                      className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}>
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">

                        {/* Medications */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Medications</p>
                          <div className="space-y-2">
                            {rx.medications?.map((med, i) => (
                              <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">💊 {med.name}</p>
                                  <p className="text-xs text-gray-400">{med.dosage} · {med.duration} · {med.frequency}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                          {rx.clinicalNotes && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Doctor's Notes</p>
                              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800">
                                📝 {rx.clinicalNotes}
                              </div>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prescription Info</p>
                            <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-1.5 text-xs text-gray-600">
                              <div className="flex justify-between">
                                <span>Prescribed by</span>
                                <span className="font-medium">{rx.doctorName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Issued at</span>
                                <span className="font-medium">{formatTime(rx.createdAt)}</span>
                              </div>
                              {rx.appointmentId && (
                                <div className="flex justify-between">
                                  <span>Appointment</span>
                                  <span className="font-mono text-blue-600">{rx.appointmentId}</span>
                                </div>
                              )}
                              {rx.patientId && (
                                <div className="flex justify-between">
                                  <span>Patient ID</span>
                                  <span className="font-mono">{rx.patientId}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        {/* START PREPARING — shown only for pending */}
                        {rx.pharmacyStatus === "pending" && (
                          <button
                            onClick={() => handleStartPreparing(rx)}
                            disabled={isActing}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition hover:opacity-90 disabled:opacity-60"
                            style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                            {isActing ? (
                              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                              </svg>Starting…</>
                            ) : "🔄 Start Preparing"}
                          </button>
                        )}

                        {/* DISPENSE — shown for in_progress */}
                        {rx.pharmacyStatus === "in_progress" && (
                          <button
                            onClick={() => setDispenseRx(rx)}
                            disabled={isActing}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition hover:opacity-90 disabled:opacity-60"
                            style={{ background: "linear-gradient(135deg, #2E7D32, #00897B)" }}>
                            ✅ Dispense to Patient
                          </button>
                        )}

                        {rx.pharmacyStatus === "dispensed" && (
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 font-medium">
                            ✅ Dispensed at {formatTime(rx.dispensedAt)}
                          </div>
                        )}

                        <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-100 transition">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"/>
                          </svg>
                          Print Label
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div className="text-4xl mb-3">💊</div>
                <div className="text-gray-500 font-medium">No prescriptions found</div>
                <div className="text-gray-400 text-sm mt-1">
                  {filter === "All" ? "No active prescriptions in the queue" : `No ${filter.toLowerCase()} prescriptions`}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PharmacyLayout>
  );
}