// EditItemPage.jsx — Edit an existing menu item.
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ItemForm from '../components/menu/ItemForm'
import { usePartnerStore } from '../hooks/usePartnerStore'
import { useLanguage } from '../hooks/useLanguage'
import { fetchItem } from '../utils/partnerService'

export default function EditItemPage() {
  const { itemId } = useParams()
  const { store, categories, loading } = usePartnerStore()
  const { t } = useLanguage()
  const [item, setItem] = useState(null)
  const [itemLoading, setItemLoading] = useState(true)

  useEffect(() => {
    fetchItem(itemId).then((i) => { setItem(i); setItemLoading(false) })
  }, [itemId])

  if (loading || itemLoading) return <LoadingSpinner large />
  if (!store || !item) return <div className="partner-main empty-state"><Link to="/menu" className="btn btn-primary">{t('menu')}</Link></div>

  return (
    <div className="partner-main">
      <SEOHead title={t('editItem')} description="Edit a menu item." />
      <h2 style={{ marginTop: 0 }}>{t('editItem')}</h2>
      <ItemForm storeId={store.id} categories={categories} initial={item} itemId={itemId} />
    </div>
  )
}
