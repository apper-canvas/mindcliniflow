import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const NavigationItem = ({ to, icon, label, badge }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-150 
         ${isActive 
           ? 'bg-medical-primary text-white shadow-sm' 
           : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
         }`
      }
    >
      {({ isActive }) => (
        <motion.div 
          className="flex items-center w-full"
          whileHover={{ x: isActive ? 0 : 2 }}
          transition={{ duration: 0.15 }}
        >
          <ApperIcon 
            name={icon} 
            className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} 
          />
          <span className="flex-1">{label}</span>
          {badge && (
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium
              ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {badge}
            </span>
          )}
        </motion.div>
      )}
    </NavLink>
  )
}

export default NavigationItem