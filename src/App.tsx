import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Components/Dashboard";
import DashboardLayout from "./Components/DashboardLayout";
import Teams from "./Pages/Teams";
import Projects from "./Pages/Projects";
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
        {/* <Route path="sessions" element={<Sessions />} */}
        {/* <Route path="debt" element={<Debts />} */}
        {/* <Route path="deprecations" element={<div className="glass p-12 rounded-[2.5rem] border border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500"><h1 className="text-3xl font-black text-white tracking-tighter">Deprecations Shell</h1><p className="text-slate-500 mt-2 font-medium">Matrix synchronization in progress...</p></div>} /> */}
      </Route>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
      />
    </Routes>
  );
}

export default App;
