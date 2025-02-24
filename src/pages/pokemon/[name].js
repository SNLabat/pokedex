// pages/pokemon/[name].js
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Type color mapping for visual styling
const typeColors = {
  normal: { bg: 'bg-gray-700', text: 'text-gray-100', accent: 'bg-gray-500' },
  fire: { bg: 'bg-orange-900', text: 'text-orange-50', accent: 'bg-orange-600' },
  water: { bg: 'bg-blue-900', text: 'text-blue-50', accent: 'bg-blue-600' },
  electric: { bg: 'bg-yellow-700', text: 'text-yellow-50', accent: 'bg-yellow-500' },
  grass: { bg: 'bg-green-800', text: 'text-green-50', accent: 'bg-green-600' },
  ice: { bg: 'bg-cyan-800', text: 'text-cyan-50', accent: 'bg-cyan-500' },
  fighting: { bg: 'bg-red-900', text: 'text-red-50', accent: 'bg-red-600' },
  poison: { bg: 'bg-purple-900', text: 'text-purple-50', accent: 'bg-purple-600' },
  ground: { bg: 'bg-amber-900', text: 'text-amber-50', accent: 'bg-amber-600' },
  flying: { bg: 'bg-indigo-800', text: 'text-indigo-50', accent: 'bg-indigo-500' },
  psychic: { bg: 'bg-pink-800', text: 'text-pink-50', accent: 'bg-pink-500' },
  bug: { bg: 'bg-lime-800', text: 'text-lime-50', accent: 'bg-lime-600' },
  rock: { bg: 'bg-stone-800', text: 'text-stone-50', accent: 'bg-stone-600' },
  ghost: { bg: 'bg-purple-950', text: 'text-purple-50', accent: 'bg-purple-700' },
  dragon: { bg: 'bg-violet-900', text: 'text-violet-50', accent: 'bg-violet-600' },
  dark: { bg: 'bg-neutral-900', text: 'text-neutral-50', accent: 'bg-neutral-700' },
  steel: { bg: 'bg-zinc-800', text: 'text-zinc-50', accent: 'bg-zinc-600' },
  fairy: { bg: 'bg-pink-700', text: 'text-pink-50', accent: 'bg-pink-500' }
};

// Default theme if no type is available
const defaultTheme = { bg: 'bg-gray-800', text: 'text-white', accent: 'bg-gray-600' };

