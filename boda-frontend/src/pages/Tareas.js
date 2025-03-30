import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [filtros, setFiltros] = useState({
    estado: '',
    categoria: '',
    prioridad: '',
    equipo: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [formulario, setFormulario] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    prioridad: 'media',
    estado: 'pendiente',
    fechaLimite: '',
    equipo: '',
    progreso: 0,
    presupuestoEstimado: '',
    gastoReal: '',
    proveedor: { nombre: '', contacto: '' },
    notas: '',
    notificar: false,
    subtareas: []
  });
  const [subtareaTemporal, setSubtareaTemporal] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tareasRes = await axios.get('http://localhost:5000/api/tareas');
        setTareas(tareasRes.data);
      } catch (error) {
        console.error("Error al obtener tareas", error);
      }
    };
    fetchData();
  }, []);

  const manejarCambioFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const manejarCambioFormulario = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('proveedor.')) {
      const field = name.split('.')[1];
      setFormulario(prev => ({
        ...prev,
        proveedor: {
          ...prev.proveedor,
          [field]: value
        }
      }));
    } else {
      setFormulario(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const agregarSubtarea = () => {
    if (!subtareaTemporal.trim()) return;
    
    setFormulario(prev => ({
      ...prev,
      subtareas: [
        ...(prev.subtareas || []),
        { descripcion: subtareaTemporal, completada: false }
      ]
    }));
    
    setSubtareaTemporal('');
  };

  const eliminarSubtarea = (index) => {
    setFormulario(prev => ({
      ...prev,
      subtareas: prev.subtareas.filter((_, i) => i !== index)
    }));
  };

  const enviarFormulario = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formulario,
        progreso: calcularProgreso(formulario.subtareas || []),
        fechaLimite: formulario.fechaLimite || undefined,
        presupuestoEstimado: formulario.presupuestoEstimado ? Number(formulario.presupuestoEstimado) : undefined,
        gastoReal: formulario.gastoReal ? Number(formulario.gastoReal) : undefined
      };

      if (editandoId) {
        const response = await axios.put(`http://localhost:5000/api/tareas/${editandoId}`, data);
        setTareas(tareas.map(t => t._id === editandoId ? response.data : t));
      } else {
        const response = await axios.post("http://localhost:5000/api/tareas", data);
        setTareas([...tareas, response.data]);
      }

      resetFormulario();
    } catch (error) {
      console.error("Error al guardar tarea", error.response?.data || error.message);
    }
  };

  const resetFormulario = () => {
    setFormulario({
      titulo: '',
      descripcion: '',
      categoria: '',
      prioridad: 'media',
      estado: 'pendiente',
      fechaLimite: '',
      equipo: '',
      progreso: 0,
      presupuestoEstimado: '',
      gastoReal: '',
      proveedor: { nombre: '', contacto: '' },
      notas: '',
      notificar: false,
      subtareas: []
    });
    setEditandoId(null);
    setMostrarFormulario(false);
  };

  const editarTarea = (tarea) => {
    setFormulario({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion || '',
      categoria: tarea.categoria,
      prioridad: tarea.prioridad,
      estado: tarea.estado,
      fechaLimite: tarea.fechaLimite ? format(parseISO(tarea.fechaLimite), 'yyyy-MM-dd') : '',
      equipo: tarea.equipo || '',
      progreso: tarea.progreso || 0,
      presupuestoEstimado: tarea.presupuestoEstimado?.toString() || '',
      gastoReal: tarea.gastoReal?.toString() || '',
      proveedor: tarea.proveedor || { nombre: '', contacto: '' },
      notas: tarea.notas || '',
      notificar: tarea.notificar || false,
      subtareas: tarea.subtareas || []
    });
    setEditandoId(tarea._id);
    setMostrarFormulario(true);
  };

  const eliminarTarea = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tareas/${id}`);
      setTareas(tareas.filter(t => t._id !== id));
    } catch (error) {
      console.error("Error al eliminar tarea", error);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/tareas/${id}`, { estado: nuevoEstado });
      setTareas(tareas.map(t => t._id === id ? response.data : t));
    } catch (error) {
      console.error("Error al cambiar estado", error);
    }
  };

  const calcularProgreso = (subtareas) => {
    if (!subtareas || subtareas.length === 0) return 0;
    const completadas = subtareas.filter(st => st.completada).length;
    return Math.round((completadas / subtareas.length) * 100);
  };

  const prioridadEstilos = {
    alta: 'bg-red-100 border-red-500 text-red-800',
    media: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    baja: 'bg-green-100 border-green-500 text-green-800'
  };

  const estadoEstilos = {
    pendiente: 'bg-gray-100 text-gray-800',
    en_progreso: 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800'
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return format(parseISO(fecha), 'PPP', { locale: es });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Gestión de Tareas para la Boda</h1>
      
      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Filtrar Tareas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select 
            name="estado" 
            value={filtros.estado}
            onChange={manejarCambioFiltro}
            className="p-2 border rounded"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
          </select>
          
          <select 
            name="categoria" 
            value={filtros.categoria}
            onChange={manejarCambioFiltro}
            className="p-2 border rounded"
          >
            <option value="">Todas las categorías</option>
            <option value="organización">Organización</option>
            <option value="invitados">Invitados</option>
            <option value="ceremonia">Ceremonia</option>
            <option value="banquete">Banquete</option>
            <option value="vestuario">Vestuario</option>
            <option value="decoración">Decoración</option>
            <option value="otros">Otros</option>
          </select>
          
          <select 
            name="prioridad" 
            value={filtros.prioridad}
            onChange={manejarCambioFiltro}
            className="p-2 border rounded"
          >
            <option value="">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          
          <select 
            name="equipo" 
            value={filtros.equipo}
            onChange={manejarCambioFiltro}
            className="p-2 border rounded"
          >
            <option value="">Todos los equipos</option>
            <option value="novios">Novios</option>
            <option value="familia_novia">Familia Novia</option>
            <option value="familia_novio">Familia Novio</option>
            <option value="amigos">Amigos</option>
            <option value="proveedores">Proveedores</option>
          </select>
        </div>
      </div>
      
      {/* Botón para agregar nueva tarea */}
      <button 
        onClick={() => {
          setMostrarFormulario(true);
          setEditandoId(null);
        }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded mb-6"
      >
        + Nueva Tarea
      </button>
      
      {/* Formulario de tarea */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editandoId ? 'Editar Tarea' : 'Crear Nueva Tarea'}
            </h2>
            
            <form onSubmit={enviarFormulario}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna izquierda */}
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Título*</label>
                    <input
                      type="text"
                      name="titulo"
                      value={formulario.titulo}
                      onChange={manejarCambioFormulario}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formulario.descripcion}
                      onChange={manejarCambioFormulario}
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Categoría*</label>
                    <select
                      name="categoria"
                      value={formulario.categoria}
                      onChange={manejarCambioFormulario}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="organización">Organización</option>
                      <option value="invitados">Invitados</option>
                      <option value="ceremonia">Ceremonia</option>
                      <option value="banquete">Banquete</option>
                      <option value="vestuario">Vestuario</option>
                      <option value="decoración">Decoración</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Prioridad</label>
                      <select
                        name="prioridad"
                        value={formulario.prioridad}
                        onChange={manejarCambioFormulario}
                        className="w-full p-2 border rounded"
                      >
                        <option value="alta">Alta</option>
                        <option value="media">Media</option>
                        <option value="baja">Baja</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-2">Estado</label>
                      <select
                        name="estado"
                        value={formulario.estado}
                        onChange={manejarCambioFormulario}
                        className="w-full p-2 border rounded"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_progreso">En progreso</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Fecha Límite</label>
                    <input
                      type="date"
                      name="fechaLimite"
                      value={formulario.fechaLimite}
                      onChange={manejarCambioFormulario}
                      className="w-full p-2 border rounded"
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Equipo</label>
                    <select
                      name="equipo"
                      value={formulario.equipo}
                      onChange={manejarCambioFormulario}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Sin asignar</option>
                      <option value="novios">Novios</option>
                      <option value="familia_novia">Familia Novia</option>
                      <option value="familia_novio">Familia Novio</option>
                      <option value="amigos">Amigos</option>
                      <option value="proveedores">Proveedores</option>
                    </select>
                  </div>
                </div>
                
                {/* Columna derecha */}
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Presupuesto Estimado</label>
                    <input
                      type="number"
                      name="presupuestoEstimado"
                      value={formulario.presupuestoEstimado}
                      onChange={manejarCambioFormulario}
                      className="w-full p-2 border rounded"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Gasto Real</label>
                    <input
                      type="number"
                      name="gastoReal"
                      value={formulario.gastoReal}
                      onChange={manejarCambioFormulario}
                      className="w-full p-2 border rounded"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Proveedor</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="proveedor.nombre"
                        value={formulario.proveedor.nombre}
                        onChange={manejarCambioFormulario}
                        className="w-full p-2 border rounded"
                        placeholder="Nombre del proveedor"
                      />
                      <input
                        type="text"
                        name="proveedor.contacto"
                        value={formulario.proveedor.contacto}
                        onChange={manejarCambioFormulario}
                        className="w-full p-2 border rounded"
                        placeholder="Contacto del proveedor"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Notas</label>
                    <textarea
                      name="notas"
                      value={formulario.notas}
                      onChange={manejarCambioFormulario}
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                  </div>
                  
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      name="notificar"
                      checked={formulario.notificar}
                      onChange={manejarCambioFormulario}
                      className="mr-2"
                    />
                    <label className="text-gray-700">Notificar recordatorios</label>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Subtareas</label>
                    <div className="flex mb-2">
                      <input
                        type="text"
                        value={subtareaTemporal}
                        onChange={(e) => setSubtareaTemporal(e.target.value)}
                        className="flex-1 p-2 border rounded-l"
                        placeholder="Nueva subtarea"
                      />
                      <button
                        type="button"
                        onClick={agregarSubtarea}
                        className="bg-indigo-600 text-white px-3 rounded-r"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formulario.subtareas?.map((subtarea, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span>{subtarea.descripcion}</span>
                          <button
                            type="button"
                            onClick={() => eliminarSubtarea(index)}
                            className="text-red-500"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={resetFormulario}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                >
                  {editandoId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Lista de tareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tareas.map(tarea => (
          <div 
            key={tarea._id} 
            className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${prioridadEstilos[tarea.prioridad]}`}
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{tarea.titulo}</h3>
                <div className="flex space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${estadoEstilos[tarea.estado]}`}>
                    {tarea.estado.replace('_', ' ')}
                  </span>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                    {tarea.categoria}
                  </span>
                </div>
              </div>
              
              {tarea.descripcion && (
                <p className="text-gray-600 mb-3 text-sm">{tarea.descripcion}</p>
              )}
              
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatearFecha(tarea.fechaLimite)}
                </div>
                
                {tarea.equipo && (
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {tarea.equipo.replace('_', ' ')}
                  </div>
                )}
                
                {tarea.proveedor?.nombre && (
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {tarea.proveedor.nombre}
                  </div>
                )}
                
                {(tarea.presupuestoEstimado || tarea.gastoReal) && (
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tarea.presupuestoEstimado && `Presupuesto: $${tarea.presupuestoEstimado}`}
                    {tarea.gastoReal && ` | Real: $${tarea.gastoReal}`}
                  </div>
                )}
              </div>
              
              {/* Subtareas y progreso */}
              {tarea.subtareas?.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-1">Subtareas:</div>
                  <div className="space-y-1 mb-2">
                    {tarea.subtareas.slice(0, 3).map((st, i) => (
                      <div key={i} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={st.completada}
                          onChange={() => {}}
                          className="mr-2"
                          disabled
                        />
                        <span className={`text-sm ${st.completada ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                          {st.descripcion}
                        </span>
                      </div>
                    ))}
                    {tarea.subtareas.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{tarea.subtareas.length - 3} más...
                      </div>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${tarea.progreso || 0}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-right mt-1">{tarea.progreso}% completado</div>
                </div>
              )}
              
              {/* Notas */}
              {tarea.notas && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-1">Notas:</div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{tarea.notas}</p>
                </div>
              )}
              
              {/* Acciones */}
              <div className="flex justify-between items-center border-t pt-3">
                <div className="space-x-2">
                  <button 
                    onClick={() => editarTarea(tarea)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => eliminarTarea(tarea._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
                
                <select
                  value={tarea.estado}
                  onChange={(e) => cambiarEstado(tarea._id, e.target.value)}
                  className="text-xs p-1 border rounded"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {tareas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay tareas que coincidan con los filtros seleccionados</p>
        </div>
      )}
    </div>
  );
};

export default Tareas;