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
        <span className="absolute text-[10px] top-0 right-0 bg-white text-gray-800 rounded px-1">
          {capacidad - totalOcupados.length}
        </span>
      )}
    </div>
  );
};

const MesaDraggable = (props) => {
  const { id } = props;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const styleExtras = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, cursor: "grab" }
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
        width: 60,
        height: 70,
        border: modoAsignar ? "none" : "1px dashed #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: mesa ? "transparent" : "transparent",
        margin: "3px 30px",
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
        
        const [invitadosRes, layoutRes] = await Promise.all([
          axios.get("http://localhost:5000/api/invitados"),
          axios.get("http://localhost:5000/api/layout")
        ]);

        setInvitados(invitadosRes.data);
        
        const layoutData = layoutRes.data.espacios || layoutRes.data;
        
        if (!layoutData || layoutData.length !== 55) {
          throw new Error("Estructura de layout inválida");
        }

        setEspacios(layoutData);
        setSyncStatus("Sincronizado");
        
      } catch (err) {
        console.error("Error cargando datos:", err);
        setSyncStatus("Error cargando. Usando versión local...");
        
        const espaciosVacios = Array.from({ length: 55 }, (_, i) => ({
          id: `espacio-${i}`,
          mesa: null
        }));
        setEspacios(espaciosVacios);

        try {
          await axios.post("http://localhost:5000/api/layout", { 
            espacios: espaciosVacios 
          });
          setSyncStatus("Reparado. Sincronizando...");
        } catch (postError) {
          console.error("Error reparando layout:", postError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setEspacios]);

  useEffect(() => {
    const verificarSincronizacion = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/layout");
        return res.data.espacios || res.data;
      } catch (err) {
        console.error("Error verificando sincronización:", err);
        return null;
      }
    };

    const syncInterval = setInterval(async () => {
      if (!modoAsignar) {
        const datosBackend = await verificarSincronizacion();
        if (datosBackend) {
          setEspacios(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(datosBackend)) {
              setSyncStatus("Sincronizando cambios...");
              return datosBackend;
            }
            return prev;
          });
        }
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [modoAsignar, setEspacios]);

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
              invitadosAsignados: []
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
            id: `${mesaExistente.tipo}-${Date.now()}`
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

  const handleMesaClick = (mesa) => {
    if (modoAsignar) {
      setMesaSeleccionada(mesa);
      setShowModal(true);
    }
  };

  const asignarInvitado = async (invitado) => {
    const nuevosEspacios = espacios.map(esp => {
      if (esp.mesa?.id === mesaSeleccionada.id) {
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
      setShowModal(false);
      setSyncStatus("Invitado asignado");
    }
  };

  const quitarInvitado = async (idInvitado) => {
    const nuevosEspacios = espacios.map(esp => {
      if (esp.mesa?.id === mesaSeleccionada.id) {
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
      setMesaSeleccionada(nuevosEspacios.find(
        e => e.mesa?.id === mesaSeleccionada.id
      )?.mesa);
      setSyncStatus("Invitado removido");
    }
  };

  const invitadosAsignadosIds = useMemo(() => {
    return espacios.flatMap(esp =>
      esp.mesa?.invitadosAsignados?.map(i => i._id) || []
    );
  }, [espacios]);

  const invitadosDisponibles = invitados.filter(
    inv => !invitadosAsignadosIds.includes(inv._id)
  );

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
                Asignar invitados - Mesa {mesaSeleccionada.id}
              </h3>

              <p className="text-sm text-gray-700 mb-4">
                Capacidad: <strong>{mesaSeleccionada.capacidad}</strong><br />
                Ocupados: <strong>{
                  mesaSeleccionada.invitadosAsignados?.reduce((acc, inv) => {
                    const niños = inv.acompanantes?.filter(a => a.esNino)?.length || 0;
                    const adultos = (inv.acompanantes?.length || 0) - niños + 1;
                    return acc + adultos + niños + (inv.boletosExtraAdultos || 0) + (inv.boletosExtraNinos || 0);
                  }, 0) || 0
                }</strong>
              </p>

              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-1">Asignados:</h4>
                {mesaSeleccionada.invitadosAsignados?.length ? (
                  mesaSeleccionada.invitadosAsignados.map(inv => (
                    <div key={inv._id} className="flex justify-between items-center text-sm bg-gray-100 px-2 py-1 rounded mb-1">
                      <span>{inv.nombre}</span>
                      <span className="text-xs text-gray-500">
                        (Adultos: {inv.acompanantes?.filter(a => !a.esNino).length + 1}, Niños: {inv.acompanantes?.filter(a => a.esNino).length})
                      </span>
                      <button
                        onClick={() => quitarInvitado(inv._id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Quitar
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">Sin invitados asignados.</p>
                )}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                {invitadosDisponibles.map(inv => {
                  const adultos = inv.acompanantes?.filter(a => !a.esNino).length || 0;
                  const niños = inv.acompanantes?.filter(a => a.esNino).length || 0;
                  return (
                    <button
                      key={inv._id}
                      onClick={() => asignarInvitado(inv)}
                      className="block w-full text-left px-3 py-1 border rounded hover:bg-blue-100"
                    >
                      {inv.nombre} 
                      <span className="text-xs text-gray-500">
                        (Adultos: {adultos}, Niños: {niños})
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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