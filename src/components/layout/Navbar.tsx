
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Sun, Moon, Menu, X, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [dark, setDark] = useState(
    () =>
      localStorage.getItem('theme') === 'dark' ||
      localStorage.getItem('theme') !== 'light'
  );

  const location = useLocation();
  const { user, signOut } = useAuth();

  // Sinkronkan class .dark dengan pilihan tema saat halaman dimuat
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Mengatur tema
  const toggleTheme = () => {
    const nextDark = !dark;

    setDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Link section: tetap di halaman Home
  const sectionHref = (id: string) => {
    return location.pathname === '/' ? `#${id}` : `/#${id}`;
  };

  const isActive = (id: string) => {
    return location.pathname === '/' &&
      location.hash === `#${id}`;
  };

  const linkClass = (id: string) =>
    `text-slate-700 dark:text-white hover:text-cyan-400 transition ${
      isActive(id) ? 'text-cyan-500' : ''
    }`;

  const mobileLinkClass =
    'text-slate-800 dark:text-white hover:text-cyan-400 transition block py-2';

  return (
    <nav className="fixed top-0 left-0 w-full z-[9999] backdrop-blur-xl bg-white/70 dark:bg-black/20 border-b border-slate-200 dark:border-white/10 transition-colors duration-500">

      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        <div className="flex justify-between items-center h-20">

          {/* LOGO */}
          <Link
            to="/"
            className="text-3xl font-black bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent"
          >
            Dinsight
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8">

            <Link
              to="/"
              className={`text-slate-700 dark:text-white hover:text-cyan-400 transition ${
                location.pathname === '/' && !location.hash
                  ? 'text-cyan-500'
                  : ''
              }`}
            >
              Home
            </Link>

            <a href={sectionHref('about')} className={linkClass('about')}>
              About
            </a>

            <a href={sectionHref('projects')} className={linkClass('projects')}>
              Projects
            </a>

            <a href={sectionHref('experiences')} className={linkClass('experiences')}>
              Pengalaman
            </a>

            <a href={sectionHref('certificates')} className={linkClass('certificates')}>
              Sertifikat
            </a>

            <a href={sectionHref('contact')} className={linkClass('contact')}>
              Contact
            </a>

          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-4">

            {/* DARK MODE */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-11 h-11 rounded-full bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/10 flex items-center justify-center hover:scale-110 transition-all"
            >
              {dark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-cyan-400" />
              )}
            </button>

            {/* LOGIN / DASHBOARD */}
            {user ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-white/80 transition"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="px-5 py-2 rounded-full bg-red-500/20 border border-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/40 transition flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-full border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white font-semibold hover:border-cyan-500 hover:text-cyan-500 transition"
              >
                Login
              </Link>
            )}

          </div>

          {/* MOBILE BUTTON */}
          <button
            type="button"
            className="md:hidden text-slate-800 dark:text-white text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

        </div>

        {/* MOBILE MENU */}
        <div
          className={`md:hidden bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 transition-all duration-300 ${
            mobileMenuOpen ? 'block' : 'hidden'
          }`}
        >

          <div className="flex flex-col px-6 py-6 space-y-5">

            {/* MOBILE DARK MODE */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-3 py-3 px-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white"
            >
              {dark ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-400" />
              )}

              <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* MOBILE LINKS */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              Home
            </Link>

            <a
              href={sectionHref('about')}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              About
            </a>

            <a
              href={sectionHref('projects')}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              Projects
            </a>

            <a
              href={sectionHref('experiences')}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              Pengalaman
            </a>

            <a
              href={sectionHref('certificates')}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              Sertifikat
            </a>

            <a
              href={sectionHref('contact')}
              onClick={() => setMobileMenuOpen(false)}
              className={mobileLinkClass}
            >
              Contact
            </a>

            {/* MOBILE LOGIN / DASHBOARD */}
            {user ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileLinkClass}
                >
                  Dashboard Admin
                </Link>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-red-500 dark:text-red-400 hover:text-red-300 transition block py-2 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileLinkClass}
              >
                Login
              </Link>
            )}

          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
