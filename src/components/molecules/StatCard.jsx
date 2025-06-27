import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import ApperIcon from '@/components/ApperIcon'

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  trendDirection = 'up',
  color = 'primary',
  className = '' 
}) => {
  const colorClasses = {
    primary: 'text-medical-primary bg-medical-primary/10',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    error: 'text-red-600 bg-red-100',
    info: 'text-blue-600 bg-blue-100'
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }

  return (
    <Card hover className={`relative overflow-hidden ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={`flex items-center text-sm ${trendColors[trendDirection]}`}>
                <ApperIcon 
                  name={trendDirection === 'up' ? 'TrendingUp' : trendDirection === 'down' ? 'TrendingDown' : 'Minus'} 
                  className="w-4 h-4 mr-1" 
                />
                {trend}
              </div>
            )}
          </div>
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <ApperIcon name={icon} className="w-6 h-6" />
          </div>
        )}
      </div>
      
      {/* Background pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-5">
        <ApperIcon name={icon} className="w-24 h-24" />
      </div>
    </Card>
  )
}

export default StatCard