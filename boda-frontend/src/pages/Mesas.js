import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

const MesaBase = ({
  id,
  tipo,
  ocupados = 0,
  capacidad = 0,
  onClick,
  styleExtras = {},
  listeners = {},
  attributes = {},
  setNodeRef = null,
  invitadosAsignados = [],
  nMesa
}) => {
  const handleClick = (e) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  const totalOcupados = invitadosAsignados.reduce((acc, inv) => {
    const niños = inv.acompanantes?.filter((a) => a.esNino)?.length || 0;
    const adultos = (inv.acompanantes?.length || 0) - niños + 1;
    const boletosExtraAdultos = isNaN(inv.boletosExtraAdultos) ? 0 : inv.boletosExtraAdultos;
    const boletosExtraNinos = isNaN(inv.boletosExtraNinos) ? 0 : inv.boletosExtraNinos;

    return [
      ...acc,
      ...Array(adultos + boletosExtraAdultos).fill("adulto"),
      ...Array(niños + boletosExtraNinos).fill("niño"),
    ];
  }, []);

  const style = {
    width: 50,
    height: 50,
    borderRadius: tipo === "redonda" ? "50%" : "12px",
    backgroundColor: tipo === "borrador" ? "#ef4444" : "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    fontWeight: "bold",
    color: "white",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    ...styleExtras,
  };

  const getSillaColor = (index) => {
    if (!totalOcupados[index]) return "#d1d5db";
    return totalOcupados[index] === "niño" ? "#f59e0b" : "#10b981";
  };

  const sillasRedonda = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 2 * Math.PI;
    const radius = 35;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const color = getSillaColor(i);
    return (
      <div
        key={i}
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: color,
          position: "absolute",
          top: `calc(50% + ${y}px - 4px)`,
          left: `calc(50% + ${x}px - 4px)`,
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        }}
      />
    );
  });

  const sillaEstilo = (key, left, top, index) => (
    <div
      key={key}
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: getSillaColor(index),
        position: "absolute",
        left,
        top,
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      }}
    />
  );

  const sillasCuadrada = [
    ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`top-${i}`, `${12 + i * 12}px`, "-12px", i)),
    ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`bottom-${i}`, `${12 + i * 12}px`, "62px", i + 3)),
    ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`left-${i}`, "-12px", `${12 + i * 12}px`, i + 6)),
    ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`right-${i}`, "62px", `${12 + i * 12}px`, i + 9)),
  ];

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes} 
      onClick={handleClick}
      className="hover:scale-105 hover:shadow-md"
    >
      {tipo === "redonda" && sillasRedonda}
      {tipo === "cuadrada" && sillasCuadrada}
      {tipo === "borrador" && (
        <span className="text-xl font-bold">X</span>
      )}
      {tipo !== "borrador" && (
        <>
          <span className="absolute text-[8px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-gray-800">
            {nMesa}
          </span>
          <span 
  className="absolute text-[8px] top-1 right-1 bg-white text-gray-800 rounded-full w-4 h-4 flex items-center justify-center shadow"
>
  {capacidad - totalOcupados.length}
</span>
        </>
      )}
    </div>
  );
};

const MesaDraggable = (props) => {
  const { id, mesaExistente } = props;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ 
    id,
    data: {
      isExisting: mesaExistente
    }
  });

  const styleExtras = transform
    ? { 
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
        opacity: 0.9,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }
    : {};

  return (
    <MesaBase
      {...props}
      listeners={listeners}
      attributes={attributes}
      setNodeRef={setNodeRef}
      styleExtras={styleExtras}
    />
  );
};


const Mesa = (props) => <MesaBase {...props} />;

