export const routeNames = {
  home: 'home',
  missingPersons: 'missing-persons',
  missingPersonDetail: 'missing-person-detail',
  registerMissing: 'register-missing',
  editMissing: 'edit-missing',
  registerChild: 'register-child',
  reportSighting: 'report-sighting',
  riskMap: 'risk-map',
  login: 'login',
  register: 'register',
  profile: 'profile',
  glossary: 'glossary',
  notFound: 'not-found',
} as const;

export const routePaths = {
  missingPersons: '/missing-persons',
  missingPersonDetail: (id: string) => `/missing-persons/${id}`,
  editMissing: (id: string) => `/missing-persons/${id}/edit`,
  reportSighting: '/report-sighting',
  profile: '/profile',
  glossary: '/glossary',
} as const;
