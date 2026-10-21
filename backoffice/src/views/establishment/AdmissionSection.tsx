'use client'
import { useRef, useState, type KeyboardEvent } from 'react'
import { CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilBasketball,
    cilBeaker,
    cilBed,
    cilBook,
    cilBusAlt,
    cilCarAlt,
    cilCheckCircle,
    cilClipboard,
    cilClock,
    cilCoffee,
    cilDescription,
    cilMedicalCross,
    cilPeople,
    cilPlus,
    cilRestaurant,
    cilRoom,
    cilScreenDesktop,
    cilShieldAlt,
    cilWifiSignal4,
    cilX,
} from '@coreui/icons'
import { PageCard } from '@/components/ui'

// Icône d'une infrastructure d'après son nom (« Salle informatique » → écran…).
const INFRA_ICONS: [RegExp, string[]][] = [
    [/informatique|ordinateur|numérique|multimédia/i, cilScreenDesktop],
    [/biblioth|médiath|cdi|livre/i, cilBook],
    [/wi-?fi|internet|connexion/i, cilWifiSignal4],
    [/labo|science|chimie|physique/i, cilBeaker],
    [/cantine|restaura|réfectoire/i, cilRestaurant],
    [/cafét|café|snack/i, cilCoffee],
    [/sport|terrain|gymnase|piscine/i, cilBasketball],
    [/parking|stationnement/i, cilCarAlt],
    [/transport|bus|navette/i, cilBusAlt],
    [/internat|dortoir|logement|hébergement/i, cilBed],
    [/infirmerie|santé|médical/i, cilMedicalCross],
    [/amphi|auditorium|salle de conf|réunion/i, cilPeople],
]
const infraIcon = (name: string) => INFRA_ICONS.find(([re]) => re.test(name))?.[1] ?? cilRoom

const SUGGESTIONS = ['Salles de cours équipées', 'Bibliothèque', 'Salle informatique', 'Connexion Wi-Fi', 'Laboratoire', 'Cantine', 'Terrain de sport', 'Parking']

const sameText = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()

/**
 * Carte « Admission et infrastructures » de la fiche : pièces à fournir,
 * infrastructures (avec icône et suggestions) et reconnaissance officielle.
 */
