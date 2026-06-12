'use client'
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getPointRecords } from '../utils/supabase'
import { PointRecord } from '../utils/supabase'
import { FileText, TrendingUp, TrendingDown } from 'lucide-react'

const Records: React.FC = () => {
  const [records, setRecords] = useState<PointRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    setIsLoading(true)
    const data = await getPointRecords()
    setRecords(data)
    setIsLoading(false)
  }

  const totalEarned = records.filter(r => r.points > 0).reduce((sum, r) => sum + r.points, 0)
  const totalSpent = Math.abs(records.filter(r => r.points < 0).reduce((sum, r) => sum + r.points, 0))

  return (
    <Layout title="积分记录">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">积分记录</h1>
        <p className="text-sm text-text-muted mt-1">查看所有积分变动明细</p>
      </div>

      <div className="grid-2 mb-6">
        <div className="stat-card cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">累计加分</p>
              <p className="stat-value mt-2 text-success">+{totalEarned}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-success" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="stat-card cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">累计扣减</p>
              <p className="stat-value mt-2 text-danger">-{totalSpent}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-danger-50 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-danger" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body overflow-x-auto">
          {isLoading ? (
            <div className="py-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-border-light last:border-b-0">
                  <div className="skeleton h-5 w-28" />
                  <div className="flex-1 space-y-1">
                    <div className="skeleton h-4 w-40" />
                    <div className="skeleton h-3 w-28" />
                  </div>
                  <div className="skeleton h-6 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : records.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>成员</th>
                  <th>变动描述</th>
                  <th>积分</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={record.id || index}>
                    <td className="text-text-muted">{record.created_at}</td>
                    <td className="text-text-primary font-medium">{record.family_members?.name}</td>
                    <td>{record.description}</td>
                    <td className={`font-semibold ${record.points >= 0 ? 'text-success' : 'text-danger'}`}>
                      {record.points >= 0 ? '+' : ''}{record.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <FileText className="w-16 h-16 text-text-muted/40" strokeWidth={2} />
              <p className="empty-title">暂无记录</p>
              <p className="empty-description">完成任务或申请积分后显示记录</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Records