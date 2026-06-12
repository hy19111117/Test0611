'use client'
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getFamilyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } from '../utils/supabase'
import { FamilyMember } from '../utils/supabase'
import { Users, Plus, Edit2, Trash2, User, X } from 'lucide-react'

const Members: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [formData, setFormData] = useState({ name: '', role: 'child' as const, points: 0 })

  const avatarColors = ['#F9943B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    setIsLoading(true)
    const data = await getFamilyMembers()
    setMembers(data)
    setIsLoading(false)
  }

  const handleOpenModal = (member?: FamilyMember) => {
    if (member) {
      setEditingMember(member)
      setFormData({ name: member.name, role: member.role, points: member.points })
    } else {
      setEditingMember(null)
      setFormData({ name: '', role: 'child', points: 0 })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMember(null)
    setFormData({ name: '', role: 'child', points: 0 })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) return
    
    if (editingMember) {
      await updateFamilyMember(editingMember.id, { ...formData, is_active: true })
    } else {
      await addFamilyMember({ ...formData, avatar: '', is_active: true })
    }
    
    handleCloseModal()
    loadMembers()
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除该成员吗？')) {
      await deleteFamilyMember(id)
      loadMembers()
    }
  }

  return (
    <Layout title="成员管理">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">成员管理</h1>
          <p className="text-sm text-text-muted mt-1">管理家庭成员信息和积分</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary cursor-pointer"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>添加成员</span>
        </button>
      </div>

      <div className="card">
        <div className="card-body overflow-x-auto">
          {isLoading ? (
            <div className="py-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-border-light last:border-b-0">
                  <div className="skeleton w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-5 w-24" />
                    <div className="skeleton h-4 w-32" />
                  </div>
                  <div className="skeleton h-8 w-24 rounded" />
                </div>
              ))}
            </div>
          ) : members.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>头像</th>
                  <th>姓名</th>
                  <th>角色</th>
                  <th>积分</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: avatarColors[parseInt(member.id) % 5] }}
                      >
                        <User className="w-5 h-5" strokeWidth={2} />
                      </div>
                    </td>
                    <td className="text-text-primary font-medium">{member.name}</td>
                    <td>
                      <span className={`badge ${member.role === 'parent' ? 'badge-primary' : 'badge-success'}`}>
                        {member.role === 'parent' ? '家长' : '孩子'}
                      </span>
                    </td>
                    <td className="font-semibold text-text-primary">{member.points}</td>
                    <td>
                      <span className={member.is_active ? 'badge-success' : 'badge-gray'}>
                        {member.is_active ? '激活' : '禁用'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(member)}
                          className="btn btn-sm btn-text cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={2} />
                          <span>编辑</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
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
              <Users className="w-16 h-16 text-text-muted/40" strokeWidth={2} />
              <p className="empty-title">暂无成员</p>
              <p className="empty-description">点击上方按钮添加家庭成员</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-semibold text-text-primary">
                {editingMember ? '编辑成员' : '添加成员'}
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
                <label className="form-label">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="请输入姓名"
                />
              </div>
              <div className="form-group">
                <label className="form-label">角色</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'parent' | 'child' })}
                  className="select"
                >
                  <option value="parent">家长</option>
                  <option value="child">孩子</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">初始积分</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="input"
                  placeholder="请输入初始积分"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseModal} className="btn btn-secondary cursor-pointer">
                取消
              </button>
              <button onClick={handleSubmit} className="btn btn-primary cursor-pointer">
                {editingMember ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Members