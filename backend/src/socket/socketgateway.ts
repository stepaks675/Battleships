import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { jwtDecode } from 'jwt-decode';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private jwtService: JwtService, private prismaService: PrismaService) {}
  clients: Map<string, any> = new Map();

  @WebSocketServer()
  server: Server;

    handleConnection(client: Socket) {
    const token = client.handshake.auth.token.split(" ")[1]
    try {
        const res = this.jwtService.verify(token, {
          secret: process.env.JWTSECRET,
        });
      } catch {
        return new UnauthorizedException();
      }
  
      const data : any = jwtDecode(token)
  
      this.clients.set(client.id, {username: data.username, id : data.sub})

      this.server.emit("online", Array.from(this.clients.values()))

  }

  async handleDisconnect(client: Socket) {
    this.prismaService.handleUserDisconnect(this.clients.get(client.id).id)
    this.clients.delete(client.id);
    this.handleRoomUpdate()
  }

  
  handleRoomUpdate(){
    this.server.emit("rooms");
  }

  getOnlineUsers(){
    return Array.from(this.clients.values()).map(item => item.id)
  }
}