import { Link, Outlet } from "react-router-dom";
import React from "react";
export const Layout = () => {
    return <>
    <header className="bg-slate-200 h-32 w-full flex justify-around ">
        <Link to="/rooms" className="text-3xl border px-2 py-1 text-white bg-green-300">Комнаты</Link>
        <Link to="/game" className="text-3xl border px-2 py-1 text-white bg-green-300">Игра</Link>
        <Link to="/auth" className="text-3xl border px-2 py-1 text-white bg-green-300">Авторизация</Link>
    </header>
    <div><Outlet/></div>
    </>
}