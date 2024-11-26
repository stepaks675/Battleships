import { useQuery } from "@tanstack/react-query";
import { useGuard } from "../hooks/useGuard.ts";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
type Room = {
  user1name: string;
  user2name: string;
  id: number;
  user1id: number;
  user2id: number;
  status: string;
};
type Player = {
  id: number;
  username: string;
};
export const Rooms = () => {
  useGuard();

  const [players, setPlayers] = useState<Player[]>([]);

  const [inRoom, setInRoom] = useState(0); //id комнаты в которой наш чел

  const socketRef = useRef<Socket | null>(null);
  console.log(inRoom)
  const token = useSelector((state) => {
    return state.user.token;
  });

  const userState = useSelector((state)=> {
    return state.user
  })
  
  const tryCreateRoom =()=>{
    try{
      fetch("http://localhost:4200/api/rooms", {
        method: "POST",
        headers: {
          Authorization: token,
          'Content-Type' : 'application/json',
        },
        body: JSON.stringify({
          user1name: userState.name,
          user1Id: userState.id,
          status: "ACTIVE"
        })
      }).then(r => r.json()).then(r => {
        alert("создание успешно")
        setInRoom(r.id)
      })
    } catch(err){
      alert("создание пизда")
    }
  }

  const handleJoinOrLeave = (id : number) => {
    if (id == inRoom){
      fetch("http://localhost:4200/api/leave", {
        headers:{
          Authorization: token,
          'Content-Type' : 'application/json',
        },
        method: "POST",
        body: JSON.stringify({
          userId: userState.id,
          roomid: id
        })
      })
      setInRoom(0)
    } else{
      if (inRoom) {
        fetch("http://localhost:4200/api/leave", {
          headers:{
            Authorization: token,
            'Content-Type' : 'application/json',
          },
          method: "POST",
          body: JSON.stringify({
            userId: userState.id,
            roomid: inRoom
          })
        })
        setInRoom(0)
      }
      fetch("http://localhost:4200/api/join", {
        headers:{
          Authorization: token,
          'Content-Type' : 'application/json',
        },
        method: "POST",
        body: JSON.stringify({
          userId: userState.id,
          roomid: id,
          username: userState.name
        })
      })
      setInRoom(id)
    }
  }
  useEffect(() => {
    socketRef.current = io("http://localhost:4200", {
      auth: { token },
    });

    socketRef.current.on("rooms", ()=>{
      refetch();
    })

    socketRef.current.on("online", (message) => {
      setPlayers(message);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const { data, isPending, isError, refetch } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: () => {
      return fetch("http://localhost:4200/api/rooms", {
        headers: {
          Authorization: token,
        },
      }).then((r) => r.json());
    },
  });
  
  if (isPending) return <div className="text-5xl">LOADING...</div>;

  if (isError) return <h1>error</h1>;

  let copiedRooms = [...Array.from(data)];

  const myRoom = copiedRooms.find(item => item.id == inRoom);

  let filteredRooms = copiedRooms.filter(item => item != myRoom);

  if (myRoom) filteredRooms.unshift(myRoom)
  if (data) {
    return (
      <div className="flex mx-auto w-fit gap-16">
        {!inRoom && <div className="text-3xl mt-[200px]">
          <button className="bg-green-500 w-fit px-2 py-10 rounded-xl text-white hover:scale-105  hover:bg-lime-500 transition-all duration-500" onClick={tryCreateRoom}>
            Создать комнату
          </button>
        </div>}
        <div className="flex flex-col w-[500px] overflow-y-auto gap-3">
          <div className="text-3xl font-bold block text-center">
            Доступные комнаты
          </div>
          {filteredRooms.length>0 && filteredRooms?.map((item, index) => (
            <Room
              player1={item.user1name}
              player2={item.user2name}
              roomid={item.id}
              inThisRoom={item.id == inRoom}
              handleJoin={handleJoinOrLeave}
            ></Room>
          ))}
        </div>
        <div className="flex flex-col">
          <div className="text-3xl">Игроки в сети</div>
          <div className="grid grid-cols-2 w-[200px] gap-1">
            {players.map((item) => (
              <div className="border border-black">{item.username}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <h1>Forbidden</h1>;
};

const Room = ({
  player1,
  player2,
  roomid,
  inThisRoom,
  handleJoin,
}: {
  player1: string;
  player2: string;
  roomid: number;
  inThisRoom: boolean;
  handleJoin: () => void;
}) => {
  const style = {
    0 : "border-slate-300 bg-slate-100",
    1: "border-purple-300 bg-green-200"
  }

  return (
    <div className={"w-full h-20 flex border rounded-3xl px-5 items-center gap-20 " + style[inThisRoom ? 1 : 0]}>
      <div className="text-sm font-bold">Game id: {roomid}</div>
      <div className="flex flex-col w-[200px]">
        <div>Игрок 1: {player1 || "Пусто"}</div>
        <div>Игрок 2: {player2 || "Пусто"}</div>
       
      </div>
      {inThisRoom ? <button
        className="text-3xl bg-red-500 text-white w-10 text-center h-10"
        onClick={()=>handleJoin(roomid)}
      >
        -
      </button> : 
      <button
        className="text-3xl bg-green-500 text-white w-10 text-center h-10"
        onClick={()=>handleJoin(roomid)}
      >
        +
      </button>}
    </div>
  );
};
