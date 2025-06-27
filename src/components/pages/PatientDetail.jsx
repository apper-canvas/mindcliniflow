import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import AppointmentCard from '@/components/molecules/AppointmentCard'
import PatientModal from '@/components/organisms/PatientModal'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { patientService } from '@/services/api/patientService'
import { appointmentService } from '@/services/api/appointmentService'
import { toast } from 'react-toastify'
import { format, differenceInYears } from 'date-fns'

const PatientDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const loadPatientData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const patientId = parseInt(id)
      const [patientRes, appointmentsRes] = await Promise.all([
        patientService.getById(patientId),
        appointmentService.getAll()
      ])
      
      if (!patientRes) {
        setError('Patient not found')
        return
      }

      const patientAppointments = appointmentsRes
        .filter(apt => apt.patientId === patientId)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
      
      setPatient(patientRes)
      setAppointments(patientAppointments)
    } catch (err) {
      setError('Failed to load patient information')
      console.error('Load patient error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadPatientData()
    }
  }, [id])

  const handleSavePatient = async (patientData) => {
    try {
      await patientService.update(patient.Id, patientData)
      await loadPatientData()
      setShowEditModal(false)
      toast.success('Patient information updated successfully')
    } catch (error) {
      throw error
    }
  }

  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    return differenceInYears(new Date(), new Date(dateOfBirth))
  }

  const getPatientStats = () => {
    const totalVisits = appointments.filter(apt => apt.status === 'completed').length
    const upcomingAppointments = appointments.filter(apt => 
      apt.status === 'scheduled' || apt.status === 'confirmed'
    ).length
    const lastVisit = appointments.find(apt => apt.status === 'completed')
    const noShows = appointments.filter(apt => apt.status === 'no-show').length

    return {
      totalVisits,
      upcomingAppointments,
      lastVisit: lastVisit?.date,
      noShows
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/patients')}>
            <ApperIcon name="ArrowLeft" className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        </div>
        <Loading type="card" count={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/patients')}>
            <ApperIcon name="ArrowLeft" className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Patient Details</h1>
        </div>
        <Error message={error} onRetry={loadPatientData} />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/patients')}>
            <ApperIcon name="ArrowLeft" className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Patient Not Found</h1>
        </div>
        <Empty
          title="Patient not found"
          description="The patient you're looking for doesn't exist or may have been deleted."
          actionLabel="Back to Patients"
          onAction={() => navigate('/patients')}
        />
      </div>
    )
  }

  const stats = getPatientStats()
  const age = getAge(patient.dateOfBirth)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/patients')}>
            <ApperIcon name="ArrowLeft" className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {age && (
                <span>{age} years old</span>
              )}
              {patient.phone && (
                <span className="flex items-center">
                  <ApperIcon name="Phone" className="w-4 h-4 mr-1" />
                  {patient.phone}
                </span>
              )}
              {patient.email && (
                <span className="flex items-center">
                  <ApperIcon name="Mail" className="w-4 h-4 mr-1" />
                  {patient.email}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(true)}
            icon={<ApperIcon name="Edit" className="w-4 h-4" />}
          >
            Edit Patient
          </Button>
          <Button
            onClick={() => navigate('/appointments')}
            icon={<ApperIcon name="Calendar" className="w-4 h-4" />}
          >
            Schedule Appointment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVisits}</p>
            </div>
            <div className="w-10 h-10 bg-medical-primary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Calendar" className="w-5 h-5 text-medical-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Clock" className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Visit</p>
              <p className="text-sm font-semibold text-gray-900">
                {stats.lastVisit ? format(new Date(stats.lastVisit), 'MMM d, yyyy') : 'Never'}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">No Shows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.noShows}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="AlertCircle" className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: 'User' },
            { id: 'appointments', label: 'Appointments', icon: 'Calendar' },
            { id: 'notes', label: 'Notes', icon: 'FileText' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-medical-primary text-medical-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ApperIcon name={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">First Name</p>
                    <p className="font-medium">{patient.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Name</p>
                    <p className="font-medium">{patient.lastName}</p>
                  </div>
                </div>
                
                {patient.dateOfBirth && (
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">
                      {format(new Date(patient.dateOfBirth), 'MMMM d, yyyy')}
                      {age && <span className="text-gray-500 ml-2">({age} years old)</span>}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{patient.phone || 'Not provided'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{patient.email || 'Not provided'}</p>
                </div>
                
                {patient.address && (
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                )}
                
                {patient.emergencyContact && (
                  <div>
                    <p className="text-sm text-gray-600">Emergency Contact</p>
                    <p className="font-medium">{patient.emergencyContact}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.Id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-medical-primary/10 rounded-full flex items-center justify-center">
                      <ApperIcon name="Calendar" className="w-4 h-4 text-medical-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {appointment.reason}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(appointment.date), 'MMM d, yyyy')} at {appointment.time}
                      </p>
                    </div>
                    <Badge variant={appointment.status}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
                
                {appointments.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No appointments yet
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            {appointments.length === 0 ? (
              <Empty
                type="appointments"
                title="No appointments"
                description="This patient doesn't have any appointments yet."
                actionLabel="Schedule First Appointment"
                onAction={() => navigate('/appointments')}
              />
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.Id}
                    appointment={appointment}
                    patient={patient}
                    showDate={true}
                    onClick={() => navigate('/appointments')}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Notes</h3>
            {patient.notes ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{patient.notes}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No notes available for this patient.</p>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(true)}
                icon={<ApperIcon name="Edit" className="w-4 h-4" />}
              >
                Edit Notes
              </Button>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Edit Patient Modal */}
      <PatientModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        patient={patient}
        onSave={handleSavePatient}
      />
    </div>
  )
}

export default PatientDetail