import { AuthProvider } from './context/AuthContext';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Dashboard />
      </div>
    </AuthProvider>
  );
}

export default App;
