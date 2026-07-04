import { TranslationKeys } from './en';
import { home } from './fr/home';
import { navbar } from './fr/navbar';
import { auth } from './fr/auth';
import { admin } from './fr/admin';
import { payment } from './fr/payment';
import { booking } from './fr/booking';
import { documents } from './fr/documents';
import { adminCars, cars } from './fr/cars';
import { layout } from './fr/layout';

export const fr = {
  common: {
    loading: "Chargement...",
    submit: "Soumettre",
    cancel: "Annuler",
    confirm: "Confirmer",
    save: "Enregistrer",
    delete: "Supprimer",
    edit: "Modifier",
    back: "Retour",
    actions: "Actions",
    noData: "Aucune donnee disponible",
    error: "Une erreur est survenue. Veuillez reessayer.",
    yes: "Oui",
    no: "Non",
  },
  navbar,
  home,
  auth,
  admin,
  payment,
  booking,
  documents,
  layout,
  cars,
  adminCars,
} as unknown as TranslationKeys;
