// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home({ generations }) {
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [pokemonSpecies, setPokemonSpecies] = useState([]);
  const [loading, setLoading] = useState(false);

  // When a generation is selected, fetch its Pokémon species.
  useEffect(() => {
    if (selectedGeneration) {
      setLoading(true);
      const url = `https://pokeapi.co/api/v2/generation/${selectedGeneration}/`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          // Sort species by their national dex number (extracted from the URL)
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

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-center mb-4">National Pokédex</h1>
      <div className="mb-6 flex justify-center">
        <select
          className="border p-2 rounded"
          value={selectedGeneration}
          onChange={(e) => setSelectedGeneration(e.target.value)}
        >
          <option value="">Select Generation</option>
          {generations.map((gen) => (
            <option key={gen.id} value={gen.id}>
              {gen.name.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      {loading && <p className="text-center">Loading Pokémon...</p>}
      {!loading && selectedGeneration && pokemonSpecies.length === 0 && (
        <p className="text-center">No Pokémon found for this generation.</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pokemonSpecies.map((species) => {
          // Extract the national dex number from the species URL.
          const id = species.url.split('/').slice(-2)[0];
          // Use the official artwork image URL from the PokeAPI sprites.
          const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
          return (
            <Link key={species.name} href={`/pokemon/${species.name}`}>
              <a className="bg-white shadow rounded p-4 flex flex-col items-center hover:shadow-lg transition">
                <img src={imageUrl} alt={species.name} className="w-20 h-20 object-contain mb-2" />
                <p className="font-semibold text-center capitalize">{species.name}</p>
                <p className="text-sm text-gray-500">#{id}</p>
              </a>
            </Link>
          );
        })}
      </div>
      {!selectedGeneration && <p className="text-center mt-4">Please select a generation.</p>}
    </div>
  );
}

export async function getStaticProps() {
  // Fetch the list of generations
  const res = await fetch('https://pokeapi.co/api/v2/generation');
  const data = await res.json();

  // Extract generation IDs from the URLs (e.g. "/generation/1/")
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
