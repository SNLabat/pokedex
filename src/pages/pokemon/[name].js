// pages/pokemon/[name].js
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Add the SpriteToggleGroup component at the top
const SpriteToggleGroup = ({ isAnimated, isShiny, onAnimatedChange, onShinyChange, hasAnimated, hasShiny }) => (
  <div className="flex flex-col gap-2">
    {/* Main sprite type toggles */}
    <div className="inline-flex rounded-md shadow-sm" role="group">
      <button
        onClick={() => onShinyChange(false)}
        className={`px-4 py-2 text-sm font-medium rounded-l-lg border border-gray-600 
          ${!isShiny 
            ? 'bg-gray-700 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }
          focus:z-10 focus:ring-2 focus:ring-gray-500`}
      >
        Regular
      </button>
      {hasShiny && (
        <button
          onClick={() => onShinyChange(true)}
          className={`px-4 py-2 text-sm font-medium rounded-r-lg border border-gray-600 
            ${isShiny 
              ? 'bg-yellow-500 text-black'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }
            focus:z-10 focus:ring-2 focus:ring-yellow-500`}
        >
          <span className="flex items-center gap-1">
            Shiny
            <svg 
              viewBox="0 0 24 24" 
              className="w-4 h-4"
              fill="currentColor"
            >
              <path d="M12 3L14.39 8.25L20 9.24L16 13.47L17.15 19L12 16.42L6.85 19L8 13.47L4 9.24L9.61 8.25L12 3Z" />
            </svg>
          </span>
        </button>
      )}
    </div>

    {/* Animation toggle */}
    {hasAnimated && (
      <div className="inline-flex rounded-md shadow-sm" role="group">
        <button
          onClick={() => onAnimatedChange(false)}
          className={`px-4 py-2 text-sm font-medium rounded-l-lg border border-gray-600 
            ${!isAnimated 
              ? 'bg-gray-700 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }
            focus:z-10 focus:ring-2 focus:ring-gray-500`}
        >
          Static
        </button>
        <button
          onClick={() => onAnimatedChange(true)}
          className={`px-4 py-2 text-sm font-medium rounded-r-lg border border-gray-600 
            ${isAnimated 
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }
            focus:z-10 focus:ring-2 focus:ring-blue-500`}
        >
          <span className="flex items-center gap-1">
            Animated
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </button>
      </div>
    )}
  </div>
);

