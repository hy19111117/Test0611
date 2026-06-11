import { getFamilyMembers, getPointRecords } from '../../utils/supabase'

const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

Page({
  data: {
    activeTab: 'ranking',
    filterType: 'all',
    members: [],
    records: [],
    ranking: [],
    avatarColors,
    weeklyStats: { earned: 0, spent: 0, total: 0 },
    monthlyStats: { earned: 0, spent: 0, total: 0 },
    taskStats: []
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    await this.loadMembers()
    await this.loadRecords()
    this.calculateStats()
  },

  async loadMembers() {
    const members = await getFamilyMembers()
    const ranking = [...members].sort((a, b) => b.points - a.points)
    this.setData({ members, ranking })
  },

  async loadRecords() {
    const records = await getPointRecords()
    this.setData({ records })
  },

  calculateStats() {
    const { records } = this.data
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

    let weeklyEarned = 0, weeklySpent = 0
    let monthlyEarned = 0, monthlySpent = 0
    const taskMap = {}

    records.forEach(record => {
      const date = new Date(record.created_at)
      const points = record.points

      if (date >= weekAgo) {
        if (points > 0) weeklyEarned += points
        else weeklySpent += Math.abs(points)
      }

      if (date >= monthAgo) {
        if (points > 0) monthlyEarned += points
        else monthlySpent += Math.abs(points)
      }

      const desc = record.description || record.type
      if (!taskMap[desc]) {
        taskMap[desc] = { name: desc, count: 0, points: 0 }
      }
      taskMap[desc].count++
      taskMap[desc].points += points
    })

    const taskStats = Object.values(taskMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    this.setData({
      weeklyStats: {
        earned: weeklyEarned,
        spent: weeklySpent,
        total: weeklyEarned - weeklySpent
      },
      monthlyStats: {
        earned: monthlyEarned,
        spent: monthlySpent,
        total: monthlyEarned - monthlySpent
      },
      taskStats
    })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  setFilter(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ filterType: type })
  },

  get filteredRecords() {
    const { records, filterType } = this.data
    if (filterType === 'all') return records
    if (filterType === 'add') return records.filter(r => r.points > 0)
    return records.filter(r => r.points < 0)
  },

  recordIcon(type) {
    const icons = {
      add: '➕',
      deduct: '➖',
      exchange: '🎁',
      task: '✅'
    }
    return icons[type] || '📝'
  },

  recordIconClass(type) {
    const classes = {
      add: 'icon-add',
      deduct: 'icon-deduct',
      exchange: 'icon-exchange',
      task: 'icon-task'
    }
    return classes[type] || 'icon-default'
  },

  getDefaultDesc(type) {
    const descs = {
      add: '管理员加分',
      deduct: '管理员扣分',
      exchange: '积分兑换',
      task: '完成任务'
    }
    return descs[type] || '积分变动'
  },

  formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }
})