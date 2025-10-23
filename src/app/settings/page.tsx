"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Users,
  Calendar,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  ArrowUpDown,
  PlusCircle,
  X,
  Building,
  Wallet,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";

type PayManager = {
  Pay_Id: number;
  Employee_Id: number;
  Employee_Name: string;
  Department: string;
  Grade_Name: string;
  Basic_Salary: number;
  Allowances: number;
  Deductions: number;
  Net_Salary: number;
  Pay_Date: string;
  Pay_Status: "Paid" | "Pending" | "Processing";
};

type SortField = keyof PayManager;
type SortOrder = "asc" | "desc";

type Toast = {
  id: number;
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

export default function PayManagerPage() {
  const [payRecords, setPayRecords] = useState<PayManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("Employee_Name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PayManager | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    Employee_Id: "",
    Employee_Name: "",
    Department: "",
    Grade_Name: "",
    Basic_Salary: "",
    Allowances: "",
    Deductions: "",
    Pay_Date: "",
    Pay_Status: "Pending" as "Paid" | "Pending" | "Processing",
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

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
    fetchPayRecords();
  }, []);

  const fetchPayRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/paymanager");
      const data = await response.json();
      setPayRecords(data);
    } catch (error) {
      showToast("Error", "Failed to fetch pay records", "destructive");
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

  const filteredAndSortedRecords = useMemo(() => {
    let filtered = payRecords.filter((record) => {
      const matchesSearch =
        record.Employee_Name.toLowerCase().includes(
          searchQuery.toLowerCase()
        ) ||
        record.Department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.Grade_Name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "All" || record.Pay_Status === filterStatus;

      return matchesSearch && matchesStatus;
    });

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
  }, [payRecords, searchQuery, sortField, sortOrder, filterStatus]);

  const stats = useMemo(() => {
    const totalPaid = payRecords.filter((r) => r.Pay_Status === "Paid").length;
    const totalPending = payRecords.filter(
      (r) => r.Pay_Status === "Pending"
    ).length;
    const totalProcessing = payRecords.filter(
      (r) => r.Pay_Status === "Processing"
    ).length;
    const totalNetSalary = filteredAndSortedRecords.reduce(
      (sum, r) => sum + r.Net_Salary,
      0
    );
    const totalAllowances = filteredAndSortedRecords.reduce(
      (sum, r) => sum + r.Allowances,
      0
    );
    const totalDeductions = filteredAndSortedRecords.reduce(
      (sum, r) => sum + r.Deductions,
      0
    );

    return {
      totalPaid,
      totalPending,
      totalProcessing,
      totalNetSalary,
      totalAllowances,
      totalDeductions,
    };
  }, [payRecords, filteredAndSortedRecords]);

  const calculateNetSalary = () => {
    const basic = Number(formData.Basic_Salary) || 0;
    const allowances = Number(formData.Allowances) || 0;
    const deductions = Number(formData.Deductions) || 0;
    return basic + allowances - deductions;
  };

  const handleAdd = async () => {
    try {
      const netSalary = calculateNetSalary();
      const response = await fetch("/api/paymanager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Employee_Id: Number(formData.Employee_Id),
          Employee_Name: formData.Employee_Name,
          Department: formData.Department,
          Grade_Name: formData.Grade_Name,
          Basic_Salary: Number(formData.Basic_Salary),
          Allowances: Number(formData.Allowances),
          Deductions: Number(formData.Deductions),
          Net_Salary: netSalary,
          Pay_Date: formData.Pay_Date,
          Pay_Status: formData.Pay_Status,
        }),
      });

      if (response.ok) {
        showToast("Success", "Pay record added successfully");
        setIsAddModalOpen(false);
        resetForm();
        fetchPayRecords();
      }
    } catch (error) {
      showToast("Error", "Failed to add pay record", "destructive");
    }
  };

  const handleEdit = async () => {
    if (!selectedRecord) return;

    try {
      const netSalary = calculateNetSalary();
      const response = await fetch(`/api/paymanager/${selectedRecord.Pay_Id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Employee_Id: Number(formData.Employee_Id),
          Employee_Name: formData.Employee_Name,
          Department: formData.Department,
          Grade_Name: formData.Grade_Name,
          Basic_Salary: Number(formData.Basic_Salary),
          Allowances: Number(formData.Allowances),
          Deductions: Number(formData.Deductions),
          Net_Salary: netSalary,
          Pay_Date: formData.Pay_Date,
          Pay_Status: formData.Pay_Status,
        }),
      });

      if (response.ok) {
        showToast("Success", "Pay record updated successfully");
        setIsEditModalOpen(false);
        setSelectedRecord(null);
        resetForm();
        fetchPayRecords();
      }
    } catch (error) {
      showToast("Error", "Failed to update pay record", "destructive");
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;

    try {
      const response = await fetch(`/api/paymanager/${selectedRecord.Pay_Id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Success", "Pay record deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedRecord(null);
        fetchPayRecords();
      }
    } catch (error) {
      showToast("Error", "Failed to delete pay record", "destructive");
    }
  };

  const openEditModal = (record: PayManager) => {
    setSelectedRecord(record);
    setFormData({
      Employee_Id: record.Employee_Id.toString(),
      Employee_Name: record.Employee_Name,
      Department: record.Department,
      Grade_Name: record.Grade_Name,
      Basic_Salary: record.Basic_Salary.toString(),
      Allowances: record.Allowances.toString(),
      Deductions: record.Deductions.toString(),
      Pay_Date: record.Pay_Date,
      Pay_Status: record.Pay_Status,
    });
    setIsEditModalOpen(true);
    setOpenDropdown(null);
  };

  const openDeleteModal = (record: PayManager) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
    setOpenDropdown(null);
  };

  const resetForm = () => {
    setFormData({
      Employee_Id: "",
      Employee_Name: "",
      Department: "",
      Grade_Name: "",
      Basic_Salary: "",
      Allowances: "",
      Deductions: "",
      Pay_Date: "",
      Pay_Status: "Pending",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Paid":
        return <CheckCircle className="w-3 h-3" />;
      case "Pending":
        return <Clock className="w-3 h-3" />;
      case "Processing":
        return <TrendingUp className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Pay Manager
                </h1>
                <p className="text-slate-600 text-sm mt-1">
                  Manage employee salaries and payment records
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Add Payment
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Records
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {payRecords.length}
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span className="text-emerald-600 font-medium">
                    {stats.totalPaid} Paid
                  </span>
                  <span className="text-amber-600 font-medium">
                    {stats.totalPending} Pending
                  </span>
                  <span className="text-blue-600 font-medium">
                    {stats.totalProcessing} Processing
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Total Net Salary
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  ${stats.totalNetSalary.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-3">
                  For filtered records
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">
                  Allowances & Deductions
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold text-emerald-600">
                    +${stats.totalAllowances.toLocaleString()}
                  </span>
                  <span className="text-xl font-bold text-red-600">
                    -${stats.totalDeductions.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-3">Total adjustments</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by employee, department, or grade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                {["All", "Paid", "Pending", "Processing"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterStatus === status
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    <button
                      onClick={() => handleSort("Employee_Name")}
                      className="flex items-center gap-2 hover:text-purple-600 transition-colors"
                    >
                      Employee
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    <button
                      onClick={() => handleSort("Department")}
                      className="flex items-center gap-2 hover:text-purple-600 transition-colors"
                    >
                      Department
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Grade
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    <button
                      onClick={() => handleSort("Basic_Salary")}
                      className="flex items-center gap-2 hover:text-purple-600 transition-colors"
                    >
                      Basic Salary
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Allowances
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Deductions
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    <button
                      onClick={() => handleSort("Net_Salary")}
                      className="flex items-center gap-2 hover:text-purple-600 transition-colors"
                    >
                      Net Salary
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Pay Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Status
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
                      {Array.from({ length: 10 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-5 bg-slate-200 rounded animate-pulse w-24"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <AnimatePresence>
                    {filteredAndSortedRecords.map((record, index) => (
                      <motion.tr
                        key={record.Pay_Id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {record.Employee_Name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {record.Employee_Name}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {record.Employee_Id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Building className="w-4 h-4 text-slate-400" />
                            {record.Department}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700 font-medium">
                            {record.Grade_Name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-slate-900">
                            ${record.Basic_Salary.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-emerald-600">
                            +${record.Allowances.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-red-600">
                            -${record.Deductions.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-purple-600">
                            ${record.Net_Salary.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(record.Pay_Date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              record.Pay_Status
                            )}`}
                          >
                            {getStatusIcon(record.Pay_Status)}
                            {record.Pay_Status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative inline-block">
                            <button
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === record.Pay_Id
                                    ? null
                                    : record.Pay_Id
                                )
                              }
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {openDropdown === record.Pay_Id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                                <button
                                  onClick={() => openEditModal(record)}
                                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 rounded-t-lg"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => openDeleteModal(record)}
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
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Add Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">
                Add Payment Record
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Create a new employee payment record
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Employee ID
                  </label>
                  <input
                    type="number"
                    placeholder="Enter employee ID"
                    value={formData.Employee_Id}
                    onChange={(e) =>
                      setFormData({ ...formData, Employee_Id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter employee name"
                    value={formData.Employee_Name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Employee_Name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Engineering"
                    value={formData.Department}
                    onChange={(e) =>
                      setFormData({ ...formData, Department: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Allowances
                  </label>
                  <input
                    type="number"
                    placeholder="2000"
                    value={formData.Allowances}
                    onChange={(e) =>
                      setFormData({ ...formData, Allowances: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Deductions
                  </label>
                  <input
                    type="number"
                    placeholder="500"
                    value={formData.Deductions}
                    onChange={(e) =>
                      setFormData({ ...formData, Deductions: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Pay Date
                  </label>
                  <input
                    type="date"
                    value={formData.Pay_Date}
                    onChange={(e) =>
                      setFormData({ ...formData, Pay_Date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Pay Status
                  </label>
                  <select
                    value={formData.Pay_Status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Pay_Status: e.target.value as
                          | "Paid"
                          | "Pending"
                          | "Processing",
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Net Salary Preview */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Calculated Net Salary:
                  </span>
                  <span className="text-xl font-bold text-purple-600">
                    ${calculateNetSalary().toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Basic Salary + Allowances - Deductions
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Add Payment
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-slate-900">
                Edit Payment Record
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Update employee payment record for{" "}
                {selectedRecord?.Employee_Name}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Employee ID
                  </label>
                  <input
                    type="number"
                    value={formData.Employee_Id}
                    onChange={(e) =>
                      setFormData({ ...formData, Employee_Id: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={formData.Employee_Name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Employee_Name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.Department}
                    onChange={(e) =>
                      setFormData({ ...formData, Department: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Allowances
                  </label>
                  <input
                    type="number"
                    value={formData.Allowances}
                    onChange={(e) =>
                      setFormData({ ...formData, Allowances: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Deductions
                  </label>
                  <input
                    type="number"
                    value={formData.Deductions}
                    onChange={(e) =>
                      setFormData({ ...formData, Deductions: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Pay Date
                  </label>
                  <input
                    type="date"
                    value={formData.Pay_Date}
                    onChange={(e) =>
                      setFormData({ ...formData, Pay_Date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Pay Status
                  </label>
                  <select
                    value={formData.Pay_Status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Pay_Status: e.target.value as
                          | "Paid"
                          | "Pending"
                          | "Processing",
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              {/* Net Salary Preview */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    Calculated Net Salary:
                  </span>
                  <span className="text-xl font-bold text-purple-600">
                    ${calculateNetSalary().toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Basic Salary + Allowances - Deductions
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedRecord(null);
                  resetForm();
                }}
                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Update Payment
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
                Delete Payment Record
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                This action cannot be undone
              </p>
            </div>
            <div className="p-6">
              <p className="text-slate-700">
                Are you sure you want to delete the payment record for{" "}
                <span className="font-semibold text-slate-900">
                  {selectedRecord?.Employee_Name}
                </span>
                ? This will permanently remove the record from the system.
              </p>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedRecord(null);
                }}
                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete Record
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-4 rounded-lg shadow-lg border ${
                toast.variant === "destructive"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-3">
                {toast.variant === "destructive" ? (
                  <X className="w-5 h-5 text-red-600" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                )}
                <div>
                  <p className="font-medium">{toast.title}</p>
                  <p className="text-sm opacity-90">{toast.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
