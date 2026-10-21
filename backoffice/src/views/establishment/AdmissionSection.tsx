'use client'
import { useRef, useState, type KeyboardEvent } from 'react'
import CIcon from '@coreui/icons-react'
import {
    cilBasketball,
    cilBeaker,
    cilBed,
    cilBook,
    cilBusAlt,
    cilCarAlt,
    cilCheckCircle,
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

/** En-tête de carte : icône ronde, titre et sous-titre. */
function CardHead({ icon, tone, title, subtitle }: { icon: string[]; tone: 'teal' | 'green'; title: React.ReactNode; subtitle: string }) {
    return (
        <div className='bo-adm-head'>
            <span className={`bo-adm-head-icon is-${tone}`} aria-hidden='true'>
                <CIcon icon={icon} />
            </span>
            <div>
                <h3>{title}</h3>
                <p>{subtitle}</p>
            </div>
        </div>
    )
}

/**
 * Section « Admission et infrastructures » de la fiche : pièces à fournir,
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
    const infraInput = useRef<HTMLInputElement>(null)
    const infraFull = maxInfrastructures !== null && infrastructures.length >= maxInfrastructures
    const complete = documents.length > 0 && infrastructures.length > 0

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
        <section id='bo-admission' className='bo-adm mb-4'>
            {/* En-tête de section */}
            <div className='bo-adm-hero card'>
                <span className='bo-adm-hero-icon' aria-hidden='true'>
                    <CIcon icon={cilRoom} size='xl' />
                </span>
                <div className='me-auto'>
                    <h2>Admission et infrastructures</h2>
                    <p>Détails utiles pour les futurs étudiants</p>
                </div>
                <span className={`bo-adm-state${complete ? ' is-done' : ''}`}>
                    <CIcon icon={complete ? cilCheckCircle : cilClock} />
                    {complete ? 'Informations complètes' : 'À compléter'}
                </span>
            </div>

            <div className='row g-4'>
                {/* Pièces à fournir */}
                <div className='col-lg-6'>
                    <div className='card bo-adm-card h-100'>
                        <CardHead icon={cilDescription} tone='teal' title='Pièces à fournir pour une inscription' subtitle='Indiquez les documents que les candidats doivent fournir.' />
                        <div className='bo-adm-body'>
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
                        </div>
                    </div>
                </div>

                {/* Infrastructures */}
                <div className='col-lg-6'>
                    <div className='card bo-adm-card h-100'>
                        <CardHead icon={cilPeople} tone='teal' title='Infrastructures' subtitle='Les infrastructures disponibles dans l’établissement.' />
                        <div className='bo-adm-body'>
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

                            <label htmlFor='bo-infra-input' className='bo-adm-label'>
                                Autres infrastructures <span>(optionnel)</span>
                            </label>
                            <div className='bo-adm-input'>
                                <input
                                    id='bo-infra-input'
                                    ref={infraInput}
                                    value={infraDraft}
                                    disabled={infraFull}
                                    onChange={(e) => setInfraDraft(e.target.value)}
                                    onKeyDown={onEnter(() => addInfra())}
                                    placeholder={infraFull ? 'Limite de votre formule atteinte' : 'Ex. : bibliothèque, cantine…'}
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Reconnaissance / accréditation */}
            <div className='card bo-adm-card mt-4'>
                <CardHead
                    icon={cilShieldAlt}
                    tone='green'
                    title={
                        <>
                            <span className='text-success'>Reconnaissance</span> / accréditation
                        </>
                    }
                    subtitle='Informations sur la reconnaissance de votre établissement.'
                />
                <div className='bo-adm-body'>
                    <div className={`bo-adm-accr${accreditationVerified ? ' is-verified' : ''}`}>
                        <CIcon icon={accreditationVerified ? cilCheckCircle : cilShieldAlt} className='bo-adm-accr-icon' />
                        <input
                            value={accreditation}
                            onChange={(e) => onAccreditation(e.target.value)}
                            placeholder='Ex. : Établissement privé habilité par le ministère de l’Enseignement supérieur'
                            aria-label='Reconnaissance ou accréditation'
                        />
                        <span className='bo-adm-badge'>
                            <CIcon icon={accreditationVerified ? cilCheckCircle : cilClock} />
                            {accreditationVerified ? 'Vérifié' : 'À vérifier'}
                        </span>
                    </div>
                    <p className='bo-adm-hint'>Affichée sur votre fiche seulement après vérification par Edumada auprès des autorités.</p>
                </div>
            </div>
        </section>
    )
}
