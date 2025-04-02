import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = "https://mi-backend.onrender.com/api/songs"; // Cambia por la URL de tu backend

function App() {
  const [songs, setSongs] = useState([]);
  const [newSongTitle, setNewSongTitle] = useState("");
  const [file, setFile] = useState(null);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(setSongs);
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const addSong = async () => {
    if (!file) {
      alert("Por favor, selecciona un archivo de audio.");
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

      if (response.ok) {
        const newSong = await response.json();
        setSongs([...songs, newSong]); // Agregar la nueva canción a la lista
        setNewSongTitle("");
        setFile(null);
        alert("Canción subida con éxito");
      } else {
        alert("Error al subir la canción");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema al subir la canción.");
    }
  };

  const playSong = (url) => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new Audio(url);
    newAudio.play();
    setAudio(newAudio);
  };

  const deleteSong = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    setSongs(songs.filter(song => song.id !== id));
  };

  return (
    <div className="App">
      <h1>Mi Música</h1>
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
            <button onClick={() => playSong(song.url)}>Reproducir</button>
            <button onClick={() => deleteSong(song.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
