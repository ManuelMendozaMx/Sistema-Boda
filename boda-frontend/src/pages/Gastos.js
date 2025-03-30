import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiPlus,
  FiDollarSign,
  FiCalendar,
  FiTag,
  FiCheck,
  FiClock,
  FiPercent,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiUser,
  FiPhone,
} from "react-icons/fi";

const Gastos = () => {
  const [gastos, setGastos] = useState([]);
  const [nuevoGasto, setNuevoGasto] = useState({
    descripcion: "",
    monto: "",
    categoria: "otros",
    fecha: new Date().toISOString().split("T")[0],
    montoPagado: "",
    proveedor: {
      nombre: "",
      contacto: ""
    },
    estadoPago: "pendiente"
  });
  const [editingId, setEditingId] = useState(null);
  const [editGasto, setEditGasto] = useState({});
  const [activeTab, setActiveTab] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState(null);

  // Categorías con colores e iconos
  const categorias = [
    {
      value: "banquete",
      label: "Banquete",
      color: "bg-blue-100 text-blue-800",
      icon: <FiTag className="mr-1" />,
    },
    {
      value: "vestuario",
      label: "Vestuario",
      color: "bg-purple-100 text-purple-800",
      icon: <FiTag className="mr-1" />,
    },
    {
      value: "decoracion",
      label: "Decoración",
      color: "bg-pink-100 text-pink-800",
      icon: <FiTag className="mr-1" />,
    },
    {
      value: "fotografia",
      label: "Fotografía",
      color: "bg-yellow-100 text-yellow-800",
      icon: <FiTag className="mr-1" />,
    },
    {
      value: "musica",
      label: "Música",
      color: "bg-green-100 text-green-800",
      icon: <FiTag className="mr-1" />,
    },
    {
      value: "invitaciones",
      label: "Invitaciones",
      color: "bg-indigo-100 text-indigo-800",
      icon: <FiTag className="mr-1" />,
    },
    {
      value: "salon",
      label: "Salón",
      color: "bg-blue-100 text-blue-800",
      icon: <FiTag className="mr-1" />,
    },
    {
      value: "otros",
      label: "Otros",
      color: "bg-gray-100 text-gray-800",
      icon: <FiTag className="mr-1" />,
    },
  ];

  // Estados de pago
  const estadosPago = [
    { value: "pendiente", label: "Pendiente", color: "bg-red-100 text-red-800" },
    { value: "parcial", label: "Parcial", color: "bg-yellow-100 text-yellow-800" },
    { value: "pagado", label: "Pagado", color: "bg-green-100 text-green-800" },
  ];

  useEffect(() => {
    const fetchGastos = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/gastos");
        setGastos(response.data);
      } catch (error) {
        console.error("Error al obtener gastos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGastos();
  }, []);

  const handleChange = (e) => {
    if (e.target.name.startsWith("proveedor.")) {
      const field = e.target.name.split(".")[1];
      setNuevoGasto({
        ...nuevoGasto,
        proveedor: {
          ...nuevoGasto.proveedor,
          [field]: e.target.value
        }
      });
    } else {
      setNuevoGasto({ ...nuevoGasto, [e.target.name]: e.target.value });
    }
  };

  const handleEditChange = (e) => {
    if (e.target.name.startsWith("proveedor.")) {
      const field = e.target.name.split(".")[1];
      setEditGasto({
        ...editGasto,
        proveedor: {
          ...editGasto.proveedor,
          [field]: e.target.value
        }
      });
    } else {
      setEditGasto({ ...editGasto, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (parseFloat(nuevoGasto.montoPagado) > parseFloat(nuevoGasto.monto)) {
      alert("El monto pagado no puede ser mayor al monto total");
      return;
    }
  
    try {
      const gastoData = {
        ...nuevoGasto,
        monto: parseFloat(nuevoGasto.monto),
        montoPagado: parseFloat(nuevoGasto.montoPagado || 0),
        fecha: new Date(nuevoGasto.fecha)
      };

      const response = await axios.post("http://localhost:5000/api/gastos", gastoData);
      
      setGastos([...gastos, response.data]);
      setNuevoGasto({
        descripcion: "",
        monto: "",
        categoria: "otros",
        fecha: new Date().toISOString().split("T")[0],
        montoPagado: "",
        proveedor: { nombre: "", contacto: "" },
        estadoPago: "pendiente"
      });
    } catch (error) {
      console.error("Error al agregar gasto", error);
      alert(error.response?.data?.message || "Error al agregar gasto");
    }
  };

  const startEditing = (gasto) => {
    setEditingId(gasto._id);
    setEditGasto({
      descripcion: gasto.descripcion,
      monto: gasto.monto.toString(),
      categoria: gasto.categoria,
      fecha: new Date(gasto.fecha).toISOString().split("T")[0],
      montoPagado: gasto.montoPagado?.toString() || "0",
      proveedor: gasto.proveedor || { nombre: "", contacto: "" },
      estadoPago: gasto.estadoPago || "pendiente"
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditGasto({});
  };

  const saveEditedGasto = async (id) => {
    try {
      const gastoData = {
        ...editGasto,
        monto: parseFloat(editGasto.monto),
        montoPagado: parseFloat(editGasto.montoPagado || 0),
        fecha: new Date(editGasto.fecha)
      };

      const response = await axios.put(
        `http://localhost:5000/api/gastos/${id}`,
        gastoData
      );

      setGastos(gastos.map((g) => (g._id === id ? response.data : g)));
      setEditingId(null);
    } catch (error) {
      console.error("Error al actualizar gasto", error);
      alert(error.response?.data?.message || "Error al actualizar gasto");
    }
  };

  const confirmDelete = (gasto) => {
    setGastoToDelete(gasto);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/gastos/${gastoToDelete._id}`
      );
      setGastos(gastos.filter((g) => g._id !== gastoToDelete._id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error al eliminar gasto", error);
      alert("Error al eliminar gasto");
    }
  };

  const filteredGastos = gastos.filter(
    (gasto) => activeTab === "todos" || gasto.categoria === activeTab
  );

  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirmar eliminación</h3>
            <p className="mb-6">
              ¿Estás seguro de que quieres eliminar el gasto "
              {gastoToDelete?.descripcion}" por ${gastoToDelete?.monto}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
              >
                <FiTrash2 className="mr-2" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Gestión de Gastos
            </h1>
            <p className="text-gray-600">Controla todos tus gastos</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <FiDollarSign className="text-2xl text-green-500 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Total gastado</p>
                <p className="text-2xl font-bold">
                  ${totalGastos.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de gastos */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiPlus className="mr-2" /> Agregar nuevo gasto
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                name="descripcion"
                placeholder="Ej. Vestido de novia"
                value={nuevoGasto.descripcion}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="monto"
                  placeholder="0.00"
                  value={nuevoGasto.monto}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="categoria"
                value={nuevoGasto.categoria}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categorias.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de pago
              </label>
              <select
                name="estadoPago"
                value={nuevoGasto.estadoPago}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {estadosPago.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="date"
                  name="fecha"
                  value={nuevoGasto.fecha}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto Pagado
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="number"
                  name="montoPagado"
                  placeholder="0.00"
                  value={nuevoGasto.montoPagado}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor (Nombre)
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  name="proveedor.nombre"
                  placeholder="Nombre del proveedor"
                  value={nuevoGasto.proveedor.nombre}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor (Contacto)
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  name="proveedor.contacto"
                  placeholder="Teléfono/Email"
                  value={nuevoGasto.proveedor.contacto}
                  onChange={handleChange}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transition-all flex items-center"
              >
                <FiPlus className="mr-2" /> Agregar Gasto
              </button>
            </div>
          </form>
        </div>

        {/* Filtros y estadísticas */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("todos")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                activeTab === "todos"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveTab(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
                  activeTab === cat.value
                    ? `${cat.color
                        .replace("text", "bg")
                        .replace("bg-", "bg-")} text-white`
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">
              Mostrando{" "}
              <span className="font-bold">{filteredGastos.length}</span> de{" "}
              <span className="font-bold">{gastos.length}</span> gastos
            </p>
          </div>
        </div>

        {/* Lista de gastos */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Cargando gastos...</p>
            </div>
          ) : filteredGastos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No hay gastos registrados en esta categoría</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredGastos.map((gasto) => {
                const categoria =
                  categorias.find((c) => c.value === gasto.categoria) ||
                  categorias[categorias.length - 1];
                const estado =
                  estadosPago.find((e) => e.value === gasto.estadoPago) ||
                  estadosPago[0];
                const porcentajePagado = gasto.montoPagado
                  ? Math.round((gasto.montoPagado / gasto.monto) * 100)
                  : 0;

                return (
                  <div
                    key={gasto._id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    {editingId === gasto._id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <input
                              type="text"
                              name="descripcion"
                              value={editGasto.descripcion}
                              onChange={handleEditChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
                                $
                              </span>
                              <input
                                type="number"
                                name="monto"
                                value={editGasto.monto}
                                onChange={handleEditChange}
                                className="w-full p-2 pl-6 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div>
                            <select
                              name="categoria"
                              value={editGasto.categoria}
                              onChange={handleEditChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                              {categorias.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <select
                              name="estadoPago"
                              value={editGasto.estadoPago}
                              onChange={handleEditChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                              {estadosPago.map((est) => (
                                <option key={est.value} value={est.value}>
                                  {est.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <div className="relative">
                              <FiCalendar className="absolute left-2 top-2.5 text-gray-400" />
                              <input
                                type="date"
                                name="fecha"
                                value={editGasto.fecha}
                                onChange={handleEditChange}
                                className="w-full p-2 pl-8 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="relative">
                              <FiDollarSign className="absolute left-2 top-2.5 text-gray-400" />
                              <input
                                type="number"
                                name="montoPagado"
                                placeholder="Monto pagado"
                                value={editGasto.montoPagado}
                                onChange={handleEditChange}
                                className="w-full p-2 pl-8 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="relative">
                              <FiUser className="absolute left-2 top-2.5 text-gray-400" />
                              <input
                                type="text"
                                name="proveedor.nombre"
                                placeholder="Nombre del proveedor"
                                value={editGasto.proveedor?.nombre || ""}
                                onChange={handleEditChange}
                                className="w-full p-2 pl-8 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <div>
                            <div className="relative">
                              <FiPhone className="absolute left-2 top-2.5 text-gray-400" />
                              <input
                                type="text"
                                name="proveedor.contacto"
                                placeholder="Contacto del proveedor"
                                value={editGasto.proveedor?.contacto || ""}
                                onChange={handleEditChange}
                                className="w-full p-2 pl-8 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEditing}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg flex items-center hover:bg-gray-300 transition"
                          >
                            <FiX className="mr-2" /> Cancelar
                          </button>
                          <button
                            onClick={() => saveEditedGasto(gasto._id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 transition"
                          >
                            <FiSave className="mr-2" /> Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <span
                                className={`${categoria.color} text-xs px-2 py-1 rounded-full mr-2`}
                              >
                                {categoria.label}
                              </span>
                              <span
                                className={`${estado.color} text-xs px-2 py-1 rounded-full mr-2`}
                              >
                                {estado.label}
                              </span>
                              <span className="text-gray-500 text-sm">
                                {new Date(gasto.fecha).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="font-medium text-gray-800">
                              {gasto.descripcion}
                            </h3>
                            {gasto.proveedor?.nombre && (
                              <div className="mt-1 text-sm text-gray-600">
                                <p>
                                  <span className="font-medium">Proveedor:</span>{" "}
                                  {gasto.proveedor.nombre}
                                  {gasto.proveedor.contacto && ` (${gasto.proveedor.contacto})`}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-lg font-bold">
                              ${gasto.monto.toLocaleString()}
                            </span>

                            <div className="flex items-center mt-1">
                              {porcentajePagado === 100 ? (
                                <span className="flex items-center text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  <FiCheck className="mr-1" /> Pagado completo
                                </span>
                              ) : porcentajePagado > 0 ? (
                                <span className="flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  <FiPercent className="mr-1" />{" "}
                                  {porcentajePagado}% pagado
                                </span>
                              ) : (
                                <span className="flex items-center text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                  <FiClock className="mr-1" /> Pendiente
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {porcentajePagado < 100 && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${porcentajePagado}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            onClick={() => startEditing(gasto)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Editar"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => confirmDelete(gasto)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Eliminar"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gastos;