import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Charts = ({ transactions }) => {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const pieData = [
    { name: 'Income', value: income },
    { name: 'Expense', value: expense },
  ];
  const COLORS = ['#10B981', '#EF4444'];

  const getLast6Months = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear(),
        expense: 0
      });
    }
    return months;
  };

  const barData = getLast6Months();
  transactions.forEach(t => {
    if (t.type === 'expense') {
      const date = new Date(t.date);
      const found = barData.find(m => m.month === date.getMonth() && m.year === date.getFullYear());
      if (found) found.expense += t.amount;
    }
  });

  if (transactions.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400 py-8">Add transactions to see charts 📊</p>
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Income vs Expense</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Last 6 Months Spending</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <XAxis dataKey="name" stroke="#888888" />
            <YAxis stroke="#888888" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
            <Bar dataKey="expense" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;