# Edumada — Fonctionnalités et algorithmes

*État au 19 octobre 2026. Tiré du code (site Next.js, API Laravel `backend/`, back-office `backoffice/`).*

Edumada aide à trouver un établissement et une offre éducative à Madagascar, de la crèche à l'université. Trois applications travaillent ensemble :

| Application | Rôle | Adresse en local |
|---|---|---|
| Site public (Next.js, export statique) | Recherche, fiches, espace étudiant, pages d'information | http://localhost:3000 |
| Back-office (Next.js + CoreUI) | Espace établissement et administration | http://localhost:5173 |
| API (Laravel, MariaDB) | Données, comptes, règles métier, e-mails | http://localhost:8000/api/v1 |

Prix et limites cités ici : **prix de lancement indicatifs**, modifiables par l'administrateur.

---

## 1. Les comptes

| Compte | Où | Prix |
|---|---|---|
| Visiteur (sans compte) | Site | – |
| Étudiant ou parent | Site (`/espace/etudiant`) | Gratuit |
| Établissement Gratuit | Back-office | 0 Ar |
| Établissement Pro | Back-office | 75 000 Ar/mois ou 600 000 Ar/an |
| Établissement Premium | Back-office | 175 000 Ar/mois (pas de prix annuel) |
| Administrateur | Back-office | – (jamais créé par l'inscription publique) |

### 1.1 Visiteur
- Recherche et filtres, fiches établissements et offres, pages Orientation, Domaines, Actualités, À propos, Avantages, Tarifs, Contact.
- Signaler une information erronée sur une fiche.
- Formulaire de contact.

### 1.2 Étudiant ou parent
- Favoris.
- Demande d'information à un établissement, depuis une offre.
- Candidature en ligne, avec documents joints.
- Suivi des démarches : historique des statuts et réponses.
- Avis sur un établissement (publié après modération).
- Profil, mot de passe, suppression du compte.

### 1.3 Établissement — Gratuit
- Inscription dédiée (`/inscription-etablissement/`) : responsable du compte et informations minimales de l'établissement.
- Fiche essentielle : présentation, photo de couverture, carte, pièces à fournir, accréditation.
- **Coordonnées limitées** à l'adresse, au téléphone et à l'e-mail public : pas de site web ni de réseaux sociaux sur la fiche.
- **Pas de galerie photos** des locaux.
- **2 infrastructures** au maximum.
- **Pas d'avis** : la fiche n'en affiche pas, et les étudiants ne peuvent pas en déposer.
- Création d'une autre fiche, ou revendication d'une fiche existante.
- **1 offre publiée** au maximum.
- Présence dans les résultats standards.
- Demandes reçues **par e-mail**.
- Demande de vérification (badge « établissement vérifié »).
- Facturation : demande de passage à Pro ou Premium, factures.

### 1.4 Établissement — Pro
Tout Gratuit, plus :
- offres illimitées ;
- galerie photos, site web et réseaux sociaux, infrastructures illimitées sur la fiche ;
- avis des étudiants ;
- **boîte de réception** des demandes et candidatures, avec statuts, filtres et export CSV ;
- statistiques standard : vues, clics de contact, clics vers le site, demandes.

### 1.5 Établissement — Premium
Tout Pro, plus :
- **campagnes sponsorisées**, toujours signalées « Sponsorisé » ;
- statistiques avancées par campagne : impressions, clics ;
- accompagnement prioritaire.

### 1.6 Administrateur
- Tableau de bord et indicateurs.
- Établissements : liste par catégorie, demandes d'adhésion (accepter / refuser avec une note), vérification, accréditation, suspension, membres d'une fiche.
- Modération : avis, signalements, revendications de fiche.
- Utilisateurs, catalogue (catégories, domaines).
- Facturation : confirmer ou annuler une facture, annuler un abonnement, modifier les prix et limites des formules, voir les campagnes.
- Actualités : articles publiés sur le site.
- Journal d'audit.
- Règle voulue : l'administrateur **ne modifie pas** les fiches et **ne publie pas** d'offres ; seuls les établissements inscrits publient.

---

## 2. Algorithmes et règles métier

### 2.1 Données du site : API d'abord, fichiers en secours
1. Au premier affichage, le navigateur charge **en parallèle** `public/data/data.json` (menus, filtres, domaines) et le catalogue de l'API.
2. Les éléments fixes (menu, pied de page, filtres, domaines) s'affichent dès que `data.json` arrive, sans attendre l'API.
3. Si l'API répond, ses catégories, établissements, offres et avis **remplacent** ceux de `data.json` :
   - la liste des domaines du filtre est reprise de l'API ;
   - le nombre d'offres par domaine est recalculé.
4. Si l'API ne répond pas, le site reste utilisable avec `data.json`, et un avertissement s'affiche dans la console.
5. Les données sont chargées **une seule fois** par visite, puis partagées entre les pages.

Les fiches restent des pages HTML statiques, générées au build, ce qui est bon pour le référencement. Une offre publiée après le build s'ouvre via `/formations/voir/?id=…` : la page 404 y redirige.

### 2.2 Recherche d'offres
**Filtres principaux** : mot-clé, catégorie, domaine, ville, public/privé. **Filtres avancés** : budget, durée, modalité, diplôme, inscriptions, établissement, langue, niveau, série du BAC, hébergement, bourses, âge de l'enfant.

Règles de correspondance (`src/features/recherche/filters.ts`, équivalent côté API dans `Offer::matchingSearch`) :
- **Combinaison** : entre deux filtres, une offre doit tout respecter (ET). À l'intérieur d'un même filtre à choix multiples, un seul choix suffit (OU). Un filtre vide n'est pas appliqué.
- **Mot-clé** : recherché dans l'intitulé et le domaine, **sans tenir compte des accents ni des majuscules**.
- **Champ Ville, lieux de la carte** : à la frappe, le champ propose d'abord les villes qui ont des formations (avec leur nombre d'offres), puis les **lieux de Madagascar sur la carte** : régions, districts, communes, villes, quartiers, villages (OpenStreetMap, via le service d'autocomplétion Photon, interrogé par l'API `/places` et gardé 7 jours en cache). Chaque lieu affiche son type, son district et sa région, pour distinguer les homonymes (plusieurs « Ivato »). La position du lieu choisi passe dans l'adresse (`&pos=lat,lng`) et sert à la recherche des offres proches.
- **Ville et lieux proches** : le champ accepte aussi un lieu absent de la liste (« Talatamaty », « Ivato »…). Si aucune offre ne correspond à ce lieu, l'API le situe avec le géocodage d'OpenStreetMap (Nominatim, limité à Madagascar, résultat gardé 90 jours en cache) et renvoie les offres **les plus proches**, de la plus près à la plus loin, avec leur distance (« à 6,1 km »). Les autres filtres restent appliqués. Distance calculée à vol d'oiseau, en projection équirectangulaire (écart de quelques centaines de mètres à l'échelle de Madagascar). Lieu introuvable : un message le signale. Les établissements sans position sur la carte ne figurent pas dans ce classement.
- **Sélecteur Ville / Localisation** (accueil, page Recherche, barre mobile, pages Établissements et Formation professionnelle) : un panneau s'ouvre avec une recherche (villes qui ont des formations, puis lieux de la carte), « Votre position actuelle » et les « Villes populaires » (six grandes villes, avec leur nombre d'offres). Le bouton « Ma position actuelle » demande la position au navigateur (avec l'accord de la personne) et affiche les résultats du plus proche au plus loin, avec leur distance. Le lieu correspondant est nommé (« Talatamaty, Ambohidratrimo, Analamanga ») par l'API `/places/here` (géocodage inverse d'OpenStreetMap, position arrondie à ~100 m, gardée 30 jours en cache) ; si l'accès à la position est déjà autorisé, il est proposé dès l'ouverture du panneau. Utile pour les homonymes (plusieurs « Talatamaty » à Madagascar) : soit on choisit le bon lieu dans la liste (district et région affichés), soit on cherche autour de soi. Refus ou position introuvable : un message invite à taper un lieu.
- **Pages Universités et Formation professionnelle** : elles listent les **offres** de leur catégorie (pas les établissements). Page Universités : des pastilles filtrent par sous-catégorie de l'établissement (Université, École supérieure, Institut supérieur, Grande école), avec le nombre d'offres de chacune ; les sous-catégories sans offre sont masquées. Puis filtres Filière et Ville / Localisation.
- **Tous les champs Ville et localisation** : mêmes suggestions de lieux sur les pages Établissements et Formation professionnelle (filtrage local, puis classement par distance si la ville n'a aucun résultat), dans les formulaires d'inscription (étudiant, établissement), le profil étudiant, et dans le back-office (fiche établissement, ville ciblée des campagnes). À l'inscription d'un établissement, la position du lieu choisi est enregistrée (à préciser ensuite dans la fiche) ; dans la fiche du back-office, elle remplit la latitude et la longitude si elles sont vides.
- **Budget** : tranches `[min ; max[` (moins de 1 M, 1–2,5 M, 2,5–5 M, plus de 5 M Ar). Une offre sans frais connus est **exclue** dès qu'un budget est choisi.
- **Durée** : classée en « moins d'un an », « 1 an », « 2 ans », « 3 ans », « 5 ans ou plus ».
- **Niveau de l'étudiant** : une offre est gardée si le niveau exigé est **inférieur ou égal** au sien. Échelle : sans BAC = 0, BAC = 1, BAC+2 = 2, BAC+3 = 3.
- **Série du BAC** : une offre qui n'exige aucune série précise reste visible.
- **Langue** : une langue hors liste compte comme « Autre ».
- **Âge de l'enfant** : l'âge doit tomber dans la tranche d'accueil de l'offre. Une offre sans tranche d'âge est exclue.
- **Tri** :
  - « Pertinence » garde l'ordre d'origine ;
  - les tris par frais (croissants ou décroissants) et par durée la plus courte placent les offres **sans valeur en fin de liste**.
- **Pastilles** : chaque filtre actif devient une pastille qu'on peut retirer.
- **Arrivée depuis l'accueil** : la recherche du Hero passe ses choix dans l'URL (`?categorie=…&ville=…`). Le filtre « niveau » du Hero est converti en diplôme : « BTS / DTS » donne BTS, « Formation professionnelle » donne Certificat.
- **Côté API** : 24 résultats par page, et seules les offres **publiées d'établissements publiés** sont visibles.

### 2.3 Offres sponsorisées (Premium)
1. L'API retient les campagnes **en cours** dont l'offre est publiée.
2. Elle applique le ciblage : catégorie, domaine et ville. Une campagne sans ciblage s'affiche partout.
3. Elle en tire **20 au hasard**, garde seulement celles d'établissements ayant encore la fonction « sponsorisé », retire les doublons d'offre et en renvoie **2 au maximum** (6 au plus sur demande).
4. Sur la page de recherche, elles apparaissent au-dessus des résultats, avec la mention « Sponsorisé ». Le site compte une **impression** à l'affichage et un **clic** au clic.

### 2.4 Statistiques
- Événements comptés : vue d'une fiche, impression, clic de campagne, clic de contact (téléphone, e-mail), clic vers le site, clic « Postuler ».
- Le site envoie les événements par lots (50 au maximum).
- L'API ignore les fiches non publiées et les offres qui n'appartiennent pas à la fiche annoncée.
- Les événements sont regroupés en **compteurs par jour** : établissement × offre × campagne × type.
- Une demande d'information compte un clic de contact, une candidature un clic « Postuler ».
- Limite : 120 envois par minute et par adresse IP.

### 2.5 Demandes d'information et candidatures
1. L'étudiant connecté envoie sa demande depuis une offre. Une candidature peut avoir des pièces jointes, stockées en privé.
2. La demande commence au statut **Nouvelle**. Statuts possibles : Nouvelle, En cours d'examen, Informations demandées, Entretien, Acceptée, Refusée. Chaque changement est historisé, et l'étudiant est prévenu.
3. **Notification** : un e-mail part vers l'adresse de l'établissement et vers chaque membre de la fiche.
   - **Gratuit** : l'e-mail contient la demande, et l'établissement répond par e-mail.
   - **Pro ou Premium** : l'e-mail renvoie vers la boîte de réception du back-office. L'accès à cette boîte est refusé aux fiches qui n'ont pas la fonction.

### 2.6 Cycle de vie d'une fiche établissement
Statuts : **Brouillon**, **En attente de validation**, **Publiée**, **Suspendue**.

- **Création** :
  - depuis l'inscription dédiée ou le back-office, la fiche est **en attente de validation** et rattachée au compte comme **propriétaire** ;
  - à l'inscription, seuls le nom, la catégorie, la ville, et l'e-mail ou le site s'ils sont donnés, sont enregistrés ;
  - le secteur public / privé reste vide jusqu'à ce que l'établissement le précise.
- **Demande d'adhésion** : l'administrateur voit les fiches en attente.
  - Publiée : demande acceptée.
  - Renvoyée en brouillon : demande refusée.
  - Dans les deux cas, un e-mail part, avec la note éventuelle de l'administrateur.
- **Demande de vérification** : la vérification passe à « en cours », et une fiche en brouillon repasse **en attente de validation**.
- **Vérification** : seul l'administrateur l'attribue, avec la date du jour. Elle **ne s'achète pas**. L'accréditation n'est affichée sur le site que si elle est vérifiée.
- **Revendication** : un compte établissement **sans fiche** envoie un message (20 caractères au moins). Une seule demande en attente par personne et par fiche. L'administrateur la traite.
- **Un compte = un établissement** : un compte ne gère qu'une seule fiche. Créer une deuxième fiche, en revendiquer une autre ou être ajouté à une autre équipe est refusé.
- **Équipe** : une fiche peut être gérée par plusieurs comptes, avec deux rôles.
  - **Propriétaire** : tout, y compris l'équipe, la formule et les factures. Une fiche garde toujours au moins un propriétaire : le dernier ne peut être ni retiré ni rétrogradé.
  - **Éditeur** : la fiche, les offres et les demandes. Il voit l'équipe mais ne la modifie pas.
  - Le propriétaire ajoute un membre depuis la page **Équipe** du back-office. Pour une adresse inconnue, le compte est créé avec un mot de passe provisoire choisi ou généré, affiché une seule fois. Un compte établissement existant sans fiche est simplement rattaché. Un compte étudiant ou administrateur est refusé.
  - La personne ajoutée reçoit un e-mail avec le lien de connexion. Un membre retiré perd aussitôt l'accès (ses sessions sont fermées). Chaque ajout, changement de rôle et retrait est inscrit au journal d'audit.
- **Identifiant (slug)** : tiré du nom (« Institut de Toliara » donne `institut-de-toliara`), avec un suffixe `-2`, `-3`… en cas de doublon. Pour une offre, on part de l'intitulé et du sigle (ou du nom) de l'établissement.

### 2.7 Offres et limite de la formule
- Statuts : **Brouillon**, **Publiée**, **Archivée**. Une offre n'est visible que si **elle et sa fiche** sont publiées.
- Avant chaque publication, l'API vérifie la limite de la formule en vigueur (Gratuit : 1, Pro et Premium : illimité). Au-delà, la publication est refusée avec un message.

### 2.7 bis Ce que la formule affiche sur la fiche publique
- L'API filtre la fiche publique selon la formule en vigueur (`PublicLimits`). En Gratuit, elle retire la galerie, le site web et les réseaux sociaux, et ne garde que les 2 premières infrastructures. Elle ne renvoie aucun avis : `reviewsEnabled` vaut `false`, et le site masque alors la section des avis et le bouton « Donner mon avis ».
- Les données restent **enregistrées** et visibles par l'établissement dans son espace : elles réapparaissent dès le passage à Pro ou Premium.
- À l'enregistrement d'une fiche Gratuit, l'API refuse une galerie non vide et plus de 2 infrastructures. Le back-office masque ces champs, n'envoie pas le site web et les réseaux, et bloque l'ajout d'une troisième infrastructure.

### 2.8 Formules, paiement et abonnements
1. **Demande** : l'établissement choisit Pro ou Premium, mensuel ou annuel, et un moyen de paiement (MVola, Orange Money, Airtel Money, virement, espèces).
   - Le montant vient de la formule. Un rythme sans prix, comme Premium à l'année, est refusé.
   - **Une seule facture en attente** à la fois.
   - Numéro de facture : `EDU-AAAA-00001`, recommencé chaque année.
2. **Paiement** : l'établissement paie hors ligne et indique la référence. L'administrateur **confirme** ou annule la facture.
3. **Activation** à la confirmation :
   - **même formule** déjà active : la période **s'ajoute à la fin** de l'abonnement en cours, et les rappels repartent à zéro ;
   - **autre formule** : l'ancien abonnement est annulé et le nouveau commence **aujourd'hui** ;
   - durée : un mois ou un an selon le rythme ;
   - un e-mail confirme l'activation.
4. **Formule en vigueur** : l'abonnement actif, ou en période de grâce. Sinon, la formule **Gratuit**.
5. **Tâche quotidienne** (6 h, commande `subscriptions:process`) :
   - **rappels** à 30, 7 et 1 jour de la fin, un seul par palier, même si la tâche a manqué un jour ;
   - à la date de fin, passage en **période de grâce** de **7 jours** (réglable) ;
   - à la fin de la grâce, l'abonnement **expire** et la fiche repasse en Gratuit. Les offres en trop (au-delà d'une) repassent en **brouillon**, en gardant publiée la **plus récemment modifiée**. Un e-mail prévient l'établissement.

### 2.9 Avis et signalements
- **Avis** :
  - réservé aux comptes étudiants, sur une fiche publiée en formule Pro ou Premium ;
  - note de 1 à 5 et texte de 20 à 1 500 caractères ;
  - publié **après modération** ;
  - l'auteur est affiché sous la forme « Prénom N. » (« Fanja Rakoto » donne « Fanja R. »).
- **Signalement** :
  - ouvert à tous, connecté ou non ;
  - motifs : information erronée, frais, dates, établissement fermé, autre ;
  - message de 10 caractères au moins ;
  - 10 signalements par heure au plus par adresse IP.

### 2.10 Inscription, connexion et sécurité
- **Inscription étudiant** : nom, e-mail, mot de passe. Téléphone, ville et niveau sont facultatifs.
- **Inscription établissement**, sur la page dédiée :
  - obligatoires : nom, prénom, fonction, e-mail professionnel, téléphone, mot de passe, nom officiel, type d'établissement et ville ;
  - facultatifs : e-mail de l'établissement et site web (`https://` est ajouté si besoin) ;
  - après l'inscription, l'établissement est envoyé vers la connexion du back-office, avec son e-mail déjà rempli.
- **Mot de passe** : règle par défaut de Laravel, avec confirmation.
- **Règles de l'inscription** : un compte administrateur ne peut pas être créé par cette voie, et un étudiant ne peut pas joindre d'établissement.
- **Limites par adresse IP** :
  - connexion : 5 essais par minute ;
  - inscription : 10 par heure ;
  - formulaire de contact : 5 par heure.
- **Journal d'audit** : modération, abonnements, factures et demandes de vérification sont enregistrés.

### 2.11 Contenus générés automatiquement
- **FAQ** des fiches établissement et offre : questions et réponses déduites des données (conditions, rentrée, frais…) et adaptées à la catégorie. Une crèche n'a pas les mêmes questions qu'une université.
- **Sections affichées selon la catégorie** : diplômes, programme, âge des enfants, débouchés. Par exemple, les débouchés sont masqués pour les crèches et les écoles.
- **Frais** : marqués « Confirmés » ou « Estimés », ou affichés « Non communiqué », plutôt qu'un montant inventé.

### 2.12 Expérience sur le site
- **Mobile first** : chaque page est conçue d'abord pour un écran de 375 px.
- **Navigation** : une barre de progression rouge apparaît dès le clic sur un lien interne et disparaît quand la page est affichée.
- **Bandeau « Vous êtes un établissement de formation ? »** : présent en bas de toutes les pages, sauf sur la page d'inscription des établissements.
- **Défilement automatique** des logos et des carrousels, en pause au survol.

---

## 3. Ce qui reste à faire ou à valider
- **Données d'exemple** à remplacer avant la mise en ligne : établissements, offres, avis, note « 4.6 Google », logos partenaires.
- **Choix de la formule pendant l'inscription d'un établissement** : prévu plus tard.
- **Badge « −10 % » sur l'annuel (page Tarifs)** : il ne correspond pas aux prix réels. Pro coûte 600 000 Ar par an au lieu de 900 000, soit environ −33 %.
- **Si l'administrateur publie une fiche avant que le secteur public / privé soit renseigné**, elle sera publiée sans cette information.
- **E-mails réels (SMTP)** et vérification de l'adresse e-mail.
- **Paiement Mobile Money automatique** (API MVola / Orange Money).
- **Newsletter** : non branchée.
- **Hébergement** commun du site, du back-office et de l'API.
- **Pages légales** à faire valider par un juriste.
