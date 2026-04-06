import { useState } from "react";
import DoctorLayout from "../../components/DoctorLayout";

// ── DATA ──────────────────────────────────────────────────────────────────────

const TOP_MEDICINES = [
  { name: "Metformin 500mg",      category: "Antidiabetic",      prescribed: 28, lastMonth: 22, indication: "Type 2 Diabetes" },
  { name: "Lisinopril 10mg",      category: "Antihypertensive",  prescribed: 21, lastMonth: 19, indication: "Hypertension" },
  { name: "Amlodipine 5mg",       category: "Antihypertensive",  prescribed: 18, lastMonth: 21, indication: "Hypertension" },
  { name: "Amoxicillin 500mg",    category: "Antibiotic",        prescribed: 16, lastMonth: 10, indication: "Bacterial Infections" },
  { name: "Atorvastatin 10mg",    category: "Statin",            prescribed: 14, lastMonth: 14, indication: "Hyperlipidaemia" },
  { name: "Omeprazole 20mg",      category: "Antacid",           prescribed: 12, lastMonth: 9,  indication: "GERD" },
  { name: "Paracetamol 500mg",    category: "Analgesic",         prescribed: 11, lastMonth: 15, indication: "Analgesia / Fever" },
  { name: "Aspirin 75mg",         category: "Antiplatelet",      prescribed: 10, lastMonth: 8,  indication: "Cardiovascular Prophylaxis" },
  { name: "Glipizide 5mg",        category: "Antidiabetic",      prescribed: 8,  lastMonth: 5,  indication: "Type 2 Diabetes" },
  { name: "Vitamin D3 1000 IU",   category: "Supplement",        prescribed: 7,  lastMonth: 11, indication: "Vitamin D Deficiency" },
];

const CATEGORY_TOTALS = [
  { cat: "Antihypertensive", total: 39, color: "#00897B" },
  { cat: "Antidiabetic",     total: 36, color: "#1565C0" },
  { cat: "Antibiotic",       total: 16, color: "#E65100" },
  { cat: "Statin",           total: 14, color: "#7B1FA2" },
  { cat: "Antacid",          total: 12, color: "#F59E0B" },
  { cat: "Analgesic",        total: 11, color: "#EC4899" },
  { cat: "Antiplatelet",     total: 10, color: "#06B6D4" },
  { cat: "Supplement",       total:  7, color: "#84CC16" },
];

const MONTHLY_TREND = [
  { month: "Sep", total: 88, diabetic: 20, hypertension: 18, antibiotic: 10 },
  { month: "Oct", total: 95, diabetic: 22, hypertension: 20, antibiotic: 12 },
  { month: "Nov", total: 102, diabetic: 24, hypertension: 22, antibiotic: 14 },
  { month: "Dec", total: 97, diabetic: 23, hypertension: 21, antibiotic: 11 },
  { month: "Jan", total: 110, diabetic: 27, hypertension: 25, antibiotic: 16 },
  { month: "Feb", total: 145, diabetic: 36, hypertension: 39, antibiotic: 16 },
];

const maxCat  = Math.max(...CATEGORY_TOTALS.map(c => c.total));
const maxMed  = Math.max(...TOP_MEDICINES.map(m => m.prescribed));
const maxTrend = Math.max(...MONTHLY_TREND.map(m => m.total));

const MED_CATEGORIES = ["All", ...new Set(TOP_MEDICINES.map(m => m.category))];

const INSIGHTS = [
  {
    title: "Diabetes Medicines Rising",
    desc: "Metformin and Glipizide prescriptions increased by 27% vs January, reflecting a growing diabetic patient load.",
    icon: "📈", color: "#1565C0", bg: "#E3F2FD",
  },
  {
    title: "Antibiotic Usage Spike",
    desc: "Amoxicillin jumped from 10 to 16 prescriptions (+60%), likely linked to the seasonal respiratory infection wave.",
    icon: "⚠️", color: "#E65100", bg: "#FFF3E0",
  },
  {
    title: "Supplement Prescriptions Down",
    desc: "Vitamin D3 prescriptions fell from 11 to 7. Consider reviewing screening protocols for at-risk patients.",
    icon: "💡", color: "#7B1FA2", bg: "#F3E5F5",
  },
];

