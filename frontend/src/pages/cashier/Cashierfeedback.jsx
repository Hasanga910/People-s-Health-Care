import { useState } from "react";
import CashierLayout from "../../components/CashierLayout";

const INITIAL_FEEDBACK = [
  { id: "FB-001", patient: "Nimal Fernando",   channeling: "003", date: "15 Feb 2026", time: "10:30 AM", rating: 5, category: "Doctor",    comment: "Dr. Jayaweera was excellent. Very thorough consultation and clear explanation.", replied: false, reply: "" },
  { id: "FB-002", patient: "Amali Jayasena",   channeling: "006", date: "15 Feb 2026", time: "11:45 AM", rating: 4, category: "General",   comment: "Good experience overall. The waiting time was a little long but staff were friendly.", replied: false, reply: "" },
  { id: "FB-003", patient: "Ruwan Fernando",   channeling: "017", date: "15 Feb 2026", time: "02:10 PM", rating: 5, category: "Doctor",    comment: "Best medical center in the area. Doctor was very caring and professional.", replied: true,  reply: "Thank you for your kind words! We will pass this on to the doctor." },
  { id: "FB-004", patient: "Kumari Wijesinghe",channeling: "014", date: "14 Feb 2026", time: "03:00 PM", rating: 3, category: "Pharmacy",  comment: "Pharmacy was slightly slow, had to wait 20 minutes for medicines.", replied: false, reply: "" },
  { id: "FB-005", patient: "Kamal Perera",     channeling: "012", date: "14 Feb 2026", time: "09:15 AM", rating: 5, category: "Lab",       comment: "Lab staff were quick and painless. Results came on time.", replied: true,  reply: "We are glad to hear the lab experience was smooth!" },
  { id: "FB-006", patient: "Dilani Wickrama",  channeling: "004", date: "13 Feb 2026", time: "04:30 PM", rating: 2, category: "Facility",  comment: "Parking is very limited. The air conditioning in the waiting area was not working.", replied: false, reply: "" },
];

const CATEGORY_CONFIG = {
  Doctor:   { bg: "bg-blue-100",   text: "text-blue-700"   },
  Pharmacy: { bg: "bg-green-100",  text: "text-green-700"  },
  Lab:      { bg: "bg-teal-100",   text: "text-teal-700"   },
  General:  { bg: "bg-gray-100",   text: "text-gray-600"   },
  Facility: { bg: "bg-amber-100",  text: "text-green-700"  },
};

