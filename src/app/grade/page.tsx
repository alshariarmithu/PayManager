"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Coins,
  PlusCircle,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  ArrowUpDown,
  TrendingUp,
  X,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5001/api";

type Grade = {
  Grade_Id: number;
  Grade_Name: string;
  Basic_Salary: number;
  Grade_Bonus: number;
  Employee_Count?: number;
};

type SortField = "Grade_Name" | "Basic_Salary" | "Grade_Bonus";
type SortOrder = "asc" | "desc";

type Toast = {
  id: number;
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

export default function GradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("Grade_Name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    Grade_Name: "",
    Basic_Salary: "",
    Grade_Bonus: "",
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (
    title: string,
    description: string,
    variant: "default" | "destructive" = "default"
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/grades`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      setGrades(data);
    } catch (error) {
      console.error("Fetch error:", error);
      showToast(
        "Error",
        "Failed to fetch grades. Make sure the backend is running.",
        "destructive"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedGrades = useMemo(() => {
    let filtered = grades.filter((grade) =>
      grade.Grade_Name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortOrder === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * modifier;
      }
      return (Number(aValue) - Number(bValue)) * modifier;
    });

    return filtered;
  }, [grades, searchQuery, sortField, sortOrder]);

  const totalSalary = useMemo(
    () => filteredAndSortedGrades.reduce((sum, g) => sum + g.Basic_Salary, 0),
    [filteredAndSortedGrades]
  );

  const totalBonus = useMemo(
    () => filteredAndSortedGrades.reduce((sum, g) => sum + g.Grade_Bonus, 0),
    [filteredAndSortedGrades]
  );

  const validateForm = () => {
    if (!formData.Grade_Name.trim()) {
      showToast("Validation Error", "Grade name is required", "destructive");
      return false;
    }
    if (!formData.Basic_Salary || parseFloat(formData.Basic_Salary) < 0) {
      showToast(
        "Validation Error",
        "Valid basic salary is required",
        "destructive"
      );
      return false;
    }
    if (!formData.Grade_Bonus || parseFloat(formData.Grade_Bonus) < 0) {
      showToast(
        "Validation Error",
        "Valid grade bonus is required",
        "destructive"
      );
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/grades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Grade_Name: formData.Grade_Name.trim(),
          Basic_Salary: parseFloat(formData.Basic_Salary),
          Grade_Bonus: parseFloat(formData.Grade_Bonus),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add grade");
      }

      showToast("Success", "Grade added successfully");
      setIsAddModalOpen(false);
      setFormData({ Grade_Name: "", Basic_Salary: "", Grade_Bonus: "" });
      fetchGrades();
    } catch (error) {
      showToast("Error", "Failed to add grade", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedGrade || !validateForm()) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${API_BASE_URL}/grades/${selectedGrade.Grade_Id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Grade_Name: formData.Grade_Name.trim(),
            Basic_Salary: parseFloat(formData.Basic_Salary),
            Grade_Bonus: parseFloat(formData.Grade_Bonus),
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update grade");
      }

      showToast("Success", "Grade updated successfully");
      setIsEditModalOpen(false);
      setSelectedGrade(null);
      setFormData({ Grade_Name: "", Basic_Salary: "", Grade_Bonus: "" });
      fetchGrades();
    } catch (error) {
      showToast("Error", "Failed to update grade", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGrade) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${API_BASE_URL}/grades/${selectedGrade.Grade_Id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete grade");
      }

      showToast("Success", "Grade deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedGrade(null);
      fetchGrades();
    } catch (error) {
      showToast("Error", "Failed to delete grade", "destructive");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (grade: Grade) => {
    setSelectedGrade(grade);
    setFormData({
      Grade_Name: grade.Grade_Name,
      Basic_Salary: grade.Basic_Salary.toString(),
      Grade_Bonus: grade.Grade_Bonus.toString(),
    });
    setIsEditModalOpen(true);
    setOpenDropdown(null);
  };

  const openDeleteModal = (grade: Grade) => {
    setSelectedGrade(grade);
    setIsDeleteModalOpen(true);
    setOpenDropdown(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl shadow-lg">
                <Layers className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Grade Management
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Manage salary grades and compensation structures
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary)] hover:to-[var(--color-primary)] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Add Grade
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Grades
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {grades.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Layers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Base Salary
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  ৳{totalSalary.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Coins className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Bonuses
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  ৳{totalBonus.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          {/* Search Bar */}
          <div className="p-6 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search grades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    <button
                      onClick={() => handleSort("Grade_Name")}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      Grade Name
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    <button
                      onClick={() => handleSort("Basic_Salary")}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      Basic Salary
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    <button
                      onClick={() => handleSort("Grade_Bonus")}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      Grade Bonus
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Total Compensation
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-6 py-4">
                        <div className="h-5 bg-slate-200 rounded animate-pulse w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 bg-slate-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 bg-slate-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 bg-slate-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 bg-slate-200 rounded animate-pulse w-8 ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredAndSortedGrades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-500">
                        <AlertCircle className="w-12 h-12" />
                        <p className="text-lg font-medium">No grades found</p>
                        <p className="text-sm">
                          {searchQuery
                            ? "Try adjusting your search"
                            : "Add your first grade to get started"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    <AnimatePresence>
                      {filteredAndSortedGrades.map((grade, index) => (
                        <motion.tr
                          key={grade.Grade_Id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 font-medium text-slate-900">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              {grade.Grade_Name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-emerald-600">
                              ৳{grade.Basic_Salary.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-amber-600">
                              ৳{grade.Grade_Bonus.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-blue-600">
                              ৳
                              {(
                                grade.Basic_Salary + grade.Grade_Bonus
                              ).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="relative inline-block">
                              <button
                                onClick={() =>
                                  setOpenDropdown(
                                    openDropdown === grade.Grade_Id
                                      ? null
                                      : grade.Grade_Id
                                  )
                                }
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {openDropdown === grade.Grade_Id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                                  <button
                                    onClick={() => openEditModal(grade)}
                                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 rounded-t-lg"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => openDeleteModal(grade)}
                                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-red-600 rounded-b-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>

                    {/* Summary Row */}
                    <tr className="bg-gradient-to-r from-slate-50 to-blue-50 font-semibold border-t-2 border-slate-200">
                      <td className="px-6 py-4 text-slate-900">Total</td>
                      <td className="px-6 py-4 text-emerald-600">
                        ৳{totalSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-amber-600">
                        ৳{totalBonus.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-blue-600">
                        ৳{(totalSalary + totalBonus).toLocaleString()}
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Add Grade Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                Add New Grade
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Create a new salary grade with compensation details
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Grade Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Senior Manager"
                  value={formData.Grade_Name}
                  onChange={(e) =>
                    setFormData({ ...formData, Grade_Name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Basic Salary
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  value={formData.Basic_Salary}
                  onChange={(e) =>
                    setFormData({ ...formData, Basic_Salary: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Grade Bonus
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={formData.Grade_Bonus}
                  onChange={(e) =>
                    setFormData({ ...formData, Grade_Bonus: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormData({
                    Grade_Name: "",
                    Basic_Salary: "",
                    Grade_Bonus: "",
                  });
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary)] hover:to-[var(--color-secondary)] text-white rounded-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Adding..." : "Add Grade"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Grade Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Edit Grade</h2>
              <p className="text-slate-600 text-sm mt-1">
                Update the grade compensation details
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Grade Name
                </label>
                <input
                  type="text"
                  value={formData.Grade_Name}
                  onChange={(e) =>
                    setFormData({ ...formData, Grade_Name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Basic Salary
                </label>
                <input
                  type="number"
                  value={formData.Basic_Salary}
                  onChange={(e) =>
                    setFormData({ ...formData, Basic_Salary: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Grade Bonus
                </label>
                <input
                  type="number"
                  value={formData.Grade_Bonus}
                  onChange={(e) =>
                    setFormData({ ...formData, Grade_Bonus: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedGrade(null);
                  setFormData({
                    Grade_Name: "",
                    Basic_Salary: "",
                    Grade_Bonus: "",
                  });
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)] hover:from-[var(--color-primary)] hover:to-[var(--color-secondary)] text-white rounded-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">
                Delete Grade
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900">
                  {selectedGrade?.Grade_Name}
                </span>
                ? This action cannot be undone.
              </p>
            </div>
            <div className="p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedGrade(null);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, x: 100 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`min-w-[300px] p-4 rounded-lg shadow-lg border ${
                toast.variant === "destructive"
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3
                    className={`font-semibold ${
                      toast.variant === "destructive"
                        ? "text-red-900"
                        : "text-slate-900"
                    }`}
                  >
                    {toast.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      toast.variant === "destructive"
                        ? "text-red-700"
                        : "text-slate-600"
                    }`}
                  >
                    {toast.description}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                  }
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
}
