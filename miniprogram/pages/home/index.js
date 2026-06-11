import { getFamilyMembers, getPointRequests, getPointRecords } from '../../utils/supabase'
import { getCurrentUser, isParent } from '../../utils/auth'

const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

Page({
  data: {
    currentUser: null,
    familyMembers: [],
    topMembers: [],
    pendingRequests: [],
    todayEarned: 0,
    todaySpent: 0,
    avatarColors
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    const user = getCurrentUser()
    this.setData({ currentUser: user })

    await this.loadMembers()
    await this.loadRequests()
    await this.loadTodayRecords()
  },

  async loadMembers() {
    const members = await getFamilyMembers()
    const sortedMembers = [...members].sort((a, b) => b.points - a.points)
    this.setData({
      familyMembers: members,
      topMembers: sortedMembers.slice(0, 3)
    })
  },

  async loadRequests() {
    const user = getCurrentUser()
    if (isParent(user)) {
      const requests = await getPointRequests('pending')
      this.setData({ pendingRequests: requests.slice(0, 3) })
    }
  },

  async loadTodayRecords() {
    const user = getCurrentUser()
    if (!user) return

    const records = await getPointRecords(user.id)
    const today = new Date().toDateString()
    
    let earned = 0
    let spent = 0
    
    records.forEach(record => {
      const recordDate = new Date(record.created_at).toDateString()
      if (recordDate === today) {
        if (record.points > 0) {
          earned += record.points
        } else {
          spent += Math.abs(record.points)
        }
      }
    })

    this.setData({ todayEarned: earned, todaySpent: spent })
  },

  goToRanking() {
    wx.switchTab({ url: '/pages/points/index' })
  },

  goToRequests() {
    wx.navigateTo({ url: '/pages/points/requests' })
  },

  goToMemberDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/members/detail?id=${id}` })
  },

  goToTasks() {
    wx.switchTab({ url: '/pages/tasks/index' })
  },

  goToMall() {
    wx.switchTab({ url: '/pages/mall/index' })
  },

  goToRecords() {
    wx.switchTab({ url: '/pages/points/index' })
  }
})