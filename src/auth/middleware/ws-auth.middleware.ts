import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    async use(client: Socket, next: (err?: any) => void) {
        try {
            const token = this.extractTokenFromHeader(client);
            
            if (!token) {
                console.log('WsAuthMiddleware: No token provided');
                return next(new WsException('Unauthorized - No token provided'));
            }

            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET
            });

            if (!payload || !payload._id) {
                console.log('WsAuthMiddleware: Invalid token payload');
                return next(new WsException('Unauthorized - Invalid token'));
            }

            // Store user information in socket
            client.data.userId = payload._id;
            client.data.user = payload;
            
            //console.log('WsAuthMiddleware: Authentication successful for user:', payload._id);
            next();
        } catch (error) {
            console.log('WsAuthMiddleware: Authentication failed -', error.message);
            next(new WsException('Unauthorized - Authentication failed'));
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