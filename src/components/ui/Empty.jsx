import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const Empty = ({ 
  title = 'No data found',
  description = 'Get started by adding your first item.',
  icon = 'Plus',
  actionLabel = 'Add New',
  onAction,
  showAction = true,
  type = 'general'
}) => {
  const emptyConfig = {
    general: {
      icon: 'Plus',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-400'
    },
    patients: {
      icon: 'Users',
      bgColor: 'bg-medical-primary/5',
      iconColor: 'text-medical-primary'
    },
    appointments: {
      icon: 'Calendar',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500'
    },
    queue: {
      icon: 'Clock',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-500'
    },
    search: {
      icon: 'Search',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-400'
    }
  }

  const config = emptyConfig[type] || emptyConfig.general
  const displayIcon = icon || config.icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`text-center p-12 ${config.bgColor}`}>
        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-sm mb-6">
          <ApperIcon 
            name={displayIcon} 
            className={`w-10 h-10 ${config.iconColor}`} 
          />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        
        {showAction && onAction && (
          <Button 
            onClick={onAction}
            size="lg"
            icon={<ApperIcon name={displayIcon} className="w-5 h-5" />}
            className="shadow-md hover:shadow-lg"
          >
            {actionLabel}
          </Button>
        )}
      </Card>
    </motion.div>
  )
}

export default Empty