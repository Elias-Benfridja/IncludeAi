import { NavLink, useNavigate } from "react-router-dom";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/tasks/new", label: "New Task", icon: "add_circle" },
  { to: "/rewards", label: "Rewards", icon: "stars" },
  { to: "/chats", label: "Chats", icon: "forum" },
];

export default function BottomNav() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 pb-[env(safe-area-inset-bottom)] bg-surface border-t border-tertiary-fixed shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center px-6 py-1 rounded-full transition-transform active:scale-95 duration-200 ${
              isActive
                ? "bg-secondary-container text-on-secondary-container"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`
          }
        >
          {({ isActive }: { isActive: boolean }) => (
            <>
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span className="text-label-lg">{label}</span>
            </>
          )}
        </NavLink>
      ))}

      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center px-6 py-1 rounded-full transition-transform active:scale-95 duration-200 text-on-surface-variant hover:bg-surface-container-high"
      >
        <span className="material-symbols-outlined">logout</span>
        <span className="text-label-lg">Log out</span>
      </button>
    </nav>
  );
}