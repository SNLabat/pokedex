// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home({ generations }) {
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [pokemonSpecies, setPokemonSpecies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedGeneration) {
      setLoading(true);
      const url = `https://pokeapi.co/api/v2/generation/${selectedGeneration}/`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          const sortedSpecies = data.pokemon_species.sort((a, b) => {
            const idA = parseInt(a.url.split('/').slice(-2)[0]);
            const idB = parseInt(b.url.split('/').slice(-2)[0]);
            return idA - idB;
          });
          setPokemonSpecies(sortedSpecies);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching generation data:', error);
          setLoading(false);
        });
    } else {
      setPokemonSpecies([]);
    }
  }, [selectedGeneration]);

  const filteredPokemon = pokemonSpecies.filter(species => 
    species.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-4 max-w-7xl mx-auto">
        {/* Header with red accent bar */}
        <div className="bg-red-600 rounded-t-lg p-6 shadow-lg">
          <h1 className="text-4xl font-bold text-center mb-6">National Pokédex</h1>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Pokémon..."
                className="w-full pl-4 pr-4 py-2 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative w-full sm:w-64">
              <select
                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-red-500"
                value={selectedGeneration}
                onChange={(e) => setSelectedGeneration(e.target.value)}
              >
                <option value="">Select Generation</option>
                {generations.map((gen) => (
                  <option key={gen.id} value={gen.id}>
                    Generation {gen.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800 p-6 rounded-b-lg shadow-lg">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-700 h-32 rounded mb-2"></div>
                  <div className="bg-gray-700 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-700 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {!loading && selectedGeneration && filteredPokemon.length === 0 && (
                <p className="text-center text-gray-300">No Pokémon found.</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredPokemon.map((species) => {
                  const id = species.url.split('/').slice(-2)[0];
                  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
                  return (
                    <Link key={species.name} href={`/pokemon/${species.name}`}>
                      <a className="bg-gray-700 rounded-lg p-4 flex flex-col items-center hover:bg-gray-600 transition duration-200 group">
                        <div className="relative w-32 h-32">
                          <img 
                            src={imageUrl} 
                            alt={species.name} 
                            className="w-full h-full object-contain transform group-hover:scale-110 transition duration-200" 
                          />
                        </div>
                        <p className="font-semibold text-center capitalize mt-2 text-white">
                          {species.name}
                        </p>
                        <p className="text-red-400">#{id.padStart(3, '0')}</p>
                      </a>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
          {!selectedGeneration && (
            <p className="text-center text-gray-300 mt-4">Please select a generation to view Pokémon.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const res = await fetch('https://pokeapi.co/api/v2/generation');
  const data = await res.json();

  const generations = data.results.map((gen) => {
    const idMatch = gen.url.match(/\/generation\/(\d+)\//);
    return {
      id: idMatch ? idMatch[1] : '',
      name: gen.name,
    };
  });

  return {
    props: {
      generations,
    },
  };
}