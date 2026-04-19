export interface SeedBrand {
  name: string;
  models: string[];
}

export interface PlatformSettings {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  taxPercentage: number;
  currency: string;
}

// 1. Platform Initial Settings
export const initialPlatformSettings: PlatformSettings = {
  companyName: "RentCar Premium France",
  supportEmail: "support@rentcar-france.com",
  supportPhone: "+33 1 23 45 67 89",
  address: "75008 Paris, France",
  taxPercentage: 20.0,
  currency: "EUR"
};

// 2. Car Brands and Models
export const initialBrands: SeedBrand[] = [
  {
    name: "Renault",
    models: ["Clio", "Captur", "Megane", "Zoe", "Austral"]
  },
  {
    name: "Peugeot",
    models: ["208", "2008", "308", "3008", "5008"]
  },
  {
    name: "Citroën",
    models: ["C3", "C4", "C5 X", "Berlingo"]
  },
  {
    name: "Toyota",
    models: ["Yaris", "Corolla", "RAV4", "C-HR", "Aygo X"]
  },
  {
    name: "Volkswagen",
    models: ["Golf", "Polo", "Tiguan", "ID.3", "ID.4"]
  },
  {
    name: "BMW",
    models: ["1 Series", "3 Series", "X1", "X3", "i4"]
  },
  {
    name: "Mercedes-Benz",
    models: ["A-Class", "C-Class", "E-Class", "GLA", "EQC"]
  },
  {
    name: "Tesla",
    models: ["Model 3", "Model Y", "Model S", "Model X"]
  }
];