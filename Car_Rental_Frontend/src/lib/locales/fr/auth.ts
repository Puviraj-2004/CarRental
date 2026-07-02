import type { DeepStringify } from '../en';
import type { auth as enAuth } from '../en/auth';

export const auth: DeepStringify<typeof enAuth> = {
login: {
  eyebrow: "Accès sécurisé au compte",
  title: "Bon retour",
  subtitle:
    "Connectez-vous pour gérer vos réservations, déposer vos documents de location, suivre le statut d’approbation et continuer votre expérience Blue Drive en toute confiance.",
  email: "Adresse e-mail",
  emailHelper: "Utilisez l’adresse e-mail liée à votre compte de location.",
  password: "Mot de passe",
  passwordHelper: "Saisissez le mot de passe sécurisé de votre compte.",
  submit: "Se connecter en sécurité",
  noAccount: "Vous n’avez pas de compte ?",
  registerLink: "Créer un compte",
  errorInvalid: "Adresse e-mail ou mot de passe invalide. Vérifiez vos informations et réessayez.",
  secureNote: "Connexion protégée pour la gestion des réservations et des documents",
  imageBadge: "Portail de location Blue Drive",
  imageTitle: "Toutes vos réservations, documents et locations dans un espace sécurisé.",
  imageSubtitle:
    "Accédez à votre profil de location vérifié, continuez vos réservations en attente, gérez vos documents requis et gardez vos réservations de véhicules bien organisées depuis un tableau de bord moderne.",
  benefits: {
    bookings: "Suivre les réservations actives et à venir",
    documents: "Déposer permis, pièce d’identité et justificatif d’adresse",
    payments: "Continuer les étapes de paiement et d’approbation",
  },
  showPassword: "Afficher le mot de passe",
  hidePassword: "Masquer le mot de passe",
},
  register: {
  eyebrow: "Create your rental profile",
  title: "Create an account",
  subtitle:
    "Register to reserve verified vehicles, confirm your email, prepare your rental documents, and manage every booking from one secure account.",
  fullName: "Full name",
  fullNameHelper: "Enter your name as it appears on your rental documents.",
  email: "Email address",
  emailHelper: "We will send your verification code to this email.",
  password: "Password",
  passwordHelper: "Create a secure password for your Blue Drive account.",
  confirmPassword: "Confirm password",
  confirmPasswordHelper: "Re-enter your password to avoid typing mistakes.",
  phone: "Phone number",
  phoneHelper: "Optional, but helpful for booking and pickup communication.",
  submit: "Create secure account",
  hasAccount: "Already have an account?",
  loginLink: "Log in here",
  passwordMismatch: "Passwords do not match.",
  imageBadge: "Verified rental profile",
  imageTitle: "Start faster with a verified rental profile.",
  imageSubtitle:
    "Create your account, confirm your email, keep your rental details ready, and move through document verification with more confidence.",
  benefits: {
    profile: "Build one profile for future rentals",
    documents: "Prepare licence, ID, and contact details",
    booking: "Move faster from search to reservation",
  },
  showPassword: "Show password",
  hidePassword: "Hide password",
},

verifyOtp: {
  eyebrow: "Email verification",
  title: "Verify your email",
  subtitle: "We have sent a 6-digit verification code to",
  code: "Verification code",
  codeHelper: "Enter the 6-digit code from your email.",
  submit: "Verify code",
  resend: "Resend code",
  resendSuccess: "A new verification code has been sent.",
  secureNote: "This step helps protect your account and rental access.",
  imageBadge: "Secure account activation",
  imageTitle: "One final check before your account is ready.",
  imageSubtitle:
    "Enter the verification code from your email to activate secure booking access, protect your profile, and continue your rental journey.",
  steps: {
    email: "Check the email inbox linked to your account",
    code: "Enter the 6-digit verification code",
    access: "Activate secure booking and document access",
  },
},
} as const;
