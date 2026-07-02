export const home = {
  hero: {
    eyebrow: "Premium car rental platform",
    title: "Blue Drive",
    subtitle:
      "Book verified vehicles, upload rental documents securely, track approval progress, and manage every reservation from one polished web and mobile experience built for modern renters.",
    primaryCta: "Browse verified cars",
    secondaryCta: "Create secure account",
    stats: {
      verified: {
        value: "Verified",
        label: "fleet records",
      },
      documents: {
        value: "Secure",
        label: "document uploads",
      },
      support: {
        value: "Managed",
        label: "rental workflow",
      },
    },
    floatingCard: {
      title: "Rental readiness",
      status: "Live booking flow",
      pickup: "Choose pickup dates",
      documents: "Submit documents",
      approval: "Admin approval",
    },
  },

  quickSearch: {
    eyebrow: "Smarter vehicle discovery",
    title: "Start with the right car, not a random listing",
    subtitle:
      "Compare the live fleet, check daily pricing, review vehicle details, and continue only when the car, dates, and rental conditions match your trip.",
    cta: "Explore available cars",
    details: {
      availability: {
        title: "Live availability",
        description: "See vehicles that are ready to reserve from the active inventory.",
      },
      dates: {
        title: "Date-aware booking",
        description: "Select rental dates before moving into checkout and verification.",
      },
      confidence: {
        title: "Clear decision path",
        description: "Review price, vehicle information, and next steps before you commit.",
      },
    },
  },

  trust: {
    eyebrow: "Built for trust",
    title: "Every rental step is controlled, traceable, and easier to manage",
    subtitle:
      "Blue Drive keeps payments, documents, booking types, and operational reviews separated so customers and administrators always know what happens next.",
    payments: {
      title: "Secure payments",
      description:
        "Online card payments and admin-recorded onsite payment methods are handled through controlled workflows, helping every booking keep a clearer payment trail.",
    },
    verification: {
      title: "Document verification",
      description:
        "Drivers can upload licence, ID, and address documents digitally before the rental moves forward, reducing manual counter checks and missing paperwork.",
    },
    operations: {
      title: "Managed rental operations",
      description:
        "Online bookings, onsite rentals, and courtesy bookings are separated inside the workflow for cleaner reporting, cleaner handovers, and fewer operational mistakes.",
    },
  },

  process: {
    eyebrow: "Simple customer journey",
    title: "A calmer rental flow from search to handover",
    subtitle:
      "The platform guides customers through each step while giving the operations team better visibility, cleaner status tracking, and a more reliable approval process.",
    browse: {
      title: "Choose a vehicle",
      description:
        "Review live availability, pricing, vehicle details, and rental dates before creating a booking request that fits your trip.",
    },
    verify: {
      title: "Verify documents",
      description:
        "Upload the required driver documents once, keep them organised inside your account, and wait for admin review before the rental is confirmed.",
    },
    drive: {
      title: "Pick up and drive",
      description:
        "After payment and verification are complete, the rental can be started, tracked, completed, and closed with a cleaner operational record.",
    },
  },

  aiFeature: {
    eyebrow: "Built for faster review",
    title: "Document checks without the counter queue",
    description:
      "Customers upload documents digitally while admins review extracted details, check completeness, and approve only records that are ready for a safe rental handover.",
    cta: "Go to profile",
    cards: {
      upload: {
        title: "Upload once",
        description: "Keep licence, ID, and address documents inside your profile.",
      },
      review: {
        title: "Admin review",
        description: "Operations can check submitted records before confirmation.",
      },
      approve: {
        title: "Approve confidently",
        description: "Only complete documents move the booking forward.",
      },
    },
  },

  fleet: {
    eyebrow: "Live fleet",
    title: "Featured vehicles",
    subtitle:
      "A quick look at available vehicles pulled from the current inventory, designed to help customers move from browsing to booking with confidence.",
    viewDetails: "View details",
    browseAll: "Browse all cars",
    priceSuffix: "per day",
    unavailableImage: "Vehicle image unavailable",
    emptyState: "No available vehicles are ready to show right now.",
    cardLabels: {
      verified: "Verified vehicle",
      dailyRate: "Daily rate",
    },
  },

  finalCta: {
    eyebrow: "Ready when you are",
    title: "Reserve your next vehicle with a cleaner digital flow",
    subtitle:
      "Browse the fleet, select your dates, upload documents, complete the required steps, and manage your rental from your account.",
    cta: "Find a car",
    secure: "Secure account",
    verified: "Verified fleet",
    managed: "Managed rental steps",
  },

  about: {
    title: "About Us",
    subtitle:
      "We provide high-quality, verified vehicles with a fast, secure, and entirely digital booking experience.",
    sections: {
      booking: {
        title: "Transparent booking totals",
        description:
          "Your booking total is calculated during checkout from the selected vehicle, rental dates, configured tax rules, and any applicable charges shown before payment.",
      },
      tax: {
        title: "Tax is calculated when you book",
        description:
          "Tax is not guessed on the About page. The live booking quote calculates tax from the active backend configuration and displays the amount before you continue to payment.",
      },
      refund: {
        title: "Refund policy",
        description:
          "If a booking is cancelled, any eligible refund is calculated from the configured refund policy, the paid amount, and the time remaining before the rental starts.",
      },
    },
    note: "Final booking totals, tax, and refund eligibility are always confirmed inside the booking and payment flow.",
  },

  waiting: {
    title: "Waiting for approval",
    subtitle: "Your account is being reviewed. Please wait while we complete the approval process.",
  },
} as const;