const Espacio = ({ id, mesa, onMesaClick, modoAsignar }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  const ocupados = useMemo(() => {
    return mesa?.invitadosAsignados?.reduce((acc, inv) => {
      return acc + 1 + (inv.acompanantes?.length || 0);
    }, 0) || 0;
  }, [mesa]);

  return (
    <div
      ref={setNodeRef}
      className={`relative flex items-center justify-center m-2 transition-all duration-200 ${
        isOver ? "ring-2 ring-blue-500 ring-opacity-50" : ""
      }`}
      style={{
        width: 80,
        height: 80,
        backgroundColor: isOver ? "rgba(59, 130, 246, 0.1)" : "transparent",
      }}
    >
      {mesa ? (
        <Mesa
          id={mesa.id}
          tipo={mesa.tipo}
          ocupados={ocupados}
          capacidad={mesa.capacidad || (mesa.tipo === "cuadrada" ? 12 : 10)}
          invitadosAsignados={mesa.invitadosAsignados}
          onClick={() => onMesaClick(mesa, id)}
          nMesa={mesa.nMesa}
        />
      ) : (
        <div className="text-xs text-gray-400 absolute top-0 left-0 bg-gray-50 px-1 rounded">
         
        </div>
      )}
    </div>
  );
};

export default function Mesas({ espacios, setEspacios, updateEspacios }) {
  const plantillas = [
    { id: "template-redonda", tipo: "redonda", label: "Mesa Redonda", capacidad: 10 },
    { id: "template-cuadrada", tipo: "cuadrada", label: "Mesa Cuadrada", capacidad: 12 },
    { id: "borrador", tipo: "borrador", label: "Borrador" },
  ];

  const [modoAsignar, setModoAsignar] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [invitados, setInvitados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("Cargando...");

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );
  const ocupadosActuales = mesaSeleccionada?.invitadosAsignados?.reduce((acc, inv) => {
    const niños = inv.acompanantes?.filter(a => a.esNino)?.length || 0;
    const adultos = (inv.acompanantes?.length || 0) - niños + 1;
    return acc + adultos + niños + (inv.boletosExtraAdultos || 0) + (inv.boletosExtraNinos || 0);
  }, 0) || 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setSyncStatus("Cargando datos...");
        
        // 1. Configuración de axios con manejo de errores mejorado
        const axiosConfig = {
          timeout: 10000, // 10 segundos
          validateStatus: function (status) {
            return status < 500; // No lanzar error para respuestas 5xx
          }
        };
  
        // 2. Carga en paralelo con mejor manejo de errores
        const [invitadosRes, layoutRes] = await Promise.all([
          axios.get("http://localhost:5000/api/invitados", axiosConfig)
            .catch(err => {
              console.warn("Error cargando invitados:", err.message);
              return { data: [] }; // Retorna datos vacíos si falla
            }),
          axios.get("http://localhost:5000/api/layout", axiosConfig)
            .catch(err => {
              console.warn("Error cargando layout:", err.message);
              return { data: null }; // Forzará la creación de nuevo layout
            })
        ]);
  
        // 3. Procesar invitados
        if (invitadosRes.data) {
          setInvitados(invitadosRes.data);
        }
  
        // 4. Validar y procesar layout
        let layoutData = layoutRes.data?.espacios || layoutRes.data;
        
        if (!layoutData || layoutData.length !== 55) {
          console.warn("Layout inválido, creando nuevo");
          layoutData = Array.from({ length: 55 }, (_, i) => ({
            id: `espacio-${i}`,
            mesa: null,
            nMesa: i + 1 // Nuevo campo para número de mesa
          }));
          
          // Intentar guardar el nuevo layout
          try {
            const { data } = await axios.post(
              "http://localhost:5000/api/layout",
              { espacios: layoutData },
              axiosConfig
            );
            layoutData = data.espacios || layoutData;
            setSyncStatus("Layout reparado");
          } catch (postError) {
            console.error("Error guardando layout:", postError);
            setSyncStatus("Usando layout local");
          }
        }
  
        setEspacios(layoutData);
        setSyncStatus("Datos cargados");
        
      } catch (err) {
        console.error("Error crítico:", err);
        setSyncStatus("Error, usando datos locales");
        
        // Layout de emergencia
        setEspacios(Array.from({ length: 55 }, (_, i) => ({
          id: `espacio-${i}`,
          mesa: null,
          nMesa: i + 1
        })));
      } finally {
        setLoading(false);
      }
    };
  
    // Agregar delay mínimo para evitar flashes de carga
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
  
    return () => clearTimeout(timer);
  }, [setEspacios]);
  
  // Segundo useEffect para sincronización (mejorado)
  useEffect(() => {
    const verificarSincronizacion = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/layout", {
          timeout: 8000
        });
        
        // Validar estructura del layout
        if (res.data?.espacios?.length === 55) {
          return res.data;
        }
        return null;
      } catch (err) {
        console.warn("Error en sincronización:", err.message);
        return null;
      }
    };
  
    const syncInterval = setInterval(async () => {
      if (!modoAsignar && !loading) {
        try {
          setSyncStatus("Verificando cambios...");
          const datosBackend = await verificarSincronizacion();
          
          if (datosBackend) {
            setEspacios(prev => {
              // Comparación profunda para evitar actualizaciones innecesarias
              const needsUpdate = JSON.stringify(prev) !== JSON.stringify(datosBackend.espacios);
              if (needsUpdate) {
                setSyncStatus("Sincronizando cambios...");
                return datosBackend.espacios;
              }
              setSyncStatus("Sincronizado");
              return prev;
            });
          }
        } catch (err) {
          console.warn("Error en intervalo de sincronización:", err);
          setSyncStatus("Error sincronizando");
        }
      }
    }, 30000);
  
    return () => clearInterval(syncInterval);
  }, [modoAsignar, setEspacios, loading]);

  
  const getInvitadosRelacionados = useMemo(() => {
    const relacionadosMap = {};
    
    invitados.forEach(inv => {
      inv.relacionarCon?.forEach(relId => {
        if (!relacionadosMap[relId]) relacionadosMap[relId] = new Set();
        relacionadosMap[relId].add(inv._id);
      });
    });

    return relacionadosMap;
  }, [invitados]);

  const getGruposRelacionados = (invitadoId) => {
    const grupo = new Set([invitadoId]);
    const porVisitar = [invitadoId];
    
    while (porVisitar.length > 0) {
      const actual = porVisitar.pop();
      const relacionados = getInvitadosRelacionados[actual] || new Set();
      
      relacionados.forEach(relId => {
        if (!grupo.has(relId)) {
          grupo.add(relId);
          porVisitar.push(relId);
        }
      });
    }
    
    return Array.from(grupo);
  };

  const getInvitadosDisponiblesParaMesa = (mesa) => {
    // Calcular ocupación actual de la mesa
    const ocupadosActuales = mesa.invitadosAsignados?.reduce((acc, inv) => {
      const niños = inv.acompanantes?.filter(a => a.esNino)?.length || 0;
      const adultos = (inv.acompanantes?.length || 0) - niños + 1;
      return acc + adultos + niños + (inv.boletosExtraAdultos || 0) + (inv.boletosExtraNinos || 0);
    }, 0) || 0;
  
    const capacidadDisponible = mesa.capacidad - ocupadosActuales;
  
    // Si no hay capacidad, retornar array vacío
    if (capacidadDisponible <= 0) return [];
  
    // Obtener todos los invitados no asignados
    const todosDisponibles = invitados.filter(
      inv => !invitadosAsignadosIds.includes(inv._id)
    );
  
    // Si la mesa ya tiene invitados
    if (mesa.invitadosAsignados?.length > 0) {
      // Encontrar todos los relacionados con los invitados actuales
      const relacionadosEnMesa = new Set();
      
      mesa.invitadosAsignados.forEach(inv => {
        const grupo = getGruposRelacionados(inv._id);
        grupo.forEach(id => relacionadosEnMesa.add(id));
      });
  
      // Filtrar los disponibles que están relacionados
      const relacionadosDisponibles = todosDisponibles.filter(inv => 
        relacionadosEnMesa.has(inv._id)
      );
  
      // Filtrar los que caben en la capacidad restante
      const relacionadosConEspacio = relacionadosDisponibles.filter(inv => {
        const tamañoInvitado = 1 + (inv.acompanantes?.length || 0) + 
          (inv.boletosExtraAdultos || 0) + (inv.boletosExtraNinos || 0);
        return tamañoInvitado <= capacidadDisponible;
      });
  
      // Si hay relacionados disponibles, mostrarlos primero
      if (relacionadosConEspacio.length > 0) {
        return [
          ...relacionadosConEspacio,
          ...todosDisponibles
            .filter(inv => !relacionadosEnMesa.has(inv._id))
            .filter(inv => {
              const tamañoInvitado = 1 + (inv.acompanantes?.length || 0) + 
                (inv.boletosExtraAdultos || 0) + (inv.boletosExtraNinos || 0);
              return tamañoInvitado <= capacidadDisponible;
            })
        ];
      }
    }
  
    // Si no hay invitados en la mesa o no hay relacionados, mostrar todos los que caben
    return todosDisponibles
      .filter(inv => {
        const tamañoInvitado = 1 + (inv.acompanantes?.length || 0) + 
          (inv.boletosExtraAdultos || 0) + (inv.boletosExtraNinos || 0);
        return tamañoInvitado <= capacidadDisponible;
      })
      .sort((a, b) => {
        const tamañoA = 1 + (a.acompanantes?.length || 0) + (a.boletosExtraAdultos || 0) + (a.boletosExtraNinos || 0);
        const tamañoB = 1 + (b.acompanantes?.length || 0) + (b.boletosExtraAdultos || 0) + (b.boletosExtraNinos || 0);
        return tamañoA - tamañoB;
      });
  };

  const invitadosAsignadosIds = useMemo(() => {
    return espacios.flatMap(esp =>
      esp.mesa?.invitadosAsignados?.map(i => i._id) || []
    );
  }, [espacios]);

  const handleDragEnd = async ({ active, over }) => {
    if (!over || modoAsignar) return;

    try {
      const plantilla = plantillas.find((p) => p.id === active.id);
      if (plantilla || active.id === "borrador") {
        const espacioIndex = espacios.findIndex(e => e.id === over.id);
        if (espacioIndex === -1) return;

        const nuevosEspacios = [...espacios];
        
        if (active.id === "borrador") {
          nuevosEspacios[espacioIndex] = { 
            ...nuevosEspacios[espacioIndex], 
            mesa: null 
          };
        } else {
          nuevosEspacios[espacioIndex] = { 
            ...nuevosEspacios[espacioIndex],
            mesa: {
              id: `${plantilla.tipo}-${Date.now()}`,
              tipo: plantilla.tipo,
              capacidad: plantilla.tipo === "cuadrada" ? 12 : 10,
              invitadosAsignados: [],
              nMesa: parseInt(over.id.replace('espacio-', '')) + 1 // Asigna número de mesa basado en posición
            }
          };
        }

        const success = await updateEspacios(nuevosEspacios);
        if (success) {
          setEspacios(nuevosEspacios);
          setSyncStatus(active.id === "borrador" ? "Mesa borrada" : "Mesa creada");
        }
        return;
      }

      const mesaExistente = espacios.find(e => e.mesa?.id === active.id)?.mesa;
      if (mesaExistente) {
        const espacioDestinoIndex = espacios.findIndex(e => e.id === over.id);
        if (espacioDestinoIndex === -1) return;

        const nuevosEspacios = [...espacios];
        nuevosEspacios[espacioDestinoIndex] = {
          ...nuevosEspacios[espacioDestinoIndex],
          mesa: {
            ...mesaExistente,
            id: `${mesaExistente.tipo}-${Date.now()}`,
            nMesa: parseInt(over.id.replace('espacio-', '')) + 1 // Actualiza número de mesa
          }
        };

        const success = await updateEspacios(nuevosEspacios);
        if (success) {
          setEspacios(nuevosEspacios);
          setSyncStatus("Mesa copiada");
        }
        return;
      }
    } catch (error) {
      console.error("Error en handleDragEnd:", error);
      setSyncStatus("Error al actualizar mesas");
    }
  };

  const guardarDistribucion = async () => {
    try {
      setSyncStatus("Guardando...");
      const layoutActual = await axios.get("http://localhost:5000/api/layout");
      await axios.put(
        `http://localhost:5000/api/layout/${layoutActual.data._id}`,
        { espacios: espacios }
      );
      setSyncStatus("Distribución guardada");
      alert("¡Distribución guardada correctamente!");
    } catch (err) {
      console.error("Error al guardar:", {
        message: err.message,
        response: err.response?.data
      });
      setSyncStatus("Error al guardar");
      alert("Error al guardar la distribución. Verifica la consola para más detalles.");
    }
  };

  const handleMesaClick = (mesa, espacioId) => {
    if (modoAsignar) {
      setMesaSeleccionada({...mesa, espacioId});
      setShowModal(true);
    }
  };

  const asignarInvitado = async (invitado) => {
    const nuevosEspacios = espacios.map(esp => {
      if (esp.id === mesaSeleccionada.espacioId) {
        return {
          ...esp,
          mesa: {
            ...esp.mesa,
            invitadosAsignados: [...esp.mesa.invitadosAsignados, invitado],
          },
        };
      }
      return esp;
    });

    const success = await updateEspacios(nuevosEspacios);
    if (success) {
      setEspacios(nuevosEspacios);
      setSyncStatus("Invitado asignado");
    }
  };

  const quitarInvitado = async (idInvitado) => {
    const nuevosEspacios = espacios.map(esp => {
      if (esp.id === mesaSeleccionada.espacioId) {
        return {
          ...esp,
          mesa: {
            ...esp.mesa,
            invitadosAsignados: esp.mesa.invitadosAsignados.filter(
              inv => inv._id !== idInvitado
            ),
          },
        };
      }
      return esp;
    });

    const success = await updateEspacios(nuevosEspacios);
    if (success) {
      setEspacios(nuevosEspacios);
      setMesaSeleccionada({
        ...mesaSeleccionada,
        invitadosAsignados: nuevosEspacios.find(
          e => e.id === mesaSeleccionada.espacioId
        )?.mesa?.invitadosAsignados || []
      });
      setSyncStatus("Invitado removido");
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg">Cargando distribución...</p>
        <p className="text-sm text-gray-600 mt-2">{syncStatus}</p>
      </div>
    );
  }

  if (!espacios || espacios.length !== 55) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-bold">Error crítico</p>
          <p>La distribución no tiene 55 espacios</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }
  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragEnd={!modoAsignar ? handleDragEnd : undefined}
      sensors={!modoAsignar ? sensors : undefined}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Distribución de Mesas</h1>
              <p className="text-gray-600">Organiza el acomodo de tus invitados</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Estado:</span>
                <span className="ml-2 font-medium text-blue-600">{syncStatus}</span>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setModoAsignar(false)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    !modoAsignar 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Editar Mesas
                </button>
                <button
                  onClick={() => setModoAsignar(true)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    modoAsignar 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Asignar Invitados
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <span className="text-sm text-gray-600">Mesas:</span>
              <span className="ml-2 font-bold">
                {espacios.filter(e => e.mesa).length}/55
              </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <span className="text-sm text-gray-600">Asientos:</span>
              <span className="ml-2 font-bold">
                {espacios.reduce((acc, esp) => {
                  if (esp.mesa?.tipo === "redonda") return acc + (esp.mesa?.capacidad || 10);
                  if (esp.mesa?.tipo === "cuadrada") return acc + (esp.mesa?.capacidad || 12);
                  return acc;
                }, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Plantillas de mesas */}
        {!modoAsignar && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Plantillas de Mesas</h2>
            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
              {plantillas.map(mesa => (
                <div key={mesa.id} className="flex flex-col items-center">
                  <MesaDraggable id={mesa.id} tipo={mesa.tipo} />
                  <span className="mt-2 text-sm text-gray-600 pt-[14px]">{mesa.label}</span>
                  {mesa.capacidad && (
                    <span className="text-xs text-gray-500">{mesa.capacidad} personas</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Área de mesas */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            {modoAsignar ? "Asignación de Invitados" : "Distribución de Mesas"}
          </h2>
          
          <div className="grid grid-cols-11 gap-1 p-4 bg-gray-50 rounded-lg">
            {espacios.map(esp => (
              <Espacio
                key={esp.id}
                id={esp.id}
                mesa={esp.mesa}
                onMesaClick={handleMesaClick}
                modoAsignar={modoAsignar}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={guardarDistribucion}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Guardar Distribución
          </button>
        </div>

        {/* Modal para asignar invitados */}
        {showModal && mesaSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-t-xl">
                <h3 className="text-xl font-bold text-white">
                  Mesa {mesaSeleccionada.nMesa} - {mesaSeleccionada.tipo}
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-600 font-medium">Capacidad</p>
                    <p className="text-2xl font-bold text-blue-800">{mesaSeleccionada.capacidad}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <p className="text-sm text-green-600 font-medium">Disponible</p>
                    <p className="text-2xl font-bold text-green-800">
                      {mesaSeleccionada.capacidad - 
                       (mesaSeleccionada.invitadosAsignados?.reduce((acc, inv) => {
                         const niños = inv.acompanantes?.filter(a => a.esNino)?.length || 0;
                         const adultos = (inv.acompanantes?.length || 0) - niños + 1;
                         return acc + adultos + niños + (inv.boletosExtraAdultos || 0) + (inv.boletosExtraNinos || 0);
                       }, 0) || 0)}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Invitados asignados:</h4>
                  {mesaSeleccionada.invitadosAsignados?.length ? (
                    <div className="space-y-3">
                      {mesaSeleccionada.invitadosAsignados.map(inv => (
                        <div key={inv._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <p className="font-medium text-gray-800">{inv.nombre}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {inv.acompanantes?.filter(a => !a.esNino).length + 1} adultos
                              </span>
                              {inv.acompanantes?.filter(a => a.esNino).length > 0 && (
                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                  {inv.acompanantes?.filter(a => a.esNino).length} niños
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => quitarInvitado(inv._id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                      <p className="text-gray-500 italic">No hay invitados asignados a esta mesa</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
  <h4 className="font-semibold text-gray-700 mb-3">Agregar invitados:</h4>
  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
    {getInvitadosDisponiblesParaMesa(mesaSeleccionada).length > 0 ? (
      getInvitadosDisponiblesParaMesa(mesaSeleccionada)
        .map(inv => {
          const adultos = 1 + (inv.acompanantes?.filter(a => !a.esNino).length || 0) + (inv.boletosExtraAdultos || 0);
          const niños = (inv.acompanantes?.filter(a => a.esNino).length || 0) + (inv.boletosExtraNinos || 0);
          const total = adultos + niños;
          
          // Verificar si está relacionado con alguien en la mesa
          const estaRelacionado = mesaSeleccionada.invitadosAsignados?.some(
            invMesa => {
              const grupoRelacionado = getGruposRelacionados(invMesa._id);
              return grupoRelacionado.includes(inv._id);
            }
          );

          return (
            <button
              key={inv._id}
              onClick={() => asignarInvitado(inv)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                estaRelacionado
                  ? 'bg-purple-50 border-purple-200 hover:bg-purple-100'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{inv.nombre}</span>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                  {total} {total === 1 ? 'persona' : 'personas'}
                  {estaRelacionado && (
                    <span className="ml-1 text-purple-600">⭐</span>
                  )}
                </span>
              </div>
              {estaRelacionado && (
                <p className="text-xs text-purple-600 mt-1 text-left">
                  Relacionado con otros en esta mesa
                </p>
              )}
            </button>
          );
        })
    ) : (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500 italic">
          {mesaSeleccionada.capacidad === ocupadosActuales 
            ? "La mesa está llena" 
            : "No hay invitados disponibles para esta capacidad"}
        </p>
      </div>
    )}
  </div>
</div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}