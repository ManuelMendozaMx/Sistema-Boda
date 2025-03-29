import React, { useEffect, useState } from "react";
import axios from "axios";

const Documentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [nuevoDocumento, setNuevoDocumento] = useState({ titulo: "" });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/documentos")
      .then((response) => setDocumentos(response.data))
      .catch((error) => console.error("Error al obtener documentos", error));
  }, []);

  const handleChange = (e) => {
    setNuevoDocumento({ ...nuevoDocumento, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/api/documentos", nuevoDocumento)
      .then((response) => {
        setDocumentos([...documentos, response.data]);
        setNuevoDocumento({ titulo: "" });
      })
      .catch((error) => console.error("Error al agregar documento", error));
  };

  return (
    <div>
      <h2>Lista de Documentos</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="titulo"
          placeholder="Título"
          value={nuevoDocumento.titulo}
          onChange={handleChange}
          required
        />
        <button type="submit">Agregar Documento</button>
      </form>
      <ul>
        {documentos.map((doc) => (
          <li key={doc._id}>
            {doc.titulo} - {new Date(doc.fecha).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Documentos;
