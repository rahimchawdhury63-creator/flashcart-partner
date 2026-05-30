// ItemForm.jsx — Shared add/edit form for menu items (Bangla + English fields).

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import ImageUpload from '../common/ImageUpload'
import { saveItem } from '../../utils/partnerService'
import toast from 'react-hot-toast'

/**
 * @param {string} storeId
 * @param {object[]} categories
 * @param {object} [initial] - existing item when editing
 * @param {string} [itemId] - when editing
 */
export default function ItemForm({ storeId, categories, initial, itemId }) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [nameEn, setNameEn] = useState(initial?.name?.en || '')
  const [nameBn, setNameBn] = useState(initial?.name?.bn || '')
  const [descEn, setDescEn] = useState(initial?.description?.en || '')
  const [descBn, setDescBn] = useState(initial?.description?.bn || '')
  const [price, setPrice] = useState(initial?.price || '')
  const [discountPrice, setDiscountPrice] = useState(initial?.discountPrice || '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId || (categories[0]?.id || ''))
  const [image, setImage] = useState(initial?.image || '')
  const [saving, setSaving] = useState(false)

  // Validate and persist the item.
  const onSubmit = async (e) => {
    e.preventDefault()
    if (!nameEn && !nameBn) { toast.error('Enter an item name.'); return }
    if (!price) { toast.error('Enter a price.'); return }
    setSaving(true)
    try {
      await saveItem(
        storeId,
        {
          name: { en: nameEn, bn: nameBn },
          description: { en: descEn, bn: descBn },
          price: Number(price),
          discountPrice: Number(discountPrice) || 0,
          categoryId,
          image,
        },
        itemId
      )
      toast.success(t('saved'))
      navigate('/menu')
    } catch { toast.error('Could not save item') } finally { setSaving(false) }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="card card-body">
        <ImageUpload value={image} onUploaded={setImage} label="Item Image" />

        <div className="grid mt-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
          <div className="form-group">
            <label className="form-label">{t('itemName')} (English)</label>
            <input className="form-input" value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('itemName')} (বাংলা)</label>
            <input className="form-input" value={nameBn} onChange={(e) => setNameBn(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t('description')} (English)</label>
          <textarea className="form-textarea" value={descEn} onChange={(e) => setDescEn(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('description')} (বাংলা)</label>
          <textarea className="form-textarea" value={descBn} onChange={(e) => setDescBn(e.target.value)} />
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-2)' }}>
          <div className="form-group">
            <label className="form-label">{t('price')} (৳)</label>
            <input className="form-input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('discountPrice')} (৳)</label>
            <input className="form-input" type="number" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
          </div>
        </div>

        {categories.length > 0 && (
          <div className="form-group">
            <label className="form-label">{t('category')}</label>
            <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name?.en || c.name?.bn}</option>)}
            </select>
          </div>
        )}

        <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
          {saving ? <span className="spinner" /> : t('save')}
        </button>
      </div>
    </form>
  )
}
