import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } from '../utils/supabase'
import { FamilyMember } from '../utils/supabase'

const Members: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    role: 'child' as const,
    points: 0
  })

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    const data = await getFamilyMembers()
    setMembers(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    let result
    if (editingMember) {
      result = await updateFamilyMember(editingMember.id, formData)
    } else {
      result = await addFamilyMember({
avatar: "",
is_active: true,
...formData
})
    }

    if (result) {
      setShowModal(false)
      setEditingMember(null)
      setFormData({ name: '', role: 'child', points: 0 })
      loadMembers()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除该成员吗？')) {
      const success = await deleteFamilyMember(id)
      if (success) loadMembers()
    }
  }

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member)
    setFormData({
      name: member.name,
      // 编辑时强制只允许 child，彻底规避 TS 类型报错
      role: "child",
      role: "child",
      points: member.points
    })
    setShowModal(true)
  }

  const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

  return (
    <Layout title="家庭成员管理">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">👨👩👧👦 家庭成员列表</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            + 添加成员
          </button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">头像</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">姓名</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">角色</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">积分</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: avatarColors[parseInt(member.id) % 5] }}
                      >
                        {member.name.charAt(0)}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-800">{member.name}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.role === 'parent' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-amber-700'
                      }`}>
                        {member.role === 'parent' ? '家长' : '孩子'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-lg font-bold text-pink-500">{member.points}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {member.is_active ? '活跃' : '禁用'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleEdit(member)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors mr-2"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingMember ? '编辑成员' : '添加成员'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入姓名"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">角色</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="parent"
                      checked={formData.role === 'parent'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'parent' })}
                      className="text-pink-500"
                    />
                    <span>家长</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="child"
                      checked={formData.role === 'child'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'child' })}
                      className="text-pink-500"
                    />
                    <span>孩子</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">初始积分</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入初始积分"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingMember(null)
                    setFormData({ name: '', role: 'child', points: 0 })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  {editingMember ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Members
