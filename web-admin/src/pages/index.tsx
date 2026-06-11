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

  const avatarColors = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EC4899']

  const statCards = [
    {
      title: '总积分',
      value: totalPoints,
      gradient: 'gradient-primary',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      title: '待审核申请',
      value: pendingRequests,
      gradient: 'gradient-accent',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M-.01 15h.01" />
        </svg>
      )
    },
    {
      title: '任务总数',
      value: totalTasks,
      gradient: 'gradient-success',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      title: '商城商品',
      value: activeProducts,
      gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ]

  return (
    <Layout title="仪表盘">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card glass-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 mb-1">{card.title}</p>
                <p className="font-heading text-3xl font-bold text-surface-800">{card.value}</p>
              </div>
              <div className={`w-14 h-14 rounded-xl ${card.gradient} flex items-center justify-center text-white shadow-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-surface-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="font-heading text-lg font-semibold text-surface-800">积分排行榜</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topMembers.map((member, index) => (
                <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                    index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                    index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white' :
                    'bg-surface-100 text-surface-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md"
                    style={{ backgroundColor: avatarColors[parseInt(member.id) % 5] }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-surface-800">{member.name}</p>
                    <p className="text-sm text-surface-500">{member.role === 'parent' ? '家长' : '孩子'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-xl font-bold text-primary-600">{member.points}</p>
                    <p className="text-xs text-surface-500">积分</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-surface-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="font-heading text-lg font-semibold text-surface-800">最近动态</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentRecords.map((record) => (
                <div key={record.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                    record.points > 0 ? 'gradient-success' : 'bg-gradient-to-r from-danger-400 to-danger-500'
                  } text-white font-bold`}>
                    {record.points > 0 ? '+' : '-'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-surface-800 font-medium">{record.description}</p>
                    <p className="text-xs text-surface-500">
                      {record.family_members?.name} · {record.created_at}
                    </p>
                  </div>
                  <span className={`font-heading font-bold text-lg ${record.points > 0 ? 'text-success-600' : 'text-danger-600'}`}>
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
