import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  const base = 'flex flex-col items-center justify-center gap-1 text-xs'
  const active = 'text-blue-600'
  const inactive = 'text-gray-400'

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 h-16 z-40 nav-pop" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-2xl mx-auto h-full px-4 grid grid-cols-4">
        <NavLink to="/" className={({ isActive }) => `${base} ${isActive ? active : inactive} btn btn-ripple`}>
          <span className="material-symbols-rounded">home</span>
          <span>خانه</span>
        </NavLink>
        <NavLink to="/installments" className={({ isActive }) => `${base} ${isActive ? active : inactive} btn btn-ripple`}>
          <span className="material-symbols-rounded">payments</span>
          <span>اقساط</span>
        </NavLink>
        <NavLink to="/assets" className={({ isActive }) => `${base} ${isActive ? active : inactive} btn btn-ripple`}>
          <span className="material-symbols-rounded">account_balance</span>
          <span>دارایی‌ها</span>
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => `${base} ${isActive ? active : inactive} btn btn-ripple`}>
          <span className="material-symbols-rounded">query_stats</span>
          <span>آمار</span>
        </NavLink>
      </div>
    </nav>
  )
}
