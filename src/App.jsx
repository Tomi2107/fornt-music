import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = "https://back-music-3izh.onrender.com/api/canciones";
const API_UPLOAD_URL = "https://back-music-3izh.onrender.com/api/songs/storage";

function App() {
  const [songs, setSongs] = useState([]);
  const [newSongTitle, setNewSongTitle] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const res = await fetch(API_BASE_URL);
      if (!res.ok) throw new Error("Error al cargar canciones.");
      const data = await res.json();
      setSongs(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setError("Debes seleccionar un archivo.");
      return;
    }
    
    const validFormats = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac"];
    if (!validFormats.includes(selectedFile.type)) {
      setError("Formato no permitido. Solo MP3, WAV, OGG, AAC y FLAC.");
      setFile(null);
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("El archivo es demasiado grande (Máx: 10MB).");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const addSong = async () => {
    if (!file || !newSongTitle.trim()) {
      setError("Debes ingresar un título y seleccionar un archivo.");
      return;
    }

    const formData = new FormData();
    formData.append("title", newSongTitle);
    formData.append("file", file);

    try {
      const response = await fetch(API_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorMsg = await response.json();
        setError(errorMsg.error || "Error desconocido.");
        return;
      }
      
      await fetchSongs(); // 🔥 Recargar la lista 🔥
      setNewSongTitle("");
      setFile(null);
      alert("Canción subida con éxito");
    } catch (error) {
      console.error("Error:", error);
      setError("Hubo un problema al subir la canción.");
    }
  };

  const deleteSong = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error("Error al eliminar la canción.");
      }

      await fetchSongs(); // 🔥 Recargar la lista 🔥
      alert("Canción eliminada con éxito.");
    } catch (error) {
      console.error("Error:", error);
      setError("No se pudo eliminar la canción.");
    }
  };

  return (
    <div className="App">
      <h1>Mi Música</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="text"
        value={newSongTitle}
        onChange={(e) => setNewSongTitle(e.target.value)}
        placeholder="Título de la canción"
      />
      
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      
      <button onClick={addSong}>Subir Canción</button>

      <ul>
        {songs.map((song) => (
          <li key={song.id}>
            <strong>{song.title}</strong>
            <button onClick={() => new Audio(song.url).play()}>Reproducir</button>
            <button onClick={() => deleteSong(song.id)} style={{ marginLeft: "10px", color: "red" }}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
