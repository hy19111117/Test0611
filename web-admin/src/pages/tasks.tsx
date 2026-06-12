'use client'
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getTasks, addTask, updateTask, deleteTask } from '../utils/supabase'
import { Task } from '../utils/supabase'

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', points: 0, is_active: true })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setIsLoading(true)
    const data = await getTasks()
    setTasks(data)
    setIsLoading(false)
  }

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task)
      setFormData({ name: task.name, description: task.description, points: task.points, is_active: task.is_active })
    } else {
      setEditingTask(null)
      setFormData({ name: '', description: '', points: 10, is_active: true })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTask(null)
    setFormData({ name: '', description: '', points: 10, is_active: true })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) return
    
    if (editingTask) {
      await updateTask(editingTask.id, formData)
    } else {
      await addTask(formData)
    }
    
    handleCloseModal()
    loadTasks()
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除该任务吗？')) {
      await deleteTask(id)
      loadTasks()
    }
  }

  const handleToggleStatus = async (task: Task) => {
    await updateTask(task.id, { ...task, is_active: !task.is_active })
    loadTasks()
  }

  return (
    <Layout title="任务管理">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">任务管理</h1>
          <p className="text-sm text-text-muted mt-1">管理积分奖惩任务</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          <span>➕</span>
          <span>添加任务</span>
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
                  <div className="skeleton h-8 w-16 rounded" />
                  <div className="skeleton h-5 w-20 rounded" />
                  <div className="skeleton h-8 w-28 rounded" />
                </div>
              ))}
            </div>
          ) : tasks.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>任务名称</th>
                  <th>描述</th>
                  <th>类型</th>
                  <th>积分</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="text-text-primary font-medium">{task.name}</td>
                    <td className="max-w-xs line-clamp-2">{task.description}</td>
                    <td>
                      <span className={`badge ${task.points >= 0 ? 'badge-success' : 'badge-danger'}`}>
                        {task.points >= 0 ? '奖励' : '惩罚'}
                      </span>
                    </td>
                    <td className={`font-semibold ${task.points >= 0 ? 'text-success' : 'text-danger'}`}>
                      {task.points >= 0 ? '+' : ''}{task.points}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleStatus(task)}
                        className={`switch ${task.is_active ? 'active' : ''}`}
                      />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(task)}
                          className="btn btn-sm btn-text"
                        >
                          编辑
                        </button>
                        <button 
                          onClick={() => handleDelete(task.id)}
                          className="btn btn-sm btn-danger"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">✅</span>
              <p className="empty-title">暂无任务</p>
              <p className="empty-description">点击上方按钮添加奖惩任务</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-semibold text-text-primary">
                {editingTask ? '编辑任务' : '添加任务'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">任务名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="请输入任务名称"
                />
              </div>
              <div className="form-group">
                <label className="form-label">任务描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="请输入任务描述"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="form-label">积分（正数奖励，负数惩罚）</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="input"
                  placeholder="请输入积分"
                />
              </div>
              <div className="form-group flex items-center gap-3">
                <label className="form-label">启用状态</label>
                <button 
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`switch ${formData.is_active ? 'active' : ''}`}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={handleCloseModal} className="btn btn-secondary">
                取消
              </button>
              <button onClick={handleSubmit} className="btn btn-primary">
                {editingTask ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Tasks