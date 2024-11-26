import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppGateway } from 'src/socket/socketgateway';

@Injectable()
export class CronTasksService {
  constructor(private prismaService : PrismaService, private socketService: AppGateway){}
  private readonly logger = new Logger(CronTasksService.name);

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleCron() {
    const deletedRooms = await this.prismaService.room.deleteMany({
      where: {
        user1Id: 0,
        user2Id: 0
      }
    })
    console.log(deletedRooms)
  }
  
}