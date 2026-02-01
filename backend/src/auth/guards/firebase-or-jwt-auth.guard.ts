import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FirebaseAuthService } from '../firebase-auth.service';
import { bearerScheme } from '../auth.constants';

@Injectable()
export class FirebaseOrJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private firebaseAuthService: FirebaseAuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch {
      const request = context.switchToHttp().getRequest();
      const bearerToken = this.extractBearerToken(request);
      if (!bearerToken) {
        throw new UnauthorizedException();
      }
      const user =
        await this.firebaseAuthService.verifyIdTokenAndGetUser(bearerToken);
      if (!user) {
        throw new UnauthorizedException();
      }
      request.user = user;
      return true;
    }
  }

  private extractBearerToken(request: any): string | null {
    const authHeader = request.headers?.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return null;
    }
    const [type, token] = authHeader.split(' ');
    if (type !== bearerScheme || !token) {
      return null;
    }
    return token;
  }
}
