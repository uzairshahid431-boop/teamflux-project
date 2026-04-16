import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Components/Dashboard";
import DashboardLayout from "./Components/DashboardLayout";
import Teams from "./Pages/Teams";
import Projects from "./Pages/Projects";
import Sessions from "./Pages/Sessions";
import TechnicalDebt from "./Pages/TechnicalDebt";
import DebtDashboard from "./Pages/DebtDashboard";
import Deprecations from "./Pages/Deprecations";
import "./App.css";

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030712] relative overflow-hidden">
        <div className="aurora-mesh" />
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-2xl animate-pulse">
            TF
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          <p className="text-slate-400 font-medium tracking-widest text-xs uppercase animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />}
      />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<Dashboard />} />
        <Route path="teams" element={<Teams />} />
        <Route path="projects" element={<Projects />} />
        <Route path="sessions" element={<Sessions />}/>
        <Route path="debt" element={<TechnicalDebt />} />
        <Route path="debt/analytics" element={<DebtDashboard />} />
        <Route path="deprecations" element={<Deprecations />} />
      </Route>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
