import { useState, useEffect } from "react";
import PatientLayout from "../../components/PatientLayout";
import api from "../../services/api";

function getInitials(name) {
  if (!name) return "P";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });
}
function calculateAge(birthday) {
  if (!birthday) return null;
  const today = new Date();
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
const isValidPhone    = (v) => /^\d{10}$/.test(v);
const isValidPassword = (v) => /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(v);
const isValidEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidUsername = (v) => /^[a-zA-Z0-9_]{3,30}$/.test(v);

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800"
          style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">{value || "N/A"}</span>
    </div>
  );
}
function LockedField({ label, value }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1">
        🔒 {label} <span className="text-gray-300">(cannot be changed)</span>
      </label>
      <div className="w-full px-3 py-2.5 rounded-xl border border-gray-100
                      bg-gray-50 text-sm text-gray-500">
        {value || "—"}
      </div>
    </div>
  );
}
function EditField({ label, name, value, onChange, error, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type} name={name} value={value}
        onChange={onChange} placeholder={placeholder}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-400 ${
          error ? "border-red-400 bg-red-50" : "border-gray-200"
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">⚠ {error}</p>}
    </div>
  );
}

export default function PatientProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errors, setErrors]       = useState({});

  // ── Editable form state ──────────────────────────────────
  const [form, setForm] = useState({
    // Editable fields
    emergencyContactName:   "",
    emergencyContactNumber: "",
    address:                "",
    allergies:              "",
    chronicConditions:      "",
    currentMedications:     "",
    // Password change
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
    // Username → Email upgrade
    newEmail:        "",
    // Username change (only if no email)
    newUsername:     "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) { const p = JSON.parse(stored); setUser(p); populateForm(p); }
        const res = await api.get("/auth/me");
        if (res.data.success) {
          setUser(res.data.user);
          populateForm(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch { /* silently fail */ }
      finally { setLoading(false); }
    };
    fetchUser();
  }, []);

  const populateForm = (u) => {
    setForm((prev) => ({
      ...prev,
      emergencyContactName:   u.patientDetails?.emergencyContactName   || "",
      emergencyContactNumber: u.patientDetails?.emergencyContactNumber || "",
      address:                u.patientDetails?.address                || "",
      allergies:              (u.patientDetails?.allergies || []).join(", "),
      chronicConditions:      u.patientDetails?.chronicConditions      || "",
      currentMedications:     u.patientDetails?.currentMedications     || "",
    }));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  // ── Save contact + medical details ──────────────────────
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (form.emergencyContactNumber && !isValidPhone(form.emergencyContactNumber))
      newErrors.emergencyContactNumber = "Must be exactly 10 digits";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await api.put("/auth/me", {
        patientDetails: {
          emergencyContactName:   form.emergencyContactName,
          emergencyContactNumber: form.emergencyContactNumber,
          address:                form.address,
          allergies:              form.allergies.split(",").map(a => a.trim()).filter(Boolean),
          chronicConditions:      form.chronicConditions,
          currentMedications:     form.currentMedications,
        },
      });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSuccessMsg("Details updated successfully!");
      }
    } catch (err) {
      setErrors({ details: err.response?.data?.message || "Failed to save. Try again." });
    } finally { setSaving(false); }
  };

  // ── Change password ──────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.currentPassword) newErrors.currentPassword = "Current password is required";
    if (!form.newPassword) newErrors.newPassword = "New password is required";
    else if (!isValidPassword(form.newPassword))
      newErrors.newPassword = "Must be 6+ characters with letters and numbers";
    if (form.newPassword !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await api.put("/auth/me", {
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      });
      if (res.data.success) {
        setSuccessMsg("Password changed successfully!");
        setForm({ ...form, currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      setErrors({ currentPassword: err.response?.data?.message || "Failed. Try again." });
    } finally { setSaving(false); }
  };

  // ── Username → Email upgrade ─────────────────────────────
  const handleUpgradeToEmail = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.newEmail) newErrors.newEmail = "Email address is required";
    else if (!isValidEmail(form.newEmail))
      newErrors.newEmail = "Enter a valid email address";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await api.put("/auth/me", { email: form.newEmail });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSuccessMsg("Email added successfully! You can now login with your email.");
        setForm({ ...form, newEmail: "" });
      }
    } catch (err) {
      setErrors({ newEmail: err.response?.data?.message || "Failed. Try again." });
    } finally { setSaving(false); }
  };

  // ── Change username ──────────────────────────────────────
  const handleChangeUsername = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.newUsername) newErrors.newUsername = "Username is required";
    else if (!isValidUsername(form.newUsername))
      newErrors.newUsername = "3-30 characters, letters/numbers/underscore only";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSaving(true);
    setSuccessMsg("");
    try {
      const res = await api.put("/auth/me", { username: form.newUsername });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSuccessMsg("Username updated successfully!");
        setForm({ ...form, newUsername: "" });
      }
    } catch (err) {
      setErrors({ newUsername: err.response?.data?.message || "Failed. Try again." });
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <PatientLayout activePage="My Profile">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-sm">Loading profile...</div>
        </div>
      </PatientLayout>
    );
  }

  const age          = calculateAge(user?.patientDetails?.birthday);
  const initials     = getInitials(user?.name);
  const bloodGroup   = user?.patientDetails?.bloodGroup;
  const hasEmail     = !!user?.email;
  const hasUsername  = !!user?.username;
  const registeredDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric" })
    : "N/A";

  const TABS = [
    { id: "overview", label: "Overview"     },
    { id: "medical",  label: "Medical Info" },
    { id: "edit",     label: "Edit Profile" },
  ];

  return (
    <PatientLayout activePage="My Profile">
      <div className="p-6 space-y-5">

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700
                          text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            ✓ {successMsg}
            <button onClick={() => setSuccessMsg("")}
              className="ml-auto text-green-400 hover:text-green-600">✕</button>
          </div>
        )}

        {/* ── Header ── */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #1565C0 60%, #00ACC1 100%)" }}>
          <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center
                              text-2xl font-bold text-white border-4 border-white/20"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                {initials}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full
                              bg-green-400 border-2 border-white" />
            </div>
            <div className="flex-1">
              <h2 style={{ fontFamily: "'Playfair Display', serif",
                fontWeight: 700, fontSize: "1.5rem", color: "white" }}>
                {user?.name}
              </h2>
              <div className="flex flex-wrap gap-3 mt-2">
                {[
                  { label: "ID",          val: user?.userId },
                  { label: "Age",         val: age ? `${age} yrs` : null },
                  { label: "Blood Group", val: bloodGroup },
                  { label: "Since",       val: registeredDate },
                ].filter(i => i.val).map((item) => (
                  <div key={item.label}
                    className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1">
                    <span className="text-white/50 text-xs">{item.label}:</span>
                    <span className="text-white text-xs font-semibold">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setActiveTab("edit")}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/15
                         hover:bg-white/25 border border-white/20 rounded-xl
                         text-white text-sm font-medium transition">
              ✏ Edit Profile
            </button>
          </div>
          <div className="flex border-t border-white/10 overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap
                            transition border-b-2 ${
                  activeTab === tab.id
                    ? "text-white border-cyan-300"
                    : "text-white/50 border-transparent hover:text-white/80"
                }`}>{tab.label}</button>
            ))}
          </div>
        </div>

        {/* ══ TAB: Overview ══ */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-5">
            <Section title="Personal Information">
              <div className="space-y-1">
                <InfoRow label="Full Name"    value={user?.name} />
                <InfoRow label="Patient ID"   value={user?.userId} />
                <InfoRow label="Login"
                  value={user?.email || user?.username || "—"} />
                <InfoRow label="Phone"        value={user?.telephone} />
                <InfoRow label="Date of Birth"
                  value={formatDate(user?.patientDetails?.birthday)} />
                <InfoRow label="Age"
                  value={age ? `${age} years` : null} />
                <InfoRow label="Gender"
                  value={user?.patientDetails?.gender} />
                <InfoRow label="Blood Group"  value={bloodGroup} />
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
                                  justify-center text-lg">🆘</div>
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

        {/* ══ TAB: Medical Info ══ */}
        {activeTab === "medical" && (
          <div className="grid md:grid-cols-2 gap-5">
            <Section title="Allergies">
              {user?.patientDetails?.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.patientDetails.allergies.map((a) => (
                    <span key={a} className="px-3 py-1.5 bg-red-50 text-red-700
                                             border border-red-100 rounded-full text-sm">
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

        {/* ══ TAB: Edit Profile ══ */}
        {activeTab === "edit" && (
          <div className="space-y-5">

            {/* ── Locked fields notice ── */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl
                            px-4 py-3 text-xs text-amber-800 flex items-center gap-2">
              🔒 Some fields like name, birthday, gender, blood group, email and
              telephone cannot be changed after registration. Contact the admin
              if these need to be corrected.
            </div>

            {/* ── Section 1: Locked fields (read only display) ── */}
            <Section title="Registered Information (Read Only)">
              <div className="grid md:grid-cols-2 gap-4">
                <LockedField label="Full Name"    value={user?.name} />
                <LockedField label="Telephone"    value={user?.telephone} />
                <LockedField label="Date of Birth"
                  value={formatDate(user?.patientDetails?.birthday)} />
                <LockedField label="Gender"
                  value={user?.patientDetails?.gender} />
                <LockedField label="Blood Group"
                  value={user?.patientDetails?.bloodGroup} />
                <LockedField label="Email / Username"
                  value={user?.email || user?.username} />
              </div>
            </Section>

            {/* ── Section 2: Editable contact + medical ── */}
            <Section title="Update Contact & Medical Details">
              <form onSubmit={handleSaveDetails} className="space-y-5">
                {errors.details && (
                  <p className="text-xs text-red-500">⚠ {errors.details}</p>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  <EditField label="Emergency Contact Name"
                    name="emergencyContactName"
                    value={form.emergencyContactName} onChange={handleChange}
                    placeholder="e.g. Kamali Perera" />
                  <EditField label="Emergency Contact Number"
                    name="emergencyContactNumber"
                    value={form.emergencyContactNumber} onChange={handleChange}
                    placeholder="e.g. 0771234567"
                    error={errors.emergencyContactNumber} />
                  <div className="md:col-span-2">
                    <EditField label="Home Address" name="address"
                      value={form.address} onChange={handleChange}
                      placeholder="No., Street, City" />
                  </div>
                  <EditField label="Allergies (comma separated)"
                    name="allergies"
                    value={form.allergies} onChange={handleChange}
                    placeholder="e.g. Penicillin, Dust, Pollen" />
                  <EditField label="Chronic Conditions"
                    name="chronicConditions"
                    value={form.chronicConditions} onChange={handleChange}
                    placeholder="e.g. Diabetes, Hypertension" />
                  <div className="md:col-span-2">
                    <EditField label="Current Medications"
                      name="currentMedications"
                      value={form.currentMedications} onChange={handleChange}
                      placeholder="e.g. Metformin 500mg twice daily" />
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-white text-sm
                             font-semibold disabled:opacity-60 transition"
                  style={{ background: "linear-gradient(135deg, #1565C0, #00ACC1)" }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </Section>

            {/* ── Section 3: Change password ── */}
            <Section title="Change Password">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <EditField label="Current Password"
                    name="currentPassword" type="password"
                    value={form.currentPassword} onChange={handleChange}
                    placeholder="Current password"
                    error={errors.currentPassword} />
                  <EditField label="New Password"
                    name="newPassword" type="password"
                    value={form.newPassword} onChange={handleChange}
                    placeholder="Min 6 chars with letters & numbers"
                    error={errors.newPassword} />
                  <EditField label="Confirm New Password"
                    name="confirmPassword" type="password"
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter new password"
                    error={errors.confirmPassword} />
                </div>
                {form.newPassword && (
                  <p className={`text-xs ${
                    isValidPassword(form.newPassword)
                      ? "text-green-600" : "text-amber-600"
                  }`}>
                    {isValidPassword(form.newPassword)
                      ? "✓ Strong password"
                      : "⚠ Must be 6+ characters with letters and numbers"}
                  </p>
                )}
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-white text-sm
                             font-semibold disabled:opacity-60 transition
                             bg-gray-700 hover:bg-gray-800">
                  {saving ? "Saving..." : "Change Password"}
                </button>
              </form>
            </Section>

            {/* ── Section 4: Username → Email upgrade ── */}
            {!hasEmail && hasUsername && (
              <Section title="Add Email Address">
                <p className="text-sm text-gray-500 mb-4">
                  You registered with the username <strong>{user.username}</strong>.
                  Add your email address to also login with email in the future.
                </p>
                <form onSubmit={handleUpgradeToEmail} className="space-y-4">
                  <EditField label="Your Email Address"
                    name="newEmail" type="email"
                    value={form.newEmail} onChange={handleChange}
                    placeholder="you@example.com"
                    error={errors.newEmail} />
                  <button type="submit" disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-white text-sm
                               font-semibold disabled:opacity-60 transition"
                    style={{ background: "linear-gradient(135deg, #00897B, #00ACC1)" }}>
                    {saving ? "Saving..." : "Add Email Address"}
                  </button>
                </form>
              </Section>
            )}

            {/* ── Section 5: Change username (only if no email) ── */}
            {!hasEmail && hasUsername && (
              <Section title="Change Username">
                <p className="text-sm text-gray-500 mb-4">
                  Current username: <strong>{user.username}</strong>
                </p>
                <form onSubmit={handleChangeUsername} className="space-y-4">
                  <EditField label="New Username"
                    name="newUsername"
                    value={form.newUsername} onChange={handleChange}
                    placeholder="e.g. kamal_perera_2006"
                    error={errors.newUsername}  />
                  <p className="text-xs text-gray-400">
                    3-30 characters. Letters, numbers and underscore only.
                  </p>
                  <button type="submit" disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-white text-sm
                               font-semibold disabled:opacity-60 transition
                               bg-gray-600 hover:bg-gray-700">
                    {saving ? "Saving..." : "Change Username"}
                  </button>
                </form>
              </Section>
            )}

          </div>
        )}
      </div>
    </PatientLayout>
  );
}