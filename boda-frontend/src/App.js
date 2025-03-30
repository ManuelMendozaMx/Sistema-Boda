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
const [syncStatus, setSyncStatus] = useState("Cargando...");

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

  useEffect(() => {
    const initializeLayout = async () => {
      setLoading(true);
      setSyncStatus("Cargando distribución...");
      
      try {
        // 1. Intenta cargar el layout existente
        const { data: existingLayout } = await axios.get(
          "http://localhost:5000/api/layout",
          { timeout: 5000 } // Timeout de 5 segundos
        );
        
        // 2. Verifica si el layout es válido (tiene 55 espacios)
        const isValidLayout = existingLayout?.espacios?.length === 55 && 
          existingLayout.espacios.every((esp, i) => esp.id === `espacio-${i}`);
        
        if (!isValidLayout) {
          // 3. Si no es válido, crea uno nuevo
          setSyncStatus("Creando layout nuevo...");
          const espaciosVacios = Array.from({ length: 55 }, (_, i) => ({
            id: `espacio-${i}`,
            mesa: null,
            nMesa: i + 1 // Asignamos número de mesa basado en posición
          }));
          
          // Intenta conservar las mesas existentes si las hay
          if (existingLayout?.espacios) {
            espaciosVacios.forEach((espacio, i) => {
              if (existingLayout.espacios[i]?.mesa) {
                espacio.mesa = {
                  ...existingLayout.espacios[i].mesa,
                  nMesa: i + 1 // Aseguramos que tenga número de mesa
                };
              }
            });
          }
          
          const { data: newLayout } = await axios.post(
            "http://localhost:5000/api/layout", 
            { espacios: espaciosVacios }
          );
          
          setEspacios(newLayout.espacios);
          setCurrentLayoutId(newLayout._id);
          setSyncStatus("Layout inicializado");
          console.log("Nuevo layout creado:", newLayout);
        } else {
          // 4. Si el layout es válido, úsalo
          setEspacios(existingLayout.espacios);
          setCurrentLayoutId(existingLayout._id);
          setSyncStatus("Layout cargado");
          console.log("Layout existente cargado:", existingLayout);
        }
      } catch (error) {
        console.error("Error inicializando layout:", error);
        setSyncStatus("Error, usando layout local");
        
        // 5. Fallback: crea un layout vacío en memoria
        const espaciosVacios = Array.from({ length: 55 }, (_, i) => ({
          id: `espacio-${i}`,
          mesa: null,
          nMesa: i + 1
        }));
        
        setEspacios(espaciosVacios);
        
        // Intenta guardar el layout local en el backend
        try {
          const { data: newLayout } = await axios.post(
            "http://localhost:5000/api/layout", 
            { espacios: espaciosVacios }
          );
          setCurrentLayoutId(newLayout._id);
        } catch (postError) {
          console.error("Error guardando layout de respaldo:", postError);
        }
      } finally {
        setLoading(false);
      }
    };
  
    // Agregamos un pequeño delay para evitar flashes de carga
    const timer = setTimeout(() => {
      initializeLayout();
    }, 300);
  
    return () => clearTimeout(timer);
  }, [setEspacios]);

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