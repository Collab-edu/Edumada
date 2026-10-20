/**
 * Formats renvoyés par l'API Edumada. Les fiches et offres reprennent les types du site
 * (SchoolType, FormationType, FormationDetailType) : voir src/features/* à la racine du dépôt.
 */

export type UserRole = 'student' | 'establishment' | 'admin'

export type User = {
    id: number
    name: string
    email: string
    emailVerified: boolean
    role: UserRole
    phone: string | null
    city: string | null
    studyLevel: string | null
    establishments?: { id: string; name: string; role: 'owner' | 'editor' }[]
}

export type Paginated<T> = {
    data: T[]
    meta: { current_page: number; last_page: number; total: number; per_page: number }
}

/** Actualité ou article de blog (rédigé par l'administrateur). */
export type Article = {
    id: string
    title: string
    category: string
    categoryLabel: string
    excerpt: string
    content: string
    coverImage: string | null
    publishedAt: string | null
    published: boolean
    updatedAt: string
}

export type CategoryFields = { diplomas: boolean; programme: boolean; level: boolean; childAge: boolean; duration: boolean; careers: boolean }

export type Category = {
    id: string
    label: string
    shortLabel: string
    icon: string
    subCategories: string[]
    offersLabel: string
    fields: CategoryFields
}

export type Domain = { id: string; name: string; icon: string | null; count: number }

export type Plan = {
    code: 'free' | 'pro' | 'premium'
    name: string
    monthlyPrice: number | null
    yearlyPrice: number | null
    maxPublishedOffers: number | null
    features: {
        inquiryInbox?: boolean
        statistics?: 'none' | 'standard' | 'advanced'
        sponsoredPlacement?: boolean
        prioritySupport?: boolean
        /** Galerie photos, site web et réseaux sociaux, avis : affichés sur la fiche publique. */
        photoGallery?: boolean
        onlineLinks?: boolean
        reviews?: boolean
        /** Nombre d'infrastructures affichées ; null = illimité. */
        maxInfrastructures?: number | null
    }
}

export type FormationDetail = {
    id: string
    description: string
    objectives: string[]
    skills: string[]
    subjects: string[]
    program: { period: string; courses: string[] }[]
    specializations: string[]
    teachingMethods: string[]
    evaluation: string
    admission: { prerequisites: string[]; specialConditions: string | null; minAge: number | null }
    costs: {
        applicationFee: number | null
        otherFees: { label: string; amount: number | null }[]
        status: string
        paymentOptions: string[]
        scholarships: string | null
        discounts: string | null
    }
    organization: { schedule: string | null; campus: string; rhythm: string[] }
    careers: { jobs: string[]; sectors: string[]; furtherStudies: string[]; internship: string | null; partnerships: string[] }
    onlineApplication: boolean
    brochureUrl: string | null
    academicCalendar: { label: string; date: string }[]
    lastVerified: string
}

export type Offer = {
    id: string
    title: string
    school: string
    schoolId: string
    schoolType: string
    city: string
    domain: string
    kind: string
    category: string
    diploma: string | null
    durationYears: number | null
    ageRange: { min: number; max: number } | null
    fees: number | null
    feesPeriod: string
    registrationFee: number | null
    registrationPeriod: { start: string; end: string } | null
    startDate: string | null
    modality: string
    registration: string
    languages: string[]
    admission: { level: string; bacSeries: string[]; selection: string }
    housing: string
    scholarship: string
    imageSrc: string
}

export type ManagedOffer = Offer & {
    status: 'draft' | 'published' | 'archived'
    statusLabel: string
    details: FormationDetail
    updatedAt: string
}

export type Establishment = {
    id: string
    name: string
    initials: string
    type: string
    category: string
    subCategory: string
    socialLinks: Record<string, string>
    infrastructures: string[]
    verification: { status: string; date: string | null }
    city: string
    address: string
    phone: string
    email: string
    website: string
    description: string
    tags?: string[]
    accreditation: string | null
    accreditationVerified: boolean
    coordinates: { lat: number; lng: number } | null
    admissionDocuments: string[]
    imageSrc: string
    logo: string
    photos: string[]
    updatedAt: string
}

/** Fiche vue par son équipe ou un administrateur. */
export type ManagedEstablishment = Establishment & {
    status: 'draft' | 'pending_review' | 'published' | 'suspended'
    statusLabel: string
    memberRole?: 'owner' | 'editor'
    plan: Plan
    publishedOffersCount: number
    /** Formule payante choisie à l'inscription, tant qu'elle n'est pas activée. */
    requestedPlan?: { code: 'pro' | 'premium'; name: string; billingCycle: 'monthly' | 'yearly' } | null
    offers?: ManagedOffer[]
    members?: { id: number; name: string; email: string; phone?: string | null; jobTitle?: string | null; role: string }[]
    createdAt?: string
}

