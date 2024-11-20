import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, UseDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode"
import { setUser } from "../store/user/userslice";
export const Auth = () => {
  const [formState, setFormState] = useState({
    name: "",
    login: "",
    password: "",
  });
  const [isNew, setIsNew] = useState(false);
  const navigator = useNavigate()
  const dispatch = useDispatch()
  const handleChange = (e) => {
    let { name, value } = e.target;
    setFormState((p) => {
      return {
        ...p,
        [name]: value,
      };
    });
  };

  const handleSubmit = (e) => {
    if (isNew) {
      fetch("http://localhost:4200/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name,
          login: formState.login,
          password: formState.password,
        }),
      })
        .then((r) => r.json())
        .then(() => alert("Успешное создание аккаунта"));

    } else {
        fetch("http://localhost:4200/api/signin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              login: formState.login,
              password: formState.password,
            }),
          })
            .then((r) => r.json())
            .then(data => {

                const payload = jwtDecode(data.access_token)
   
                dispatch(setUser({id: payload.sub, name: payload.username, token: data.access_token}))

                navigator("/rooms")
            });
    }
  };
  return (
    <div className="w-[250px] rounded-lg h-fit flex flex-col items-center justify-between border mx-auto mt-96 border-black gap-5 px-2">
      {isNew && (
        <input
          className="mt-2 px-1 border-slate-300 border"
          name="name"
          value={formState.name}
          type="text"
          placeholder="Отображаемое имя"
          onChange={handleChange}
        />
      )}
      <input
        className="mt-2 px-1 border-slate-300 border"
        name="login"
        value={formState.login}
        type="text"
        placeholder="Логин"
        onChange={handleChange}
      />
      <input
        className="mt-2 px-1 border-slate-300 border"
        name="password"
        value={formState.password}
        type="password"
        placeholder="Пароль"
        onChange={handleChange}
      />

      <button
        className="text-xl text-green-500 border border-black p-1 my-2"
        onClick={handleSubmit}
      >
        {isNew ? "Зарегестрироваться" : "Войти"}
      </button>
      <button
        className="text-xl text-green-500 border border-black p-1 my-2"
        onClick={() => {
          setIsNew((p) => !p);
        }}
      >
        Сменить режим
      </button>
    </div>
  );
};
