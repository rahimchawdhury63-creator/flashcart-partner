// MenuPage.jsx — Lists items + categories with availability toggle and delete.

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '../components/common/SEOHead'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { usePartnerStore } from '../hooks/usePartnerStore'
import { useLanguage } from '../hooks/useLanguage'
import { saveItem, deleteItem, addMenuCategory } from '../utils/partnerService'
import { IconPlus, IconTrash } from '../components/svgs'
import toast from 'react-hot-toast'

export default function MenuPage() {
  const { store, items, categories, loading, reload } = usePartnerStore()
  const { t, pick } = useLanguage()
  const [newCat, setNewCat] = useState('')

  if (loading) return <LoadingSpinner large />
  if (!store) {
    return (
      <div className="partner-main empty-state">
        <p>Set up your store first.</p>
        <Link to="/guide" className="btn btn-primary">Setup</Link>
      </div>
    )
  }

  // Toggle item availability.
  const toggleAvailable = async (item) => {
    await saveItem(store.id, { isAvailable: !item.isAvailable }, item.id)
    toast.success(item.isAvailable ? t('unavailable') : t('available'))
    reload()
  }

  // Delete an item.
  const removeItem = async (item) => {
    if (!window.confirm('Delete this item?')) return
    await deleteItem(item.id)
    toast.success('Deleted')
    reload()
  }

  // Add a menu category.
  const addCat = async () => {
    if (!newCat.trim()) return
    await addMenuCategory(store.id, { en: newCat, bn: newCat }, categories.length + 1)
    setNewCat('')
    toast.success('Category added')
    reload()
  }

  return (
    <div className="partner-main">
      <SEOHead title={t('menu')} description="Manage your menu items." />
      <div className="flex justify-between items-center mb-2">
        <h2 style={{ margin: 0 }}>{t('menu')}</h2>
        <Link to="/menu/add-item" className="btn btn-accent btn-sm"><IconPlus size={16} /> {t('addItem')}</Link>
      </div>

      {/* Add category */}
      <div className="card card-body mb-2">
        <label className="form-label">{t('category')}</label>
        <div className="flex gap-1">
          <input className="form-input" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category name" />
          <button className="btn btn-primary" onClick={addCat}><IconPlus size={16} /></button>
        </div>
        <div className="flex gap-1 flex-wrap mt-1">
          {categories.map((c) => <span key={c.id} className="badge badge-muted">{pick(c.name)}</span>)}
        </div>
      </div>

      {/* Items */}
      {items.length ? (
        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 'var(--sp-1)' }}>
          {items.map((item) => (
            <div key={item.id} className="card">
              <div className="item-card">
                {item.image && <img className="item-card-img" src={item.image} alt={pick(item.name)} />}
                <div className="item-card-info">
                  <h4 className="truncate" style={{ margin: 0 }}>{pick(item.name)}</h4>
                  <span className="item-price">৳{item.discountPrice || item.price}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <label className="switch" style={{ transform: 'scale(0.85)' }}>
                      <input type="checkbox" checked={!!item.isAvailable} onChange={() => toggleAvailable(item)} />
                      <span className="slider" />
                    </label>
                    <small className="text-light">{item.isAvailable ? t('available') : t('unavailable')}</small>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link to={`/menu/edit-item/${item.id}`} className="btn btn-outline btn-sm">{t('editItem')}</Link>
                  <button className="btn-icon btn-ghost" onClick={() => removeItem(item)} style={{ color: 'var(--color-error)' }} aria-label={t('delete')}>
                    <IconTrash size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{t('noResults')}</p>
          <Link to="/menu/add-item" className="btn btn-primary">{t('addItem')}</Link>
        </div>
      )}
    </div>
  )
}
