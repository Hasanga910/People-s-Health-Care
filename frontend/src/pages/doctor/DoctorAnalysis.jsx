import DoctorLayout from "../../components/DoctorLayout";

export default function DoctorAnalysis() {
  return (
    <DoctorLayout activePage="Medical Analysis">
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Medical Analysis
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              CNN-based classification and medical image analysis — Dr. M.T.D. Jayaweera
            </p>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
            AI Module
          </span>
        </div>

        {/* Main placeholder */}
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 min-h-[520px] flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "linear-gradient(135deg, #E3F2FD, #E0F7FA)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth={1.5} className="w-10 h-10">
              <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-700 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            CNN Classification Module
          </h2>
          <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
            This section is reserved for the CNN-based medical image classification system.
            Integration coming soon.
          </p>
        </div>

        {/* Placeholder section grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "Model Input", desc: "Upload or connect medical images for classification", color: "#1565C0", bg: "#E3F2FD" },
            { title: "Prediction Results", desc: "Classified output with confidence scores per class", color: "#00897B", bg: "#E0F2F1" },
            { title: "Model Performance", desc: "Accuracy, precision, recall and confusion matrix", color: "#7B1FA2", bg: "#F3E5F5" },
          ].map((s) => (
            <div key={s.title} className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl mb-3" style={{ background: s.bg }} />
              <h3 className="text-sm font-semibold text-gray-700 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              <p className="text-xs text-gray-300 mt-4">Not connected</p>
            </div>
          ))}
        </div>

      </div>
    </DoctorLayout>
  );
}
