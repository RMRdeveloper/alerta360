export const authCookieName = '360alert_authentication' as const;
export const bearerScheme = 'Bearer' as const;
export const defaultFrontendUrl = 'http://localhost:5173';

export const authSwaggerDescriptions = {
  loginSuccess: 'Login successful.',
  invalidCredentials: 'Invalid credentials.',
  registerSuccess: 'Registration successful.',
  invalidInputOrEmailInUse: 'Invalid input or email already in use.',
  userProfile: 'User profile.',
  profileUpdated: 'Profile updated.',
  redirectsToGoogleConsent: 'Redirects to Google consent.',
  redirectsToDashboardOnSuccess: 'Redirects to dashboard on success.',
  logoutSuccess: 'Logout successful.',
} as const;