export type InquiryStatus = 'new' | 'in_review' | 'information_requested' | 'interview' | 'accepted' | 'refused'

export type Inquiry = {
    id: number
    type: 'information' | 'application'
    typeLabel: string
    status: InquiryStatus
    statusLabel: string
    name: string
    email: string
    phone: string | null
    message: string | null
    offer: { id: string; title: string } | null
    establishment: { id: string; name: string }
    createdAt: string
    updatedAt: string
    history?: { from: string | null; to: InquiryStatus; toLabel: string; note: string | null; at: string }[]
    attachments?: { id: number; name: string; mimeType: string; size: number }[]
}

export type Invoice = {
    id: number
    number: string
    establishment: { id: string; name: string; address: string | null; city: string; email: string | null }
    plan: { code: Plan['code']; name: string }
    billingCycle: string
    billingCycleLabel: string
    amount: number
    status: 'pending' | 'paid' | 'cancelled'
    statusLabel: string
    paymentMethod: string
    paymentMethodLabel: string
    paymentInstructions: string | null
    paymentReference: string | null
    paidAt: string | null
    periodStartsOn: string | null
    periodEndsOn: string | null
    createdAt: string
}

export type Subscription = {
    id: number
    plan: Plan
    status: 'active' | 'grace' | 'expired' | 'cancelled'
    statusLabel: string
    billingCycle: string
    billingCycleLabel: string
    amount: number | null
    startsAt: string
    endsAt: string | null
    graceEndsAt: string | null
    establishment?: { id: string; name: string }
}

export type Campaign = {
    id: number
    title: string
    description: string | null
    image: string | null
    callToAction: string | null
    startsOn: string
    endsOn: string
    status: 'active' | 'paused' | 'ended'
    statusLabel: string
    isRunning: boolean
    offer: { id: string; title: string }
    establishment: { id: string; name: string }
    targetCategory: string | null
    targetDomain: string | null
    targetCity: string | null
}

export type Report = {
    id: number
    establishment: { id: string; name: string }
    offer: { id: string; title: string } | null
    reason: string
    reasonLabel: string
    message: string
    email?: string | null
    status: 'open' | 'resolved' | 'dismissed'
    statusLabel: string
    createdAt: string
}

export type Claim = {
    id: number
    establishment: { id: string; name: string; email: string | null }
    user: { name: string; email: string; phone: string | null }
    message: string
    status: 'pending' | 'approved' | 'rejected'
    statusLabel: string
    createdAt: string
}

export type AdminReview = {
    id: string
    schoolName: string
    formationTitle: string | null
    name: string
    status: string
    rating: number
    quote: string
    moderation: 'pending' | 'published' | 'rejected'
    moderationLabel: string
    createdAt: string
}

export type AdminUser = {
    id: number
    name: string
    email: string
    role: UserRole
    roleLabel: string
    phone: string | null
    city: string | null
    studyLevel?: string | null
    createdAt: string
    establishments: { id: string; name: string }[]
    inquiriesCount: number
}

export type AuditLog = {
    id: number
    action: string
    user: { id: number; name: string; email: string } | null
    subjectType: string | null
    subjectId: number | null
    meta: Record<string, unknown>
    createdAt: string
}

export type ReferenceData = {
    offerKinds: string[]
    diplomas: string[]
    modalities: string[]
    registrationStatuses: string[]
    admissionLevels: string[]
    admissionSelections: string[]
    housing: string[]
    scholarships: string[]
    costsStatuses: string[]
}

/** Point d'une série quotidienne (statistiques). */
export type SeriesPoint = { date: string } & Record<string, number | string>

export type StatsTotals = { views: number; contactClicks: number; websiteClicks: number; inquiries: number; applications: number; processed: number }

/** Statistiques d'un établissement (Pro : standard, Premium : avancées avec campagnes). */
export type EstablishmentStats = {
    data: {
        level: 'standard' | 'advanced'
        period: { from: string; to: string }
        totals: StatsTotals
        previousTotals?: StatsTotals
        series: SeriesPoint[]
        offers: { id: string; title: string; views: number; contactClicks: number; inquiries: number }[]
        campaigns?: { id: number; title: string; offer: string; startsOn: string; endsOn: string; impressions: number; clicks: number; clickRate: number | null; inquiriesDuring: number }[]
    }
}

export type StatusCounts = { new: number; registered: number; other: number }

/** Compteurs de l'administration : demandes d'adhésion (nouvelles), fiches inscrites, par catégorie et par formule. */
export type EstablishmentCounts = {
    data: {
        total: StatusCounts
        categories: ({ id: string; label: string; shortLabel: string } & StatusCounts)[]
        plans: Record<Plan['code'], number>
    }
}
