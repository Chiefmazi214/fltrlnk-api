import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let havePermission = false;
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    console.log('AuthGuard - Request Headers:', request.headers);
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.roles && roles) {
        payload.roles.forEach((role) => {
          if (roles.includes(role.name)) {
            havePermission = true;
          }
        });
      }
      // 67ece1fb0651a1d1f9b79c7f
      // 67ece1fb0651a1d1f9b79c7f

      if (payload._id) {
        await this.authService.updateLastActionDate(payload._id.toString());
      }

      if (havePermission || !roles) {
        request.user = payload;
      } else {
        throw new UnauthorizedException('Unauthorized');
      }
    } catch (e) {
      throw new UnauthorizedException(e.response || 'Invalid token');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] =
      request.headers?.authorization?.split(' ') ||
      request.cookies?.authorization?.split(' ') ||
      [];
    return type === 'Bearer' ? token : undefined;
  }
}
