import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import Invitados from "./pages/Invitados";
import Tareas from "./pages/Tareas";
import Gastos from "./pages/Gastos";
import Proveedores from "./pages/Proveedores";
import Documentos from "./pages/Documentos";
import Inspiracion from "./pages/Inspiracion";
import Musica from "./pages/Musica";
import Mesas from "./pages/Mesas";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Navbar */}
        <nav className="bg-blue-700 p-4 shadow-md">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-white text-2xl font-semibold">Sistema de Boda</h1>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link to="/" className="text-white hover:text-yellow-300 transition">
                Inicio
              </Link>
              <Link to="/invitados" className="text-white hover:text-yellow-300 transition">
                Invitados
              </Link>
              <Link to="/tareas" className="text-white hover:text-yellow-300 transition">
                Tareas
              </Link>
              <Link to="/gastos" className="text-white hover:text-yellow-300 transition">
                Gastos
              </Link>
              <Link to="/proveedores" className="text-white hover:text-yellow-300 transition">
                Proveedores
              </Link>
              <Link to="/documentos" className="text-white hover:text-yellow-300 transition">
                Documentos
              </Link>
              <Link to="/inspiracion" className="text-white hover:text-yellow-300 transition">
                Inspiración
              </Link>
              <Link to="/musica" className="text-white hover:text-yellow-300 transition">
                Música
              </Link>
              <Link to="/mesas" className="text-white hover:text-yellow-300 transition">
              Mesas
              </Link>
            </div>
          </div>
        </nav>

        {/* Contenido */}
        <main className="container mx-auto p-6 flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/invitados" element={<Invitados />} />
            <Route path="/tareas" element={<Tareas />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/inspiracion" element={<Inspiracion />} />
            <Route path="/musica" element={<Musica />} />
            <Route path="/mesas" element={<Mesas />} />

          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-blue-700 text-white text-sm text-center p-4">
          © {new Date().getFullYear()} Sistema de Invitados - Todos los derechos reservados
        </footer>
      </div>
    </Router>
  );
}

export default App;
