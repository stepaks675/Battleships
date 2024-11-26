import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from 'src/dto/dtos';
import { JwtService } from '@nestjs/jwt';
export type User = {
  id: number;
  name: string;
  login: string;
  password: string;
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async findOne(login: string) {
    const user = await this.prisma.user.findFirst({
      where: { login: login },
    });
    if (user) return user
    throw new NotFoundException();
  }

  async trySignIn(
    login: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.findOne(login);
    if (password != user.password){
      throw new UnauthorizedException
    }
    const payload = { sub: user.id, username: user.name};
    const token = await this.jwtService.signAsync(payload)
    return {
      access_token: token
    }
  }

  async createNewUser(user: CreateUserDto) {
    console.log(user);
    const newuser = await this.prisma.user.create({
      data: {
        name: user.name,
        login: user.login,
        password: user.password,
      },
    });
    return newuser;
  }
}
