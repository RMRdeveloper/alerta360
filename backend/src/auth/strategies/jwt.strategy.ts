import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['360alert_authentication'];
          }
          return token || ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY_REPLACE_ME_IN_ENV', // TODO: Use ConfigService
    });
  }

  async validate(payload: any) {
    // Lookup the full user from DB to ensure we have name, avatar, etc.
    const user = await this.usersService.findOne(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    // Return the user object (converted to POJO if needed, or mongoose doc)
    // Ideally strip sensitive data like password
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  }
}
