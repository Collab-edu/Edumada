import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CPagination,
  CPaginationItem,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilImagePlus, cilPlus, cilTrash, cilX } from '@coreui/icons'
import { api } from '../lib/api'

/** Carte de page : titre, sous-titre, actions à droite. */
export function PageCard({
  title,
  subtitle,
  actions,
  children,
  className = 'mb-4',
  bodyClassName,
}) {
  return (
    <CCard className={className}>
      {(title || actions) && (
        <CCardHeader className="d-flex flex-wrap align-items-center gap-2 py-3">
          <div className="me-auto">
            <h5 className="mb-0">{title}</h5>
            {subtitle && <div className="small text-body-secondary">{subtitle}</div>}
          </div>
          {actions}
        </CCardHeader>
      )}
      <CCardBody className={bodyClassName}>{children}</CCardBody>
    </CCard>
  )
}
PageCard.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
}

export function Loading() {
  return (
    <div className="py-5 text-center">
      <CSpinner color="primary" />
    </div>
  )
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="text-center py-5">
      <h5>{title}</h5>
      {children && <p className="text-body-secondary mb-3">{children}</p>}
      {action}
    </div>
  )
}
EmptyState.propTypes = { title: PropTypes.node, children: PropTypes.node, action: PropTypes.node }

export function ErrorAlert({ error }) {
  if (!error) return null
  return <CAlert color="danger">{error.summary ?? error.message}</CAlert>
}
ErrorAlert.propTypes = { error: PropTypes.any }

const STATUS_COLORS = {
  draft: 'secondary',
  pending_review: 'warning',
  published: 'success',
  suspended: 'danger',
  archived: 'dark',
  pending: 'warning',
  paid: 'success',
  cancelled: 'secondary',
  active: 'success',
  paused: 'warning',
  ended: 'secondary',
  grace: 'warning',
  expired: 'danger',
  new: 'danger',
  in_review: 'info',
  information_requested: 'warning',
  interview: 'primary',
  accepted: 'success',
  refused: 'secondary',
  open: 'danger',
  resolved: 'success',
  dismissed: 'secondary',
  approved: 'success',
  rejected: 'secondary',
}

export function StatusBadge({ status, children }) {
  return <CBadge color={STATUS_COLORS[status] ?? 'secondary'}>{children}</CBadge>
}
StatusBadge.propTypes = { status: PropTypes.string, children: PropTypes.node }

/** Liste de textes éditable (objectifs, pièces à fournir…). */
export function ListInput({ label, value, onChange, placeholder, error }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const text = draft.trim()
    if (text && !value.includes(text)) onChange([...value, text])
    setDraft('')
  }
  return (
    <div className="mb-3">
      <CFormLabel>{label}</CFormLabel>
      {value.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mb-2">
          {value.map((item, i) => (
            <CBadge
              key={`${item}-${i}`}
              color="light"
              textColor="dark"
              className="d-inline-flex align-items-center gap-1 border fw-normal fs-6 py-2"
            >
              {item}
              <CButton
                size="sm"
                color="link"
                className="p-0 ms-1 text-danger"
                aria-label={`Retirer ${item}`}
                onClick={() => onChange(value.filter((_, j) => j !== i))}
              >
                <CIcon icon={cilX} size="sm" />
              </CButton>
            </CBadge>
          ))}
        </div>
      )}
      <CInputGroup>
        <CFormInput
          value={draft}
          placeholder={placeholder ?? 'Ajouter puis Entrée'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          invalid={!!error}
        />
        <CButton
          color="secondary"
          variant="outline"
          onClick={add}
          aria-label={`Ajouter à ${label}`}
        >
          <CIcon icon={cilPlus} />
        </CButton>
      </CInputGroup>
      {error && (
        <CFormFeedback invalid className="d-block">
          {error}
        </CFormFeedback>
      )}
    </div>
  )
}
ListInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.array,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
}

/** Envoi d'images vers l'API : une seule (texte) ou une galerie (liste). */
export function ImageUpload({ label, value, onChange, max = 8 }) {
  const multiple = Array.isArray(value)
  const images = multiple ? value : value ? [value] : []
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const upload = async (files) => {
    if (!files?.length) return
    setBusy(true)
    setError('')
    try {
      const urls = []
      for (const file of Array.from(files).slice(0, multiple ? max - images.length : 1)) {
        const body = new FormData()
        body.append('image', file)
        urls.push((await api('/uploads', { method: 'POST', body })).url)
      }
      onChange(multiple ? [...images, ...urls] : urls[0])
    } catch (err) {
      setError(err.summary ?? err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mb-3">
      <CFormLabel>{label}</CFormLabel>
      <div className="d-flex flex-wrap gap-2">
        {images.map((url) => (
          <div key={url} className="position-relative">
            <img src={url} alt="" className="bo-thumb" style={{ width: 140, height: 94 }} />
            <CButton
              size="sm"
              color="danger"
              className="position-absolute top-0 end-0 m-1"
              aria-label="Retirer l'image"
              onClick={() => onChange(multiple ? images.filter((u) => u !== url) : '')}
            >
              <CIcon icon={cilTrash} size="sm" />
            </CButton>
          </div>
        ))}
        {(multiple ? images.length < max : images.length === 0) && (
          <label
            className="d-flex flex-column align-items-center justify-content-center border border-2 rounded text-body-secondary"
            style={{ width: 140, height: 94, borderStyle: 'dashed', cursor: 'pointer' }}
          >
            {busy ? <CSpinner size="sm" /> : <CIcon icon={cilImagePlus} size="xl" />}
            <span className="small">Ajouter</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple={multiple}
              hidden
              disabled={busy}
              onChange={(e) => upload(e.target.files)}
            />
          </label>
        )}
      </div>
      {error && <div className="small text-danger mt-1">{error}</div>}
    </div>
  )
}
ImageUpload.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onChange: PropTypes.func,
  max: PropTypes.number,
}

/** Pagination Laravel (meta.current_page / meta.last_page). */
export function Pager({ meta, onChange }) {
  if (!meta || meta.last_page <= 1) return null
  const { current_page: page, last_page: last } = meta
  return (
    <CPagination className="justify-content-center mt-3 mb-0" aria-label="Pagination">
      <CPaginationItem
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        style={{ cursor: 'pointer' }}
      >
        Précédent
      </CPaginationItem>
      <CPaginationItem active>
        {page} / {last}
      </CPaginationItem>
      <CPaginationItem
        disabled={page >= last}
        onClick={() => onChange(page + 1)}
        style={{ cursor: 'pointer' }}
      >
        Suivant
      </CPaginationItem>
    </CPagination>
  )
}
Pager.propTypes = { meta: PropTypes.object, onChange: PropTypes.func }
