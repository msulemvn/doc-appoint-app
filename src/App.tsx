import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import Register from "./pages/register";
import Settings from "./pages/settings";
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import Doctors from "./pages/doctors";
import DoctorDetail from "./pages/doctor-detail";
import Appointments from "./pages/appointments";
import AppointmentDetail from "./pages/appointment-detail";
import NewAppointment from "./pages/new-appointment";
import { useAuthStore } from "./stores/auth.store";
import { useAuthInit } from "./hooks/use-auth-init";
import { useEchoInit } from "./hooks/use-echo-init";
import { ProtectedRoute } from "./components/protected-route";
import { useNotifications } from "./hooks/useNotifications";
import { Toaster } from "sonner";

function App() {
  useAuthInit();
  useNotifications();
  useEchoInit();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={!isAuthenticated ? <Home /> : <Navigate to="/dashboard" />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetail />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/new"
          element={
            <ProtectedRoute>
              <NewAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/:id/new"
          element={
            <ProtectedRoute>
              <NewAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/:id"
          element={
            <ProtectedRoute>
              <AppointmentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Toaster richColors />
    </BrowserRouter>
  );
}

export default App;
