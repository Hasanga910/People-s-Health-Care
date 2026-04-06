import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const steps = ['Account', 'Personal Info', 'Medical Info'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 ${i > 0 ? 'ml-2' : ''}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-blue-900' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px w-10 ml-2 ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function InputField({ label, name, type = 'text', placeholder, required = true, value, onChange, hint }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function SelectField({ label, name, options, required = true, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <option value="">Select…</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    // Step 0 – Account
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 1 – Personal Info
    telephone: '',
    gender: '',
    dateOfBirth: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    address: '',
    // Step 2 – Medical Info
    bloodGroup: '',
    allergies: '',
    chronicConditions: '',
    currentMedications: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep = () => {
    setError('');
    if (step === 0) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields.');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return false;
      }
    }
    if (step === 1) {
      if (!formData.telephone || !formData.gender || !formData.dateOfBirth) {
        setError('Please fill in all required fields.');
        return false;
      }
    }
    if (step === 2 && !agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      const result = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        telephone: formData.telephone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactNumber: formData.emergencyContactNumber,
        address: formData.address,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        chronicConditions: formData.chronicConditions,
        currentMedications: formData.currentMedications,
      });
      if (result.success) {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Left Panel */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-blue-950 via-blue-900 to-cyan-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-cyan-300 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full bg-blue-300 blur-3xl" />
        </div>

        <Link to="/" className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-400 flex items-center justify-center shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-blue-950" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">People's Health Care</p>
            <p className="text-cyan-300 text-xs">Patient Registration</p>
          </div>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            Join our patient<br />
            <span className="text-cyan-300">community today.</span>
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-8">
            Register once and gain secure access to all of People's Health Care digital services.
          </p>
          <ul className="space-y-3">
            {[
              'Book & manage appointments online',
              'Access prescriptions digitally',
              'View lab reports securely',
              'Track your medical history',
              'Receive health notifications',
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
          <p className="text-blue-400 text-xs mt-1">— Dr. M.T.D. Jayaweera, Medical Director</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-blue-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-cyan-400" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-blue-950 text-sm">People's Health Care</span>
          </Link>

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-black text-blue-950">Create Account</h1>
            <span className="text-xs text-slate-400 font-medium">Step {step + 1} of {steps.length}</span>
          </div>
          <p className="text-slate-500 text-sm mb-8">Register as a patient to access your health portal</p>

          <StepIndicator current={step} />

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-5 text-sm">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Step 0 – Account */}
          {step === 0 && (
            <div className="space-y-4">
              <InputField label="Full Name" name="name" placeholder="e.g. Kamal Perera" value={formData.name} onChange={handleChange} />
              <InputField label="Email Address" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
              <InputField label="Telephone Number" name="telephone" type="tel" placeholder="e.g. 0712345678" value={formData.telephone} onChange={handleChange} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Password" name="password" type="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} />
                <InputField label="Confirm Password" name="confirmPassword" type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>
          )}

          {/* Step 1 – Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Gender" name="gender" options={['Male', 'Female', 'Other']} value={formData.gender} onChange={handleChange} />
                <InputField label="Date of Birth" name="dateOfBirth" type="date" placeholder="" value={formData.dateOfBirth} onChange={handleChange} />
              </div>
              <InputField label="Emergency Contact Name" name="emergencyContactName" placeholder="e.g. Kamali Perera" value={formData.emergencyContactName} onChange={handleChange} required={false} />
              <InputField label="Emergency Contact Number" name="emergencyContactNumber" type="tel" placeholder="e.g. 0771234567" value={formData.emergencyContactNumber} onChange={handleChange} required={false} />
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Home Address</label>
                <textarea
                  name="address"
                  rows={2}
                  placeholder="No., Street, City"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2 – Medical Info */}
          {step === 2 && (
            <div className="space-y-4">
              <SelectField label="Blood Group" name="bloodGroup" options={['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Unknown']} value={formData.bloodGroup} onChange={handleChange} required={false} />
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Known Allergies</label>
                <textarea
                  name="allergies"
                  rows={2}
                  placeholder="List any drug or food allergies (or type 'None')"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Chronic Conditions</label>
                <textarea
                  name="chronicConditions"
                  rows={2}
                  placeholder="e.g. Diabetes, Hypertension (or type 'None')"
                  value={formData.chronicConditions}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Current Medications</label>
                <textarea
                  name="currentMedications"
                  rows={2}
                  placeholder="List any medications you're currently taking (or type 'None')"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded accent-blue-900"
                />
                <span className="text-xs text-slate-500 leading-relaxed">
                  I agree to the{' '}
                  <span className="text-blue-700 font-semibold cursor-pointer hover:underline">Terms of Service</span>{' '}
                  and{' '}
                  <span className="text-blue-700 font-semibold cursor-pointer hover:underline">Privacy Policy</span>{' '}
                  of People's Health Care.
                </span>
              </label>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => { setError(''); setStep(step - 1); }}
                className="flex-1 py-3.5 border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:border-slate-300 hover:bg-slate-100 transition-all text-sm"
              >
                ← Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-blue-900/20"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  '✓ Create My Account'
                )}
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