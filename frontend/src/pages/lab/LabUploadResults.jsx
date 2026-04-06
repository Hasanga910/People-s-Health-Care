import { useState } from "react";
import LabLayout from "../../components/LabLayout";

const PENDING_UPLOAD = [
  { id: "LR-2026-043", patient: "Dilani Bandara", age: 38, channeling: "016", tests: ["ECG", "Fasting Blood Glucose"] },
  { id: "LR-2026-044", patient: "Ruwan Fernando", age: 47, channeling: "017", tests: ["Lipid Profile", "Serum Creatinine"] },
];

const RESULT_FIELDS = {
  "CBC (Full Blood Count)": [
    { name: "Haemoglobin", unit: "g/dL", ref: "13.0–17.5 (M), 12.0–15.5 (F)" },
    { name: "WBC Count", unit: "× 10³/µL", ref: "4.5–11.0" },
    { name: "Platelet Count", unit: "× 10³/µL", ref: "150–400" },
    { name: "Neutrophils", unit: "%", ref: "50–70" },
    { name: "Lymphocytes", unit: "%", ref: "20–40" },
  ],
  "Fasting Blood Glucose": [
    { name: "Fasting Blood Glucose", unit: "mg/dL", ref: "70–99 (Normal), 100–125 (Pre-DM), ≥126 (DM)" },
  ],
  "Lipid Profile": [
    { name: "Total Cholesterol", unit: "mg/dL", ref: "< 200 (Desirable)" },
    { name: "HDL Cholesterol", unit: "mg/dL", ref: "> 40 (M), > 50 (F)" },
    { name: "LDL Cholesterol", unit: "mg/dL", ref: "< 130" },
    { name: "Triglycerides", unit: "mg/dL", ref: "< 150" },
  ],
  "Serum Creatinine": [
    { name: "Serum Creatinine", unit: "mg/dL", ref: "0.7–1.3 (M), 0.6–1.1 (F)" },
  ],
  "ECG": [
    { name: "Heart Rate", unit: "bpm", ref: "60–100" },
    { name: "PR Interval", unit: "ms", ref: "120–200" },
    { name: "QRS Duration", unit: "ms", ref: "< 120" },
    { name: "QTc Interval", unit: "ms", ref: "< 440 (M), < 460 (F)" },
    { name: "Rhythm", unit: "", ref: "Normal Sinus Rhythm" },
  ],
  "Thyroid Function (TSH)": [
    { name: "TSH (Thyroid Stimulating Hormone)", unit: "mIU/L", ref: "0.4–4.0" },
    { name: "Free T4", unit: "ng/dL", ref: "0.8–1.8" },
  ],
  "Urine Analysis": [
    { name: "Colour", unit: "", ref: "Pale Yellow" },
    { name: "pH", unit: "", ref: "4.5–8.0" },
    { name: "Protein", unit: "", ref: "Negative" },
    { name: "Glucose", unit: "", ref: "Negative" },
    { name: "Leukocytes", unit: "", ref: "Negative" },
    { name: "Nitrites", unit: "", ref: "Negative" },
  ],
};

