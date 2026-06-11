'use client'
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getFamilyMembers, getTasks, getPointRequests, getPointRecords, getProducts } from '../utils/supabase'
import { FamilyMember, Task, PointRequest, PointRecord, Product } from '../utils/supabase'

const Dashboard: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [requests, setRequests] = useState<PointRequest[]>([])
  const [records, setRecords] = useState<PointRecord[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [memberData, taskData, requestData, recordData, productData] = await Promise.all([
      getFamilyMembers(),
      getTasks(),
      getPointRequests('pending'),
      getPointRecords(),
      getProducts()
    ])
    setMembers(memberData)
    setTasks(taskData)
    setRequests(requestData)
    setRecords(recordData)
    setProducts(productData)
  }

  const totalPoints = members.reduce((sum, m) => sum + m.points, 0)
  const pendingRequests = requests.length
  const totalTasks = tasks.length
  const activeProducts = products.filter(p => p.is_active).length

  const topMembers = [...members].sort((a, b) => b.points - a.points).slice(0, 5)
  const recentRecords = records.slice(0, 5)

  const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

  return (
    <Layout title="仪表盘">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总积分</p>
              <p className="text-3xl font-bold text-pink-500">{totalPoints}</p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">待审核申请</p>
              <p className="text-3xl font-bold text-orange-500">{pendingRequests}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">任务总数</p>
              <p className="text-3xl font-bold text-blue-500">{totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">商城商品</p>
              <p className="text-3xl font-bold text-green-500">{activeProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">🏆 积分排行榜</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topMembers.map((member, index) => (
                <div key={member.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-400 text-white' :
                    index === 1 ? 'bg-gray-300 text-white' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: avatarColors[parseInt(member.id) % 5] }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role === 'parent' ? '家长' : '孩子'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-pink-500">{member.points}</p>
                    <p className="text-xs text-gray-500">积分</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">📊 最近动态</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentRecords.map((record) => (
                <div key={record.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    record.points > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {record.points > 0 ? '+' : '-'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{record.description}</p>
                    <p className="text-xs text-gray-500">
                      {record.family_members?.name} · {record.created_at}
                    </p>
                  </div>
                  <span className={`font-semibold ${record.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {record.points > 0 ? '+' : ''}{record.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
