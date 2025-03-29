import React, { useEffect, useState } from "react";
import axios from "axios";

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tareas")
      .then((response) => setTareas(response.data))
      .catch((error) => console.error("Error al obtener tareas", error));
  }, []);

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/api/tareas/${id}`)
      .then(() => setTareas(tareas.filter((tar) => tar._id !== id)))
      .catch((error) => console.error("Error al eliminar tarea", error));
  };

  const handleEdit = (id) => {
    const nuevoTitulo = prompt("Nuevo título:");
    if (!nuevoTitulo) return;
    axios
      .put(`http://localhost:5000/api/tareas/${id}`, { titulo: nuevoTitulo })
      .then((response) =>
        setTareas(tareas.map((tar) => (tar._id === id ? response.data : tar)))
      )
      .catch((error) => console.error("Error al editar tarea", error));
  };

  const handleAdd = () => {
    if (!nuevaTarea.trim()) return;
    axios
      .post("http://localhost:5000/api/tareas", { titulo: nuevaTarea })
      .then((response) => setTareas([...tareas, response.data]))
      .catch((error) => console.error("Error al agregar tarea", error));
    setNuevaTarea("");
  };

  return (
    <div>
      <h2>Lista de Tareas</h2>
      <ul>
        {tareas.map((tarea) => (
          <li key={tarea._id}>
            {tarea.titulo} - {tarea.completada ? "✅" : "❌"}
            <button onClick={() => handleEdit(tarea._id)}>Editar</button>
            <button onClick={() => handleDelete(tarea._id)}>Eliminar</button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={nuevaTarea}
        onChange={(e) => setNuevaTarea(e.target.value)}
        placeholder="Nueva tarea"
      />
      <button onClick={handleAdd}>Agregar</button>
    </div>
  );
};

export default Tareas;
