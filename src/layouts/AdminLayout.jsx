import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

function AdminLayout() {
  const location = useLocation()
  const [sidebarState, setSidebarState] = useState({
    pathname: location.pathname,
    isOpen: false,
  })
  const isSidebarOpen =
    sidebarState.pathname === location.pathname && sidebarState.isOpen

  function closeSidebar() {
    setSidebarState({ pathname: location.pathname, isOpen: false })
  }

  function toggleSidebar() {
    setSidebarState({ pathname: location.pathname, isOpen: !isSidebarOpen })
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      {isSidebarOpen && (
        <button
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-gray-900/30 md:hidden"
          onClick={closeSidebar}
          type="button"
        />
      )}
      <div className="min-h-screen md:pl-64">
        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <button
            aria-expanded={isSidebarOpen}
            aria-label="Toggle navigation menu"
            className="mb-5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 md:hidden"
            onClick={toggleSidebar}
            type="button"
          >
            Menu
          </button>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
