import { useState } from 'react'
import Button from '@/components/atoms/Button'
import SearchBar from '@/components/molecules/SearchBar'
import ApperIcon from '@/components/ApperIcon'
import { format } from 'date-fns'

const Header = ({ onToggleSidebar, title = '', showSearch = false, onSearch }) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useState(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>

          {/* Page title */}
          {title && (
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">
                {format(currentTime, 'EEEE, MMMM d, yyyy • h:mm a')}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          {showSearch && (
            <div className="hidden md:block w-80">
              <SearchBar
                placeholder="Search patients, appointments..."
                onSearch={onSearch}
              />
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
            >
              <ApperIcon name="Bell" className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
            >
              <ApperIcon name="Settings" className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile search */}
      {showSearch && (
        <div className="mt-4 md:hidden">
          <SearchBar
            placeholder="Search patients, appointments..."
            onSearch={onSearch}
          />
        </div>
      )}
    </header>
  )
}

export default Header