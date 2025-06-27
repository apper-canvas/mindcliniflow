import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  containerClassName = '',
  required = false,
  ...props 
}, ref) => {
  const inputClasses = `
    block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm 
    ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
    focus:ring-2 focus:ring-inset focus:ring-medical-primary 
    disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200
    ${error ? 'ring-red-300 focus:ring-red-500' : ''}
    ${className}
  `

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input