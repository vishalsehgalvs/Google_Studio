
// This is a mock in-memory database to simulate data persistence.
// In a real application, you would use a proper database like Firebase Firestore.

export interface User {
  id: string;
  email: string;
  mobile: string;
  password?: string; // Storing passwords directly is not secure. Use authentication services.
}

export interface Diagnosis {
  id: string;
  userId: string;
  imageDataUri: string;
  disease: string;
  remedies: string;
  confidenceScore: number;
  timestamp: string;
}

export interface SoilHealthCard {
  id: string;
  userId: string;
  location: string;
  metrics: {
    ph: number;
    organicCarbon: number;
    conductivity: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  nutrients: {
    nitrogen: { value: number, unit: string, status: string };
    phosphorus: { value: number, unit: string, status: string };
    potassium: { value: number, unit: string, status: string };
  };
  recommendations: string;
  timestamp: string;
}

// In-memory store
const db = {
  users: new Map<string, User>(),
  diagnoses: new Map<string, Diagnosis>(),
  soilHealthCards: new Map<string, SoilHealthCard>(),
};

// Initialize with an admin user
db.users.set('admin@example.com', { id: 'admin@example.com', email: 'admin@example.com', mobile: '1234567890' });

// User management
export const addUser = (user: User): User => {
  db.users.set(user.id, user);
  return user;
};

export const getUser = (id: string): User | undefined => {
  return db.users.get(id);
};

// Diagnosis management
export const saveDiagnosis = (userId: string, diagnosis: Diagnosis): Diagnosis => {
  db.diagnoses.set(diagnosis.id, diagnosis);
  return diagnosis;
};

export const getDiagnosesForUser = (userId: string): Diagnosis[] => {
  return Array.from(db.diagnoses.values()).filter(d => d.userId === userId);
};

export const getAllDiagnoses = (): Diagnosis[] => {
  return Array.from(db.diagnoses.values());
};

// Soil Health Card management
export const saveSoilHealthCard = (userId: string, card: SoilHealthCard): SoilHealthCard => {
  db.soilHealthCards.set(card.id, card);
  return card;
}

export const getSoilHealthCardsForUser = (userId: string): SoilHealthCard[] => {
    return Array.from(db.soilHealthCards.values()).filter(c => c.userId === userId);
}

export const getAllSoilHealthCards = (): SoilHealthCard[] => {
    return Array.from(db.soilHealthCards.values());
}
