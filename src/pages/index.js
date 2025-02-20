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
  const [wcError, setWCError] = useState(null);

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
      const buffer = await file.arrayBuffer();
      const wcBuffer = new Uint8Array(buffer);
      const parsedData = parseWCBuffer(wcBuffer);
      setWCData(parsedData);
      setWCError(null);
    } catch (error) {
      console.error('Error parsing wondercard:', error);
      setWCError('Failed to parse wondercard. Please ensure this is a valid wondercard file.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Red Bar */}
      <div className="bg-red-600 h-16 flex items-center justify-center shadow-lg">
        <h1 className="text-4xl font-bold">National Pokédex</h1>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Wondercard Upload Section */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Wondercard Upload</h2>
            <div className="flex flex-col items-center gap-4">
              <label className="w-full max-w-xs">
                <input
                  type="file"
                  onChange={handleWondercardUpload}
                  accept=".wc*,.pgt,.pcd"
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-red-600 file:text-white
                    hover:file:bg-red-700
                    cursor-pointer"
                />
              </label>
              {wcError && (
                <p className="text-red-400 text-sm">{wcError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Render either Wondercard or Pokemon List */}
        {wcData ? (
          <WondercardDisplay wcData={wcData} />
        ) : (
          <>
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
          </>
        )}
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
    revalidate: 3600, // Revalidate every hour
  };
}