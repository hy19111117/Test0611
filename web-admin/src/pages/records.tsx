import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getPointRecords } from '../utils/supabase'
import { PointRecord } from '../utils/supabase'

const Records: React.FC = () => {
  const [records, setRecords] = useState<PointRecord[]>([])
  const [filterType, setFilterType] = useState<string | null>(null)

  useEffect(() => {
    loadRecords()
  }, [filterType])

  const loadRecords = async () => {
    const data = await getPointRecords()
    setRecords(data)
  }

  const filteredRecords = filterType 
    ? records.filter(r => r.type === filterType)
    : records

  const typeLabels: Record<string, string> = {
    add: '加分',
    deduct: '扣分',
    exchange: '兑换',
    task: '任务'
  }

  const typeColors: Record<string, string> = {
    add: 'bg-green-100 text-green-600',
    deduct: 'bg-red-100 text-red-600',
    exchange: 'bg-purple-100 text-purple-600',
    task: 'bg-blue-100 text-blue-600'
  }

  const totalAdd = records.filter(r => r.points > 0).reduce((sum, r) => sum + r.points, 0)
  const totalDeduct = records.filter(r => r.points < 0).reduce((sum, r) => sum + Math.abs(r.points), 0)

  return (
    <Layout title="积分明细">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">累计加分</p>
              <p className="text-3xl font-bold text-green-500">+{totalAdd}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">累计扣减</p>
              <p className="text-3xl font-bold text-red-500">-{totalDeduct}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📉</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">📊 积分明细</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === null
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {['add', 'deduct', 'exchange', 'task'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {typeLabels[type]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">类型</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">成员</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">描述</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">积分变化</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">时间</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[record.type]}`}>
                        {typeLabels[record.type]}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-800">
                      {record.family_members?.name || '-'}
                    </td>
                    <td className="py-4 px-4 text-gray-600 max-w-xs truncate">
                      {record.description || '-'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-lg font-bold ${
                        record.points > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {record.points > 0 ? '+' : ''}{record.points}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-sm">
                      {new Date(record.created_at).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Records
