import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoomDto } from 'src/dto/dtos';
@Injectable()
export class RoomService {
    constructor(private prisma: PrismaService){}

    async fetchRooms(){
        const rooms = await this.prisma.room.findMany({
            where: {status: "ACTIVE"}
        });
        return rooms
    }

    async createRoom(room : CreateRoomDto){
        try{
        const user = await this.prisma.user.findFirst({
            where: {
                id: room.user1Id,
                name: room.user1name
            }
        })
        
        if (!user) return new UnauthorizedException()
        
        await this.prisma.room.updateMany({
            where: {
                user1Id: room.user1Id
            },
            data: {
                user1Id: 0,
                user1name: ""
            }
        })

        await this.prisma.room.updateMany({
            where: {
                user2Id: room.user1Id
            },
            data: {
                user2Id: 0,
                user2name: ""
            }
        })

        const newroom = await this.prisma.room.create({
            data:{
                user1Id : room.user1Id,
                user1name: room.user1name,
                status: room.status,
                user2Id: 0,
                user2name: ""
            }
        })
        return newroom
        } catch {
            return new InternalServerErrorException();
        }
       
    }

    async leaveRoom(roomid, userId){

        await this.prisma.room.updateMany({
            where: {
                user1Id: userId,
                id: roomid
            },
            data: {
                user1Id: 0,
                user1name: ""
            }
        })

        await this.prisma.room.updateMany({
            where: {
                user2Id: userId,
                id: roomid
            },
            data: {
                user2Id: 0,
                user2name: ""
            }
        })

        return "OK"
    }

    async joinRoom(roomid, userId, username){
        const res1 = await this.prisma.room.updateMany({
            where: {
                id: roomid,
                user1Id: 0
            },
            data: {
                user1Id: userId,
                user1name: username
            }
        })
        if (res1.count>0) return "OK"
        const res2 = await this.prisma.room.update({
            where: {
                id: roomid,
                user2Id: 0
            },
            data: {
                user2Id: userId,
                user2name: username
            }
        })
        if (res2) return "OK"
        return new BadRequestException()
    }
    async deleteAllRooms(){
        await this.prisma.room.deleteMany({where: {}});
    }
}
