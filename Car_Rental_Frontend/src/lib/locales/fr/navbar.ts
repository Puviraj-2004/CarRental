import type { DeepStringify } from '../en';
import type { navbar as enNavbar } from '../en/navbar';

export const navbar: DeepStringify<typeof enNavbar> = {
  home: "Accueil",
  cars: "Véhicules",
  about: "À propos",
  profile: "Mon profil",
  bookings: "Mes réservations",
  dashboard: "Tableau de bord admin",
  admin: "Admin",
  login: "Connexion",
  logout: "Déconnexion",

  menuTitle: "Blue Drive",
  menuSubtitle: "Plateforme premium de location de voitures",
  account: "Compte",
  guest: "Accès invité",
  authenticated: "Connecté",
  adminDashboard: "Tableau de bord admin",
  dashboardDescription: "Gérez la flotte, les réservations, les utilisateurs et les opérations de location.",
  loginDescription: "Connectez-vous pour gérer vos réservations, vos documents et votre profil.",

  logoutConfirm: "Voulez-vous vous déconnecter ?",
  logoutTitle: "Confirmer la déconnexion",
  logoutDescription: "Vous serez déconnecté de cette session.",
  logoutCancel: "Rester connecté",
  logoutAction: "Déconnexion",

  openMenu: "Ouvrir le menu",
  closeMenu: "Fermer le menu",
  toggleTheme: "Changer le thème",
} as const;