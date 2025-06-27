import { appointmentData } from '@/services/mockData/appointments.json'

class AppointmentService {
  constructor() {
    this.appointments = [...appointmentData]
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...this.appointments]
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return this.appointments.find(appointment => appointment.Id === id) || null
  }

  async create(appointmentData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newAppointment = {
      Id: Math.max(...this.appointments.map(a => a.Id), 0) + 1,
      ...appointmentData,
      createdAt: new Date().toISOString()
    }
    
    this.appointments.push(newAppointment)
    return { ...newAppointment }
  }

  async update(id, appointmentData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = this.appointments.findIndex(appointment => appointment.Id === id)
    if (index === -1) {
      throw new Error('Appointment not found')
    }
    
    this.appointments[index] = { ...this.appointments[index], ...appointmentData }
    return { ...this.appointments[index] }
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = this.appointments.findIndex(appointment => appointment.Id === id)
    if (index === -1) {
      throw new Error('Appointment not found')
    }
    
    this.appointments.splice(index, 1)
    return true
  }

  async getByPatientId(patientId) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return this.appointments.filter(appointment => appointment.patientId === patientId)
  }

  async getByDateRange(startDate, endDate) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return this.appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date)
      return appointmentDate >= startDate && appointmentDate <= endDate
    })
  }
}

export const appointmentService = new AppointmentService()