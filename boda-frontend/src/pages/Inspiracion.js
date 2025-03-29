import React, { useEffect, useState } from "react";
import axios from "axios";

const Inspiracion = () => {
  const [inspiraciones, setInspiraciones] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/inspiracion")
      .then((response) => setInspiraciones(response.data))
      .catch((error) => console.error("Error al obtener inspiración", error));
  }, []);

  return (
    <div>
      <h2>Inspiración</h2>
      <ul>
        {inspiraciones.map((insp) => (
          <li key={insp._id}>
            <strong>{insp.titulo}</strong>
            <br />
            <img src={insp.imagenUrl} alt={insp.titulo} width="200px" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Inspiracion;