function Stars({ rating, size = "sm" }) {
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 20 20" fill={i <= rating ? "#F59E0B" : "none"} stroke={i <= rating ? "#F59E0B" : "#D1D5DB"} strokeWidth={1.5} className={sz}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

function FeedbackModal({ fb, onClose, onReply }) {
  const [reply, setReply] = useState(fb.reply || "");
  const [saving, setSaving] = useState(false);
  const catCfg = CATEGORY_CONFIG[fb.category] || CATEGORY_CONFIG.General;

  const handleReply = () => {
    if (!reply.trim()) return;
    setSaving(true);
    setTimeout(() => { onReply(fb.id, reply.trim()); setSaving(false); onClose(); }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D2137, #2E7D32)" }}>
          <div>
            <p className="text-white/60 text-xs">Patient Feedback</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{fb.id}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Patient info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0D2137, #2E7D32)" }}>
              {fb.patient.split(" ").map(n=>n[0]).join("").slice(0,2)}
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-800">{fb.patient}</div>
              <div className="text-xs text-gray-500">Ch. #{fb.channeling} · {fb.date} at {fb.time}</div>
              <div className="flex items-center gap-3 mt-2">
                <Stars rating={fb.rating} size="lg"/>
                <span className="text-sm font-bold text-amber-600">{fb.rating}.0 / 5</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${catCfg.bg} ${catCfg.text}`}>{fb.category}</span>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Patient Comment</p>
            <div className="bg-green-50 border border-amber-100 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
              "{fb.comment}"
            </div>
          </div>

          {/* Existing reply */}
          {fb.replied && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Reply</p>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
                ✅ {fb.reply}
              </div>
            </div>
          )}

          {/* Reply box */}
          {!fb.replied && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reply to Patient</label>
              <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3}
                placeholder="Type a response to acknowledge this feedback..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition resize-none"/>
            </div>
          )}

          <div className="flex gap-3">
            {!fb.replied && (
              <button onClick={handleReply} disabled={saving || !reply.trim()}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #0D2137, #2E7D32)" }}>
                {saving ? "Sending…" : "Send Reply"}
              </button>
            )}
            <button onClick={onClose} className={`${fb.replied ? "flex-1" : ""} px-5 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition`}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CashierFeedback() {
  const [feedbacks, setFeedbacks]     = useState(INITIAL_FEEDBACK);
  const [selected, setSelected]       = useState(null);
  const [ratingFilter, setRatingFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [replyFilter, setReplyFilter] = useState("All");
  const [search, setSearch]           = useState("");

  const handleReply = (id, reply) => {
    setFeedbacks(prev => prev.map(fb => fb.id === id ? { ...fb, replied: true, reply } : fb));
  };

  const avgRating = (feedbacks.reduce((a,f) => a + f.rating, 0) / feedbacks.length).toFixed(1);
  const fiveStars = feedbacks.filter(f => f.rating === 5).length;
  const lowRated  = feedbacks.filter(f => f.rating <= 2).length;
  const unreplied = feedbacks.filter(f => !f.replied).length;

  // Rating distribution
  const ratingDist = [5,4,3,2,1].map(r => ({
    r, count: feedbacks.filter(f => f.rating === r).length,
    pct: Math.round((feedbacks.filter(f => f.rating === r).length / feedbacks.length) * 100),
  }));

  const filtered = feedbacks.filter(fb => {
    const matchRating   = ratingFilter === "All" || fb.rating === parseInt(ratingFilter);
    const matchCat      = categoryFilter === "All" || fb.category === categoryFilter;
    const matchReply    = replyFilter === "All" || (replyFilter === "Replied" ? fb.replied : !fb.replied);
    const matchSearch   = fb.patient.toLowerCase().includes(search.toLowerCase()) || fb.comment.toLowerCase().includes(search.toLowerCase());
    return matchRating && matchCat && matchReply && matchSearch;
  });

  const selectedLive = selected ? feedbacks.find(f => f.id === selected.id) || null : null;

  return (
    <CashierLayout activePage="Feedback">
      {selectedLive && <FeedbackModal fb={selectedLive} onClose={() => setSelected(null)} onReply={handleReply}/>}

      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Patient Feedback</h1>
          <p className="text-sm text-gray-400 mt-1">Review and respond to patient feedback</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Average Rating",   value: `${avgRating} / 5`, icon: "⭐", color: "#2E7D32", bg: "#E8F5E9" },
            { label: "5-Star Reviews",   value: fiveStars,          icon: "🌟", color: "#2E7D32", bg: "#E8F5E9" },
            { label: "Needs Attention",  value: lowRated,           icon: "⚠️", color: "#B71C1C", bg: "#FFEBEE" },
            { label: "Awaiting Reply",   value: unreplied,          icon: "💬", color: "#1565C0", bg: "#E3F2FD" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: s.bg }}>{s.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.4rem", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Rating overview + filters */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Rating distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Rating Distribution</h3>
            <div className="space-y-2.5">
              {ratingDist.map(({ r, count, pct }) => (
                <div key={r} className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 w-20 flex-shrink-0">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} viewBox="0 0 20 20" fill={i <= r ? "#F59E0B" : "#E5E7EB"} className="w-3 h-3">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }}/>
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unreplied alert */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Feedback Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(
                  feedbacks.reduce((acc,f) => { acc[f.category] = (acc[f.category]||0)+1; return acc; }, {})
                ).map(([cat, count]) => {
                  const cfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.General;
                  return (
                    <div key={cat} className={`flex items-center justify-between px-3 py-2 rounded-xl ${cfg.bg}`}>
                      <span className={`text-xs font-semibold ${cfg.text}`}>{cat}</span>
                      <span className={`text-xs font-bold ${cfg.text}`}>{count} reviews</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {unreplied > 0 && (
              <div className="mt-4 flex items-center gap-3 bg-green-50 border border-amber-200 rounded-xl px-4 py-3">
                <span className="text-lg">💬</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-800">{unreplied} feedback{unreplied>1?"s":""} awaiting your reply</p>
                </div>
                <button onClick={() => setReplyFilter("Unreplied")}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-700 text-white hover:bg-amber-800 transition">
                  View
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-48 relative">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input type="text" placeholder="Search patient or feedback..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"/>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All","5","4","3","2","1"].map(r => (
              <button key={r} onClick={() => setRatingFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${ratingFilter === r ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                style={ratingFilter === r ? { background: "linear-gradient(135deg, #2E7D32, #00897B)" } : {}}>
                {r === "All" ? "All Stars" : `${"★".repeat(parseInt(r))}`}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {["All","Doctor","Pharmacy","Lab","General","Facility"].map(c => (
              <button key={c} onClick={() => setCategoryFilter(c)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${categoryFilter === c ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {["All","Replied","Unreplied"].map(r => (
              <button key={r} onClick={() => setReplyFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${replyFilter === r ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback list */}
        <div className="space-y-3">
          {filtered.map(fb => {
            const catCfg = CATEGORY_CONFIG[fb.category] || CATEGORY_CONFIG.General;
            return (
              <div key={fb.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition overflow-hidden ${!fb.replied ? "border-amber-100" : "border-gray-100"}`}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #0D2137, #2E7D32)" }}>
                      {fb.patient.split(" ").map(n=>n[0]).join("").slice(0,2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800">{fb.patient}</span>
                          <span className="text-xs text-gray-400">Ch. #{fb.channeling}</span>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${catCfg.bg} ${catCfg.text}`}>{fb.category}</span>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${fb.replied ? "bg-green-100 text-green-700" : "bg-amber-100 text-green-700"}`}>
                            {fb.replied ? "✅ Replied" : "💬 Unreplied"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stars rating={fb.rating}/>
                          <span className="text-xs font-bold text-amber-600">{fb.rating}.0</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">"{fb.comment}"</p>
                      {fb.replied && (
                        <div className="mt-2 flex items-start gap-2 bg-green-50 rounded-lg p-2.5">
                          <span className="text-xs text-green-600 font-semibold flex-shrink-0">↩ Reply:</span>
                          <span className="text-xs text-green-700">{fb.reply}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-400">{fb.date} · {fb.time} · {fb.id}</span>
                        <button onClick={() => setSelected(fb)}
                          className="text-xs font-semibold text-green-700 hover:underline">
                          {fb.replied ? "View →" : "Reply →"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-4xl mb-3">⭐</div>
              <div className="text-gray-500 font-medium">No feedback found</div>
            </div>
          )}
        </div>
      </div>
    </CashierLayout>
  );
}