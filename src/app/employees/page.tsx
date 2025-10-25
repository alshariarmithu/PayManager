"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Briefcase,
  PlusCircle,
  CalendarDays,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  X,
  Filter,
  Mail,
  DollarSign,
  Award,
} from "lucide-react";

interface Employee {
  Employee_Id: number;
  User_Name: string;
  Dept_Name: string;
  Grade_Name: string;
  Hire_Date: string;
}

interface Department {
  id: number;
  name: string;
}

interface Grade {
  id: number;
  name: string;
  basicSalary: number;
  bonus: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

type SortField = keyof Employee;
type SortOrder = "asc" | "desc";

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
  >
    {children}
  </div>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  disabled?: boolean;
}) => {
  const variants = {
    primary:
      "bg-[var(--color-primary)] text-white hover:bg-[var(--color-secondary)] shadow-sm",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    ghost: "text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({
  placeholder,
  value,
  onChange,
  className = "",
  icon: Icon,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  icon?: any;
}) => (
  <div className={`relative ${className}`}>
    {Icon && (
      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
    )}
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
        Icon ? "pl-10" : ""
      }`}
    />
  </div>
);

const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: string;
}) => {
  const variants: Record<string, string> = {
    default: "bg-gray-100 text-gray-700",
    Senior: "bg-purple-100 text-purple-700",
    Manager: "bg-blue-100 text-blue-700",
    Lead: "bg-green-100 text-green-700",
    Associate: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        variants[variant] || variants.default
      }`}
    >
      {children}
    </span>
  );
};

const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "md" | "lg";
}) => {
  const sizeClasses = {
    md: "max-w-md",
    lg: "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full ${sizeClasses[size]} p-6 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const DropdownMenu = ({
  trigger,
  items,
}: {
  trigger: React.ReactNode;
  items: { label: string; icon: any; onClick: () => void; danger?: boolean }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
            >
              {items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      item.danger ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const Table = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="w-full">{children}</table>
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-gray-50 border-b border-gray-200">{children}</thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);

const TableRow = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <tr
    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${className}`}
  >
    {children}
  </tr>
);

const TableHead = ({
  children,
  onClick,
  sortable = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  sortable?: boolean;
}) => (
  <th
    onClick={onClick}
    className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
      sortable ? "cursor-pointer hover:bg-gray-100" : ""
    }`}
  >
    {children}
  </th>
);

const TableCell = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <td className={`px-6 py-4 text-sm text-gray-900 ${className}`}>{children}</td>
);

const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="animate-pulse flex items-center gap-4 px-6 py-4 border-b border-gray-100"
      >
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    ))}
  </div>
);

