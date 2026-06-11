import { getTasks, addTask, updateTask, addPointRequest } from '../../utils/supabase'
import { getCurrentUser, isParent } from '../../utils/auth'

Page({
  data: {
    tasks: [],
    activeTab: 'all',
    showModal: false,
    showRequestModal: false,
    editingTask: null,
    selectedTask: null,
    requestDesc: '',
    formData: {
      name: '',
      description: '',
      type: 'add',
      points: 10
    },
    isParent: false
  },

  onLoad() {
    this.setData({ isParent: isParent(getCurrentUser()) })
    this.loadTasks()
  },

  onShow() {
    this.loadTasks()
  },

  async loadTasks() {
    const tasks = await getTasks()
    this.setData({ tasks })
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  get filteredTasks() {
    const { tasks, activeTab } = this.data
    if (activeTab === 'all') return tasks
    return tasks.filter(t => t.type === activeTab)
  },

  showAddModal() {
    this.setData({
      showModal: true,
      editingTask: null,
      formData: {
        name: '',
        description: '',
        type: 'add',
        points: 10
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

  onDescInput(e) {
    this.setData({ 'formData.description': e.detail.value })
  },

  onPointsInput(e) {
    this.setData({ 'formData.points': parseInt(e.detail.value) || 0 })
  },

  selectType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ 'formData.type': type })
  },

  async saveTask() {
    const { formData, editingTask } = this.data
    
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入任务名称', icon: 'none' })
      return
    }

    if (formData.points <= 0) {
      wx.showToast({ title: '请输入正整数积分', icon: 'none' })
      return
    }

    let result
    if (editingTask) {
      result = await updateTask(editingTask.id, {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        points: formData.points
      })
    } else {
      result = await addTask({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        points: formData.points
      })
    }

    if (result) {
      wx.showToast({ title: editingTask ? '修改成功' : '添加成功', icon: 'success' })
      this.hideModal()
      await this.loadTasks()
    } else {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  showEditModal(e) {
    const task = e.currentTarget.dataset.task
    this.setData({
      showModal: true,
      editingTask: task,
      formData: {
        name: task.name,
        description: task.description,
        type: task.type,
        points: task.points
      }
    })
  },

  submitRequest(e) {
    const task = e.currentTarget.dataset.task
    this.setData({ 
      showRequestModal: true, 
      selectedTask: task,
      requestDesc: ''
    })
  },

  hideRequestModal() {
    this.setData({ showRequestModal: false })
  },

  onRequestDescInput(e) {
    this.setData({ requestDesc: e.detail.value })
  },

  async confirmRequest() {
    const { selectedTask, requestDesc } = this.data
    const user = getCurrentUser()

    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    const result = await addPointRequest({
      member_id: user.id,
      task_id: selectedTask.id,
      points: selectedTask.type === 'add' ? selectedTask.points : -selectedTask.points,
      description: requestDesc || `完成任务: ${selectedTask.name}`
    })

    if (result) {
      wx.showToast({ title: '申请成功，等待审核', icon: 'success' })
      this.hideRequestModal()
    } else {
      wx.showToast({ title: '申请失败', icon: 'none' })
    }
  }
})