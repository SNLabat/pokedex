import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getPokemonCollection } from '../lib/dataManagement';
import pokeballOutline from '/public/img/pokeballoutline.png';
import AdvancedSearch from '../components/AdvancedSearch';

export default function PokedexPage({ initialPokemon }) {
  const router = useRouter();
  const [pokemonData, setPokemonData] = useState(initialPokemon);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState('all');
  const [caughtStatus, setCaughtStatus] = useState({});
  const [filteredPokemon, setFilteredPokemon] = useState(initialPokemon);
  
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
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch collection data
      const collectionResult = await getPokemonCollection();
      if (collectionResult.success && collectionResult.data) {
        const statusMap = {};
        
        // Process the data into a more usable format
        Object.entries(collectionResult.data).forEach(([id, forms]) => {
          const mainForm = forms['default'] || Object.values(forms)[0];
          if (mainForm) {
            statusMap[id] = {
              caught: !!mainForm.caught,
              shiny: !!mainForm.shiny,
              alpha: !!mainForm.alpha
            };
          }
        });
        
        setCaughtStatus(statusMap);
      }
      
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1008');
        const data = await res.json();
        
        // Group by generation
        const byGeneration = {};
        
        generations.forEach(gen => {
          if (gen.id !== 'all') {
            byGeneration[gen.id] = [];
          }
        });
        
        // Process all Pokémon
        await Promise.all(data.results.map(async (pokemon, index) => {
          const id = index + 1;
          
          // Determine which generation this Pokémon belongs to
          const gen = generations.find(g => 
            g.id !== 'all' && id >= g.range[0] && id <= g.range[1]
          );
          
          if (gen) {
            // Fetch detailed data for each Pokémon
            const detailRes = await fetch(pokemon.url);
            const detail = await detailRes.json();
            
            byGeneration[gen.id].push({
              id,
              name: pokemon.name,
              image: detail.sprites.other['official-artwork'].front_default,
              types: detail.types.map(t => t.type.name)
            });
          }
        }));
        
        setPokemonData(byGeneration);
      } catch (error) {
        console.error('Error fetching Pokémon data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const renderPokemonList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      );
    }
    
    const gensToShow = selectedGen === 'all' 
      ? Object.keys(pokemonData)
      : [selectedGen];
      
    return (
      <div className="space-y-12">
        {gensToShow.map(genId => (
          <div key={genId} className="space-y-4">
            <h2 className="text-2xl font-bold">
              {generations.find(g => g.id === genId).name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {pokemonData[genId].map(pokemon => {
                const status = caughtStatus[pokemon.id] || {};
                
                return (
                  <Link key={pokemon.id} href={`/pokemon/${pokemon.name}`}>
                    <a className={`bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-transform hover:scale-105 relative pokemon-card
                      ${status.shiny ? 'shiny' : status.caught ? 'caught' : ''}`}>
                      <div className="relative w-full pt-[100%]">
                        <Image
                          src={pokemon.image || `/img/unknown-pokemon.png`}
                          alt={pokemon.name}
                          layout="fill"
                          objectFit="contain"
                          className="absolute top-0 left-0"
                        />
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-400">#{String(pokemon.id).padStart(3, '0')}</p>
                        <p className="font-medium capitalize">{pokemon.name.replace(/-/g, ' ')}</p>
                        <div className="flex gap-1 mt-1">
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
                      
                      {/* Move Catch Status Indicator to top-right */}
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-opacity-70">
                        <div className="w-6 h-6 relative">
                          <Image
                            src={pokeballOutline}
                            alt="Catch status"
                            layout="fill"
                            className={`transition-transform ${
                              status.caught || status.shiny ? 'opacity-100' : 'opacity-40'
                            } ${
                              status.shiny ? 'filter-yellow' : 
                              status.alpha ? 'filter-red' : 
                              status.caught ? 'filter-green' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </a>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
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

  // Client-side search handler (safe because it's not used in getStaticProps)
  const handleSearch = (filters) => {
    // Filter logic here
    const filtered = initialPokemon.filter(pokemon => {
      // Apply filters and return matches
      // ...
    });
    
    setFilteredPokemon(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Pokédex | Pokédex Live</title>
        <meta name="description" content="Browse and track your Pokémon collection" />
      </Head>
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Pokédex</h1>
        
        {/* Generation filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {generations.map(gen => (
              <button
                key={gen.id}
                onClick={() => setSelectedGen(gen.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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
        
        {/* Pass initial values and client-side function */}
        <AdvancedSearch 
          initialFilters={{}} 
          onSearchClient={handleSearch} 
          pokemonData={initialPokemon} 
        />
        
        {/* Pokemon list */}
        {renderPokemonList()}
      </main>
    </div>
  );
}

export async function getStaticProps() {
  try {
    // Fetch basic Pokémon data from API
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151'); // Start with first 151 Pokémon
    const data = await res.json();
    
    // Process Pokémon data into a more usable format
    const pokemonList = data.results.map((pokemon, index) => {
      const id = index + 1;
      return {
        id,
        name: pokemon.name,
        url: pokemon.url,
        // Add image URL from GitHub repository
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
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
        initialPokemon: [] // Return empty array if fetch fails
      },
      revalidate: 3600 // Try again sooner if there was an error
    };
  }
} 