import { BarChart3, CheckSquare, Clock3, LogOut, Moon, Sun, Zap } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

const links = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/logs", label: "Time logs", icon: Clock3 },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span><Zap size={18} /></span> FocusFlow</div>
        <nav className="nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} end={to === "/"} to={to}><Icon size={19} />{label}</NavLink>
          ))}
        </nav>
        <div className="profile">
          <div className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</div>
          <div className="profile-text"><strong>{user?.name}</strong><small>{user?.email}</small></div>
          <button className="icon-btn" aria-label="Log out" onClick={logout}><LogOut size={17} /></button>
        </div>
      </aside>
      <main className="page">
        <header className="topbar">
          <div className="mobile-brand"><Zap size={17} /> FocusFlow</div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
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
}
