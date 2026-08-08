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
    <nav className="fixed bottom-0 left-0 w-full z-50 grid grid-cols-5 items-stretch h-18 md:h-20 pb-[env(safe-area-inset-bottom)] bg-surface border-t border-tertiary-fixed shadow-[0_-8px_24px_rgba(0,0,0,0.04)]">
      {NAV_ITEMS.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 px-1 py-1 min-w-0 transition-transform active:scale-95 duration-200 ${
              isActive
                ? "text-on-secondary-container"
                : "text-on-surface-variant"
            }`
          }
        >
          {({ isActive }: { isActive: boolean }) => (
            <>
              <span
                className={`material-symbols-outlined leading-none text-[20px] md:text-[24px] inline-flex items-center justify-center text-center w-9 h-9 rounded-full transition-colors ${
                  isActive ? "bg-secondary-container" : ""
                }`}
                style={{
                  fontVariationSettings: `'FILL' ${
                    isActive ? 1 : 0
                  }, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
                }}
              >
                {icon}
              </span>
              <span className="text-[10px] md:text-label-lg leading-tight w-full text-center truncate px-0.5">
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center gap-0.5 px-1 py-1 min-w-0 transition-transform active:scale-95 duration-200 text-on-surface-variant"
      >
        <span
          className="material-symbols-outlined leading-none text-[20px] md:text-[24px] inline-flex items-center justify-center text-center w-9 h-9 rounded-full"
          style={{
            fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
          }}
        >
          logout
        </span>
        <span className="text-[10px] md:text-label-lg leading-tight w-full text-center truncate px-0.5">
          Log out
        </span>
      </button>
    </nav>
  );
}