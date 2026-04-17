import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const steps = ['Account', 'Personal Info', 'Medical Info'];

// ── Validation rules ───────────────────────────────────────
const isValidEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone    = (v) => /^\d{10}$/.test(v);
const isValidPassword = (v) => /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/.test(v);
const isValidUsername = (v) => /^[a-zA-Z0-9_]{3,30}$/.test(v);

// ── Step indicator ─────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${i > 0 ? 'ml-2' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center
                               text-xs font-bold transition-all ${
                done   ? 'bg-emerald-500 text-white' :
                active ? 'bg-blue-900 text-white' :
                         'bg-slate-200 text-slate-500'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${
                active ? 'text-blue-900' : done ? 'text-emerald-600' : 'text-slate-400'
              }`}>{step}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px w-10 ml-2 ${
                done ? 'bg-emerald-400' : 'bg-slate-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Reusable input ─────────────────────────────────────────
function Field({ label, name, type = 'text', placeholder, required = true,
                 value, onChange, error, hint }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type} name={name} placeholder={placeholder}
        value={value} onChange={onChange} autoComplete="off"
        className={`w-full px-4 py-3 rounded-xl border text-slate-800 text-sm
                    placeholder-slate-400 focus:outline-none focus:ring-2
                    focus:ring-blue-500 transition-all ${
          error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Reusable select ────────────────────────────────────────
function SelectField({ label, name, options, required = true, value, onChange, error }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select name={name} value={value} onChange={onChange}
        className={`w-full px-4 py-3 rounded-xl border text-slate-800 text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
          error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
        }`}>
        <option value="">Select…</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">⚠ {error}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
export default function Register() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [apiError, setApiError] = useState('');

  // ── useUsername: true = username path, false = email path ─
  const [useUsername, setUseUsername] = useState(false);

  // ── Field-level errors ────────────────────────────────────
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: '', email: '', username: '',
    password: '', confirmPassword: '',
    telephone: '', gender: '', dateOfBirth: '',
    emergencyContactName: '', emergencyContactNumber: '', address: '',
    bloodGroup: '', allergies: '', chronicConditions: '', currentMedications: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error for this field as user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // ── Today's date for birthday max ────────────────────────
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  })();

  // ── Per-step validation ───────────────────────────────────
  const validateStep = () => {
    const newErrors = {};

    if (step === 0) {
      if (!form.name.trim())
        newErrors.name = 'Full name is required';

      if (useUsername) {
        if (!form.username.trim())
          newErrors.username = 'Username is required';
        else if (!isValidUsername(form.username))
          newErrors.username = 'Username must be 3-30 characters, letters/numbers/underscore only';
      } else {
        if (!form.email.trim())
          newErrors.email = 'Email address is required';
        else if (!isValidEmail(form.email))
          newErrors.email = 'Enter a valid email address (must contain @ and .)';
      }

      if (!form.telephone.trim())
        newErrors.telephone = 'Telephone is required';
      else if (!isValidPhone(form.telephone))
        newErrors.telephone = 'Telephone must be exactly 10 digits';

      if (!form.password)
        newErrors.password = 'Password is required';
      else if (!isValidPassword(form.password))
        newErrors.password = 'Password must be at least 6 characters with letters and numbers';

      if (!form.confirmPassword)
        newErrors.confirmPassword = 'Please confirm your password';
      else if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = 'Passwords do not match';
    }

    if (step === 1) {
      if (!form.gender)
        newErrors.gender = 'Please select your gender';

      if (!form.dateOfBirth)
        newErrors.dateOfBirth = 'Date of birth is required';
      else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(form.dateOfBirth) >= today)
          newErrors.dateOfBirth = 'Date of birth must be before today';
      }

      if (form.emergencyContactNumber && !isValidPhone(form.emergencyContactNumber))
        newErrors.emergencyContactNumber = 'Emergency contact must be exactly 10 digits';
    }

    if (step === 2) {
      if (!agreed)
        newErrors.agreed = 'You must agree to the Terms of Service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setApiError('');
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setApiError('');
    try {
      const payload = {
        name:                   form.name,
        password:               form.password,
        telephone:              form.telephone,
        gender:                 form.gender,
        dateOfBirth:            form.dateOfBirth,
        emergencyContactName:   form.emergencyContactName,
        emergencyContactNumber: form.emergencyContactNumber,
        address:                form.address,
        bloodGroup:             form.bloodGroup,
        allergies:              form.allergies,
        chronicConditions:      form.chronicConditions,
        currentMedications:     form.currentMedications,
      };

      // Send either email OR username depending on path chosen
      if (useUsername) {
        payload.username = form.username;
      } else {
        payload.email = form.email;
      }

      const result = await authService.register(payload);
      if (result.success) navigate('/patient/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-blue-950
                      via-blue-900 to-cyan-900 relative overflow-hidden
                      flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full
                          bg-cyan-300 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full
                          bg-blue-300 blur-3xl" />
        </div>

        <Link to="/" className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
            <img src="/Logo.png" alt="PHC" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">
              People's Health Care
            </p>
            <p className="text-cyan-300 text-xs">Patient Registration</p>
          </div>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            Join our patient<br />
            <span className="text-cyan-300">community today.</span>
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-6">
            Register once and gain secure access to all of People's Health Care
            digital services. No email? No problem — create with a username instead.
          </p>
          <ul className="space-y-3">
            {[
              'Book & manage appointments online',
              'Access prescriptions digitally',
              'View lab reports securely',
              'Track your medical history',
              'Register without an email address',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-blue-100">
                <span className="text-cyan-400 mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative border-t border-white/15 pt-6">
          <p className="text-blue-200 text-xs italic">
            "Compassionate care backed by intelligent technology."
          </p>
          <p className="text-blue-400 text-xs mt-1">
            — Dr. M.T.D. Jayaweera, Medical Director
          </p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex-shrink-0 overflow-hidden">
              <img src="/Logo.png" alt="PHC" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-blue-950 text-sm">People's Health Care</span>
          </Link>

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-black text-blue-950">Create Account</h1>
            <span className="text-xs text-slate-400 font-medium">
              Step {step + 1} of {steps.length}
            </span>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Register as a patient to access your health portal
          </p>

          <StepIndicator current={step} />

          {/* API error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3
                            rounded-xl mb-5 text-sm flex items-center gap-2">
              <span>⚠</span> {apiError}
            </div>
          )}

          {/* ── STEP 0: Account ── */}
          {step === 0 && (
            <div className="space-y-4">
              <Field
                label="Full Name" name="name"
                placeholder="e.g. Kamal Perera"
                value={form.name} onChange={handleChange}
                error={errors.name}
              />

              {/* ── Email / Username toggle ── */}
              {!useUsername ? (
                <div>
                  <Field
                    label="Email Address" name="email" type="email"
                    placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    error={errors.email}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUseUsername(true);
                      setForm({ ...form, email: '' });
                      setErrors({ ...errors, email: '' });
                    }}
                    className="mt-2 text-xs text-blue-600 hover:underline flex
                               items-center gap-1"
                  >
                    ↓ I don't have an email address — use a username instead
                  </button>
                </div>
              ) : (
                <div>
                  <Field
                    label="Username" name="username"
                    placeholder="e.g. kamal_perera_2006"
                    value={form.username} onChange={handleChange}
                    error={errors.username}
                    hint="3-30 characters. Letters, numbers and underscore only."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUseUsername(false);
                      setForm({ ...form, username: '' });
                      setErrors({ ...errors, username: '' });
                    }}
                    className="mt-2 text-xs text-blue-600 hover:underline flex
                               items-center gap-1"
                  >
                    ↑ I have an email address — use email instead
                  </button>
                </div>
              )}

              <Field
                label="Telephone Number" name="telephone" type="tel"
                placeholder="e.g. 0712345678"
                value={form.telephone} onChange={handleChange}
                error={errors.telephone}
                hint="Must be exactly 10 digits"
              />

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Password" name="password" type="password"
                  placeholder="Min. 6 chars with letters & numbers"
                  value={form.password} onChange={handleChange}
                  error={errors.password}
                />
                <Field
                  label="Confirm Password" name="confirmPassword" type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={handleChange}
                  error={errors.confirmPassword}
                />
              </div>

              {/* Password strength hint */}
              {form.password && (
                <div className={`text-xs px-3 py-2 rounded-lg ${
                  isValidPassword(form.password)
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {isValidPassword(form.password)
                    ? '✓ Strong password'
                    : '⚠ Must be 6+ characters with letters and numbers'}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SelectField
                  label="Gender" name="gender"
                  options={['Male', 'Female', 'Other']}
                  value={form.gender} onChange={handleChange}
                  error={errors.gender}
                />
                <Field
                  label="Date of Birth" name="dateOfBirth" type="date"
                  placeholder="" max={yesterday}
                  value={form.dateOfBirth} onChange={handleChange}
                  error={errors.dateOfBirth}
                  hint="Must be before today"
                />
              </div>

              <Field
                label="Emergency Contact Name" name="emergencyContactName"
                placeholder="e.g. Kamali Perera"
                value={form.emergencyContactName} onChange={handleChange}
                required={false}
              />

              <Field
                label="Emergency Contact Number" name="emergencyContactNumber"
                type="tel" placeholder="e.g. 0771234567"
                value={form.emergencyContactNumber} onChange={handleChange}
                required={false}
                error={errors.emergencyContactNumber}
                hint="Must be exactly 10 digits if provided"
              />

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Home Address
                </label>
                <textarea
                  name="address" rows={2}
                  placeholder="No., Street, City"
                  value={form.address} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                             bg-white text-slate-800 text-sm placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* ── STEP 2: Medical Info ── */}
          {step === 2 && (
            <div className="space-y-4">
              <SelectField
                label="Blood Group" name="bloodGroup"
                options={['A+','A-','B+','B-','AB+','AB-','O+','O-','Unknown']}
                value={form.bloodGroup} onChange={handleChange}
                required={false}
              />

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Known Allergies
                </label>
                <textarea
                  name="allergies" rows={2}
                  placeholder="List any allergies separated by commas, or type 'None'"
                  value={form.allergies} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                             bg-white text-slate-800 text-sm placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Chronic Conditions
                </label>
                <textarea
                  name="chronicConditions" rows={2}
                  placeholder="e.g. Diabetes, Hypertension (or type 'None')"
                  value={form.chronicConditions} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                             bg-white text-slate-800 text-sm placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  Current Medications
                </label>
                <textarea
                  name="currentMedications" rows={2}
                  placeholder="List medications you are taking (or type 'None')"
                  value={form.currentMedications} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200
                             bg-white text-slate-800 text-sm placeholder-slate-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             transition-all resize-none"
                />
              </div>

              {/* Terms checkbox */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox" checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (errors.agreed) setErrors({ ...errors, agreed: '' });
                    }}
                    className="mt-0.5 rounded accent-blue-900"
                  />
                  <span className="text-xs text-slate-500 leading-relaxed">
                    I agree to the{' '}
                    <span className="text-blue-700 font-semibold hover:underline cursor-pointer">
                      Terms of Service
                    </span>{' '}
                    and{' '}
                    <span className="text-blue-700 font-semibold hover:underline cursor-pointer">
                      Privacy Policy
                    </span>{' '}
                    of People's Health Care.
                  </span>
                </label>
                {errors.agreed && (
                  <p className="text-xs text-red-500 mt-1">⚠ {errors.agreed}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div className="flex items-center gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => { setApiError(''); setStep(step - 1); }}
                className="flex-1 py-3.5 border-2 border-slate-200 text-slate-700
                           font-bold rounded-xl hover:border-slate-300
                           hover:bg-slate-100 transition-all text-sm"
              >
                ← Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3.5 bg-blue-900 hover:bg-blue-800 text-white
                           font-bold rounded-xl transition-all text-sm
                           shadow-lg shadow-blue-900/20"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit} disabled={loading}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500
                           text-white font-bold rounded-xl transition-all text-sm
                           shadow-lg shadow-emerald-600/20 disabled:opacity-70
                           flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : '✓ Create My Account'}
              </button>
            )}
          </div>

          <p className="text-center text-slate-500 text-xs mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 font-bold hover:underline">
              Sign In
            </Link>
          </p>
          <p className="text-center text-slate-400 text-xs mt-2">
            © {new Date().getFullYear()} People's Health Care — Matara, Sri Lanka
          </p>
        </div>
      </div>
    </div>
  );
}