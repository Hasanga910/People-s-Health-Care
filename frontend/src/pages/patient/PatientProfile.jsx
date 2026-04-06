import { useState } from "react";
import PatientLayout from "../../components/PatientLayout";

const PROFILE = {
  name: "Kamal Perera",
  id: "PHC-2026-0012",
  dob: "12 March 1972",
  age: 54,
  gender: "Male",
  bloodGroup: "B+",
  nic: "720312XXXXX",
  phone: "0712 345 678",
  email: "kamal.perera@gmail.com",
  address: "No. 45, Galle Road, Matara, Sri Lanka",
  emergencyContact: { name: "Srimathi Perera", relation: "Spouse", phone: "0723 456 789" },
  registeredDate: "05 Jan 2026",
  doctor: "Dr. M.T.D. Jayaweera",
};

const MEDICAL_HISTORY = {
  conditions: [
    { name: "Type 2 Diabetes Mellitus", since: "2019", status: "Active", severity: "Moderate" },
    { name: "Hypertension", since: "2021", status: "Active", severity: "Mild" },
    { name: "GERD (Acid Reflux)", since: "2023", status: "Managed", severity: "Mild" },
  ],
  allergies: [
    { substance: "Penicillin", reaction: "Skin rash and urticaria", severity: "Moderate" },
    { substance: "Sulfonamides", reaction: "Nausea and vomiting", severity: "Mild" },
  ],
  surgeries: [
    { procedure: "Appendectomy", date: "2008", hospital: "General Hospital, Matara" },
  ],
  familyHistory: [
    { condition: "Type 2 Diabetes", relation: "Father" },
    { condition: "Hypertension", relation: "Father & Mother" },
    { condition: "Heart Disease", relation: "Paternal Grandfather" },
  ],
  currentMedications: [
    { name: "Metformin 500mg", freq: "Twice daily", since: "Dec 2025" },
    { name: "Lisinopril 10mg", freq: "Once daily", since: "Jan 2026" },
  ],
  vitals: [
    { label: "Blood Pressure", value: "138/88 mmHg", date: "12 Feb 2026", status: "Slightly Elevated" },
    { label: "Blood Glucose (Fasting)", value: "148 mg/dL", date: "10 Feb 2026", status: "High" },
    { label: "Weight", value: "78 kg", date: "12 Feb 2026", status: "Normal" },
    { label: "BMI", value: "26.4", date: "12 Feb 2026", status: "Overweight" },
    { label: "Temperature", value: "36.8°C", date: "12 Feb 2026", status: "Normal" },
    { label: "Heart Rate", value: "78 bpm", date: "25 Jan 2026", status: "Normal" },
  ],
};

