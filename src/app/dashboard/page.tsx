"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";

import {
  Users,
  UserCheck,
  Building2,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/dashboard");
        setData(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!data) return <div className="p-6 text-center">No data available</div>;

  const stats = {
    totalUsers: data.totalUsers ?? 0,
    totalEmployees: data.totalEmployees ?? 0,
    totalDepartments: data.totalDepartments ?? 0,
    totalSalariesPaid: data.totalSalariesPaid ?? 0,
  };

  const salariesByDept = Array.isArray(data.salariesByDept)
    ? data.salariesByDept
    : [];

  const employeesByGrade = Array.isArray(data.employeesByGrade)
    ? data.employeesByGrade
    : [];

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      gradient: "from-emerald-400 to-emerald-600",
      bgColor: "#609966",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Total Employees",
      value: stats.totalEmployees.toLocaleString(),
      icon: UserCheck,
      gradient: "from-emerald-500 to-emerald-700",
      bgColor: "#40513b",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Total Departments",
      value: stats.totalDepartments.toString(),
      icon: Building2,
      gradient: "from-emerald-300 to-emerald-500",
      bgColor: "#9dc08b",
      change: "0%",
      trend: "neutral",
    },
    {
      title: "Total Salaries Paid",
      value: `$${stats.totalSalariesPaid.toFixed(1)}`,
      icon: DollarSign,
      gradient: "from-emerald-600 to-emerald-800",
      bgColor: "#40513b",
      change: "+15%",
      trend: "up",
    },
  ];

  const COLORS = ["#609966", "#40513b", "#9dc08b", "#edf1d6", "#7a8471"];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-emerald-600 font-medium">
            {`Total: $${payload[0].value.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-2xl border border-gray-100">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-emerald-600 font-medium">
            {`Count: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 border border-gray-50 rounded-lg"
        style={{
          background: `linear-gradient(135deg, #fafcf7 0%, #f4f8eb 100%)`,
        }}
      >
        <div
          className="fixed top-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ backgroundColor: "#9dc08b" }}
        ></div>
        <div
          className="fixed bottom-0 right-0 w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none"
          style={{ backgroundColor: "#609966" }}
        ></div>

        <div className="relative z-10 max-w-7xl mx-auto space-y-5">
          {/* Header */}
          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1
                  className="text-3xl sm:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r"
                  style={{
                    backgroundImage: `linear-gradient(135deg, #40513b 0%, #609966 100%)`,
                  }}
                >
                  Dashboard Overview
                </h1>
                <p className="text-lg text-gray-600 font-medium">
                  Welcome back to PayManager
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                <TrendingUp className="w-6 h-6" style={{ color: "#609966" }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#40513b" }}
                >
                  All metrics trending up
                </span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl p-6 backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderColor: "rgba(157, 192, 139, 0.3)",
                    boxShadow: "0 8px 32px rgba(64, 81, 59, 0.1)",
                  }}
                >
                  {/* Background gradient */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-xl"
                    style={{ backgroundColor: stat.bgColor }}
                  ></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className="text-sm font-semibold tracking-wide uppercase opacity-70"
                          style={{ color: "#40513b" }}
                        >
                          {stat.title}
                        </p>
                        <p
                          className="text-3xl font-bold mt-2 mb-3"
                          style={{ color: "#40513b" }}
                        >
                          {stat.value}
                        </p>
                        <div className="flex items-center space-x-1">
                          <ArrowUpRight
                            className={`w-4 h-4 ${
                              stat.trend === "up"
                                ? "text-emerald-500"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              stat.trend === "up"
                                ? "text-emerald-500"
                                : "text-gray-400"
                            }`}
                          >
                            {stat.change} from last month
                          </span>
                        </div>
                      </div>
                      <div
                        className="p-4 rounded-2xl shadow-lg transform transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: stat.bgColor }}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Salaries by Department */}
            <div
              className="rounded-3xl p-8 backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderColor: "rgba(157, 192, 139, 0.3)",
                boxShadow: "0 8px 32px rgba(64, 81, 59, 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "#40513b" }}
                  >
                    Salary Distribution
                  </h2>
                  <p className="text-gray-600 mt-1">By department breakdown</p>
                </div>
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "rgba(96, 153, 102, 0.1)" }}
                >
                  <TrendingUp
                    className="w-6 h-6"
                    style={{ color: "#609966" }}
                  />
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salariesByDept}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#edf1d6" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#40513b" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#40513b" }}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toLocaleString()}k`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      fill="#609966"
                      radius={[8, 8, 0, 0]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Employees by Grade */}
            <div
              className="rounded-3xl p-8 backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderColor: "rgba(157, 192, 139, 0.3)",
                boxShadow: "0 8px 32px rgba(64, 81, 59, 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "#40513b" }}
                  >
                    Employee Grades
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Distribution by seniority
                  </p>
                </div>
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: "rgba(96, 153, 102, 0.1)" }}
                >
                  <Users className="w-6 h-6" style={{ color: "#609966" }} />
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={employeesByGrade}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={3}
                    >
                      {employeesByGrade.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "Average Salary",
                value: stats.totalSalariesPaid / stats.totalEmployees,
                change: "+3.2%",
              },
              { label: "Department Growth", value: "2 New", change: "+20%" },
              { label: "Employee Satisfaction", value: "94%", change: "+1.5%" },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl backdrop-blur-sm border"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  borderColor: "rgba(157, 192, 139, 0.3)",
                }}
              >
                <p
                  className="text-sm font-semibold uppercase tracking-wide opacity-70"
                  style={{ color: "#40513b" }}
                >
                  {item.label}
                </p>
                <p
                  className="text-2xl font-bold mt-2"
                  style={{ color: "#40513b" }}
                >
                  {item.value}
                </p>
                <p className="text-sm font-medium mt-1 text-emerald-500">
                  {item.change} this quarter
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
