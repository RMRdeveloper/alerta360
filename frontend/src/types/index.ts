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