const VISIT_HISTORY = [
  { date: "12 Feb 2026", channeling: "012", type: "General Consultation", summary: "Diabetes and BP review. Lab tests requested.", rx: "RX-2026-0089" },
  { date: "28 Jan 2026", channeling: "009", type: "Follow-up Visit", summary: "Upper respiratory infection. Antibiotics prescribed.", rx: "RX-2026-0071" },
  { date: "10 Jan 2026", channeling: "003", type: "Annual Health Check", summary: "Routine annual check. ECG, lipid profile, vitamins.", rx: "RX-2026-0058" },
];

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function PatientProfile() {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "conditions", label: "Medical History" },
    { id: "vitals", label: "Vitals" },
    { id: "visits", label: "Visit History" },
  ];

  return (
    <PatientLayout activePage="My Profile">
      <div className="p-6 space-y-5">

        {/* Profile header card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #1565C0 60%, #00ACC1 100%)" }}
        >
          <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 border-4 border-white/20"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                KP
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-white" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.5rem", color: "white" }}>
                {PROFILE.name}
              </h2>
              <div className="flex flex-wrap gap-3 mt-2">
                {[
                  { label: "ID", val: PROFILE.id },
                  { label: "Age", val: `${PROFILE.age} yrs` },
                  { label: "Blood Group", val: PROFILE.bloodGroup },
                  { label: "Patient Since", val: PROFILE.registeredDate },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                    <span className="text-white/50 text-xs">{item.label}:</span>
                    <span className="text-white text-xs font-semibold">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white text-sm font-medium transition flex-shrink-0"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex border-t border-white/10 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.id
                    ? "text-white border-cyan-300"
                    : "text-white/50 border-transparent hover:text-white/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB: Overview */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-5">
            {/* Personal Information */}
            <Section title="Personal Information">
              <div className="space-y-3">
                {[
                  { label: "Full Name", val: PROFILE.name },
                  { label: "Date of Birth", val: PROFILE.dob },
                  { label: "Gender", val: PROFILE.gender },
                  { label: "NIC Number", val: PROFILE.nic },
                  { label: "Phone", val: PROFILE.phone },
                  { label: "Email", val: PROFILE.email },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{item.label}</span>
                    <span className="text-sm text-gray-800 font-medium text-right max-w-[55%]">{item.val}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Contact & Emergency */}
            <div className="space-y-5">
              <Section title="Contact Details">
                <div className="space-y-3">
                  {[
                    { label: "Address", val: PROFILE.address },
                    { label: "Primary Doctor", val: PROFILE.doctor },
                  ].map((item) => (
                    <div key={item.label} className="py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide block mb-1">{item.label}</span>
                      <span className="text-sm text-gray-800 font-medium">{item.val}</span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Emergency Contact">
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-lg flex-shrink-0">
                    🆘
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{PROFILE.emergencyContact.name}</div>
                    <div className="text-xs text-gray-500">{PROFILE.emergencyContact.relation}</div>
                    <div className="text-sm font-semibold text-blue-700 mt-0.5">{PROFILE.emergencyContact.phone}</div>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* TAB: Medical History */}
        {activeTab === "conditions" && (
          <div className="space-y-5">
            {/* Active Conditions */}
            <Section title="Active Medical Conditions">
              <div className="space-y-3">
                {MEDICAL_HISTORY.conditions.map((c) => (
                  <div key={c.name} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${c.status === "Active" ? "bg-red-400" : "bg-green-400"}`} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-800">{c.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Since {c.since} · {c.severity}</div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      c.status === "Active" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                    }`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Allergies */}
              <Section title="Known Allergies">
                <div className="space-y-3">
                  {MEDICAL_HISTORY.allergies.map((a) => (
                    <div key={a.substance} className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">⚠️</span>
                        <span className="font-semibold text-red-800 text-sm">{a.substance}</span>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-auto">{a.severity}</span>
                      </div>
                      <div className="text-xs text-red-700">{a.reaction}</div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Family History */}
              <Section title="Family History">
                <div className="space-y-2">
                  {MEDICAL_HISTORY.familyHistory.map((fh) => (
                    <div key={fh.condition + fh.relation} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-700">{fh.condition}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{fh.relation}</span>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* Current Medications */}
            <Section title="Current Medications">
              <div className="grid md:grid-cols-2 gap-3">
                {MEDICAL_HISTORY.currentMedications.map((med) => (
                  <div key={med.name} className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="text-xl">💊</div>
                    <div>
                      <div className="font-semibold text-sm text-blue-900">{med.name}</div>
                      <div className="text-xs text-blue-600">{med.freq} · Since {med.since}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Surgeries */}
            <Section title="Surgical History">
              {MEDICAL_HISTORY.surgeries.map((s) => (
                <div key={s.procedure} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-xl">🏥</div>
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{s.procedure}</div>
                    <div className="text-xs text-gray-500">{s.date} · {s.hospital}</div>
                  </div>
                </div>
              ))}
            </Section>
          </div>
        )}

        {/* TAB: Vitals */}
        {activeTab === "vitals" && (
          <Section title="Recent Vital Signs">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MEDICAL_HISTORY.vitals.map((v) => (
                <div key={v.label} className={`p-5 rounded-2xl border ${
                  v.status === "Normal" ? "bg-green-50 border-green-100" :
                  v.status === "High" ? "bg-red-50 border-red-100" :
                  "bg-amber-50 border-amber-100"
                }`}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{
                    color: v.status === "Normal" ? "#00897B" : v.status === "High" ? "#B71C1C" : "#E65100"
                  }}>
                    {v.label}
                  </div>
                  <div className="text-xl font-bold text-gray-800 my-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {v.value}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      v.status === "Normal" ? "bg-green-100 text-green-700" :
                      v.status === "High" ? "bg-red-100 text-red-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {v.status}
                    </span>
                    <span className="text-xs text-gray-400">{v.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* TAB: Visit History */}
        {activeTab === "visits" && (
          <Section title="Visit History">
            <div className="space-y-3">
              {VISIT_HISTORY.map((visit, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition">
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}
                  >
                    <span className="text-xs font-bold">{visit.date.split(" ")[1]}</span>
                    <span className="text-base font-bold leading-none">{visit.date.split(" ")[0]}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-gray-800">{visit.type}</span>
                      <span className="font-mono text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Ch. #{visit.channeling}</span>
                    </div>
                    <div className="text-xs text-gray-500 leading-relaxed">{visit.summary}</div>
                    {visit.rx && (
                      <a href="/patient/prescriptions" className="inline-block mt-1.5 text-xs text-blue-600 font-medium hover:underline">
                        📋 Rx: {visit.rx}
                      </a>
                    )}
                  </div>

                  <div className="text-xs text-gray-400 flex-shrink-0">{visit.date}</div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </PatientLayout>
  );
}
