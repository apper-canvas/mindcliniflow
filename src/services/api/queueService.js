import { queueData } from '@/services/mockData/queue.json'

class QueueService {
  constructor() {
    this.queueItems = [...queueData]
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 200))
    return [...this.queueItems]
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return this.queueItems.find(item => item.Id === id) || null
  }

  async create(queueData) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const newQueueItem = {
      Id: Math.max(...this.queueItems.map(q => q.Id), 0) + 1,
      ...queueData
    }
    
    this.queueItems.push(newQueueItem)
    return { ...newQueueItem }
  }

  async update(id, queueData) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = this.queueItems.findIndex(item => item.Id === id)
    if (index === -1) {
      throw new Error('Queue item not found')
    }
    
    this.queueItems[index] = { ...this.queueItems[index], ...queueData }
    return { ...this.queueItems[index] }
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const index = this.queueItems.findIndex(item => item.Id === id)
    if (index === -1) {
      throw new Error('Queue item not found')
    }
    
    this.queueItems.splice(index, 1)
    return true
  }

  async getByStatus(status) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return this.queueItems.filter(item => item.status === status)
  }

  async getTodayQueue() {
    await new Promise(resolve => setTimeout(resolve, 200))
    const today = new Date().toISOString().split('T')[0]
    return this.queueItems.filter(item => {
      if (!item.checkInTime) return false
      return item.checkInTime.startsWith(today)
    })
  }
}

export const queueService = new QueueService()