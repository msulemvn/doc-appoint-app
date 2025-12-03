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

function App() {
  useAuthInit();
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
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? <Register /> : <Navigate to="/dashboard" />
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/appointments"
          element={isAuthenticated ? <Appointments /> : <Navigate to="/login" />}
        />
        <Route
          path="/appointments/new"
          element={
            isAuthenticated ? <NewAppointment /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/appointments/:id"
          element={
            isAuthenticated ? <AppointmentDetail /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <Settings /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
