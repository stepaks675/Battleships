export type CreateRoomDto = {
    status: "ACTIVE",
    user1Id: number,
    user1name: string
}

export type CreateUserDto = {
    name: string,
    login:string,
    password:string
}