import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public
import Index    from "./pages/Index";
import Login    from "./pages/Login";
import Register from "./pages/Register";

// Doctor
import DoctorDashboard        from "./pages/doctor/DoctorDashboard";
import DoctorAppointments     from "./pages/doctor/DoctorAppointments";
import DoctorPrescriptions    from "./pages/doctor/DoctorPrescriptions";
import DoctorLabRequests      from "./pages/doctor/DoctorLabRequests";
import DoctorPatients         from "./pages/doctor/DoctorPatients";
import DoctorAnalysis         from "./pages/doctor/DoctorAnalysis";
import DoctorMedicineAnalysis from "./pages/doctor/DoctorMedicineAnalysis";
import DoctorSettings         from "./pages/doctor/DoctorSettings";

// Patient
import PatientDashboard     from "./pages/patient/PatientDashboard";
import PatientAppointments  from "./pages/patient/PatientAppointments";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientLabResults    from "./pages/patient/PatientLabResults";
import PatientBilling       from "./pages/patient/PatientBilling";
import PatientProfile       from "./pages/patient/PatientProfile";

// Lab
import LabDashboard     from "./pages/lab/LabDashboard";
import LabTestRequests  from "./pages/lab/LabTestRequests";
import LabUploadResults from "./pages/lab/LabUploadResults";
import LabReports       from "./pages/lab/LabReports";
import LabEquipment     from "./pages/lab/LabEquipment";

// Pharmacy
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import PharmacyQueue     from "./pages/pharmacy/PharmacyQueue";
import PharmacyInventory from "./pages/pharmacy/PharmacyInventory";
import PharmacyBilling   from "./pages/pharmacy/PharmacyBilling";

// Admin
import AdminDashboard    from "./pages/admin/AdminDashboard";
import AdminStaff        from "./pages/admin/AdminStaff";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminPatients     from "./pages/admin/AdminPatients";
import AdminFinance      from "./pages/admin/AdminFinance";
import AdminSettings     from "./pages/admin/AdminSettings";

// ══════════════════════════════════════════════════════════════
// Auth helpers
// ══════════════════════════════════════════════════════════════

function getUser() {
  try {
    const str = localStorage.getItem("user");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!localStorage.getItem("token") && !!getUser();
}

// Where each role should land after login
const ROLE_HOME = {
  doctor:   "/doctor/dashboard",
  patient:  "/patient/dashboard",
  lab:      "/lab/dashboard",
  pharmacy: "/pharmacy/dashboard",
  cashier:  "/pharmacy/billing",
  admin:    "/admin/dashboard",
};

// ══════════════════════════════════════════════════════════════
// ProtectedRoute
// • If not logged in  → redirect to /login
// • If wrong role     → redirect to their own home
// • Otherwise         → render the page
// ══════════════════════════════════════════════════════════════
function ProtectedRoute({ children, allowedRoles }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const home = ROLE_HOME[user?.role] || "/";
    return <Navigate to={home} replace />;
  }

  return children;
}

// ══════════════════════════════════════════════════════════════
// PublicOnlyRoute
// Logged-in users visiting /login or /register get bounced home
// ══════════════════════════════════════════════════════════════
function PublicOnlyRoute({ children }) {
  if (isLoggedIn()) {
    const user = getUser();
    const home = ROLE_HOME[user?.role] || "/";
    return <Navigate to={home} replace />;
  }
  return children;
}

