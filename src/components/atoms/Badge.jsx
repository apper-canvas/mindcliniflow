const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-medical-primary/10 text-medical-primary',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    'checked-in': 'bg-medical-primary/10 text-medical-primary',
    waiting: 'bg-yellow-100 text-yellow-800',
    'in-consultation': 'bg-green-100 text-green-800'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  const baseClasses = `
    inline-flex items-center rounded-full font-medium
    ${variants[variant] || variants.default}
    ${sizes[size]}
    ${className}
  `

  return (
    <span className={baseClasses}>
      {children}
    </span>
  )
}

export default Badge