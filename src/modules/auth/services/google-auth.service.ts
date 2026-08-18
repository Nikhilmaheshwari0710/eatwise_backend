import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
}

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;

  constructor(private configService: ConfigService) {
    this.client = new OAuth2Client(configService.get<string>('google.clientId'));
  }

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('google.clientId'),
      });
      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return {
        googleId: payload.sub,
        email: payload.email || '',
        fullName: [payload.given_name, payload.family_name].filter(Boolean).join(' '),
        emailVerified: payload.email_verified || false,
      };
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
