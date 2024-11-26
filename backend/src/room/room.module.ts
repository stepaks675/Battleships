import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [RoomService, PrismaService],
  exports:[RoomService]
})
export class RoomModule {}
