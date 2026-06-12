'use client'
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getProducts, addProduct, updateProduct, deleteProduct } from '../utils/supabase'
import { Product } from '../utils/supabase'
import { ShoppingCart, Plus, Edit2, Trash2, X } from 'lucide-react'

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', points: 0, stock: 10, is_active: true })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    const data = await getProducts()
    setProducts(data)
    setIsLoading(false)
  }

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({ name: product.name, description: product.description, points: product.points, stock: product.stock, is_active: product.is_active })
    } else {
      setEditingProduct(null)
      setFormData({ name: '', description: '', points: 10, stock: 10, is_active: true })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setFormData({ name: '', description: '', points: 10, stock: 10, is_active: true })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) return
    
    if (editingProduct) {
      await updateProduct(editingProduct.id, formData)
    } else {
      await addProduct(formData)
    }
    
    handleCloseModal()
    loadProducts()
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除该商品吗？')) {
      await deleteProduct(id)
      loadProducts()
    }
  }

  const handleToggleStatus = async (product: Product) => {
    await updateProduct(product.id, { ...product, is_active: !product.is_active })
    loadProducts()
  }

  return (
    <Layout title="积分商城">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">积分商城</h1>
          <p className="text-sm text-text-muted mt-1">管理可兑换商品</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>添加商品</span>
        </button>
      </div>

      <div className="card">
        <div className="card-body overflow-x-auto">
          {isLoading ? (
            <div className="py-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-border-light last:border-b-0">
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-32" />
                    <div className="skeleton h-4 w-48" />
                  </div>
                  <div className="skeleton h-8 w-20 rounded" />
                  <div className="skeleton h-5 w-16 rounded" />
                  <div className="skeleton h-8 w-28 rounded" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>商品名称</th>
                  <th>描述</th>
                  <th>所需积分</th>
                  <th>库存</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="text-text-primary font-medium">{product.name}</td>
                    <td className="max-w-xs line-clamp-2">{product.description}</td>
                    <td className="font-semibold text-primary">{product.points}</td>
                    <td className={product.stock === 0 ? 'text-danger font-medium' : 'text-text-secondary'}>
                      {product.stock === 0 ? '已售罄' : `库存: ${product.stock}`}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleStatus(product)}
                        className={`switch ${product.is_active ? 'active' : ''} cursor-pointer`}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="btn btn-sm btn-text cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={2} />
                          <span>编辑</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="btn btn-sm btn-danger cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                          <span>删除</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <ShoppingCart className="w-16 h-16 text-text-muted/40" strokeWidth={2} />
              <p className="empty-title">暂无商品</p>
              <p className="empty-description">点击上方按钮添加商城商品</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-semibold text-text-primary">
                {editingProduct ? '编辑商品' : '添加商品'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">商品名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="请输入商品名称"
                />
              </div>
              <div className="form-group">
                <label className="form-label">商品描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="请输入商品描述"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label">所需积分</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="input"
                  placeholder="请输入所需积分"
                />
              </div>
              <div className="form-group">
                <label className="form-label">库存数量</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  className="input"
                  placeholder="请输入库存数量"
                />
              </div>
              <div className="form-group flex items-center gap-3">
                <label className="form-label">上架状态</label>
                <button 
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`switch ${formData.is_active ? 'active' : ''} cursor-pointer`}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseModal} className="btn btn-secondary cursor-pointer">
                取消
              </button>
              <button onClick={handleSubmit} className="btn btn-primary cursor-pointer">
                {editingProduct ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Products