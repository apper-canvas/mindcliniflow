import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import Select from '@/components/atoms/Select'
import StatCard from '@/components/molecules/StatCard'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import ApperIcon from '@/components/ApperIcon'
import { appointmentService } from '@/services/api/appointmentService'
import { patientService } from '@/services/api/patientService'
import { queueService } from '@/services/api/queueService'
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns'

const Reports = () => {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [queueItems, setQueueItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('thisMonth')

  const dateRangeOptions = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'allTime', label: 'All Time' }
  ]

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [appointmentsRes, patientsRes, queueRes] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll(),
        queueService.getAll()
      ])
      
      setAppointments(appointmentsRes)
      setPatients(patientsRes)
      setQueueItems(queueRes)
    } catch (err) {
      setError('Failed to load report data')
      console.error('Load reports error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getDateRangeFilter = () => {
    const now = new Date()
    
    switch (dateRange) {
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'lastMonth':
        const lastMonth = subMonths(now, 1)
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) }
      case 'allTime':
      default:
        return { start: new Date(2020, 0, 1), end: now }
    }
  }

  const getFilteredAppointments = () => {
    if (dateRange === 'allTime') return appointments
    
    const { start, end } = getDateRangeFilter()
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate >= start && aptDate <= end
    })
  }

  const getFilteredPatients = () => {
    if (dateRange === 'allTime') return patients
    
    const { start, end } = getDateRangeFilter()
    return patients.filter(patient => {
      if (!patient.createdAt) return false
      const createdDate = new Date(patient.createdAt)
      return createdDate >= start && createdDate <= end
    })
  }

  const calculateStats = () => {
    const filteredAppointments = getFilteredAppointments()
    const filteredPatients = getFilteredPatients()
    
    const totalAppointments = filteredAppointments.length
    const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed').length
    const cancelledAppointments = filteredAppointments.filter(apt => apt.status === 'cancelled').length
    const noShowAppointments = filteredAppointments.filter(apt => apt.status === 'no-show').length
    const newPatients = filteredPatients.length
    
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100) : 0
    const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments * 100) : 0
    
    return {
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      noShowAppointments,
      newPatients,
      completionRate: Math.round(completionRate),
      noShowRate: Math.round(noShowRate)
    }
  }

  const getAppointmentsByStatus = () => {
    const filteredAppointments = getFilteredAppointments()
    const statusCounts = {}
    
    filteredAppointments.forEach(apt => {
      statusCounts[apt.status] = (statusCounts[apt.status] || 0) + 1
    })
    
    return statusCounts
  }

  const getTopReasons = () => {
    const filteredAppointments = getFilteredAppointments()
    const reasonCounts = {}
    
    filteredAppointments.forEach(apt => {
      if (apt.reason) {
        reasonCounts[apt.reason] = (reasonCounts[apt.reason] || 0) + 1
      }
    })
    
    return Object.entries(reasonCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }))
  }

  const getMonthlyTrend = () => {
    const now = new Date()
    const months = []
    
    for (let i = 11; i >= 0; i--) {
      const month = subMonths(now, i)
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate >= monthStart && aptDate <= monthEnd
      })
      
      months.push({
        month: format(month, 'MMM yyyy'),
        appointments: monthAppointments.length,
        completed: monthAppointments.filter(apt => apt.status === 'completed').length
      })
    }
    
    return months
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        </div>
        <Loading type="stats" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Loading type="card" count={2} />
          <Loading type="card" count={2} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        </div>
        <Error message={error} onRetry={loadData} />
      </div>
    )
  }

  const stats = calculateStats()
  const appointmentsByStatus = getAppointmentsByStatus()
  const topReasons = getTopReasons()
  const monthlyTrend = getMonthlyTrend()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Clinic performance and analytics</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select
            options={dateRangeOptions}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-40"
          />
          <Button
            variant="secondary"
            onClick={loadData}
            icon={<ApperIcon name="RefreshCw" className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          icon="Calendar"
          color="primary"
        />
        <StatCard
          title="Completed"
          value={stats.completedAppointments}
          icon="CheckCircle"
          color="success"
          trend={`${stats.completionRate}%`}
          trendDirection="up"
        />
        <StatCard
          title="New Patients"
          value={stats.newPatients}
          icon="UserPlus"
          color="info"
        />
        <StatCard
          title="No-Show Rate"
          value={`${stats.noShowRate}%`}
          icon="AlertCircle"
          color="warning"
        />
      </motion.div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Appointment Status Breakdown
            </h2>
            
            <div className="space-y-4">
              {Object.entries(appointmentsByStatus).map(([status, count]) => {
                const percentage = stats.totalAppointments > 0 ? 
                  (count / stats.totalAppointments * 100) : 0
                
                const statusColors = {
                  completed: 'bg-green-500',
                  scheduled: 'bg-blue-500',
                  confirmed: 'bg-medical-primary',
                  'checked-in': 'bg-yellow-500',
                  'in-progress': 'bg-green-400',
                  cancelled: 'bg-red-500',
                  'no-show': 'bg-gray-500'
                }
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{count}</span>
                      <span className="text-xs text-gray-400">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>

        {/* Top Appointment Reasons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Top Appointment Reasons
            </h2>
            
            <div className="space-y-4">
              {topReasons.map(({ reason, count }, index) => {
                const percentage = stats.totalAppointments > 0 ? 
                  (count / stats.totalAppointments * 100) : 0
                
                return (
                  <div key={reason} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {index + 1}. {reason}
                      </span>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-medical-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              
              {topReasons.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No appointment data available
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              12-Month Appointment Trend
            </h2>
            
            <div className="space-y-4">
              {monthlyTrend.map(({ month, appointments, completed }) => {
                const maxAppointments = Math.max(...monthlyTrend.map(m => m.appointments), 1)
                const appointmentPercentage = (appointments / maxAppointments) * 100
                const completedPercentage = appointments > 0 ? (completed / appointments) * 100 : 0
                
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{month}</span>
                      <div className="text-sm text-gray-600">
                        {appointments} total • {completed} completed ({completedPercentage.toFixed(0)}%)
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-medical-primary/30 h-3 rounded-full"
                          style={{ width: `${appointmentPercentage}%` }}
                        />
                        <div
                          className="bg-medical-primary h-3 rounded-full absolute top-0 left-0"
                          style={{ width: `${appointmentPercentage * (completedPercentage / 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Export Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Export Reports</h3>
              <p className="text-sm text-gray-600">Download detailed reports for external analysis</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                size="sm"
                icon={<ApperIcon name="Download" className="w-4 h-4" />}
              >
                Export CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<ApperIcon name="FileText" className="w-4 h-4" />}
              >
                Generate PDF
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

export default Reports