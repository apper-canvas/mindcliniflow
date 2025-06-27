import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import SearchBar from '@/components/molecules/SearchBar'
import AppointmentCard from '@/components/molecules/AppointmentCard'
import AppointmentModal from '@/components/organisms/AppointmentModal'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { appointmentService } from '@/services/api/appointmentService'
import { patientService } from '@/services/api/patientService'
import { toast } from 'react-toastify'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns'

const Appointments = () => {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [viewMode, setViewMode] = useState('week') // 'week' or 'list'

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 })

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [appointmentsRes, patientsRes] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll()
      ])
      
      setAppointments(appointmentsRes)
      setPatients(patientsRes)
    } catch (err) {
      setError('Failed to load appointments')
      console.error('Load appointments error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getPatientById = (patientId) => {
    return patients.find(p => p.Id === patientId)
  }

  const filteredAppointments = useMemo(() => {
    let filtered = appointments

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(apt => {
        const patient = getPatientById(apt.patientId)
        if (!patient) return false
        
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
        const reason = apt.reason?.toLowerCase() || ''
        const search = searchTerm.toLowerCase()
        
        return fullName.includes(search) || reason.includes(search)
      })
    }

    // Filter by week for week view
    if (viewMode === 'week') {
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate >= weekStart && aptDate <= weekEnd
      })
    }

    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateA - dateB
    })
  }, [appointments, patients, searchTerm, viewMode, weekStart, weekEnd])

const handleSaveAppointment = async (appointmentData) => {
    if (selectedAppointment) {
      await appointmentService.update(selectedAppointment.Id, appointmentData)
    } else {
      await appointmentService.create(appointmentData)
    }
    await loadData()
    setShowModal(false)
    setSelectedAppointment(null)
  }
  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment)
    setShowModal(true)
  }

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentService.delete(appointmentId)
        toast.success('Appointment deleted successfully')
        await loadData()
      } catch (error) {
        toast.error('Failed to delete appointment')
      }
    }
  }

  const getDayAppointments = (date) => {
    return filteredAppointments.filter(apt => 
      isSameDay(new Date(apt.date), date)
    )
  }

  const generateWeekDays = () => {
    const days = []
    const start = new Date(weekStart)
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    
    return days
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        </div>
        {viewMode === 'week' ? (
          <Loading type="calendar" />
        ) : (
          <Loading type="table" count={5} />
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        </div>
        <Error message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage patient appointments and schedule</p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => setViewMode(viewMode === 'week' ? 'list' : 'week')}
            icon={<ApperIcon name={viewMode === 'week' ? 'List' : 'Calendar'} className="w-4 h-4" />}
          >
            {viewMode === 'week' ? 'List View' : 'Week View'}
          </Button>
          <Button
            onClick={() => {
              setSelectedAppointment(null)
              setShowModal(true)
            }}
            icon={<ApperIcon name="Plus" className="w-4 h-4" />}
          >
            New Appointment
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search by patient name or reason..."
              onSearch={setSearchTerm}
              value={searchTerm}
            />
          </div>
          
          {viewMode === 'week' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedWeek(subWeeks(selectedWeek, 1))}
              >
                <ApperIcon name="ChevronLeft" className="w-4 h-4" />
              </Button>
              
              <span className="text-sm font-medium text-gray-900 min-w-[200px] text-center">
                {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedWeek(addWeeks(selectedWeek, 1))}
              >
                <ApperIcon name="ChevronRight" className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedWeek(new Date())}
              >
                Today
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Content */}
      {viewMode === 'week' ? (
        /* Week View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-7 gap-4"
        >
          {generateWeekDays().map((day, index) => {
            const dayAppointments = getDayAppointments(day)
            const isToday = isSameDay(day, new Date())
            
            return (
              <Card
                key={index}
                className={`p-4 min-h-[300px] ${isToday ? 'ring-2 ring-medical-primary' : ''}`}
              >
                <div className="mb-4">
                  <h3 className={`text-sm font-semibold ${isToday ? 'text-medical-primary' : 'text-gray-900'}`}>
                    {format(day, 'EEE')}
                  </h3>
                  <p className={`text-lg font-bold ${isToday ? 'text-medical-primary' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {dayAppointments.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      No appointments
                    </p>
                  ) : (
                    dayAppointments.map((appointment) => (
                      <div
                        key={appointment.Id}
                        className="p-2 bg-medical-primary/5 rounded-md border-l-2 border-medical-primary cursor-pointer hover:bg-medical-primary/10 transition-colors"
                        onClick={() => handleEditAppointment(appointment)}
                      >
                        <div className="text-xs font-medium text-gray-900 mb-1">
                          {appointment.time}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {getPatientById(appointment.patientId)?.firstName} {getPatientById(appointment.patientId)?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {appointment.reason}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )
          })}
        </motion.div>
      ) : (
        /* List View */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredAppointments.length === 0 ? (
            <Empty
              type="appointments"
              title="No appointments found"
              description={searchTerm ? 
                "No appointments match your search criteria." : 
                "Start by scheduling your first appointment."
              }
              actionLabel="Schedule Appointment"
              onAction={() => {
                setSelectedAppointment(null)
                setShowModal(true)
              }}
            />
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.Id}
                  appointment={appointment}
                  patient={getPatientById(appointment.patientId)}
                  onClick={handleEditAppointment}
                  showDate={true}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedAppointment(null)
        }}
        appointment={selectedAppointment}
        patients={patients}
        onSave={handleSaveAppointment}
      />
    </div>
  )
}

export default Appointments