import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const PatientModal = ({ isOpen, onClose, patient, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [userActivity, setUserActivity] = useState(Date.now())
  const modalRef = useRef(null)
  const lastActivityRef = useRef(Date.now())
// Track user activity to prevent auto-close
  const updateActivity = useCallback(() => {
    const now = Date.now()
    setUserActivity(now)
    lastActivityRef.current = now
  }, [])

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (patient) {
        setFormData({
          firstName: patient.firstName || '',
          lastName: patient.lastName || '',
          dateOfBirth: patient.dateOfBirth || '',
          phone: patient.phone || '',
          email: patient.email || '',
          address: patient.address || '',
          emergencyContact: patient.emergencyContact || '',
          notes: patient.notes || ''
        })
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '',
          phone: '',
          email: '',
          address: '',
          emergencyContact: '',
          notes: ''
        })
      }
      setErrors({})
      setIsFormDirty(false)
      updateActivity()
    }
  }, [patient, isOpen, updateActivity])

  // Prevent auto-close by tracking activity and form state
  useEffect(() => {
    if (!isOpen) return

    const handleActivity = () => updateActivity()
    
    // Add activity listeners
    document.addEventListener('mousedown', handleActivity)
    document.addEventListener('keydown', handleActivity)
    document.addEventListener('scroll', handleActivity)
    
    return () => {
      document.removeEventListener('mousedown', handleActivity)
      document.removeEventListener('keydown', handleActivity)
      document.removeEventListener('scroll', handleActivity)
    }
  }, [isOpen, updateActivity])

  // Enhanced close handler with form state check
  const handleClose = useCallback(() => {
    if (loading) {
      return // Prevent closing during save operation
    }
    
    if (isFormDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose()
      }
    } else {
      onClose()
    }
  }, [loading, isFormDirty, onClose])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
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
      await onSave(formData)
      toast.success(patient ? 'Patient updated successfully' : 'Patient created successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to save patient information')
    } finally {
      setLoading(false)
    }
  }

const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsFormDirty(true)
    updateActivity()
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
}

return (
    <AnimatePresence>
      {isOpen && (
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={(e) => {
              // Enhanced backdrop click handling
              e.preventDefault()
              e.stopPropagation()
              if (e.target === e.currentTarget && !loading) {
                handleClose()
              }
            }}
          />
          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-xl"
            onClick={(e) => {
              // Enhanced click prevention
              e.preventDefault()
              e.stopPropagation()
              updateActivity()
            }}
            onMouseDown={updateActivity}
            onKeyDown={updateActivity}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {patient ? 'Edit Patient' : 'Add New Patient'}
                {isFormDirty && <span className="text-orange-500 ml-2">*</span>}
              </h3>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  error={errors.firstName}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  error={errors.lastName}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
                <Input
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  error={errors.phone}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={errors.email}
              />

              <Input
                label="Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />

              <Input
                label="Emergency Contact"
                value={formData.emergencyContact}
                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                placeholder="Name and phone number"
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
                  placeholder="Additional notes about the patient..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                >
                  {patient ? 'Update Patient' : 'Add Patient'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PatientModal