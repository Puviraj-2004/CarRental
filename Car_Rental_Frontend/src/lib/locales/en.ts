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
  navbar: {
    home: "Home",
    cars: "Cars",
    about: "About Us",
    profile: "My Profile",
    bookings: "My Bookings",
    dashboard: "Admin Dashboard",
    login: "Login",
    logout: "Logout",
  },
  home: {
    hero: {
      title: "Premium Car Rental For Your Journeys",
      subtitle: "Experience luxury and comfort with our fully verified, premium vehicle fleet. Safe, seamless, and entirely digital.",
      cta: "Browse Our Fleet",
    },
    aiFeature: {
      title: "Instant Verification with AI",
      description: "No more waiting in line. Upload your driving licence and ID, and our secure AI system will verify your profile in seconds so you can pay and drive.",
      cta: "Verify My Profile",
    },
    trust: {
      securePayments: "Secure Payments",
      securePaymentsDesc: "Processed via Stripe with multi-channel authentication protection.",
      support: "24/7 Support",
      supportDesc: "Our support agents are always online to assist with your rental.",
      verified: "Verified Fleet",
      verifiedDesc: "Every vehicle is physically checked and held in absolute readiness.",
    },
    fleet: {
      title: "Featured Fleet",
      subtitle: "Choose from our range of top-tier, comfortable, and reliable vehicles.",
      viewDetails: "View Details",
    },
  },
  auth: {
    login: {
      title: "Welcome Back",
      subtitle: "Log in to your account to manage bookings and discover our fleet.",
      email: "Email Address",
      password: "Password",
      submit: "Log In",
      noAccount: "Don't have an account?",
      registerLink: "Register here",
      errorInvalid: "Invalid email or password. Please try again.",
    },
    register: {
      title: "Create an Account",
      subtitle: "Register now to start reserving cars and verify your profile with AI.",
      fullName: "Full Name",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      phone: "Phone Number",
      submit: "Register",
      hasAccount: "Already have an account?",
      loginLink: "Log in here",
      passwordMismatch: "Passwords do not match.",
    },
    verifyOtp: {
      title: "Verify Your Email",
      subtitle: "We have sent a 6-digit verification code to",
      code: "Verification Code",
      submit: "Verify Code",
      resend: "Resend Code",
      resendSuccess: "A new verification code has been sent.",
    }
  },
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