import { useState } from "react";
import LabLayout from "../../components/LabLayout";

const ALL_REPORTS = [
  {
    id: "LR-2026-045", patient: "Nimesha Silva", age: 29, channeling: "019",
    date: "15 Feb 2026", completedAt: "15 Feb 2026, 11:45 AM",
    tests: ["CBC (Full Blood Count)", "Urine Analysis"],
    status: "Uploaded", flagged: false,
    results: [
      { test: "CBC (Full Blood Count)", params: [
        { name: "Haemoglobin", value: "13.2 g/dL", flag: "Normal", ref: "12.0–15.5" },
        { name: "WBC Count", value: "6.8 × 10³/µL", flag: "Normal", ref: "4.5–11.0" },
        { name: "Platelet Count", value: "248 × 10³/µL", flag: "Normal", ref: "150–400" },
      ]},
      { test: "Urine Analysis", params: [
        { name: "Colour", value: "Pale Yellow", flag: "Normal", ref: "Pale Yellow" },
        { name: "Protein", value: "Negative", flag: "Normal", ref: "Negative" },
        { name: "Glucose", value: "Negative", flag: "Normal", ref: "Negative" },
        { name: "Leukocytes", value: "Negative", flag: "Normal", ref: "Negative" },
      ]},
    ],
    labNotes: "All results within normal limits. No further action required.",
  },
  {
    id: "LR-2026-044", patient: "Ruwan Fernando", age: 47, channeling: "017",
    date: "15 Feb 2026", completedAt: "15 Feb 2026, 12:10 PM",
    tests: ["Lipid Profile", "Serum Creatinine"],
    status: "Uploaded", flagged: true,
    results: [
      { test: "Lipid Profile", params: [
        { name: "Total Cholesterol", value: "228 mg/dL", flag: "High", ref: "< 200" },
        { name: "HDL Cholesterol", value: "38 mg/dL", flag: "Low", ref: "> 40" },
        { name: "LDL Cholesterol", value: "158 mg/dL", flag: "High", ref: "< 130" },
        { name: "Triglycerides", value: "162 mg/dL", flag: "High", ref: "< 150" },
      ]},
      { test: "Serum Creatinine", params: [
        { name: "Serum Creatinine", value: "1.4 mg/dL", flag: "High", ref: "0.7–1.3" },
      ]},
    ],
    labNotes: "Lipid values significantly elevated. LDL and triglycerides above optimal. Creatinine slightly above normal range — kidney function review recommended.",
  },
  {
    id: "LR-2026-041", patient: "Kamal Perera", age: 54, channeling: "012",
    date: "15 Feb 2026", completedAt: "15 Feb 2026, 08:50 AM",
    tests: ["CBC (Full Blood Count)", "Fasting Blood Glucose"],
    status: "Uploaded", flagged: true,
    results: [
      { test: "CBC (Full Blood Count)", params: [
        { name: "Haemoglobin", value: "14.1 g/dL", flag: "Normal", ref: "13.0–17.5" },
        { name: "WBC Count", value: "7.2 × 10³/µL", flag: "Normal", ref: "4.5–11.0" },
        { name: "Platelet Count", value: "245 × 10³/µL", flag: "Normal", ref: "150–400" },
      ]},
      { test: "Fasting Blood Glucose", params: [
        { name: "Fasting Blood Glucose", value: "148 mg/dL", flag: "High", ref: "70–99 (Normal)" },
      ]},
    ],
    labNotes: "CBC normal. Blood glucose elevated — consistent with poorly controlled Type 2 Diabetes. Doctor review recommended.",
  },
  {
    id: "LR-2026-040", patient: "Amali Jayasena", age: 34, channeling: "014",
    date: "14 Feb 2026", completedAt: "14 Feb 2026, 02:30 PM",
    tests: ["Lipid Profile"],
    status: "Uploaded", flagged: false,
    results: [
      { test: "Lipid Profile", params: [
        { name: "Total Cholesterol", value: "185 mg/dL", flag: "Normal", ref: "< 200" },
        { name: "HDL Cholesterol", value: "55 mg/dL", flag: "Normal", ref: "> 50 (F)" },
        { name: "LDL Cholesterol", value: "112 mg/dL", flag: "Normal", ref: "< 130" },
        { name: "Triglycerides", value: "90 mg/dL", flag: "Normal", ref: "< 150" },
      ]},
    ],
    labNotes: "Lipid profile within normal limits. Continue current lifestyle.",
  },
  {
    id: "LR-2026-039", patient: "Anura Dissanayake", age: 61, channeling: "011",
    date: "14 Feb 2026", completedAt: "14 Feb 2026, 04:15 PM",
    tests: ["ECG"],
    status: "Uploaded", flagged: false,
    results: [
      { test: "ECG", params: [
        { name: "Heart Rate", value: "78 bpm", flag: "Normal", ref: "60–100" },
        { name: "PR Interval", value: "162 ms", flag: "Normal", ref: "120–200" },
        { name: "QRS Duration", value: "88 ms", flag: "Normal", ref: "< 120" },
        { name: "Rhythm", value: "Normal Sinus Rhythm", flag: "Normal", ref: "Normal Sinus Rhythm" },
      ]},
    ],
    labNotes: "ECG findings within normal limits. No significant ST or T-wave changes noted.",
  },
  {
    id: "LR-2026-038", patient: "Priya Gamage", age: 42, channeling: "009",
    date: "13 Feb 2026", completedAt: "13 Feb 2026, 10:20 AM",
    tests: ["Thyroid Function (TSH)"],
    status: "Pending Upload", flagged: false,
    results: [],
    labNotes: "",
  },
];

