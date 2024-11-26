import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWTSECRET,
      signOptions: {expiresIn:"36000s"}
    })
  ],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}