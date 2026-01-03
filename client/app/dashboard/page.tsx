'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { salarySlipAPI, expenseAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [salarySlips, setSalarySlips] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchData();
  }, [user, authLoading, router]);

  const fetchData = async () => {
    // Guard: Don't fetch if no user
    if (!user) {
      return;
    }

    try {
      const [slipsRes, expensesRes] = await Promise.all([
        salarySlipAPI.getAll(),
        expenseAPI.getAll(),
      ]);
      setSalarySlips(slipsRes.data.salarySlips);
      setExpenses(expensesRes.data.expenses);
    } catch (error: any) {
      // If 401, the interceptor will handle redirect
      if (error.response?.status !== 401) {
        console.error('Failed to fetch data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (id: string) => {
    try {
      const response = await salarySlipAPI.exportPDF(id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salary-slip-${id}.pdf`;
      a.click();
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF');
    }
  };

  // Prepare chart data
  const salaryChartData = salarySlips
    .map((slip) => ({
      month: slip.month,
      netSalary: slip.netSalary,
      basicSalary: slip.basicSalary,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const expenseChartData = expenses
    .reduce((acc: any[], expense: any) => {
      const existing = acc.find((item) => item.month === expense.month);
      if (existing) {
        existing.amount += expense.amount;
      } else {
        acc.push({ month: expense.month, amount: expense.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => a.month.localeCompare(b.month));

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Dashboard</h1>
          {user?.role === 'employee' && (
            <a
              href="/expenses"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl font-medium"
            >
              Submit Expense
            </a>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out border border-gray-100 hover:border-blue-200">
            <h2 className="text-xl font-bold text-black mb-4">Salary History</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salaryChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="netSalary" stroke="#8884d8" name="Net Salary" strokeWidth={2} />
                <Line type="monotone" dataKey="basicSalary" stroke="#82ca9d" name="Basic Salary" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 ease-in-out border border-gray-100 hover:border-purple-200">
            <h2 className="text-xl font-bold text-black mb-4">Expense History</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" name="Total Expenses" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Slips Table */}
        <div className="bg-white shadow-lg rounded-lg mb-6 hover:shadow-2xl transition-shadow duration-300 ease-in-out border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-black">Salary Slips</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Basic Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allowances
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                  {user?.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salarySlips.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No salary slips found
                    </td>
                  </tr>
                ) : (
                  salarySlips.map((slip) => (
                    <tr 
                      key={slip._id}
                      className="hover:bg-blue-50 transition-colors duration-200 ease-in-out cursor-pointer transform hover:scale-[1.01]"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {slip.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${slip.basicSalary.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${slip.allowances.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${slip.deductions.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ${slip.netSalary.toFixed(2)}
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {slip.employeeId?.name || 'N/A'}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleExportPDF(slip._id)}
                          className="text-blue-600 hover:text-blue-900 font-medium transform hover:scale-110 transition-transform duration-200 ease-in-out hover:underline"
                        >
                          Export PDF
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white shadow-lg rounded-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-black">Expense History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {user?.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No expenses found
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr 
                      key={expense._id}
                      className="hover:bg-purple-50 transition-colors duration-200 ease-in-out cursor-pointer transform hover:scale-[1.01]"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {expense.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize font-medium">
                        {expense.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        ${expense.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transform hover:scale-110 transition-transform duration-200 ease-in-out ${
                            expense.status === 'approved'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : expense.status === 'rejected'
                              ? 'bg-red-100 text-red-800 hover:bg-red-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          }`}
                        >
                          {expense.status}
                        </span>
                      </td>
                      {user?.role === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.employeeId?.name || 'N/A'}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