const FLAG_STYLES = {
  Normal: "bg-green-100 text-green-700",
  High: "bg-red-100 text-red-600",
  Low: "bg-blue-100 text-blue-600",
  Positive: "bg-red-100 text-red-600",
  Negative: "bg-green-100 text-green-700",
};

function ReportModal({ report, onClose }) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D2137, #006064)" }}>
          <div>
            <p className="text-white/60 text-xs">Laboratory Report</p>
            <h3 className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              {report.id}
            </h3>
            <p className="text-white/60 text-xs mt-0.5">{report.completedAt} · Ch. #{report.channeling}</p>
          </div>
          <div className="flex items-center gap-3">
            {report.flagged && (
              <span className="text-xs bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full border border-red-300">
                ⚠️ Abnormal Values
              </span>
            )}
            <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Clinic & patient header */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Laboratory</p>
              <p className="font-bold text-gray-800">People's Health Care</p>
              <p className="text-xs text-gray-500">Diagnostic Laboratory · Matara</p>
              <p className="text-xs text-gray-500">Referred by Dr. M.T.D. Jayaweera</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Patient</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}>
                  {report.patient.split(" ").map(n => n[0]).join("").slice(0,2)}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{report.patient}</p>
                  <p className="text-xs text-gray-500">Age {report.age} · Ch. #{report.channeling}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results for each test */}
          {report.results.map(section => (
            <div key={section.test}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="text-base">🧪</span> {section.test}
              </p>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Parameter</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Result</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Reference Range</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {section.params.map(param => (
                      <tr key={param.name} className={param.flag !== "Normal" ? "bg-red-50" : ""}>
                        <td className="px-4 py-3 text-xs font-medium text-gray-700">{param.name}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold text-sm ${param.flag !== "Normal" ? "text-red-600" : "text-gray-800"}`}>
                            {param.value}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{param.ref}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FLAG_STYLES[param.flag] || "bg-gray-100 text-gray-500"}`}>
                            {param.flag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Lab notes */}
          {report.labNotes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lab Notes</p>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                📝 {report.labNotes}
              </div>
            </div>
          )}

          {report.flagged && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-red-800 mb-1">⚠️ Abnormal Values Detected</p>
              <p className="text-xs text-red-700">
                One or more parameters are outside the reference range. The doctor has been notified and patient will be advised accordingly.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}>
              🖨️ Print Report
            </button>
            <button className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition flex items-center gap-1.5">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download PDF
            </button>
            <button onClick={onClose} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LabReports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [flagFilter, setFlagFilter] = useState(false);

  const filtered = ALL_REPORTS.filter(r => {
    const matchSearch = r.patient.toLowerCase().includes(search.toLowerCase()) ||
      r.id.includes(search) || r.tests.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    const matchFlag = !flagFilter || r.flagged;
    return matchSearch && matchStatus && matchFlag;
  });

  return (
    <LabLayout activePage="All Reports">
      {selectedReport && <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            All Lab Reports
          </h1>
          <p className="text-sm text-gray-400 mt-1">Complete history of completed and uploaded laboratory test results</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Reports", value: ALL_REPORTS.length, color: "#006064", bg: "#E0F2F1" },
            { label: "Uploaded", value: ALL_REPORTS.filter(r => r.status === "Uploaded").length, color: "#00897B", bg: "#E0F2F1" },
            { label: "Pending Upload", value: ALL_REPORTS.filter(r => r.status === "Pending Upload").length, color: "#E65100", bg: "#FFF3E0" },
            { label: "With Abnormal Values", value: ALL_REPORTS.filter(r => r.flagged).length, color: "#B71C1C", bg: "#FFEBEE" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48 relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input type="text" placeholder="Search patient, ID, or test name..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
          </div>

          <div className="flex gap-2">
            {["All", "Uploaded", "Pending Upload"].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  statusFilter === f ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={statusFilter === f ? { background: "linear-gradient(135deg, #006064, #00838F)" } : {}}>
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={() => setFlagFilter(!flagFilter)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
              flagFilter ? "bg-red-500 text-white border-red-400" : "border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600"
            }`}>
            ⚠️ Abnormal Only
          </button>
        </div>

        {/* Reports list */}
        <div className="space-y-3">
          {filtered.map(report => (
            <div key={report.id}
              className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden ${
                report.flagged ? "border-red-100" : "border-gray-100"
              }`}>
              <div className="flex items-center gap-4 px-6 py-4">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}>
                  {report.patient.split(" ").map(n => n[0]).join("").slice(0,2)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-gray-800">{report.patient}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Age {report.age}</span>
                    <span className="font-mono text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">Ch. #{report.channeling}</span>
                    {report.flagged && (
                      <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-200">⚠️ Abnormal</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {report.tests.map(t => (
                      <span key={t} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{report.completedAt} · {report.id}</div>
                </div>

                {/* Status & action */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                    report.status === "Uploaded"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  }`}>
                    {report.status === "Uploaded" ? "✅ Uploaded" : "⏳ Pending Upload"}
                  </span>

                  {report.status === "Uploaded" ? (
                    <button onClick={() => setSelectedReport(report)}
                      className="text-xs font-semibold text-teal-600 hover:underline">
                      View Report →
                    </button>
                  ) : (
                    <a href="/lab/upload" className="text-xs font-semibold text-amber-600 hover:underline">
                      Upload Now →
                    </a>
                  )}
                </div>
              </div>

              {/* Preview bar */}
              {report.results.length > 0 && (
                <div className="border-t border-gray-50 px-6 py-3 bg-gray-50 flex flex-wrap gap-4">
                  {report.results.flatMap(s => s.params).slice(0, 4).map(param => (
                    <div key={param.name} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${param.flag !== "Normal" ? "bg-red-400" : "bg-green-400"}`} />
                      <span className="text-xs text-gray-500">{param.name}:</span>
                      <span className={`text-xs font-semibold ${param.flag !== "Normal" ? "text-red-600" : "text-gray-700"}`}>
                        {param.value}
                      </span>
                    </div>
                  ))}
                  {report.results.flatMap(s => s.params).length > 4 && (
                    <span className="text-xs text-gray-400">
                      +{report.results.flatMap(s => s.params).length - 4} more parameters
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <div className="text-gray-500 font-medium">No reports found</div>
              <div className="text-gray-400 text-sm mt-1">Try adjusting your search or filters.</div>
            </div>
          )}
        </div>
      </div>
    </LabLayout>
  );
}
