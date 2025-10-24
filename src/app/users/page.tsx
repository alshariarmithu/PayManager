"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  Mail,
  Lock,
  UserCircle,
  Shield,
  Filter,
  MoreVertical,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5001/api";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

type SortField = "name" | "email" | "role";
type SortOrder = "asc" | "desc";

const ROLES = ["Admin", "HR Manager", "Accountant", "Employee", "Supervisor"];


// Toast Component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white font-medium animate-slideIn ${
        type === "success" ? "bg-emerald-600" : "bg-rose-600"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      {message}
    </div>
  );
};

// Modal Component
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Dropdown Menu Component
const DropdownMenu = ({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5 text-slate-600" />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-20 animate-scaleIn">
            <button
              onClick={() => {
                onView();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit User
            </button>
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-rose-50 flex items-center gap-3 text-rose-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete User
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  // Fetch users data
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users function
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetchAllUsers();
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error: any) {
      showToast(error.message || "Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  // Individual API functions
  const fetchAllUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response;
  };

  const createUser = async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response;
  };

  const updateUser = async (
    userId: number,
    userData: { name: string; email: string; password?: string; role: string }
  ) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response;
  };

  const deleteUserById = async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    return response;
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      return matchesSearch && matchesRole;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "email") {
        comparison = a.email.localeCompare(b.email);
      } else if (sortField === "role") {
        comparison = a.role.localeCompare(b.role);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [users, searchQuery, roleFilter, sortField, sortOrder]);

  // Role statistics
  const roleStats = useMemo(() => {
    const stats: { [key: string]: number } = {};
    users.forEach((user) => {
      stats[user.role] = (stats[user.role] || 0) + 1;
    });
    return stats;
  }, [users]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleAddUser = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      const response = await createUser(formData);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to create user");

      await fetchUsers();
      setIsAddModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "" });
      showToast("User added successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to add user", "error");
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !formData.name || !formData.email || !formData.role) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      const userData: {
        name: string;
        email: string;
        password?: string;
        role: string;
      } = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      // Only include password if it's provided
      if (formData.password) {
        userData.password = formData.password;
      }

      const response = await updateUser(selectedUser.id, userData);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to update user");

      await fetchUsers();
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setFormData({ name: "", email: "", password: "", role: "" });
      showToast("User updated successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to update user", "error");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await deleteUserById(userId);
      const data = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Failed to delete user");

      await fetchUsers();
      showToast("User deleted successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to delete user", "error");
    }
  };

  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: { [key: string]: string } = {
      Admin: "bg-purple-100 text-purple-700 border-purple-200",
      "HR Manager": "bg-blue-100 text-blue-700 border-blue-200",
      Accountant: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Employee: "bg-slate-100 text-slate-700 border-slate-200",
      Supervisor: "bg-amber-100 text-amber-700 border-amber-200",
    };
    return colors[role] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-8">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-800">
                User Management
              </h1>
            </div>
            <p className="text-slate-600 text-lg">
              Manage system users, roles, and permissions
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-3xl font-bold text-slate-800">
                {users.length}
              </span>
            </div>
            <h3 className="text-slate-600 font-medium">Total Users</h3>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-slate-800">
                {roleStats["Admin"] || 0}
              </span>
            </div>
            <h3 className="text-slate-600 font-medium">Administrators</h3>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserCircle className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-slate-800">
                {roleStats["HR Manager"] || 0}
              </span>
            </div>
            <h3 className="text-slate-600 font-medium">HR Managers</h3>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-3xl font-bold text-slate-800">
                {roleStats["Employee"] || 0}
              </span>
            </div>
            <h3 className="text-slate-600 font-medium">Employees</h3>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="pl-12 pr-10 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[200px] transition-all"
                >
                  <option value="">All Roles</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
              {(searchQuery || roleFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("");
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-slate-700 font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-2 font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      Name
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortField === "name" && sortOrder === "desc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("email")}
                      className="flex items-center gap-2 font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      Email
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortField === "email" && sortOrder === "desc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("role")}
                      className="flex items-center gap-2 font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      Role
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortField === "role" && sortOrder === "desc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="px-6 py-4">
                          <div className="h-6 bg-slate-200 rounded skeleton w-40" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 bg-slate-200 rounded skeleton w-48" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 bg-slate-200 rounded skeleton w-24" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 bg-slate-200 rounded skeleton w-8 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : filteredAndSortedUsers.length > 0 ? (
                  filteredAndSortedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <DropdownMenu
                            onView={() => openViewModal(user)}
                            onEdit={() => openEditModal(user)}
                            onDelete={() => handleDeleteUser(user.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-slate-100 rounded-full">
                          <Users className="w-12 h-12 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-slate-700">
                            No users found
                          </p>
                          <p className="text-slate-500 mt-1">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setFormData({ name: "", email: "", password: "", role: "" });
            setShowPassword(false);
          }}
          title="Add New User"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full pl-11 pr-10 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all"
                >
                  <option value="">Select a role</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormData({ name: "", email: "", password: "", role: "" });
                  setShowPassword(false);
                }}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Add User
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
            setFormData({ name: "", email: "", password: "", role: "" });
            setShowPassword(false);
          }}
          title="Edit User"
        >
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password{" "}
                <span className="text-slate-500">
                  (leave blank to keep current)
                </span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Role
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full pl-11 pr-10 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white cursor-pointer transition-all"
                >
                  <option value="">Select a role</option>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                  setFormData({ name: "", email: "", password: "", role: "" });
                  setShowPassword(false);
                }}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Update User
              </button>
            </div>
          </div>
        </Modal>

        {/* View User Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedUser(null);
          }}
          title="User Details"
        >
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    {selectedUser.name}
                  </h3>
                  <p className="text-slate-600">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-2">
                    User ID
                  </p>
                  <p className="text-lg font-semibold text-slate-800">
                    #{selectedUser.id}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-2">
                    Role
                  </p>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getRoleBadgeColor(
                      selectedUser.role
                    )}`}
                  >
                    {selectedUser.role}
                  </span>
                </div>

                <div className="col-span-2">
                  <p className="text-sm font-semibold text-slate-500 mb-2">
                    Email Address
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <p className="text-lg text-slate-800">
                      {selectedUser.email}
                    </p>
                  </div>
                </div>

                <div className="col-span-2">
                  <p className="text-sm font-semibold text-slate-500 mb-2">
                    Password Status
                  </p>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Lock className="w-5 h-5 text-slate-400" />
                    <p className="text-lg text-slate-800">Protected</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openEditModal(selectedUser);
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit User
                </button>
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
