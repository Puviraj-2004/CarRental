import type { DeepStringify } from '../en';
import type { admin as enAdmin } from '../en/admin';

export const admin: DeepStringify<typeof enAdmin> = {
  shell: {
    workspace: "Admin",
    openSidebar: "Ouvrir la barre laterale",
    closeSidebar: "Fermer la barre laterale",
    openMenu: "Ouvrir le menu admin",
    closeMenu: "Fermer le menu admin",
    menu: "Menu",
  },
  menu: {
    dashboard: "Tableau de bord",
    vehicles: "Vehicules",
    bookings: "Reservations",
    onlineBookings: "Reservations en ligne",
    onsiteRentals: "Locations sur place",
    courtesyBookings: "Reservations de courtoisie",
    users: "Utilisateurs",
    reports: "Rapports",
    manageSetups: "Parametres",
    brands: "Marques",
    models: "Modeles",
    fuelTypes: "Carburants",
    paymentMethods: "Modes de paiement",
  },
  dashboard: {
    title: "Vue d'ensemble",
    subtitle: "Suivi en direct du parc, des utilisateurs et des locations actives.",
    stats: {
      totalUsers: "Utilisateurs",
      totalCars: "Vehicules",
      totalBookings: "Reservations",
      totalRevenue: "Chiffre d'affaires",
      availableCars: "Parc disponible",
    },
    recentBookings: "Reservations recentes",
    table: {
      id: "Ref",
      customer: "Client",
      car: "Vehicule",
      price: "Tarif",
      status: "Statut",
      date: "Date",
    },
  },
} as const;
