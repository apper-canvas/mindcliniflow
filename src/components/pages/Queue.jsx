import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import StatusIndicator from '@/components/molecules/StatusIndicator'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { queueService } from '@/services/api/queueService'
import { appointmentService } from '@/services/api/appointmentService'
import { patientService } from '@/services/api/patientService'
import { toast } from 'react-toastify'
import { format, isToday } from 'date-fns'

const Queue = () => {
  const [queueItems, setQueueItems] = useState([])
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [queueRes, appointmentsRes, patientsRes] = await Promise.all([
        queueService.getAll(),
        appointmentService.getAll(),
        patientService.getAll()
      ])
      
      setQueueItems(queueRes)
      setAppointments(appointmentsRes)
      setPatients(patientsRes)
    } catch (err) {
      setError('Failed to load queue data')
      console.error('Load queue error:', err)
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

  const getAppointmentById = (appointmentId) => {
    return appointments.find(a => a.Id === appointmentId)
  }

  const getTodayAppointments = () => {
    return appointments.filter(apt => isToday(new Date(apt.date)))
  }

  const getQueueByStatus = (status) => {
    return queueItems.filter(item => item.status === status)
  }

  const handleCheckIn = async (appointmentId) => {
    try {
      const appointment = getAppointmentById(appointmentId)
      if (!appointment) return

      // Create queue item
      await queueService.create({
        appointmentId: appointmentId,
        checkInTime: new Date().toISOString(),
        status: 'checked-in'
      })

      // Update appointment status
      await appointmentService.update(appointmentId, {
        ...appointment,
        status: 'checked-in'
      })

      toast.success('Patient checked in successfully')
      await loadData()
    } catch (error) {
      toast.error('Failed to check in patient')
      console.error('Check in error:', error)
    }
  }

  const handleStatusChange = async (queueItemId, newStatus) => {
    try {
      const queueItem = queueItems.find(item => item.Id === queueItemId)
      if (!queueItem) return

      const updateData = {
        ...queueItem,
        status: newStatus
      }

      // Add timestamps based on status
      if (newStatus === 'in-consultation') {
        updateData.consultationStart = new Date().toISOString()
      } else if (newStatus === 'completed') {
        updateData.consultationEnd = new Date().toISOString()
      }

      await queueService.update(queueItemId, updateData)

      // Update appointment status as well
      const appointment = getAppointmentById(queueItem.appointmentId)
      if (appointment) {
        await appointmentService.update(appointment.Id, {
          ...appointment,
          status: newStatus === 'completed' ? 'completed' : newStatus
        })
      }

      toast.success(`Patient status updated to ${newStatus}`)
      await loadData()
    } catch (error) {
      toast.error('Failed to update patient status')
      console.error('Status update error:', error)
    }
  }

  const calculateWaitTime = (checkInTime) => {
    if (!checkInTime) return ''
    const diff = new Date() - new Date(checkInTime)
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 60) {
      return `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Today's Queue</h1>
        </div>
        <Loading type="table" count={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Today's Queue</h1>
        </div>
        <Error message={error} onRetry={loadData} />
      </div>
    )
  }

  const todayAppointments = getTodayAppointments()
  const waitingQueue = getQueueByStatus('checked-in').concat(getQueueByStatus('waiting'))
  const inConsultationQueue = getQueueByStatus('in-consultation')
  const completedQueue = getQueueByStatus('completed')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Today's Queue</h1>
          <p className="text-gray-600">Manage patient flow and check-ins</p>
        </div>
        <Button
          onClick={loadData}
          variant="secondary"
          icon={<ApperIcon name="RefreshCw" className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Queue Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled Today</p>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Calendar" className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Waiting</p>
              <p className="text-2xl font-bold text-yellow-600">{waitingQueue.length}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Clock" className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Consultation</p>
              <p className="text-2xl font-bold text-green-600">{inConsultationQueue.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="UserCheck" className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-medical-primary">{completedQueue.length}</p>
            </div>
            <div className="w-10 h-10 bg-medical-primary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="CheckCircle" className="w-5 h-5 text-medical-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Queue Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting Patients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Waiting ({waitingQueue.length})
              </h2>
              <ApperIcon name="Clock" className="w-5 h-5 text-yellow-500" />
            </div>

            <div className="space-y-3">
              {waitingQueue.length === 0 ? (
                <Empty
                  type="queue"
                  title="No patients waiting"
                  description="All patients are either in consultation or completed."
                  showAction={false}
                />
              ) : (
                waitingQueue.map((queueItem) => {
                  const appointment = getAppointmentById(queueItem.appointmentId)
                  const patient = appointment ? getPatientById(appointment.patientId) : null
                  
                  if (!appointment || !patient) return null

                  return (
                    <div key={queueItem.Id} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="text-xs text-gray-500">
                          Wait: {calculateWaitTime(queueItem.checkInTime)}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p>{appointment.reason}</p>
                        <p className="text-xs">Scheduled: {appointment.time}</p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(queueItem.Id, 'in-consultation')}
                        className="w-full"
                        icon={<ApperIcon name="Play" className="w-3 h-3" />}
                      >
                        Start Consultation
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </motion.div>

        {/* In Consultation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                In Consultation ({inConsultationQueue.length})
              </h2>
              <ApperIcon name="UserCheck" className="w-5 h-5 text-green-500" />
            </div>

            <div className="space-y-3">
              {inConsultationQueue.length === 0 ? (
                <Empty
                  type="queue"
                  title="No active consultations"
                  description="Start consultations from the waiting queue."
                  showAction={false}
                />
              ) : (
                inConsultationQueue.map((queueItem) => {
                  const appointment = getAppointmentById(queueItem.appointmentId)
                  const patient = appointment ? getPatientById(appointment.patientId) : null
                  
                  if (!appointment || !patient) return null

                  return (
                    <div key={queueItem.Id} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="text-xs text-gray-500">
                          Started: {queueItem.consultationStart ? 
                            calculateWaitTime(queueItem.consultationStart) + ' ago' : 'Recently'}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p>{appointment.reason}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleStatusChange(queueItem.Id, 'completed')}
                        className="w-full"
                        icon={<ApperIcon name="Check" className="w-3 h-3" />}
                      >
                        Complete Visit
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </Card>
        </motion.div>

        {/* Check-in & Scheduled */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Ready to Check In
              </h2>
              <ApperIcon name="UserPlus" className="w-5 h-5 text-medical-primary" />
            </div>

            <div className="space-y-3">
              {todayAppointments
                .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
                .slice(0, 5)
                .map((appointment) => {
                  const patient = getPatientById(appointment.patientId)
                  if (!patient) return null

                  return (
                    <div key={appointment.Id} className="p-3 bg-medical-primary/5 rounded-lg border-l-4 border-medical-primary">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <div className="text-xs text-gray-500">
                          {appointment.time}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p>{appointment.reason}</p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(appointment.Id)}
                        className="w-full"
                        icon={<ApperIcon name="UserCheck" className="w-3 h-3" />}
                      >
                        Check In
                      </Button>
                    </div>
                  )
                })}

              {todayAppointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length === 0 && (
                <Empty
                  type="appointments"
                  title="No scheduled appointments"
                  description="All appointments have been processed or there are no appointments today."
                  showAction={false}
                />
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Queue