export default function PokemonDetail({ pokemon, species }) {
  const [isShiny, setIsShiny] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);

  const {
    id,
    name,
    base_experience,
    abilities,
    sprites,
    stats,
    types,
    height,
    weight,
    moves,
    cries,
  } = pokemon;

  const {
    catch_rate,
    base_happiness,
    egg_groups,
    gender_rate,
    hatch_counter,
    flavor_text_entries,
    growth_rate,
    genera,
  } = species;

  // Get all sprite variations
  const regularStatic = sprites.other?.['official-artwork']?.front_default || sprites.front_default;
  const shinyStatic = sprites.other?.['official-artwork']?.front_shiny || sprites.front_shiny;
  const regularAnimated = sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default;
  const shinyAnimated = sprites.versions?.['generation-v']?.['black-white']?.animated?.front_shiny;

  // Determine which sprite to display
  const displaySprite = isAnimated 
    ? (isShiny ? shinyAnimated : regularAnimated) 
    : (isShiny ? shinyStatic : regularStatic);

  // Check if this Pokémon has animated/shiny sprites
  const hasAnimatedSprites = Boolean(regularAnimated);
  const hasShinySprites = Boolean(shinyStatic || shinyAnimated);

  const heightMeters = (height / 10).toFixed(1);
  const weightKg = (weight / 10).toFixed(1);
  const englishGenus = genera?.find((g) => g.language.name === 'en')?.genus;
  const englishEntry = flavor_text_entries?.find((entry) => entry.language.name === 'en')
    ?.flavor_text.replace(/\f/g, ' ');
  const totalEVYield = stats.reduce((sum, s) => sum + s.effort, 0);

  let genderInfo;
  if (gender_rate === -1) {
    genderInfo = "Genderless";
  } else {
    const femaleChance = (gender_rate / 8) * 100;
    const maleChance = 100 - femaleChance;
    genderInfo = `Male: ${maleChance.toFixed(0)}%, Female: ${femaleChance.toFixed(0)}%`;
  }

  const levelUpMoves = moves
    .filter(move => 
      move.version_group_details.some(
        d => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0
      )
    )
    .slice(0, 10);

  // Type color mapping for badges
  const typeColors = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-blue-200',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-green-400',
    rock: 'bg-yellow-800',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-700',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300'
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Red Bar with Navigation */}
      <div className="bg-red-600 p-4 shadow-lg flex items-center">
        <Link href="/">
          <a className="text-white hover:text-gray-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to National Pokédex
          </a>
        </Link>
      </div>

      <div className="container mx-auto p-4">
        {/* Header: Artwork and Basic Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            <div className="relative w-64 h-64 mb-4">
              <Image
                src={displaySprite}
                alt={`${name} ${isShiny ? 'shiny' : ''} ${isAnimated ? 'animated' : ''} artwork`}
                layout="fill"
                objectFit="contain"
                className="drop-shadow-lg"
              />
            </div>
            <SpriteToggleGroup
              isAnimated={isAnimated}
              isShiny={isShiny}
              onAnimatedChange={setIsAnimated}
              onShinyChange={setIsShiny}
              hasAnimated={hasAnimatedSprites}
              hasShiny={hasShinySprites}
            />
          </div>
          <div className="md:w-2/3 md:pl-8">
            <div className="flex items-center mb-2">
              <h1 className="text-4xl font-bold capitalize mr-3">
                {name.replace('-', ' ')}
              </h1>
              <span className="text-2xl text-red-400 font-mono">
                #{id.toString().padStart(3, '0')}
              </span>
            </div>
            {englishGenus && (
              <p className="text-xl text-red-400 mb-4">{englishGenus}</p>
            )}
            <div className="flex gap-2 mb-4">
              {types.map(t => (
                <span
                  key={t.type.name}
                  className={`${typeColors[t.type.name]} px-3 py-1 rounded-full text-white capitalize`}
                >
                  {t.type.name}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Height</p>
                <p className="text-xl">{heightMeters} m</p>
              </div>
              <div>
                <p className="text-gray-400">Weight</p>
                <p className="text-xl">{weightKg} kg</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-400">Abilities</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {abilities.map(a => (
                  <span
                    key={a.ability.name}
                    className={`bg-gray-700 px-3 py-1 rounded-full text-white ${
                      a.is_hidden ? 'border border-red-400' : ''
                    }`}
                  >
                    {a.ability.name.replace('-', ' ')}
                    {a.is_hidden && <span className="text-red-400 ml-1">(Hidden)</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Combined Pokédex Entry and Cries section */}
        {(englishEntry || (cries && (cries.latest || cries.legacy))) && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            {englishEntry && (
              <>
                <h2 className="text-2xl font-bold mb-4 text-red-400">Pokédex Entry</h2>
                <p className="text-lg leading-relaxed mb-6">{englishEntry}</p>
              </>
            )}
            
            {cries && (cries.latest || cries.legacy) && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-400">Cries</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cries.latest && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 mb-2">Latest Cry</p>
                      <audio
                        controls
                        src={cries.latest}
                        className="w-full"
                      >
                        Your browser does not support audio.
                      </audio>
                    </div>
                  )}
                  {cries.legacy && (
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-400 mb-2">Legacy Cry</p>
                      <audio
                        controls
                        src={cries.legacy}
                        className="w-full"
                      >
                        Your browser does not support audio.
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Training */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Training</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400">Base Experience</p>
                <p className="text-xl">{base_experience}</p>
              </div>
              <div>
                <p className="text-gray-400">Catch Rate</p>
                <p className="text-xl">
                  {catch_rate} (≈ {(catch_rate / 255 * 100).toFixed(1)}%)
                </p>
              </div>
              <div>
                <p className="text-gray-400">Base Friendship</p>
                <p className="text-xl">{base_happiness}</p>
              </div>
              <div>
                <p className="text-gray-400">Growth Rate</p>
                <p className="text-xl capitalize">{growth_rate.name.replace('-', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-400">EV Yield</p>
                <p className="text-xl">{totalEVYield}</p>
              </div>
            </div>
          </div>

          {/* Breeding */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Breeding</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400">Egg Groups</p>
                <p className="text-xl capitalize">
                  {egg_groups.map(group => group.name).join(', ')}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Gender Distribution</p>
                <p className="text-xl">{genderInfo}</p>
              </div>
              <div>
                <p className="text-gray-400">Egg Cycles</p>
                <p className="text-xl">{hatch_counter}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Base Stats */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Base Stats</h2>
          <div className="grid gap-4">
            {stats.map(stat => {
              const percentage = (stat.base_stat / 255) * 100;
              return (
                <div key={stat.stat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize text-gray-400">
                      {stat.stat.name.replace('-', ' ')}
                    </span>
                    <span>{stat.base_stat}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-2 bg-red-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level-Up Moves */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-red-400">
            Level-Up Moves (First 10)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {levelUpMoves.map(move => {
              const detail = move.version_group_details.find(
                d => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0
              );
              return (
                <div
                  key={move.move.name}
                  className="bg-gray-700 p-3 rounded-lg flex justify-between items-center"
                >
                  <span className="capitalize">
                    {move.move.name.replace('-', ' ')}
                  </span>
                  <span className="text-red-400">
                    Lv. {detail ? detail.level_learned_at : '?'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Updated Sprites section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Sprites</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {/* Static Sprites */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-400">Static</h3>
              <div className="grid grid-cols-2 gap-4">
                {sprites.front_default && (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <img
                        src={sprites.front_default}
                        alt={`${name} front`}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <p className="mt-2 text-gray-400">Front</p>
                  </div>
                )}
                {sprites.front_shiny && (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <img
                        src={sprites.front_shiny}
                        alt={`${name} front shiny`}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <p className="mt-2 text-gray-400">Shiny</p>
                  </div>
                )}
              </div>
            </div>

            {/* Animated Sprites */}
            {hasAnimatedSprites && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-400">Animated</h3>
                <div className="grid grid-cols-2 gap-4">
                  {regularAnimated && (
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <img
                          src={regularAnimated}
                          alt={`${name} animated`}
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                      <p className="mt-2 text-gray-400">Regular</p>
                    </div>
                  )}
                  {shinyAnimated && (
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <img
                          src={shinyAnimated}
                          alt={`${name} animated shiny`}
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                      <p className="mt-2 text-gray-400">Shiny</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  // Fetch all Pokémon for pre-rendering
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1008'); // Increased limit to cover all Pokémon
  const data = await res.json();
  
  const paths = data.results.map(p => ({
    params: { name: p.name },
  }));

  return { 
    paths,
    fallback: 'blocking' // Show a loading state for new paths
  };
}

export async function getStaticProps({ params }) {
  try {
    // Fetch Pokémon data
    const resPokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${params.name}`);
    if (!resPokemon.ok) {
      return { notFound: true };
    }
    const pokemon = await resPokemon.json();
    
    // Fetch species data
    const resSpecies = await fetch(pokemon.species.url);
    if (!resSpecies.ok) {
      return { notFound: true };
    }
    const species = await resSpecies.json();

    return {
      props: { 
        pokemon,
        species
      },
      revalidate: 86400, // Revalidate once per day
    };
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return { notFound: true };
  }
}