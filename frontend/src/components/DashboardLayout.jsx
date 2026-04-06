import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const navItems = {
  doctor: [
    { label: "Overview", icon: "⬡", path: "/doctor" },
    { label: "Appointments", icon: "📅", path: "/doctor/appointments" },
    { label: "Prescriptions", icon: "💊", path: "/doctor/prescriptions" },
    { label: "Lab Requests", icon: "🧪", path: "/doctor/lab-requests" },
    { label: "Patient Records", icon: "🗂", path: "/doctor/patients" },
    { label: "Analytics", icon: "📊", path: "/doctor/analytics" },
  ],
  patient: [
    { label: "Overview", icon: "⬡", path: "/patient" },
    { label: "Book Appointment", icon: "📅", path: "/patient/appointments" },
    { label: "My Prescriptions", icon: "💊", path: "/patient/prescriptions" },
    { label: "Lab Reports", icon: "🧪", path: "/patient/lab-reports" },
    { label: "Billing", icon: "🧾", path: "/patient/billing" },
    { label: "Profile", icon: "👤", path: "/patient/profile" },
  ],
  pharmacy: [
    { label: "Overview", icon: "⬡", path: "/pharmacy" },
    { label: "Dispensing Queue", icon: "💊", path: "/pharmacy/dispensing" },
    { label: "Inventory", icon: "📦", path: "/pharmacy/inventory" },
    { label: "Sales & Billing", icon: "🧾", path: "/pharmacy/billing" },
    { label: "Reports", icon: "📊", path: "/pharmacy/reports" },
  ],
  lab: [
    { label: "Overview", icon: "⬡", path: "/lab" },
    { label: "Test Requests", icon: "📋", path: "/lab/requests" },
    { label: "Upload Results", icon: "📤", path: "/lab/results" },
    { label: "Equipment", icon: "⚙", path: "/lab/equipment" },
    { label: "Reports", icon: "📊", path: "/lab/reports" },
  ],
  admin: [
    { label: "Overview", icon: "⬡", path: "/admin" },
    { label: "Staff Management", icon: "👥", path: "/admin/staff" },
    { label: "Appointments", icon: "📅", path: "/admin/appointments" },
    { label: "Equipment & Resources", icon: "⚙", path: "/admin/resources" },
    { label: "Billing Overview", icon: "🧾", path: "/admin/billing" },
    { label: "System Settings", icon: "⚙", path: "/admin/settings" },
  ],
};

const roleLabels = {
  doctor: { title: "Dr. M.T.D. Jayaweera", subtitle: "Medical Director", badge: "Doctor" },
  patient: { title: "Patient Portal", subtitle: "People's Health Care", badge: "Patient" },
  pharmacy: { title: "Pharmacy", subtitle: "People's Health Care", badge: "Pharmacy Staff" },
  lab: { title: "Laboratory", subtitle: "People's Health Care", badge: "Lab Staff" },
  admin: { title: "Administration", subtitle: "People's Health Care", badge: "Admin" },
};

export default function DashboardLayout({ role = "patient", children, pageTitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const items = navItems[role] || navItems.patient;
  const roleInfo = roleLabels[role] || roleLabels.patient;

  const badgeColor = {
    doctor: "bg-blue-600",
    patient: "bg-cyan-600",
    pharmacy: "bg-emerald-600",
    lab: "bg-violet-600",
    admin: "bg-slate-700",
  }[role] || "bg-blue-600";

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-18"
        } bg-gradient-to-b from-blue-950 to-blue-900 text-white flex flex-col transition-all duration-300 ease-in-out shadow-2xl z-30 flex-shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-blue-800">
          <div className="w-9 h-9 rounded-xl bg-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-blue-950" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-sm font-bold text-white leading-tight">People's</p>
              <p className="text-xs text-cyan-300 leading-tight">Health Care</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-blue-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              )}
            </svg>
          </button>
        </div>

        {/* Role badge */}
        {sidebarOpen && (
          <div className="px-5 py-4 border-b border-blue-800">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeColor} text-white`}>
              {roleInfo.badge}
            </span>
            <p className="text-sm font-semibold text-white mt-2 leading-tight">{roleInfo.title}</p>
            <p className="text-xs text-blue-300">{roleInfo.subtitle}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                    : "text-blue-200 hover:bg-blue-800 hover:text-white"
                }`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
                {isActive && sidebarOpen && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-blue-800">
          <Link
            to="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-300 hover:bg-red-600/20 hover:text-red-300 transition-all"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span>Sign Out</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{pageTitle}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-xl bg-blue-900 flex items-center justify-center text-white text-sm font-bold cursor-pointer">
              {roleInfo.badge.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
