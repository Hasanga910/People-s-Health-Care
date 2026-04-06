import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";

const STAFF = [
  { id: "STF-001", name: "Dr. M.T.D. Jayaweera", role: "Chief Physician", dept: "Consultation", phone: "0777 883 343", email: "jayaweera@phc.lk", joined: "01 Jan 2020", status: "Active", avatar: "DJ", shift: "Mon–Sat · 08:00–17:00" },
  { id: "STF-002", name: "Lab Technician", role: "Senior Lab Technician", dept: "Laboratory", phone: "0712 345 678", email: "lab@phc.lk", joined: "15 Mar 2021", status: "Active", avatar: "LT", shift: "Mon–Fri · 07:30–16:30" },
  { id: "STF-003", name: "Pharmacist", role: "Chief Pharmacist", dept: "Pharmacy", phone: "0765 234 567", email: "pharmacy@phc.lk", joined: "10 Jun 2022", status: "Active", avatar: "PH", shift: "Mon–Sat · 08:00–18:00" },
  { id: "STF-004", name: "Receptionist", role: "Senior Receptionist", dept: "Front Desk", phone: "0712 678 901", email: "reception@phc.lk", joined: "20 Aug 2023", status: "Active", avatar: "RC", shift: "Mon–Sat · 07:30–17:00" },
];

const DEPT_COLORS = {
  Consultation: { bg: "bg-blue-100",  text: "text-blue-700"  },
  Laboratory:   { bg: "bg-teal-100",  text: "text-teal-700"  },
  Pharmacy:     { bg: "bg-green-100", text: "text-green-700" },
  "Front Desk": { bg: "bg-gray-100",  text: "text-gray-600"  },
};

function StaffModal({ staff, isNew, onClose }) {
  const [form, setForm] = useState(staff || { name: "", role: "", dept: "Consultation", phone: "", email: "", shift: "", status: "Active" });
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0D2137, #B45309)" }}>
          <div>
            <p className="text-white/60 text-xs">Staff Management</p>
            <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              {isNew ? "Add New Staff Member" : "Edit Staff Record"}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Full Name", key: "name", placeholder: "e.g. Dr. A.B. Perera" },
            { label: "Role / Designation", key: "role", placeholder: "e.g. Senior Lab Technician" },
            { label: "Phone", key: "phone", placeholder: "0712 345 678" },
            { label: "Email", key: "email", placeholder: "staff@phc.lk" },
            { label: "Shift", key: "shift", placeholder: "Mon–Fri · 08:00–17:00" },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{field.label}</label>
              <input type="text" value={form[field.key] || ""} onChange={e => u(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Department</label>
              <select value={form.dept} onChange={e => u("dept", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {["Consultation", "Laboratory", "Pharmacy", "Front Desk", "Administration"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
              <select value={form.status} onChange={e => u("status", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {["Active", "On Leave", "Inactive"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #B45309, #D97706)" }}>
              {isNew ? "Add Staff Member" : "Save Changes"}
            </button>
            <button onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminStaff() {
  const [search, setSearch]       = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [modal, setModal]         = useState(null); // {staff, isNew}

  const DEPTS = ["All", "Consultation", "Laboratory", "Pharmacy", "Front Desk"];
  const filtered = STAFF.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase());
    const matchDept   = deptFilter === "All" || s.dept === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <AdminLayout activePage="Staff Management">
      {modal && <StaffModal staff={modal.staff} isNew={modal.isNew} onClose={() => setModal(null)} />}

      <div className="p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>Staff Management</h1>
            <p className="text-sm text-gray-400 mt-1">Manage People's Health Care team members</p>
          </div>
          <button onClick={() => setModal({ isNew: true, staff: null })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #B45309, #D97706)" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
            Add Staff
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Staff", value: STAFF.length, color: "#B45309", bg: "#FEF3C7" },
            { label: "Active", value: STAFF.filter(s => s.status === "Active").length, color: "#2E7D32", bg: "#E8F5E9" },
            { label: "Departments", value: 4, color: "#1565C0", bg: "#E3F2FD" },
            { label: "On Leave", value: 0, color: "#37474F", bg: "#ECEFF1" },
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
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
            <input type="text" placeholder="Search by name or role…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
          </div>
          <div className="flex gap-2">
            {DEPTS.map(d => (
              <button key={d} onClick={() => setDeptFilter(d)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${deptFilter === d ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                style={deptFilter === d ? { background: "linear-gradient(135deg, #B45309, #D97706)" } : {}}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Staff cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(s => {
            const dc = DEPT_COLORS[s.dept] || DEPT_COLORS["Front Desk"];
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="flex items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #B45309, #D97706)" }}>
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.role}</div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${dc.bg} ${dc.text}`}>{s.dept}</span>
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-0.5 rounded-full">● {s.status}</span>
                    </div>
                  </div>
                  <button onClick={() => setModal({ staff: s, isNew: false })}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition flex-shrink-0">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                    </svg>
                  </button>
                </div>
                <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">📞 {s.phone}</div>
                  <div className="flex items-center gap-1.5">🕐 {s.shift}</div>
                  <div className="flex items-center gap-1.5">✉️ {s.email}</div>
                  <div className="flex items-center gap-1.5">📅 Joined: {s.joined}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
