import React from "react";
import clsx from "clsx";
import { useState, useEffect, useCallback } from "react";
import { throttle } from "lodash";
type CellType =
  | 0
  | 11
  | 12
  | 13
  | 14
  | 15
  | 21
  | 22
  | 23
  | 24
  | 25
  | 3
  | 4
  | 999
  | 666
  | 777; //666,777-предпросмотр корабля, 999-utility для выстрела
type FieldType = CellType[];
export const Game = () => {
  const initializeField = (number: 0 | 3) => {
    return new Array(12 * 12).fill(number);
  };
  const [isRandom, setIsRandom] = useState(false);
  const [timeleft, setTimeleft] = useState([120000, 120000]);
  const [shipRot, setShipRot] = useState(false); //поворот корабля
  const [shipSize, setShipSize] = useState([
    6, 5, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1,
  ]);
  const [mousePos, setMousePos] = useState(-1);

  const [gameState, setGameState] = useState(0);

  const [gameMove, setGameMove] = useState(0);

  const [fields, setFields] = useState((): FieldType[] => [
    initializeField(0),
    initializeField(0),
  ]); //реальное состояние поля
  const [enemyFields, setEnemyFields] = useState((): FieldType[] => [
    initializeField(3),
    initializeField(3),
  ]); //поле опонента

  useEffect(() => {
    if (timeleft[gameMove] <= 0) {
      setGameState(2);
      alert(`Игрок ${gameMove} проиграл по времени`);
    }
  }, [timeleft]);

  useEffect(() => {
    let timeout;
    if (gameState == 1) {
      timeout = setInterval(() => {
        setTimeleft((p) => {
          let temp = [p[0], p[1]];
          temp[gameMove] -= 100;
          return temp;
        });
      }, 100);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [gameMove, gameState]);

  useEffect(() => {
    //менеджер состояния игры (на стадии расположения кораблей)
    if (shipSize.length == 0 && gameMove == 0) {
      setGameMove(1);
      setShipSize([6, 5, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1]);
    }
    if (shipSize.length == 0 && gameMove == 1) {
      setGameState(1);
    }
  }, [shipSize]);

  const handleClick = (id: number) => {
    //обработчик клика по вражескому полю
    const field = enemyFields[1 - gameMove];

    if (field[id] == 3) {
      if (Math.floor(fields[1 - gameMove][id] / 10) == 1) {
        setFields((p) => {
          let basa = [[...p[0]], [...p[1]]];
          basa[1 - gameMove][id] = 20 + fields[1 - gameMove][id] - 10;
          return basa;
        });

        setEnemyFields((p) => {
          let basa = [[...p[0]], [...p[1]]];
          basa[1 - gameMove][id] = 20 + fields[1 - gameMove][id] - 10;
          return basa;
        });
      } else {
        setFields((p) => {
          let basa = [[...p[0]], [...p[1]]];
          basa[1 - gameMove][id] = 4;
          return basa;
        });

        setEnemyFields((p) => {
          let basa = [[...p[0]], [...p[1]]];
          basa[1 - gameMove][id] = 4;
          return basa;
        });

        setGameMove((p) => 1 - p); // обновляем ход только при промахе
      }
    } else {
      alert("Ячейка уже обстрелена");
    }
  };

  const handleMouse = useCallback(
    throttle(
      (e: React.MouseEvent) => {
        const rect = e?.currentTarget?.getBoundingClientRect();
        if (!rect) return;

        const cellsize = 48;
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        const col = Math.max(Math.floor((x - 1) / cellsize), 0);
        const row = Math.max(Math.floor(y / cellsize), 0);

        const cellid = Math.min(row * 12 + col, 143);

        setMousePos(cellid);
      },
      50,
      { leading: true, trailing: true }
    ),
    []
  );

  const checkNearest = (id: number, state = fields[gameMove]): boolean => {
    const row = Math.floor(id / 12);
    const col = id - row * 12;
    if (col == 11) {
      return (
        Math.floor(state[id - 1] / 10) != 1 &&
        Math.floor(state[id - 12] / 10) != 1 &&
        Math.floor(state[id + 12] / 10) != 1 &&
        Math.floor(state[id + 12 - 1] / 10) != 1 &&
        Math.floor(state[id - 12 - 1] / 10) != 1
      );
    }
    if (col == 0) {
      return (
        Math.floor(state[id + 1] / 10) != 1 &&
        Math.floor(state[id - 12] / 10) != 1 &&
        Math.floor(state[id + 12] / 10) != 1 &&
        Math.floor(state[id + 12 + 1] / 10) != 1 &&
        Math.floor(state[id - 12 + 1] / 10) != 1
      );
    }
    return (
      Math.floor(state[id + 1] / 10) != 1 &&
      Math.floor(state[id - 1] / 10) != 1 &&
      Math.floor(state[id - 12] / 10) != 1 &&
      Math.floor(state[id + 12] / 10) != 1 &&
      Math.floor(state[id + 12 + 1] / 10) != 1 &&
      Math.floor(state[id + 12 - 1] / 10) != 1 &&
      Math.floor(state[id - 12 + 1] / 10) != 1 &&
      Math.floor(state[id - 12 - 1] / 10) != 1
    );
  };

  const placeShip = (
    id: number,
    shipsize: number,
    state: any = fields[gameMove]
  ) => {
    //логика установки корабля
    if (state[id] == 777 || (state[id] > 10 && state[id] < 30)) {
      return null;
    }

    let temp = [...state];
    temp = temp.map((item) => {
      return item == 666 ? 10 + shipsize : item;
    });
    return temp;
  };

  const handlePlaceShip = () => {
    //обработчик установки корабля
    const newField = placeShip(mousePos, shipSize[0]);
    if (newField) {
      setFields((p) => {
        let temp = [[...p[0]], [...p[1]]];
        temp[gameMove] = newField;
        return temp;
      });
      setShipSize((p) => {
        return p.slice(1, p.length);
      });
    } else {
      alert("Нельзя так поставить корабль");
    }
  };

  const clearField = () => {
    //очистка поля
    setShipSize([6, 5, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1]);
    setFields((p) => {
      let temp = [[...p[0]], [...p[1]]];
      temp[gameMove] = temp[gameMove].map((i) => 0);
      return temp;
    });
  };

  useEffect(() => {
    // поворот корабля в фазе 0
    const handleRotate = (e: KeyboardEvent) => {
      if (e.key == "r" || e.key == "R" || e.key == "к" || e.key == "К") {
        setShipRot((p) => !p);
      }
    };
    if (gameState == 0) window.addEventListener("keydown", handleRotate);
    return () => {
      window.removeEventListener("keydown", handleRotate);
    };
  }, [gameState]);

  const checkShip = (
    shiprot: boolean,
    shipsize: number,
    id: number,
    state = fields[gameMove]
  ): any => {
    let temporary: number[] = [];

    if (!shiprot) {
      let row = 0;
      let ids: number[] = [];
      for (let i = 0; i < shipsize; i++) {
        ids.push(id + i);
      }
      row = Math.floor(ids[0] / 12);

      ids.forEach((item) => {
        if (
          Math.floor(state[item] / 10) != 1 &&
          state[item] != undefined &&
          Math.floor(item / 12) == row
        ) {
          temporary.push(item);
        }
      });
    } else {
      let ids: number[] = [];
      for (let i = 0; i < shipsize; i++) {
        ids.push(id + 12 * i);
      }

      ids.forEach((item) => {
        if (Math.floor(state[item] / 10) != 1 && state[item] != undefined) {
          temporary.push(item);
        }
      });
    }

    let flag = false; // если flag сработал, то корабль поставить не получится

    let field = [...state];
    if (temporary.length != shipsize) flag = true;
    let changes = temporary.map((item) => {
      if (!checkNearest(item, field)) flag = true;
      return { id: item, change: 666 };
    });
    if (state[id] == 777) flag = true;
    if (flag) {
      changes = changes.map((it) => {
        return { ...it, change: 777 };
      });
    }

    return { flag, changes }; // {boolean, changes[]}
  };

  useEffect(() => {
    //предпросмотр
    if (isRandom) return;

    let result: { flag: boolean; changes: any[] } = checkShip(
      shipRot,
      shipSize[0],
      mousePos,
      fields[gameMove]
    );

    setFields((p) => {
      let temp = [[...p[0]], [...p[1]]];
      result.changes.forEach((item) => {
        temp[gameMove][item.id] = item.change;
      });
      return temp;
    });

    return () => {
      setFields((p) => {
        let foldos = JSON.parse(JSON.stringify(p));
        foldos[gameMove] = foldos[gameMove].map((value) =>
          value > 100 ? 0 : value
        );
        return foldos;
      });
    };
  }, [mousePos, shipRot, isRandom]);

  const generateRandom = () => {
    clearField()
    setFields((p) => {
      let shipTemp = [...shipSize];
      let fakefield = [...p[gameMove]];
      let ques;
      let tempfield;
      while (shipTemp.length > 0) {
        ques = null;
        let size = shipTemp.shift() || 0;
        let possiblepos: any = []; //массив всех допустимых индексов расположения корабля формата {id: number , rotated: true/false}

        for (let i = 0; i < 144; i++) {
          let res1 = checkShip(false, size, i, fakefield);
          let res2 = checkShip(true, size, i, fakefield);

          if (!res1.flag) {
            possiblepos.push({ id: i, changes: res1.changes });
          }
          if (!res2.flag) {
            possiblepos.push({ id: i, changes: res2.changes });
          }
        }
        while (ques == null) {
          tempfield = [...fakefield]
          let lucky = Math.floor(Math.random() * possiblepos.length);
          possiblepos[lucky].changes.forEach((item) => {
            tempfield[item.id] = item.change;
          });
          ques = placeShip(possiblepos[lucky].id, size, tempfield);
        }
        fakefield = ques;
      }
      let temp = [[...p[0]], [...p[1]]];
      temp[gameMove] = fakefield;
      return temp;
    });
  };

  if (gameState == 0) {
    return (
      <div className="flex gap-10 flex-col mx-auto w-fit items-center">
        <span>Игрок {gameMove}, Расставь свои корабли</span>
        <span>Нажмите R для разворота корабля</span>
        <div className="flex">
          <PlayerField
            fieldState={fields[gameMove]}
            handleClick={handlePlaceShip}
            handleMouse={handleMouse}
          />
        </div>
        <div className="flex flex-col gap-2">
          <button
            className="text-3xl font-bold text-white bg-green-500 px-5 py-2 rounded-xl border border-green-800"
            onClick={() => {
              setIsRandom((p) => !p);
              clearField()
            }}
          >
            {isRandom ? "Вручную" : "Случайно"}
          </button>
          <button
            className="text-3xl font-bold text-white bg-red-500 px-5 py-2 rounded-xl border border-red-800"
            onClick={clearField}
          >
            Очистить
          </button>
          {isRandom && (
            <button
              className="text-3xl text-white font-bold bg-green-500 px-5 py-2 rounded-xl border border-green-800"
              onClick={generateRandom}
            >
              Сгенерировать
            </button>
          )}
          {isRandom && (
            <button className="text-3xl text-white font-bold bg-green-500 px-5 py-2 rounded-xl border border-green-800" onClick={()=>{
              setShipSize([])
            }}>
              Подтвердить
            </button>
          )}
        </div>
      </div>
    );
  }

  if (gameState == 1) {
    // фаза 1 (сам бой)
    return (
      <div className="flex flex-col gap-20 mx-auto w-fit items-center">
        <MoveSection move={gameMove} />
        <div className="text-3xl">
          {Math.floor(timeleft[gameMove] / 1000)} |{" "}
          {Math.floor(timeleft[1 - gameMove] / 1000)}
        </div>
        <div className="flex gap-10">
          <PlayerField
            fieldState={fields[gameMove]}
            handleClick={() => {}}
            handleMouse={() => {}}
          />
          <PlayerField
            fieldState={enemyFields[1 - gameMove]}
            handleClick={handleClick}
            handleMouse={() => {}}
          />
        </div>
      </div>
    );
  }

  if (gameState == 2) {
    return (
      <div className="w-[500px] h-[300px] shadow-sm bg-slate-200 border border-slate-300 rounded-xl mx-auto mt-96">
        ПОЗДРАВЛЯЕМ ИГРОКА {gameMove} С ПОБЕДОЙ УРААА!!!
      </div>
    );
  }
};

const MoveSection = ({ move }: { move: number }) => {
  const className = {
    0: "bg-red-200 w-1/2 h-full text-center",
    1: "bg-green-200 w-1/2 h-full text-center",
  };
  return (
    <div className="flex w-[200px] h-20">
      <div className={className[move]}>Playe1</div>
      <div className={className[1 - move]}>Playe2</div>
    </div>
  );
};

const PlayerField = ({
  fieldState,
  handleClick,
  handleMouse,
}: {
  fieldState: FieldType;
  handleClick: { (arg0: number): void };
  handleMouse: { (arg0: Event): void };
}) => {
  return (
    <div
      className="grid grid-rows-12 grid-cols-12 h-fit"
      onMouseMove={handleMouse}
    >
      {fieldState.map((item, id) => (
        <GameCell
          handleClick={handleClick ?? undefined}
          key={id}
          id={id}
          val={item}
        />
      ))}
    </div>
  );
};

const GameCell = ({
  id,
  val,
  handleClick,
}: {
  id: number;
  val: CellType; //0 - ничего нету 1 - корабль 2 - корабль подбит 3 - туман войны 4 - выстрел + мимо
  handleClick: { (arg0: number): void };
}) => {
  const className = clsx(
    "h-[49px] w-[49px] box-border border border-black -mr-px -mt-px flex items-center justify-center font-bolt text-white text-3xl",
    {
      "bg-white": val == 0,
      "bg-blue-500": Math.floor(val / 10) == 1,
      "bg-red-800": Math.floor(val / 10) == 2,
      "bg-gray-300": val == 3,
      "bg-gray-800": val == 4,
      "bg-blue-200": val == 666,
      "bg-red-200": val == 777,
    }
  );
  return (
    <div onClick={() => handleClick(id)} className={className}>
      {val > 10 && val < 30 ? <span>{val % 10}</span> : null}
    </div>
  );
};
