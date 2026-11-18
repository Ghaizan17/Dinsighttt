import { Routes, Route, Navigate } from 'react-router-dom';
import GuestLayout from './components/layout/GuestLayout';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminProjects from './pages/AdminProjects';
import AdminSkills from './pages/AdminSkills';
import AdminExperiences from './pages/AdminExperiences';
import AdminCertificates from './pages/AdminCertificates';
import AdminBlogs from './pages/AdminBlogs';
import AdminGuestbooks from './pages/AdminGuestbooks';
import { useAuth } from './hooks/useAuth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, roleLoading } = useAuth();

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memeriksa akses...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Publik */}
      <Route path="/" element={<GuestLayout><Home /></GuestLayout>} />
      <Route path="/login" element={<GuestLayout><Login /></GuestLayout>} />

      {/* Admin (butuh login) */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="skills" element={<AdminSkills />} />
        <Route path="experiences" element={<AdminExperiences />} />
        <Route path="certificates" element={<AdminCertificates />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="guestbooks" element={<AdminGuestbooks />} />
      </Route>

      {/* URL tidak dikenal: kembali ke halaman utama */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
