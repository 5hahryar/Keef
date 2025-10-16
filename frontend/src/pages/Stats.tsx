import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useSpendingByCategory } from '../hooks/useStats'

const colors = ['#F59EB5', '#60A5FA', '#6366F1', '#F59E0B', '#10B981', '#8B5CF6', '#F97316']

export default function Stats() {
  const { data: categoryData = [], isLoading, error } = useSpendingByCategory()
  
  const total = categoryData.reduce((s, d) => s + d.total, 0)
  const chartData = categoryData.map((item, index) => ({
    name: item.category,
    value: item.total,
    color: colors[index % colors.length]
  }))
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4">
        <Link to="/" className="text-brand-blue">← داشبورد</Link>
        <h1 className="text-xl font-semibold">مجموع هزینه‌ها</h1>
        <div /> 
      </header>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-xl mx-4">
          خطا در بارگذاری آمار
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 items-center">
          <div className="h-64 md:h-80 bg-white rounded-2xl shadow-card p-4 animate-pulse">
            <div className="w-full h-full bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-card p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 items-center">
          <div className="h-64 md:h-80 bg-white rounded-2xl shadow-card p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {categoryData.map((d, index) => {
              const pct = Math.round((d.total / total) * 100)
              return (
                <div key={d.category} className="bg-white rounded-2xl shadow-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-700">{d.category}</div>
                    <div className="text-gray-500 text-sm">
                      {new Intl.NumberFormat('fa-IR').format(d.total)} تومن
                    </div>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-100">
                    <div 
                      className="h-full rounded" 
                      style={{ 
                        width: `${pct}%`,
                        backgroundColor: colors[index % colors.length]
                      }} 
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{pct}%</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}


