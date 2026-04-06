import { useState } from "react";
import LabLayout from "../../components/LabLayout";

const EQUIPMENT = [
  { id: "EQ-001", name: "Haematology Analyzer", model: "Sysmex KX-21N", type: "Diagnostic", acquired: "15 Mar 2022", lastService: "15 Jan 2026", nextService: "15 Jul 2026", status: "Operational", location: "Lab Room A", specs: "20-parameter CBC analysis, 60 samples/hour", notes: "" },
  { id: "EQ-002", name: "ECG Machine", model: "Cardimax FX-8222", type: "Diagnostic", acquired: "02 Jun 2021", lastService: "10 Dec 2025", nextService: "10 Jun 2026", status: "Operational", location: "ECG Room", specs: "12-lead ECG, automatic interpretation, thermal printer", notes: "" },
  { id: "EQ-003", name: "Chemistry Analyzer", model: "Erba Chem 7", type: "Diagnostic", acquired: "20 Aug 2020", lastService: "05 Nov 2025", nextService: "05 May 2026", status: "Maintenance Due", location: "Lab Room B", specs: "Semi-automated, 7 channel, photometric analysis", notes: "Calibration drift observed. Maintenance overdue by 10 days." },
  { id: "EQ-004", name: "Centrifuge", model: "Remi R-8C", type: "Processing", acquired: "10 Jan 2023", lastService: "01 Feb 2026", nextService: "01 Aug 2026", status: "Operational", location: "Sample Prep Area", specs: "Max 8000 RPM, 8-tube rotor capacity", notes: "" },
  { id: "EQ-005", name: "Urine Analyzer", model: "Dirui FUS-200", type: "Diagnostic", acquired: "05 Sep 2022", lastService: "20 Jan 2026", nextService: "20 Jul 2026", status: "Operational", location: "Lab Room A", specs: "11-parameter strip reader, 200 samples/hour", notes: "" },
  { id: "EQ-006", name: "Microscope", model: "Olympus CX23", type: "Diagnostic", acquired: "01 Apr 2021", lastService: "12 Dec 2025", nextService: "12 Jun 2026", status: "Operational", location: "Lab Room B", specs: "Binocular, 4x/10x/40x/100x objectives", notes: "" },
];

const STATUS_CONFIG = {
  Operational: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", dot: "bg-green-400" },
  "Maintenance Due": { bg: "bg-red-100", text: "text-red-600", border: "border-red-200", dot: "bg-red-400" },
  "Under Repair": { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
  Decommissioned: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" },
};

function EquipmentModal({ eq, onClose, isNew = false }) {
  const [form, setForm] = useState(eq || {
    name: "", model: "", type: "Diagnostic", acquired: "", lastService: "", nextService: "",
    status: "Operational", location: "", specs: "", notes: "",
  });

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-5 border-b border-gray-100 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-bold text-gray-800 text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              {isNew ? "Add New Equipment" : "Edit Equipment"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">People's Health Care · Laboratory</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Equipment Name", field: "name", placeholder: "e.g. Haematology Analyzer" },
              { label: "Model", field: "model", placeholder: "e.g. Sysmex KX-21N" },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                <input type="text" value={form[field]} onChange={e => update(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Type</label>
              <select value={form.type} onChange={e => update("type", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                {["Diagnostic", "Processing", "Monitoring", "Other"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
              <select value={form.status} onChange={e => update("status", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400">
                {["Operational", "Maintenance Due", "Under Repair", "Decommissioned"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Acquisition Date", field: "acquired", type: "date" },
              { label: "Last Service", field: "lastService", type: "date" },
              { label: "Next Service Due", field: "nextService", type: "date" },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                <input type={type} value={form[field]} onChange={e => update(field, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Location</label>
            <input type="text" value={form.location} onChange={e => update("location", e.target.value)}
              placeholder="e.g. Lab Room A"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Specifications</label>
            <textarea value={form.specs} onChange={e => update("specs", e.target.value)} rows={2} placeholder="Technical specifications..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition resize-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Notes / Maintenance Remarks</label>
            <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={2} placeholder="Any issues, notes or remarks..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}>
              {isNew ? "Add Equipment" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LabEquipment() {
  const [showModal, setShowModal] = useState(false);
  const [editEquip, setEditEquip] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const filtered = EQUIPMENT.filter(e => statusFilter === "All" || e.status === statusFilter);
  const maintenanceDue = EQUIPMENT.filter(e => e.status === "Maintenance Due").length;

  return (
    <LabLayout activePage="Equipment">
      {(showModal || editEquip) && (
        <EquipmentModal
          eq={editEquip}
          isNew={!editEquip}
          onClose={() => { setShowModal(false); setEditEquip(null); }}
        />
      )}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
              Equipment Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">Monitor and manage laboratory equipment</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg, #006064, #00838F)" }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Equipment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Equipment", value: EQUIPMENT.length, color: "#006064", bg: "#E0F2F1" },
            { label: "Operational", value: EQUIPMENT.filter(e => e.status === "Operational").length, color: "#00897B", bg: "#E0F2F1" },
            { label: "Maintenance Due", value: maintenanceDue, color: "#B71C1C", bg: "#FFEBEE" },
            { label: "Under Repair", value: EQUIPMENT.filter(e => e.status === "Under Repair").length, color: "#E65100", bg: "#FFF3E0" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Alert */}
        {maintenanceDue > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="text-xl flex-shrink-0">⚠️</div>
            <div>
              <p className="text-sm font-semibold text-red-800">Maintenance Required</p>
              <p className="text-xs text-red-700 mt-1">
                {maintenanceDue} piece(s) of equipment are overdue for maintenance. This may affect test accuracy. Contact the service provider immediately.
              </p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-2">
          {["All", "Operational", "Maintenance Due", "Under Repair", "Decommissioned"].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                statusFilter === f ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={statusFilter === f ? { background: "linear-gradient(135deg, #006064, #00838F)" } : {}}>
              {f}
            </button>
          ))}
        </div>

        {/* Equipment cards */}
        <div className="space-y-3">
          {filtered.map(eq => {
            const style = STATUS_CONFIG[eq.status];
            const isExpanded = expandedId === eq.id;
            return (
              <div key={eq.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition ${
                eq.status === "Maintenance Due" ? "border-red-200" : "border-gray-100"
              }`}>
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpandedId(isExpanded ? null : eq.id)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: "#E0F2F1" }}>
                    ⚙️
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800">{eq.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{eq.type}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{eq.model} · {eq.location}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Last service: {eq.lastService} · Next due: {eq.nextService}</div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                      {eq.status}
                    </span>
                    <svg viewBox="0 0 20 20" fill="currentColor"
                      className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Equipment Details</p>
                        <div className="space-y-2">
                          {[
                            { label: "Equipment ID", val: eq.id },
                            { label: "Acquisition Date", val: eq.acquired },
                            { label: "Location", val: eq.location },
                          ].map(item => (
                            <div key={item.label} className="flex justify-between py-1.5 border-b border-gray-200 last:border-0">
                              <span className="text-xs text-gray-400">{item.label}</span>
                              <span className="text-xs font-semibold text-gray-700">{item.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Specifications</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{eq.specs}</p>
                        {eq.notes && (
                          <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-700">
                            ⚠️ {eq.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => setEditEquip(eq)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-teal-200 text-teal-700 text-xs font-semibold hover:bg-teal-50 transition">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        Edit
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-100 transition">
                        📋 Service Log
                      </button>
                      {eq.status === "Maintenance Due" && (
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition">
                          🔧 Request Maintenance
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </LabLayout>
  );
}
