import { motion } from 'framer-motion'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-medical-primary hover:bg-medical-secondary text-white shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm',
    success: 'bg-medical-success hover:bg-green-600 text-white shadow-sm hover:shadow-md',
    warning: 'bg-medical-warning hover:bg-yellow-600 text-white shadow-sm hover:shadow-md',
    error: 'bg-medical-error hover:bg-red-600 text-white shadow-sm hover:shadow-md',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
    link: 'bg-transparent hover:bg-gray-50 text-medical-primary hover:text-medical-secondary'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  const baseClasses = `
    inline-flex items-center justify-center rounded-md font-medium
    transition-all duration-150 ease-out
    focus:outline-none focus:ring-2 focus:ring-medical-primary focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `

  return (
    <motion.button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {loading && (
        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      )}
      {icon && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
    </motion.button>
  )
}

export default Button