export default function DoctorMedicineAnalysis() {
  const [medSearch, setMedSearch]   = useState("");
  const [medFilter, setMedFilter]   = useState("All");
  const [trendView, setTrendView]   = useState("total");
  const [sortBy, setSortBy]         = useState("prescribed");

  const filteredMeds = TOP_MEDICINES
    .filter(m => {
      const matchSearch = m.name.toLowerCase().includes(medSearch.toLowerCase())
        || m.indication.toLowerCase().includes(medSearch.toLowerCase());
      const matchCat    = medFilter === "All" || m.category === medFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => sortBy === "prescribed" ? b.prescribed - a.prescribed : b.prescribed - b.lastMonth - (a.prescribed - a.lastMonth));

  const TREND_OPTIONS = [
    { key: "total",       label: "All",             color: "#1565C0" },
    { key: "diabetic",    label: "Antidiabetic",     color: "#00ACC1" },
    { key: "hypertension",label: "Antihypertensive", color: "#00897B" },
    { key: "antibiotic",  label: "Antibiotic",       color: "#E65100" },
  ];
  const activeTrend = TREND_OPTIONS.find(t => t.key === trendView);

  return (
    <DoctorLayout activePage="Medicine Analysis">
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Medicine Analysis
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Most prescribed medicines — February 2026 · Dr. M.T.D. Jayaweera
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 shadow-sm">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            February 2026
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Unique Medicines",      value: TOP_MEDICINES.length,                                              color: "#1565C0", bg: "#E3F2FD", icon: "💊" },
            { label: "Total Prescriptions",   value: 145,                                                               color: "#00897B", bg: "#E0F2F1", icon: "📋" },
            { label: "#1 Most Prescribed",    value: "Metformin",                                                       color: "#E65100", bg: "#FFF3E0", icon: "🏆" },
            { label: "Top Category",          value: "Antihypertensive",                                                color: "#7B1FA2", bg: "#F3E5F5", icon: "📊" },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-2" style={{ background: card.bg }}>
                {card.icon}
              </div>
              <div className="font-bold" style={{ fontFamily: "'Playfair Display', serif", color: card.color, fontSize: "1.1rem" }}>
                {card.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Prescription trend line */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Prescription Volume Trend</h3>
                <p className="text-xs text-gray-400 mt-0.5">Monthly totals — last 6 months</p>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {TREND_OPTIONS.map(opt => (
                  <button key={opt.key} onClick={() => setTrendView(opt.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      trendView === opt.key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-3 h-36 mt-2">
              {MONTHLY_TREND.map((m, i) => {
                const val = m[trendView];
                const pct = Math.round((val / maxTrend) * 100);
                const isLatest = i === MONTHLY_TREND.length - 1;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className={`text-xs font-bold transition ${isLatest ? "text-gray-800" : "text-gray-400"}`}>
                      {val}
                    </span>
                    <div className="w-full rounded-t-lg transition-all relative"
                      style={{
                        height: `${Math.max(pct * 0.9, 4)}px`,
                        background: isLatest ? activeTrend.color : `${activeTrend.color}55`,
                      }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                        {m.month}: {val}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{m.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs text-gray-500">
              <span className="font-semibold text-green-600">↑ 32%</span>
              increase in total prescriptions from January to February 2026.
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800">Prescriptions by Category</h3>
              <p className="text-xs text-gray-400 mt-0.5">Total issued per drug class — February 2026</p>
            </div>

            {/* Horizontal bar chart */}
            <div className="space-y-3">
              {CATEGORY_TOTALS.map(c => (
                <div key={c.cat}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-sm text-gray-700">{c.cat}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{c.total}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-2.5 rounded-full transition-all"
                      style={{ width: `${Math.round((c.total / maxCat) * 100)}%`, background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters for medicine table */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48 relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input type="text" placeholder="Search medicine or indication…"
              value={medSearch} onChange={e => setMedSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
          </div>

          <div className="flex gap-2 flex-wrap">
            {MED_CATEGORIES.map(c => (
              <button key={c} onClick={() => setMedFilter(c)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  medFilter === c ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={medFilter === c ? { background: "linear-gradient(135deg, #0D2137, #1565C0)" } : {}}>
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-400">Sort:</span>
            <button onClick={() => setSortBy("prescribed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                sortBy === "prescribed" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
              }`}>
              By Volume
            </button>
            <button onClick={() => setSortBy("growth")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                sortBy === "growth" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
              }`}>
              By Growth
            </button>
          </div>
        </div>

        {/* Medicine ranking table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-semibold text-gray-800">Most Prescribed Medicines</h3>
              <p className="text-xs text-gray-400 mt-0.5">Ranked by frequency — {filteredMeds.length} medicines</p>
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredMeds.map((med, idx) => {
              const barPct = Math.round((med.prescribed / maxMed) * 100);
              const delta  = med.prescribed - med.lastMonth;
              const trend  = delta > 0
                ? { icon: "↑", label: `+${delta}`, bg: "bg-green-100", text: "text-green-700" }
                : delta < 0
                  ? { icon: "↓", label: `${delta}`, bg: "bg-red-100",   text: "text-red-600" }
                  : { icon: "→", label: "0",         bg: "bg-gray-100",  text: "text-gray-500" };

              const rankStyle = idx === 0
                ? { bg: "from-yellow-400 to-red-400", text: "🥇" }
                : idx === 1
                  ? { bg: "", text: "🥈", plain: "bg-gray-200 text-gray-700" }
                  : idx === 2
                    ? { bg: "", text: "🥉", plain: "bg-amber-100 text-amber-700" }
                    : { text: `#${idx + 1}`, plain: "bg-gray-50 text-gray-400 text-sm" };

              return (
                <div key={med.name} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition">
                  {/* Rank badge */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    idx === 0 ? "bg-gradient-to-br text-white " + rankStyle.bg : rankStyle.plain
                  }`}>
                    {rankStyle.text}
                  </div>

                  {/* Name + category */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-gray-800">{med.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{med.category}</span>
                    </div>
                    <p className="text-xs text-gray-400">Indication: {med.indication}</p>
                    {/* Volume bar */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden" style={{ width: "140px" }}>
                        <div className="h-2 rounded-full"
                          style={{ width: `${barPct}%`, background: "linear-gradient(90deg, #1565C0, #00ACC1)" }} />
                      </div>
                      <span className="text-xs text-gray-400">{barPct}%</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {med.prescribed}
                      </div>
                      <div className="text-xs text-gray-400">this month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">{med.lastMonth}</div>
                      <div className="text-xs text-gray-400">last month</div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold ${trend.bg} ${trend.text}`}>
                      {trend.icon} {trend.label}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredMeds.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">💊</div>
                <div className="text-gray-400 text-sm">No medicines found</div>
              </div>
            )}
          </div>
        </div>

        {/* Insight cards */}
        <div className="grid md:grid-cols-3 gap-4">
          {INSIGHTS.map(insight => (
            <div key={insight.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ background: insight.bg }}>
                {insight.icon}
              </div>
              <h4 className="font-semibold text-gray-800 text-sm mb-1">{insight.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{insight.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </DoctorLayout>
  );
}
