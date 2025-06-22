import './App.css'
import {Search} from "./components/Search.jsx";
import {useEffect, useState} from "react";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: new Headers({
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    })
}

const App = () => {

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [movieList, setMovieList] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const [trendingMovies, setTrendingMovies] = useState([]);


    useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm])

    const fetchMovies = async (query = '') => {

        setLoading(true);
        setErrorMessage('');

        try {
            const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw Error("Failed to fetch movies from API");
            }

            const movies = await response.json();

            if (movies.Response === 'False') {
                setErrorMessage(movies.Error || 'Failed to fetch movies from API');
                setMovieList([]);
                return;
            }

            setMovieList(movies.results);

            if (query && movies.results.length > 0) {
                await updateSearchCount(query, movies.results[0]);
            }

        } catch (e) {
            console.error(`Errors fetching movies: ${e}`);
            setErrorMessage('Error fetching movies, try again');
        } finally {
            setLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const trendingMovies = await getTrendingMovies();
            setTrendingMovies(trendingMovies);

        } catch (e) {
            console.error(`Errors fetching movies: ${e}`);
        }
    }

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm])

    return (
        <main>
            <div className="pattern"/>

            <div className="wrapper">
                <header>
                    <img src="/hero.png" alt="Hero Banner"/>
                    <h1>Find <span className="text-gradient">Movies</span> you'll Enjoy without hassle</h1>
                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>

                        <ul>
                            {trendingMovies.map((movie,index) => (
                                <li key={movie.$id}>
                                <p>{index+1}</p>
                                    <img src={movie.poster_url} alt={movie.title}/>
                                </li>
                            ))}
                        </ul>

                    </section>
                )}

                <section className="all-movies">

                    <h2>All Movies</h2>

                    {loading ? (
                        <Spinner/>
                    ) : errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie}/>
                            ))}
                        </ul>
                    )}
                </section>


            </div>
        </main>
    )
}

export default App
