// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home({ generations }) {
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [pokemonSpecies, setPokemonSpecies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Pokémon species for the selected generation
  useEffect(() => {
    if (selectedGeneration) {
      setLoading(true);
      const url = `https://pokeapi.co/api/v2/generation/${selectedGeneration}/`;
      console.log("Fetching generation data from:", url);
      fetch(url)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          // Sort species alphabetically (or use a custom sort if needed)
          const sortedSpecies = data.pokemon_species.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Pokédex</h1>
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="generation-select" style={{ marginRight: '10px' }}>
          Select Generation:
        </label>
        <select
          id="generation-select"
          value={selectedGeneration}
          onChange={(e) => setSelectedGeneration(e.target.value)}
        >
          <option value="">--Please choose an option--</option>
          {generations.map((gen) => (
            <option key={gen.id} value={gen.id}>
              {gen.name.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
      <hr />
      {loading && <p>Loading Pokémon...</p>}
      {!loading && selectedGeneration && pokemonSpecies.length === 0 && (
        <p>No Pokémon found for this generation.</p>
      )}
      <ul>
        {pokemonSpecies.map((species) => (
          <li key={species.name}>
            <Link href={`/pokemon/${species.name}`}>
              {species.name}
            </Link>
          </li>
        ))}
      </ul>
      {!selectedGeneration && <p>Please select a generation.</p>}
    </div>
  );
}

export async function getStaticProps() {
  // Fetch the list of generations from the PokéAPI
  const res = await fetch('https://pokeapi.co/api/v2/generation');
  const data = await res.json();

  // Extract generation IDs from the URLs (e.g., "/generation/1/")
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
