import { useQuery } from "@tanstack/react-query";
import { useGuard } from "../hooks/useGuard.ts";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
export const Rooms = () => {
  useGuard();

  const [players, setPlayers] = useState([])
  const socketRef = useRef<Socket | null>(null)
  const token = useSelector((state) => {
    return state.user.token;
  });

  useEffect(() => {
    socketRef.current = io("http://localhost:4200", {
      auth: {token}
    });

    socketRef.current.on("online", (message)=>{
      setPlayers(message)
    })    

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const { data, isPending, isError } = useQuery({
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

  if (data.length > 0)
    return (
      <div className="flex mx-auto w-fit gap-16">
        <div className="flex flex-col w-[500px] overflow-y-auto gap-3">
          <div className="text-3xl font-bold block text-center">
            Доступные комнаты
          </div>
          {data.map((item, index) => (
            <div className="w-full h-20 flex border border-slate-300 bg-slate-100 rounded-3xl px-5 items-center gap-20" key={index}>
              <div className="text-sm font-bold">Game id: {item.id}</div>
              <div className="flex flex-col w-[200px]">
                <div>Игрок 1: {item.user1name || "Пусто"}</div>
                <div>Игрок 2: {item.user2name || "Пусто"}</div>
              </div>
              <button
                className="text-3xl bg-green-500 text-white w-10 text-center h-10"
                onClick={() => {
                  socketRef.current?.emit("message", "abobas");
                }}
              >
                +
              </button>
            </div>
          ))}
        </div>
        <div className="flex flex-col">
        <div className="text-3xl">Игроки в сети</div>
        <div className="grid grid-cols-2 w-[200px] gap-1">
          
            {players.map(item => <div className="border border-black">
              {item}
            </div>)}
        </div>
      </div>
      </div>
    );

  return <h1>Forbidden</h1>;
};
