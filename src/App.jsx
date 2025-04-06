import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE_URL = "https://back-music-3izh.onrender.com/api/songs";

function App() {
  const [songs, setSongs] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    artista: '',
    album: '',
    año: '',
    duracion: '',
    genero: ''
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    const playAudio = async () => {
      if (audioRef.current && currentSong && isPlaying) {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.error("Error al reproducir automáticamente:", error);
          setIsPlaying(false);
        }
      }
    };

    playAudio();
  }, [currentSong, isPlaying]);

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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setError("Debes seleccionar un archivo.");
      return;
    }

    const validFormats = ["audio/mp3", "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/flac"];
    if (!validFormats.includes(selectedFile.type)) {
      setError("Formato no permitido. Solo MP3, WAV, OGG, AAC y FLAC.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 1000 * 1024 * 1024) {
      setError("El archivo es demasiado grande (Máx: 1000MB).");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const addSong = async () => {
    const { titulo, artista, album, año, duracion, genero } = formData;

    if (!titulo || !artista || !album || !año || !duracion || !genero || !file) {
      setError("Completa todos los campos y subí un archivo.");
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });
    form.append("archivo", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const errorMsg = JSON.parse(text);
          setError(errorMsg.error || "Error desconocido.");
        } catch {
          setError(text || "Error desconocido.");
        }
        return;
      }

      await fetchSongs();
      setFormData({ titulo: '', artista: '', album: '', año: '', duracion: '', genero: '' });
      setFile(null);
      setError("");
      alert("🎉 Canción subida con éxito.");
    } catch (error) {
      console.error("Error:", error);
      setError("Hubo un problema al subir la canción.");
    }
  };

  const deleteSong = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la canción.");
      }

      await fetchSongs();
      alert("🗑️ Canción eliminada con éxito.");
    } catch (error) {
      console.error("Error:", error);
      setError("No se pudo eliminar la canción.");
    }
  };

  const handlePlay = (song) => {
    if (currentSong?.url === song.url && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  return (
    <div className="App">
      <h1>🎵 Mi Música</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div className="form-container">
        <input name="titulo" value={formData.titulo} onChange={handleInputChange} placeholder="Título" />
        <input name="artista" value={formData.artista} onChange={handleInputChange} placeholder="Artista" />
        <input name="album" value={formData.album} onChange={handleInputChange} placeholder="Álbum" />
        <input name="año" type="number" value={formData.año} onChange={handleInputChange} placeholder="Año" />
        <input name="duracion" value={formData.duracion} onChange={handleInputChange} placeholder="Duración (mm:ss)" />
        <input name="genero" value={formData.genero} onChange={handleInputChange} placeholder="Género" />
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        <button onClick={addSong}>📤 Subir Canción</button>
      </div>

      <ul className="song-list">
        {songs.map((song) => (
          <li key={song.id} className="song-item">
            <div className="song-info">
              <strong>{song.titulo}</strong> - {song.artista} ({song.año})<br />
              <em>{song.album}</em> | {song.genero} | {song.duracion}
            </div>
            <div className="song-controls">
              <button onClick={() => handlePlay(song)}>
                {currentSong?.url === song.url && isPlaying ? "⏸️ Pausar" : "▶️ Reproducir"}
              </button>
              <button onClick={() => deleteSong(song.id)}>🗑️ Eliminar</button>
            </div>
          </li>
        ))}
      </ul>

      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.url}
          onEnded={() => setIsPlaying(false)}
          controls
          style={{ marginTop: '1rem', width: '100%' }}
        />
      )}
    </div>
  );
}

export default App;
