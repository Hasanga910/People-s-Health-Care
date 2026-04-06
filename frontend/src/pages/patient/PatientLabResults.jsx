import { useState } from "react";
import PatientLayout from "../../components/PatientLayout";

const LAB_RESULTS = [
  {
    id: "LR-2026-041",
    date: "10 Feb 2026",
    requestDate: "08 Feb 2026",
    channeling: "012",
    tests: [
      { name: "Full Blood Count (CBC)", result: "Normal", value: "Within range", unit: "", flag: false, ref: "See report" },
      { name: "Haemoglobin", result: "13.8 g/dL", value: "13.8", unit: "g/dL", flag: false, ref: "13.0–17.5" },
      { name: "WBC", result: "7.2 × 10³/µL", value: "7.2", unit: "× 10³/µL", flag: false, ref: "4.5–11.0" },
      { name: "Platelets", result: "245 × 10³/µL", value: "245", unit: "× 10³/µL", flag: false, ref: "150–400" },
    ],
    labNotes: "All CBC parameters are within normal limits. No action required.",
    status: "Ready",
    flagged: false,
  },
  {
    id: "LR-2026-042",
    date: "10 Feb 2026",
    requestDate: "08 Feb 2026",
    channeling: "012",
    tests: [
      { name: "Fasting Blood Glucose", result: "148 mg/dL", value: "148", unit: "mg/dL", flag: true, ref: "70–99" },
      { name: "Random Blood Glucose", result: "210 mg/dL", value: "210", unit: "mg/dL", flag: true, ref: "< 140" },
    ],
    labNotes: "Blood glucose levels are elevated above normal fasting range. Suggests poorly controlled diabetes. Doctor review recommended.",
    status: "Ready",
    flagged: true,
  },
  {
    id: "LR-2026-031",
    date: "25 Jan 2026",
    requestDate: "22 Jan 2026",
    channeling: "009",
    tests: [
      { name: "Total Cholesterol", result: "185 mg/dL", value: "185", unit: "mg/dL", flag: false, ref: "< 200" },
      { name: "HDL Cholesterol", result: "42 mg/dL", value: "42", unit: "mg/dL", flag: false, ref: "> 40" },
      { name: "LDL Cholesterol", result: "118 mg/dL", value: "118", unit: "mg/dL", flag: false, ref: "< 130" },
      { name: "Triglycerides", result: "124 mg/dL", value: "124", unit: "mg/dL", flag: false, ref: "< 150" },
    ],
    labNotes: "Lipid profile is within acceptable range. Continue current dietary habits and exercise.",
    status: "Ready",
    flagged: false,
  },
  {
    id: "LR-2026-032",
    date: "25 Jan 2026",
    requestDate: "22 Jan 2026",
    channeling: "009",
    tests: [
      { name: "ECG Rhythm", result: "Normal Sinus Rhythm", value: "", unit: "", flag: false, ref: "Normal" },
      { name: "Heart Rate", result: "78 bpm", value: "78", unit: "bpm", flag: false, ref: "60–100" },
      { name: "PR Interval", result: "162 ms", value: "162", unit: "ms", flag: false, ref: "120–200" },
    ],
    labNotes: "Normal ECG findings. No significant ST or T-wave changes. Cardiac function appears stable.",
    status: "Ready",
    flagged: false,
  },
];

