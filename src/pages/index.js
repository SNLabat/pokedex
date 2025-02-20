// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { parseWCBuffer } from '../utils/wcparse';
import WondercardDisplay from '../components/WondercardDisplay';

export default function Home({ generations }) {
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [pokemonSpecies, setPokemonSpecies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wcData, setWCData] = useState(null);
  const [wcError, setWCError] = useState({ message: '', details: null });
  const [showWCUpload, setShowWCUpload] = useState(false);

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
      {/* Top Red Bar */}
      <div className="bg-red-600 h-16 flex items-center justify-center shadow-lg">
        <h1 className="text-4xl font-bold">Labat's Pokémon Database</h1>
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

        {/* Render either Wondercard or Pokemon List */}
        {wcData ? (
          <div className="mb-8">
            <button 
              onClick={() => setWCData(null)}
              className="mb-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              ← Back to Pokédex
            </button>
            <WondercardDisplay wcData={wcData} />
          </div>
        ) : (
          <>
            {loading && (
              <div className="text-center text-xl text-red-400">
                Loading Pokémon...
              </div>
            )}

            {!loading && selectedGeneration && pokemonSpecies.length === 0 && (
              <div className="text-center text-xl text-red-400">
                No Pokémon found for this generation.
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {pokemonSpecies.map((species) => {
                const id = species.url.split('/').slice(-2)[0];
                const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
                
                return (
                  <Link key={species.name} href={`/pokemon/${species.name}`}>
                    <a className="bg-gray-800 rounded-lg p-4 flex flex-col items-center transform hover:scale-105 transition-transform duration-200 border border-gray-700 hover:border-red-500">
                      <div className="relative w-32 h-32 mb-4">
                        <Image
                          src={imageUrl}
                          alt={species.name}
                          layout="fill"
                          objectFit="contain"
                          className="drop-shadow-lg"
                        />
                      </div>
                      <p className="font-semibold text-lg text-center capitalize mb-1">
                        {species.name.replace('-', ' ')}
                      </p>
                      <p className="text-red-400 font-mono">#{id.padStart(3, '0')}</p>
                    </a>
                  </Link>
                );
              })}
            </div>

            {!selectedGeneration && (
              <div className="text-center mt-8 text-xl text-red-400">
                Please select a generation to view Pokémon.
              </div>
            )}

            {/* Wondercard Upload Section - Moved below generation message */}
            {showWCUpload && (
              <div className="mt-8">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 text-red-400">Wondercard Upload (Beta)</h2>
                  <div className="flex flex-col items-center gap-4">
                    <label className="w-full max-w-xs">
                      <input
                        type="file"
                        onChange={handleWondercardUpload}
                        accept=".wc6,.wc7,.wc6full,.wc7full,.pgf,.pgt,.pcd,.wc4,.wc5,.bin,.wcx"
                        className="block w-full text-sm text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-red-600 file:text-white
                          hover:file:bg-red-700
                          cursor-pointer"
                      />
                    </label>
                    {wcError.message && (
                      <div className="w-full max-w-xl bg-red-900/50 border border-red-700 rounded-lg p-4">
                        <p className="text-red-400 font-semibold mb-2">{wcError.message}</p>
                        {wcError.details && (
                          <div className="text-sm text-gray-300 space-y-1">
                            <p>File: {wcError.details.fileName}</p>
                            <p>Size: {wcError.details.fileSize} bytes</p>
                            <p>Error: {wcError.details.errorMessage}</p>
                            {wcError.details.bufferLength && (
                              <p>Buffer Length: {wcError.details.bufferLength} bytes</p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              Expected formats: WC6 (264 bytes), WC6 Full (784 bytes), 
                              WC5 (204 bytes), WC4 (856 or 260 bytes)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Cherish Ball Toggle Button */}
      <button
        onClick={() => setShowWCUpload(!showWCUpload)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg transform transition-transform hover:scale-110 focus:outline-none"
        title="Toggle Wondercard Upload (Beta)"
      >
        <div className="relative w-full h-full">
          <img
            src="/img/cherishball.png"
            alt="Cherish Ball"
            className={`w-full h-full transition-transform duration-300 ${
              showWCUpload ? 'rotate-180' : ''
            }`}
          />
          {/* Beta Badge */}
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            β
          </div>
        </div>
      </button>
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
    revalidate: 3600, // Revalidate every hour
  };
}