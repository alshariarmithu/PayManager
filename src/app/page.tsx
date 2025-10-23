"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Building2, AlertCircle } from "lucide-react";

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-neutral)] to white flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 shadow-lg transform transition-transform hover:scale-105"
            style={{ backgroundColor: "#609966" }}
          >
            <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 logo-font"
            style={{ color: "#40513b" }}
          >
            PayManager
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Sign in to your PayManager
          </p>
        </div>

        <div
          className="rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200  backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <div className="space-y-5 sm:space-y-6">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#40513b" }}
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: "#9dc08b" }} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm sm:text-base"
                  style={{
                    boxShadow: email ? "0 0 0 1px #609966" : "none",
                  }}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#40513b" }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" style={{ color: "#9dc08b" }} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent text-sm sm:text-base"
                  style={{
                    boxShadow: password ? "0 0 0 1px #609966" : "none",
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff
                      className="h-5 w-5 hover:opacity-70"
                      style={{ color: "#9dc08b" }}
                    />
                  ) : (
                    <Eye
                      className="h-5 w-5 hover:opacity-70"
                      style={{ color: "#9dc08b" }}
                    />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 transition-colors"
                  style={{
                    accentColor: "#609966",
                  }}
                />
                <label
                  className="ml-2 block text-sm"
                  style={{ color: "#40513b" }}
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm transition-colors hover:underline"
                style={{ color: "#609966" }}
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div
                className="flex items-center space-x-2 p-3 rounded-lg border"
                style={{
                  backgroundColor: "#fef2f2",
                  borderColor: "#fecaca",
                  color: "#dc2626",
                }}
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm sm:text-base font-medium text-white transition-all duration-200 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: isLoading
                  ? "#609966"
                  : `linear-gradient(135deg, #609966)`,
              }}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm font-medium text-gray-800 opacity-70">
            © 2025 PayManager. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
