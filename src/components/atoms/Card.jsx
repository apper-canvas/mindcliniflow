import { motion } from 'framer-motion'

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  ...props 
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const baseClasses = `
    bg-white rounded-lg shadow-card border border-gray-100
    ${paddings[padding]}
    ${className}
  `

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{ 
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  )
}

export default Card