const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2`}
    >
      <span className="font-medium">{message}</span>
      <button
        onClick={onClose}
        className="hover:bg-white hover:bg-opacity-20 rounded p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("Employee_Id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [viewDetails, setViewDetails] = useState<any>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const [newEmployee, setNewEmployee] = useState({
    userId: "",
    deptId: "",
    gradeId: "",
    hireDate: "",
  });

  const [editEmployee, setEditEmployee] = useState({
    userId: "",
    deptId: "",
    gradeId: "",
    hireDate: "",
  });

  useEffect(() => {
    fetchEmployees();
    fetchDropdownData();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      showToast("Failed to fetch employees", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    setDropdownLoading(true);
    try {
      const [deptsResponse, gradesResponse, usersResponse] = await Promise.all([
        fetch("http://localhost:5001/api/employees/departments"),
        fetch("http://localhost:5001/api/employees/grades"),
        fetch("http://localhost:5001/api/employees/users/employees"),
      ]);

      if (!deptsResponse.ok || !gradesResponse.ok || !usersResponse.ok) {
        throw new Error("Failed to fetch dropdown data");
      }

      const deptsData = await deptsResponse.json();
      const gradesData = await gradesResponse.json();
      const usersData = await usersResponse.json();

      setDepartments(deptsData);
      setGrades(gradesData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      showToast("Failed to fetch dropdown data", "error");
    } finally {
      setDropdownLoading(false);
    }
  };

  // const fetchEmployeeDetails = async (id: number) => {
  //   try {
  //     const response = await fetch(
  //       `http://localhost:5001/api/employees/${id}`
  //     );
  //     if (!response.ok) throw new Error("Failed to fetch employee details");
  //     const data = await response.json();
  //     setViewDetails(data);
  //   } catch (error) {
  //     console.error("Error fetching employee details:", error);
  //     showToast("Failed to fetch employee details", "error");
  //   }
  // };

  const departmentOptions = useMemo(() => {
    const depts = ["All", ...new Set(employees.map((e) => e.Dept_Name))];
    return depts;
  }, [employees]);

  const filteredAndSortedEmployees = useMemo(() => {
    let filtered = employees.filter((emp) => {
      const matchesSearch =
        emp.User_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.Dept_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.Grade_Name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = deptFilter === "All" || emp.Dept_Name === deptFilter;
      return matchesSearch && matchesDept;
    });

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [employees, searchQuery, deptFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
  };

  const handleAddEmployee = async () => {
    if (
      !newEmployee.userId ||
      !newEmployee.deptId ||
      !newEmployee.gradeId ||
      !newEmployee.hireDate
    ) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(newEmployee.userId),
          deptId: parseInt(newEmployee.deptId),
          gradeId: parseInt(newEmployee.gradeId),
          hireDate: newEmployee.hireDate,
        }),
      });

      if (!response.ok) throw new Error("Failed to add employee");

      await fetchEmployees();
      setIsAddModalOpen(false);
      setNewEmployee({
        userId: "",
        deptId: "",
        gradeId: "",
        hireDate: "",
      });
      showToast("Employee added successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to add employee", "error");
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/employees/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete employee");
      await fetchEmployees();
      showToast("Employee deleted successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to delete employee", "error");
    }
  };

  // const handleViewEmployee = async (emp: Employee) => {
  //   setSelectedEmployee(emp);
  //   setViewDetails(null);
  //   setIsViewModalOpen(true);
  //   await fetchEmployeeDetails(emp.Employee_Id);
  // };

  const handleEditEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);

    // Find the user, department, and grade IDs from the dropdown data
    const user = users.find((u) => u.name === emp.User_Name);
    const dept = departments.find((d) => d.name === emp.Dept_Name);
    const grade = grades.find((g) => g.name === emp.Grade_Name);

    setEditEmployee({
      userId: user?.id.toString() || "",
      deptId: dept?.id.toString() || "",
      gradeId: grade?.id.toString() || "",
      hireDate: emp.Hire_Date.split("T")[0],
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (
      !editEmployee.userId ||
      !editEmployee.deptId ||
      !editEmployee.gradeId ||
      !editEmployee.hireDate ||
      !selectedEmployee
    ) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/employees/${selectedEmployee.Employee_Id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: parseInt(editEmployee.userId),
            deptId: parseInt(editEmployee.deptId),
            gradeId: parseInt(editEmployee.gradeId),
            hireDate: editEmployee.hireDate,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update employee");

      await fetchEmployees();
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
      showToast("Employee updated successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to update employee", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Employees
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Total: {employees.length} employees</span>
              </p>
            </div>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              Add Employee
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={setSearchQuery}
                icon={Search}
                className="flex-1"
              />
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept === "All" ? "All Departments" : dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSort("Employee_Id")}
                      sortable
                    >
                      ID{" "}
                      {sortField === "Employee_Id" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead onClick={() => handleSort("User_Name")} sortable>
                      Name{" "}
                      {sortField === "User_Name" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead onClick={() => handleSort("Dept_Name")} sortable>
                      Department{" "}
                      {sortField === "Dept_Name" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("Grade_Name")}
                      sortable
                    >
                      Grade{" "}
                      {sortField === "Grade_Name" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead onClick={() => handleSort("Hire_Date")} sortable>
                      Hire Date{" "}
                      {sortField === "Hire_Date" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredAndSortedEmployees.map((emp) => (
                      <motion.tr
                        key={emp.Employee_Id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="font-medium">
                          #{emp.Employee_Id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white font-semibold">
                              {emp.User_Name.charAt(0)}
                            </div>
                            <span className="font-medium">{emp.User_Name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-gray-400" />
                            {emp.Dept_Name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={emp.Grade_Name}>
                            {emp.Grade_Name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-600">
                            <CalendarDays className="w-4 h-4" />
                            {new Date(emp.Hire_Date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu
                            trigger={
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreVertical className="w-5 h-5 text-gray-600" />
                              </button>
                            }
                            items={[
                              {
                                label: "Edit",
                                icon: Edit,
                                onClick: () => handleEditEmployee(emp),
                              },
                              {
                                label: "Delete",
                                icon: Trash2,
                                onClick: () =>
                                  handleDeleteEmployee(emp.Employee_Id),
                                danger: true,
                              },
                            ]}
                          />
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
            {!loading && filteredAndSortedEmployees.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No employees found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Add Employee Modal */}
      <Dialog
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Employee"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={newEmployee.userId}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, userId: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              disabled={dropdownLoading}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {dropdownLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading users...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={newEmployee.deptId}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, deptId: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              disabled={dropdownLoading}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {dropdownLoading && (
              <p className="text-xs text-gray-500 mt-1">
                Loading departments...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <select
              value={newEmployee.gradeId}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, gradeId: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              disabled={dropdownLoading}
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name} (Salary: ${grade.basicSalary})
                </option>
              ))}
            </select>
            {dropdownLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading grades...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hire Date
            </label>
            <input
              type="date"
              value={newEmployee.hireDate}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, hireDate: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAddEmployee}
              className="flex-1"
              disabled={dropdownLoading}
            >
              {dropdownLoading ? "Loading..." : "Add Employee"}
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>

      {/* View Employee Modal */}
      <Dialog
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedEmployee(null);
          setViewDetails(null);
        }}
        title="Employee Details"
        size="lg"
      >
        {!viewDetails ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Employee Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-white text-2xl font-bold">
                {selectedEmployee?.User_Name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedEmployee?.User_Name}
                </h3>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {viewDetails.email}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Employee ID</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  #{selectedEmployee?.Employee_Id}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-sm font-medium">Department</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedEmployee?.Dept_Name}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">Grade</span>
                </div>
                <Badge variant={selectedEmployee?.Grade_Name || "default"}>
                  {selectedEmployee?.Grade_Name}
                </Badge>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <CalendarDays className="w-4 h-4" />
                  <span className="text-sm font-medium">Hire Date</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedEmployee &&
                    new Date(selectedEmployee.Hire_Date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                </p>
              </div>
            </div>

            {/* Salary Information */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Salary Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Basic Salary</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${viewDetails.basicSalary?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bonus</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${viewDetails.bonus?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsViewModalOpen(false);
                  if (selectedEmployee) {
                    handleEditEmployee(selectedEmployee);
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Employee
              </Button>
              <Button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedEmployee(null);
                  setViewDetails(null);
                }}
                variant="secondary"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Edit Employee Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        title={`Edit Employee: ${selectedEmployee?.User_Name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <select
              value={editEmployee.userId}
              onChange={(e) =>
                setEditEmployee({ ...editEmployee, userId: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              disabled={dropdownLoading}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {dropdownLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading users...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={editEmployee.deptId}
              onChange={(e) =>
                setEditEmployee({ ...editEmployee, deptId: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              disabled={dropdownLoading}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {dropdownLoading && (
              <p className="text-xs text-gray-500 mt-1">
                Loading departments...
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <select
              value={editEmployee.gradeId}
              onChange={(e) =>
                setEditEmployee({ ...editEmployee, gradeId: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              disabled={dropdownLoading}
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name} (Salary: ${grade.basicSalary})
                </option>
              ))}
            </select>
            {dropdownLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading grades...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hire Date
            </label>
            <input
              type="date"
              value={editEmployee.hireDate}
              onChange={(e) =>
                setEditEmployee({ ...editEmployee, hireDate: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpdateEmployee}
              className="flex-1"
              disabled={dropdownLoading}
            >
              {dropdownLoading ? "Loading..." : "Update Employee"}
            </Button>
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedEmployee(null);
              }}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
