import { Analytics } from "@vercel/analytics/react"
import { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FiPlus, FiTrash2, FiSun, FiMoon, FiEdit2, FiSearch, FiRefreshCw } from 'react-icons/fi';
import logo from './logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


function App() {
  const [expenses, setExpenses] = useState(() => {
    return JSON.parse(localStorage.getItem('fintrack-expenses')) || [];
  });
  const [incomes, setIncomes] = useState(() => {
    return JSON.parse(localStorage.getItem('fintrack-incomes')) || [];
  });
  const [recurringTransactions, setRecurringTransactions] = useState(() => {
    return JSON.parse(localStorage.getItem('fintrack-recurring')) || [];
  });
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('Food');
  const [transactionType, setTransactionType] = useState('expense');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(1);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('fintrack-theme') === 'dark';
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [budget, setBudget] = useState(() => {
    return parseFloat(localStorage.getItem('fintrack-budget')) || 0;
  });
  const [categoryBudgets, setCategoryBudgets] = useState(() => {
    return JSON.parse(localStorage.getItem('fintrack-category-budgets')) || {};
  });
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [showCategoryBudget, setShowCategoryBudget] = useState(false);
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
    localStorage.setItem('fintrack-incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('fintrack-recurring', JSON.stringify(recurringTransactions));
  }, [recurringTransactions]);

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
    localStorage.setItem('fintrack-category-budgets', JSON.stringify(categoryBudgets));
  }, [categoryBudgets]);

  useEffect(() => {
    localStorage.setItem('fintrack-currency', currency);
  }, [currency]);

  useEffect(() => {
    const today = new Date().getDate();
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    recurringTransactions.forEach(rec => {
      if (rec.day === today) {
        const lastAdded = localStorage.getItem(`fintrack-recurring-last-${rec.id}`);
        if (lastAdded!== currentMonth) {
          const newTransaction = {
            id: Date.now() + Math.random(),
            amount: rec.amount,
            note: rec.note + ' (Recurring)',
            date: new Date().toLocaleDateString(),
            type: rec.type
          };

          if (rec.type === 'expense') {
            newTransaction.category = rec.category;
            setExpenses(prev => [newTransaction,...prev]);
          } else {
            setIncomes(prev => [newTransaction,...prev]);
          }
          localStorage.setItem(`fintrack-recurring-last-${rec.id}`, currentMonth);
        }
      }
    });
  }, [recurringTransactions]);

  const categories = [
    { name: 'Food', icon: '🍔', color: '#FF6B6B' },
    { name: 'Travel', icon: '✈️', color: '#4ECDC4' },
    { name: 'Bills', icon: '💡', color: '#FFE66D' },
    { name: 'Shopping', icon: '🛍️', color: '#FF8E53' },
    { name: 'Health', icon: '💊', color: '#A8E6CF' },
    { name: 'Other', icon: '📦', color: '#C7CEEA' }
  ];

  const addTransaction = () => {
    if (!amount ||!note) return alert('Please enter amount and note');

    if (isRecurring) {
      const newRecurring = {
        id: Date.now(),
        amount: parseFloat(amount),
        note,
        type: transactionType,
        category: transactionType === 'expense'? category : null,
        day: parseInt(recurringDay)
      };
      setRecurringTransactions([newRecurring,...recurringTransactions]);
      setIsRecurring(false);
      setAmount('');
      setNote('');
      alert('Recurring transaction added! Auto-adds on day ' + recurringDay + ' every month');
      return;
    }

    if (editingId) {
      if (transactionType === 'expense') {
        setExpenses(expenses.map(exp =>
          exp.id === editingId
       ? {...exp, amount: parseFloat(amount), note, category }
            : exp
        ));
      } else {
        setIncomes(incomes.map(inc =>
          inc.id === editingId
       ? {...inc, amount: parseFloat(amount), note }
            : inc
        ));
      }
      setEditingId(null);
    } else {
      const newTransaction = {
        id: Date.now(),
        amount: parseFloat(amount),
        note,
        date: new Date().toLocaleDateString(),
        type: transactionType
      };

      if (transactionType === 'expense') {
        newTransaction.category = category;
        setExpenses([newTransaction,...expenses]);
      } else {
        setIncomes([newTransaction,...incomes]);
      }
    }
    setAmount('');
    setNote('');
    setCategory('Food');
  };

  const deleteTransaction = (id, type) => {
    if (type === 'expense') {
      setExpenses(expenses.filter(exp => exp.id!== id));
    } else {
      setIncomes(incomes.filter(inc => inc.id!== id));
    }
  };

  const deleteRecurring = (id) => {
    setRecurringTransactions(recurringTransactions.filter(rec => rec.id!== id));
  };

  const startEdit = (item, type) => {
    setEditingId(item.id);
    setAmount(item.amount);
    setNote(item.note);
    setTransactionType(type);
    if (type === 'expense') setCategory(item.category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportToCSV = () => {
    if (allFilteredTransactions.length === 0) return alert('No transactions to export!');

    let csv = `Date,Type,Note,Category,Amount (${currency})\n`;
    allFilteredTransactions.forEach(item => {
      csv += `${item.date},${item.type},${item.note},${item.category || 'Income'},${item.amount}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinTrack_${selectedMonth.replace(' ', '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
  if (allFilteredTransactions.length === 0) return alert('No transactions to export!');

  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text('FinTrack Pro - Finance Report', 14, 20);

  doc.setFontSize(12);
  doc.text(`Month: ${selectedMonth}`, 14, 30);
  doc.text(`Income: ${currency} ${totalIncome.toFixed(2)}`, 14, 37);
  doc.text(`Expenses: ${currency} ${totalSpent.toFixed(2)}`, 14, 44);
  doc.text(`Net Savings: ${currency} ${netSavings.toFixed(2)}`, 14, 51);

  if (budget > 0) {
    doc.text(`Budget: ${currency} ${budget.toFixed(2)} | Used: ${Math.floor(budgetUsed)}%`, 14, 58);
  }

  const tableData = allFilteredTransactions.map(item => [
    item.date,
    item.type === 'expense' ? 'Expense' : 'Income',
    item.note,
    item.category || '-',
    `${currency} ${item.amount.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 65,
    head: [['Date', 'Type', 'Note', 'Category', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [78, 205, 196] }
  });

  doc.save(`FinTrack_${selectedMonth.replace(' ', '_')}.pdf`);
};

  const getDateFilteredItems = (items) => {
    const now = new Date();
    return items.filter(item => {
      const itemDate = new Date(item.id);

      if (dateFilter === 'last7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= sevenDaysAgo;
      }
      if (dateFilter === 'thismonth') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredExpenses = getDateFilteredItems(expenses).filter(exp => {
    const matchesSearch = exp.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = selectedMonth === 'All' ||
                        new Date(exp.id).toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
    const matchesType = typeFilter === 'all' || typeFilter === 'expense';
    return matchesSearch && matchesMonth && matchesType;
  });

  const filteredIncomes = getDateFilteredItems(incomes).filter(inc => {
    const matchesSearch = inc.note.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMonth = selectedMonth === 'All' ||
                        new Date(inc.id).toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
    const matchesType = typeFilter === 'all' || typeFilter === 'income';
    return matchesSearch && matchesMonth && matchesType;
  });

  const allFilteredTransactions = [...filteredExpenses.map(e => ({...e, type: 'expense'})),...filteredIncomes.map(i => ({...i, type: 'income'}))]
  .sort((a, b) => b.id - a.id);

  const totalSpent = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const totalIncome = filteredIncomes.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const netSavings = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0? (netSavings / totalIncome) * 100 : 0;
  const budgetUsed = budget > 0? (totalSpent / budget) * 100 : 0;

  const getCategorySpent = (catName) => {
    return filteredExpenses
 .filter(e => e.category === catName)
 .reduce((sum, e) => sum + Number(e.amount), 0);
  };

  const getCategoryBudgetUsed = (catName) => {
    const catBudget = categoryBudgets[catName] || 0;
    const catSpent = getCategorySpent(catName);
    return catBudget > 0? (catSpent / catBudget) * 100 : 0;
  };

  const chartData = categories.map(cat => ({
    name: cat.name,
    value: filteredExpenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + Number(e.amount), 0),
    color: cat.color
  })).filter(item => item.value > 0);

  const availableMonths = ['All',...new Set([...expenses,...incomes].map(item => {
    const date = new Date(item.id);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }))];

  return (
    <div className={darkMode? 'dark' : ''}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-all">
        <div className="max-w-6xl mx-auto p-4">

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-0.5 bg-gradient-to-r from-[#4ECDC4] to-[#8A2BE2] rounded-full animate-pulse">
                <img src={logo} alt="FinTrack Logo" className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-900 rounded-full p-1" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">FinTrack Pro</h1>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
              {darkMode? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Income</p>
                <h2 className="text-2xl md:text-3xl font-bold text-green-500">{currency} {totalIncome.toFixed(2)}</h2>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Spent</p>
                <h2 className="text-2xl md:text-3xl font-bold text-red-500">{currency} {totalSpent.toFixed(2)}</h2>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Net Savings</p>
                <h2 className={`text-2xl md:text-3xl font-bold ${netSavings >= 0? 'text-blue-500' : 'text-red-500'}`}>
                  {currency} {netSavings.toFixed(2)}
                </h2>
                {totalIncome > 0 && (
                  <p className="text-xs text-gray-500">Savings Rate: {savingsRate.toFixed(0)}%</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
              <div className="flex gap-2">
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
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="last7days">Last 7 Days</option>
                  <option value="thismonth">This Month</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="expense">Expenses Only</option>
                  <option value="income">Income Only</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportToCSV}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                >
                  📊 CSV
                </button>
                <button
                  onClick={exportToPDF}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => setShowBudgetInput(!showBudgetInput)}
                  className="text-xs text-blue-500 hover:underline px-2"
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
                      totalSpent >= budget
                   ? 'bg-red-600'
                        : budgetUsed >= 80
                   ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-right mt-1 text-gray-500">
                  {Math.floor(budgetUsed)}% used
                </p>
              </div>
            )}

            {budget > 0 && budgetUsed >= 80 && totalSpent < budget && (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 text-yellow-700 dark:text-yellow-300 px-3 py-2 rounded-lg text-sm mb-2">
                ⚠️ Warning: 80% Budget Used
              </div>
            )}

            {budget > 0 && totalSpent >= budget && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-sm mb-2">
                ⚠️ Alert: 100% Budget Used! Stop Spending
              </div>
            )}

            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-sm">Budget by Category</h4>
                <button
                  onClick={() => setShowCategoryBudget(!showCategoryBudget)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  {showCategoryBudget? 'Hide' : 'Set Budgets'}
                </button>
              </div>

              {showCategoryBudget && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                  {categories.map(cat => (
                    <div key={cat.name} className="flex items-center gap-1">
                      <span className="text-sm">{cat.icon}</span>
                      <input
                        type="number"
                        placeholder={cat.name}
                        value={categoryBudgets[cat.name] || ''}
                        onChange={(e) => setCategoryBudgets({
                     ...categoryBudgets,
                          [cat.name]: parseFloat(e.target.value) || 0
                        })}
                        className="p-1 rounded border dark:bg-gray-700 dark:border-gray-600 text-xs w-full"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {categories.map(cat => {
                  const catBudget = categoryBudgets[cat.name] || 0;
                  if (catBudget === 0) return null;

                  const catSpent = getCategorySpent(cat.name);
                  const catUsed = getCategoryBudgetUsed(cat.name);

                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{cat.icon} {cat.name}</span>
                        <span className="text-gray-500">
                          {currency} {catSpent.toFixed(0)} / {currency} {catBudget}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            catSpent >= catBudget
                        ? 'bg-red-600'
                              : catUsed >= 80
                        ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(catUsed, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Showing: {selectedMonth} • {allFilteredTransactions.length} transactions
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6">
            <h3 className="text-xl font-semibold mb-4">
              {editingId? 'Edit Transaction' : 'Add New Transaction'}
            </h3>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setTransactionType('expense')}
                className={`flex-1 p-2 rounded-lg font-semibold ${transactionType === 'expense'? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                - Expense
              </button>
              <button
                onClick={() => setTransactionType('income')}
                className={`flex-1 p-2 rounded-lg font-semibold ${transactionType === 'income'? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                + Income
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
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
              {transactionType === 'expense' && (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
                >
                  {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>)}
                </select>
              )}
              <button
                onClick={addTransaction}
                className={`${transactionType === 'expense'? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white p-3 rounded-lg flex items-center justify-center gap-2 font-semibold`}
              >
                <FiPlus /> {editingId? 'Update' : 'Add'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4"
                />
                <FiRefreshCw /> Make Recurring
              </label>
              {isRecurring && (
                <div className="flex items-center gap-2 text-sm">
                  <span>Every month on day:</span>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={recurringDay}
                    onChange={(e) => setRecurringDay(e.target.value)}
                    className="w-16 p-1 rounded border dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg mb-6">
            <div className="flex items-center gap-2">
              <FiSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-2 bg-transparent outline-none"
              />
            </div>
          </div>

          {recurringTransactions.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl shadow-lg mb-6 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FiRefreshCw /> Active Recurring Transactions
              </h4>
              <div className="space-y-2">
                {recurringTransactions.map(rec => (
                  <div key={rec.id} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-2 rounded">
                    <span>
                      {rec.type === 'expense'? '🔴' : '🟢'} {rec.note} - {currency} {rec.amount}
                      {rec.type === 'expense' && ` • ${rec.category}`}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Day {rec.day}</span>
                      <button onClick={() => deleteRecurring(rec.id)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <p className="text-gray-500 text-center py-20">No expenses for selected period</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {allFilteredTransactions.length > 0? allFilteredTransactions.map(item => (
                  <div key={`${item.type}-${item.id}`} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {item.type === 'expense'? categories.find(c => c.name === item.category)?.icon : '💰'}
                      </span>
                      <div>
                        <p className="font-semibold">{item.note}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.type === 'expense'? item.category : 'Income'} • {item.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className={`font-bold ${item.type === 'expense'? 'text-red-500' : 'text-green-500'}`}>
                        {item.type === 'expense'? '-' : '+'} {currency} {item.amount}
                      </p>
                      <button onClick={() => startEdit(item, item.type)} className="text-blue-500 hover:text-blue-700">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => deleteTransaction(item.id, item.type)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-10">No transactions found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Analytics />
    </div>
  );
}

export default App;