function ResultModal({ report, onClose }) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #7B1FA2, #1565C0)" }}
        >
          <div>
            <p className="text-white/60 text-xs">Laboratory Report</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              {report.id}
            </h3>
            <p className="text-white/60 text-xs mt-0.5">{report.date} · Ch. #{report.channeling}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #00ACC1, #1565C0)" }}
            >
              KP
            </div>
            <div>
              <div className="font-semibold text-gray-800">Kamal Perera</div>
              <div className="text-xs text-gray-500">Age 54 · Male · PHC-2026-0012</div>
            </div>
            {report.flagged && (
              <div className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                ⚠️ Abnormal Values
              </div>
            )}
          </div>

          {/* Test results table */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Test Results</p>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Test</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Result</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {report.tests.map((test) => (
                    <tr key={test.name} className={test.flag ? "bg-red-50" : ""}>
                      <td className="px-4 py-3 text-gray-700 text-xs font-medium">{test.name}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold text-sm ${test.flag ? "text-red-600" : "text-green-700"}`}>
                          {test.result}
                          {test.flag && " ↑"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{test.ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lab notes */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Lab Notes</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
              {report.labNotes}
            </div>
          </div>

          {report.flagged && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
              <p className="font-semibold mb-1">⚠️ Action Required</p>
              <p className="text-xs">Some values are outside the normal range. Please consult Dr. M.T.D. Jayaweera at your earliest convenience. Call <strong>0777 883 343</strong> to book an urgent appointment.</p>
            </div>
          )}

          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg, #7B1FA2, #1565C0)" }}>
              Download Report
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

export default function PatientLabResults() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [filter, setFilter] = useState("All");

  const filtered = LAB_RESULTS.filter((r) =>
    filter === "All" ? true : filter === "Flagged" ? r.flagged : !r.flagged
  );

  const flaggedCount = LAB_RESULTS.filter((r) => r.flagged).length;

  return (
    <PatientLayout activePage="Lab Results">
      {selectedReport && <ResultModal report={selectedReport} onClose={() => setSelectedReport(null)} />}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Lab Results & Reports
          </h1>
          <p className="text-sm text-gray-400 mt-1">Your diagnostic test results from People's Health Care Laboratory</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Reports", value: LAB_RESULTS.length, color: "#1565C0", bg: "#E3F2FD" },
            { label: "All Ready", value: LAB_RESULTS.filter(r => r.status === "Ready").length, color: "#00897B", bg: "#E0F2F1" },
            { label: "Flagged Values", value: flaggedCount, color: "#B71C1C", bg: "#FFEBEE" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Flagged alert */}
        {flaggedCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="text-xl flex-shrink-0">🚨</div>
            <div>
              <p className="text-sm font-semibold text-red-800">Attention Required</p>
              <p className="text-xs text-red-700 mt-1">
                {flaggedCount} of your recent lab reports contain values outside the normal range. 
                Please consult Dr. Jayaweera as soon as possible. Call <strong>0777 883 343</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-2">
          {["All", "Normal", "Flagged"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filter === f
                  ? f === "Flagged" ? "bg-red-500 text-white shadow-md" : "text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={filter === f && f !== "Flagged" ? { background: "linear-gradient(135deg, #1565C0, #00ACC1)" } : {}}
            >
              {f === "Flagged" && "⚠️ "}{f}
            </button>
          ))}
        </div>

        {/* Lab result cards */}
        <div className="space-y-3">
          {filtered.map((report) => (
            <div
              key={report.id}
              className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden ${
                report.flagged ? "border-red-200" : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-4 px-6 py-4">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: report.flagged ? "#FFEBEE" : "#F3E5F5" }}
                >
                  {report.flagged ? "⚠️" : "🧪"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="font-mono text-xs text-gray-400">{report.id}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Ch. #{report.channeling}</span>
                    {report.flagged && (
                      <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full border border-red-200">
                        Abnormal Values
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-gray-800">
                    {report.tests.map(t => t.name).join(", ")}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">Collected: {report.requestDate} · Results: {report.date}</div>
                </div>

                {/* Status & action */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                    ✅ {report.status}
                  </span>
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition"
                    style={{ background: "linear-gradient(135deg, #7B1FA2, #1565C0)" }}
                  >
                    View Report →
                  </button>
                </div>
              </div>

              {/* Quick values preview */}
              <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex flex-wrap gap-3">
                {report.tests.slice(0, 3).map((test) => (
                  <div key={test.name} className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${test.flag ? "bg-red-400" : "bg-green-400"}`} />
                    <span className="text-xs text-gray-500">{test.name}:</span>
                    <span className={`text-xs font-semibold ${test.flag ? "text-red-600" : "text-gray-700"}`}>
                      {test.result}
                    </span>
                  </div>
                ))}
                {report.tests.length > 3 && (
                  <span className="text-xs text-gray-400">+{report.tests.length - 3} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PatientLayout>
  );
}
