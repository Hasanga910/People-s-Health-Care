import { useState, useEffect } from "react";
import DoctorLayout from "../../components/DoctorLayout";
import api from "../../services/api";
import authService from "../../services/authService";

const TABS = ["Profile", "Professional", "Security"];

function Avatar({ name, photo, size = 96 }) {
  const initials = name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "DR";
  if (photo) {
    return (
      <img src={photo} alt={name} className="rounded-2xl object-cover ring-4 ring-white shadow-lg"
        style={{ width: size, height: size }} />
    );
  }
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

export default function DoctorSettings() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [profile, setProfile] = useState({ name: "", telephone: "", photo: "" });
  const [professional, setProfessional] = useState({ slmcRegisterNumber: "", medicalCenterRegisterNumber: "", workingExperience: "", certifications: "" });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

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
    setSaving(true);
    try {
      const res = await api.put("/auth/me", { name: profile.name, telephone: profile.telephone, photo: profile.photo || null });
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
      const certArr = professional.certifications ? professional.certifications.split(",").map((c) => c.trim()).filter(Boolean) : [];
      await api.put("/auth/me", { doctorDetails: { ...professional, certifications: certArr } });
      showToast("Professional details updated");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update", "error");
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async () => {
    if (security.newPassword !== security.confirmPassword) return showToast("Passwords do not match", "error");
    if (security.newPassword.length < 6) return showToast("Password must be at least 6 characters", "error");
    setSaving(true);
    try {
      await api.put("/auth/me", { currentPassword: security.currentPassword, newPassword: security.newPassword });
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password changed successfully");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally { setSaving(false); }
  };

  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";
  const certCount = user?.doctorDetails?.certifications?.length || 0;

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

        {/* ── Top Banner ── */}
        <div className="rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #0D2137 0%, #1565C0 60%, #00ACC1 100%)" }}>
          <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10">
            <svg viewBox="0 0 200 200" fill="white"><circle cx="150" cy="100" r="80" /><circle cx="50" cy="50" r="50" /></svg>
          </div>
          <div className="flex items-center gap-5 relative">
            <Avatar name={user?.name} photo={user?.photo} size={64} />
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest font-medium">Account Settings</p>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.4rem", color: "white" }}>
                {user?.name}
              </h2>
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

        {/* ── Two-column body ── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <div className="space-y-5">

            {/* Account summary */}
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

            {/* Certifications list */}
            {user?.doctorDetails?.certifications?.length > 0 && (
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

          {/* ── RIGHT: Tabbed form ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Tab bar */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              {/* ── PROFILE ── */}
              {activeTab === "Profile" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-gray-800">Personal Information</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Update your name, contact number, and profile photo.</p>
                  </div>

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

                  <Field label="Photo URL" hint="Paste a direct image URL (jpg, png, webp) to update your profile photo.">
                    <Input value={profile.photo} onChange={(e) => setProfile({ ...profile, photo: e.target.value })} placeholder="https://example.com/photo.jpg" />
                  </Field>

                  {profile.photo && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <Avatar name={profile.name} photo={profile.photo} size={56} />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Photo preview</p>
                        <p className="text-xs text-gray-400 mt-0.5">This is how your photo will appear across the system.</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button onClick={handleProfileSave} disabled={saving}
                      className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}

              {/* ── PROFESSIONAL ── */}
              {activeTab === "Professional" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-gray-800">Professional Details</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Update your medical credentials and experience.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="SLMC Register Number">
                      <Input value={professional.slmcRegisterNumber} onChange={(e) => setProfessional({ ...professional, slmcRegisterNumber: e.target.value })} placeholder="SLMC-XXXXX" />
                    </Field>
                    <Field label="Medical Center Register No.">
                      <Input value={professional.medicalCenterRegisterNumber} onChange={(e) => setProfessional({ ...professional, medicalCenterRegisterNumber: e.target.value })} placeholder="MCR-XXXXX" />
                    </Field>
                  </div>

                  <Field label="Working Experience">
                    <Input value={professional.workingExperience} onChange={(e) => setProfessional({ ...professional, workingExperience: e.target.value })} placeholder="e.g. 8 years in Cardiology" />
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

              {/* ── SECURITY ── */}
              {activeTab === "Security" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-semibold text-gray-800">Change Password</h3>
                    <p className="text-sm text-gray-400 mt-0.5">Use a strong password with at least 6 characters.</p>
                  </div>

                  <Field label="Current Password">
                    <Input type="password" value={security.currentPassword} onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })} placeholder="Enter current password" />
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="New Password">
                      <Input type="password" value={security.newPassword} onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })} placeholder="Min. 6 characters" />
                    </Field>
                    <Field label="Confirm New Password">
                      <Input type="password" value={security.confirmPassword} onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })} placeholder="Repeat new password" />
                    </Field>
                  </div>

                  {security.newPassword && security.confirmPassword && security.newPassword !== security.confirmPassword && (
                    <p className="text-xs text-red-500 font-medium">⚠ Passwords do not match</p>
                  )}

                  {/* Password strength hint */}
                  {security.newPassword && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-gray-500 font-medium">Password strength</p>
                      <div className="flex gap-1">
                        {[1,2,3,4].map((i) => {
                          const len = security.newPassword.length;
                          const score = len >= 12 ? 4 : len >= 9 ? 3 : len >= 6 ? 2 : 1;
                          const colors = ["bg-red-400","bg-orange-400","bg-yellow-400","bg-green-400"];
                          return <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= score ? colors[score-1] : "bg-gray-200"}`} />;
                        })}
                      </div>
                      <p className="text-xs text-gray-400">
                        {security.newPassword.length < 6 ? "Too short" : security.newPassword.length < 9 ? "Fair — consider a longer password" : security.newPassword.length < 12 ? "Good" : "Strong"}
                      </p>
                    </div>
                  )}

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-xs font-semibold text-amber-800 mb-1">🔒 Security reminder</p>
                    <p className="text-xs text-amber-700">Never share your password with anyone, including admin staff. The system will never ask for your password via email or phone.</p>
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