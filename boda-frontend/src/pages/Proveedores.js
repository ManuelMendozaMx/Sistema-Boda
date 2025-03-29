import React, { useEffect, useState } from "react";
import axios from "axios";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: "",
    servicio: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/proveedores")
      .then((response) => setProveedores(response.data))
      .catch((error) => console.error("Error al obtener proveedores", error));
  }, []);

  const handleChange = (e) => {
    setNuevoProveedor({ ...nuevoProveedor, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/proveedores", nuevoProveedor)
      .then((response) => {
        setProveedores([...proveedores, response.data]);
        setNuevoProveedor({ nombre: "", servicio: "" });
      })
      .catch((error) => console.error("Error al agregar proveedor", error));
  };

  return (
    <div>
      <h2>Lista de Proveedores</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del proveedor"
          value={nuevoProveedor.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="servicio"
          placeholder="Servicio"
          value={nuevoProveedor.servicio}
          onChange={handleChange}
          required
        />
        <button type="submit">Agregar Proveedor</button>
      </form>
      <ul>
        {proveedores.map((proveedor) => (
          <li key={proveedor._id}>
            {proveedor.nombre} - {proveedor.servicio}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Proveedores;
