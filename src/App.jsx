import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import YouTube from 'react-youtube';
import Swal from 'sweetalert2';

function App() {
  const API_URL = "https://api.themoviedb.org/3";
  const API_KEY = "036f83b91e7537db21d5241f3adfd5e2";
  const IMAGE_PATH = "https://image.tmdb.org/t/p/original";
  const URL_IMAGE = "https://image.tmdb.org/t/p/original";

  const [movies, setMovies] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [trailer, setTrailer] = useState(null);
  const [movie, setMovie] = useState({ title: "Loading Movies" });
  const [playing, setPlaying] = useState(false);

  const fetchMovies = async (searchKey) => {
    let results = [];
  
    
    const genreResponse = await axios.get(`${API_URL}/genre/movie/list`, {
      params: { api_key: API_KEY, language: "es-ES" },
    });
  
    
    const genresMap = genreResponse.data.genres.reduce((map, genre) => {
      map[genre.name.toLowerCase()] = genre.id;
      return map;
    }, {});
  
    if (!searchKey) {
      
      const { data } = await axios.get(`${API_URL}/discover/movie`, {
        params: { api_key: API_KEY, language: "es-ES" },
      });
      results = data.results;
    } else {
      const searchLower = searchKey.toLowerCase();
  
      
      if (genresMap[searchLower]) {
        const genreId = genresMap[searchLower];
        const moviesByGenre = await axios.get(`${API_URL}/discover/movie`, {
          params: { api_key: API_KEY, with_genres: genreId, language: "es-ES" },
        });
        results = moviesByGenre.data.results;
      } else {
        
        const movieResponse = await axios.get(`${API_URL}/search/movie`, {
          params: { api_key: API_KEY, query: searchKey, language: "es-ES" },
        });
        results = movieResponse.data.results;
      }
    }
  
    setMovies(results);
    if (results.length > 0) {
      setMovie(results[0]);
      await fetchMovie(results[0].id);
    } else {
      setMovie({ title: "No se encontraron películas" });
      setTrailer(null);
    }
  };

  const fetchMovie = async (id) => {
    const { data } = await axios.get(`${API_URL}/movie/${id}`, {
      params: {
        api_key: API_KEY,
        append_to_response: "videos,credits",
      },
    });
  
    if (data.videos && data.videos.results) {
      const trailer = data.videos.results.find(
        (vid) => vid.name === "Official Trailer"
      );
      setTrailer(trailer ? trailer : data.videos.results[0]);
    }
  
    
    const cast = data.credits?.cast?.slice(0, 5).map((actor) => actor.name).join(", ") || "No disponible";
  
    setMovie({
      ...data,
      cast, 
      genres: data.genres.map((genre) => genre.name).join(", "), // Géneros
    });
  };

  const selectMovie = async (movie) => {
    fetchMovie(movie.id);
    setMovie(movie);
    window.scrollTo(0, 0);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;

    if (event.keyCode === 32) {
      if (value.length === 0 || value.endsWith(" ")) {
        event.preventDefault();
        Swal.fire({
          title: "Error!",
          text: "No se permiten espacios al inicio o al final.",
          icon: "warning",
        });
        return;
      }
    }
    setSearchKey(value);
  };

  
  useEffect(() => {
    if (searchKey.trim() || movies.length === 0) {
      fetchMovies(searchKey);
    }
  }, [searchKey]);

  useEffect(() => {
    fetchMovies();
  }, []);

  return (
    <div className='uno'>
     <img className="titulo-imagen" src=".\src\assets\logo.png" alt="Popular Movies" />
      <div className='buscador'>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <input
          className='buscar'
          type="text"
          placeholder="search"
          value={searchKey}
          onKeyDown={handleSearchChange}
          onChange={(e) => setSearchKey(e.target.value)}
        />
      </form>
      </div>
      <div>
        <main>
          {movie ? (
            <div
              className="viewtrailer"
              style={{
                backgroundImage: `url("${IMAGE_PATH}${movie.backdrop_path}")`,
              }}
            >
              {playing ? (
                <>
                  <YouTube
                    videoId={trailer?.key}
                    className="reproductor container"
                    containerClassName={"youtube-container amru"}
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        autoplay: 1,
                        controls: 0,
                        cc_load_policy: 0,
                        fs: 0,
                        iv_load_policy: 0,
                        modestbranding: 0,
                        rel: 0,
                        showinfo: 0,
                      },
                    }}
                  />
                  <button onClick={() => setPlaying(false)} className="boton">
                    Close
                  </button>
                </>
              ) : (
                <div className="container">
                   <div className="">
                    {trailer ? (
                      <button className="boton" onClick={() => setPlaying(true)} type="button">
                        Play Trailer
                        </button>
                        ) : ("Sorry, no trailer available")}
                  <h1 className="text-white">{movie.title}</h1>
                  <p className="text-white"><strong>Géneros:</strong> {movie.genres}</p>
                  <p className="text-white"><strong>Actores:</strong> {movie.cast}</p>
                  <p className="text-white">{movie.overview}</p>
                 </div>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>

      <div className="movie-grid">
  {movies.map((movie) => (
    <div key={movie.id} className="movie-card" onClick={() => selectMovie(movie)}>
      <img src={`${URL_IMAGE + movie.poster_path}`} alt={movie.title} />
      <h4>{movie.title}</h4>

      {/* Descripción */}
      <p className="description">
        {movie.overview ? movie.overview.substring(0, 100) + "..." : "Sin descripción disponible"}
      </p>

      {/* Reparto (si está disponible) */}
      {movie.cast && (
        <p className="cast">
          <strong>Reparto:</strong> {movie.cast}
        </p>
      )}
    </div>
  ))}
</div>

    </div>
  );
}

export default App;