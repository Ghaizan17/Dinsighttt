import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Gauge,
  Folder,
  Code,
  Briefcase,
  Award,
  Newspaper,
  MessageCircle,
  ArrowUpRightFromSquare,
  Shield,
  LogOut,
} from 'lucide-react';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <Gauge className="w-5 h-5" /> },
  { path: '/admin/projects', label: 'Projects', icon: <Folder className="w-5 h-5" /> },
  { path: '/admin/skills', label: 'Skills', icon: <Code className="w-5 h-5" /> },
  { path: '/admin/experiences', label: 'Experiences', icon: <Briefcase className="w-5 h-5" /> },
  { path: '/admin/certificates', label: 'Certificates', icon: <Award className="w-5 h-5" /> },
  { path: '/admin/blogs', label: 'Blogs', icon: <Newspaper className="w-5 h-5" /> },
  { path: '/admin/guestbooks', label: 'Guestbook', icon: <MessageCircle className="w-5 h-5" /> },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 text-white p-5 overflow-y-auto z-40">
      <h1 className="text-xl font-black mb-8 flex items-center gap-2">
        <Shield className="w-5 h-5 text-cyan-400" />
        Admin Panel
      </h1>

      <nav className="space-y-1 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-3 py-2 rounded-lg hover:bg-white/10 transition ${isActive(item.path) ? 'bg-cyan-500/20 text-cyan-300' : 'text-white'}`}
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </Link>
        ))}

        <hr className="my-4 border-white/10" />

        <Link
          to="/"
          target="_blank"
          className="flex items-center px-3 py-2 rounded-lg hover:bg-white/10 text-white"
        >
          <ArrowUpRightFromSquare className="w-5 h-5 mr-2" />
          <span>Lihat Website</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-300 transition"
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span>Logout</span>
        </button>
      </nav>

      {user?.email && (
        <p className="mt-6 text-xs text-white/40 break-all">Masuk sebagai {user.email}</p>
      )}
    </aside>
  );
};

export default Sidebar;
