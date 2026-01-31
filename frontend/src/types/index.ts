export interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  googleId?: string;
}

export interface MissingPerson {
  _id: string;
  name: string;
  age: number;
  gender: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  description: string;
  photos: string[];
  status: string;
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  height?: {
    value: number;
    unit: string;
  };
  hair?: {
    color: string;
    length: string;
  };
  eyes?: string;
  build?: string;
  coordinates?: {
    type: string;
    coordinates: number[];
  };
  reward?: {
    amount: number;
    currency?: string;
  };
}

export interface Sighting {
  _id: string;
  missingPersonId: string | MissingPerson;
  location: string;
  date: string;
  description: string;
  photo?: string;
  reporterContact: string;
}

export interface PaginatedMissingPersons {
  items: MissingPerson[];
  total: number;
  page: number;
  factor: number;
  totalPages: number;
}

export interface GlossaryTerm {
  key: string;
  term: string;
  definition: string;
}

export interface GlossaryCategory {
  id: string;
  label: string;
  terms: GlossaryTerm[];
}

export interface GlossaryResponse {
  categories: GlossaryCategory[];
}
