import { NavLink } from 'react-router-dom'

const navigation = [
  { label: 'Users', to: '/users' },
  { label: 'Posts', to: '/posts' },
  { label: 'Products', to: '/products' },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      aria-label="Main navigation"
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-emerald-950 bg-emerald-900 text-emerald-50 transition-transform duration-200 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex h-[72px] items-center justify-between border-b border-emerald-800 px-6">
        <NavLink
          aria-label="AskOxy admin home"
          className="text-lg font-semibold text-white"
          onClick={onClose}
          to="/users"
        >
          AskOxy
        </NavLink>
        <button
          aria-label="Close navigation menu"
          className="rounded px-2 py-1 text-sm text-emerald-100 hover:bg-emerald-800 md:hidden"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>

      <div className="px-4 pt-7">
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-emerald-300">
          Menu
        </p>
        <nav className="mt-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `block rounded px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-700 text-white'
                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                }`
              }
              key={item.to}
              onClick={onClose}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
