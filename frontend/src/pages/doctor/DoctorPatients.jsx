import { useState } from "react";
import DoctorLayout from "../../components/DoctorLayout";

const PATIENTS = [
  {
    id: "PHC-2026-0012", name: "Kamal Perera", age: 54, gender: "Male", dob: "12 Mar 1972",
    blood: "B+", phone: "0712 345 678", address: "No. 45, Galle Road, Matara",
    registered: "05 Jan 2026", lastVisit: "15 Feb 2026", totalVisits: 5,
    conditions: ["Type 2 Diabetes", "Hypertension"],
    allergies: ["Penicillin"],
    currentMeds: ["Metformin 500mg", "Lisinopril 10mg"],
    visits: [
      { date: "15 Feb 2026", type: "General Consultation", channeling: "012", rx: "RX-2026-0089", summary: "Diabetes & BP review. Blood glucose elevated. Labs ordered." },
      { date: "28 Jan 2026", type: "Follow-up", channeling: "009", rx: "RX-2026-0071", summary: "Medication adjustment. Lisinopril dose increased." },
      { date: "10 Jan 2026", type: "Annual Check", channeling: "003", rx: "RX-2026-0058", summary: "Routine annual check. ECG normal. Lipid profile within range." },
    ],
    vitals: { bp: "138/88", glucose: "148 mg/dL", weight: "78 kg", bmi: "26.4", pulse: "78 bpm" },
  },
  {
    id: "PHC-2026-0019", name: "Sumudu Silva", age: 29, gender: "Female", dob: "04 Jun 1996",
    blood: "O+", phone: "0765 234 567", address: "No. 12, Rahula Road, Matara",
    registered: "10 Jan 2026", lastVisit: "15 Feb 2026", totalVisits: 2,
    conditions: ["Upper Respiratory Infection"],
    allergies: [],
    currentMeds: ["Amoxicillin 250mg", "Paracetamol 500mg"],
    visits: [
      { date: "15 Feb 2026", type: "General Consultation", channeling: "002", rx: "RX-2026-0088", summary: "Sore throat and fever for 3 days. Prescribed antibiotics." },
      { date: "10 Jan 2026", type: "General Consultation", channeling: "008", rx: "RX-2026-0042", summary: "Mild flu. Rest and fluids advised." },
    ],
    vitals: { bp: "112/72", glucose: "—", weight: "58 kg", bmi: "21.2", pulse: "84 bpm" },
  },
  {
    id: "PHC-2026-0031", name: "Ruwan Fernando", age: 47, gender: "Male", dob: "19 Sep 1978",
    blood: "A+", phone: "0777 543 210", address: "No. 78, Station Road, Matara",
    registered: "15 Jan 2026", lastVisit: "15 Feb 2026", totalVisits: 3,
    conditions: ["Hyperlipidaemia", "Hypertension"],
    allergies: ["Sulfonamides"],
    currentMeds: ["Atorvastatin 10mg", "Amlodipine 5mg", "Aspirin 75mg"],
    visits: [
      { date: "15 Feb 2026", type: "Follow-up", channeling: "017", rx: "RX-2026-0091", summary: "Lipid profile elevated. Statin dose maintained. Diet counselling." },
      { date: "01 Feb 2026", type: "General Consultation", channeling: "006", rx: "RX-2026-0065", summary: "BP reading: 148/92. Amlodipine added to regimen." },
      { date: "15 Jan 2026", type: "First Visit", channeling: "001", rx: "RX-2026-0048", summary: "Presented with chest tightness. ECG normal. Lipid test ordered." },
    ],
    vitals: { bp: "142/90", glucose: "—", weight: "82 kg", bmi: "27.8", pulse: "76 bpm" },
  },
  {
    id: "PHC-2026-0044", name: "Dilani Bandara", age: 38, gender: "Female", dob: "22 Nov 1987",
    blood: "AB+", phone: "0712 678 901", address: "No. 33, Anagarika Mawatha, Matara",
    registered: "20 Jan 2026", lastVisit: "15 Feb 2026", totalVisits: 2,
    conditions: ["Suspected Type 2 Diabetes"],
    allergies: [],
    currentMeds: ["Metformin 500mg", "Glipizide 5mg"],
    visits: [
      { date: "15 Feb 2026", type: "General Consultation", channeling: "016", rx: "RX-2026-0090", summary: "Increased thirst and fatigue. FBG = 148 mg/dL. Started Metformin." },
      { date: "20 Jan 2026", type: "First Visit", channeling: "004", rx: "—", summary: "No complaints. Routine registration. Blood sugar screening ordered." },
    ],
    vitals: { bp: "118/76", glucose: "148 mg/dL", weight: "68 kg", bmi: "24.5", pulse: "80 bpm" },
  },
  {
    id: "PHC-2026-0051", name: "Suresh Jayasinghe", age: 52, gender: "Male", dob: "07 Apr 1973",
    blood: "B+", phone: "0712 890 123", address: "No. 9, Vijaya Road, Matara",
    registered: "08 Feb 2026", lastVisit: "15 Feb 2026", totalVisits: 2,
    conditions: ["Suspected Hypothyroidism", "GERD"],
    allergies: [],
    currentMeds: ["Omeprazole 20mg"],
    visits: [
      { date: "15 Feb 2026", type: "General Consultation", channeling: "015", rx: "RX-2026-0088", summary: "Weight gain, fatigue. TSH test ordered. Omeprazole continued." },
      { date: "08 Feb 2026", type: "First Visit", channeling: "005", rx: "RX-2026-0082", summary: "Heartburn and indigestion. Omeprazole prescribed." },
    ],
    vitals: { bp: "124/80", glucose: "—", weight: "91 kg", bmi: "29.1", pulse: "74 bpm" },
  },
  {
    id: "PHC-2026-0062", name: "Nimesha Silva", age: 29, gender: "Female", dob: "15 Dec 1996",
    blood: "O-", phone: "0765 012 345", address: "No. 21, Lake Road, Matara",
    registered: "12 Feb 2026", lastVisit: "15 Feb 2026", totalVisits: 1,
    conditions: ["Upper Respiratory Infection"],
    allergies: [],
    currentMeds: ["Amoxicillin 500mg", "Paracetamol 500mg"],
    visits: [
      { date: "15 Feb 2026", type: "General Consultation", channeling: "019", rx: "RX-2026-0092", summary: "Sore throat, mild fever. CBC ordered. Antibiotics prescribed." },
    ],
    vitals: { bp: "110/70", glucose: "—", weight: "54 kg", bmi: "20.1", pulse: "88 bpm" },
  },
];

