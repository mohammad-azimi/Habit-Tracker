import React from "react";
import { BarChart3, CalendarDays, FileText, UserCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: CalendarDays,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Notes",
    path: "/notes-review",
    icon: FileText,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: UserCircle,
  },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="mobile-bottom-nav-safe fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-neutral-950/90 px-3 pt-2 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition active:scale-[0.96] ${
                isActive
                  ? "bg-violet-300 text-black"
                  : "text-neutral-500 hover:bg-white/5 hover:text-neutral-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
