'use client'
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getExchangeRequests, approveExchangeRequest, rejectExchangeRequest } from '../utils/supabase'
import { ExchangeRequest } from '../utils/supabase'

const Exchanges: React.FC = () => {
  const [requests, setRequests] = useState<ExchangeRequest[]>([])
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    loadRequests()
  }, [filterStatus])

  const loadRequests = async () => {
    const data = await getExchangeRequests(filterStatus || undefined)
    setRequests(data)
  }

  const handleApprove = async (id: string) => {
    const success = await approveExchangeRequest(id)
    if (success) loadRequests()
  }

  const handleReject = async () => {
    if (rejectModal && rejectReason.trim()) {
      const success = await rejectExchangeRequest(rejectModal, rejectReason)
      if (success) {
        setRejectModal(null)
        setRejectReason('')
        loadRequests()
      }
    }
  }

  const avatarColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-600',
    approved: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-600'
  }

  const statusLabels: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回'
  }

  return (
    <Layout title="兑换申请审核">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">🎁 兑换申请列表</h2>
            <div className="flex gap-2">
              {[null, 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status || 'all'}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status ? statusLabels[status] : '全部'}
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
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">兑换人</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">兑换商品</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">所需积分</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">申请时间</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: avatarColors[parseInt(request.member_id) % 5] }}
                        >
                          {request.family_members?.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-gray-800">{request.family_members?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-800">
                      <div className="flex items-center gap-2">
                        <span>🎁</span>
                        <span>{request.products?.name || '未知商品'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-lg font-bold text-pink-500">{request.points}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-500 text-sm">
                      {request.created_at}
                    </td>
                    <td className="py-4 px-4">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors mr-2"
                          >
                            通过
                          </button>
                          <button
                            onClick={() => setRejectModal(request.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            驳回
                          </button>
                        </>
                      )}
                      {request.status === 'rejected' && request.reject_reason && (
                        <span className="text-xs text-gray-500">原因: {request.reject_reason}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">驳回兑换申请</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">驳回原因</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="请输入驳回原因"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRejectModal(null)
                  setRejectReason('')
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Exchanges
