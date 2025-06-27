import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'

const StatusIndicator = ({ status, showIcon = true, size = 'md' }) => {
  const statusConfig = {
    scheduled: {
      variant: 'scheduled',
      icon: 'Calendar',
      label: 'Scheduled'
    },
    'checked-in': {
      variant: 'checked-in',
      icon: 'CheckCircle',
      label: 'Checked In'
    },
    waiting: {
      variant: 'waiting',
      icon: 'Clock',
      label: 'Waiting'
    },
    'in-consultation': {
      variant: 'in-consultation',
      icon: 'UserCheck',
      label: 'In Consultation'
    },
    completed: {
      variant: 'completed',
      icon: 'Check',
      label: 'Completed'
    },
    cancelled: {
      variant: 'cancelled',
      icon: 'X',
      label: 'Cancelled'
    },
    'no-show': {
      variant: 'error',
      icon: 'AlertCircle',
      label: 'No Show'
    }
  }

  const config = statusConfig[status] || statusConfig.scheduled

  return (
    <Badge variant={config.variant} size={size}>
      {showIcon && (
        <ApperIcon 
          name={config.icon} 
          className="w-3 h-3 mr-1" 
        />
      )}
      {config.label}
    </Badge>
  )
}

export default StatusIndicator