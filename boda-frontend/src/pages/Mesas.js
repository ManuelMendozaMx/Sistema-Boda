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
  nMesa // Nuevo prop para el número de mesa
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
    width: 40,
    height: 40,
    borderRadius: tipo === "redonda" ? "50%" : "0%",
    backgroundColor: tipo === "borrador" ? "#dc2626" : "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    fontWeight: "bold",
    color: "white",
    ...styleExtras,
  };

  const getSillaColor = (index) => {
    if (!totalOcupados[index]) return "#9ca3af";
    return totalOcupados[index] === "niño" ? "#facc15" : "#22c55e";
  };

  const sillasRedonda = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 2 * Math.PI;
    const radius = 28;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    const color = getSillaColor(i);
    return (
      <div
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: color,
          position: "absolute",
          top: `calc(50% + ${y}px - 3px)`,
          left: `calc(50% + ${x}px - 3px)`,
        }}
      />
    );
  });

  const sillaEstilo = (key, left, top, index) => (
    <div
      key={key}
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        backgroundColor: getSillaColor(index),
        position: "absolute",
        left,
        top,
      }}
    />
  );

  const sillasCuadrada = [
    ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`top-${i}`, `${10 + i * 10}px`, "-10px", i)),
    ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`bottom-${i}`, `${10 + i * 10}px`, "46px", i + 3)),
    ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`left-${i}`, "-10px", `${10 + i * 10}px`, i + 6)),
    ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`right-${i}`, "46px", `${10 + i * 10}px`, i + 9)),
  ];

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} onClick={handleClick}>
      {tipo === "redonda" && sillasRedonda}
      {tipo === "cuadrada" && sillasCuadrada}
      {tipo === "borrador" && "X"}
      {tipo !== "borrador" && (
        <>
          <span className="absolute text-[7px] top-4 left-5  text-gray-800 ">
             {nMesa}
          </span>
          <span className="absolute text-[10px] top-0 right-0 bg-white text-gray-800 rounded px-1">
            {capacidad - totalOcupados.length}
          </span>
        </>
      )}
    </div>
  );
};

const MesaDraggable = (props) => {
  const { id, mesaExistente } = props; // Nuevo prop para identificar si es una mesa existente
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ 
    id,
    data: {
      isExisting: mesaExistente // Pasamos datos adicionales sobre el tipo de elemento
    }
  });

  const styleExtras = transform
    ? { 
        transform: `translate(${transform.x}px, ${transform.y}px)`, 
        cursor: "grab",
        zIndex: 1000,
        opacity: 0.8
      }
    : { cursor: "grab" };

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
  const { setNodeRef } = useDroppable({ id });

  const ocupados = useMemo(() => {
    return mesa?.invitadosAsignados?.reduce((acc, inv) => {
      return acc + 1 + (inv.acompanantes?.length || 0);
    }, 0) || 0;
  }, [mesa]);

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 70,
        height: 70,
        border: modoAsignar ? "none" : "1px dashed #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: mesa ? "transparent" : "transparent",
        margin: "3px 30px",
        position: "relative"
      }}
    >
      {mesa && (
        <Mesa
          id={mesa.id}
          tipo={mesa.tipo}
          ocupados={ocupados}
          capacidad={mesa.capacidad || (mesa.tipo === "cuadrada" ? 12 : 10)}
          invitadosAsignados={mesa.invitadosAsignados}
          onClick={() => onMesaClick(mesa, id)}
          nMesa={mesa.nMesa} // Pasamos el número de mesa
        />
      )}
     
    </div>
  );
};

