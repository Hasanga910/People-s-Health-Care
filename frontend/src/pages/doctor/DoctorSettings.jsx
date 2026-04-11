import { useState, useEffect, useRef } from "react";
import DoctorLayout from "../../components/DoctorLayout";
import api from "../../services/api";
import authService from "../../services/authService";

const TABS = ["Profile", "Professional", "Security"];

// Password validation rules
const PW_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character (!@#$...)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function passwordStrength(pw) {
  const passed = PW_RULES.filter((r) => r.test(pw)).length;
  if (passed <= 1) return { score: 1, label: "Very weak", color: "bg-red-400" };
  if (passed === 2) return { score: 2, label: "Weak", color: "bg-orange-400" };
  if (passed === 3) return { score: 3, label: "Fair", color: "bg-yellow-400" };
  if (passed === 4) return { score: 4, label: "Good", color: "bg-blue-400" };
  return { score: 5, label: "Strong", color: "bg-green-500" };
}

function Avatar({ name, photo, size = 96 }) {
  const initials = name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "DR";
  if (photo) return <img src={photo} alt={name} className="rounded-2xl object-cover ring-4 ring-white shadow-lg" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-2xl flex items-center justify-center ring-4 ring-white shadow-lg text-white font-bold"
      style={{ width: size, height: size, background: "linear-gradient(135deg, #1565C0, #00ACC1)", fontSize: size * 0.32 }}>
      {initials}
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg text-sm font-medium animate-slide-in ${type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100">×</button>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition bg-white ${className}`} {...props} />
  );
}

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-2.5">
        <span className="text-gray-400 text-base">{icon}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <span className="text-xs font-semibold text-gray-700 text-right max-w-[55%] truncate">{value || "—"}</span>
    </div>
  );
}

