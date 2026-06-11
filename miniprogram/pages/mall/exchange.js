import { getExchangeRequests, approveExchangeRequest, rejectExchangeRequest } from '../../utils/supabase'
import { getCurrentUser, isParent } from '../../utils/auth'

const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

Page({
  data: {
    requests: [],
    activeTab: 'pending',
    showRejectModal: false,
    rejectReason: '',
    rejectId: null,
    avatarColors,
    isParent: false
  },

  onLoad(options) {
    this.setData({ 
      isParent: isParent(getCurrentUser()),
      activeTab: options?.status || 'pending'
    })
    this.loadRequests()
  },

  onShow() {
    this.loadRequests()
  },

  async loadRequests() {
    const requests = await getExchangeRequests()
    this.setData({ requests })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  get pendingCount() {
    return this.data.requests.filter(r => r.status === 'pending').length
  },

  get filteredRequests() {
    return this.data.requests.filter(r => r.status === this.data.activeTab)
  },

  getStatusClass(status) {
    const classes = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    }
    return classes[status] || ''
  },

  getStatusText(status) {
    const texts = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已驳回'
    }
    return texts[status] || status
  },

  getEmptyText() {
    const texts = {
      pending: '暂无待审核兑换',
      approved: '暂无已通过兑换',
      rejected: '暂无已驳回兑换'
    }
    return texts[this.data.activeTab] || '暂无数据'
  },

  async approveExchange(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认通过',
      content: '确定要通过此兑换申请吗？',
      success: async (res) => {
        if (res.confirm) {
          const result = await approveExchangeRequest(id)
          if (result) {
            wx.showToast({ title: '兑换成功', icon: 'success' })
            await this.loadRequests()
          } else {
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  showRejectModal(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ 
      showRejectModal: true, 
      rejectId: id,
      rejectReason: ''
    })
  },

  hideRejectModal() {
    this.setData({ showRejectModal: false })
  },

  stopPropagation() {},

  onRejectReasonInput(e) {
    this.setData({ rejectReason: e.detail.value })
  },

  async confirmReject() {
    const { rejectId, rejectReason } = this.data
    
    if (!rejectReason.trim()) {
      wx.showToast({ title: '请输入驳回原因', icon: 'none' })
      return
    }

    const result = await rejectExchangeRequest(rejectId, rejectReason)
    if (result) {
      wx.showToast({ title: '已驳回', icon: 'success' })
      this.hideRejectModal()
      await this.loadRequests()
    } else {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  formatTime(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
  }
})