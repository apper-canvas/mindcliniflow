import { patientData } from '@/services/mockData/patients.json'

class PatientService {
  constructor() {
    this.patients = [...patientData]
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...this.patients]
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return this.patients.find(patient => patient.Id === id) || null
  }

  async create(patientData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const newPatient = {
      Id: Math.max(...this.patients.map(p => p.Id), 0) + 1,
      ...patientData,
      createdAt: new Date().toISOString()
    }
    
    this.patients.push(newPatient)
    return { ...newPatient }
  }

  async update(id, patientData) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = this.patients.findIndex(patient => patient.Id === id)
    if (index === -1) {
      throw new Error('Patient not found')
    }
    
    this.patients[index] = { ...this.patients[index], ...patientData }
    return { ...this.patients[index] }
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = this.patients.findIndex(patient => patient.Id === id)
    if (index === -1) {
      throw new Error('Patient not found')
    }
    
    this.patients.splice(index, 1)
    return true
  }
}

export const patientService = new PatientService()