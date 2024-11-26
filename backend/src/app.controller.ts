import { Body, Controller, Get, HttpCode, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { RoomService } from './room/room.service';
import { UsersService } from './user/user.service';
import { AuthGuard } from './guards/authguard';
import { AppGateway } from './socket/socketgateway';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private roomService: RoomService, private userService: UsersService, private socketService: AppGateway) {}

  @UseGuards(AuthGuard)
  @Get("/rooms")
  getRooms(){
    return this.roomService.fetchRooms();
  }

  @UseGuards(AuthGuard)
  @Post("/rooms")
  async createRoom(@Body() body: any){
    const newroom = await this.roomService.createRoom(body);
    if (newroom) await this.socketService.handleRoomUpdate();
    return newroom;
  }

  @UseGuards(AuthGuard)
  @Post("/leave")
  async leaveRoom(@Body() body: any){
    await this.roomService.leaveRoom(body.roomid, body.userId)
    this.socketService.handleRoomUpdate()
  }

  @UseGuards(AuthGuard)
  @Post("/join")
  async joinRoom(@Body() body: any){
    const res = await this.roomService.joinRoom(body.roomid, body.userId, body.username);
    this.socketService.handleRoomUpdate()
    return res
  }

  @Get("/deleterooms")
  deleteRooms(){
    this.roomService.deleteAllRooms()
  }

  @Post("/users")
  createUser(@Body() body: any){
    return this.userService.createNewUser(body)
  }

  @Post("/signin")
  signIn(@Body() body: any){
    return this.userService.trySignIn(body.login, body.password)
  }
}