// Photo upload component - converts to base64 and stores as data URL
function PhotoUploader({ current, onUpload }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(current || null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Please select an image file.");
    if (file.size > 2 * 1024 * 1024) return alert("Image must be under 2MB.");
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPreview(dataUrl);
      onUpload(dataUrl);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex-shrink-0">
        {preview ? (
          <img src={preview} alt="Profile" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 text-gray-400">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
        {preview && (
          <button onClick={() => { setPreview(null); onUpload(null); }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition">
            ×
          </button>
        )}
      </div>
      <div className="space-y-2">
        <button onClick={() => fileRef.current.click()} disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-xl transition border border-blue-200 disabled:opacity-60">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          {uploading ? "Processing…" : "Upload Photo"}
        </button>
        <p className="text-xs text-gray-400">JPG, PNG, WebP · Max 2MB</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

// Auto-prefix input for registration numbers
function PrefixInput({ prefix, value, onChange, placeholder }) {
  const handleChange = (e) => {
    let val = e.target.value;
    // Always ensure prefix is present
    if (!val.startsWith(prefix)) {
      val = prefix;
    }
    onChange(val);
  };

  const handleFocus = () => {
    if (!value) onChange(prefix);
  };

  return (
    <input
      value={value || ""}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition bg-white font-mono"
    />
  );
}

export default function DoctorSettings() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [profile, setProfile] = useState({ name: "", telephone: "", photo: "" });
  const [professional, setProfessional] = useState({
    slmcRegisterNumber: "", medicalCenterRegisterNumber: "", workingExperience: "", certifications: "",
  });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      const u = res.data.user;
      setUser(u);
      setProfile({ name: u.name || "", telephone: u.telephone || "", photo: u.photo || "" });
      const d = u.doctorDetails || {};
      setProfessional({
        slmcRegisterNumber: d.slmcRegisterNumber || "",
        medicalCenterRegisterNumber: d.medicalCenterRegisterNumber || "",
        workingExperience: d.workingExperience || "",
        certifications: Array.isArray(d.certifications) ? d.certifications.join(", ") : (d.certifications || ""),
      });
    }).catch(() => setToast({ message: "Failed to load profile", type: "error" }))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message, type = "success") => setToast({ message, type });

  const handleProfileSave = async () => {
    if (!profile.name.trim()) return showToast("Name cannot be empty", "error");
    setSaving(true);
    try {
      const res = await api.put("/auth/me", {
        name: profile.name,
        telephone: profile.telephone,
        photo: profile.photo || null,
      });
      const stored = authService.getCurrentUser();
      if (stored) localStorage.setItem("user", JSON.stringify({ ...stored, ...res.data.user }));
      setUser((u) => ({ ...u, ...res.data.user }));
      showToast("Profile updated successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally { setSaving(false); }
  };

  const handleProfessionalSave = async () => {
    setSaving(true);
    try {
      const certArr = professional.certifications
        ? professional.certifications.split(",").map((c) => c.trim()).filter(Boolean)
        : [];
      const updatedDoctorDetails = { ...professional, certifications: certArr };
      const res = await api.put("/auth/me", { doctorDetails: updatedDoctorDetails });
      // Update local user state so the summary sidebar reflects changes immediately
      const newDoctorDetails = res.data?.user?.doctorDetails || updatedDoctorDetails;
      setUser((u) => ({ ...u, doctorDetails: newDoctorDetails }));
      const stored = authService.getCurrentUser();
      if (stored) localStorage.setItem("user", JSON.stringify({ ...stored, doctorDetails: newDoctorDetails }));
      showToast("Professional details updated");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update", "error");
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async () => {
    const failedRules = PW_RULES.filter((r) => !r.test(security.newPassword));
    if (failedRules.length > 0) return showToast(`Password: ${failedRules[0].label}`, "error");
    if (security.newPassword !== security.confirmPassword) return showToast("Passwords do not match", "error");
    if (!security.currentPassword) return showToast("Enter your current password", "error");
    setSaving(true);
    try {
      await api.put("/auth/me", { currentPassword: security.currentPassword, newPassword: security.newPassword });
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally { setSaving(false); }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";
  const certCount = user?.doctorDetails?.certifications?.length || 0;
  const pwStrength = security.newPassword ? passwordStrength(security.newPassword) : null;

  if (loading) {
    return (
      <DoctorLayout activePage="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout activePage="Settings">
      <style>{`
        @keyframes slide-in { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slide-in 0.25s ease; }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="p-6 space-y-6">
        {/* Banner */}
        <div className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #1565C0 60%, #00ACC1 100%)" }}>
          <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10">
            <svg viewBox="0 0 200 200" fill="white"><circle cx="150" cy="100" r="80" /><circle cx="50" cy="50" r="50" /></svg>
          </div>
          <div className="flex items-center gap-5 relative">
            <Avatar name={user?.name} photo={user?.photo} size={64} />
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest font-medium">Account Settings</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.4rem", color: "white" }}>{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/60 text-sm">{user?.email}</span>
                <span className="text-xs px-2 py-0.5 bg-white/15 rounded-full text-white/80 border border-white/20">{user?.userId}</span>
                <span className="text-xs px-2 py-0.5 bg-green-400/20 rounded-full text-green-300 border border-green-400/30">
                  {user?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Account Summary</h3>
              <p className="text-xs text-gray-400 mb-4">Your current profile at a glance</p>
              <InfoRow icon="🪪" label="Staff ID" value={user?.userId} />
              <InfoRow icon="📞" label="Telephone" value={user?.telephone} />
              <InfoRow icon="📅" label="Joined" value={joinedDate} />
              <InfoRow icon="🏥" label="SLMC No." value={user?.doctorDetails?.slmcRegisterNumber} />
              <InfoRow icon="🎓" label="Experience" value={user?.doctorDetails?.workingExperience} />
              <InfoRow icon="📜" label="Certifications" value={certCount > 0 ? `${certCount} listed` : null} />
            </div>

            {certCount > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Certifications</h3>
                <div className="space-y-2">
                  {user.doctorDetails.certifications.map((cert, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 rounded-lg px-3 py-2">
                      <span className="text-blue-400">✓</span> {cert}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right tabbed form */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              {/* ── PROFILE TAB ── */}
              {activeTab === "Profile" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-gray-800">Personal Information</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Update your name, contact number, and profile photo.</p>
                  </div>

                  {/* Photo uploader */}
                  <Field label="Profile Photo">
                    <PhotoUploader
                      current={profile.photo}
                      onUpload={(dataUrl) => setProfile({ ...profile, photo: dataUrl || "" })}
                    />
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full Name">
                      <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Dr. Full Name" />
                    </Field>
                    <Field label="Telephone">
                      <Input value={profile.telephone} onChange={(e) => setProfile({ ...profile, telephone: e.target.value })} placeholder="+94 71 234 5678" />
                    </Field>
                  </div>

                  <Field label="Email Address" hint="Email cannot be changed. Contact admin if needed.">
                    <Input value={user?.email || ""} disabled className="bg-gray-50 text-gray-400 cursor-not-allowed" />
                  </Field>

                  <div className="pt-2 flex justify-end">
                    <button onClick={handleProfileSave} disabled={saving}
                      className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── PROFESSIONAL TAB ── */}
              {activeTab === "Professional" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-gray-800">Professional Details</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Update your medical credentials and experience.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="SLMC Register Number" hint='Auto-prefix "SLMC-" applied'>
                      <PrefixInput
                        prefix="SLMC-"
                        value={professional.slmcRegisterNumber}
                        onChange={(v) => setProfessional({ ...professional, slmcRegisterNumber: v })}
                        placeholder="SLMC-12345"
                      />
                    </Field>
                    <Field label="Medical Center Register No." hint='Auto-prefix "MCR-" applied'>
                      <PrefixInput
                        prefix="MCR-"
                        value={professional.medicalCenterRegisterNumber}
                        onChange={(v) => setProfessional({ ...professional, medicalCenterRegisterNumber: v })}
                        placeholder="MCR-12345"
                      />
                    </Field>
                  </div>

                  <Field label="Working Experience">
                    <Input value={professional.workingExperience}
                      onChange={(e) => setProfessional({ ...professional, workingExperience: e.target.value })}
                      placeholder="e.g. 8 years in Cardiology" />
                  </Field>

                  <Field label="Certifications" hint="Separate multiple certifications with commas.">
                    <textarea value={professional.certifications}
                      onChange={(e) => setProfessional({ ...professional, certifications: e.target.value })}
                      placeholder="MBBS, MD, Fellowship in Cardiology"
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition bg-white resize-none" />
                  </Field>

                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Why this matters</p>
                    <p className="text-xs text-blue-600">Your SLMC registration and certifications are displayed to patients and administrators to establish credibility and trust.</p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button onClick={handleProfessionalSave} disabled={saving}
                      className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── SECURITY TAB ── */}
              {activeTab === "Security" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-gray-800">Change Password</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Your password must meet all requirements below.</p>
                  </div>

                  {/* Current password */}
                  <Field label="Current Password">
                    <div className="relative">
                      <Input type={showPasswords.current ? "text" : "password"}
                        value={security.currentPassword}
                        onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                        placeholder="Enter current password" className="pr-10" />
                      <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <EyeIcon open={showPasswords.current} />
                      </button>
                    </div>
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="New Password">
                      <div className="relative">
                        <Input type={showPasswords.new ? "text" : "password"}
                          value={security.newPassword}
                          onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                          placeholder="Min. 8 characters" className="pr-10" />
                        <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <EyeIcon open={showPasswords.new} />
                        </button>
                      </div>
                    </Field>
                    <Field label="Confirm New Password">
                      <div className="relative">
                        <Input type={showPasswords.confirm ? "text" : "password"}
                          value={security.confirmPassword}
                          onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                          placeholder="Repeat new password" className="pr-10" />
                        <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          <EyeIcon open={showPasswords.confirm} />
                        </button>
                      </div>
                    </Field>
                  </div>

                  {/* Password strength bar */}
                  {security.newPassword && pwStrength && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-medium">Password strength</p>
                        <span className="text-xs font-semibold" style={{ color: pwStrength.score >= 4 ? "#16a34a" : pwStrength.score >= 3 ? "#ca8a04" : "#dc2626" }}>
                          {pwStrength.label}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= pwStrength.score ? pwStrength.color : "bg-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements checklist */}
                  {security.newPassword && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Password requirements</p>
                      {PW_RULES.map((rule) => {
                        const passed = rule.test(security.newPassword);
                        return (
                          <div key={rule.label} className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${passed ? "text-green-500" : "text-gray-300"}`}>{passed ? "✓" : "○"}</span>
                            <span className={`text-xs ${passed ? "text-green-700" : "text-gray-400"}`}>{rule.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {security.newPassword && security.confirmPassword && security.newPassword !== security.confirmPassword && (
                    <p className="text-xs text-red-500 font-medium">⚠ Passwords do not match</p>
                  )}

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-xs font-semibold text-amber-800 mb-1">🔒 Security reminder</p>
                    <p className="text-xs text-amber-700">Never share your password. The system will never ask for your password via email or phone.</p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button onClick={handlePasswordSave}
                      disabled={saving || !security.currentPassword || !security.newPassword || !security.confirmPassword}
                      className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
                      {saving ? "Updating…" : "Update Password"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}