export default function AdmissionSection({
    documents,
    onDocuments,
    infrastructures,
    onInfrastructures,
    maxInfrastructures,
    infrastructuresError,
    accreditation,
    onAccreditation,
    accreditationVerified,
}: {
    documents: string[]
    onDocuments: (value: string[]) => void
    infrastructures: string[]
    onInfrastructures: (value: string[]) => void
    maxInfrastructures: number | null
    infrastructuresError?: string
    accreditation: string
    onAccreditation: (value: string) => void
    accreditationVerified: boolean
}) {
    const [docDraft, setDocDraft] = useState('')
    const [addingDoc, setAddingDoc] = useState(false)
    const [infraDraft, setInfraDraft] = useState('')
    const docInput = useRef<HTMLInputElement>(null)
    const infraFull = maxInfrastructures !== null && infrastructures.length >= maxInfrastructures

    const addDoc = () => {
        const text = docDraft.trim()
        if (text && !documents.some((d) => sameText(d, text))) onDocuments([...documents, text])
        setDocDraft('')
        docInput.current?.focus()
    }
    const addInfra = (value = infraDraft) => {
        const text = value.trim()
        if (!text || infraFull || infrastructures.some((i) => sameText(i, text))) return
        onInfrastructures([...infrastructures, text])
        setInfraDraft('')
    }
    const onEnter = (action: () => void) => (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            action()
        }
        if (e.key === 'Escape') setAddingDoc(false)
    }
    const suggestions = SUGGESTIONS.filter((s) => !infrastructures.some((i) => sameText(i, s))).slice(0, 4)

    return (
        <PageCard id='bo-admission' icon={cilClipboard} title='Admission et infrastructures' subtitle='Détails utiles pour les futurs étudiants'>
            <CRow className='g-4 mb-4'>
                {/* Pièces à fournir */}
                <CCol md={6}>
                    <span className='bo-adm-label'>Pièces à fournir pour une inscription</span>
                    <ul className='bo-adm-docs list-unstyled mb-0'>
                        {documents.map((doc, i) => (
                            <li key={`${doc}-${i}`}>
                                <CIcon icon={cilDescription} className='bo-adm-doc-icon' />
                                <span className='me-auto'>{doc}</span>
                                <button type='button' className='bo-adm-remove' onClick={() => onDocuments(documents.filter((_, j) => j !== i))} aria-label={`Retirer « ${doc} »`}>
                                    <CIcon icon={cilX} />
                                </button>
                            </li>
                        ))}
                    </ul>
                    {addingDoc ? (
                        <div className='bo-adm-add-row'>
                            <CIcon icon={cilDescription} className='bo-adm-doc-icon' />
                            <input
                                ref={docInput}
                                autoFocus
                                value={docDraft}
                                onChange={(e) => setDocDraft(e.target.value)}
                                onKeyDown={onEnter(addDoc)}
                                onBlur={() => {
                                    addDoc()
                                    setAddingDoc(false)
                                }}
                                placeholder='Ex. : Copie du dernier diplôme obtenu'
                                aria-label='Nouvelle pièce à fournir'
                            />
                            <span className='bo-adm-kbd'>Entrée</span>
                        </div>
                    ) : (
                        <button type='button' className='bo-adm-add' onClick={() => setAddingDoc(true)}>
                            <span className='bo-adm-add-icon is-green'>
                                <CIcon icon={cilPlus} />
                            </span>
                            Ajouter une pièce à fournir
                        </button>
                    )}
                </CCol>

                {/* Infrastructures */}
                <CCol md={6} className='bo-col-divider'>
                    <span className='bo-adm-label'>Infrastructures</span>
                    {infrastructures.length > 0 && (
                        <ul className='bo-adm-chips list-unstyled'>
                            {infrastructures.map((item, i) => (
                                <li key={`${item}-${i}`}>
                                    <CIcon icon={infraIcon(item)} />
                                    {item}
                                    <button type='button' className='bo-adm-remove' onClick={() => onInfrastructures(infrastructures.filter((_, j) => j !== i))} aria-label={`Retirer « ${item} »`}>
                                        <CIcon icon={cilX} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    {!infraFull && suggestions.length > 0 && (
                        <div className='bo-adm-suggest'>
                            {suggestions.map((s) => (
                                <button key={s} type='button' onClick={() => addInfra(s)}>
                                    <CIcon icon={cilPlus} />
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                    <div className='bo-adm-input'>
                        <input
                            value={infraDraft}
                            disabled={infraFull}
                            onChange={(e) => setInfraDraft(e.target.value)}
                            onKeyDown={onEnter(() => addInfra())}
                            placeholder={infraFull ? 'Limite de votre formule atteinte' : 'Ex. : bibliothèque, cantine…'}
                            aria-label='Ajouter une infrastructure'
                        />
                        <button type='button' onClick={() => addInfra()} disabled={infraFull || !infraDraft.trim()} aria-label='Ajouter l’infrastructure'>
                            <CIcon icon={cilPlus} />
                        </button>
                    </div>
                    {infrastructuresError ? (
                        <p className='bo-adm-hint text-danger'>{infrastructuresError}</p>
                    ) : maxInfrastructures !== null ? (
                        <p className='bo-adm-hint'>
                            {infrastructures.length} / {maxInfrastructures} avec votre formule. Illimité avec Pro et Premium.
                        </p>
                    ) : null}
                </CCol>
            </CRow>

            {/* Reconnaissance / accréditation */}
            <label htmlFor='bo-accreditation' className='bo-adm-label'>
                Reconnaissance / accréditation
            </label>
            <div className={`bo-adm-accr${accreditationVerified ? ' is-verified' : ''}`}>
                <CIcon icon={accreditationVerified ? cilCheckCircle : cilShieldAlt} className='bo-adm-accr-icon' />
                <input
                    id='bo-accreditation'
                    value={accreditation}
                    onChange={(e) => onAccreditation(e.target.value)}
                    placeholder='Ex. : Établissement privé habilité par le ministère de l’Enseignement supérieur'
                />
                <span className='bo-adm-badge'>
                    <CIcon icon={accreditationVerified ? cilCheckCircle : cilClock} />
                    {accreditationVerified ? 'Vérifié' : 'À vérifier'}
                </span>
            </div>
            <p className='bo-adm-hint'>Affichée seulement après vérification par Edumada auprès des autorités.</p>
        </PageCard>
    )
}
