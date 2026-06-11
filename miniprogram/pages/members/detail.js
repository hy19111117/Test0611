import { getFamilyMembers, updateFamilyMember, deleteFamilyMember, getPointRecords, addPointRecord, updateMemberPoints } from '../../utils/supabase'
import { getCurrentUser, isParent } from '../../utils/auth'

const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

Page({
  data: {
    member: null,
    records: [],
    avatarColors,
    isParent: false,
    showEditModal: false,
    showPointsModal: false,
    formData: {
      name: '',
      role: 'child'
    },
    pointsChange: 0,
    pointsRemark: '',
    totalEarned: 0,
    totalSpent: 0
  },

  onLoad(options) {
    const id = options?.id
    this.setData({ isParent: isParent(getCurrentUser()) })
    this.loadMember(id)
    this.loadRecords(id)
  },

  async loadMember(id) {
    const members = await getFamilyMembers()
    const member = members.find(m => m.id === id)
    this.setData({ 
      member,
      formData: {
        name: member?.name || '',
        role: member?.role || 'child'
      }
    })
  },

  async loadRecords(memberId) {
    const records = await getPointRecords(memberId)
    
    let earned = 0
    let spent = 0
    records.forEach(r => {
      if (r.points > 0) {
        earned += r.points
      } else {
        spent += Math.abs(r.points)
      }
    })

    this.setData({ records, totalEarned: earned, totalSpent: spent })
  },

  showEditModal() {
    this.setData({ showEditModal: true })
  },

  hideEditModal() {
    this.setData({ showEditModal: false })
  },

  stopPropagation() {},

  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value })
  },

  selectRole(e) {
    const role = e.currentTarget.dataset.role
    this.setData({ 'formData.role': role })
  },

  async saveEdit() {
    const { formData, member } = this.data
    
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }

    const result = await updateFamilyMember(member.id, {
      name: formData.name,
      role: formData.role
    })

    if (result) {
      wx.showToast({ title: '修改成功', icon: 'success' })
      this.hideEditModal()
      await this.loadMember(member.id)
    } else {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  showPointsModal() {
    this.setData({ showPointsModal: true, pointsChange: 0, pointsRemark: '' })
  },

  hidePointsModal() {
    this.setData({ showPointsModal: false })
  },

  onPointsChangeInput(e) {
    this.setData({ pointsChange: parseInt(e.detail.value) || 0 })
  },

  onPointsRemarkInput(e) {
    this.setData({ pointsRemark: e.detail.value })
  },

  changePoints(delta) {
    const current = this.data.pointsChange || 0
    this.setData({ pointsChange: current + delta })
  },

  async adjustPoints() {
    const { member, pointsChange, pointsRemark } = this.data
    
    if (pointsChange === 0) {
      wx.showToast({ title: '请输入非零的积分值', icon: 'none' })
      return
    }

    const success = await updateMemberPoints(member.id, pointsChange)
    
    if (success) {
      await addPointRecord({
        member_id: member.id,
        points: pointsChange,
        type: pointsChange > 0 ? 'add' : 'deduct',
        description: pointsRemark || (pointsChange > 0 ? '管理员加分' : '管理员扣分')
      })
      
      wx.showToast({ title: '调整成功', icon: 'success' })
      this.hidePointsModal()
      await this.loadMember(member.id)
      await this.loadRecords(member.id)
    } else {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async deleteMember() {
    const { member } = this.data
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${member.name} 吗？`,
      success: async (res) => {
        if (res.confirm) {
          const success = await deleteFamilyMember(member.id)
          if (success) {
            wx.showToast({ title: '删除成功', icon: 'success' })
            setTimeout(() => {
              wx.navigateBack()
            }, 1000)
          } else {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
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
  },

  goToRequests() {
    const id = this.data.member?.id
    wx.navigateTo({ url: `/pages/points/requests?memberId=${id}` })
  },

  goToExchange() {
    const id = this.data.member?.id
    wx.navigateTo({ url: `/pages/mall/exchange?memberId=${id}` })
  }
})