export default function Mesas({ espacios, setEspacios, updateEspacios }) {
  const plantillas = [
    { id: "template-redonda", tipo: "redonda" },
    { id: "template-cuadrada", tipo: "cuadrada" },
    { id: "borrador", tipo: "borrador" },
  ];

  const [modoAsignar, setModoAsignar] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [invitados, setInvitados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("Cargando...");

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

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
    const ocupadosActuales = mesa.invitadosAsignados?.reduce((acc, inv) => {
      const niños = inv.acompanantes?.filter(a => a.esNino)?.length || 0;
      const adultos = (inv.acompanantes?.length || 0) - niños + 1;
      return acc + adultos + niños + (inv.boletosExtraAdultos || 0) + (inv.boletosExtraNinos || 0);
    }, 0) || 0;

    const capacidadDisponible = mesa.capacidad - ocupadosActuales;

    const todosDisponibles = invitados.filter(
      inv => !invitadosAsignadosIds.includes(inv._id)
    );

    if (capacidadDisponible <= 0) return [];

    if (mesa.invitadosAsignados?.length > 0) {
      const relacionadosEnMesa = new Set();
      
      mesa.invitadosAsignados.forEach(inv => {
        const grupo = getGruposRelacionados(inv._id);
        grupo.forEach(id => relacionadosEnMesa.add(id));
      });

      const relacionadosDisponibles = todosDisponibles.filter(inv => 
        relacionadosEnMesa.has(inv._id)
      );

      const relacionadosConEspacio = relacionadosDisponibles.filter(inv => {
        const tamañoInvitado = 1 + (inv.acompanantes?.length || 0) + 
          (inv.boletosExtraAdultos || 0) + (inv.boletosExtraNinos || 0);
        return tamañoInvitado <= capacidadDisponible;
      });

      if (relacionadosConEspacio.length > 0) {
        return [
          ...relacionadosConEspacio,
          ...todosDisponibles.filter(inv => !relacionadosEnMesa.has(inv._id))
        ];
      }
    }

    return [...todosDisponibles].sort((a, b) => {
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Distribución de Mesas</h2>
          <div className="text-sm px-3 py-1 bg-gray-100 rounded">
            Estado: <span className="font-medium">{syncStatus}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-700">
            Mesas: <strong>{espacios.filter(e => e.mesa).length}/55</strong> | 
            Asientos: <strong>
              {espacios.reduce((acc, esp) => {
                if (esp.mesa?.tipo === "redonda") return acc + (esp.mesa?.capacidad || 10);
                if (esp.mesa?.tipo === "cuadrada") return acc + (esp.mesa?.capacidad || 12);
                return acc;
              }, 0)}
            </strong>
          </div>
        </div>

        {!modoAsignar && (
          <div className="flex gap-12 mb-8 p-4 bg-gray-100 rounded">
            {plantillas.map(mesa => (
              <MesaDraggable key={mesa.id} id={mesa.id} tipo={mesa.tipo} />
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {modoAsignar ? "Asignación de Invitados" : "Espacio de acomodo"}
          </h2>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded ${!modoAsignar ? "bg-blue-600 text-white" : "bg-gray-300"}`}
              onClick={() => setModoAsignar(false)}
            >
              Editar Mesas
            </button>
            <button
              className={`px-4 py-2 rounded ${modoAsignar ? "bg-blue-600 text-white" : "bg-gray-300"}`}
              onClick={() => setModoAsignar(true)}
            >
              Asignar Invitados
            </button>
          </div>
        </div>

        <div className="grid grid-cols-11 gap-2 p-4 bg-white rounded shadow">
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

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Última actualización: {new Date().toLocaleTimeString()}
          </div>
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            onClick={guardarDistribucion}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Guardar Distribución
          </button>
        </div>

        {showModal && mesaSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                Mesa {mesaSeleccionada.nMesa} - {mesaSeleccionada.tipo}
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Capacidad</p>
                  <p className="font-bold">{mesaSeleccionada.capacidad}</p>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Disponible</p>
                  <p className="font-bold">
                    {mesaSeleccionada.capacidad - 
                     (mesaSeleccionada.invitadosAsignados?.reduce((acc, inv) => {
                       const niños = inv.acompanantes?.filter(a => a.esNino)?.length || 0;
                       const adultos = (inv.acompanantes?.length || 0) - niños + 1;
                       return acc + adultos + niños + (inv.boletosExtraAdultos || 0) + (inv.boletosExtraNinos || 0);
                     }, 0) || 0)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Invitados asignados:</h4>
                {mesaSeleccionada.invitadosAsignados?.length ? (
                  <div className="space-y-2">
                    {mesaSeleccionada.invitadosAsignados.map(inv => (
                      <div key={inv._id} className="flex justify-between items-center text-sm bg-gray-100 px-3 py-2 rounded">
                        <div>
                          <p className="font-medium">{inv.nombre}</p>
                          <p className="text-xs text-gray-500">
                            {inv.acompanantes?.filter(a => !a.esNino).length + 1} adultos, 
                            {inv.acompanantes?.filter(a => a.esNino).length} niños
                          </p>
                        </div>
                        <button
                          onClick={() => quitarInvitado(inv._id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Quitar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No hay invitados asignados</p>
                )}
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Agregar invitados:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getInvitadosDisponiblesParaMesa(mesaSeleccionada)
                    .slice(0, 10)
                    .map(inv => {
                      const adultos = 1 + (inv.acompanantes?.filter(a => !a.esNino).length || 0) + (inv.boletosExtraAdultos || 0);
                      const niños = (inv.acompanantes?.filter(a => a.esNino).length || 0) + (inv.boletosExtraNinos || 0);
                      const total = adultos + niños;
                      
                      const estaRelacionado = mesaSeleccionada.invitadosAsignados?.some(
                        invMesa => getGruposRelacionados(invMesa._id).includes(inv._id)
                      );

                      return (
                        <button
                          key={inv._id}
                          onClick={() => asignarInvitado(inv)}
                          className={`w-full text-left p-2 border rounded text-sm ${
                            estaRelacionado 
                              ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' 
                              : 'hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{inv.nombre}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {total} {total === 1 ? 'persona' : 'personas'}
                              {estaRelacionado && " ⭐"}
                            </span>
                          </div>
                          {estaRelacionado && (
                            <p className="text-xs text-purple-600 mt-1 text-left">
                              Relacionado con otros en esta mesa
                            </p>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}