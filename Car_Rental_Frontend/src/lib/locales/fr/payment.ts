import type { DeepStringify } from '../en';
import type { payment as enPayment } from '../en/payment';

export const payment: DeepStringify<typeof enPayment> = {
  common: {
    days: "Jours",
    plate: "Immatriculation",
    subtotal: "Sous-total",
    tax: "Taxe",
    total: "Total",
    bookingReference: "Reference de reservation",
    tripDuration: "Duree",
  },
  checkout: {
    title: "Paiement",
    subtitle: "Verifiez le total de la reservation avant de continuer vers Stripe Checkout.",
    steps: {
      reserve: "Reservation",
      documents: "Documents",
      payment: "Paiement",
      done: "Termine",
      active: "Actif",
    },
    summary: "Resume de reservation",
    secureNotice: "Vous serez redirige vers Stripe pour effectuer un paiement securise.",
    payNow: "Payer en securite",
    redirecting: "Redirection...",
    payLater: "Retour aux reservations",
    missingReference: "Reference de reservation manquante. Redirection vers la flotte...",
    redirectStarted: "Tunnel de paiement securise initialise. Redirection...",
    loadError: "Les details de reservation n ont pas pu etre charges. Verifiez votre lien.",
  },
  success: {
    title: "Paiement reussi",
    subtitle: "Votre paiement est termine et la reservation est confirmee.",
    receipt: "Recu",
    pickupDate: "Date de debut",
    returnDate: "Date de fin",
    totalCharged: "Total debite",
    verification: "Verification des documents",
    pendingApproval: "Validation admin en attente",
    approved: "Approuve",
    goBookings: "Voir les reservations",
    bookAnother: "Reserver une autre voiture",
    loadError: "Le recu n a pas pu etre charge. Veuillez verifier vos reservations.",
  },
  cancelled: {
    title: "Paiement annule",
    subtitle: "La session Stripe Checkout a ete fermee. Aucun paiement n'a ete finalise.",
    retry: "Reessayer le paiement",
    back: "Retour aux reservations",
  },
} as const;
