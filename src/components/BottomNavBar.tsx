import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Compass, Library } from "lucide-react";
import { cn } from "../utils/cn";

export const BottomNavBar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Compass, label: "Explore", path: "/search" },
    { icon: Library, label: "Library", path: "/library" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0c]/90 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-around px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/search' && location.pathname.startsWith('/search'));
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center w-full h-full gap-1"
          >
            <div className={cn(
              "p-1 rounded-full transition-all duration-300",
              isActive ? "text-primary" : "text-text-secondary"
            )}>
              <item.icon className={cn("w-6 h-6", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={cn(
              "text-[10px] font-medium transition-colors",
              isActive ? "text-white" : "text-text-secondary"
            )}>
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </div>
  );
};
