import { getFamilyMembers, addFamilyMember, updateFamilyMember } from '../../utils/supabase'
import { getCurrentUser, isParent } from '../../utils/auth'

const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

Page({
  data: {
    members: [],
    avatarColors,
    showModal: false,
    editingMember: null,
    formData: {
      name: '',
      role: 'child',
      points: 0
    },
    isParent: false,
    recordCounts: {}
  },

  onLoad() {
    this.setData({ isParent: isParent(getCurrentUser()) })
    this.loadMembers()
  },

  onShow() {
    this.loadMembers()
  },

  async loadMembers() {
    const members = await getFamilyMembers()
    this.setData({ members })
    await this.loadRecordCounts(members.map(m => m.id))
  },

  async loadRecordCounts(memberIds) {
    const counts = {}
    for (const id of memberIds) {
      counts[id] = await this.getRecordCountFromAPI(id)
    }
    this.setData({ recordCounts: counts })
  },

  async getRecordCountFromAPI(memberId) {
    const { data, error } = await wx.cloud.callFunction({
      name: 'getRecordCount',
      data: { memberId }
    }).catch(() => ({ data: null }))
    
    return data?.count || 0
  },

  getRecordCount(memberId) {
    return this.data.recordCounts[memberId] || 0
  },

  showAddModal() {
    this.setData({
      showModal: true,
      editingMember: null,
      formData: {
        name: '',
        role: 'child',
        points: 0
      }
    })
  },

  hideModal() {
    this.setData({ showModal: false })
  },

  stopPropagation() {},

  onNameInput(e) {
    this.setData({ 'formData.name': e.detail.value })
  },

  onPointsInput(e) {
    this.setData({ 'formData.points': parseInt(e.detail.value) || 0 })
  },

  selectRole(e) {
    const role = e.currentTarget.dataset.role
    this.setData({ 'formData.role': role })
  },

  async saveMember() {
    const { formData, editingMember } = this.data
    
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' })
      return
    }

    let result
    if (editingMember) {
      result = await updateFamilyMember(editingMember.id, {
        name: formData.name,
        role: formData.role,
        points: formData.points
      })
    } else {
      result = await addFamilyMember({
        name: formData.name,
        role: formData.role,
        points: formData.points
      })
    }

    if (result) {
      wx.showToast({ title: editingMember ? '修改成功' : '添加成功', icon: 'success' })
      this.hideModal()
      await this.loadMembers()
    } else {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/members/detail?id=${id}` })
  }
})