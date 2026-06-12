'use client'
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { getPointRequests, approvePointRequest, rejectPointRequest } from '../utils/supabase'
import { PointRequest } from '../utils/supabase'
import { ClipboardList, Check, X } from 'lucide-react'

type StatusType = 'all' | 'pending' | 'approved' | 'rejected'

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<PointRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState<StatusType>('all')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [currentRequest, setCurrentRequest] = useState<PointRequest | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    setIsLoading(true)
    const data = await getPointRequests('all')
    setRequests(data)
    setIsLoading(false)
  }

  const filteredRequests = activeStatus === 'all' 
    ? requests 
    : requests.filter(r => r.status === activeStatus)

  const handleApprove = async (request: PointRequest) => {
    await approvePointRequest(request.id)
    loadRequests()
  }

  const handleReject = async () => {
    if (currentRequest) {
      await rejectPointRequest(currentRequest.id, rejectReason)
      loadRequests()
      setShowRejectModal(false)
      setRejectReason('')
      setCurrentRequest(null)
    }
  }

  const openRejectModal = (request: PointRequest) => {
    setCurrentRequest(request)
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
    <Layout title="积分申请">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">积分申请</h1>
          <p className="text-sm text-text-muted mt-1">审核家庭成员的积分申请</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(Object.keys(statusLabels) as StatusType[]).map(status => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
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
                    <div className="skeleton h-4 w-40" />
                  </div>
                  <div className="skeleton h-8 w-20 rounded" />
                  <div className="skeleton h-8 w-32 rounded" />
                </div>
              ))}
            </div>
          ) : filteredRequests.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>申请人</th>
                  <th>申请积分</th>
                  <th>申请理由</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="text-text-primary font-medium">{request.family_members?.name}</td>
                    <td className="font-semibold text-primary">+{request.points}</td>
                    <td className="max-w-xs line-clamp-2">{request.description}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass[request.status as keyof typeof statusBadgeClass]}`}>
                        {statusLabels[request.status as StatusType]}
                      </span>
                    </td>
                    <td>
                      {request.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleApprove(request)}
                            className="btn btn-sm btn-success cursor-pointer"
                          >
                            <Check className="w-4 h-4" strokeWidth={2} />
                            <span>通过</span>
                          </button>
                          <button 
                            onClick={() => openRejectModal(request)}
                            className="btn btn-sm btn-danger cursor-pointer"
                          >
                            <X className="w-4 h-4" strokeWidth={2} />
                            <span>驳回</span>
                          </button>
                        </div>
                      ) : request.status === 'rejected' && request.reject_reason ? (
                        <span className="text-xs text-text-muted">{request.reject_reason}</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <ClipboardList className="w-16 h-16 text-text-muted/40" strokeWidth={2} />
              <p className="empty-title">暂无申请</p>
              <p className="empty-description">家庭成员申请积分后显示</p>
            </div>
          )}
        </div>
      </div>

      {showRejectModal && currentRequest && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-semibold text-text-primary">驳回申请</h2>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" strokeWidth={2} />
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
              <button onClick={() => setShowRejectModal(false)} className="btn btn-secondary cursor-pointer">
                取消
              </button>
              <button onClick={handleReject} className="btn btn-danger cursor-pointer">
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Requests