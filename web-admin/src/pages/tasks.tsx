'use client'
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getTasks, addTask, updateTask, deleteTask } from '../utils/supabase'
import { Task } from '../utils/supabase'

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'add' as const,
    points: 10,
    is_active: true
  })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const data = await getTasks()
    setTasks(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || formData.points <= 0) return

    let result
    if (editingTask) {
      result = await updateTask(editingTask.id, formData)
    } else {
      result = await addTask(formData)
    }

    if (result) {
      setShowModal(false)
      setEditingTask(null)
      setFormData({ name: '', description: '', type: 'add', points: 10, is_active: true })
      loadTasks()
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除该任务吗？')) {
      const success = await deleteTask(id)
      if (success) loadTasks()
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setFormData({
      name: task.name,
      description: task.description,
      type: task.type,
      points: task.points,
      is_active: task.is_active
    })
    setShowModal(true)
  }

  const toggleTaskStatus = async (task: Task) => {
    await updateTask(task.id, { is_active: !task.is_active })
    loadTasks()
  }

  return (
    <Layout title="任务管理">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">✅ 任务管理</h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            + 添加任务
          </button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">图标</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">任务名称</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">描述</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">类型</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">积分</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl ${
                        task.type === 'add' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {task.type === 'add' ? '⭐' : '⚠️'}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-800">{task.name}</td>
                    <td className="py-4 px-4 text-gray-600 max-w-xs truncate">{task.description || '-'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.type === 'add' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {task.type === 'add' ? '加分任务' : '扣分任务'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-lg font-bold ${
                        task.type === 'add' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {task.type === 'add' ? '+' : '-'}{task.points}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          task.is_active 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {task.is_active ? '进行中' : '已暂停'}
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleEdit(task)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors mr-2"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editingTask ? '编辑任务' : '添加任务'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">任务名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入任务名称"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">任务描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入任务描述"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">任务类型</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="add"
                      checked={formData.type === 'add'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'add' })}
                      className="text-pink-500"
                    />
                    <span>加分任务</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="deduct"
                      checked={formData.type === 'deduct'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'deduct' })}
                      className="text-pink-500"
                    />
                    <span>扣分任务</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">积分值</label>
                <input
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="请输入积分值"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="text-pink-500"
                  />
                  <span className="text-sm font-medium text-gray-700">启用任务</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingTask(null)
                    setFormData({ name: '', description: '', type: 'add', points: 10, is_active: true })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                  {editingTask ? '保存修改' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Tasks
