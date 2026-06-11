import { getProducts, addProduct, updateProduct, addExchangeRequest } from '../../utils/supabase'
import { getCurrentUser, isParent } from '../../utils/auth'

Page({
  data: {
    products: [],
    currentUser: null,
    showModal: false,
    showDetailModal: false,
    editingProduct: null,
    selectedProduct: null,
    isParent: false,
    formData: {
      name: '',
      description: '',
      points: 0,
      stock: 0
    }
  },

  onLoad() {
    this.setData({ 
      isParent: isParent(getCurrentUser()),
      currentUser: getCurrentUser()
    })
    this.loadProducts()
  },

  onShow() {
    this.loadProducts()
    this.setData({ currentUser: getCurrentUser() })
  },

  async loadProducts() {
    const products = await getProducts()
    this.setData({ products })
  },

  showAddModal() {
    this.setData({
      showModal: true,
      editingProduct: null,
      formData: {
        name: '',
        description: '',
        points: 0,
        stock: 0
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

  onStockInput(e) {
    this.setData({ 'formData.stock': parseInt(e.detail.value) || 0 })
  },

  async saveProduct() {
    const { formData, editingProduct } = this.data
    
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' })
      return
    }

    if (formData.points <= 0) {
      wx.showToast({ title: '请输入正整数积分价格', icon: 'none' })
      return
    }

    let result
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, {
        name: formData.name,
        description: formData.description,
        points: formData.points,
        stock: formData.stock
      })
    } else {
      result = await addProduct({
        name: formData.name,
        description: formData.description,
        points: formData.points,
        stock: formData.stock
      })
    }

    if (result) {
      wx.showToast({ title: editingProduct ? '修改成功' : '添加成功', icon: 'success' })
      this.hideModal()
      await this.loadProducts()
    } else {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  showProductDetail(e) {
    const product = e.currentTarget.dataset.product
    this.setData({ 
      showDetailModal: true, 
      selectedProduct: product 
    })
  },

  hideDetailModal() {
    this.setData({ showDetailModal: false })
  },

  get canExchange() {
    const { selectedProduct, currentUser } = this.data
    if (!selectedProduct || !currentUser) return false
    return currentUser.points >= selectedProduct.points && selectedProduct.stock > 0
  },

  async exchangeProduct() {
    const { selectedProduct } = this.data
    const user = getCurrentUser()

    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }

    if (!this.canExchange) {
      wx.showToast({ 
        title: user.points < selectedProduct.points ? '积分不足' : '库存不足', 
        icon: 'none' 
      })
      return
    }

    wx.showModal({
      title: '确认兑换',
      content: `确定用 ${selectedProduct.points} 积分兑换 "${selectedProduct.name}" 吗？`,
      success: async (res) => {
        if (res.confirm) {
          const result = await addExchangeRequest({
            member_id: user.id,
            product_id: selectedProduct.id
          })

          if (result) {
            wx.showToast({ title: '兑换申请已提交', icon: 'success' })
            this.hideDetailModal()
            await this.loadProducts()
          } else {
            wx.showToast({ title: '兑换失败', icon: 'none' })
          }
        }
      }
    })
  }
})