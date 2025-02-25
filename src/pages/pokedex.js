import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import AdvancedSearch from '../components/AdvancedSearch';
import Navigation from '../components/Navigation';

export default function PokedexPage({ initialPokemon }) {
  const router = useRouter();
  const [pokemonData, setPokemonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState('all');
  const [searchFilters, setSearchFilters] = useState({});
  
  const generations = [
    { id: 'all', name: 'All Generations' },
    { id: '1', name: 'Generation I', range: [1, 151] },
    { id: '2', name: 'Generation II', range: [152, 251] },
    { id: '3', name: 'Generation III', range: [252, 386] },
    { id: '4', name: 'Generation IV', range: [387, 493] },
    { id: '5', name: 'Generation V', range: [494, 649] },
    { id: '6', name: 'Generation VI', range: [650, 721] },
    { id: '7', name: 'Generation VII', range: [722, 809] },
    { id: '8', name: 'Generation VIII', range: [810, 898] },
    { id: '9', name: 'Generation IX', range: [899, 1008] },
  ];

  useEffect(() => {
    // Check for URL query parameters
    if (router.query.gen) {
      setSelectedGen(router.query.gen);
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // First check if we have a selected generation
        let fetchUrl = 'https://pokeapi.co/api/v2/pokemon?limit=1008'; // Default to all Pokémon
        
        if (selectedGen !== 'all') {
          const gen = generations.find(g => g.id === selectedGen);
          if (gen) {
            const limit = gen.range[1] - gen.range[0] + 1;
            const offset = gen.range[0] - 1;
            fetchUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
          }
        }
        
        const res = await fetch(fetchUrl);
        const data = await res.json();
        
        // Fetch additional details for each Pokémon
        const detailedPokemon = await Promise.all(
          data.results.map(async (pokemon, index) => {
            // Extract ID from URL or calculate it
            const urlParts = pokemon.url.split('/');
            const id = parseInt(urlParts[urlParts.length - 2]);
            
            // Fetch detailed data
            const detailRes = await fetch(pokemon.url);
            const detail = await detailRes.json();
            
            return {
              id,
              name: pokemon.name,
              sprite: detail.sprites.other['official-artwork'].front_default || detail.sprites.front_default,
              types: detail.types.map(t => t.type.name)
            };
          })
        );
        
        // Sort by Pokémon ID to ensure proper Dex order
        const sortedPokemon = detailedPokemon.sort((a, b) => a.id - b.id);
        setPokemonData(sortedPokemon);
      } catch (error) {
        console.error('Error fetching Pokémon data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedGen, router.query]);
  
  // Apply search filters
  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };
  
  // Filter Pokémon based on search criteria
  const filteredPokemon = pokemonData.filter(pokemon => {
    // Apply name/number filter
    if (searchFilters.searchTerm && 
        !pokemon.name.includes(searchFilters.searchTerm.toLowerCase()) && 
        !pokemon.id.toString().includes(searchFilters.searchTerm)) {
      return false;
    }
    
    // Apply type filter
    if (searchFilters.types && searchFilters.types.length > 0) {
      if (!pokemon.types.some(type => searchFilters.types.includes(type))) {
        return false;
      }
    }
    
    // Add more filters as needed
    
    return true;
  });
  
  // Helper function for type colors
  const getTypeColor = (type) => {
    const colors = {
      normal: 'bg-gray-500',
      fire: 'bg-orange-600 text-white',
      water: 'bg-blue-600 text-white',
      electric: 'bg-yellow-500',
      grass: 'bg-green-600 text-white',
      ice: 'bg-cyan-500',
      fighting: 'bg-red-700 text-white',
      poison: 'bg-purple-600 text-white',
      ground: 'bg-amber-700 text-white',
      flying: 'bg-indigo-500 text-white',
      psychic: 'bg-pink-600 text-white',
      bug: 'bg-lime-600 text-white',
      rock: 'bg-stone-600 text-white',
      ghost: 'bg-purple-800 text-white',
      dragon: 'bg-violet-700 text-white',
      dark: 'bg-neutral-800 text-white',
      steel: 'bg-zinc-600 text-white',
      fairy: 'bg-pink-500 text-white'
    };
    
    return colors[type] || 'bg-gray-500';
  };

  // Render Pokemon Grid
  const renderPokemonGrid = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      );
    }
    
    const pokemonToShow = searchFilters.searchTerm || (searchFilters.types && searchFilters.types.length > 0)
      ? filteredPokemon
      : pokemonData;
    
    if (pokemonToShow.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-xl text-gray-400">No Pokémon found matching your criteria</p>
          <button 
            onClick={() => setSearchFilters({})} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {pokemonToShow.map(pokemon => (
          <Link key={pokemon.id} href={`/pokemon/${pokemon.name}`} passHref>
            <a className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-transform hover:scale-105 flex flex-col items-center">
              <div className="relative w-32 h-32">
                {pokemon.sprite ? (
                  <Image
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    layout="fill"
                    objectFit="contain"
                    className="drop-shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-full">
                    <span className="text-gray-500">?</span>
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-400">#{String(pokemon.id).padStart(3, '0')}</p>
                <p className="font-medium capitalize">{pokemon.name.replace(/-/g, ' ')}</p>
                <div className="flex justify-center gap-1 mt-1">
                  {pokemon.types.map(type => (
                    <span 
                      key={type} 
                      className={`text-xs px-2 py-1 rounded ${getTypeColor(type)}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Pokédex | Pokédex Live</title>
        <meta name="description" content="Browse the complete Pokédex with all generations from Kanto to Paldea" />
      </Head>
      
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pokédex</h1>
          
          {/* Stats counter */}
          <div className="bg-gray-800 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-400">Displaying:</span>
            <span className="ml-2 font-semibold">
              {filteredPokemon.length > 0 ? filteredPokemon.length : pokemonData.length} Pokémon
            </span>
          </div>
        </div>
        
        {/* Generation filter */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {generations.map(gen => (
              <button
                key={gen.id}
                onClick={() => {
                  setSelectedGen(gen.id);
                  router.push({
                    pathname: '/pokedex',
                    query: { gen: gen.id },
                  }, undefined, { shallow: true });
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedGen === gen.id 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {gen.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Advanced search */}
        <AdvancedSearch 
          initialFilters={searchFilters}
          onSearchClient={handleSearch}
          pokemonData={pokemonData}
        />
        
        {/* Pokemon list */}
        <div className="mt-6">
          {renderPokemonGrid()}
        </div>
        
        {/* Pagination or "Load More" button for large generations */}
        {pokemonData.length > 60 && !isLoading && (
          <div className="mt-8 text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              Load More Pokémon
            </button>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>
            Pokémon and Pokémon character names are trademarks of Nintendo.
            This app is not affiliated with Nintendo, Game Freak, or The Pokémon Company.
          </p>
        </div>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  try {
    // Fetch initial Pokémon data (just first generation to start)
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    const data = await res.json();
    
    // Process Pokémon data into a more usable format
    const pokemonList = data.results.map((pokemon, index) => {
      const id = index + 1;
      return {
        id,
        name: pokemon.name,
        url: pokemon.url
      };
    });
    
    return {
      props: {
        initialPokemon: pokemonList
      },
      revalidate: 86400 // Revalidate once per day
    };
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return {
      props: {
        initialPokemon: []
      },
      revalidate: 3600
    };
  }
} 