import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = "https://mi-backend.onrender.com/api/songs"; // Cambia por la URL de tu backend

function App() {
  const [songs, setSongs] = useState([]);
  const [newSong, setNewSong] = useState("");
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(setSongs);
  }, []);

  const addSong = () => {
    const song = { title: newSong, artist: "Artista Ejemplo", genre: "Género Ejemplo", url: "/path/to/song.mp3" };
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song)
    }).then(() => {
      setSongs([...songs, song]);
      setNewSong("");
    });
  };

  const playSong = (url) => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new Audio(url);
    newAudio.play();
    setAudio(newAudio);
  };

  const deleteSong = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => {
        setSongs(songs.filter(song => song.id !== id));
      });
  };

  return (
    <div className="App">
      <h1>Mi Música</h1>
      <input
        value={newSong}
        onChange={(e) => setNewSong(e.target.value)}
        placeholder="Añadir nueva canción"
      />
      <button onClick={addSong}>Agregar Canción</button>

      <ul>
        {songs.map((song, idx) => (
          <li key={idx}>
            <strong>{song.title}</strong> - {song.artist}
            <button onClick={() => playSong(song.url)}>Reproducir</button>
            <button onClick={() => deleteSong(song.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
