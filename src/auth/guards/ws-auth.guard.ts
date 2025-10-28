import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client: Socket = context.switchToWs().getClient();
            const token = this.extractTokenFromHeader(client);
            
            if (!token) {
                console.log('WsAuthGuard: No token provided');
                throw new WsException('Unauthorized - No token provided');
            }

            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET
            });

            if (!payload || !payload.sub) {
                console.log('WsAuthGuard: Invalid token payload');
                throw new WsException('Unauthorized - Invalid token');
            }

            // Store user information in socket
            client.data.userId = payload.sub;
            client.data.user = payload;
            
            //console.log('WsAuthGuard: Authentication successful for user:', payload.sub);
            return true;
        } catch (error) {
            console.log('WsAuthGuard: Authentication failed -', error.message);
            throw new WsException('Unauthorized - Authentication failed');
        }
    }

    private extractTokenFromHeader(client: Socket): string | undefined {
        const authHeader = client.handshake.headers.authorization || client.handshake.auth?.token;
        
        if (!authHeader) {
            return undefined;
        }

        if (typeof authHeader === 'string') {
            const [type, token] = authHeader.split(' ');
            return type === 'Bearer' ? token : undefined;
        }

        return undefined;
    }
}
