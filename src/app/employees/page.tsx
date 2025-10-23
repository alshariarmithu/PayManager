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
} from "lucide-react";

// Types
interface Employee {
  Employee_Id: number;
  User_Name: string;
  Dept_Name: string;
  Grade_Name: string;
  Hire_Date: string;
}

type SortField = keyof Employee;
type SortOrder = "asc" | "desc";

// Mock Data
const mockEmployees: Employee[] = [
  {
    Employee_Id: 1,
    User_Name: "Sarah Johnson",
    Dept_Name: "Engineering",
    Grade_Name: "Senior",
    Hire_Date: "2021-03-15",
  },
  {
    Employee_Id: 2,
    User_Name: "Michael Chen",
    Dept_Name: "Marketing",
    Grade_Name: "Manager",
    Hire_Date: "2020-07-22",
  },
  {
    Employee_Id: 3,
    User_Name: "Emily Rodriguez",
    Dept_Name: "Sales",
    Grade_Name: "Associate",
    Hire_Date: "2023-01-10",
  },
  {
    Employee_Id: 4,
    User_Name: "David Kim",
    Dept_Name: "Engineering",
    Grade_Name: "Lead",
    Hire_Date: "2019-11-05",
  },
  {
    Employee_Id: 5,
    User_Name: "Jessica Taylor",
    Dept_Name: "HR",
    Grade_Name: "Manager",
    Hire_Date: "2022-05-18",
  },
];

// UI Components
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
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
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
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-md p-6"
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

// Main Component
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("Employee_Id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    User_Name: "",
    Dept_Name: "",
    Grade_Name: "",
    Hire_Date: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees, using mock data:", error);
      setEmployees(mockEmployees);
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
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

  const handleAddEmployee = () => {
    if (
      !newEmployee.User_Name ||
      !newEmployee.Dept_Name ||
      !newEmployee.Grade_Name ||
      !newEmployee.Hire_Date
    ) {
      showToast("Please fill all fields", "error");
      return;
    }

    const newEmp: Employee = {
      Employee_Id: Math.max(...employees.map((e) => e.Employee_Id), 0) + 1,
      ...newEmployee,
    };

    setEmployees([...employees, newEmp]);
    setIsAddModalOpen(false);
    setNewEmployee({
      User_Name: "",
      Dept_Name: "",
      Grade_Name: "",
      Hire_Date: "",
    });
    showToast("Employee added successfully", "success");
  };

  const handleDeleteEmployee = (id: number) => {
    setEmployees(employees.filter((e) => e.Employee_Id !== id));
    showToast("Employee deleted successfully", "success");
  };

  const handleViewEmployee = (emp: Employee) => {
    showToast(`Viewing ${emp.User_Name}`, "info");
  };

  const handleEditEmployee = (emp: Employee) => {
    showToast(`Editing ${emp.User_Name}`, "info");
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
                  {departments.map((dept) => (
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
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
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
                                label: "View",
                                icon: Eye,
                                onClick: () => handleViewEmployee(emp),
                              },
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
              Full Name
            </label>
            <Input
              placeholder="Enter full name"
              value={newEmployee.User_Name}
              onChange={(val) =>
                setNewEmployee({ ...newEmployee, User_Name: val })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <Input
              placeholder="Enter department"
              value={newEmployee.Dept_Name}
              onChange={(val) =>
                setNewEmployee({ ...newEmployee, Dept_Name: val })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <Input
              placeholder="Enter grade"
              value={newEmployee.Grade_Name}
              onChange={(val) =>
                setNewEmployee({ ...newEmployee, Grade_Name: val })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hire Date
            </label>
            <input
              type="date"
              value={newEmployee.Hire_Date}
              onChange={(e) =>
                setNewEmployee({ ...newEmployee, Hire_Date: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleAddEmployee} className="flex-1">
              Add Employee
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