// Utility function for proper casing
const properCase = (str) => {
  if (!str) return '';
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format stat names for display
const formatStatName = (statName) => {
  if (!statName) return '';
  if (statName === 'hp') return 'HP';
  return properCase(statName);
};

// Main component
export default function PokemonDetail({ pokemon, species, alternativeForms }) {
  const [isShiny, setIsShiny] = useState(false);
  
  if (!pokemon || !species) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Pokémon Not Found</h1>
          <p className="mb-6">The Pokémon you're looking for couldn't be loaded.</p>
          <Link href="/">
            <a className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Return to Home
            </a>
          </Link>
        </div>
      </div>
    );
  }

  // Get basic Pokémon data
  const id = pokemon.id;
  const name = pokemon.name.replace(/-/g, ' ');
  
  // Select primary type for theme
  const primaryType = pokemon.types?.[0]?.type?.name;
  const theme = primaryType ? (typeColors[primaryType] || defaultTheme) : defaultTheme;

  // Get sprite to display
  const displaySprite = isShiny
    ? (pokemon.sprites?.other?.['official-artwork']?.front_shiny || pokemon.sprites?.front_shiny)
    : (pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default);
  
  // Get Pokédex entry
  const englishEntry = species.flavor_text_entries
    ?.find(entry => entry?.language?.name === 'en')
    ?.flavor_text?.replace(/\f/g, ' ') || '';

  // Calculate basic stats for display
  const heightMeters = pokemon.height ? (pokemon.height / 10).toFixed(1) : '?';
  const weightKg = pokemon.weight ? (pokemon.weight / 10).toFixed(1) : '?';
  const totalStats = pokemon.stats?.reduce((sum, stat) => sum + (stat?.base_stat || 0), 0) || 0;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <Head>
        <title>{properCase(name)} | PokéTracker</title>
        <meta name="description" content={`View details for ${properCase(name)}`} />
      </Head>

      {/* Navigation */}
      <div className="bg-gray-900 p-4">
        <div className="container mx-auto">
          <Link href="/">
            <a className="text-white hover:text-gray-300 flex items-center">
              <span className="mr-2">←</span> Back to Home
            </a>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Pokémon header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Pokémon image */}
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="relative w-48 h-48 mb-4">
                {displaySprite && (
                  <Image
                    src={displaySprite}
                    alt={name}
                    layout="fill"
                    objectFit="contain"
                    priority
                  />
                )}
              </div>
              <button
                onClick={() => setIsShiny(!isShiny)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isShiny ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-white'
                }`}
              >
                {isShiny ? 'View Regular' : 'View Shiny'}
              </button>
            </div>

            {/* Pokémon info */}
            <div className="md:w-2/3">
              <div className="flex flex-wrap justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold capitalize mb-1">{name}</h1>
                  <p className="text-gray-400 text-xl">#{String(id).padStart(3, '0')}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                  {pokemon.types?.map(type => (
                    <span
                      key={type.type.name}
                      className={`${typeColors[type.type.name]?.accent || 'bg-gray-600'} 
                        px-3 py-1 rounded-lg text-white capitalize`}
                    >
                      {type.type.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Height</p>
                  <p>{heightMeters} m</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Weight</p>
                  <p>{weightKg} kg</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-400 text-sm">Abilities</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {pokemon.abilities?.map(ability => (
                    <span
                      key={ability.ability.name}
                      className="bg-gray-700 px-2 py-1 rounded text-sm capitalize"
                    >
                      {ability.ability.name.replace('-', ' ')}
                      {ability.is_hidden && <span className="ml-1 text-yellow-500">*</span>}
                    </span>
                  ))}
                </div>
              </div>

              {englishEntry && (
                <div>
                  <p className="text-gray-400 text-sm">Pokédex Entry</p>
                  <p className="mt-1 italic">{englishEntry}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Base Stats</h2>
          <div className="space-y-4">
            {pokemon.stats?.map(stat => (
              <div key={stat.stat.name}>
                <div className="flex justify-between mb-1">
                  <span className="capitalize">{formatStatName(stat.stat.name)}</span>
                  <span>{stat.base_stat}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div
                    className="h-2 bg-red-500 rounded-full"
                    style={{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-700">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">{totalStats}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Forms (simplified) */}
        {alternativeForms && alternativeForms.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Alternative Forms</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {alternativeForms.map(form => {
                if (!form) return null;
                
                const formSprite = form.sprites?.other?.['official-artwork']?.front_default || 
                                 form.sprites?.front_default;
                
                return (
                  <div key={form.name} className="bg-gray-700 rounded-lg p-4 text-center">
                    <h3 className="font-medium mb-3 capitalize">
                      {form.name.replace(pokemon.name + '-', '').replace('-', ' ')}
                    </h3>
                    {formSprite && (
                      <div className="relative w-28 h-28 mx-auto">
                        <Image
                          src={formSprite}
                          alt={form.name}
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                    )}
                    <div className="flex justify-center gap-2 mt-2">
                      {form.types?.map(type => (
                        <span
                          key={type.type.name}
                          className={`${typeColors[type.type.name]?.accent || 'bg-gray-600'} 
                            px-2 py-0.5 rounded text-xs text-white capitalize`}
                        >
                          {type.type.name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Server-side data fetching with simplified data structure
export async function getStaticPaths() {
  return { 
    paths: [],
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }) {
  try {
    const specialCases = {
      'deoxys': 'deoxys-normal',
      'wormadam': 'wormadam-plant',
      // ... other special cases
    };

    const pokemonName = specialCases[params.name] || params.name;
    
    // Fetch and process Pokemon data
    const resPokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    if (!resPokemon.ok) throw new Error('Failed to fetch Pokemon');
    const pokemonData = await resPokemon.json();
    
    // Fetch and process species data
    const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonData.id}`);
    if (!resSpecies.ok) throw new Error('Failed to fetch species');
    const speciesData = await resSpecies.json();
    
    // Process alternative forms
    let alternativeForms = [];
    try {
      if (speciesData.varieties && speciesData.varieties.length > 0) {
        const formPromises = speciesData.varieties
          .filter(v => v.pokemon.name !== pokemonName)
          .map(async (variety) => {
            try {
              const res = await fetch(variety.pokemon.url);
              if (!res.ok) return null;
              const data = await res.json();
              
              return {
                id: data.id,
                name: data.name,
                types: data.types?.map(t => ({ type: { name: t.type.name } })),
                sprites: {
                  front_default: data.sprites?.front_default,
                  other: {
                    'official-artwork': {
                      front_default: data.sprites?.other?.['official-artwork']?.front_default
                    }
                  }
                }
              };
            } catch (error) {
              return null;
            }
          });
          
        const forms = await Promise.all(formPromises);
        alternativeForms = forms.filter(Boolean);
      }
    } catch (error) {
      console.error('Error processing forms:', error);
    }
    
    // Ensure data is serializable using JSON.stringify/parse
    return {
      props: JSON.parse(JSON.stringify({
        pokemon: {
          id: pokemonData.id,
          name: pokemonData.name,
          height: pokemonData.height,
          weight: pokemonData.weight,
          base_experience: pokemonData.base_experience,
          types: pokemonData.types?.map(t => ({
            type: { name: t.type.name }
          })),
          stats: pokemonData.stats?.map(s => ({
            base_stat: s.base_stat,
            effort: s.effort,
            stat: { name: s.stat.name }
          })),
          abilities: pokemonData.abilities?.map(a => ({
            ability: { name: a.ability.name },
            is_hidden: a.is_hidden
          })),
          sprites: {
            front_default: pokemonData.sprites?.front_default,
            front_shiny: pokemonData.sprites?.front_shiny,
            other: {
              'official-artwork': {
                front_default: pokemonData.sprites?.other?.['official-artwork']?.front_default,
                front_shiny: pokemonData.sprites?.other?.['official-artwork']?.front_shiny
              }
            }
          }
        },
        species: {
          flavor_text_entries: speciesData.flavor_text_entries?.map(entry => ({
            flavor_text: entry.flavor_text,
            language: { name: entry.language.name }
          })),
          genera: speciesData.genera?.map(g => ({
            genus: g.genus,
            language: { name: g.language.name }
          }))
        },
        alternativeForms
      })),
      revalidate: 86400
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
}