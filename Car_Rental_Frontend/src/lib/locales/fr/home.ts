import type { DeepStringify } from '../en';
import type { home as enHome } from '../en/home';

export const home: DeepStringify<typeof enHome> = {
  hero: {
    eyebrow: "Location de voitures premium",
    title: "Blue Drive",
    subtitle: "Reservez des vehicules verifies, deposez vos documents en securite et gerez chaque location depuis une experience web et mobile soignee.",
    primaryCta: "Voir les voitures",
    secondaryCta: "Creer un compte",
  },
  quickSearch: {
    title: "Commencez avec le bon vehicule",
    subtitle: "Consultez la flotte en direct, comparez les tarifs et reservez uniquement lorsque le vehicule correspond a votre trajet.",
    cta: "Explorer les voitures disponibles",
  },
  trust: {
    payments: {
      title: "Paiements securises",
      description: "Les paiements en ligne et les modes de paiement en agence sont geres avec des workflows controles.",
    },
    verification: {
      title: "Verification des documents",
      description: "Les conducteurs peuvent deposer permis, piece d'identite et justificatif d'adresse avant la validation.",
    },
    operations: {
      title: "Locations maitrisees",
      description: "Les reservations en ligne, locations sur place et reservations de courtoisie sont separees pour une meilleure gestion.",
    },
  },
  process: {
    title: "Un parcours de location plus clair",
    subtitle: "La plateforme garde chaque etape lisible pour les clients et controlee pour l'equipe operationnelle.",
    browse: {
      title: "Choisir un vehicule",
      description: "Consultez disponibilites, tarifs, details du vehicule et dates avant de creer une reservation.",
    },
    verify: {
      title: "Verifier les documents",
      description: "Deposez les documents requis, puis attendez la validation admin avant confirmation du trajet.",
    },
    drive: {
      title: "Prendre la route",
      description: "Une fois le paiement et la verification termines, la location peut demarrer puis etre cloturee proprement.",
    },
  },
  aiFeature: {
    eyebrow: "Concu pour une revue plus rapide",
    title: "Controle documentaire sans file d'attente",
    description: "Les clients deposent leurs documents en ligne pendant que les admins verifient les informations extraites et approuvent les dossiers complets.",
    cta: "Aller au profil",
  },
  fleet: {
    eyebrow: "Flotte en direct",
    title: "Vehicules en vedette",
    subtitle: "Un apercu des vehicules disponibles depuis l'inventaire actuel.",
    viewDetails: "Voir les details",
    browseAll: "Voir toute la flotte",
    priceSuffix: "par jour",
    unavailableImage: "Image du vehicule indisponible",
    emptyState: "Aucun vehicule disponible n'est pret a etre affiche pour le moment.",
  },
  finalCta: {
    title: "Pret a reserver votre prochain vehicule ?",
    subtitle: "Parcourez la flotte, choisissez vos dates et finalisez les etapes depuis votre compte.",
    cta: "Trouver une voiture",
  },
} as const;
