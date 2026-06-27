import type { DeepStringify } from '../en';
import type { navbar as enNavbar } from '../en/navbar';

export const navbar: DeepStringify<typeof enNavbar> = {
  home: "Accueil",
  cars: "Vehicules",
  about: "A Propos",
  profile: "Mon Profil",
  bookings: "Mes Reservations",
  dashboard: "Console Admin",
  admin: "Admin",
  login: "Connexion",
  logout: "Deconnexion",
  logoutConfirm: "Voulez-vous vous deconnecter ?",
  openMenu: "Ouvrir le menu",
  closeMenu: "Fermer le menu",
  toggleTheme: "Changer le theme",
} as const;
