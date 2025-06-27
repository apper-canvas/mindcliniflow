import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import StatCard from '@/components/molecules/StatCard'
import AppointmentCard from '@/components/molecules/AppointmentCard'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { appointmentService } from '@/services/api/appointmentService'
import { patientService } from '@/services/api/patientService'
import { queueService } from '@/services/api/queueService'
import { format, isToday } from 'date-fns'

const Dashboard = () => {
  const navigate = useNavigate()
  const [todayAppointments, setTodayAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [queueItems, setQueueItems] = useState([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    waitingPatients: 0,
    completedToday: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboardData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [appointmentsRes, patientsRes, queueRes] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll(),
        queueService.getAll()
      ])

      const allAppointments = appointmentsRes
      const allPatients = patientsRes
      const allQueueItems = queueRes

      // Filter today's appointments
      const today = new Date()
      const todayAppts = allAppointments.filter(apt => 
        isToday(new Date(apt.date))
      )

      // Calculate stats
      const waitingCount = allQueueItems.filter(item => 
        item.status === 'waiting' || item.status === 'checked-in'
      ).length

      const completedTodayCount = allQueueItems.filter(item => 
        item.status === 'completed' && isToday(new Date(item.checkInTime))
      ).length

      setTodayAppointments(todayAppts)
      setPatients(allPatients)
      setQueueItems(allQueueItems)
      
      setStats({
        totalPatients: allPatients.length,
        todayAppointments: todayAppts.length,
        waitingPatients: waitingCount,
        completedToday: completedTodayCount
      })

    } catch (err) {
      setError('Failed to load dashboard data')
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const getPatientById = (patientId) => {
    return patients.find(p => p.Id === patientId)
  }

  const handleAppointmentClick = (appointment) => {
    navigate(`/appointments`)
  }

  const getUpcomingAppointments = () => {
    return todayAppointments
      .filter(apt => apt.status !== 'completed' && apt.status !== 'cancelled')
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 5)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <Loading type="stats" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Loading type="card" count={3} />
          <Loading type="card" count={3} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <Error message={error} onRetry={loadDashboardData} />
      </div>
    )
  }

  const upcomingAppointments = getUpcomingAppointments()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => navigate('/appointments')}
            icon={<ApperIcon name="Calendar" className="w-4 h-4" />}
          >
            View Calendar
          </Button>
          <Button
            onClick={() => navigate('/queue')}
            variant="secondary"
            icon={<ApperIcon name="Clock" className="w-4 h-4" />}
          >
            Manage Queue
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon="Users"
          color="primary"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon="Calendar"
          color="info"
        />
        <StatCard
          title="Waiting Patients"
          value={stats.waitingPatients}
          icon="Clock"
          color="warning"
        />
        <StatCard
          title="Completed Today"
          value={stats.completedToday}
          icon="CheckCircle"
          color="success"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Today's Schedule
              </h2>
              <Badge variant="primary">
                {upcomingAppointments.length} upcoming
              </Badge>
            </div>

            <div className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <Empty
                  type="appointments"
                  title="No appointments today"
                  description="Your schedule is clear for today."
                  actionLabel="Schedule Appointment"
                  onAction={() => navigate('/appointments')}
                />
              ) : (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.Id}
                    appointment={appointment}
                    patient={getPatientById(appointment.patientId)}
                    onClick={handleAppointmentClick}
                    compact={true}
                  />
                ))
              )}
            </div>

            {upcomingAppointments.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/appointments')}
                  className="w-full"
                >
                  View All Appointments
                  <ApperIcon name="ArrowRight" className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions & Queue Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/patients')}
                className="h-16 flex-col"
              >
                <ApperIcon name="UserPlus" className="w-6 h-6 mb-1" />
                Add Patient
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => navigate('/appointments')}
                className="h-16 flex-col"
              >
                <ApperIcon name="CalendarPlus" className="w-6 h-6 mb-1" />
                New Appointment
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => navigate('/queue')}
                className="h-16 flex-col"
              >
                <ApperIcon name="UserCheck" className="w-6 h-6 mb-1" />
                Check In Patient
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => navigate('/reports')}
                className="h-16 flex-col"
              >
                <ApperIcon name="FileText" className="w-6 h-6 mb-1" />
                View Reports
              </Button>
            </div>
          </Card>

          {/* Queue Status */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Queue Status
              </h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate('/queue')}
              >
                Manage
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <ApperIcon name="Clock" className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Waiting</span>
                </div>
                <Badge variant="warning">{stats.waitingPatients}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ApperIcon name="CheckCircle" className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Completed</span>
                </div>
                <Badge variant="success">{stats.completedToday}</Badge>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard