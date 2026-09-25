import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { hasPermissionAnywhere } from '@/lib/permissions';
import {
  HomeIcon,
  BuildingIcon,
  CalendarIcon,
  TrophyIcon,
  StarIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  DashboardIcon,
  GearIcon,
  LogoutIcon,
} from '@/components/ui/Icons';

interface NavLinkItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const GUEST_NAV_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Home', icon: <HomeIcon className="h-4 w-4" /> },
  { to: '/clubs', label: 'Clubs', icon: <BuildingIcon className="h-4 w-4" /> },
  { to: '/events', label: 'Events', icon: <CalendarIcon className="h-4 w-4" /> },
  { to: '/leaderboard', label: 'Leaderboard', icon: <TrophyIcon className="h-4 w-4" /> },
  { to: '/achievements', label: 'Achievements', icon: <StarIcon className="h-4 w-4" /> },
];

const AUTH_NAV_LINKS: NavLinkItem[] = [
  { to: '/', label: 'Home', icon: <HomeIcon className="h-4 w-4" /> },
  { to: '/clubs', label: 'Clubs', icon: <BuildingIcon className="h-4 w-4" /> },
  { to: '/events', label: 'Events', icon: <CalendarIcon className="h-4 w-4" /> },
  { to: '/leaderboard', label: 'Leaderboard', icon: <TrophyIcon className="h-4 w-4" /> },
  { to: '/achievements', label: 'Achievements', icon: <StarIcon className="h-4 w-4" /> },
  { to: '/notifications', label: 'Alerts', icon: <BellIcon className="h-4 w-4" /> },
];

export function Navbar() {
  const { user, isAuthenticated, isGuest, logout } = useAuthStore();
  const auth = useAuthStore((s) => s.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') !== 'light'
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!menuOpen) {
      setDrawerVisible(false);
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setDrawerVisible(true);
    });

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      setDrawerVisible(false);
      document.body.style.overflow = '';
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = isGuest ? GUEST_NAV_LINKS : AUTH_NAV_LINKS;

  const canAccessAdmin =
    !isGuest &&
    (user?.isMasterAdmin === true ||
      hasPermissionAnywhere(auth, 'EDIT_CLUB') ||
      hasPermissionAnywhere(auth, 'EDIT_CLUB_MEMBERS') ||
      hasPermissionAnywhere(auth, 'CREATE_EVENT') ||
      hasPermissionAnywhere(auth, 'EDIT_EVENT') ||
      hasPermissionAnywhere(auth, 'DELETE_EVENT_CESA'));

  const isActiveLink = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className="relative z-50 border-b border-gray-200 bg-white/85 shadow-sm backdrop-blur-xl transition-colors dark:border-gray-800 dark:bg-gray-900/80 lg:sticky lg:top-0 lg:mx-3 lg:mt-3 lg:rounded-2xl lg:border lg:shadow-lg">
        <div className="mx-auto flex min-h-[64px] w-full max-w-7xl items-center gap-2 overflow-hidden px-4 py-3 sm:gap-3 lg:px-6">

          {/* Logo */}
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="flex shrink-0 items-center rounded-md bg-white px-1.5 py-1 transition-colors dark:bg-transparent"
          >
            <img
              src="/image/Pccoe%20Logos.png"
              alt="CESA Student Association"
              className="h-10 w-[138px] object-contain dark:invert dark:mix-blend-screen"
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex lg:gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActiveLink(link.to) ? 'page' : undefined}
                className={`flex shrink-0 items-center whitespace-nowrap rounded-md px-2 py-2 text-sm transition-colors lg:px-2.5 ${
                  isActiveLink(link.to)
                    ? 'bg-brand-50 font-medium text-brand-700 dark:bg-gray-800 dark:text-brand-300'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400'
                }`}
              >
                <span className="hidden">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-1.5 lg:gap-2">

            {/* Theme */}
            <button
              type="button"
              onClick={() => setDarkMode((value) => !value)}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {darkMode ? <SunIcon className="h-4 w-4 text-amber-500" /> : <MoonIcon className="h-4 w-4 text-gray-700 dark:text-gray-200" />}
              <span className="sr-only">{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            {/* Desktop auth controls */}
            <div className="hidden items-center gap-1.5 lg:flex lg:gap-2">
              {isGuest ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Guest Mode</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Log In
                  </button>
                </div>
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 whitespace-nowrap px-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    <DashboardIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>

                  {canAccessAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1.5 whitespace-nowrap px-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      <GearIcon className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    className="flex max-w-[100px] items-center gap-1.5 truncate px-1 text-sm font-medium text-gray-800 dark:text-gray-200 lg:max-w-[140px]"
                  >
                    <UserIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{user?.name}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="rounded-md bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 lg:hidden"
            >
              {menuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          {/* Background overlay */}
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 lg:hidden ${
              drawerVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Left panel */}
          <aside className={`fixed left-0 top-0 z-50 flex h-full w-[270px] max-w-[80vw] flex-col rounded-r-2xl border-r border-gray-200 bg-white/95 shadow-xl backdrop-blur-xl transition-transform duration-200 ease-out dark:border-gray-800 dark:bg-gray-900/95 lg:hidden ${
            drawerVisible ? 'translate-x-0' : '-translate-x-full'
          }`}>

            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <span className="rounded-md bg-white px-1 py-1 dark:bg-transparent">
                <img
                  src="/image/Pccoe%20Logos.png"
                  alt="CESA Student Association"
                  className="h-9 w-[122px] object-contain dark:invert dark:mix-blend-screen"
                />
              </span>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                aria-label="Close menu"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                >
                  <span className="shrink-0">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}

              <div className="my-3 border-t border-gray-200 dark:border-gray-800" />

              {isGuest ? (
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>Browsing as Guest</span>
                    </span>
                    <span className="rounded-full bg-amber-200 px-2 py-0.5 font-bold text-amber-900 dark:bg-amber-800 dark:text-amber-100">Guest</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Log In / Register
                  </button>
                </div>
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <DashboardIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>

                  {canAccessAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      <GearIcon className="h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <LogoutIcon className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="mt-2 rounded-lg bg-brand-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-brand-700"
                >
                  Login
                </Link>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}