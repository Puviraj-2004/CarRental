import { home } from './en/home';
import { navbar } from './en/navbar';
import { auth } from './en/auth';
import { admin } from './en/admin';
import { payment } from './en/payment';
import { adminCars, cars } from './en/cars';

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
  admin,
  payment,
  cars,
  adminCars,
} as const;

// The keys and structure remain strictly checked, but any string value is accepted
export type TranslationKeys = DeepStringify<typeof en>;
