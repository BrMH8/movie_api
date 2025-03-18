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
    const type = searchKey ? "search" : "discover";
    const {
      data: { results },
    } = await axios.get(`${API_URL}/${type}/movie`, {
      params: {
        api_key: API_KEY,
        query: searchKey,
      },
    });
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
        append_to_response: "videos",
      },
    });

    if (data.videos && data.videos.results) {
      const trailer = data.videos.results.find(
        (vid) => vid.name === "Official Trailer"
      );
      setTrailer(trailer ? trailer : data.videos.results[0]);
    }
    setMovie(data);
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

  const searchMovies = (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!searchKey.trim()) {
      Swal.fire({
        title: "Error!",
        text: "No puedes realizar búsquedas vacías.",
        icon: "warning",
      });
      return;
    }
    fetchMovies(searchKey);
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
    <div>
      <h2 className="text-center mt-5 mb-5">Trailer Popular Movies</h2>

      <form className="container mb-4" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="search"
          value={searchKey}
          onKeyDown={handleSearchChange}
          onChange={(e) => setSearchKey(e.target.value)}
        />
      </form>

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
                      <button
                        className="boton"
                        onClick={() => setPlaying(true)}
                        type="button"
                      >
                        Play Trailer
                      </button>
                    ) : (
                      "Sorry, no trailer available"
                    )}
                    <h1 className="text-white">{movie.title}</h1>
                    <p className="text-white">{movie.overview}</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>

      <div className="container mt-3">
        <div className="row">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="col-md-4 mb-3"
              onClick={() => selectMovie(movie)}
            >
              <img
                src={`${URL_IMAGE + movie.poster_path}`}
                alt=""
                height={600}
                width="100%"
              />
              <h4 className="text-center">{movie.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;