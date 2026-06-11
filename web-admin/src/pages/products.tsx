import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getProducts, addProduct, updateProduct, deleteProduct } from '../utils/supabase'
import { Product } from '../utils/supabase'

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points: 0,
    stock: 0,
    is_active: true
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const data = await getProducts()
    setProducts(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || formData.points <= 0) return

    let result
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, formData)
    } else {
      result = await addProduct(formData)
    }

    if (result) {
      setShowModal(false)
      setEditingProduct(null)
      setFormData({ name: '', description: '', points: 0, stock: 0, is_active: true })
      loadProducts()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除该商品吗？')) {
      const success = await deleteProduct(id)
      if (success) loadProducts()
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      points: product.points,
      stock: product.stock,
      is_active: product.is_active
    })
    setShowModal(true)
  }

  const toggleProductStatus = async (product: Product) => {
    await updateProduct(product.id, { is_active: !product.is_active })
    loadProducts()
  }

  return (
    <Layout title="积分商城">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">🛒 商品管理</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            + 添加商品
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-full h-32 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center text-4xl mb-4">
                  🎁
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-pink-500">{product.points} <span className="text-sm font-normal text-gray-500">积分</span></span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    product.stock > 5 ? 'bg-green-100 text-green-600' : 
                    product.stock > 0 ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-red-100 text-red-600'
                  }`}>
                    库存: {product.stock}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => toggleProductStatus(product)}
                    className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                      product.is_active 
                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {product.is_active ? '上架' : '下架'}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editingProduct ? '编辑商品' : '添加商品'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">商品名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入商品名称"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">商品描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入商品描述"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">积分价格</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="积分"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">库存数量</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="库存"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="text-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">上架商品</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingProduct(null)
                    setFormData({ name: '', description: '', points: 0, stock: 0, is_active: true })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  {editingProduct ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Products
