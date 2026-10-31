/** Test d'orientation inspiré du modèle RIASEC de John Holland. */
export type ProfileCode = 'R' | 'I' | 'A' | 'S' | 'E' | 'C'

export const PROFILES: Record<ProfileCode, { name: string; icon: string; summary: string; strengths: string[] }> = {
    R: {
        name: 'Réaliste',
        icon: 'tabler:tools',
        summary: 'Vous aimez le concret : fabriquer, réparer, utiliser des outils et voir un résultat tangible.',
        strengths: ['Sens pratique', 'Habileté technique', 'Goût du terrain'],
    },
    I: {
        name: 'Investigateur',
        icon: 'tabler:atom',
        summary: 'Vous aimez comprendre : observer, analyser, chercher et résoudre des problèmes complexes.',
        strengths: ['Esprit d’analyse', 'Curiosité', 'Rigueur'],
    },
    A: {
        name: 'Artistique',
        icon: 'tabler:bulb',
        summary: 'Vous aimez créer : imaginer, vous exprimer et proposer des idées originales.',
        strengths: ['Créativité', 'Imagination', 'Sens de l’expression'],
    },
    S: {
        name: 'Social',
        icon: 'tabler:heart-handshake',
        summary: 'Vous aimez être utile aux autres : écouter, accompagner, enseigner et soigner.',
        strengths: ['Écoute', 'Patience', 'Sens du contact'],
    },
    E: {
        name: 'Entreprenant',
        icon: 'tabler:trending-up',
        summary: 'Vous aimez agir et convaincre : prendre des initiatives, diriger et atteindre des objectifs.',
        strengths: ['Leadership', 'Force de conviction', 'Goût du défi'],
    },
    C: {
        name: 'Conventionnel',
        icon: 'tabler:clipboard-check',
        summary: 'Vous aimez l’ordre et la méthode : organiser, gérer et travailler avec précision.',
        strengths: ['Organisation', 'Précision', 'Fiabilité'],
    },
}

export const PROFILE_ORDER = Object.keys(PROFILES) as ProfileCode[]

/** 12 questions de 4 réponses : chaque profil est proposé 8 fois, pour des scores comparables. */
export const QUESTIONS: { text: string; answers: { profile: ProfileCode; text: string }[] }[] = [
    {
        text: 'Un après-midi libre, vous préférez…',
        answers: [
            { profile: 'R', text: 'Bricoler ou réparer quelque chose' },
            { profile: 'I', text: 'Comprendre comment une chose fonctionne' },
            { profile: 'A', text: 'Dessiner, écrire ou faire de la musique' },
            { profile: 'S', text: 'Rendre service à un proche' },
        ],
    },
    {
        text: 'Dans un travail de groupe, vous êtes plutôt celui ou celle qui…',
        answers: [
            { profile: 'E', text: 'Prend la tête et motive les autres' },
            { profile: 'C', text: 'Organise le planning et les tâches' },
            { profile: 'I', text: 'Cherche les informations' },
            { profile: 'A', text: 'Trouve les idées' },
        ],
    },
    {
        text: 'À l’école, quelle activité vous plaît le plus ?',
        answers: [
            { profile: 'R', text: 'Les travaux pratiques' },
            { profile: 'S', text: 'Expliquer un cours à un camarade' },
            { profile: 'E', text: 'Organiser une vente ou un événement' },
            { profile: 'C', text: 'Tenir des notes claires et bien classées' },
        ],
    },
    {
        text: 'Quel compliment vous ferait le plus plaisir ?',
        answers: [
            { profile: 'I', text: '« Tu comprends vite les problèmes difficiles »' },
            { profile: 'A', text: '« Tu as des idées vraiment originales »' },
            { profile: 'S', text: '« On peut toujours compter sur ton écoute »' },
            { profile: 'C', text: '« Avec toi, tout est bien organisé »' },
        ],
    },
    {
        text: 'Votre journée de travail idéale se passe…',
        answers: [
            { profile: 'R', text: 'Dehors ou dans un atelier' },
            { profile: 'I', text: 'Dans un endroit calme, à analyser' },
            { profile: 'E', text: 'En rendez-vous avec des clients' },
            { profile: 'S', text: 'Auprès de personnes à accompagner' },
        ],
    },
    {
        text: 'Face à un problème, votre premier réflexe est de…',
        answers: [
            { profile: 'R', text: 'Essayer concrètement, avec vos mains' },
            { profile: 'A', text: 'Imaginer une solution inhabituelle' },
            { profile: 'E', text: 'Décider vite et mobiliser les autres' },
            { profile: 'C', text: 'Suivre une méthode, étape par étape' },
        ],
    },
    {
        text: 'Quel projet vous motive le plus ?',
        answers: [
            { profile: 'R', text: 'Construire une machine ou une maison' },
            { profile: 'I', text: 'Découvrir une solution scientifique' },
            { profile: 'A', text: 'Créer un film, une affiche ou un vêtement' },
            { profile: 'E', text: 'Lancer votre propre activité' },
        ],
    },
    {
        text: 'Qu’est-ce qui vous donne le plus de satisfaction ?',
        answers: [
            { profile: 'S', text: 'Voir quelqu’un progresser grâce à vous' },
            { profile: 'E', text: 'Atteindre un objectif ambitieux' },
            { profile: 'C', text: 'Terminer un dossier sans aucune erreur' },
            { profile: 'R', text: 'Voir fonctionner ce que vous avez réparé' },
        ],
    },
    {
        text: 'Quelle tâche choisiriez-vous volontiers ?',
        answers: [
            { profile: 'I', text: 'Analyser les résultats d’une enquête' },
            { profile: 'A', text: 'Concevoir un visuel pour un événement' },
            { profile: 'S', text: 'Animer un atelier pour des enfants' },
            { profile: 'C', text: 'Gérer le budget d’une association' },
        ],
    },
    {
        text: 'Comment aimez-vous apprendre ?',
        answers: [
            { profile: 'R', text: 'En pratiquant directement' },
            { profile: 'I', text: 'En cherchant le pourquoi des choses' },
            { profile: 'C', text: 'Avec un plan et des consignes claires' },
            { profile: 'S', text: 'En échangeant avec les autres' },
        ],
    },
    {
        text: 'Dans votre quartier, vous auriez envie de…',
        answers: [
            { profile: 'A', text: 'Peindre une fresque' },
            { profile: 'S', text: 'Soutenir les familles en difficulté' },
            { profile: 'E', text: 'Monter une coopérative' },
            { profile: 'C', text: 'Tenir les comptes d’une association' },
        ],
    },
    {
        text: 'Vous vous sentez le mieux dans un environnement…',
        answers: [
            { profile: 'I', text: 'Où l’on découvre sans cesse' },
            { profile: 'A', text: 'Libre et sans routine' },
            { profile: 'E', text: 'Dynamique et tourné vers les résultats' },
            { profile: 'R', text: 'Concret, où l’on voit le travail avancer' },
        ],
    },
]

