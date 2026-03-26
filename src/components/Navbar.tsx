/**
 * Navbar — top navigation bar.
 * Hidden on the landing page, auth page, and during onboarding.
 * Shows Dashboard, Profile, Patterns links + Sign out.
 */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patterns', label: 'Patterns', icon: TrendingUp },
  { to: '/profile', label: 'Profile', icon: User },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  if (pathname === '/' || pathname === '/auth' || pathname.startsWith('/onboarding')) return null;

  const handleExit = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="w-full px-8 md:px-16 lg:px-24 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-sm font-serif text-navy font-semibold">
            Proof of Signal
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    active ? 'bg-navy text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExit}
              className="ml-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
