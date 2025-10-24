"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  Users,
  PlusCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ArrowUpDown,
  X,
  Check,
  AlertCircle,
} from "lucide-react";

// Types
interface Department {
  Dept_Id: number;
  Dept_Name: string;
  Total_Employees: number;
}

type SortField = "Dept_Id" | "Dept_Name" | "Total_Employees";
type SortOrder = "asc" | "desc";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSize, setFilterSize] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("Dept_Id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "success" });

  const [formData, setFormData] = useState({
    Dept_Name: "",
    Total_Employees: 0,
  });

  const API_BASE_URL = "http://localhost:5001/api/departments";

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch departments", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000
    );
  };

  // Filtered and sorted data
  const filteredDepartments = useMemo(() => {
    let filtered = departments.filter((dept) =>
      dept.Dept_Name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterSize !== "all") {
      if (filterSize === "small")
        filtered = filtered.filter((d) => d.Total_Employees < 10);
      if (filterSize === "medium")
        filtered = filtered.filter(
          (d) => d.Total_Employees >= 10 && d.Total_Employees <= 50
        );
      if (filterSize === "large")
        filtered = filtered.filter((d) => d.Total_Employees > 50);
    }

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [departments, searchQuery, filterSize, sortField, sortOrder]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleAdd = async () => {
    if (!formData.Dept_Name.trim()) {
      showToast("Department name is required", "error");
      return;
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Dept_Name: formData.Dept_Name,
          Total_Employees: formData.Total_Employees,
        }),
      });

      if (!response.ok) throw new Error("Failed to create");

      const newDept = await response.json();
      setDepartments([...departments, newDept]);
      setIsAddModalOpen(false);
      setFormData({ Dept_Name: "", Total_Employees: 0 });
      showToast("Department added successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to add department", "error");
    }
  };

  const handleEdit = async () => {
    if (!selectedDept || !formData.Dept_Name.trim()) {
      showToast("Department name is required", "error");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${selectedDept.Dept_Id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Dept_Name: formData.Dept_Name,
          Total_Employees: formData.Total_Employees,
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      const updatedDept = await response.json();
      setDepartments(
        departments.map((d) =>
          d.Dept_Id === selectedDept.Dept_Id ? updatedDept : d
        )
      );
      setIsEditModalOpen(false);
      setSelectedDept(null);
      setFormData({ Dept_Name: "", Total_Employees: 0 });
      showToast("Department updated successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to update department", "error");
    }
  };

  const handleDelete = async (dept: Department) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${dept.Dept_Id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setDepartments(departments.filter((d) => d.Dept_Id !== dept.Dept_Id));
      setActiveDropdown(null);
      showToast("Department deleted successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to delete department", "error");
    }
  };

  const openEditModal = (dept: Department) => {
    setSelectedDept(dept);
    setFormData({
      Dept_Name: dept.Dept_Name,
      Total_Employees: dept.Total_Employees,
    });
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div
        className="max-w-7xl mx-auto p-6 md:p-9"
        style={{
          background: `linear-gradient(135deg, #fafcf7 0%, #f4f8eb 100%)`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-3 bg-gradient-to-br from-[#609966] to-[var(--color-accent)] rounded-xl shadow-lg">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Departments
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {departments.length} total departments
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#609966] to-[var(--color-primary)] text-white rounded-xl shadow-lg hover:shadow-xl transition-shadow font-medium"
            >
              <PlusCircle className="w-5 h-5" />
              Add Department
            </motion.button>
          </div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Controls */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={filterSize}
                    onChange={(e) => setFilterSize(e.target.value)}
                    className="pl-11 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer min-w-[200px]"
                  >
                    <option value="all">All Sizes</option>
                    <option value="small">Small (&lt;10)</option>
                    <option value="medium">Medium (10-50)</option>
                    <option value="large">Large (&gt;50)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="h-12 bg-gray-200 rounded-lg flex-1"></div>
                      <div className="h-12 bg-gray-200 rounded-lg flex-1"></div>
                      <div className="h-12 bg-gray-200 rounded-lg flex-1"></div>
                      <div className="h-12 bg-gray-200 rounded-lg w-24"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4">
                        <button
                          onClick={() => handleSort("Dept_Id")}
                          className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          ID
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left px-6 py-4">
                        <button
                          onClick={() => handleSort("Dept_Name")}
                          className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          Department Name
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-left px-6 py-4">
                        <button
                          onClick={() => handleSort("Total_Employees")}
                          className="flex items-center gap-2 font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          Employees
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      </th>
                      <th className="text-right px-6 py-4 font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredDepartments.map((dept, idx) => (
                        <motion.tr
                          key={dept.Dept_Id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-t border-gray-100 hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium text-sm">
                              #{dept.Dept_Id}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                                <Building className="w-5 h-5 text-[#609966]" />
                              </div>
                              <span className="font-medium text-gray-900">
                                {dept.Dept_Name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700 font-medium">
                                {dept.Total_Employees}
                              </span>
                              <span
                                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                  dept.Total_Employees < 10
                                    ? "bg-yellow-100 text-yellow-700"
                                    : dept.Total_Employees <= 50
                                    ? "bg-green-100 text-green-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {dept.Total_Employees < 10
                                  ? "Small"
                                  : dept.Total_Employees <= 50
                                  ? "Medium"
                                  : "Large"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="relative inline-block">
                              <button
                                onClick={() =>
                                  setActiveDropdown(
                                    activeDropdown === dept.Dept_Id
                                      ? null
                                      : dept.Dept_Id
                                  )
                                }
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-600" />
                              </button>

                              <AnimatePresence>
                                {activeDropdown === dept.Dept_Id && (
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      scale: 0.95,
                                      y: -10,
                                    }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                                  >
                                    <button
                                      onClick={() => {
                                        showToast(
                                          `Viewing ${dept.Dept_Name}`,
                                          "info"
                                        );
                                        setActiveDropdown(null);
                                      }}
                                      className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                    >
                                      <Eye className="w-4 h-4 text-blue-600" />
                                      <span className="text-gray-700">
                                        View
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => openEditModal(dept)}
                                      className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                    >
                                      <Edit className="w-4 h-4 text-green-600" />
                                      <span className="text-gray-700">
                                        Edit
                                      </span>
                                    </button>
                                    <button
                                      onClick={() => handleDelete(dept)}
                                      className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                      <span className="text-red-600">
                                        Delete
                                      </span>
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              )}

              {!loading && filteredDepartments.length === 0 && (
                <div className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No departments found</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Add Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setIsAddModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Add Department
                  </h2>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={formData.Dept_Name}
                      onChange={(e) =>
                        setFormData({ ...formData, Dept_Name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter department name"
                    />
                  </div>

                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Employees
                    </label>
                    <input
                      type="number"
                      value={formData.Total_Employees}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          Total_Employees: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter employee count"
                    />
                  </div> */}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
                  >
                    Add Department
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setIsEditModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Edit Department
                  </h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={formData.Dept_Name}
                      onChange={(e) =>
                        setFormData({ ...formData, Dept_Name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Employees
                    </label>
                    <input
                      type="number"
                      value={formData.Total_Employees}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          Total_Employees: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <div
                className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${
                  toast.type === "success"
                    ? "bg-green-500"
                    : toast.type === "error"
                    ? "bg-red-500"
                    : "bg-blue-500"
                } text-white`}
              >
                {toast.type === "success" ? (
                  <Check className="w-5 h-5" />
                ) : toast.type === "error" ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
                <span className="font-medium">{toast.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
