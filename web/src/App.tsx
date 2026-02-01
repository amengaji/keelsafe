// web/src/App.tsx

import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const path = window.location.pathname;

  if (path === '/dashboard') {
    return <Dashboard />;
  }
  return <Login />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}