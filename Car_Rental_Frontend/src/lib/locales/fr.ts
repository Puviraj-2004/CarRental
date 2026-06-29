import { TranslationKeys } from './en';
import { home } from './fr/home';
import { navbar } from './fr/navbar';
import { auth } from './fr/auth';
import { admin } from './fr/admin';
import { payment } from './fr/payment';

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
    noData: "Aucune donnée disponible",
    error: "Une erreur est survenue. Veuillez réessayer.",
    yes: "Oui",
    no: "Non",
  },
  navbar,
  home,
  auth,
  admin,
  payment,
  cars: {
    catalog: {
      title: "Explorez Notre Flotte",
      subtitle: "Filtrez et trouvez le véhicule idéal pour votre trajet. Sans attente, véhicules vérifiés.",
      filters: {
        searchPlaceholder: "Rechercher par marque, modèle...",
        brand: "Marque",
        model: "Modèle",
        fuelType: "Carburant",
        status: "Statut",
        minPrice: "Prix Min (€)",
        maxPrice: "Prix Max (€)",
        allBrands: "Toutes les Marques",
        allModels: "Tous les Modèles",
        allFuels: "Tous les Carburants",
        allStatuses: "Tous les Statuts",
        clear: "Réinitialiser",
      },
      pricePerDay: "€ / jour",
      emptyState: "Aucun véhicule ne correspond à vos critères. Veuillez modifier vos filtres.",
    },
    details: {
      title: "Caractéristiques du Véhicule",
      price: "Tarif Journalier",
      calendarTitle: "Calendrier des Disponibilités",
      bookBtn: "Réserver ce Véhicule",
      specs: {
        plate: "Immatriculation",
        fuel: "Carburant",
        transmission: "Transmission",
        seats: "Nombre de Sièges",
        deposit: "Dépôt de Garantie requis",
      }
    }
  },
  adminCars: {
    add: {
      title: "Ajouter un Véhicule",
      subtitle: "Enregistrez un nouveau véhicule dans le parc. Renseignez ses caractéristiques et son image principale.",
      modelId: "Sélectionner le Modèle",
      plateNumber: "Numéro d'Immatriculation",
      fuelType: "Sélectionner le Carburant",
      basePrice: "Tarif de Location Journalier (€/jour)",
      status: "Statut Initial du Véhicule",
      primaryImage: "Télécharger l'Image de Couverture",
      additionalImages: "Télécharger des Images de Galerie (Optionnel)",
      submit: "Créer le Véhicule",
      success: "Véhicule créé avec succès !",
    },
    list: {
      title: "Gestion de la Flotte",
      subtitle: "Ajoutez, modifiez, suivez le statut ou supprimez des véhicules de votre parc actif.",
      addBtn: "Ajouter un Véhicule",
      table: {
        car: "Véhicule",
        plate: "Immatriculation",
        price: "Tarif de Base",
        status: "Statut",
        actions: "Actions",
      },
       deleteDialog: {
        title: "Confirmer la Suppression",
        description: "Êtes-vous sûr de vouloir supprimer définitivement ce véhicule du parc ? Cette action est irréversible.",
      }
    },
      edit: {
      title: "Modifier le Véhicule",
      subtitle: "Mettez à jour les caractéristiques, l'immatriculation, le tarif ou l'image de couverture.",
      submit: "Enregistrer les Modifications",
      success: "Véhicule mis à jour avec succès !",
      additionalImages: "Télécharger des Images de Galerie (Optionnel)",
      currentGallery: "Images Actuelles de la Galerie",

    },
    common: {
      required: "Ce champ est obligatoire.",
      invalidPrice: "Le tarif doit être supérieur à 0.",
      cancel: "Annuler",
    }
  },
} as unknown as TranslationKeys;
