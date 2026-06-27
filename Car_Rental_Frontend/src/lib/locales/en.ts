import { home } from './en/home';
import { navbar } from './en/navbar';
import { auth } from './en/auth';

// Recursively maps literal string values to the general 'string' type
export type DeepStringify<T> = {
  [K in keyof T]: T[K] extends object
    ? DeepStringify<T[K]>
    : string;
};

export const en = {
  common: {
    loading: "Loading...",
    submit: "Submit",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    actions: "Actions",
    noData: "No data available",
    error: "An error occurred. Please try again.",
    yes: "Yes",
    no: "No",
  },
  navbar,
  home,
  auth,
  admin: {
    menu: {
      dashboard: "Dashboard",
      vehicles: "Vehicles",
      bookings: "Bookings",
      reports: "Reports",
    },
    dashboard: {
      title: "Dashboard Overview",
      subtitle: "Live monitoring of fleet metrics, user profiles, and active rentals.",
      stats: {
        totalUsers: "Total Users",
        totalCars: "Total Cars",
        totalBookings: "Total Bookings",
        totalRevenue: "Total Revenue",
        availableCars: "Available Fleet",
      },
      recentBookings: "Recent Bookings",
      table: {
        id: "ID",
        customer: "Customer",
        car: "Car",
        price: "Price",
        status: "Status",
        date: "Date",
      },
    },
  },
  cars: {
    catalog: {
      title: "Explore Our Fleet",
      subtitle: "Filter and find the perfect car for your journey. No waiting, verified vehicles.",
      filters: {
        searchPlaceholder: "Search by brand, model, or plate...",
        brand: "Brand",
        model: "Model",
        fuelType: "Fuel Type",
        status: "Status",
        minPrice: "Min Price (€)",
        maxPrice: "Max Price (€)",
        allBrands: "All Brands",
        allModels: "All Models",
        allFuels: "All Fuel Types",
        allStatuses: "All Statuses",
        clear: "Clear Filters",
      },
      pricePerDay: "€ / day",
      emptyState: "No cars match your search criteria. Please adjust your filters.",
    },
    details: {
      title: "Vehicle Specifications",
      price: "Price Per Day",
      calendarTitle: "Availability Calendar",
      bookBtn: "Reserve This Vehicle",
      specs: {
        plate: "Plate Number",
        fuel: "Fuel Type",
        transmission: "Transmission",
        seats: "Seats Count",
        deposit: "Required Deposit",
      },
    }
  },
  adminCars: {
    add: {
      title: "Add New Vehicle",
      subtitle: "Register a new car to the fleet. Handle specifications and primary images.",
      modelId: "Select Vehicle Model",
      plateNumber: "Plate Number",
      fuelType: "Select Fuel Type",
      basePrice: "Base Rental Price (€/day)",
      status: "Initial Vehicle Status",
      primaryImage: "Upload Primary Cover Image",
      additionalImages: "Upload Additional Gallery Images (Optional)",
      submit: "Create Vehicle",
      success: "Vehicle created successfully!",
    },
    list: {
      title: "Vehicle Fleet Management",
      subtitle: "Add, modify, track status, or remove vehicles from your active rental fleet.",
      addBtn: "Add New Car",
      table: {
        car: "Vehicle",
        plate: "Plate Number",
        price: "Base Price",
        status: "Status",
        actions: "Actions",
      },
      deleteDialog: {
        title: "Confirm Deletion",
        description: "Are you sure you want to permanently remove this vehicle from the fleet? This action cannot be undone.",
      },
    },
      edit: {
      title: "Modify Vehicle",
      subtitle: "Update vehicle specifications, plates, pricing, or its cover image.",
      submit: "Save Changes",
      success: "Vehicle updated successfully!",
      additionalImages: "Upload Additional Gallery Images (Optional)",
      currentGallery: "Current Gallery Images",
    },
    common: {
      required: "This field is required.",
      invalidPrice: "Price must be greater than 0.",
      cancel: "Cancel",
    }
  },

} as const;

// The keys and structure remain strictly checked, but any string value is accepted
export type TranslationKeys = DeepStringify<typeof en>;
