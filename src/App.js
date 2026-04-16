import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FiPlus, FiTrash2, FiSun, FiMoon, FiEdit2 } from 'react-icons/fi';
import logo from './logo.png';

function App() {
  const [expenses, setExpenses] = useState(() => {
    return JSON.parse(localStorage.getItem('fintrack-expenses')) || [];
  });
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Food');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('fintrack-theme') === 'dark';
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [budget, setBudget] = useState(() => {
    return parseFloat(localStorage.getItem('fintrack-budget')) || 0;
  });
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('fintrack-currency') || 'Rs';
  });
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    localStorage.setItem('fintrack-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('fintrack-theme', darkMode? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('fintrack-budget', budget);
  }, [budget]);

  useEffect(() => {
    localStorage.setItem('fintrack-currency', currency);
  }, [currency]);

  const categories = [
    { name: 'Food', icon: '🍔', color: '#FF6B6B' },
    { name: 'Travel', icon: '✈️', color: '#4ECDC4' },
    { name: 'Bills', icon: '💡', color: '#FFE66D' },
    { name: 'Shopping', icon: '🛍️', color: '#FF8E53' },
    { name: 'Health', icon: '💊', color: '#A8E6CF' },
    { name: 'Other', icon: '📦', color: '#C7CEEA' }
  ];

  const addExpense = () => {
    if (!amount ||!note) return alert('Please enter amount and note');

    if (editingId) {
      setExpenses(expenses.map(exp =>
        exp.id === editingId
     ? {...exp, amount: parseFloat(amount), note, category }
          : exp
      ));
      setEditingId(null);
    } else {
      const newExpense = {
        id: Date.now(),
        amount: parseFloat(amount),
        note,
        category,
        date: new Date().toLocaleDateString()
      };
      setExpenses([newExpense,...expenses]);
    }
    setAmount('');
    setNote('');
    setCategory('Food');
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id!== id));
  };

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setAmount(exp.amount);
    setNote(exp.note);
    setCategory(exp.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportToCSV = () => {
    if (filteredExpenses.length === 0) return alert('No expenses to export!');

    let csv = `Date,Note,Category,Amount (${currency})\n`;
    filteredExpenses.forEach(exp => {
      csv += `${exp.date},${exp.note},${exp.category},${exp.amount}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinTrack_${selectedMonth.replace(' ', '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredExpenses = expenses.filter(exp => {
    if (selectedMonth === 'All') return true;
    const expDate = new Date(exp.id);
    const expMonth = expDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    return expMonth === selectedMonth;
  });

  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const chartData = categories.map(cat => ({
    name: cat.name,
    value: filteredExpenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0),
    color: cat.color
  })).filter(item => item.value > 0);

  const availableMonths = ['All',...new Set(expenses.map(exp => {
    const date = new Date(exp.id);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }))];

  // MONTHLY SUMMARY CALCULATION
  const monthlySummary = () => {
    if (selectedMonth === 'All' || filteredExpenses.length === 0) return null;

    const categoryTotals = categories.map(cat => ({
      name: cat.name,
      icon: cat.icon,
      total: filteredExpenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0)
    })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    const topCategory = categoryTotals[0];
    const avgPerDay = totalSpent / new Date().getDate();

    return { categoryTotals, topCategory, avgPerDay };
  };

  const summary = monthlySummary();

  return (
    <div className={darkMode? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-all">
        <div className="max-w-4xl mx-auto p-4">

                    <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-lg drop-shadow-lg"><img 
               src={logo} alt="FinTrack Logo" className="w-full h-full object-cover scale-145 object-center"/>
              </div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
              {darkMode? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Total Spent</p>
                <h2 className="text-4xl font-bold text-red-500">{currency} {totalSpent.toFixed(2)}</h2>
                {budget > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Budget: {currency} {budget.toFixed(2)} • Left: {currency} {(budget - totalSpent).toFixed(2)}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                  <option>Rs</option>
                  <option>$</option>
                  <option>€</option>
                  <option>£</option>
                  <option>AED</option>
                  <option>SAR</option>
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                  {availableMonths.map(month => <option key={month}>{month}</option>)}
                </select>
                <button
                  onClick={exportToCSV}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                >
                  📊 Export CSV
                </button>
                <button
                  onClick={() => setShowBudgetInput(!showBudgetInput)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  {budget > 0? 'Edit Budget' : 'Set Budget'}
                </button>
              </div>
            </div>

            {showBudgetInput && (
              <div className="flex gap-2 mb-3">
                <input
                  type="number"
                  placeholder="Monthly Budget"
                  value={budget || ''}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm flex-1"
                />
                <button
                  onClick={() => setShowBudgetInput(false)}
                  className="bg-green-600 text-white px-3 rounded-lg text-sm"
                >
                  Save
                </button>
              </div>
            )}

            {budget > 0 && (
              <div className="mb-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      totalSpent / budget > 1
                   ? 'bg-red-600'
                        : totalSpent / budget > 0.8
                   ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((totalSpent / budget) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-right mt-1 text-gray-500">
                  {((totalSpent / budget) * 100).toFixed(0)}% used
                </p>
              </div>
            )}

            {budget > 0 && totalSpent > budget && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm">
                ⚠️ Budget exceeded! {currency} {(totalSpent - budget).toFixed(2)} over budget
              </div>
            )}
            {budget > 0 && totalSpent > budget * 0.8 && totalSpent <= budget && (
              <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-400 text-orange-700 dark:text-orange-300 px-3 py-2 rounded-lg text-sm">
                ⚠️ 100% of budget used. Be careful!
              </div>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Showing: {selectedMonth} • {filteredExpenses.length} expenses
            </p>
          </div>

          {/* Monthly Summary Card */}
          {summary && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-xl shadow-lg mb-6 text-white">
              <h3 className="text-xl font-semibold mb-3">📈 {selectedMonth} Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-sm opacity-90">Top Spending</p>
                  <p className="text-2xl font-bold">{summary.topCategory.icon} {summary.topCategory.name}</p>
                  <p className="text-sm">{currency} {summary.topCategory.total.toFixed(2)}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-sm opacity-90">Daily Average</p>
                  <p className="text-2xl font-bold">{currency} {summary.avgPerDay.toFixed(2)}</p>
                  <p className="text-sm">Per day this month</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-sm opacity-90">Total Expenses</p>
                  <p className="text-2xl font-bold">{filteredExpenses.length}</p>
                  <p className="text-sm">Transactions</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingId? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              />
              <input
                type="text"
                placeholder="Note - e.g. Biryani"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              >
                {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>)}
              </select>
              <button
                onClick={addExpense}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-semibold"
              >
                <FiPlus /> {editingId? 'Update' : 'Add'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Spending Breakdown</h3>
              {chartData.length > 0? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-20">No expenses for {selectedMonth}</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Recent Expenses</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredExpenses.length > 0? filteredExpenses.map(exp => (
                  <div key={exp.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{categories.find(c => c.name === exp.category)?.icon}</span>
                      <div>
                        <p className="font-semibold">{exp.note}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{exp.category} • {exp.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-red-500">- {currency} {exp.amount}</p>
                      <button onClick={() => startEdit(exp)} className="text-blue-500 hover:text-blue-700">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => deleteExpense(exp.id)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-10">No expenses for {selectedMonth}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;