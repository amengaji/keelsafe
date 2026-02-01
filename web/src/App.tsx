// web/src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Shell from './components/layout/Shell'; // Import the new shared layout
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FleetManagement from './pages/FleetManagement';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import SimopsManager from './pages/SimopsManager';
import HazardLibrary from './pages/HazardLibrary';
import ChecklistManager from './pages/ChecklistManager';

export default function App() {
  const primaryColor = "#3194A0";
  const themeColors = ["#3194A0", "#1A5F6B", "#4DB6AC", "#00796B"];

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes wrapped in Shared Shell */}
          <Route path="/dashboard" element={<Shell><Dashboard /></Shell>} />
          <Route path="/auditlogs" element={<Shell><AuditLogs /></Shell>} />
          <Route path="/fleet" element={<Shell><FleetManagement /></Shell>} />
          <Route path="/simops" element={<Shell><SimopsManager /></Shell>} />
          <Route path="/hazards" element={<Shell><HazardLibrary /></Shell>} />
          <Route path="/checklists" element={<Shell><ChecklistManager /></Shell>} />
          <Route 
            path="/settings" 
            element={
              <Shell>
                <Settings primaryColor={primaryColor} colors={themeColors} />
              </Shell>
            } 
          />

          {/* Logic-based Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}