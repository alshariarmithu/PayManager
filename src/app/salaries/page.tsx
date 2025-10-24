"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Calendar,
  PlusCircle,
  Search,
  MoreVertical,
  ArrowUpDown,
  Filter,
  Edit,
  Trash2,
  Eye,
  X,
  ChevronDown,
} from "lucide-react";

interface Salary {
  Salary_Id: string;
  Employee_Name: string;
  Salary: number;
  Pay_Date: string;
}

interface Employee {
  id: number;
  name: string;
}

type SortField = "Employee_Name" | "Salary" | "Pay_Date";
type SortOrder = "asc" | "desc";

const toast = (message: string, type: "success" | "error" = "success") => {
  const toastEl = document.createElement("div");
  toastEl.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-medium transition-all duration-300 ${
    type === "success"
      ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
      : "bg-gradient-to-r from-red-500 to-red-600"
  }`;
  toastEl.textContent = message;
  document.body.appendChild(toastEl);
  setTimeout(() => {
    toastEl.style.opacity = "0";
    setTimeout(() => toastEl.remove(), 300);
  }, 2700);
};

const EmployeeDropdown = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (name: string) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/salaries/employees"
      );
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent flex items-center justify-between bg-white"
      >
        <span className={value ? "text-slate-900" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-hidden">
            <div className="p-2 border-b border-slate-200">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="overflow-y-auto max-h-48">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => {
                      onChange(emp.name);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-emerald-50 transition-colors"
                  >
                    {emp.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  No employees found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("Pay_Date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [formData, setFormData] = useState({
    Employee_Name: "",
    Salary: "",
    Pay_Date: "",
  });
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5001/api/salaries");

      if (!response.ok) {
        throw new Error("Failed to fetch salaries");
      }

      const data = await response.json();
      setSalaries(data);
    } catch (error) {
      console.error("Error fetching salaries:", error);
      toast("Failed to fetch salaries", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedSalaries = useMemo(() => {
    let filtered = salaries.filter((salary) => {
      const matchesSearch = salary.Employee_Name.toLowerCase().includes(
        searchQuery.toLowerCase()
      );
      const matchesDate = dateFilter
        ? salary.Pay_Date.startsWith(dateFilter)
        : true;
      return matchesSearch && matchesDate;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "Employee_Name") {
        comparison = a.Employee_Name.localeCompare(b.Employee_Name);
      } else if (sortField === "Salary") {
        comparison = a.Salary - b.Salary;
      } else if (sortField === "Pay_Date") {
        comparison =
          new Date(a.Pay_Date).getTime() - new Date(b.Pay_Date).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [salaries, searchQuery, dateFilter, sortField, sortOrder]);

  const totalPayouts = useMemo(
    () => salaries.reduce((sum, salary) => sum + salary.Salary, 0),
    [salaries]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleAddSalary = async () => {
    if (!formData.Employee_Name || !formData.Salary || !formData.Pay_Date) {
      toast("Please fill all fields", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/salaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create salary");
      }

      const newSalary = await response.json();
      setSalaries([...salaries, newSalary]);
      setIsAddModalOpen(false);
      setFormData({ Employee_Name: "", Salary: "", Pay_Date: "" });
      toast("Salary record added successfully");
    } catch (error: any) {
      console.error("Error adding salary:", error);
      toast(error.message || "Failed to add salary", "error");
    }
  };

  const handleEditSalary = async () => {
    if (
      !selectedSalary ||
      !formData.Employee_Name ||
      !formData.Salary ||
      !formData.Pay_Date
    ) {
      toast("Please fill all fields", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/salaries/${selectedSalary.Salary_Id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update salary");
      }

      const updatedSalary = await response.json();
      setSalaries(
        salaries.map((s) =>
          s.Salary_Id === selectedSalary.Salary_Id ? updatedSalary : s
        )
      );
      setIsEditModalOpen(false);
      setSelectedSalary(null);
      setFormData({ Employee_Name: "", Salary: "", Pay_Date: "" });
      toast("Salary record updated successfully");
    } catch (error: any) {
      console.error("Error updating salary:", error);
      toast(error.message || "Failed to update salary", "error");
    }
  };

  const handleDeleteSalary = async (salaryId: string) => {
    if (!confirm("Are you sure you want to delete this salary record?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/salaries/${salaryId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete salary");
      }

      setSalaries(salaries.filter((s) => s.Salary_Id !== salaryId));
      setDropdownOpen(null);
      toast("Salary record deleted successfully");
    } catch (error: any) {
      console.error("Error deleting salary:", error);
      toast(error.message || "Failed to delete salary", "error");
    }
  };

  const handleViewSalary = (salary: Salary) => {
    setSelectedSalary(salary);
    setIsViewModalOpen(true);
    setDropdownOpen(null);
  };

  const openEditModal = (salary: Salary) => {
    setSelectedSalary(salary);
    setFormData({
      Employee_Name: salary.Employee_Name,
      Salary: salary.Salary.toString(),
      Pay_Date: salary.Pay_Date,
    });
    setIsEditModalOpen(true);
    setDropdownOpen(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-2xl shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              Salary Management
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Track and manage employee salary payments
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Salary
          </button>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">
                Total Payouts
              </p>
              <h2 className="text-5xl font-bold mt-2 mb-3">
                {formatCurrency(totalPayouts)}
              </h2>
              <p className="text-emerald-100 text-sm">
                {salaries.length} salary records
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
              <DollarSign className="w-16 h-16" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200/60">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2">
              <Calendar className="text-slate-400 w-5 h-5" />
              <input
                type="month"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-700"
              />
              {dateFilter && (
                <button
                  onClick={() => setDateFilter("")}
                  className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200/60">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="p-5 text-left font-semibold text-slate-700 text-sm uppercase tracking-wider">
                    Salary ID
                  </th>
                  <th
                    onClick={() => handleSort("Employee_Name")}
                    className="p-5 text-left font-semibold text-slate-700 text-sm uppercase tracking-wider cursor-pointer hover:bg-slate-200/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Employee Name
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("Salary")}
                    className="p-5 text-left font-semibold text-slate-700 text-sm uppercase tracking-wider cursor-pointer hover:bg-slate-200/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Salary
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("Pay_Date")}
                    className="p-5 text-left font-semibold text-slate-700 text-sm uppercase tracking-wider cursor-pointer hover:bg-slate-200/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Pay Date
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="p-5 text-right font-semibold text-slate-700 text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="p-5">
                          <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-20" />
                        </td>
                        <td className="p-5">
                          <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-32" />
                        </td>
                        <td className="p-5">
                          <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-24" />
                        </td>
                        <td className="p-5">
                          <div className="h-4 bg-slate-200 rounded-lg animate-pulse w-28" />
                        </td>
                        <td className="p-5">
                          <div className="h-8 bg-slate-200 rounded-lg animate-pulse w-8 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : filteredAndSortedSalaries.length > 0 ? (
                  filteredAndSortedSalaries.map((salary) => (
                    <tr
                      key={salary.Salary_Id}
                      className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all"
                    >
                      <td className="p-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-300">
                          {salary.Salary_Id}
                        </span>
                      </td>
                      <td className="p-5 font-medium text-slate-800">
                        {salary.Employee_Name}
                      </td>
                      <td className="p-5 font-bold text-emerald-600">
                        {formatCurrency(salary.Salary)}
                      </td>
                      <td className="p-5 text-slate-600">
                        {formatDate(salary.Pay_Date)}
                      </td>
                      <td className="p-5 text-right relative">
                        <button
                          onClick={() =>
                            setDropdownOpen(
                              dropdownOpen === salary.Salary_Id
                                ? null
                                : salary.Salary_Id
                            )
                          }
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-600" />
                        </button>
                        {dropdownOpen === salary.Salary_Id && (
                          <div className="absolute right-0 top-full mt-1 z-50 min-w-[10rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                            <button
                              onClick={() => handleViewSalary(salary)}
                              className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 transition-colors text-slate-700"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => openEditModal(salary)}
                              className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50 transition-colors text-slate-700"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteSalary(salary.Salary_Id)
                              }
                              className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-red-50 transition-colors text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <div className="text-center py-16 text-slate-500">
                        <Filter className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-semibold text-slate-700">
                          No salary records found
                        </p>
                        <p className="text-sm mt-2">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <div className="relative z-50 bg-white rounded-3xl max-w-md w-full shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl">
                    <PlusCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Add New Salary Record
                  </h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                      Employee Name
                    </label>
                    <EmployeeDropdown
                      value={formData.Employee_Name}
                      onChange={(name) =>
                        setFormData({ ...formData, Employee_Name: name })
                      }
                      placeholder="Select employee"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                      Salary Amount
                    </label>
                    <input
                      type="number"
                      placeholder="Enter salary amount"
                      value={formData.Salary}
                      onChange={(e) =>
                        setFormData({ ...formData, Salary: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                      Pay Date
                    </label>
                    <input
                      type="date"
                      value={formData.Pay_Date}
                      onChange={(e) =>
                        setFormData({ ...formData, Pay_Date: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setFormData({
                        Employee_Name: "",
                        Salary: "",
                        Pay_Date: "",
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-medium text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSalary}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all hover:scale-105"
                  >
                    Add Salary
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsEditModalOpen(false)}
            />
            <div className="relative z-50 bg-white rounded-3xl max-w-md w-full shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-2 rounded-xl">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Edit Salary Record
                  </h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                      Employee Name
                    </label>
                    <EmployeeDropdown
                      value={formData.Employee_Name}
                      onChange={(name) =>
                        setFormData({ ...formData, Employee_Name: name })
                      }
                      placeholder="Select employee"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                      Salary Amount
                    </label>
                    <input
                      type="number"
                      placeholder="Enter salary amount"
                      value={formData.Salary}
                      onChange={(e) =>
                        setFormData({ ...formData, Salary: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">
                      Pay Date
                    </label>
                    <input
                      type="date"
                      value={formData.Pay_Date}
                      onChange={(e) =>
                        setFormData({ ...formData, Pay_Date: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedSalary(null);
                      setFormData({
                        Employee_Name: "",
                        Salary: "",
                        Pay_Date: "",
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-medium text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSalary}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all hover:scale-105"
                  >
                    Update Salary
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Salary Modal */}
        {isViewModalOpen && selectedSalary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsViewModalOpen(false)}
            />
            <div className="relative z-50 bg-white rounded-3xl max-w-md w-full shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-slate-400 to-slate-600 p-2 rounded-xl">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Salary Details
                  </h2>
                </div>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                        Salary ID
                      </p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-300">
                        {selectedSalary.Salary_Id}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                        Pay Date
                      </p>
                      <p className="font-semibold text-slate-800">
                        {formatDate(selectedSalary.Pay_Date)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                      Employee Name
                    </p>
                    <p className="font-semibold text-lg text-slate-800">
                      {selectedSalary.Employee_Name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">
                      Salary Amount
                    </p>
                    <p className="font-bold text-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                      {formatCurrency(selectedSalary.Salary)}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setSelectedSalary(null);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-medium text-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
