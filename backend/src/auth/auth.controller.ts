import {
  Controller,
  Request,
  Post,
  Patch,
  UseGuards,
  Get,
  Body,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { FirebaseOrJwtAuthGuard } from './guards/firebase-or-jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  authCookieName,
  defaultFrontendUrl,
  authSwaggerDescriptions,
} from './auth.constants';
import { swaggerDescriptions } from '../constants/swagger.constants';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: authSwaggerDescriptions.loginSuccess,
  })
  @ApiResponse({
    status: 401,
    description: authSwaggerDescriptions.invalidCredentials,
  })
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.login(req.user);
    this.setCookie(res, access_token);
    return { user, message: 'Login successful' };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: authSwaggerDescriptions.registerSuccess,
  })
  @ApiResponse({
    status: 400,
    description: authSwaggerDescriptions.invalidInputOrEmailInUse,
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, user } = await this.authService.register(registerDto);
    this.setCookie(res, access_token);
    return { user, message: 'Registration successful' };
  }

  @UseGuards(FirebaseOrJwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: authSwaggerDescriptions.userProfile,
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: swaggerDescriptions.unauthorized })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(FirebaseOrJwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: authSwaggerDescriptions.profileUpdated,
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: swaggerDescriptions.unauthorized })
  @ApiResponse({ status: 400, description: swaggerDescriptions.invalidInput })
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user._id, dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({
    status: 302,
    description: authSwaggerDescriptions.redirectsToGoogleConsent,
  })
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 302,
    description: authSwaggerDescriptions.redirectsToDashboardOnSuccess,
  })
  async googleAuthRedirect(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = await this.authService.login(req.user);
    this.setCookie(res, access_token);
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || defaultFrontendUrl;
    res.redirect(`${frontendUrl}/`);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out current user' })
  @ApiResponse({
    status: 200,
    description: authSwaggerDescriptions.logoutSuccess,
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(authCookieName);
    return { message: 'Logged out successfully' };
  }

  private setCookie(res: Response, token: string) {
    res.cookie(authCookieName, token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }
}
