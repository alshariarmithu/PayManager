"use client";
import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar onMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
      </div>

      <div className="flex flex-1 pt-20">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-4 pt-5 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
