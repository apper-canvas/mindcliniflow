import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import StatusIndicator from '@/components/molecules/StatusIndicator'
import ApperIcon from '@/components/ApperIcon'
import { format } from 'date-fns'

const AppointmentCard = ({ 
  appointment, 
  patient,
  onClick, 
  showDate = false,
  compact = false 
}) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const formatTime = (timeString) => {
    if (!timeString) return ''
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return format(date, 'h:mm a')
  }

  const getDurationText = (duration) => {
    if (!duration) return ''
    return `${duration} min`
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-150 hover:shadow-card-hover 
                   border-l-4 border-l-medical-accent/30 ${compact ? 'py-3' : ''}`}
        onClick={() => onClick?.(appointment)}
        padding={compact ? 'sm' : 'md'}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* Avatar */}
            <div className="w-10 h-10 bg-medical-primary text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {getInitials(patient?.firstName, patient?.lastName)}
            </div>
            
            {/* Appointment Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {patient?.firstName} {patient?.lastName}
                </h3>
                <StatusIndicator status={appointment.status} size="sm" />
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <ApperIcon name="Clock" className="w-3 h-3 mr-1" />
                  {formatTime(appointment.time)}
                  {appointment.duration && (
                    <span className="ml-1">({getDurationText(appointment.duration)})</span>
                  )}
                </div>
                
                {showDate && (
                  <div className="flex items-center">
                    <ApperIcon name="Calendar" className="w-3 h-3 mr-1" />
                    {format(new Date(appointment.date), 'MMM d, yyyy')}
                  </div>
                )}
                
                {appointment.reason && (
                  <div className="flex items-center truncate">
                    <ApperIcon name="FileText" className="w-3 h-3 mr-1" />
                    <span className="truncate">{appointment.reason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action indicator */}
          <div className="flex-shrink-0 ml-2">
            <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default AppointmentCard