/** Domaines du catalogue Edumada : `name` est le libellé exact des offres. */
export const DOMAINS: { name: string; profiles: ProfileCode[]; description: string; jobs: string[] }[] = [
    { name: 'Informatique', profiles: ['I', 'C', 'R'], description: 'Concevoir des logiciels, gérer des données et des réseaux.', jobs: ['Développeur', 'Administrateur réseau', 'Analyste de données'] },
    { name: 'Médecine & Santé', profiles: ['S', 'I'], description: 'Soigner, prévenir et accompagner les patients.', jobs: ['Infirmier', 'Sage-femme', 'Médecin'] },
    { name: 'Droit', profiles: ['E', 'C'], description: 'Comprendre les règles, conseiller et défendre.', jobs: ['Juriste', 'Avocat', 'Notaire'] },
    { name: 'Gestion & Commerce', profiles: ['E', 'C'], description: 'Piloter une activité, vendre et gérer les comptes.', jobs: ['Comptable', 'Commercial', 'Responsable de gestion'] },
    { name: 'Ingénierie', profiles: ['R', 'I'], description: 'Concevoir et réaliser des ouvrages et des systèmes techniques.', jobs: ['Technicien', 'Ingénieur', 'Conducteur de travaux'] },
    { name: 'Agronomie', profiles: ['R', 'I'], description: 'Développer l’agriculture et préserver l’environnement.', jobs: ['Technicien agricole', 'Agronome', 'Conseiller rural'] },
    { name: 'Lettres & Langues', profiles: ['A', 'S'], description: 'Maîtriser les langues, écrire, traduire et communiquer.', jobs: ['Traducteur', 'Rédacteur', 'Chargé de communication'] },
    { name: 'Tourisme & Hôtellerie', profiles: ['E', 'S', 'A'], description: 'Accueillir, organiser des séjours et faire découvrir.', jobs: ['Guide touristique', 'Réceptionniste', 'Responsable d’hôtel'] },
]

export type Answers = (ProfileCode | null)[]
export type Score = { code: ProfileCode; percent: number }

/** Scores du plus fort au plus faible : un profil est proposé 8 fois, donc 8 choix = 100 %. */
export function computeScores(answers: Answers): Score[] {
    const proposed = (code: ProfileCode) => QUESTIONS.filter((q) => q.answers.some((a) => a.profile === code)).length
    return PROFILE_ORDER.map((code) => ({
        code,
        percent: Math.round((answers.filter((a) => a === code).length / proposed(code)) * 100),
    })).sort((a, b) => b.percent - a.percent)
}

/** Les 3 domaines les plus proches des 3 profils dominants (poids 3, 2 et 1). */
export function recommendDomains(top: ProfileCode[]) {
    return DOMAINS.map((domain) => {
        const matched = top.filter((code) => domain.profiles.includes(code))
        const weight = top.reduce((sum, code, i) => sum + (domain.profiles.includes(code) ? 3 - i : 0), 0)
        return { ...domain, matched, weight }
    })
        .filter((domain) => domain.weight > 0)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3)
}
