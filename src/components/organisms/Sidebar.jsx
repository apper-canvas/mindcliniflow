import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import NavigationItem from '@/components/molecules/NavigationItem'
import ApperIcon from '@/components/ApperIcon'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [todayQueue] = useState(5) // Mock queue count

  const navigationItems = [
    { to: '/', icon: 'LayoutDashboard', label: 'Dashboard' },
    { to: '/appointments', icon: 'Calendar', label: 'Appointments' },
    { to: '/patients', icon: 'Users', label: 'Patients' },
    { to: '/queue', icon: 'Clock', label: 'Today\'s Queue', badge: todayQueue },
    { to: '/reports', icon: 'BarChart3', label: 'Reports' }
  ]

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-medical-primary to-medical-accent rounded-lg flex items-center justify-center">
                <ApperIcon name="Activity" className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">CliniFlow</h1>
            </div>
            
            {/* Mobile close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <ApperIcon name="X" className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                badge={item.badge}
              />
            ))}
          </nav>

          {/* User info */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-medical-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                Dr
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Dr. Sarah Johnson
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Family Medicine
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Sidebar