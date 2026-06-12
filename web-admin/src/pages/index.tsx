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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
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
    setIsLoading(false)
  }

  const totalPoints = members.reduce((sum, m) => sum + m.points, 0)
  const pendingRequests = requests.length
  const totalTasks = tasks.length
  const activeProducts = products.filter(p => p.is_active).length

  const topMembers = [...members].sort((a, b) => b.points - a.points).slice(0, 5)
  const recentRecords = records.slice(0, 5)

  const avatarColors = ['#F9943B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']

  const statCards = [
    { title: '总积分', value: totalPoints, icon: '⭐' },
    { title: '待审核申请', value: pendingRequests, icon: '📋' },
    { title: '任务总数', value: totalTasks, icon: '📝' },
    { title: '商城商品', value: activeProducts, icon: '🎁' }
  ]

  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-yellow-100 text-yellow-700'
    if (index === 1) return 'bg-gray-100 text-gray-600'
    if (index === 2) return 'bg-amber-100 text-amber-700'
    return 'bg-bg-hover text-text-secondary'
  }

  return (
    <Layout title="仪表盘">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">家庭积分管理系统</h1>
        <p className="text-sm text-text-muted mt-1">欢迎回来，查看今日积分动态</p>
      </div>

      <div className="grid-4 mb-6">
        {statCards.map((card, index) => (
          <div 
            key={index} 
            className="stat-card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">{card.title}</p>
                <p className="stat-value mt-2">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <h2 className="font-semibold text-text-primary">积分排行榜</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg-hover">
                      <div className="skeleton w-6 h-6 rounded-full" />
                      <div className="skeleton w-8 h-8 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <div className="skeleton h-4 w-20" />
                        <div className="skeleton h-3 w-12" />
                      </div>
                      <div className="skeleton h-5 w-12 rounded" />
                    </div>
                  ))}
                </div>
              ) : topMembers.length > 0 ? (
                topMembers.map((member, index) => (
                  <div 
                    key={member.id} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-hover transition-colors"
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankStyle(index)}`}>
                      {index + 1}
                    </span>
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-sm" 
                      style={{ backgroundColor: avatarColors[parseInt(member.id) % 5] }}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{member.name}</p>
                      <p className="text-xs text-text-muted">{member.role === 'parent' ? '家长' : '孩子'}</p>
                    </div>
                    <span className="font-bold text-primary">{member.points}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">👨‍👩‍👧</span>
                  <p className="empty-title">暂无成员</p>
                  <p className="empty-description">添加家庭成员开始积分管理</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <h2 className="font-semibold text-text-primary">最近动态</h2>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-2">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-bg-hover">
                      <div className="skeleton w-8 h-8 rounded-lg" />
                      <div className="flex-1 space-y-1">
                        <div className="skeleton h-4 w-32" />
                        <div className="skeleton h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentRecords.length > 0 ? (
                recentRecords.map((record, index) => (
                  <div 
                    key={record.id || index} 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-bg-hover transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      record.points > 0 ? 'bg-success-50' : 'bg-danger-50'
                    }`}>
                      <span className={`text-sm font-bold ${record.points > 0 ? 'text-success' : 'text-danger'}`}>
                        {record.points > 0 ? '+' : ''}{record.points}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{record.description}</p>
                      <p className="text-xs text-text-muted">{record.family_members?.name} · {record.created_at}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📝</span>
                  <p className="empty-title">暂无记录</p>
                  <p className="empty-description">完成任务或申请积分后显示</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard