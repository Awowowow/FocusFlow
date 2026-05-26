import { BarChart3, CheckSquare, Clock3, LogOut, Moon, Sun } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { BrandLogo } from "./BrandLogo";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/logs", label: "Time logs", icon: Clock3 },
];

export const AppShell = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
      toast.success("Logged out.");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <BrandLogo />
        <nav className="nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} end={to === "/"} to={to}><Icon size={19} />{label}</NavLink>
          ))}
        </nav>
        <div className="profile">
          <div className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</div>
          <div className="profile-text"><strong>{user?.name}</strong><small>{user?.email}</small></div>
          <button className="icon-btn" aria-label="Log out" onClick={handleLogout}><LogOut size={17} /></button>
        </div>
      </aside>
      <main className="page">
        <header className="topbar">
          <div className="mobile-brand"><BrandLogo compact /></div>
          <div className="topbar-actions">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <button className="topbar-logout" aria-label="Log out" onClick={handleLogout}><LogOut size={17} /> Log out</button>
          </div>
        </header>
        <Outlet />
      </main>
      <nav className="mobile-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} end={to === "/"} to={to}><Icon size={20} /><small>{label}</small></NavLink>
        ))}
      </nav>
    </div>
  );
};
