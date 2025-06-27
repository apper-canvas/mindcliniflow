import { forwardRef } from 'react'

const Select = forwardRef(({ 
  label, 
  options = [], 
  error, 
  className = '', 
  containerClassName = '',
  required = false,
  placeholder = 'Select...',
  ...props 
}, ref) => {
  const selectClasses = `
    block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm 
    ring-1 ring-inset ring-gray-300 
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
      <select
        ref={ref}
        className={selectClasses}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select