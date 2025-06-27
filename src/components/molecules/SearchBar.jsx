import { useState } from 'react'
import ApperIcon from '@/components/ApperIcon'

const SearchBar = ({ 
  placeholder = 'Search...', 
  onSearch, 
  className = '',
  value = '',
  onChange 
}) => {
  const [searchTerm, setSearchTerm] = useState(value)

  const handleChange = (e) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    if (onChange) {
      onChange(newValue)
    }
    if (onSearch) {
      onSearch(newValue)
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    if (onChange) {
      onChange('')
    }
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ApperIcon name="Search" className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md 
                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-medical-primary 
                   focus:border-transparent text-sm"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
        >
          <ApperIcon name="X" className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  )
}

export default SearchBar