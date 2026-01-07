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
}

export interface Sighting {
  _id: string;
  missingPersonId: string | MissingPerson;
  location: string;
  date: string;
  description: string;
  photo: string;
  reporterContact: string;
}
