import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  User,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
} from "lucide-react";

// Mock auth context for demo
const useAuth = () => ({
  user: { name: "John Doe", email: "john.doe@paymanager.com", role: "Admin" },
  logout: () => console.log("Logging out..."),
});

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user, logout } = useAuth();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="max-w-7xl mx-auto rounded-md relative h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 backdrop-blur-xl border-b transition-all duration-300"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "rgba(157, 192, 139, 0.2)",
        boxShadow: "0 4px 32px rgba(64, 81, 59, 0.08)",
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(90deg, rgba(247, 249, 236, 0.3) 0%, rgba(237, 241, 214, 0.2) 100%)`,
        }}
      />

      {/* Left Section */}
      <div className="flex items-center space-x-4 relative z-10">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-3 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-green-200"
          style={{ backgroundColor: "rgba(96, 153, 102, 0.1)" }}
        >
          <Menu
            className="h-5 w-5 transition-colors duration-300"
            style={{ color: "#609966" }}
          />
        </button>

        {/* Enhanced Search Bar */}
        <div className="relative ml-8">
          <div
            className={`relative flex items-center transition-all duration-300 ${
              isSearchFocused ? "scale-105" : ""
            }`}
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                className={`h-5 w-5 transition-all duration-300 ${
                  isSearchFocused ? "scale-110" : ""
                }`}
                style={{ color: isSearchFocused ? "#609966" : "#9dc08b" }}
              />
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="block w-72 sm:w-96 pl-12 pr-4 py-3 border-2 rounded-2xl leading-5 backdrop-blur-sm placeholder-gray-400 transition-all duration-300 focus:outline-none text-base font-medium"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderColor: isSearchFocused
                  ? "#609966"
                  : "rgba(157, 192, 139, 0.3)",
                boxShadow: isSearchFocused
                  ? "0 0 0 3px rgba(96, 153, 102, 0.1)"
                  : "none",
              }}
            />
          </div>

          {/* Search suggestions hint */}
          {searchTerm && (
            <div
              className="absolute top-full left-0 right-0 mt-2 p-4 rounded-2xl backdrop-blur-xl border shadow-2xl z-50"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderColor: "rgba(157, 192, 139, 0.3)",
              }}
            >
              <p className="text-sm text-gray-500">
                Press Enter to search for "{searchTerm}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4 relative z-10">
        {/* Profile Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-2 rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-green-200"
            style={{ backgroundColor: "rgba(96, 153, 102, 0.1)" }}
          >
            {/* Avatar */}
            <div
              className="relative h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, #609966 0%, #40513b 100%)`,
              }}
            >
              <User className="h-5 w-5 text-white" />
              {/* Online indicator */}
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                style={{ backgroundColor: "#9dc08b" }}
              />
            </div>

            {/* User Info */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold" style={{ color: "#40513b" }}>
                {user?.name}
              </p>
              <p className="text-xs opacity-70" style={{ color: "#40513b" }}>
                {user?.role}
              </p>
            </div>

            {/* Dropdown Arrow */}
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-300 ${
                showProfileMenu ? "rotate-180" : ""
              }`}
              style={{ color: "#609966" }}
            />
          </button>

          {/* Enhanced Dropdown Menu */}
          {showProfileMenu && (
            <div
              className="origin-top-right absolute right-0 mt-3 w-64 rounded-2xl backdrop-blur-xl border shadow-2xl z-50 overflow-hidden"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderColor: "rgba(157, 192, 139, 0.3)",
                boxShadow: "0 20px 40px rgba(64, 81, 59, 0.15)",
              }}
            >
              {/* User Info Header */}
              <div
                className="px-6 py-4 border-b"
                style={{
                  borderColor: "rgba(157, 192, 139, 0.2)",
                  background: `linear-gradient(135deg, rgba(96, 153, 102, 0.05) 0%, rgba(237, 241, 214, 0.1) 100%)`,
                }}
              >
                <p
                  className="font-semibold text-base"
                  style={{ color: "#40513b" }}
                >
                  {user?.name}
                </p>
                <p className="text-sm opacity-70" style={{ color: "#40513b" }}>
                  {user?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  className="flex items-center w-full px-6 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] group hover:bg-green-50"
                  style={{ color: "#40513b" }}
                >
                  <Settings
                    className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:rotate-90"
                    style={{ color: "#609966" }}
                  />
                  Account Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-6 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] group hover:bg-green-50"
                  style={{ color: "#40513b" }}
                >
                  <LogOut
                    className="mr-3 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: "#609966" }}
                  />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
