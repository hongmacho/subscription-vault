'use client'

import { useState } from 'react'
import { SubscriptionCategory, CATEGORY_LABELS } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export default function AddSubscriptionPage() {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: '',
    category: SubscriptionCategory.OTHER,
    monthlyPrice: '',
    billingDayOfMonth: '',
    contractStartDate: '',
    contractType: 'monthly',
    notes: '',
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '서비스명을 입력해주세요'
    }

    const price = parseInt(formData.monthlyPrice)
    if (!formData.monthlyPrice || price <= 0) {
      newErrors.monthlyPrice = '월간 비용은 1 이상이어야 합니다'
    }

    const billingDay = parseInt(formData.billingDayOfMonth)
    if (!formData.billingDayOfMonth || billingDay < 1 || billingDay > 31) {
      newErrors.billingDayOfMonth = '결제일은 1~31 사이여야 합니다'
    }

    if (!formData.contractStartDate) {
      newErrors.contractStartDate = '계약 시작일을 입력해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          monthlyPrice: parseInt(formData.monthlyPrice),
          billingDayOfMonth: parseInt(formData.billingDayOfMonth),
          contractStartDate: formData.contractStartDate,
          contractType: formData.contractType,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        window.location.href = '/subscriptions'
      } else {
        setErrors({ submit: '구독 추가에 실패했습니다' })
      }
    } catch (error) {
      setErrors({ submit: '오류가 발생했습니다' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">새 구독 추가</h1>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-lg border border-gray-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">서비스명 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value })
                if (errors.name) setErrors({ ...errors, name: '' })
              }}
              className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 ${
                errors.name
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-slate-700'
              }`}
              placeholder="Netflix, Adobe Creative Cloud 등"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">월간 비용 (원) *</label>
              <input
                type="number"
                value={formData.monthlyPrice}
                onChange={(e) => {
                  setFormData({ ...formData, monthlyPrice: e.target.value })
                  if (errors.monthlyPrice) setErrors({ ...errors, monthlyPrice: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 ${
                  errors.monthlyPrice
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-slate-700'
                }`}
                placeholder="19900"
                disabled={loading}
              />
              {errors.monthlyPrice && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.monthlyPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">결제일 (1~31) *</label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.billingDayOfMonth}
                onChange={(e) => {
                  setFormData({ ...formData, billingDayOfMonth: e.target.value })
                  if (errors.billingDayOfMonth) setErrors({ ...errors, billingDayOfMonth: '' })
                }}
                className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 ${
                  errors.billingDayOfMonth
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-slate-700'
                }`}
                placeholder="5"
                disabled={loading}
              />
              {errors.billingDayOfMonth && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.billingDayOfMonth}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">카테고리 *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as SubscriptionCategory })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
              disabled={loading}
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">계약 시작일 *</label>
            <input
              type="date"
              value={formData.contractStartDate}
              onChange={(e) => {
                setFormData({ ...formData, contractStartDate: e.target.value })
                if (errors.contractStartDate) setErrors({ ...errors, contractStartDate: '' })
              }}
              className={`w-full px-4 py-2 border rounded-lg dark:bg-slate-800 ${
                errors.contractStartDate
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-slate-700'
              }`}
              disabled={loading}
            />
            {errors.contractStartDate && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                {errors.contractStartDate}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">계약 유형 *</label>
            <div className="flex gap-6">
              {[
                { value: 'monthly', label: '월간' },
                { value: 'annual', label: '연간' },
                { value: 'one_time', label: '일회' },
              ].map((type) => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="radio"
                    name="contractType"
                    value={type.value}
                    checked={formData.contractType === type.value}
                    onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                    className="mr-2"
                    disabled={loading}
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">메모</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg dark:bg-slate-800"
              placeholder="광고 제거 결제, 팀 비용 등..."
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => (window.location.href = '/subscriptions')}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 font-medium"
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
