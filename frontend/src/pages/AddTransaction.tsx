import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Dashboard from './Dashboard'
import { banks } from '../utils/Banks'
import { transactionCategories } from '../utils/TransactionCategories'

function parseSearchParams(searchParams: URLSearchParams) {
  const bank = searchParams.get('bank') ?? ''
  const category = searchParams.get('category') ?? ''

  return {
    title: searchParams.get('title') ?? '',
    description: searchParams.get('description') ?? '',
    amount: searchParams.get('amount') ?? '',
    bank: bank in banks ? bank : '',
    category: category in transactionCategories ? category : '',
    type: searchParams.get('type') ?? 'Withdraw',
    date: searchParams.get('date') ?? new Date().toISOString(),
  }
}

export default function AddTransaction() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialValues = useMemo(() => parseSearchParams(searchParams), [searchParams])

  return (
    <Dashboard
      addModalOpen
      addModalInitialValues={initialValues}
      onAddModalClose={() => navigate('/', { replace: true })}
    />
  )
}
