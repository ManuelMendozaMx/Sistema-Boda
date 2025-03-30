import React, { useEffect, useState } from "react";
import axios from "axios";

const Invitados = () => {
  const [invitados, setInvitados] = useState([]);
  const [nombre, setNombre] = useState("");
  const [boletosExtraAdultos, setBoletosExtraAdultos] = useState(0);
  const [boletosExtraNinos, setBoletosExtraNinos] = useState(0);
  const [acompanantes, setAcompanantes] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/invitados")
      .then((res) => setInvitados(res.data))
      .catch((err) => console.error("Error al obtener invitados:", err));
  }, []);

  const handleAgregarAcompanante = () => {
    setAcompanantes([...acompanantes, { nombre: "", esNino: false }]);
  };

  const handleAcompananteChange = (index, campo, valor) => {
    const nuevos = [...acompanantes];
    nuevos[index][campo] = valor;
    setAcompanantes(nuevos);
  };

  const handleEliminarAcompanante = (index) => {
    const nuevos = [...acompanantes];
    nuevos.splice(index, 1);
    setAcompanantes(nuevos);
  };

  const handleAgregarInvitado = () => {
    if (!nombre.trim()) {
      alert("El nombre es obligatorio");
      return;
    }

    const nuevoInvitado = {
      nombre: nombre.trim(),
      acompanantes,
      boletosExtraAdultos: Number(boletosExtraAdultos),
      boletosExtraNinos: Number(boletosExtraNinos),
    };

    axios
      .post("http://localhost:5000/api/invitados", nuevoInvitado)
      .then((res) => {
        setInvitados([...invitados, res.data]);
        setNombre("");
        setBoletosExtraAdultos(0);
        setBoletosExtraNinos(0);
        setAcompanantes([]);
      })
      .catch((err) => console.error("Error al agregar invitado:", err));
  };

  const handleEliminarInvitado = (id) => {
    if (!window.confirm("¿Eliminar este invitado?")) return;

    axios
      .delete(`http://localhost:5000/api/invitados/${id}`)
      .then(() => {
        setInvitados(invitados.filter((i) => i._id !== id));
      })
      .catch((err) => console.error("Error al eliminar:", err));
  };

  const iniciarEdicion = (invitado) => {
    setEditandoId(invitado._id);
    setNombre(invitado.nombre);
    setBoletosExtraAdultos(invitado.boletosExtraAdultos || 0);
    setBoletosExtraNinos(invitado.boletosExtraNinos || 0);
    setAcompanantes(invitado.acompanantes || []);
  };

  const guardarEdicion = () => {
    const invitadoActualizado = {
      nombre: nombre.trim(),
      acompanantes,
      boletosExtraAdultos: Number(boletosExtraAdultos),
      boletosExtraNinos: Number(boletosExtraNinos),
    };

    axios
      .put(`http://localhost:5000/api/invitados/${editandoId}`, invitadoActualizado)
      .then((res) => {
        setInvitados(invitados.map((i) => (i._id === editandoId ? res.data : i)));
        cancelarEdicion();
      })
      .catch((err) => console.error("Error al editar:", err));
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre("");
    setBoletosExtraAdultos(0);
    setBoletosExtraNinos(0);
    setAcompanantes([]);
  };

  const totalAdultos = invitados.reduce(
    (acc, inv) =>
      acc +
      1 + // El invitado principal
      inv.acompanantes.filter((a) => !a.esNino).length +
      (inv.boletosExtraAdultos || 0),
    0
  );

  const totalNinos = invitados.reduce(
    (acc, inv) =>
      acc + inv.acompanantes.filter((a) => a.esNino).length + (inv.boletosExtraNinos || 0),
    0
  );

  const totalGeneral = totalAdultos + totalNinos;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Encabezado y resumen */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          {editandoId ? "Editar Invitado" : "Agregar Invitado"}
        </h2>
        <div className="flex gap-4">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center gap-2 shadow">
            <span className="text-sm font-medium">Adultos: {totalAdultos}</span>
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center gap-2 shadow">
            <span className="text-sm font-medium">Niños: {totalNinos}</span>
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2 shadow">
            <span className="text-sm font-medium">Total: {totalGeneral}</span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <input
          type="text"
          placeholder="Nombre del invitado"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full border p-2 rounded"
        />

        {/* Acompañantes */}
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Acompañantes</h3>
          {acompanantes.map((ac, index) => (
            <div key={index} className="flex gap-2 items-center mb-2">
              <input
                type="text"
                placeholder="Nombre"
                value={ac.nombre}
                onChange={(e) => handleAcompananteChange(index, "nombre", e.target.value)}
                className="flex-1 border p-2 rounded"
              />
              <label className="text-sm flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={ac.esNino}
                  onChange={(e) => handleAcompananteChange(index, "esNino", e.target.checked)}
                />
                Niño
              </label>
              <button
                onClick={() => handleEliminarAcompanante(index)}
                className="text-red-600 hover:underline text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            onClick={handleAgregarAcompanante}
            className="text-blue-600 hover:underline text-sm mt-1"
          >
            + Agregar Acompañante
          </button>
        </div>

        {/* Boletos extra */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Boletos extra (adultos)</label>
            <input
              type="number"
              value={boletosExtraAdultos}
              onChange={(e) => setBoletosExtraAdultos(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Boletos extra (niños)</label>
            <input
              type="number"
              value={boletosExtraNinos}
              onChange={(e) => setBoletosExtraNinos(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        {/* Botones */}
        {editandoId ? (
          <div className="flex gap-4">
            <button
              onClick={guardarEdicion}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Guardar Cambios
            </button>
            <button
              onClick={cancelarEdicion}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={handleAgregarInvitado}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Agregar Invitado
          </button>
        )}
      </div>

      {/* Lista de invitados */}
      <h2 className="text-2xl font-semibold mt-10 mb-4">Lista de Invitados</h2>
      <ul className="space-y-4">
        {invitados.map((inv) => {
          const adultos = 1 + inv.acompanantes.filter((a) => !a.esNino).length + (inv.boletosExtraAdultos || 0);
          const ninos = inv.acompanantes.filter((a) => a.esNino).length + (inv.boletosExtraNinos || 0);
          return (
            <li key={inv._id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between space-x-6">
              {/* Nombre y detalles del invitado */}
              <div className="flex-1">
                <p className="font-bold text-lg">{inv.nombre}</p>
                <ul className="ml-4 text-sm text-gray-700 mt-2">
                  {inv.acompanantes?.map((a, idx) => (
                    <li key={idx}>
                      - {a.nombre} ({a.esNino ? "niño" : "adulto"})
                    </li>
                  ))}
                </ul>
                {(inv.boletosExtraAdultos > 0 || inv.boletosExtraNinos > 0) && (
                  <p className="text-sm mt-1 text-gray-600">
                    + {inv.boletosExtraAdultos} boletos adultos, {inv.boletosExtraNinos} niños
                  </p>
                )}
              </div>

              {/* Total de adultos y niños */}
              <div className="text-sm text-gray-800 font-medium flex flex-col items-end justify-between">
                <p>Total: {adultos} adultos, {ninos} niños</p>
                <div className="mt-3 flex gap-4 text-sm">
                  <button
                    onClick={() => iniciarEdicion(inv)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminarInvitado(inv._id)}
                    className="text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Invitados;
