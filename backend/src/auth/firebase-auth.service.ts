import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { AuthService } from './auth.service';

@Injectable()
export class FirebaseAuthService {
  private readonly logger = new Logger(FirebaseAuthService.name);
  private initialized = false;

  constructor(private authService: AuthService) {
    this.initialize();
  }

  private initialize(): void {
    if (admin.apps.length > 0) {
      this.initialized = true;
      return;
    }
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      this.initialized = true;
    } catch {
      this.logger.warn(
        'Firebase Admin not initialized. Set GOOGLE_APPLICATION_CREDENTIALS for mobile token validation.',
      );
    }
  }

  async verifyIdTokenAndGetUser(token: string): Promise<any> {
    if (!this.initialized) {
      return null;
    }
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { uid, email, name, picture } = decodedToken;
      if (!email) {
        return null;
      }
      const nameParts = (name || '').trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const user = await this.authService.validateGoogleUser({
        email,
        firstName,
        lastName,
        picture: picture || undefined,
        accessToken: uid,
      });
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    } catch {
      return null;
    }
  }
}
