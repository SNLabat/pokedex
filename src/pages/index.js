// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { parseWCBuffer } from '../utils/wcparse';
import { useRouter } from 'next/router';
import pokeballOutline from '/public/img/pokeballoutline.png';

export default function Home({ generations }) {
  const router = useRouter();
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [pokemonSpecies, setPokemonSpecies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wcData, setWCData] = useState(null);
  const [wcError, setWCError] = useState({ message: '', details: null });
  const [showWCUpload, setShowWCUpload] = useState(false);
  const [caughtData, setCaughtData] = useState({});
  const [viewMode, setViewMode] = useState('dex'); // 'dex', 'caught', 'stats'

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

  // Load caught data and last selected generation from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('caughtPokemon');
    if (saved) {
      setCaughtData(JSON.parse(saved));
    }
    
    const lastGen = localStorage.getItem('lastSelectedGeneration');
    if (lastGen) {
      setSelectedGeneration(lastGen);
    }
  }, []);

  // Save selected generation to localStorage
  useEffect(() => {
    if (selectedGeneration) {
      localStorage.setItem('lastSelectedGeneration', selectedGeneration);
    }
  }, [selectedGeneration]);

  // Stats calculation
  const stats = {
    totalCaught: Object.values(caughtData).filter(p => p.regular || p.shiny).length,
    totalShiny: Object.values(caughtData).filter(p => p.shiny).length,
    completion: ((Object.values(caughtData).filter(p => p.regular || p.shiny).length / 1008) * 100).toFixed(1)
  };

  const handleWondercardUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const wcBuffer = new Uint8Array(arrayBuffer);
      const parsedData = parseWCBuffer(wcBuffer);
      
      // Add fileName to parsed data
      parsedData.fileName = file.name;
      
      setWCData(parsedData);
      setWCError({ message: '', details: null });
    } catch (error) {
      console.error('Error parsing wondercard:', error);
      setWCError({
        message: 'Failed to parse wondercard',
        details: {
          fileName: file.name,
          fileSize: file.size,
          errorMessage: error.message,
          bufferLength: wcBuffer?.length,
        }
      });
      setWCData(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-red-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Simplified header with just title and view toggles */}
            <div className="w-full flex items-center justify-between md:justify-center">
              <h1 className="text-4xl font-bold text-center">
                Labat's Pokémon Database
              </h1>
            </div>
            
            {/* View Mode Toggles */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('dex')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'dex' ? 'bg-white text-red-600' : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                Pokédex
              </button>
              <button
                onClick={() => setViewMode('caught')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'caught' ? 'bg-white text-red-600' : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                Caught
              </button>
              <button
                onClick={() => setViewMode('stats')}
                className={`px-4 py-2 rounded-lg ${
                  viewMode === 'stats' ? 'bg-white text-red-600' : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                Stats
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Generation Selector */}
        <div className="mb-8 flex justify-center">
          <select
            className="bg-gray-800 text-white border border-red-500 p-3 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={selectedGeneration}
            onChange={(e) => setSelectedGeneration(e.target.value)}
          >
            <option value="">Select Generation</option>
            {generations.map((gen) => (
              <option key={gen.id} value={gen.id}>
                Generation {gen.id.toUpperCase()} - {gen.name.replace('-', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Content */}
        {viewMode === 'stats' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Total Caught</h2>
              <p className="text-4xl text-red-400">{stats.totalCaught}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Shiny Collection</h2>
              <p className="text-4xl text-yellow-400">{stats.totalShiny}</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">Completion</h2>
              <p className="text-4xl text-green-400">{stats.completion}%</p>
            </div>
            
            {/* Export Section */}
            <div className="bg-gray-800 p-6 rounded-lg md:col-span-3">
              <h2 className="text-xl font-bold mb-4">Data Management</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => exportData()}
                  className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Export Collection Data
                </button>
                <button
                  onClick={() => importData()}
                  className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Import Collection Data
                </button>
              </div>
            </div>
          </div>
        ) : viewMode === 'caught' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Object.entries(caughtData)
              .filter(([_, status]) => status.regular || status.shiny)
              .map(([id]) => {
                const pokemon = pokemonSpecies.find(p => 
                  p.url.split('/').slice(-2)[0] === id
                );
                if (!pokemon) return null;
                
                return (
                  <PokemonCard 
                    key={id} 
                    pokemon={pokemon} 
                    caughtStatus={caughtData[id]} 
                  />
                );
              })}
          </div>
        ) : (
          // Original Pokédex View
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {pokemonSpecies.map((species) => (
              <PokemonCard 
                key={species.name} 
                pokemon={species} 
                caughtStatus={caughtData[species.url.split('/').slice(-2)[0]]} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Wondercard Upload Button */}
      <button
        onClick={() => setShowWCUpload(!showWCUpload)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg transform transition-transform hover:scale-110 focus:outline-none"
        title="Toggle Wondercard Upload (Beta)"
      >
        <img
          src="/img/cherishball.png"
          alt="Cherish Ball"
          className={`w-full h-full transition-transform duration-300 ${
            showWCUpload ? 'rotate-180' : ''
          }`}
        />
      </button>
    </div>
  );
}

// Extracted PokemonCard component
const PokemonCard = ({ pokemon, caughtStatus }) => {
  const id = pokemon.url.split('/').slice(-2)[0];
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  
  // Check both default and form variants for caught status
  const isCaught = caughtStatus?.default?.regular || Object.values(caughtStatus || {}).some(form => form.regular);
  const isShiny = caughtStatus?.default?.shiny || Object.values(caughtStatus || {}).some(form => form.shiny);
  
  return (
    <Link href={`/pokemon/${pokemon.name}`}>
      <a className={`bg-gray-800 rounded-lg p-4 flex flex-col items-center transform hover:scale-105 transition-transform duration-200 relative ${
        isCaught ? 'border-green-500' : 'border-gray-700 hover:border-red-500'
      }`}>
        {/* Pokeball indicator with static import */}
        <div className="absolute -top-2 -right-2 w-8 h-8">
          <Image
            src={pokeballOutline}
            alt="Pokeball"
            width={32}
            height={32}
            className={`${!isCaught && !isShiny ? 'opacity-75 filter-white' : 'opacity-0'}`}
            unoptimized // Since it's a small icon
          />
          <Image
            src={pokeballOutline}
            alt="Caught"
            width={32}
            height={32}
            className={`absolute top-0 left-0 ${isCaught ? 'opacity-100 filter-red' : 'opacity-0'}`}
            unoptimized
          />
          <Image
            src={pokeballOutline}
            alt="Shiny"
            width={32}
            height={32}
            className={`absolute top-0 left-0 ${isShiny ? 'opacity-100 filter-yellow' : 'opacity-0'}`}
            unoptimized
          />
        </div>

        {/* Pokemon artwork with optimization */}
        <div className="relative w-32 h-32 mb-4">
          <Image
            src={imageUrl}
            alt={pokemon.name}
            layout="fill"
            objectFit="contain"
            className="drop-shadow-lg"
            sizes="(max-width: 640px) 128px, 256px" // Limit size variations
            priority={parseInt(id) <= 151} // Prioritize loading for first gen Pokemon
          />
        </div>
        <p className="font-semibold text-lg text-center capitalize mb-1">
          {pokemon.name.replace('-', ' ')}
        </p>
        <p className="text-red-400 font-mono">#{id.padStart(3, '0')}</p>
      </a>
    </Link>
  );
};

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
    revalidate: 3600, // Revalidate every hour
  };
}