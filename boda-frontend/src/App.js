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

  const updateEspacios = async (nuevosEspacios) => {
    try {
      const layoutActual = await axios.get("http://localhost:5000/api/layout");
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
        const { data: existingLayout } = await axios.get(
          "http://localhost:5000/api/layout",
          { timeout: 5000 }
        );

        const isValidLayout =
          existingLayout?.espacios?.length === 55 &&
          existingLayout.espacios.every((esp, i) => esp.id === `espacio-${i}`);

        if (!isValidLayout) {
          setSyncStatus("Creando layout nuevo...");
          const espaciosVacios = Array.from({ length: 55 }, (_, i) => ({
            id: `espacio-${i}`,
            mesa: null,
            nMesa: i + 1,
          }));

          if (existingLayout?.espacios) {
            espaciosVacios.forEach((espacio, i) => {
              if (existingLayout.espacios[i]?.mesa) {
                espacio.mesa = {
                  ...existingLayout.espacios[i].mesa,
                  nMesa: i + 1,
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
        } else {
          setEspacios(existingLayout.espacios);
          setCurrentLayoutId(existingLayout._id);
          setSyncStatus("Layout cargado");
        }
      } catch (error) {
        console.error("Error inicializando layout:", error);
        setSyncStatus("Error, usando layout local");

        const espaciosVacios = Array.from({ length: 55 }, (_, i) => ({
          id: `espacio-${i}`,
          mesa: null,
          nMesa: i + 1,
        }));

        setEspacios(espaciosVacios);

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

    const timer = setTimeout(() => {
      initializeLayout();
    }, 300);

    return () => clearTimeout(timer);
  }, [setEspacios]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Navbar */}
        <nav className="bg-gradient-to-r from-blue-800 to-indigo-900 p-4 shadow-lg">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <Link 
              to="/" 
              className="text-white text-2xl font-bold flex items-center gap-2 hover:text-yellow-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z" />
              </svg>
              <span className="hidden sm:inline">Planner de Boda</span>
            </Link>
            
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {/* Menú desplegable */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-white hover:text-yellow-300 transition-colors px-3 py-2 rounded-lg group-hover:bg-blue-700/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>Invitados</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute z-10 left-0 mt-2 w-48 origin-top-left scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-out">
                  <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <Link to="/invitados" className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Lista de Invitados
                    </Link>
                    <Link to="/mesas" className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Distribución de Mesas
                    </Link>
                  </div>
                </div>
              </div>
  
              {/* Segundo menú desplegable */}
              <div className="relative group">
                <button className="flex items-center gap-1 text-white hover:text-yellow-300 transition-colors px-3 py-2 rounded-lg group-hover:bg-blue-700/50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span>Organización</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className="absolute z-10 left-0 mt-2 w-56 origin-top-left scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 ease-out">
                  <div className="bg-white rounded-lg shadow-xl overflow-hidden grid grid-cols-2">
                    <Link to="/tareas" className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Tareas
                    </Link>
                    <Link to="/gastos" className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Gastos
                    </Link>
                    <Link to="/proveedores" className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Proveedores
                    </Link>
                    <Link to="/documentos" className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Documentos
                    </Link>
                    <Link to="/inspiracion" className="block px-4 py-3 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2 col-span-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Inspiración
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Contenido Principal */}
        <main className="container mx-auto p-4 md:p-6 flex-grow">
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
                  <div className="flex flex-col items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                    <p className="text-lg text-gray-700">Cargando distribución de mesas...</p>
                    <p className="text-sm text-gray-500 mt-2">Preparando tu diseño perfecto</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <Mesas 
                      espacios={espacios} 
                      setEspacios={setEspacios}
                      updateEspacios={updateEspacios}
                    />
                  </div>
                )
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z" />
                  </svg>
                  Planner de Boda
                </h3>
                <p className="text-sm opacity-80">Organiza tu día perfecto</p>
              </div>
              
              <div className="flex gap-4">
                <a href="#" className="hover:text-yellow-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-yellow-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-yellow-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="border-t border-blue-700/50 mt-4 pt-4 text-center text-sm opacity-80">
              © {new Date().getFullYear()} Planner de Boda - Todos los derechos reservados
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;