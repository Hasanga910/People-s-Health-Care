import { useState, useEffect } from "react";
import PatientLayout from "../../components/PatientLayout";
import api from "../../services/api";

// ── Helper: get initials from name ─────────────────────────
function getInitials(name) {
  if (!name) return "P";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ── Helper: format birthday to readable date ───────────────
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// ── Helper: calculate age from birthday ───────────────────
function calculateAge(birthday) {
  if (!birthday) return null;
  const today = new Date();
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// ── Reusable section card ──────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800"
          style={{ fontFamily: "'Playfair Display', serif" }}>
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Reusable info row ──────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">
        {value || "N/A"}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function PatientProfile() {
  const [activeTab, setActiveTab]   = useState("overview");
  const [editing, setEditing]       = useState(false);
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg]     = useState("");

  // ── Edit form state ──────────────────────────────────────
  // These hold the values while the user is editing
  const [form, setForm] = useState({
    name:                   "",
    telephone:              "",
    gender:                 "",
    birthday:               "",
    bloodGroup:             "",
    allergies:              "",
    chronicConditions:      "",
    currentMedications:     "",
    emergencyContactName:   "",
    emergencyContactNumber: "",
    address:                "",
  });

  // ── Fetch real user data on page load ───────────────────
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // First load from localStorage for instant display
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          populateForm(parsed);
        }

        // Then fetch fresh data from backend
        const res = await api.get("/auth/me");
        if (res.data.success) {
          setUser(res.data.user);
          populateForm(res.data.user);
          // Update localStorage with fresh data
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        setErrorMsg("Could not load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ── Populate form fields from user object ───────────────
  const populateForm = (u) => {
    setForm({
      name:                   u.name || "",
      telephone:              u.telephone || "",
      gender:                 u.patientDetails?.gender || "",
      birthday:               u.patientDetails?.birthday
                                ? u.patientDetails.birthday.split("T")[0]
                                : "",
      // .split("T")[0] converts "1990-05-12T00:00:00.000Z" → "1990-05-12"
      // because <input type="date"> needs "YYYY-MM-DD" format
      bloodGroup:             u.patientDetails?.bloodGroup || "",
      allergies:              (u.patientDetails?.allergies || []).join(", "),
      // allergies is an array in DB e.g. ["Penicillin","Dust"]
      // We join it to a string for the text input: "Penicillin, Dust"
      chronicConditions:      u.patientDetails?.chronicConditions || "",
      currentMedications:     u.patientDetails?.currentMedications || "",
      emergencyContactName:   u.patientDetails?.emergencyContactName || "",
      emergencyContactNumber: u.patientDetails?.emergencyContactNumber || "",
      address:                u.patientDetails?.address || "",
    });
  };

  // ── Handle form field changes ────────────────────────────
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // [e.target.name] is computed property — updates only the changed field
  };

  // ── Submit edit form ─────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    // e.preventDefault() stops the page from refreshing on form submit
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        name:      form.name,
        telephone: form.telephone,
        patientDetails: {
          gender:                 form.gender,
          birthday:               form.birthday,
          bloodGroup:             form.bloodGroup,
          allergies:              form.allergies
                                    .split(",")
                                    .map((a) => a.trim())
                                    .filter(Boolean),
          // Convert "Penicillin, Dust" back to ["Penicillin", "Dust"]
          chronicConditions:      form.chronicConditions,
          currentMedications:     form.currentMedications,
          emergencyContactName:   form.emergencyContactName,
          emergencyContactNumber: form.emergencyContactNumber,
          address:                form.address,
        },
      };

      const res = await api.put("/auth/me", payload);
      // PUT /api/auth/me is the existing route your friend built

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        // Update localStorage so sidebar also shows new name
        setSuccessMsg("Profile updated successfully!");
        setEditing(false);
        // Close edit form on success
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to update profile. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel editing ───────────────────────────────────────
  const handleCancelEdit = () => {
    populateForm(user);
    // Reset form back to current saved values
    setEditing(false);
    setErrorMsg("");
  };

  // ── Loading state ────────────────────────────────────────
  if (loading) {
    return (
      <PatientLayout activePage="My Profile">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-sm">Loading profile...</div>
        </div>
      </PatientLayout>
    );
  }

  // ── Derived display values ───────────────────────────────
  const age        = calculateAge(user?.patientDetails?.birthday);
  const initials   = getInitials(user?.name);
  const bloodGroup = user?.patientDetails?.bloodGroup;
  const registeredDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })
    : "N/A";

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "medical",  label: "Medical Info" },
    { id: "edit",     label: "Edit Profile" },
  ];

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════
  return (
    <PatientLayout activePage="My Profile">
      <div className="p-6 space-y-5">

        {/* ── Success / Error messages ── */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700
                          text-sm px-4 py-3 rounded-xl">
            ✓ {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700
                          text-sm px-4 py-3 rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* ── Profile Header Card ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #1565C0 60%, #00ACC1 100%)" }}>

          <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-5">

            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center
                              text-2xl font-bold text-white flex-shrink-0 border-4 border-white/20"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full
                              bg-green-400 border-2 border-white" />
            </div>

            {/* Name and badges */}
            <div className="flex-1">
              <h2 style={{ fontFamily: "'Playfair Display', serif",
                           fontWeight: 700, fontSize: "1.5rem", color: "white" }}>
                {user?.name || "Patient"}
              </h2>
              <div className="flex flex-wrap gap-3 mt-2">
                {[
                  { label: "ID",           val: user?.userId },
                  { label: "Age",          val: age ? `${age} yrs` : null },
                  { label: "Blood Group",  val: bloodGroup },
                  { label: "Since",        val: registeredDate },
                ].filter(item => item.val).map((item) => (
                  <div key={item.label}
                    className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                    <span className="text-white/50 text-xs">{item.label}:</span>
                    <span className="text-white text-xs font-semibold">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit button */}
            <button
              onClick={() => { setActiveTab("edit"); setEditing(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/15
                         hover:bg-white/25 border border-white/20 rounded-xl
                         text-white text-sm font-medium transition flex-shrink-0"
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
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap
                            transition border-b-2 ${
                  activeTab === tab.id
                    ? "text-white border-cyan-300"
                    : "text-white/50 border-transparent hover:text-white/80"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TAB: Overview — shows real data from database
        ══════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-5">

            <Section title="Personal Information">
              <div className="space-y-1">
                <InfoRow label="Full Name"    value={user?.name} />
                <InfoRow label="Patient ID"   value={user?.userId} />
                <InfoRow label="Email"        value={user?.email} />
                <InfoRow label="Phone"        value={user?.telephone} />
                <InfoRow label="Date of Birth"
                  value={formatDate(user?.patientDetails?.birthday)} />
                <InfoRow label="Age"
                  value={age ? `${age} years` : null} />
                <InfoRow label="Gender"
                  value={user?.patientDetails?.gender} />
                <InfoRow label="Blood Group"
                  value={user?.patientDetails?.bloodGroup} />
              </div>
            </Section>

            <div className="space-y-5">
              <Section title="Address">
                <p className="text-sm text-gray-700">
                  {user?.patientDetails?.address || "No address saved"}
                </p>
              </Section>

              <Section title="Emergency Contact">
                <div className="flex items-center gap-3 p-4 bg-red-50
                                rounded-xl border border-red-100">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center
                                  justify-center text-lg flex-shrink-0">🆘</div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {user?.patientDetails?.emergencyContactName || "Not set"}
                    </div>
                    <div className="text-sm font-semibold text-blue-700 mt-0.5">
                      {user?.patientDetails?.emergencyContactNumber || "—"}
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: Medical Info
        ══════════════════════════════════════════════════ */}
        {activeTab === "medical" && (
          <div className="grid md:grid-cols-2 gap-5">

            <Section title="Allergies">
              {user?.patientDetails?.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.patientDetails.allergies.map((a) => (
                    <span key={a}
                      className="px-3 py-1.5 bg-red-50 text-red-700 border
                                 border-red-100 rounded-full text-sm font-medium">
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No allergies recorded</p>
              )}
            </Section>

            <Section title="Chronic Conditions">
              <p className="text-sm text-gray-700">
                {user?.patientDetails?.chronicConditions || "None recorded"}
              </p>
            </Section>

            <Section title="Current Medications">
              <p className="text-sm text-gray-700">
                {user?.patientDetails?.currentMedications || "None recorded"}
              </p>
            </Section>

          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TAB: Edit Profile — real working form
        ══════════════════════════════════════════════════ */}
        {activeTab === "edit" && (
          <Section title="Edit Profile">
            <form onSubmit={handleSave} className="space-y-5">

              {/* ── Basic Info ── */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase
                               tracking-wide mb-3">Basic Information</h4>
                <div className="grid md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                    <input name="name" value={form.name} onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Phone</label>
                    <input name="telephone" value={form.telephone} onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
                    <input type="date" name="birthday" value={form.birthday}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Blood Group</label>
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                      <option value="">Select blood group</option>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"].map(bg => (
                        <option key={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Address</label>
                    <input name="address" value={form.address} onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>

                </div>
              </div>

              {/* ── Medical Info ── */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase
                               tracking-wide mb-3">Medical Information</h4>
                <div className="grid md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Allergies
                      <span className="text-gray-400 font-normal ml-1">
                        (separate with commas)
                      </span>
                    </label>
                    <input name="allergies" value={form.allergies}
                      onChange={handleChange}
                      placeholder="e.g. Penicillin, Dust, Pollen"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Chronic Conditions
                    </label>
                    <input name="chronicConditions" value={form.chronicConditions}
                      onChange={handleChange}
                      placeholder="e.g. Diabetes, Hypertension"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">
                      Current Medications
                    </label>
                    <input name="currentMedications" value={form.currentMedications}
                      onChange={handleChange}
                      placeholder="e.g. Metformin 500mg, Lisinopril 10mg"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>

                </div>
              </div>

              {/* ── Emergency Contact ── */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase
                               tracking-wide mb-3">Emergency Contact</h4>
                <div className="grid md:grid-cols-2 gap-4">

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Contact Name</label>
                    <input name="emergencyContactName" value={form.emergencyContactName}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Contact Number</label>
                    <input name="emergencyContactNumber" value={form.emergencyContactNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200
                                 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>

                </div>
              </div>

              {/* ── Action buttons ── */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold
                             disabled:opacity-60 transition"
                  style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={handleCancelEdit}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600
                             text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>

            </form>
          </Section>
        )}

      </div>
    </PatientLayout>
  );
}