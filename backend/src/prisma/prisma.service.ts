import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async handleUserDisconnect(uid: number){
      await this.room.updateMany({
        where: {
          user1Id : uid,
          status: "ACTIVE"
        },
        data: {
          user1Id : 0,
          user1name: ""
        }
      })
      await this.room.updateMany({
        where: {
          user2Id : uid
        },
        data: {
          user2Id : 0,
          user2name: ""
        }
      })
  }
}