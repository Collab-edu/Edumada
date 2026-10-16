import React, { useState } from 'react'
import {
  CButton,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CInputGroup,
  CListGroup,
  CListGroupItem,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import { useToast } from '../../context/ToastContext'
import { api } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { ErrorAlert, ListInput, Loading, PageCard } from '../../components/ui'

const FIELD_LABELS = {
  diplomas: 'Diplômes',
  programme: 'Programme',
  level: "Niveau d'admission",
  childAge: 'Âge des enfants',
  duration: 'Durée',
  careers: 'Débouchés',
}

function CategoryModal({ category, onClose, onSaved }) {
  const [form, setForm] = useState({
    label: category?.label ?? '',
    shortLabel: category?.shortLabel ?? '',
    icon: category?.icon ?? 'tabler:school',
    offersLabel: category?.offersLabel ?? 'Formations proposées',
    fields: category?.fields ?? {
      diplomas: true,
      programme: true,
      level: true,
      childAge: false,
      duration: true,
      careers: true,
    },
    subCategories: category?.subCategories ?? [],
  })
  const [error, setError] = useState(null)

  const save = async () => {
    setError(null)
    try {
      await api(category ? `/categories/${category.id}` : '/categories', {
        method: category ? 'PATCH' : 'POST',
        body: form,
      })
      onSaved()
    } catch (err) {
      setError(err)
    }
  }

  return (
    <CModal visible onClose={onClose} size="lg">
      <CModalHeader>
        <CModalTitle>{category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <ErrorAlert error={error} />
        <CRow className="g-3">
          <CCol md={6}>
            <CFormInput
              label="Libellé"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </CCol>
          <CCol md={6}>
            <CFormInput
              label="Libellé court (filtres)"
              value={form.shortLabel}
              onChange={(e) => setForm({ ...form, shortLabel: e.target.value })}
            />
          </CCol>
          <CCol md={6}>
            <CFormInput
              label="Icône du site (Iconify)"
              text="Ex. : tabler:baby-carriage"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </CCol>
          <CCol md={6}>
            <CFormInput
              label="Titre de la liste des offres"
              value={form.offersLabel}
              onChange={(e) => setForm({ ...form, offersLabel: e.target.value })}
            />
          </CCol>
          <CCol md={12}>
            <div className="form-label">Sections affichées sur les fiches</div>
            {Object.entries(FIELD_LABELS).map(([key, label]) => (
              <CFormCheck
                inline
                key={key}
                id={`field-${key}`}
                label={label}
                checked={form.fields[key]}
                onChange={(e) =>
                  setForm({ ...form, fields: { ...form.fields, [key]: e.target.checked } })
                }
              />
            ))}
          </CCol>
          <CCol md={12}>
            <ListInput
              label="Sous-catégories"
              value={form.subCategories}
              onChange={(v) => setForm({ ...form, subCategories: v })}
            />
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="ghost" onClick={onClose}>
          Annuler
        </CButton>
        <CButton color="primary" onClick={save}>
          Enregistrer
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

const Catalog = () => {
  const toast = useToast()
  const { data: categories, reload } = useApi('/categories')
  const { data: domains, reload: reloadDomains } = useApi('/domains')
  const [editing, setEditing] = useState(null)
  const [domainName, setDomainName] = useState('')

  const run = async (action, message, after) => {
    try {
      await action()
      toast.success(message)
      after()
    } catch (err) {
      toast.error(err.summary ?? err.message)
    }
  }

  return (
    <CRow>
      <CCol xl={7}>
        <PageCard
          title="Catégories d'établissement"
          subtitle="Les sections affichées sur les fiches dépendent de la catégorie"
          actions={
            <CButton color="primary" size="sm" onClick={() => setEditing('new')}>
              <CIcon icon={cilPlus} className="me-1" />
              Catégorie
            </CButton>
          }
        >
          {!categories ? (
            <Loading />
          ) : (
            <CTable align="middle" responsive className="mb-0 border">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell className="bg-body-tertiary">Catégorie</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">Sous-catégories</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary" />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {categories.data.map((c) => (
                  <CTableRow key={c.id}>
                    <CTableDataCell>
                      <strong>{c.label}</strong>
                      <div className="small text-body-secondary">{c.shortLabel}</div>
                    </CTableDataCell>
                    <CTableDataCell className="small">{c.subCategories.join(' · ')}</CTableDataCell>
                    <CTableDataCell className="text-end text-nowrap">
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="ghost"
                        aria-label={`Modifier ${c.label}`}
                        onClick={() => setEditing(c)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        size="sm"
                        color="danger"
                        variant="ghost"
                        aria-label={`Supprimer ${c.label}`}
                        onClick={() =>
                          window.confirm(`Supprimer « ${c.label} » ?`) &&
                          run(
                            () => api(`/categories/${c.id}`, { method: 'DELETE' }),
                            'Catégorie supprimée',
                            reload,
                          )
                        }
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </PageCard>
      </CCol>
      <CCol xl={5}>
        <PageCard
          title="Domaines d'études"
          subtitle="Valeurs du filtre « Domaine d'études » du site"
        >
          <CForm
            className="mb-3"
            onSubmit={(e) => {
              e.preventDefault()
              run(
                () => api('/domains', { method: 'POST', body: { name: domainName } }),
                'Domaine ajouté',
                () => {
                  setDomainName('')
                  reloadDomains()
                },
              )
            }}
          >
            <CInputGroup>
              <CFormInput
                placeholder="Nouveau domaine"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
              />
              <CButton type="submit" color="primary" disabled={!domainName.trim()}>
                Ajouter
              </CButton>
            </CInputGroup>
          </CForm>
          <CListGroup>
            {(domains?.data ?? []).map((d) => (
              <CListGroupItem key={d.id} className="d-flex align-items-center">
                <span className="me-auto">
                  {d.name} <span className="small text-body-secondary">({d.count} offres)</span>
                </span>
                <CButton
                  size="sm"
                  color="secondary"
                  variant="ghost"
                  aria-label={`Renommer ${d.name}`}
                  onClick={() => {
                    const name = window.prompt('Nouveau nom', d.name)
                    if (name && name !== d.name)
                      run(
                        () => api(`/domains/${d.id}`, { method: 'PATCH', body: { name } }),
                        'Domaine renommé',
                        reloadDomains,
                      )
                  }}
                >
                  <CIcon icon={cilPencil} />
                </CButton>
                <CButton
                  size="sm"
                  color="danger"
                  variant="ghost"
                  aria-label={`Supprimer ${d.name}`}
                  onClick={() =>
                    window.confirm(
                      `Supprimer « ${d.name} » ? Les offres resteront en ligne, sans domaine.`,
                    ) &&
                    run(
                      () => api(`/domains/${d.id}`, { method: 'DELETE' }),
                      'Domaine supprimé',
                      reloadDomains,
                    )
                  }
                >
                  <CIcon icon={cilTrash} />
                </CButton>
              </CListGroupItem>
            ))}
          </CListGroup>
        </PageCard>
      </CCol>
      {editing && (
        <CategoryModal
          category={editing === 'new' ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            toast.success('Catégorie enregistrée')
            reload()
          }}
        />
      )}
    </CRow>
  )
}

export default Catalog
