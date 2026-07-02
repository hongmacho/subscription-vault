'use client'

import { useEffect, useState } from 'react'
import { Subscription, CATEGORY_LABELS, SubscriptionCategory } from '@/lib/types'
import { formatKRW, getCategoryLabel } from '@/lib/utils'

async function fetchSubscriptions() {
  const response = await fetch('/api/subscriptions')
  if (!response.ok) return []
  return response.json()
}

async function saveSubscription(data: Record<string, unknown>, id?: number) {
  const response = await fetch(`/api/subscriptions${id ? `/${id}` : ''}`, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return response.json()
}

async function deleteSubscription(id: number) {
  await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    category: SubscriptionCategory.OTHER,
    monthlyPrice: '',
    billingDayOfMonth: '',
    contractStartDate: '',
    contractType: 'monthly',
    notes: '',
  })

  const loadSubscriptions = async () => {
    try {
      const data = await fetchSubscriptions()
      setSubscriptions(data)
    } catch (error) {
      console.error('Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  // Apply filters whenever subscriptions or filter criteria change
  useEffect(() => {
    let filtered = subscriptions

    if (searchQuery.trim()) {
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterCategory) {
      filtered = filtered.filter(sub => sub.category === filterCategory)
    }

    setFilteredSubscriptions(filtered)
  }, [subscriptions, searchQuery, filterCategory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await saveSubscription({
        name: formData.name,
        category: formData.category,
        monthlyPrice: parseInt(formData.monthlyPrice) || 0,
        billingDayOfMonth: parseInt(formData.billingDayOfMonth) || 1,
        contractStartDate: formData.contractStartDate,
        contractType: formData.contractType,
        notes: formData.notes,
      }, editingId || undefined)

      setFormData({
        name: '',
        category: SubscriptionCategory.OTHER,
        monthlyPrice: '',
        billingDayOfMonth: '',
        contractStartDate: '',
        contractType: 'monthly',
        notes: '',
      })
      setShowForm(false)
      setEditingId(null)
      await loadSubscriptions()
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  const handleEdit = (sub: Subscription) => {
    setFormData({
      name: sub.name,
      category: sub.category as SubscriptionCategory,
      monthlyPrice: sub.monthlyPrice.toString(),
      billingDayOfMonth: sub.billingDayOfMonth.toString(),
      contractStartDate: sub.contractStartDate,
      contractType: sub.contractType,
      notes: sub.notes || '',
    })
    setEditingId(sub.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('이 구독을 삭제하시겠습니까?')) return
    try {
      await deleteSubscription(id)
      await loadSubscriptions()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">로딩 중...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">구독 목록</h1>
        <button
          onClick={() => {
            setFormData({
              name: '',
              category: SubscriptionCategory.OTHER,
              monthlyPrice: '',
              billingDayOfMonth: '',
              contractStartDate: '',
              contractType: 'monthly',
              notes: '',
            })
            setEditingId(null)
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + 구독 추가
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? '구독 수정' : '새 구독 추가'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">서비스명</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  월간 비용 (원)
                </label>
                <input
                  type="number"
                  required
                  value={formData.monthlyPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyPrice: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">결제일</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={formData.billingDayOfMonth}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billingDayOfMonth: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  카테고리
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as SubscriptionCategory })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  계약 시작일
                </label>
                <input
                  type="date"
                  required
                  value={formData.contractStartDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contractStartDate: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  계약 유형
                </label>
                <select
                  value={formData.contractType}
                  onChange={(e) =>
                    setFormData({ ...formData, contractType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
                >
                  <option value="monthly">월간</option>
                  <option value="annual">연간</option>
                  <option value="one_time">일회</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">메모</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      {subscriptions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">검색</label>
              <input
                type="text"
                placeholder="서비스명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 text-sm"
              >
                <option value="">모든 카테고리</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilterCategory('')
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      {subscriptions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 mb-8">아직 등록된 구독이 없습니다</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            + 첫 구독 추가하기
          </button>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500 mb-8">검색 결과가 없습니다</p>
          <button
            onClick={() => {
              setSearchQuery('')
              setFilterCategory('')
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium">
                    서비스명
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium">
                    월간 비용
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium">
                    결제일
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {filteredSubscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer"
                    onClick={() => {
                      window.location.href = `/subscriptions/${sub.id}`
                    }}
                  >
                    <td className="px-6 py-4 font-medium text-blue-600 hover:text-blue-700">{sub.name}</td>
                    <td className="px-6 py-4">{getCategoryLabel(sub.category)}</td>
                    <td className="px-6 py-4 font-medium">
                      {formatKRW(sub.monthlyPrice)}
                    </td>
                    <td className="px-6 py-4">매월 {sub.billingDayOfMonth}일</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          sub.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}
                      >
                        {sub.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleEdit(sub)}
                        className="text-blue-600 hover:text-blue-700 mr-4"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
