import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomModule } from './room/room.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './user/user.module';
import { AppGateway } from './socket/socketgateway';
import { ScheduleModule } from '@nestjs/schedule';
import { CronTasksService } from './schedule/crontasks';
@Module({
  imports: [RoomModule, UsersModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, PrismaService, AppGateway, CronTasksService],
})
export class AppModule {}
