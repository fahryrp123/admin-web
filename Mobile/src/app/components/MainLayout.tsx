import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, CalendarCheck, User } from "lucide-react";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Beranda", path: "/home" },
    { icon: CalendarCheck, label: "Booking Saya", path: "/home/bookings" },
    { icon: User, label: "Profil", path: "/home/profile" },
  ];

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-2xl">
        <div className="flex justify-around items-center py-2 px-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === "/home/bookings" && (location.pathname === "/home/rentals" || location.pathname === "/home/history"));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