// ══════════════════════════════════════════════════════════════
// App
// ══════════════════════════════════════════════════════════════
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Index />} />

        <Route path="/login" element={
          <PublicOnlyRoute><Login /></PublicOnlyRoute>
        } />

        <Route path="/register" element={
          <PublicOnlyRoute><Register /></PublicOnlyRoute>
        } />

        {/* ── Doctor ── */}
        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></ProtectedRoute>
        } />
        <Route path="/doctor/dashboard" element={
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorDashboard /></ProtectedRoute>
        } />
        <Route path="/doctor/appointments" element={
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorAppointments /></ProtectedRoute>
        } />
        <Route path="/doctor/prescriptions" element={
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorPrescriptions /></ProtectedRoute>
        } />
        <Route path="/doctor/lab-requests" element={
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorLabRequests /></ProtectedRoute>
        } />
        <Route path="/doctor/patients" element={
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorPatients /></ProtectedRoute>
        } />
        <Route path="/doctor/analysis" element={
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorAnalysis /></ProtectedRoute>
        } />
        <Route path="/doctor/medicine-analysis" element={
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorMedicineAnalysis /></ProtectedRoute>
        } />
        <Route path="/doctor/settings" element={
          <ProtectedRoute allowedRoles={["doctor"]}><DoctorSettings /></ProtectedRoute>
        } />

        {/* ── Patient ── */}
        <Route path="/patient" element={
          <ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>
        } />
        <Route path="/patient/dashboard" element={
          <ProtectedRoute allowedRoles={["patient"]}><PatientDashboard /></ProtectedRoute>
        } />
        <Route path="/patient/appointments" element={
          <ProtectedRoute allowedRoles={["patient"]}><PatientAppointments /></ProtectedRoute>
        } />
        <Route path="/patient/prescriptions" element={
          <ProtectedRoute allowedRoles={["patient"]}><PatientPrescriptions /></ProtectedRoute>
        } />
        <Route path="/patient/lab-results" element={
          <ProtectedRoute allowedRoles={["patient"]}><PatientLabResults /></ProtectedRoute>
        } />
        <Route path="/patient/billing" element={
          <ProtectedRoute allowedRoles={["patient"]}><PatientBilling /></ProtectedRoute>
        } />
        <Route path="/patient/profile" element={
          <ProtectedRoute allowedRoles={["patient"]}><PatientProfile /></ProtectedRoute>
        } />

        {/* ── Lab ── */}
        <Route path="/lab" element={
          <ProtectedRoute allowedRoles={["lab"]}><LabDashboard /></ProtectedRoute>
        } />
        <Route path="/lab/dashboard" element={
          <ProtectedRoute allowedRoles={["lab"]}><LabDashboard /></ProtectedRoute>
        } />
        <Route path="/lab/requests" element={
          <ProtectedRoute allowedRoles={["lab"]}><LabTestRequests /></ProtectedRoute>
        } />
        <Route path="/lab/upload" element={
          <ProtectedRoute allowedRoles={["lab"]}><LabUploadResults /></ProtectedRoute>
        } />
        <Route path="/lab/reports" element={
          <ProtectedRoute allowedRoles={["lab"]}><LabReports /></ProtectedRoute>
        } />
        <Route path="/lab/equipment" element={
          <ProtectedRoute allowedRoles={["lab"]}><LabEquipment /></ProtectedRoute>
        } />

        {/* ── Pharmacy ── */}
        <Route path="/pharmacy" element={
          <ProtectedRoute allowedRoles={["pharmacy", "cashier"]}><PharmacyDashboard /></ProtectedRoute>
        } />
        <Route path="/pharmacy/dashboard" element={
          <ProtectedRoute allowedRoles={["pharmacy", "cashier"]}><PharmacyDashboard /></ProtectedRoute>
        } />
        <Route path="/pharmacy/queue" element={
          <ProtectedRoute allowedRoles={["pharmacy", "cashier"]}><PharmacyQueue /></ProtectedRoute>
        } />
        <Route path="/pharmacy/inventory" element={
          <ProtectedRoute allowedRoles={["pharmacy"]}><PharmacyInventory /></ProtectedRoute>
        } />
        <Route path="/pharmacy/billing" element={
          <ProtectedRoute allowedRoles={["pharmacy", "cashier"]}><PharmacyBilling /></ProtectedRoute>
        } />

        {/* ── Admin ── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/staff" element={
          <ProtectedRoute allowedRoles={["admin"]}><AdminStaff /></ProtectedRoute>
        } />
        <Route path="/admin/appointments" element={
          <ProtectedRoute allowedRoles={["admin"]}><AdminAppointments /></ProtectedRoute>
        } />
        <Route path="/admin/patients" element={
          <ProtectedRoute allowedRoles={["admin"]}><AdminPatients /></ProtectedRoute>
        } />
        <Route path="/admin/finance" element={
          <ProtectedRoute allowedRoles={["admin"]}><AdminFinance /></ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={["admin"]}><AdminSettings /></ProtectedRoute>
        } />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}