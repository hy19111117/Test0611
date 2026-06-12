'use client'
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getExchangeRequests, approveExchangeRequest, rejectExchangeRequest } from '../utils/supabase'
import { ExchangeRequest } from '../utils/supabase'

type StatusType = 'all' | 'pending' | 'approved' | 'rejected'

const Exchanges: React.FC = () => {
  const [exchanges, setExchanges] = useState<ExchangeRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<StatusType>('all')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [currentExchange, setCurrentExchange] = useState<ExchangeRequest | null>(null)

  useEffect(() => {
    loadExchanges()
  }, [])

  const loadExchanges = async () => {
    setIsLoading(true)
    const data = await getExchangeRequests()
    setExchanges(data)
    setIsLoading(false)
  }

  const filteredExchanges = activeStatus === 'all' 
    ? exchanges 
    : exchanges.filter(e => e.status === activeStatus)

  const handleApprove = async (exchange: ExchangeRequest) => {
    await approveExchangeRequest(exchange.id)
    loadExchanges()
  }

  const handleReject = async () => {
    if (currentExchange) {
      await rejectExchangeRequest(currentExchange.id, rejectReason)
      loadExchanges()
      setShowRejectModal(false)
      setRejectReason('')
      setCurrentExchange(null)
    }
  }

  const openRejectModal = (exchange: ExchangeRequest) => {
    setCurrentExchange(exchange)
    setShowRejectModal(true)
  }

  const statusLabels = {
    all: '全部',
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回'
  }

  const statusBadgeClass = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-gray'
  }

  return (
    <Layout title="兑换记录">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">兑换记录</h1>
          <p className="text-sm text-text-muted mt-1">审核家庭成员的兑换申请</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(Object.keys(statusLabels) as StatusType[]).map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeStatus === status
                ? 'bg-primary text-white'
                : 'bg-white text-text-secondary border border-border hover:bg-bg-hover'
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
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
                  <div className="skeleton h-8 w-20 rounded" />
                  <div className="skeleton h-8 w-32 rounded" />
                </div>
              ))}
            </div>
          ) : filteredExchanges.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>兑换人</th>
                  <th>兑换商品</th>
                  <th>消耗积分</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredExchanges.map((exchange) => (
                  <tr key={exchange.id}>
                    <td className="text-text-primary font-medium">{exchange.family_members?.name}</td>
                    <td className="text-text-primary">{exchange.products?.name}</td>
                    <td className="font-semibold text-danger">-{exchange.points}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass[exchange.status as keyof typeof statusBadgeClass]}`}>
                        {statusLabels[exchange.status as StatusType]}
                      </span>
                    </td>
                    <td>
                      {exchange.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleApprove(exchange)}
                            className="btn btn-sm btn-success"
                          >
                            通过
                          </button>
                          <button 
                            onClick={() => openRejectModal(exchange)}
                            className="btn btn-sm btn-danger"
                          >
                            驳回
                          </button>
                        </div>
                      ) : exchange.status === 'rejected' && exchange.reject_reason ? (
                        <span className="text-xs text-text-muted">{exchange.reject_reason}</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">🎁</span>
              <p className="empty-title">暂无兑换记录</p>
              <p className="empty-description">家庭成员兑换商品后显示</p>
            </div>
          )}
        </div>
      </div>

      {showRejectModal && currentExchange && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-semibold text-text-primary">驳回兑换</h2>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">驳回原因</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="input"
                  placeholder="请输入驳回原因"
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowRejectModal(false)} className="btn btn-secondary">
                取消
              </button>
              <button onClick={handleReject} className="btn btn-danger">
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