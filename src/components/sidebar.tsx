"use client";
import React, { useState } from "react";
import {
  Home,
  Users,
  User,
  Briefcase,
  Banknote,
  BarChart3,
  Settings,
  LogOut,
  X,
  Menu,
} from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const router = useRouter();
  const menuItems = [
    {
      name: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      name: "Users",
      icon: <User className="h-5 w-5" />,
      href: "/users",
    },
    {
      name: "Employees",
      icon: <Users className="h-5 w-5" />,
      href: "/employees",
    },
    {
      name: "Departments",
      icon: <Briefcase className="h-5 w-5" />,
      href: "/departments",
    },
    {
      name: "Salaries",
      icon: <Banknote className="h-5 w-5" />,
      href: "/salaries",
    },
    {
      name: "Grade",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/grade",
    },
    {
      name: "NLQuery",
      icon: <Settings className="h-5 w-5" />,
      href: "/nlquery",
    },
  ];

  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    router.push("/");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-white/95 backdrop-blur-xl border-r border-[#9dc08b]/30 shadow-xl z-50 transform transition-all duration-300
        ${isOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"} 
        ${isCollapsed ? "lg:w-20" : "lg:w-72"} lg:translate-x-0`}
      >
        <div className="h-20 flex items-center justify-between px-4 border-b border-[#9dc08b]/30">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-[#40513b] logo-font">
              PayManager
            </h1>
          )}

          <button
            className="hidden lg:flex items-center justify-center p-3 rounded-lg hover:bg-[#9dc08b]/10"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <Menu className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
            )}
          </button>
        </div>

        <nav className="px-3 py-6 space-y-2">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center px-3 py-3 rounded-lg text-[#40513b] font-medium hover:bg-green-700/10 transition-all"
            >
              <span className="mr-3 text-[#609966]">{item.icon}</span>
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full px-3 py-4 border-t border-[#9dc08b]/30">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-3 rounded-lg text-[#40513b] font-medium hover:bg-red-600/10"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-600" />
            {!isCollapsed && "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
