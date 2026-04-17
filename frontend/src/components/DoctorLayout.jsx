import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Logout Confirmation Modal ──────────────────────────────────
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-red-500">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </div>
        <h3 className="text-center text-gray-800 font-bold text-lg mb-1">Sign Out</h3>
        <p className="text-center text-gray-500 text-sm mb-6">Are you sure you want to log out of your account?</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap";
document.head.appendChild(fontLink);

const NAV_ITEMS = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>) },
  { label: "My Schedule", href: "/doctor/appointments", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></svg>) },
  { label: "Prescriptions", href: "/doctor/prescriptions", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>) },
  { label: "Lab Requests", href: "/doctor/lab-requests", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11m0 0H5m4 0h10m-10 0v4a2 2 0 002 2h4m4-10v10a2 2 0 01-2 2h-4m0 0H9" /></svg>) },
 { 
    label: "Lab Results", 
    href: "/doctor/lab-results", 
    icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>)
  },

  { label: "Patient Records", href: "/doctor/patients", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>) },
  { label: "Medical Analysis", href: "/doctor/analysis", badge: "AI", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>) },
  { label: "Medicine Analysis", href: "/doctor/medicine-analysis", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11m0 0H5m4 0h10m-10 0v4a2 2 0 002 2h4" /><line x1="12" y1="17" x2="12" y2="21" /><line x1="8" y1="21" x2="16" y2="21" /></svg>) },
];


// Get initials from full name
function getInitials(name) {
  if (!name) return "DR";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// Read logged-in user from sessionStorage
function getStoredUser() {
  try {
    const str = sessionStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

export default function DoctorLayout({ children, activePage = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  // Real user data from sessionStorage
  const user = getStoredUser();
  const displayName = user?.name || "Doctor";
  const initials = getInitials(user?.name);
  const subtitle = user?.doctorDetails?.workingExperience
    ? `${user.doctorDetails.workingExperience}`
    : "Doctor";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      <aside className={`relative flex flex-col bg-[#0D2137] text-white transition-all duration-300 flex-shrink-0 ${sidebarOpen ? "w-64" : "w-20"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden">
            <img src="/Logo.png" alt="PHC" className="w-full h-full object-contain" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, fontSize: "0.85rem", lineHeight: 1.2 }}>People's Health Care</div>
              <div className="text-white/40 text-xs">Doctor Portal</div>
            </div>
          )}
        </div>

        {/* Doctor profile mini */}
        {sidebarOpen && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              {user?.photo ? (
                <img src={user.photo} alt={displayName} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-sm font-bold">
                  {initials}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-sm font-semibold truncate">{displayName}</div>
                <div className="text-white/40 text-xs truncate">{subtitle}</div>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 mt-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.label;
            return (
              <a key={item.label} href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg" : "text-white/60 hover:bg-white/10 hover:text-white"} ${!sidebarOpen ? "justify-center" : ""}`}>
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && <span className="text-xs bg-cyan-500 text-white px-2 py-0.5 rounded-full font-bold">{item.badge}</span>}
                  </>
                )}
              </a>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <a href="/doctor/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/10 hover:text-white transition ${!sidebarOpen ? "justify-center" : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            {sidebarOpen && <span>Settings</span>}
          </a>
          <button onClick={() => setShowLogout(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition ${!sidebarOpen ? "justify-center" : ""}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-10 rounded-full bg-[#0D2137] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-white/30 transition-all duration-200 shadow-lg z-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
            {sidebarOpen ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
          </svg>
        </button>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <div className="text-xs text-gray-400">Doctor Portal</div>
            <div className="font-semibold text-gray-800">{activePage}</div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:block text-sm text-gray-400">{today}</div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl hover:bg-gray-100 transition text-gray-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-800">Notifications</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">3 new</span>
                  </div>
                  {[
                    { icon: "🧪", msg: "Lab results ready for Patient #1024", time: "5 min ago", color: "#7B1FA2" },
                    { icon: "📋", msg: "New appointment booked by Kamal Perera", time: "20 min ago", color: "#1565C0" },
                    { icon: "💊", msg: "Prescription dispensed by pharmacy", time: "1 hr ago", color: "#00897B" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: `${n.color}15` }}>{n.icon}</div>
                      <div>
                        <div className="text-sm text-gray-700 font-medium">{n.msg}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User avatar + name */}
            <a href="/doctor/settings" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
              {user?.photo ? (
                <img src={user.photo} alt={displayName} className="w-9 h-9 rounded-xl object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                  {initials}
                </div>
              )}
              <div className="hidden md:block">
                <div className="text-sm font-semibold text-gray-800">{displayName}</div>
                <div className="text-xs text-gray-400">{subtitle}</div>
              </div>
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}