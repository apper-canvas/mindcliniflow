import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'
import { format } from 'date-fns'

const PatientCard = ({ patient, showLastVisit = true, onClick }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick(patient)
    } else {
      navigate(`/patients/${patient.Id}`)
    }
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const formatAge = (dateOfBirth) => {
    if (!dateOfBirth) return ''
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Card 
        className="cursor-pointer transition-all duration-150 hover:shadow-card-hover border-l-4 border-l-medical-primary/20" 
        onClick={handleClick}
        padding="md"
      >
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-medical-primary text-white rounded-full flex items-center justify-center font-semibold">
            {getInitials(patient.firstName, patient.lastName)}
          </div>
          
          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {patient.firstName} {patient.lastName}
              </h3>
              {patient.dateOfBirth && (
                <Badge variant="default" size="sm">
                  {formatAge(patient.dateOfBirth)}y
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              {patient.phone && (
                <div className="flex items-center">
                  <ApperIcon name="Phone" className="w-3 h-3 mr-1" />
                  {patient.phone}
                </div>
              )}
              {patient.email && (
                <div className="flex items-center truncate">
                  <ApperIcon name="Mail" className="w-3 h-3 mr-1" />
                  <span className="truncate">{patient.email}</span>
                </div>
              )}
            </div>
            
            {showLastVisit && patient.lastVisit && (
              <div className="mt-2 text-xs text-gray-400">
                Last visit: {format(new Date(patient.lastVisit), 'MMM d, yyyy')}
              </div>
            )}
          </div>
          
          {/* Action indicator */}
          <div className="flex-shrink-0">
            <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default PatientCard