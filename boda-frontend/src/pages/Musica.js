import React, { useEffect, useState } from "react";
import axios from "axios";

const Musica = () => {
  const [canciones, setCanciones] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/musica")
      .then((response) => setCanciones(response.data))
      .catch((error) => console.error("Error al obtener música", error));
  }, []);

  return (
    <div>
      <h2>Lista de Canciones</h2>
      <ul>
        {canciones.map((cancion) => (
          <li key={cancion._id}>
            {cancion.titulo} - {cancion.artista}
            <br />
            <a href={cancion.enlace} target="_blank" rel="noopener noreferrer">
              Escuchar
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Musica;
