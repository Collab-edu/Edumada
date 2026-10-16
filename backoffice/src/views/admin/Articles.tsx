'use client'
import { useState } from 'react'
import {
    CBadge,
    CButton,
    CCol,
    CFormCheck,
    CFormInput,
    CFormSelect,
    CFormTextarea,
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
import { cilExternalLink, cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import { useToast } from '@/context/ToastContext'
import { api, assetUrl, errorMessage, fieldError, SITE_URL } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useApi } from '@/lib/useApi'
import type { Article, Paginated } from '@/lib/types'
import { EmptyState, ErrorAlert, ImageUpload, Loading, PageCard, Pager } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

/** Mêmes rubriques que Article::CATEGORIES côté API. */
const CATEGORIES = [
    { value: 'actualite', label: 'Actualité' },
    { value: 'orientation', label: 'Orientation' },
    { value: 'conseils', label: 'Conseils' },
    { value: 'evenement', label: 'Événement' },
]

/** « 2026-10-18T09:30 » pour un champ datetime-local, à partir d'une date ISO. */
const toLocalInput = (iso: string | null) => {
    if (!iso) return ''
    const d = new Date(iso)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function status(article: Article) {
    if (article.published) return <CBadge color='success'>Publié</CBadge>
    if (article.publishedAt) return <CBadge color='info'>Programmé</CBadge>
    return <CBadge color='secondary'>Brouillon</CBadge>
}

function ArticleModal({ article, onClose, onSaved }: { article?: Article; onClose: () => void; onSaved: () => void }) {
    const [form, setForm] = useState({
        title: article?.title ?? '',
        category: article?.category ?? 'actualite',
        excerpt: article?.excerpt ?? '',
        content: article?.content ?? '',
        coverImage: article?.coverImage ?? '',
        published: article ? article.publishedAt !== null : true,
        publishedAt: toLocalInput(article?.publishedAt ?? null),
    })
    const [error, setError] = useState<unknown>(null)
    const [saving, setSaving] = useState(false)

    const save = async () => {
        setError(null)
        setSaving(true)
        try {
            const body = {
                ...form,
                coverImage: form.coverImage || null,
                publishedAt: form.published && form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
            }
            await api(article ? `/admin/articles/${article.id}` : '/admin/articles', { method: article ? 'PUT' : 'POST', body })
            onSaved()
        } catch (err) {
            setError(err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <CModal visible onClose={onClose} size='xl' backdrop='static'>
            <CModalHeader>
                <CModalTitle>{article ? "Modifier l'article" : 'Nouvel article'}</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <ErrorAlert error={error} />
                <CRow className='g-3'>
                    <CCol md={8}>
                        <CFormInput
                            id='article-title'
                            label='Titre'
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            invalid={!!fieldError(error, 'title')}
                            feedbackInvalid={fieldError(error, 'title')}
                        />
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect id='article-category' label='Rubrique' options={CATEGORIES} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                    </CCol>
                    <CCol md={12}>
                        <ImageUpload label='Image de couverture' value={form.coverImage} onChange={(coverImage: string) => setForm({ ...form, coverImage })} />
                    </CCol>
                    <CCol md={12}>
                        <CFormTextarea
                            id='article-excerpt'
                            label='Résumé'
                            rows={2}
                            maxLength={300}
                            text={`Affiché sur la liste des actualités. ${form.excerpt.length}/300 caractères.`}
                            value={form.excerpt}
                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                            invalid={!!fieldError(error, 'excerpt')}
                            feedbackInvalid={fieldError(error, 'excerpt')}
                        />
                    </CCol>
                    <CCol md={12}>
                        <CFormTextarea
                            id='article-content'
                            label='Contenu'
                            rows={14}
                            text='Séparez les paragraphes par une ligne vide. Une ligne qui commence par « ## » devient un intertitre.'
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            invalid={!!fieldError(error, 'content')}
                            feedbackInvalid={fieldError(error, 'content')}
                        />
                    </CCol>
                    <CCol md={6} className='d-flex align-items-end'>
                        <CFormCheck
                            id='article-published'
                            label='Publier sur le site'
                            checked={form.published}
                            onChange={(e) => setForm({ ...form, published: e.target.checked })}
                        />
                    </CCol>
                    <CCol md={6}>
                        <CFormInput
                            id='article-date'
                            type='datetime-local'
                            label='Date de publication'
                            text='Laissez vide pour publier tout de suite. Une date future programme la publication.'
                            disabled={!form.published}
                            value={form.publishedAt}
                            onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                        />
                    </CCol>
                </CRow>
            </CModalBody>
            <CModalFooter>
                <CButton color='secondary' variant='ghost' onClick={onClose}>
                    Annuler
                </CButton>
                <CButton color='primary' onClick={save} disabled={saving}>
                    {form.published ? 'Enregistrer et publier' : 'Enregistrer le brouillon'}
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

/** Actualités du site : seul l'administrateur les rédige, les publie et les supprime. */
export default function Articles() {
    const toast = useToast()
    const [page, setPage] = useState(1)
    const { data, reload } = useApi<Paginated<Article>>('/admin/articles', { page })
    const [editing, setEditing] = useState<Article | 'new' | null>(null)

    const remove = async (article: Article) => {
        if (!window.confirm(`Supprimer « ${article.title} » ? Cette action est définitive.`)) return
        try {
            await api(`/admin/articles/${article.id}`, { method: 'DELETE' })
            toast.success('Article supprimé')
            reload()
        } catch (err) {
            toast.error(errorMessage(err))
        }
    }

    return (
        <>
            <PageBanner />
            <PageCard
                title='Articles'
                subtitle={data ? `${data.meta.total} article${data.meta.total > 1 ? 's' : ''}` : undefined}
                actions={
                    <CButton color='primary' size='sm' onClick={() => setEditing('new')}>
                        <CIcon icon={cilPlus} className='me-1' />
                        Nouvel article
                    </CButton>
                }
            >
                {!data ? (
                    <Loading />
                ) : data.data.length === 0 ? (
                    <EmptyState
                        title='Aucun article pour le moment'
                        action={
                            <CButton color='primary' onClick={() => setEditing('new')}>
                                Rédiger le premier article
                            </CButton>
                        }
                    >
                        Les articles publiés apparaissent sur la page Actualités du site.
                    </EmptyState>
                ) : (
                    <>
                        <CTable align='middle' hover responsive className='mb-0'>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell style={{ width: 96 }} />
                                    <CTableHeaderCell>Article</CTableHeaderCell>
                                    <CTableHeaderCell>Rubrique</CTableHeaderCell>
                                    <CTableHeaderCell>Statut</CTableHeaderCell>
                                    <CTableHeaderCell>Publication</CTableHeaderCell>
                                    <CTableHeaderCell />
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {data.data.map((a) => (
                                    <CTableRow key={a.id}>
                                        <CTableDataCell>
                                            {a.coverImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={assetUrl(a.coverImage)} alt='' className='bo-thumb' style={{ width: 80, height: 54 }} />
                                            ) : (
                                                <div className='bg-body-tertiary rounded' style={{ width: 80, height: 54 }} />
                                            )}
                                        </CTableDataCell>
                                        <CTableDataCell style={{ maxWidth: 420 }}>
                                            <div className='fw-semibold'>{a.title}</div>
                                            <div className='small text-body-secondary text-truncate'>{a.excerpt}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>{a.categoryLabel}</CTableDataCell>
                                        <CTableDataCell>{status(a)}</CTableDataCell>
                                        <CTableDataCell className='small text-nowrap'>{a.publishedAt ? formatDate(a.publishedAt) : '—'}</CTableDataCell>
                                        <CTableDataCell className='text-end text-nowrap'>
                                            {a.published && (
                                                <CButton
                                                    size='sm'
                                                    color='secondary'
                                                    variant='ghost'
                                                    href={`${SITE_URL}/actualites/voir/?id=${a.id}`}
                                                    target='_blank'
                                                    aria-label={`Voir « ${a.title} » sur le site`}
                                                >
                                                    <CIcon icon={cilExternalLink} />
                                                </CButton>
                                            )}
                                            <CButton size='sm' color='secondary' variant='ghost' aria-label={`Modifier « ${a.title} »`} onClick={() => setEditing(a)}>
                                                <CIcon icon={cilPencil} />
                                            </CButton>
                                            <CButton size='sm' color='danger' variant='ghost' aria-label={`Supprimer « ${a.title} »`} onClick={() => remove(a)}>
                                                <CIcon icon={cilTrash} />
                                            </CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                        <Pager meta={data.meta} onChange={setPage} />
                    </>
                )}
            </PageCard>
            {editing && (
                <ArticleModal
                    article={editing === 'new' ? undefined : editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null)
                        toast.success('Article enregistré')
                        reload()
                    }}
                />
            )}
        </>
    )
}
