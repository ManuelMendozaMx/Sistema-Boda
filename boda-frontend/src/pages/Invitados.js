import React, { useEffect, useState } from "react";
import axios from "axios";

const Invitados = () => {
  const [invitados, setInvitados] = useState([]);
  const [nombre, setNombre] = useState("");
  const [boletosExtraAdultos, setBoletosExtraAdultos] = useState(0);
  const [boletosExtraNinos, setBoletosExtraNinos] = useState(0);
  const [acompanantes, setAcompanantes] = useState([]);
  const [relacionarCon, setRelacionarCon] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Funciones para manejar acompañantes
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

  // Funciones para relaciones
  const handleRelacionChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setRelacionarCon(selected);
  };

  // Funciones CRUD
  const fetchInvitados = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/api/invitados")
      .then((res) => {
        setInvitados(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener invitados:", err);
        setIsLoading(false);
      });
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
      relacionarCon
    };

    axios
      .post("http://localhost:5000/api/invitados", nuevoInvitado)
      .then((res) => {
        setInvitados([...invitados, res.data]);
        resetForm();
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

  // Funciones para edición
  const iniciarEdicion = (invitado) => {
    setEditandoId(invitado._id);
    setNombre(invitado.nombre);
    setBoletosExtraAdultos(invitado.boletosExtraAdultos || 0);
    setBoletosExtraNinos(invitado.boletosExtraNinos || 0);
    setAcompanantes(invitado.acompanantes || []);
    setRelacionarCon(invitado.relacionarCon || []);
  };

  const guardarEdicion = () => {
    const invitadoActualizado = {
      nombre: nombre.trim(),
      acompanantes,
      boletosExtraAdultos: Number(boletosExtraAdultos),
      boletosExtraNinos: Number(boletosExtraNinos),
      relacionarCon
    };

    axios
      .put(`http://localhost:5000/api/invitados/${editandoId}`, invitadoActualizado)
      .then((res) => {
        setInvitados(invitados.map((i) => (i._id === editandoId ? res.data : i)));
        cancelarEdicion();
      })
      .catch((err) => console.error("Error al editar:", err));
  };

  // Funciones auxiliares
  const resetForm = () => {
    setNombre("");
    setBoletosExtraAdultos(0);
    setBoletosExtraNinos(0);
    setAcompanantes([]);
    setRelacionarCon([]);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    resetForm();
  };

  // Cálculos de totales
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

  useEffect(() => {
    fetchInvitados();
  }, []);
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Encabezado con estadísticas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Invitados</h1>
          <p className="text-gray-600 mt-1">Organiza la lista de invitados para tu evento</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-xl shadow-lg flex flex-col items-center">
            <span className="text-sm font-medium">Adultos</span>
            <span className="text-2xl font-bold">{totalAdultos}</span>
          </div>
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-5 py-3 rounded-xl shadow-lg flex flex-col items-center">
            <span className="text-sm font-medium">Niños</span>
            <span className="text-2xl font-bold">{totalNinos}</span>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex flex-col items-center">
            <span className="text-sm font-medium">Total</span>
            <span className="text-2xl font-bold">{totalGeneral}</span>
          </div>
        </div>
      </div>

      {/* Formulario en tarjeta */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            {editandoId ? "✏️ Editar Invitado" : "➕ Agregar Nuevo Invitado"}
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Campo nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del invitado</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Acompañantes */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Acompañantes</h3>
              <button
                onClick={handleAgregarAcompanante}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar
              </button>
            </div>
            
            {acompanantes.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No hay acompañantes agregados</p>
            ) : (
              <div className="space-y-3">
                {acompanantes.map((ac, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Nombre del acompañante"
                      value={ac.nombre}
                      onChange={(e) => handleAcompananteChange(index, "nombre", e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={ac.esNino}
                        onChange={(e) => handleAcompananteChange(index, "esNino", e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Niño</span>
                    </label>
                    <button
                      onClick={() => handleEliminarAcompanante(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boletos extra */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boletos extra adultos</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={boletosExtraAdultos}
                  onChange={(e) => setBoletosExtraAdultos(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">🎫</span>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Boletos extra niños</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={boletosExtraNinos}
                  onChange={(e) => setBoletosExtraNinos(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">🧒</span>
                </div>
              </div>
            </div>
          </div>

          {/* Relaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relacionar con otros invitados
              <span className="text-xs text-gray-500 ml-1">(Mantén Ctrl para seleccionar múltiples)</span>
            </label>
            <select 
              multiple 
              value={relacionarCon}
              onChange={handleRelacionChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md h-auto min-h-[120px]"
            >
              {invitados
                .filter(inv => !editandoId || inv._id !== editandoId)
                .map(inv => (
                  <option key={inv._id} value={inv._id} className="py-1">
                    {inv.nombre} ({inv.acompanantes.length + 1} personas)
                  </option>
                ))}
            </select>
            {relacionarCon.length > 0 && (
              <p className="mt-1 text-sm text-indigo-600">
                Seleccionados: {relacionarCon.length} invitado(s)
              </p>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {editandoId ? (
              <>
                <button
                  onClick={guardarEdicion}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Cambios
                </button>
                <button
                  onClick={cancelarEdicion}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={handleAgregarInvitado}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Invitado
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de invitados */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Lista de Invitados</h2>
          <div className="text-sm text-gray-500">
            Mostrando {invitados.length} invitado(s)
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : invitados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay invitados aún</h3>
            <p className="mt-1 text-gray-500">Comienza agregando tu primer invitado usando el formulario superior</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitados.map((inv) => {
              const adultos = 1 + inv.acompanantes.filter((a) => !a.esNino).length + (inv.boletosExtraAdultos || 0);
              const ninos = inv.acompanantes.filter((a) => a.esNino).length + (inv.boletosExtraNinos || 0);
              
              const relacionados = inv.relacionarCon?.map(relId => {
                const relInvitado = invitados.find(i => i._id === relId);
                return relInvitado ? relInvitado.nombre : "Invitado eliminado";
              });

              return (
                <div key={inv._id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      {/* Información principal */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">{inv.nombre}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {adultos + ninos} personas
                          </span>
                        </div>
                        
                        {inv.acompanantes.length > 0 && (
                          <div className="mt-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Acompañantes:</h4>
                            <ul className="ml-4 space-y-1">
                              {inv.acompanantes.map((a, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <span className={`inline-block h-2 w-2 rounded-full ${a.esNino ? 'bg-amber-400' : 'bg-blue-500'}`}></span>
                                  <span className="text-sm text-gray-600">
                                    {a.nombre} <span className="text-xs text-gray-400">({a.esNino ? 'niño' : 'adulto'})</span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {(inv.boletosExtraAdultos > 0 || inv.boletosExtraNinos > 0) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {inv.boletosExtraAdultos > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                +{inv.boletosExtraAdultos} adulto(s) extra
                              </span>
                            )}
                            {inv.boletosExtraNinos > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                +{inv.boletosExtraNinos} niño(s) extra
                              </span>
                            )}
                          </div>
                        )}
                        
                        {relacionados?.length > 0 && (
                          <div className="mt-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">Relacionado con:</h4>
                            <div className="flex flex-wrap gap-1">
                              {relacionados.map((nombre, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  {nombre}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Detalles y acciones */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {adultos} adultos
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {ninos} niños
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => iniciarEdicion(inv)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminarInvitado(inv._id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Invitados;