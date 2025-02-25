import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../../components/Navigation';

const typeColors = {
  normal: { bg: 'bg-gray-500', text: 'text-white' },
  fire: { bg: 'bg-orange-600', text: 'text-white' },
  water: { bg: 'bg-blue-600', text: 'text-white' },
  electric: { bg: 'bg-yellow-500', text: 'text-black' },
  grass: { bg: 'bg-green-600', text: 'text-white' },
  ice: { bg: 'bg-cyan-500', text: 'text-black' },
  fighting: { bg: 'bg-red-700', text: 'text-white' },
  poison: { bg: 'bg-purple-600', text: 'text-white' },
  ground: { bg: 'bg-amber-700', text: 'text-white' },
  flying: { bg: 'bg-indigo-500', text: 'text-white' },
  psychic: { bg: 'bg-pink-600', text: 'text-white' },
  bug: { bg: 'bg-lime-600', text: 'text-white' },
  rock: { bg: 'bg-stone-600', text: 'text-white' },
  ghost: { bg: 'bg-purple-800', text: 'text-white' },
  dragon: { bg: 'bg-violet-700', text: 'text-white' },
  dark: { bg: 'bg-neutral-800', text: 'text-white' },
  steel: { bg: 'bg-zinc-600', text: 'text-white' },
  fairy: { bg: 'bg-pink-500', text: 'text-white' }
};

export default function TypePage({ pokemonOfType, typeData }) {
  const [isLoading, setIsLoading] = useState(false);
  
  // If no type data is passed, show loading or error state
  if (!typeData || !pokemonOfType) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-6">Type not found</h1>
          <p className="mb-6">The requested Pokémon type couldn't be found or loaded.</p>
          <Link href="/pokedex">
            <a className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Return to Pokédex
            </a>
          </Link>
        </div>
      </div>
    );
  }
  
  const typeName = typeData.name;
  const typeColor = typeColors[typeName] || { bg: 'bg-gray-600', text: 'text-white' };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>{typeName.charAt(0).toUpperCase() + typeName.slice(1)} Type Pokémon | Pokédex Live</title>
        <meta name="description" content={`Browse all ${typeName}-type Pokémon in the Pokédex`} />
      </Head>
      
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold capitalize">{typeName} Type</h1>
            <span className={`${typeColor.bg} ${typeColor.text} px-4 py-1 rounded-full text-sm`}>
              {pokemonOfType.length} Pokémon
            </span>
          </div>
          
          <Link href="/pokedex">
            <a className="text-gray-300 hover:text-white">
              Back to Pokédex
            </a>
          </Link>
        </div>
        
        {/* Pokemon grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {pokemonOfType.map(pokemon => (
            <Link key={pokemon.id} href={`/pokemon/${pokemon.name}`}>
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
                        className={`text-xs px-2 py-1 rounded ${typeColors[type]?.bg || 'bg-gray-500'} ${typeColors[type]?.text || 'text-white'}`}
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
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  // Return paths for all 18 types
  const types = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 
    'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 
    'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];
  
  const paths = types.map(type => ({ params: { type } }));
  
  return {
    paths,
    fallback: false // Show 404 for non-existent types
  };
}

export async function getStaticProps({ params }) {
  try {
    const typeName = params.type.toLowerCase();
    
    // Fetch data about the type
    const typeRes = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
    if (!typeRes.ok) throw new Error(`Type ${typeName} not found`);
    const typeData = await typeRes.json();
    
    // Extract pokemon of this type
    const pokemonPromises = typeData.pokemon.slice(0, 50).map(async entry => {
      try {
        const res = await fetch(entry.pokemon.url);
        if (!res.ok) return null;
        const data = await res.json();
        
        return {
          id: data.id,
          name: data.name,
          sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
          types: data.types.map(t => t.type.name)
        };
      } catch (error) {
        console.error(`Error fetching Pokémon data for ${entry.pokemon.name}:`, error);
        return null;
      }
    });
    
    const pokemonResults = await Promise.all(pokemonPromises);
    const pokemonOfType = pokemonResults
      .filter(Boolean)
      .sort((a, b) => a.id - b.id); // Sort by national dex number
    
    return {
      props: {
        typeData: {
          name: typeName,
          damageRelations: typeData.damage_relations
        },
        pokemonOfType
      },
      revalidate: 86400 // Revalidate daily
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
} 