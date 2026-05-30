// AddItemPage.jsx — Add a new menu item.
import React from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ItemForm from '../components/menu/ItemForm'
import { usePartnerStore } from '../hooks/usePartnerStore'
import { useLanguage } from '../hooks/useLanguage'

export default function AddItemPage() {
  const { store, categories, loading } = usePartnerStore()
  const { t } = useLanguage()
  if (loading) return <LoadingSpinner large />
  if (!store) return <div className="partner-main empty-state"><Link to="/guide" className="btn btn-primary">Setup store first</Link></div>
  return (
    <div className="partner-main">
      <SEOHead title={t('addItem')} description="Add a menu item." />
      <h2 style={{ marginTop: 0 }}>{t('addItem')}</h2>
      <ItemForm storeId={store.id} categories={categories} />
    </div>
  )
}
