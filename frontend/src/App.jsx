import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { TeamProvider } from "./context/TeamContext";

// Auth Components
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

// Pages & Layouts
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/layout/DashboardLayout";

// Features
import ChatWindow from "./features/chat/components/ChatWindow";

/**
 * Placeholder for the Task Board
 * We will replace this with a full Kanban component in the next step
 */
const TaskBoard = () => (
  <div className="flex-1 flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800">Task Board</h2>
      <p className="text-gray-500">Kanban board feature coming in the next sprint.</p>
    </div>
  </div>
);

/**
 * DashboardHome
 * Currently renders the ChatWindow for a default channel.
 * In a production app, the channelId would come from useParams()
 */
const DashboardHome = () => {
  // Replace this with a real ID from your MongoDB 'channels' collection
  const defaultChannelId = "6584f1e2b3c4d5e6f7a8b9c0"; 
  
  return <ChatWindow channelId={defaultChannelId} />;
};

function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <SocketProvider>
          <Router>
            <Routes>
              {/* --- PUBLIC ROUTES --- */}
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

              {/* --- PROTECTED DASHBOARD ROUTES --- */}
              {/* The DashboardLayout provides the Sidebar and TeamSwitcher */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                {/* Default Dashboard view (Chat) */}
                <Route path="/dashboard" element={<DashboardHome />} />
                
                {/* Task Management view */}
                <Route path="/dashboard/tasks" element={<TaskBoard />} />
              </Route>

              {/* --- REDIRECTS & 404 --- */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="*"
                element={
                  <div className="flex h-screen items-center justify-center">
                    <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
                  </div>
                }
              />
            </Routes>
          </Router>
        </SocketProvider>
      </TeamProvider>
    </AuthProvider>
  );
}

export default App;