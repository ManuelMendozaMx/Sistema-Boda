import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
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
  const [openGestión, setOpenGestión] = useState(false);
  const [openOrganización, setOpenOrganización] = useState(false);
  const [espacios, setEspacios] = useState([]);
  const [currentLayoutId, setCurrentLayoutId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para actualizar los espacios en el backend
  const updateEspacios = async (nuevosEspacios) => {
    try {
      const layoutActual = await axios.get("http://localhost:5000/api/layout");
      // Usar layoutActual.data._id directamente si solo necesitas el ID
      await axios.put(
        `http://localhost:5000/api/layout/${layoutActual.data._id}`,
        { espacios: nuevosEspacios }
      );
      return true;
    } catch (error) {
      console.error("Error al actualizar:", error);
      return false;
    }
  };

  // UseEffect para manejar la carga y creación del layout vacío
  useEffect(() => {
    const initializeLayout = async () => {
      try {
        // 1. Intenta cargar el layout existente
        const { data: existingLayout } = await axios.get("http://localhost:5000/api/layout");
        
        // 2. Si no existe o está vacío, crea uno nuevo
        if (!existingLayout || !existingLayout.espacios || existingLayout.espacios.length === 0) {
          console.log("Creando nuevo layout vacío...");
          const espaciosVacios = Array.from({ length: 55 }, (_, i) => ({
            id: `espacio-${i}`,
            mesa: null
          }));
          
          const { data: newLayout } = await axios.post("http://localhost:5000/api/layout", {
            espacios: espaciosVacios
          });
          
          setEspacios(newLayout.espacios);
          setCurrentLayoutId(newLayout.layoutId || newLayout._id);
          console.log("Layout creado:", newLayout);
        } else {
          // 3. Si existe, úsalo
          setEspacios(existingLayout.espacios);
          setCurrentLayoutId(existingLayout._id);
          console.log("Layout cargado:", existingLayout);
        }
      } catch (error) {
        console.error("Error inicializando layout:", error);
        // Puedes mostrar un mensaje al usuario aquí
      } finally {
        setLoading(false);
      }
    };
  
    initializeLayout();
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Navbar */}
        <nav className="bg-blue-700 p-4 shadow-md">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
            <Link to="/" className="text-white text-2xl font-semibold">
              Sistema de Boda
            </Link>
            <div className="flex flex-wrap gap-3 text-sm">
              {/* Gestión de Invitados */}
              <div className="relative">
                <button
                  onClick={() => setOpenGestión(!openGestión)}
                  className="text-white hover:text-yellow-300 transition flex items-center gap-2"
                >
                  Gestión de Invitados
                  <span>{openGestión ? "▲" : "▼"}</span>
                </button>
                {openGestión && (
                  <div className="absolute bg-blue-600 rounded-md shadow-lg p-2 left-0 w-full">
                    <Link to="/invitados" className="block text-white hover:text-yellow-300 transition py-1">Invitados</Link>
                    <Link to="/mesas" className="block text-white hover:text-yellow-300 transition py-1">Mesas</Link>
                  </div>
                )}
              </div>

              {/* Organización de Boda */}
              <div className="relative">
                <button
                  onClick={() => setOpenOrganización(!openOrganización)}
                  className="text-white hover:text-yellow-300 transition flex items-center gap-2"
                >
                  Organización de Boda
                  <span>{openOrganización ? "▲" : "▼"}</span>
                </button>
                {openOrganización && (
                  <div className="absolute bg-blue-600 rounded-md shadow-lg p-2 left-0 w-full">
                    <Link to="/tareas" className="block text-white hover:text-yellow-300 transition py-1">Tareas</Link>
                    <Link to="/gastos" className="block text-white hover:text-yellow-300 transition py-1">Gastos</Link>
                    <Link to="/proveedores" className="block text-white hover:text-yellow-300 transition py-1">Proveedores</Link>
                    <Link to="/documentos" className="block text-white hover:text-yellow-300 transition py-1">Documentos</Link>
                    <Link to="/inspiracion" className="block text-white hover:text-yellow-300 transition py-1">Inspiración</Link>
                    <Link to="/musica" className="block text-white hover:text-yellow-300 transition py-1">Música</Link>
                  </div>
                )}
              </div>
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
            <Route 
              path="/mesas" 
              element={
                loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p>Cargando distribución de mesas...</p>
                  </div>
                ) : (
                  <Mesas 
                    espacios={espacios} 
                    setEspacios={setEspacios}
                    updateEspacios={updateEspacios}
                  />
                )
              } 
            />
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