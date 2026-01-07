import { Controller, Request, Post, UseGuards, Get, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.login(req.user);
    this.setCookie(res, access_token);
    return { user, message: 'Login successful' };
  }

  @Post('register')
  async register(@Body() registerDto: any, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.register(registerDto);
    this.setCookie(res, access_token);
    return { user, message: 'Registration successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Request() req) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { access_token } = await this.authService.login(req.user);
    this.setCookie(res, access_token);
    res.redirect('http://localhost:5173/dashboard');
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('360alert_authentication');
    return { message: 'Logged out successfully' };
  }

  private setCookie(res: Response, token: string) {
    res.cookie('360alert_authentication', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }
}
