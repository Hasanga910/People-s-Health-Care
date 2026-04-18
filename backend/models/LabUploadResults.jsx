import { useState, useEffect, useRef } from "react";
import LabLayout from "../../components/LabLayout";
import api from "../../services/api";

// ─── Available tests ───────────────────────────────────────────────────────
const AVAILABLE_TESTS = ["FBC", "ESR", "FBS", "Liver Profile", "Renal Profile", "Thyroid Profile", "Serum Vit D Level", "Dengue Ag"];

const STAGES = ["pre_check", "sample_received", "in_progress", "completed"];
const STAGE_LABEL = {
  payment_pending: "Awaiting Payment",
  pre_check:       "Pre-Test Check",
  sample_received: "Sample Received",
  in_progress:     "Test In Progress",
  completed:       "Completed",
};

// ─── PDF Generator ────────────────────────────────────────────────────────
function generatePDF(testResult, patientName) {
  const { testName, results, preTestConditions, completedAt, testId } = testResult;
  const date = completedAt ? new Date(completedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) : "—";

  const rows = results?.parameters?.map(p => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #E0F2F1;font-size:13px;color:#1a1a2e;">${p.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #E0F2F1;font-weight:700;font-size:13px;color:${p.flag === "High" || p.flag === "Low" || p.flag === "Positive" || p.flag === "Reactive" ? "#B71C1C" : "#00695C"};">
        ${p.value || "—"} ${p.unit || ""}
        ${p.flag && p.flag !== "Normal" && p.flag !== "" ? `<span style="font-size:11px;color:#B71C1C;"> (${p.flag})</span>` : ""}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #E0F2F1;font-size:12px;color:#888;">${p.ref || ""}</td>
    </tr>`).join("") || "";

  const findings = results?.checkboxFindings?.filter(f => f.checked).map(f => `<li style="margin:4px 0;font-size:13px;">${f.label}</li>`).join("") || "";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  body{font-family:'Segoe UI',sans-serif;margin:0;padding:0;background:#fff;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style>
</head>
<body>
<div style="max-width:720px;margin:0 auto;padding:40px;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0D2137,#006064);color:#fff;padding:28px 32px;border-radius:12px 12px 0 0;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-size:22px;font-weight:700;font-family:Georgia,serif;">People's Health Care</div>
        <div style="font-size:12px;opacity:0.7;margin-top:4px;">Laboratory Services · Certified Medical Laboratory</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;opacity:0.7;">Report ID</div>
        <div style="font-size:16px;font-weight:700;font-family:monospace;">${testId}</div>
        <div style="font-size:11px;opacity:0.7;margin-top:4px;">${date}</div>
      </div>
    </div>
  </div>

  <!-- Patient bar -->
  <div style="background:#E0F2F1;padding:16px 32px;display:flex;justify-content:space-between;border-bottom:2px solid #006064;">
    <div>
      <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Patient</div>
      <div style="font-size:17px;font-weight:700;color:#0D2137;">${patientName}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Test</div>
      <div style="font-size:17px;font-weight:700;color:#006064;">${testName}</div>
    </div>
  </div>

  <!-- Results table -->
  <div style="margin-top:24px;">
    <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#006064;margin-bottom:12px;">Test Parameters</div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #E0F2F1;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#F0FAF9;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#00695C;letter-spacing:1px;">Parameter</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#00695C;letter-spacing:1px;">Result</th>
          <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#00695C;letter-spacing:1px;">Reference Range</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="3" style="padding:16px;text-align:center;color:#aaa;">No parameters recorded</td></tr>'}</tbody>
    </table>
  </div>

  <!-- Findings -->
  ${findings ? `
  <div style="margin-top:24px;">
    <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#006064;margin-bottom:12px;">Clinical Findings</div>
    <ul style="margin:0;padding:0 0 0 20px;background:#F9FFFE;border:1px solid #E0F2F1;border-radius:8px;padding:16px 16px 16px 36px;">
      ${findings}
    </ul>
  </div>` : ""}

  <!-- Lab notes -->
  ${results?.labNotes ? `
  <div style="margin-top:24px;">
    <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#006064;margin-bottom:12px;">Lab Notes</div>
    <div style="background:#FFFDE7;border:1px solid #FFF9C4;border-radius:8px;padding:16px;font-size:13px;color:#555;line-height:1.6;">
      ${results.labNotes}
    </div>
  </div>` : ""}

  <!-- Footer -->
  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #E0E0E0;display:flex;justify-content:space-between;font-size:11px;color:#aaa;">
    <div>Performed by: <strong style="color:#555;">${results?.performedBy || "Lab Staff"}</strong></div>
    <div>This report is confidential and intended only for the patient and requesting physician.</div>
  </div>

</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function LabUploadResults() {
  // Stage 1: select pending record
  const [pendingResults, setPendingResults] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  // Templates
  const [preTemplate, setPreTemplate] = useState(null);
  const [resultTemplate, setResultTemplate] = useState(null);

  // Pre-test form state
  const [preCheckboxes, setPreCheckboxes] = useState([]);
  const [preShortAnswers, setPreShortAnswers] = useState([]);

  // Result form state
  const [resultCheckboxes, setResultCheckboxes] = useState([]);
  const [resultParams, setResultParams] = useState([]);
  const [labNotes, setLabNotes] = useState("");
  const [performedBy, setPerformedBy] = useState("");

  const [stage, setStage] = useState("pre_check"); // current UI stage
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [completedResult, setCompletedResult] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoadingList(true);
    try {
      const res = await api.get("/lab-results?status=pre_check,sample_received,in_progress");
      setPendingResults(res.data.results || []);
    } catch {
      setPendingResults([]);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSelectResult = async (result) => {
    setSelectedResult(result);
    setStage(result.status);
    setSuccess(false);

    // Load templates
    try {
      const [preRes, resRes] = await Promise.all([
        api.get(`/lab-results/pre-conditions/${encodeURIComponent(result.testName)}`),
        api.get(`/lab-results/result-fields/${encodeURIComponent(result.testName)}`),
      ]);
      const preT = preRes.data.template;
      const resT = resRes.data.template;
      setPreTemplate(preT);
      setResultTemplate(resT);

      // Init pre-check form
      if (result.preTestConditions?.checkboxes?.length) {
        setPreCheckboxes(result.preTestConditions.checkboxes);
        setPreShortAnswers(result.preTestConditions.shortAnswers || []);
      } else {
        setPreCheckboxes(preT.checkboxes.map(label => ({ label, checked: false })));
        setPreShortAnswers(preT.shortAnswers.map(q => ({ question: q.question, answer: "" })));
      }

      // Init results form
      setResultCheckboxes(resT.checkboxes.map(c => ({ label: c.label, checked: c.defaultChecked })));
      setResultParams(resT.parameters.map(p => ({ ...p, value: "", flag: "Normal" })));
      setLabNotes("");
      setPerformedBy("");
    } catch (err) {
      console.error("Failed to load templates", err);
    }
  };

  const handleSavePreConditions = async () => {
    setSaving(true);
    try {
      await api.put(`/lab-results/${selectedResult._id}/pre-conditions`, {
        checkboxes: preCheckboxes,
        shortAnswers: preShortAnswers,
      });
      setStage("sample_received");
      setSelectedResult(prev => ({ ...prev, status: "sample_received" }));
      fetchPending();
    } catch (err) {
      alert("Error saving pre-conditions: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleStartTest = async () => {
    setSaving(true);
    try {
      await api.put(`/lab-results/${selectedResult._id}/start`);
      setStage("in_progress");
      setSelectedResult(prev => ({ ...prev, status: "in_progress" }));
      fetchPending();
    } catch (err) {
      alert("Error starting test: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleUploadResults = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/lab-results/${selectedResult._id}/upload-results`, {
        checkboxFindings: resultCheckboxes,
        parameters: resultParams,
        labNotes,
        performedBy,
      });
      setSuccess(true);
      setCompletedResult(res.data.result);
      setStage("completed");
      fetchPending();
    } catch (err) {
      alert("Error uploading results: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const togglePreCheckbox = (i) => {
    setPreCheckboxes(prev => prev.map((c, idx) => idx === i ? { ...c, checked: !c.checked } : c));
  };

  const updateShortAnswer = (i, value) => {
    setPreShortAnswers(prev => prev.map((q, idx) => idx === i ? { ...q, answer: value } : q));
  };

  const toggleResultCheckbox = (i) => {
    setResultCheckboxes(prev => prev.map((c, idx) => idx === i ? { ...c, checked: !c.checked } : c));
  };

  const updateParam = (i, field, value) => {
    setResultParams(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const patientName = selectedResult?.patientId?.name || "Patient";

  return (
    <LabLayout activePage="Upload Results">
      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Upload Test Results
          </h1>
          <p className="text-sm text-gray-400 mt-1">Complete pre-checks, run tests, and upload results for doctor and patient</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left — Pending list */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Awaiting Action</h3>
                <p className="text-xs text-gray-400 mt-0.5">Payment confirmed — select to process</p>
              </div>
              {loadingList ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
              ) : pendingResults.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No pending tests</div>
              ) : (
                <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                  {pendingResults.map(r => (
                    <div key={r._id}
                      onClick={() => handleSelectResult(r)}
                      className={`px-5 py-4 cursor-pointer transition ${selectedResult?._id === r._id ? "bg-teal-50 border-l-4 border-teal-500" : "hover:bg-gray-50"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-800">{r.patientId?.name || "—"}</span>
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                          {STAGE_LABEL[r.status] || r.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 font-mono">{r.testId}</div>
                      <div className="mt-1.5">
                        <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">🧪 {r.testName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Action area */}
          <div className="lg:col-span-2">
            {!selectedResult ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🧪</div>
                <h3 className="font-semibold text-gray-700">Select a Test</h3>
                <p className="text-sm text-gray-400 mt-1">Choose a pending test from the left panel to begin.</p>
              </div>
            ) : success ? (
              // ── Success state ───────────────────────────────────────
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="font-bold text-green-800 text-lg">Results Uploaded Successfully!</p>
                  <p className="text-sm text-green-700 mt-1">The doctor and patient have been notified and can now view the results.</p>
                </div>
                <button
                  onClick={() => completedResult && generatePDF(completedResult, patientName)}
                  className="w-full py-3 rounded-2xl text-white font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}>
                  📥 Download PDF Report
                </button>
                <button
                  onClick={() => { setSelectedResult(null); setSuccess(false); setCompletedResult(null); }}
                  className="w-full py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Process Another Test
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Patient info bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}>
                    {patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{patientName}</div>
                    <div className="text-xs text-gray-500 font-mono">{selectedResult.testId} · 🧪 {selectedResult.testName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Payment ID: <span className="text-teal-700 font-semibold">{selectedResult.paymentId}</span>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                      💳 Payment Confirmed
                    </span>
                  </div>
                </div>

                {/* ── PRE-TEST CHECK ──────────────────────────────────── */}
                {(stage === "pre_check" || stage === "payment_pending") && preTemplate && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100"
                      style={{ background: "linear-gradient(135deg, #EDE7F6, #D1C4E9)" }}>
                      <h3 className="font-semibold text-gray-800">📋 Pre-Test Conditions</h3>
                      <p className="text-xs text-gray-500 mt-1">Verify all conditions before collecting sample from patient</p>
                    </div>
                    <div className="p-6 space-y-5">
                      <div className="space-y-3">
                        {preCheckboxes.map((item, i) => (
                          <label key={i} className="flex items-start gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition ${item.checked ? "bg-teal-500 border-teal-500" : "border-gray-300 group-hover:border-teal-400"}`}
                              onClick={() => togglePreCheckbox(i)}>
                              {item.checked && <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            </div>
                            <span className={`text-sm leading-relaxed ${item.checked ? "text-gray-700" : "text-gray-500"}`}>{item.label}</span>
                          </label>
                        ))}
                      </div>

                      {preShortAnswers.length > 0 && (
                        <div className="space-y-4 border-t border-gray-100 pt-4">
                          {preShortAnswers.map((q, i) => (
                            <div key={i}>
                              <label className="block text-xs font-semibold text-gray-600 mb-1.5">{q.question}</label>
                              <textarea
                                value={q.answer}
                                onChange={e => updateShortAnswer(i, e.target.value)}
                                placeholder="Type your answer…"
                                rows={2}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <button onClick={handleSavePreConditions} disabled={saving}
                        className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #6A1B9A, #4527A0)" }}>
                        {saving ? "Saving…" : "✅ Confirm & Mark Sample Received"}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── SAMPLE RECEIVED — start test button ────────────── */}
                {stage === "sample_received" && (
                  <div className="bg-white rounded-2xl border border-cyan-200 shadow-sm p-6 text-center">
                    <div className="text-4xl mb-3">💉</div>
                    <p className="font-semibold text-gray-800">Sample Received</p>
                    <p className="text-sm text-gray-500 mt-1">Pre-test conditions confirmed. Ready to begin analysis.</p>
                    <button onClick={handleStartTest} disabled={saving}
                      className="mt-5 px-8 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #1565C0, #0288D1)" }}>
                      {saving ? "Starting…" : "🔬 Start Test"}
                    </button>
                  </div>
                )}

                {/* ── ENTER RESULTS ───────────────────────────────────── */}
                {stage === "in_progress" && resultTemplate && (
                  <div className="space-y-5">
                    {/* Checkbox findings */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100"
                        style={{ background: "linear-gradient(135deg, #E0F2F1, #B2DFDB)" }}>
                        <h3 className="font-semibold text-gray-800">🔬 Clinical Findings</h3>
                        <p className="text-xs text-gray-500 mt-1">Check all that apply based on analysis</p>
                      </div>
                      <div className="p-6 space-y-3">
                        {resultCheckboxes.map((item, i) => (
                          <label key={i} className="flex items-start gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border-2 flex items-center justify-center transition ${item.checked ? "bg-teal-500 border-teal-500" : "border-gray-300 group-hover:border-teal-400"}`}
                              onClick={() => toggleResultCheckbox(i)}>
                              {item.checked && <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            </div>
                            <span className={`text-sm leading-relaxed ${item.checked ? "text-teal-800 font-medium" : "text-gray-500"}`}>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Parameter values */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100"
                        style={{ background: "linear-gradient(135deg, #E3F2FD, #BBDEFB)" }}>
                        <h3 className="font-semibold text-gray-800">📊 Test Parameters</h3>
                        <p className="text-xs text-gray-500 mt-1">Enter measured values for each parameter</p>
                      </div>
                      <div className="p-6 space-y-4">
                        {resultParams.map((p, i) => (
                          <div key={p.name} className="grid grid-cols-3 gap-3 items-start">
                            <div>
                              <div className="text-xs font-semibold text-gray-700">{p.name}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{p.ref}</div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Value {p.unit ? `(${p.unit})` : ""}</label>
                              <input
                                type="text"
                                value={p.value}
                                onChange={e => updateParam(i, "value", e.target.value)}
                                placeholder={p.unit || "Enter value"}
                                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">Flag</label>
                              <div className="flex flex-wrap gap-1.5">
                                {(p.unit === "" ? ["Negative", "Positive", "Reactive"] : ["Normal", "High", "Low"]).map(flag => {
                                  const colors = {
                                    Normal: "bg-green-100 text-green-700 border-green-200",
                                    High: "bg-red-100 text-red-600 border-red-200",
                                    Low: "bg-blue-100 text-blue-600 border-blue-200",
                                    Negative: "bg-green-100 text-green-700 border-green-200",
                                    Positive: "bg-red-100 text-red-600 border-red-200",
                                    Reactive: "bg-orange-100 text-orange-600 border-orange-200",
                                  };
                                  return (
                                    <button key={flag} onClick={() => updateParam(i, "flag", flag)}
                                      className={`px-2 py-1 rounded-lg text-xs font-semibold border transition ${p.flag === flag ? colors[flag] : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                                      {flag}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lab notes */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Lab Notes & Observations</label>
                      <textarea
                        value={labNotes}
                        onChange={e => setLabNotes(e.target.value)}
                        placeholder="Add clinical interpretation, notes, or recommendations for the doctor…"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                      />
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Performed By</label>
                        <input
                          type="text"
                          value={performedBy}
                          onChange={e => setPerformedBy(e.target.value)}
                          placeholder="Lab staff name"
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                        />
                      </div>
                    </div>

                    <button onClick={handleUploadResults} disabled={saving}
                      className="w-full py-4 rounded-2xl text-white font-semibold text-sm shadow-xl disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}>
                      {saving ? "Uploading…" : "📤 Upload Results & Notify Doctor + Patient"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </LabLayout>
  );
}
