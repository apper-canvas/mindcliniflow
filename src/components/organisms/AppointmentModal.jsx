import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import ApperIcon from '@/components/ApperIcon'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const AppointmentModal = ({ isOpen, onClose, appointment, patients, onSave }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    duration: 30,
    reason: '',
    notes: '',
    status: 'scheduled'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'checked-in', label: 'Checked In' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No Show' }
  ]

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ]

  const patientOptions = patients.map(patient => ({
    value: patient.Id.toString(),
    label: `${patient.firstName} ${patient.lastName}`
  }))

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId?.toString() || '',
        date: appointment.date || '',
        time: appointment.time || '',
        duration: appointment.duration || 30,
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        status: appointment.status || 'scheduled'
      })
    } else {
      const today = new Date()
      setFormData({
        patientId: '',
        date: format(today, 'yyyy-MM-dd'),
        time: '09:00',
        duration: 30,
        reason: '',
        notes: '',
        status: 'scheduled'
      })
    }
    setErrors({})
  }, [appointment, isOpen])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.patientId) {
      newErrors.patientId = 'Please select a patient'
    }
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }
    if (!formData.time) {
      newErrors.time = 'Time is required'
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for visit is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const appointmentData = {
        ...formData,
        patientId: parseInt(formData.patientId),
        duration: parseInt(formData.duration)
      }
      await onSave(appointmentData)
      toast.success(appointment ? 'Appointment updated successfully' : 'Appointment scheduled successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to save appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {appointment ? 'Edit Appointment' : 'Schedule Appointment'}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Patient"
                  options={patientOptions}
                  value={formData.patientId}
                  onChange={(e) => handleChange('patientId', e.target.value)}
                  error={errors.patientId}
                  required
                  placeholder="Select a patient"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    error={errors.date}
                    required
                  />
                  <Input
                    label="Time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleChange('time', e.target.value)}
                    error={errors.time}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Duration"
                    options={durationOptions}
                    value={formData.duration}
                    onChange={(e) => handleChange('duration', e.target.value)}
                  />
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                  />
                </div>

                <Input
                  label="Reason for Visit"
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  error={errors.reason}
                  required
                  placeholder="e.g., Annual checkup, Follow-up visit"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm 
                               ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                               focus:ring-2 focus:ring-inset focus:ring-medical-primary"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Additional notes for this appointment..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                  >
                    {appointment ? 'Update Appointment' : 'Schedule Appointment'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AppointmentModal