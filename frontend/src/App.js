import { Routes, Route } from "react-router-dom";
import { Game } from "./components/Game.tsx";
import { Rooms } from "./pages/Rooms.tsx";
import { Auth } from "./pages/Auth.tsx";
import { Layout } from "./components/Layout.tsx";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route path="rooms" element={<Rooms />} />
          <Route path="game" element={<Game />} />
          <Route path="auth" element={<Auth />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