export default function LabUploadResults() {
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);
  const [resultValues, setResultValues] = useState({});
  const [labNotes, setLabNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedRequest = PENDING_UPLOAD.find(r => r.id === selectedRequestId);

  const handleSelectRequest = (id) => {
    setSelectedRequestId(id);
    const req = PENDING_UPLOAD.find(r => r.id === id);
    if (req) {
      setSelectedTests(req.tests);
      setResultValues({});
    }
    setSubmitted(false);
  };

  const updateResult = (test, field, value) => {
    setResultValues(prev => ({
      ...prev,
      [test]: { ...(prev[test] || {}), [field]: value },
    }));
  };

  const handleSubmit = () => setSubmitted(true);

  return (
    <LabLayout activePage="Upload Results">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Upload Test Results
          </h1>
          <p className="text-sm text-gray-400 mt-1">Enter and publish completed lab test results</p>
        </div>

        {/* Success message */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl flex-shrink-0">✅</div>
            <div>
              <p className="font-semibold text-green-800">Results Uploaded Successfully</p>
              <p className="text-sm text-green-700 mt-0.5">
                The doctor and patient have been notified and can now view the results.
              </p>
            </div>
            <button onClick={() => { setSubmitted(false); setSelectedRequestId(""); setSelectedTests([]); setResultValues({}); }}
              className="ml-auto px-4 py-2 rounded-xl bg-green-100 text-green-800 text-sm font-semibold hover:bg-green-200 transition flex-shrink-0">
              Upload Another
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left – Request selector */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Pending Upload</h3>
                <p className="text-xs text-gray-400 mt-0.5">Select a request to enter results</p>
              </div>
              <div className="divide-y divide-gray-50">
                {PENDING_UPLOAD.map(req => (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequest(req.id)}
                    className={`px-5 py-4 cursor-pointer transition ${
                      selectedRequestId === req.id ? "bg-teal-50 border-l-4 border-teal-500" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-gray-800">{req.patient}</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Pending</span>
                    </div>
                    <div className="text-xs text-gray-500">Ch. #{req.channeling} · {req.id}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {req.tests.map(t => (
                        <span key={t} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Instructions</p>
              <ul className="text-xs text-blue-700 space-y-1.5">
                {[
                  "Select the request from the list above.",
                  "Enter values for each test parameter.",
                  "Flag abnormal values with the toggle.",
                  "Add any lab notes or comments.",
                  "Click 'Upload Results' to notify the doctor.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right – Result entry form */}
          <div className="lg:col-span-2">
            {!selectedRequest ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🧪</div>
                <h3 className="font-semibold text-gray-700">Select a Request</h3>
                <p className="text-sm text-gray-400 mt-1">Choose a pending request from the left panel to begin entering results.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Patient info bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}>
                    {selectedRequest.patient.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{selectedRequest.patient}</div>
                    <div className="text-xs text-gray-500">Age {selectedRequest.age} · Ch. #{selectedRequest.channeling} · {selectedRequest.id}</div>
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      ⏳ Awaiting Results
                    </span>
                  </div>
                </div>

                {/* Test result forms */}
                {selectedTests.map(test => {
                  const fields = RESULT_FIELDS[test] || [];
                  return (
                    <div key={test} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3"
                        style={{ background: "linear-gradient(135deg, #E0F2F1, #B2DFDB)" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                          style={{ background: "#00606415" }}>
                          🧪
                        </div>
                        <h3 className="font-semibold text-gray-800">{test}</h3>
                      </div>

                      <div className="p-6 space-y-4">
                        {test === "ECG" && (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 mb-2">
                            📋 For ECG, also attach the printed trace report and check the rhythm interpretation.
                          </div>
                        )}

                        {fields.length > 0 ? (
                          <div className="space-y-3">
                            {fields.map(field => (
                              <div key={field.name} className="grid grid-cols-3 gap-3 items-start">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">{field.name}</label>
                                  <p className="text-xs text-gray-400">{field.ref}</p>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Result Value {field.unit && `(${field.unit})`}</label>
                                  <input
                                    type="text"
                                    placeholder={field.unit || "Enter result"}
                                    value={resultValues[test]?.[field.name] || ""}
                                    onChange={e => updateResult(test, field.name, e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-400 mb-1">Flag</label>
                                  <div className="flex gap-2">
                                    {["Normal", "High", "Low"].map(flag => {
                                      const current = resultValues[test]?.[`${field.name}_flag`] || "Normal";
                                      const colors = { Normal: "bg-green-100 text-green-700 border-green-200", High: "bg-red-100 text-red-600 border-red-200", Low: "bg-blue-100 text-blue-600 border-blue-200" };
                                      return (
                                        <button
                                          key={flag}
                                          onClick={() => updateResult(test, `${field.name}_flag`, flag)}
                                          className={`px-2 py-1 rounded-lg text-xs font-semibold border transition ${
                                            current === flag ? colors[flag] : "bg-gray-50 text-gray-400 border-gray-200"
                                          }`}
                                        >
                                          {flag}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            placeholder={`Enter ${test} findings...`}
                            rows={3}
                            value={resultValues[test]?.narrative || ""}
                            onChange={e => updateResult(test, "narrative", e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition resize-none"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Lab notes */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Lab Notes & Observations</label>
                  <textarea
                    value={labNotes}
                    onChange={e => setLabNotes(e.target.value)}
                    placeholder="Add any additional notes, observations, or recommendations for the doctor..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 rounded-2xl text-white font-semibold text-sm shadow-xl transition hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}
                >
                  📤 Upload Results & Notify Doctor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </LabLayout>
  );
}
