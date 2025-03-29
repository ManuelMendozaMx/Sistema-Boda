import React, { useEffect, useState } from "react";
import axios from "axios";
const Gastos = () => {
  const [gastos, setGastos] = useState([]);
  const [nuevoGasto, setNuevoGasto] = useState({ descripcion: "", monto: "" });
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/gastos")
      .then((response) => setGastos(response.data))
      .catch((error) => console.error("Error al obtener gastos", error));
  }, []);
  const handleChange = (e) => {
    setNuevoGasto({ ...nuevoGasto, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/gastos", {
        descripcion: nuevoGasto.descripcion,
        monto: parseFloat(nuevoGasto.monto),
      })
      .then((response) => {
        setGastos([...gastos, response.data]);
        setNuevoGasto({ descripcion: "", monto: "" });
      })
      .catch((error) => console.error("Error al agregar gasto", error));
  };
  return (
    <div>
      <h2>Lista de Gastos</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={nuevoGasto.descripcion}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="monto"
          placeholder="Monto"
          value={nuevoGasto.monto}
          onChange={handleChange}
          required
        />
        <button type="submit">Agregar Gasto</button>
      </form>
      <ul>
        {gastos.map((gasto) => (
          <li key={gasto._id}>{gasto.descripcion} - </li>
        ))}
      </ul>
    </div>
  );
};
export default Gastos;
