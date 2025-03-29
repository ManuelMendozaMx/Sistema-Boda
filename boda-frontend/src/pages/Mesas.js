import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { DndContext, closestCenter, useDraggable, useDroppable } from "@dnd-kit/core";

// Reemplaza tu función MesaBase completa con esta:
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
    invitadosAsignados = []
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
      return [...acc, ...Array(adultos).fill("adulto"), ...Array(niños).fill("niño")];
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
      ...styleExtras
    };
  
    const getSillaColor = (index) => {
      if (!totalOcupados[index]) return "#9ca3af"; // silla libre
      return totalOcupados[index] === "niño" ? "#facc15" : "#22c55e"; // amarillo o verde
    };
  
    const sillasRedonda = Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * 2 * Math.PI;
      const radius = 30;
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
            left: `calc(50% + ${x}px - 3px)`
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
          top
        }}
      />
    );
  
    const sillasCuadrada = [
      ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`top-${i}`, `${10 + i * 10}px`, "-10px", i)),
      ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`bottom-${i}`, `${10 + i * 10}px`, "46px", i + 3)),
      ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`left-${i}`, "-10px", `${10 + i * 10}px`, i + 6)),
      ...Array.from({ length: 3 }, (_, i) => sillaEstilo(`right-${i}`, "46px", `${10 + i * 10}px`, i + 9))
    ];
  
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={handleClick}
      >
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

  const ocupados = mesa?.invitadosAsignados?.reduce((acc, inv) => {
    return acc + 1 + (inv.acompanantes?.length || 0);
  }, 0) || 0;

  return (
    <div
      ref={setNodeRef}
      style={{
        width: 60,
        height: 70,
        border: "1px dashed #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: mesa ? "#e0f2fe" : "transparent",
        margin: "3px 30px"
      }}
    >
      {mesa &&
        (modoAsignar ? (
            <Mesa
            id={mesa.id}
            tipo={mesa.tipo}
            ocupados={ocupados}
            capacidad={mesa.capacidad || (mesa.tipo === "cuadrada" ? 12 : 10)}
            invitadosAsignados={mesa.invitadosAsignados}
            onClick={() => onMesaClick(mesa, id)}
          />
          
        ) : (
            <MesaDraggable
            id={mesa.id}
            tipo={mesa.tipo}
            ocupados={ocupados}
            capacidad={mesa.capacidad || (mesa.tipo === "cuadrada" ? 12 : 10)}
            invitadosAsignados={mesa.invitadosAsignados}
            onClick={() => onMesaClick(mesa, id)}
          />
        ))}
    </div>
  );
};

