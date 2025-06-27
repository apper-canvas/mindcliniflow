import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const Error = ({ 
  message = 'Something went wrong', 
  onRetry, 
  showRetry = true,
  type = 'general' 
}) => {
  const errorConfig = {
    general: {
      icon: 'AlertCircle',
      title: 'Oops! Something went wrong',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500'
    },
    network: {
      icon: 'Wifi',
      title: 'Connection Error',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-500'
    },
    notFound: {
      icon: 'Search',
      title: 'Not Found',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-500'
    },
    permission: {
      icon: 'Lock',
      title: 'Access Denied',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500'
    }
  }

  const config = errorConfig[type] || errorConfig.general

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`text-center p-12 ${config.bgColor}`}>
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
          <ApperIcon 
            name={config.icon} 
            className={`w-8 h-8 ${config.iconColor}`} 
          />
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {config.title}
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {message}
        </p>
        
        {showRetry && onRetry && (
          <div className="flex justify-center space-x-3">
            <Button 
              onClick={onRetry}
              icon={<ApperIcon name="RefreshCw" className="w-4 h-4" />}
            >
              Try Again
            </Button>
            <Button 
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

export default Error