function PatientModal({ patient, onClose }) {
  const [tab, setTab] = useState("overview");

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "visits", label: "Visit History" },
    { id: "vitals", label: "Vitals" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0D2137, #1565C0)" }}>
          <div className="px-6 pt-5 pb-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg border-2 border-white/20"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <h3 className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {patient.name}
                </h3>
                <p className="text-white/60 text-xs mt-0.5">
                  {patient.id} · Age {patient.age} · {patient.gender} · {patient.blood}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition self-start">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div className="flex gap-1 px-6 mt-4">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition ${
                  tab === t.id ? "text-white border-cyan-300" : "text-white/50 border-transparent hover:text-white/80"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Overview tab */}
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl space-y-2.5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Personal Info</p>
                  {[
                    { label: "Phone", val: patient.phone },
                    { label: "DOB", val: patient.dob },
                    { label: "Address", val: patient.address },
                    { label: "Registered", val: patient.registered },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-xs text-gray-400">{item.label}</span>
                      <span className="text-xs font-semibold text-gray-700 text-right max-w-[60%]">{item.val}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                    <p className="text-xs font-semibold text-red-600 uppercase mb-2">Active Conditions</p>
                    {patient.conditions.length ? patient.conditions.map(c => (
                      <div key={c} className="flex items-center gap-2 text-sm text-red-800 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />{c}
                      </div>
                    )) : <p className="text-xs text-gray-400">None recorded</p>}
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-xs font-semibold text-amber-600 uppercase mb-2">Allergies</p>
                    {patient.allergies.length ? patient.allergies.map(a => (
                      <span key={a} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full mr-1">⚠️ {a}</span>
                    )) : <p className="text-xs text-gray-400">None known</p>}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Current Medications</p>
                <div className="flex flex-wrap gap-2">
                  {patient.currentMeds.length ? patient.currentMeds.map(m => (
                    <span key={m} className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">💊 {m}</span>
                  )) : <p className="text-xs text-gray-400">None prescribed</p>}
                </div>
              </div>
            </>
          )}

          {/* Visits tab */}
          {tab === "visits" && (
            <div className="space-y-3">
              {patient.visits.map((v, i) => (
                <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                    <span className="text-xs font-bold">{v.date.split(" ")[1]}</span>
                    <span className="text-base font-bold leading-none">{v.date.split(" ")[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-800">{v.type}</span>
                      <span className="font-mono text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Ch. #{v.channeling}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{v.summary}</p>
                    {v.rx !== "—" && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">📋 {v.rx}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vitals tab */}
          {tab === "vitals" && (
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Blood Pressure", val: patient.vitals.bp, unit: "mmHg", icon: "❤️", ok: patient.vitals.bp.split("/")[0] < 130 },
                { label: "Blood Glucose", val: patient.vitals.glucose, unit: "fasting", icon: "🩸", ok: patient.vitals.glucose === "—" || parseInt(patient.vitals.glucose) < 100 },
                { label: "Weight", val: patient.vitals.weight, unit: "", icon: "⚖️", ok: true },
                { label: "BMI", val: patient.vitals.bmi, unit: "", icon: "📊", ok: parseFloat(patient.vitals.bmi) < 25 },
                { label: "Pulse Rate", val: patient.vitals.pulse, unit: "", icon: "💓", ok: true },
              ].map(v => (
                <div key={v.label} className={`p-4 rounded-2xl border ${v.ok ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: v.ok ? "#2E7D32" : "#E65100" }}>
                    {v.label}
                  </div>
                  <div className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>{v.val}</div>
                  {v.unit && <div className="text-xs text-gray-400 mt-0.5">{v.unit}</div>}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <a href="/doctor/prescriptions"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
              💊 New Prescription
            </a>
            <a href="/doctor/lab-requests"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              🧪 Request Lab Test
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorPatients() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [conditionFilter, setConditionFilter] = useState("All");

  const CONDITIONS = ["All", "Diabetes", "Hypertension", "Antibiotic", "Hyperlipidaemia", "GERD"];

  const filtered = PATIENTS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search);
    const matchCond = conditionFilter === "All" ||
      p.conditions.some(c => c.toLowerCase().includes(conditionFilter.toLowerCase()));
    return matchSearch && matchCond;
  });

  return (
    <DoctorLayout activePage="Patient Records">
      {selected && <PatientModal patient={selected} onClose={() => setSelected(null)} />}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
            Patient Records
          </h1>
          <p className="text-sm text-gray-400 mt-1">All registered patients under Dr. M.T.D. Jayaweera</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Patients", value: PATIENTS.length, color: "#1565C0", bg: "#E3F2FD" },
            { label: "Seen This Month", value: 6, color: "#00897B", bg: "#E0F2F1" },
            { label: "With Active Conditions", value: PATIENTS.filter(p => p.conditions.length > 0).length, color: "#E65100", bg: "#FFF3E0" },
            { label: "New This Month", value: 2, color: "#7B1FA2", bg: "#F3E5F5" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-52 relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input type="text" placeholder="Search by name, ID, or phone..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CONDITIONS.map(c => (
              <button key={c} onClick={() => setConditionFilter(c)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  conditionFilter === c ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={conditionFilter === c ? { background: "linear-gradient(135deg, #1565C0, #00ACC1)" } : {}}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Patient cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(patient => (
            <div key={patient.id}
              onClick={() => setSelected(patient)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition cursor-pointer overflow-hidden group">
              {/* Card header */}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                    {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate group-hover:text-blue-700 transition">{patient.name}</div>
                    <div className="text-xs text-gray-400">{patient.id} · Age {patient.age} · {patient.gender}</div>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-full flex-shrink-0">{patient.blood}</span>
                </div>

                {/* Conditions */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {patient.conditions.length ? patient.conditions.map(c => (
                    <span key={c} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">{c}</span>
                  )) : <span className="text-xs text-gray-400">No active conditions</span>}
                </div>

                {/* Allergies */}
                {patient.allergies.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-xs text-amber-600 font-semibold">⚠️ Allergies:</span>
                    <span className="text-xs text-amber-700">{patient.allergies.join(", ")}</span>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Last visit: <span className="text-gray-600 font-medium">{patient.lastVisit}</span></span>
                  <span>{patient.totalVisits} visit{patient.totalVisits > 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Hover footer */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">{patient.phone}</span>
                <span className="text-xs font-semibold text-blue-600 group-hover:underline">View Records →</span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-3 bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">👤</div>
              <div className="text-gray-500 font-medium">No patients found</div>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
