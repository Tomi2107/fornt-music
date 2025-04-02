import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = "https://mi-backend.onrender.com/api/songs"; // Cambia por la URL de tu backend

function App() {
  const [songs, setSongs] = useState([]);
  const [newSongTitle, setNewSongTitle] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(setSongs);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setError("Debes seleccionar un archivo.");
      return;
    }

    // Validar formato de audio
    const validFormats = ["audio/mp3", "audio/wav", "audio/ogg", "audio/aac", "audio/flac"];
    if (!validFormats.includes(selectedFile.type)) {
      setError("Formato de archivo no permitido. Solo MP3, WAV, OGG, AAC y FLAC.");
      setFile(null);
      return;
    }

    // Validar tamaño máximo (10MB)
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
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorMsg = await response.json();
        setError(errorMsg.error || "Error desconocido al subir la canción.");
        return;
      }

      const newSong = await response.json();
      setSongs([...songs, newSong]);
      setNewSongTitle("");
      setFile(null);
      alert("Canción subida con éxito");
    } catch (error) {
      console.error("Error:", error);
      setError("Hubo un problema al subir la canción.");
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

      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
      />

      <button onClick={addSong}>Subir Canción</button>

      <ul>
        {songs.map((song) => (
          <li key={song.id}>
            <strong>{song.title}</strong>
            <button onClick={() => new Audio(song.url).play()}>Reproducir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
