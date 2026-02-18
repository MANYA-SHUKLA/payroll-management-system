'use client';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { salarySlipAPI, expenseAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);
  const [showRejectionPopup, setShowRejectionPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSalarySuccessPopup, setShowSalarySuccessPopup] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    employeeEmail: '',
    month: '',
    basicSalary: '',
    allowances: '',
    deductions: '',
  });
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const expensesRes = await expenseAPI.getAll();
      setExpenses(expensesRes.data.expenses.filter((e: any) => e.status === 'pending'));
      const employeeMap = new Map();
      expensesRes.data.expenses.forEach((expense: any) => {
        if (expense.employeeId && !employeeMap.has(expense.employeeId._id)) {
          employeeMap.set(expense.employeeId._id, expense.employeeId);
        }
      });
      setEmployees(Array.from(employeeMap.values()));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCreateSalarySlip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await salarySlipAPI.create({
        employeeEmail: salaryForm.employeeEmail,
        month: salaryForm.month,
        basicSalary: parseFloat(salaryForm.basicSalary),
        allowances: parseFloat(salaryForm.allowances) || 0,
        deductions: parseFloat(salaryForm.deductions) || 0,
      });
      setShowSalaryForm(false);
      setSalaryForm({
        employeeEmail: '',
        month: '',
        basicSalary: '',
        allowances: '',
        deductions: '',
      });
      setShowSalarySuccessPopup(true);
      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowSalarySuccessPopup(false);
      }, 3000);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to create salary slip';
      setErrorMessage(errorMsg);
    }
  };

  const handleApproveExpense = async (id: string) => {
    try {
      await expenseAPI.approve(id);
      setShowApprovalPopup(true);
      fetchData();
      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowApprovalPopup(false);
      }, 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve expense');
    }
  };

  const handleRejectExpense = async (id: string) => {
    try {
      await expenseAPI.reject(id, rejectionReason);
      setShowExpenseModal(null);
      setRejectionReason('');
      setShowRejectionPopup(true);
      fetchData();
      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowRejectionPopup(false);
      }, 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject expense');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Admin Panel</h1>
          <button
            onClick={() => setShowSalaryForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl font-medium"
          >
            Create Salary Slip
          </button>
        </div>

        {/* Create Salary Slip Modal */}
        {showSalaryForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-96 shadow-2xl rounded-lg bg-white transform transition-all duration-300 ease-in-out animate-in fade-in zoom-in">
              <h3 className="text-lg font-bold text-black mb-4">Create Salary Slip</h3>
              <form onSubmit={handleCreateSalarySlip}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out hover:border-blue-400"
                    placeholder="shuklamanya99@gmail.com"
                    value={salaryForm.employeeEmail}
                    onChange={(e) => setSalaryForm({ ...salaryForm, employeeEmail: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    required
                    pattern="\d{4}-\d{2}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out hover:border-blue-400"
                    placeholder="2025-01"
                    value={salaryForm.month}
                    onChange={(e) => setSalaryForm({ ...salaryForm, month: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Basic Salary
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out hover:border-blue-400"
                    value={salaryForm.basicSalary}
                    onChange={(e) => setSalaryForm({ ...salaryForm, basicSalary: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allowances
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out hover:border-blue-400"
                    value={salaryForm.allowances}
                    onChange={(e) => setSalaryForm({ ...salaryForm, allowances: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deductions
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out hover:border-blue-400"
                    value={salaryForm.deductions}
                    onChange={(e) => setSalaryForm({ ...salaryForm, deductions: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowSalaryForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-bold text-black transform hover:scale-105 transition-all duration-200 ease-in-out hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg font-medium"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pending Expenses */}
        <div className="bg-white shadow-lg rounded-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl font-bold text-black">Pending Expenses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No pending expenses
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr 
                      key={expense._id}
                      className="hover:bg-indigo-50 transition-colors duration-200 ease-in-out cursor-pointer transform hover:scale-[1.01]"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {expense.employeeId?.name || 'N/A'}
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() => handleApproveExpense(expense._id)}
                          className="text-green-600 hover:text-green-900 font-medium transform hover:scale-110 transition-transform duration-200 ease-in-out hover:underline px-2 py-1 rounded hover:bg-green-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setShowExpenseModal(expense._id)}
                          className="text-red-600 hover:text-red-900 font-medium transform hover:scale-110 transition-transform duration-200 ease-in-out hover:underline px-2 py-1 rounded hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reject Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-96 shadow-2xl rounded-lg bg-white transform transition-all duration-300 ease-in-out animate-in fade-in zoom-in">
              <h3 className="text-lg font-bold text-black mb-4">Reject Expense</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ease-in-out hover:border-red-400"
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowExpenseModal(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 font-bold text-black transform hover:scale-105 transition-all duration-200 ease-in-out hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectExpense(showExpenseModal)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transform hover:scale-105 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approval Success Popup */}
        {showApprovalPopup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Expense Approved!</h3>
                <p className="text-sm text-gray-600 mb-4">The expense has been successfully approved.</p>
                <button
                  onClick={() => setShowApprovalPopup(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Popup */}
        {errorMessage && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Error</h3>
                <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Salary Slip Success Popup */}
        {showSalarySuccessPopup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Salary Slip Created Successfully!</h3>
                <p className="text-sm text-gray-600 mb-4">The salary slip has been created and the employee has been notified.</p>
                <button
                  onClick={() => setShowSalarySuccessPopup(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Success Popup */}
        {showRejectionPopup && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-96 shadow-lg rounded-md bg-white">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">Expense Rejected!</h3>
                <p className="text-sm text-gray-600 mb-4">The expense has been rejected and the employee has been notified.</p>
                <button
                  onClick={() => setShowRejectionPopup(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

