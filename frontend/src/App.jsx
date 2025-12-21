import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { TeamProvider } from "./context/TeamContext"; // Added TeamProvider
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Components & Pages
import Login from "./pages/Login";
import Register from "./pages/Register"; // Added Register
import DashboardLayout from "./components/layout/DashboardLayout";

// Dummy components for now so the app doesn't crash
const DashboardHome = () => <div className="p-6">Select a channel to start chatting</div>;
const TaskBoard = () => <div className="p-6">Task Board Feature Coming Soon</div>;

function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected Routes wrapped in DashboardLayout */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* These will render inside the <Outlet /> of DashboardLayout */}
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/dashboard/tasks" element={<TaskBoard />} />
              </Route>

              {/* Default Redirection */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<div>404 - Not Found</div>} />
            </Routes>
          </Router>
        </SocketProvider>
      </TeamProvider>
    </AuthProvider>
  );
}

export default App;