export default function LayoutMesas() {
  const plantillas = [
    { id: "template-redonda", tipo: "redonda" },
    { id: "template-cuadrada", tipo: "cuadrada" },
    { id: "borrador", tipo: "borrador" }
  ];

  const [espacios, setEspacios] = useState([]);
  const [modoAsignar, setModoAsignar] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [invitados, setInvitados] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/mesas").then(res => {
      if (res.data && Array.isArray(res.data.espacios)) {
        setEspacios(res.data.espacios);
      } else {
        const vacios = Array.from({ length: 55 }, (_, i) => ({ id: `espacio-${i}`, mesa: null }));
        setEspacios(vacios);
      }
    }).catch(() => {
      const vacios = Array.from({ length: 55 }, (_, i) => ({ id: `espacio-${i}`, mesa: null }));
      setEspacios(vacios);
    });
  }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/api/invitados")
      .then(res => setInvitados(res.data))
      .catch(err => console.error("Error al cargar invitados", err));
  }, []);

  const handleDragEnd = ({ over, active }) => {
    if (!over || modoAsignar) return;

    const plantilla = plantillas.find((p) => p.id === active.id);
    if (active.id === "borrador") {
      setEspacios((prev) => prev.map((e) => (e.id === over.id ? { ...e, mesa: null } : e)));
      return;
    }

    const nuevaMesa = plantilla
      ? {
          id: `${plantilla.tipo}-${Date.now()}`,
          tipo: plantilla.tipo,
          capacidad: plantilla.tipo === "cuadrada" ? 12 : 10,
          invitadosAsignados: []
        }
      : {
          id: `${active.id.split("-")[0]}-${Date.now()}`,
          tipo: active.id.split("-")[0],
          capacidad: active.id.includes("cuadrada") ? 12 : 10,
          invitadosAsignados: []
        };

    setEspacios((prev) =>
      prev.map((e) => (e.id === over.id ? { ...e, mesa: nuevaMesa } : e))
    );
  };

  const guardarDistribucion = () => {
    axios.post("http://localhost:5000/api/mesas", { espacios })
      .then(() => alert("Distribución guardada correctamente"))
      .catch((err) => alert("Error al guardar distribución: " + err.message));
  };

  const handleMesaClick = (mesa) => {
    if (modoAsignar) {
      setMesaSeleccionada(mesa);
      setShowModal(true);
    }
  };

  const asignarInvitado = (invitado) => {
    setEspacios((prev) =>
      prev.map((esp) => {
        if (esp.mesa?.id === mesaSeleccionada.id) {
          return {
            ...esp,
            mesa: {
              ...esp.mesa,
              invitadosAsignados: [...esp.mesa.invitadosAsignados, invitado]
            }
          };
        }
        return esp;
      })
    );
    setShowModal(false);
  };

  const quitarInvitado = (idInvitado) => {
    setEspacios((prev) => {
      const nuevosEspacios = prev.map((esp) => {
        if (esp.mesa?.id === mesaSeleccionada.id) {
          const nuevaMesa = {
            ...esp.mesa,
            invitadosAsignados: esp.mesa.invitadosAsignados.filter(
              (inv) => inv._id !== idInvitado
            )
          };
          return { ...esp, mesa: nuevaMesa };
        }
        return esp;
      });
  
      // Actualizar mesaSeleccionada también
      const mesaActualizada = nuevosEspacios.find(
        (e) => e.mesa?.id === mesaSeleccionada.id
      )?.mesa;
      setMesaSeleccionada(mesaActualizada);
  
      return nuevosEspacios;
    });
  };
  
  

  const invitadosAsignadosIds = useMemo(() => {
    return espacios.flatMap((esp) =>
      esp.mesa?.invitadosAsignados?.map((i) => i._id) || []
    );
  }, [espacios]);

  const invitadosDisponibles = invitados.filter(
    (inv) => !invitadosAsignadosIds.includes(inv._id)
  );

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Mesas disponibles</h2>
        <div className="text-sm text-gray-700">
          Total de asientos: <strong>{
            espacios.reduce((acc, esp) => {
              if (esp.mesa?.tipo === "redonda") return acc + 10;
              if (esp.mesa?.tipo === "cuadrada") return acc + 12;
              return acc;
            }, 0)
          }</strong>
        </div>
      </div>

      <div className="flex gap-12 mb-8">
        {plantillas.map((mesa) => (
          <MesaDraggable key={mesa.id} id={mesa.id} tipo={mesa.tipo} />
        ))}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Espacio de acomodo</h2>
        <button
          className={`px-4 py-2 rounded ${modoAsignar ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          onClick={() => setModoAsignar(!modoAsignar)}
        >
          {modoAsignar ? "Asignar invitados" : "Acomodo de mesas"}
        </button>
      </div>

      <div
        className="grid px-6 py-2"
        style={{
          gridTemplateColumns: "repeat(11, auto)",
          justifyContent: "center",
          display: "grid"
        }}
      >
        {espacios.map((esp) => (
          <Espacio
            key={esp.id}
            id={esp.id}
            mesa={esp.mesa}
            onMesaClick={handleMesaClick}
            modoAsignar={modoAsignar}
          />
        ))}
      </div>

      <div className="flex justify-end pr-8 mb-12">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={guardarDistribucion}
        >
          Guardar distribución
        </button>
      </div>

      {showModal && mesaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              Asignar invitados - Mesa {mesaSeleccionada.id}
            </h3>

            <p className="text-sm text-gray-700 mb-4">
              Capacidad: <strong>{mesaSeleccionada.capacidad}</strong><br />
              Ocupados: <strong>{
                mesaSeleccionada.invitadosAsignados?.reduce((acc, inv) => {
                  return acc + 1 + (inv.acompanantes?.length || 0);
                }, 0) || 0
              }</strong>
            </p>

            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-1">Asignados:</h4>
              {mesaSeleccionada.invitadosAsignados?.length ? (
                mesaSeleccionada.invitadosAsignados.map((inv) => (
                  <div key={inv._id} className="flex justify-between items-center text-sm bg-gray-100 px-2 py-1 rounded mb-1">
                    <span>{inv.nombre}</span>
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
              {invitadosDisponibles.map((inv) => (
                <button
                  key={inv._id}
                  onClick={() => asignarInvitado(inv)}
                  className="block w-full text-left px-3 py-1 border rounded hover:bg-blue-100"
                >
                  {inv.nombre}
                </button>
              ))}
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
    </DndContext>
  );
}
