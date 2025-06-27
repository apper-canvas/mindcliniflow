import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import SearchBar from '@/components/molecules/SearchBar'
import PatientCard from '@/components/molecules/PatientCard'
import PatientModal from '@/components/organisms/PatientModal'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import { patientService } from '@/services/api/patientService'
import { appointmentService } from '@/services/api/appointmentService'
import { toast } from 'react-toastify'

const Patients = () => {
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [patientsRes, appointmentsRes] = await Promise.all([
        patientService.getAll(),
        appointmentService.getAll()
      ])
      
      // Add last visit date to patients
      const patientsWithLastVisit = patientsRes.map(patient => {
        const patientAppointments = appointmentsRes
          .filter(apt => apt.patientId === patient.Id && apt.status === 'completed')
          .sort((a, b) => new Date(b.date) - new Date(a.date))
        
        return {
          ...patient,
          lastVisit: patientAppointments.length > 0 ? patientAppointments[0].date : null
        }
      })
      
      setPatients(patientsWithLastVisit)
      setAppointments(appointmentsRes)
    } catch (err) {
      setError('Failed to load patients')
      console.error('Load patients error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
        const phone = patient.phone?.toLowerCase() || ''
        const email = patient.email?.toLowerCase() || ''
        const search = searchTerm.toLowerCase()
        
        return fullName.includes(search) || 
               phone.includes(search) || 
               email.includes(search)
      })
    }

    // Sort patients
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'recent':
          const aDate = a.lastVisit ? new Date(a.lastVisit) : new Date(0)
          const bDate = b.lastVisit ? new Date(b.lastVisit) : new Date(0)
          return bDate - aDate
        case 'oldest':
          const aCreated = new Date(a.createdAt || 0)
          const bCreated = new Date(b.createdAt || 0)
          return aCreated - bCreated
        default:
          return 0
      }
    })
  }, [patients, searchTerm, sortBy])

  const handleSavePatient = async (patientData) => {
    try {
      if (selectedPatient) {
        await patientService.update(selectedPatient.Id, patientData)
      } else {
        await patientService.create(patientData)
      }
      await loadData()
      setShowModal(false)
      setSelectedPatient(null)
    } catch (error) {
      throw error
    }
  }

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient)
    setShowModal(true)
  }

  const handleDeletePatient = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        await patientService.delete(patientId)
        toast.success('Patient deleted successfully')
        await loadData()
      } catch (error) {
        toast.error('Failed to delete patient')
      }
    }
  }

  const getPatientStats = () => {
    const totalPatients = patients.length
    const newThisMonth = patients.filter(p => {
      if (!p.createdAt) return false
      const created = new Date(p.createdAt)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length

    return { totalPatients, newThisMonth }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        </div>
        <Loading type="table" count={6} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        </div>
        <Error message={error} onRetry={loadData} />
      </div>
    )
  }

  const { totalPatients, newThisMonth } = getPatientStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600">
            {totalPatients} total patients • {newThisMonth} new this month
          </p>
        </div>
        
        <Button
          onClick={() => {
            setSelectedPatient(null)
            setShowModal(true)
          }}
          icon={<ApperIcon name="UserPlus" className="w-4 h-4" />}
        >
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search by name, phone, or email..."
              onSearch={setSearchTerm}
              value={searchTerm}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-medical-primary focus:border-transparent"
            >
              <option value="name">Name (A-Z)</option>
              <option value="recent">Recent Visit</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Patient List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {filteredAndSortedPatients.length === 0 ? (
          <Empty
            type="patients"
            title={searchTerm ? "No patients found" : "No patients yet"}
            description={searchTerm ? 
              "No patients match your search criteria. Try adjusting your search terms." : 
              "Start building your patient registry by adding your first patient."
            }
            actionLabel="Add First Patient"
            onAction={() => {
              setSelectedPatient(null)
              setShowModal(true)
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedPatients.map((patient) => (
              <PatientCard
                key={patient.Id}
                patient={patient}
                onClick={handleEditPatient}
                showLastVisit={true}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Patient Modal */}
      <PatientModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedPatient(null)
        }}
        patient={selectedPatient}
        onSave={handleSavePatient}
      />
    </div>
  )
}

export default Patients