// pages/pokemon/[name].js
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import pokeballOutline from '/public/img/pokeballoutline.png';
import { currentUserPlaceholder } from '../../lib/dataManagement';

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

// Simple icon components
const IconSet = {
  Experience: () => <span className="text-xl">✨</span>,
  CatchRate: () => <span className="text-xl">🎯</span>,
  Friendship: () => <span className="text-xl">❤️</span>,
  GrowthRate: () => <span className="text-xl">📈</span>,
  EVYield: () => <span className="text-xl">⭐</span>,
  EggGroups: () => <span className="text-xl">👥</span>,
  Gender: () => <span className="text-xl">⚥</span>,
  EggCycles: () => <span className="text-xl">🥚</span>,
  Stats: () => <span className="text-xl">📊</span>,
  Moves: () => <span className="text-xl">⚡</span>,
  Height: () => <span className="text-xl">📏</span>,
  Weight: () => <span className="text-xl">⚖️</span>
};

// Pokemon cry audio component
const PokemonCry = ({ src, label, theme }) => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
  }, []);

  if (!src) return null;

  if (isIOS) {
    return (
      <div className={`${theme.bg} bg-opacity-50 p-4 rounded-lg shadow-lg`}>
        <p className={`${theme.text} opacity-75 mb-2`}>{label}</p>
        <a 
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-center"
        >
          Listen to Cry
        </a>
        <p className="text-xs text-gray-400 mt-2">
          Note: On iOS devices, cries will open in a new tab
        </p>
      </div>
    );
  }

  return (
    <div className={`${theme.bg} bg-opacity-50 p-4 rounded-lg shadow-lg`}>
      <p className={`${theme.text} opacity-75 mb-2`}>{label}</p>
      <audio
        controls
        className="w-full"
        preload="none"
      >
        <source src={src} type="audio/mpeg" />
        <source src={src} type="audio/ogg" />
        Your browser does not support audio playback.
      </audio>
    </div>
  );
};

// Evolution chain visualization
const EvolutionChain = ({ chain, currentPokemonId }) => {
  if (!chain) return null;
  
  const renderEvolution = (evolution) => {
    if (!evolution || !evolution.species) return null;
    
    const evolutionId = evolution.species.url.split('/').slice(-2, -1)[0];
    const isCurrentPokemon = evolutionId === currentPokemonId?.toString();
    
    return (
      <div className="flex flex-col items-center">
        <Link href={`/pokemon/${evolution.species.name}`}>
          <a className="flex flex-col items-center p-2 rounded-lg transition-transform hover:scale-105">
            <div className="w-20 h-20 relative">
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evolutionId}.png`}
                alt={evolution.species.name}
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className={`mt-2 capitalize text-sm ${isCurrentPokemon ? 'border-b-2 border-current' : ''}`}>
              {evolution.species.name.replace(/-/g, ' ')}
            </span>
            {evolution.evolution_details?.[0]?.min_level && (
              <span className="text-xs opacity-75">Level {evolution.evolution_details[0].min_level}</span>
            )}
          </a>
        </Link>
        
        {evolution.evolves_to?.length > 0 && (
          <div className="flex items-center mx-4">
            <span className="text-2xl">→</span>
          </div>
        )}
      </div>
    );
  };

  const renderEvolutionLine = (evolution) => {
    if (!evolution) return null;
    
    const evolutions = [];
    let currentEvo = evolution;

    while (currentEvo) {
      evolutions.push(renderEvolution(currentEvo));
      currentEvo = currentEvo.evolves_to?.[0]; // Follow the first evolution path
    }

    // For split evolutions (like Eevee), render them in rows
    const splitEvolutions = evolution.evolves_to?.slice(1) || [];
    if (splitEvolutions.length > 0) {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-4">
            {evolutions}
          </div>
          {splitEvolutions.map((evo, index) => (
            <div key={index} className="flex items-center justify-center gap-4">
              <div className="invisible">
                {renderEvolution(evolution)} {/* Placeholder for alignment */}
              </div>
              <span className="text-2xl">→</span>
              {renderEvolution(evo)}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-4">
        {evolutions}
      </div>
    );
  };

  return (
    <div className="flex justify-center overflow-x-auto">
      {renderEvolutionLine(chain)}
    </div>
  );
};

// Move type background colors
const moveTypeColors = {
  normal: 'bg-gray-500',
  fire: 'bg-orange-600',
  water: 'bg-blue-600',
  electric: 'bg-yellow-500',
  grass: 'bg-green-600',
  ice: 'bg-cyan-500',
  fighting: 'bg-red-700',
  poison: 'bg-purple-600',
  ground: 'bg-amber-700',
  flying: 'bg-indigo-500',
  psychic: 'bg-pink-600',
  bug: 'bg-lime-600',
  rock: 'bg-stone-600',
  ghost: 'bg-purple-800',
  dragon: 'bg-violet-700',
  dark: 'bg-neutral-800',
  steel: 'bg-zinc-600',
  fairy: 'bg-pink-500'
};

// Main component
export default function PokemonDetail({ pokemon, species, alternativeForms, evolutionChain }) {
  const [isShiny, setIsShiny] = useState(false);
  const [caughtStatus, setCaughtStatus] = useState({
    default: {
      regular: false,
      shiny: false
    }
  });

  if (!pokemon || !species) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Pokémon Not Found</h1>
          <p className="mb-6">The Pokémon you&apos;re looking for couldn&apos;t be loaded.</p>
          <Link href="/">
            <a className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Return to Pokédex
            </a>
          </Link>
        </div>
      </div>
    );
  }

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
    capture_rate,
    base_happiness,
    egg_groups,
    gender_rate,
    hatch_counter,
    flavor_text_entries,
    growth_rate,
    genera,
  } = species;

  // Select primary sprite to display
  const displaySprite = isShiny
    ? (sprites?.other?.['official-artwork']?.front_shiny || sprites?.front_shiny)
    : (sprites?.other?.['official-artwork']?.front_default || sprites?.front_default);

  // Format basic pokemon data
  const heightMeters = height ? (height / 10).toFixed(1) : '?';
  const weightKg = weight ? (weight / 10).toFixed(1) : '?';
  const englishGenus = genera?.find((g) => g?.language?.name === 'en')?.genus || '';
  const englishEntry = flavor_text_entries?.find((entry) => entry?.language?.name === 'en')
    ?.flavor_text?.replace(/\f/g, ' ') || '';
  const totalEVYield = stats?.reduce((sum, s) => sum + (s?.effort || 0), 0) || 0;

  // Gender calculation
  let genderInfo;
  if (gender_rate === -1) {
    genderInfo = "Genderless";
  } else if (gender_rate !== undefined) {
    const femaleChance = (gender_rate / 8) * 100;
    const maleChance = 100 - femaleChance;
    genderInfo = `Male: ${maleChance.toFixed(0)}%, Female: ${femaleChance.toFixed(0)}%`;
  } else {
    genderInfo = "Unknown";
  }

  // Get level-up moves safely
  const levelUpMoves = (moves || [])
    .filter(move => 
      move?.version_group_details?.some(
        d => d?.move_learn_method?.name === 'level-up' && d?.level_learned_at > 0
      )
    )
    .map(move => {
      const detail = move?.version_group_details?.find(
        d => d?.move_learn_method?.name === 'level-up' && d?.level_learned_at > 0
      );
      return {
        ...move,
        level: detail?.level_learned_at || 0
      };
    })
    .sort((a, b) => a.level - b.level)
    .slice(0, 10);

  // Calculate catch rate percentage
  const catchRatePercentage = capture_rate ? ((capture_rate / 255) * 100).toFixed(1) : '?';

  // Set theme based on primary type (with fallback)
  const primaryType = types?.[0]?.type?.name;
  const theme = primaryType ? (typeColors[primaryType] || defaultTheme) : defaultTheme;

  // Load caught status from localStorage on mount
  useEffect(() => {
    if (!id) return;
    
    const saved = localStorage.getItem('caughtPokemon');
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        if (savedData[id]) {
          setCaughtStatus(savedData[id]);
        }
      } catch (e) {
        console.error('Error loading caught status from localStorage', e);
      }
    }
  }, [id]);

  // Update caught status
  const updateCaughtStatus = (type, variant = 'default') => {
    const newStatus = {
      ...caughtStatus,
      [variant]: {
        ...(caughtStatus[variant] || {
          regular: false,
          shiny: false
        }),
        [type]: !caughtStatus[variant]?.[type]
      }
    };
    setCaughtStatus(newStatus);

    // Update localStorage with the new status
    try {
      const saved = localStorage.getItem('caughtPokemon');
      const savedData = saved ? JSON.parse(saved) : {};
      savedData[id] = {
        ...savedData[id],
        [variant]: newStatus[variant]
      };
      localStorage.setItem('caughtPokemon', JSON.stringify(savedData));
    } catch (e) {
      console.error('Error saving caught status to localStorage', e);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-rounded`}>
      <Head>
        <title>{properCase(name)} | PokéTracker</title>
        <meta name="description" content={`View and track ${properCase(name)} in your Pokédex`} />
      </Head>
      
      {/* Top Navigation Bar */}
      <div className={`${theme.accent || 'bg-gray-700'} p-4 shadow-lg`}>
        <Link href="/">
          <a className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-2xl">←</span>
            <span>National Pokédex</span>
          </a>
        </Link>
      </div>

      <div className="container mx-auto p-4 space-y-8">
        {/* Header with Pokemon Artwork and Basic Info */}
        <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6 mb-6 flex flex-col md:flex-row items-center`}>
          <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            <div className="relative w-64 h-64 mb-4">
              {displaySprite && (
                <Image
                  src={displaySprite}
                  alt={`${name} sprite`}
                  width={256}
                  height={256}
                  className="drop-shadow-2xl"
                  priority
                  sizes="(max-width: 640px) 256px, 512px"
                />
              )}
            </div>
            
            {/* Shiny toggle */}
            <button
              onClick={() => setIsShiny(!isShiny)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isShiny 
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {isShiny ? 'Shiny ✨' : 'Regular'}
            </button>
            
            {/* Catch buttons */}
            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => updateCaughtStatus('regular')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  caughtStatus.default?.regular
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {caughtStatus.default?.regular ? 'Caught ✓' : 'Mark as Caught'}
              </button>
              
              <button
                onClick={() => updateCaughtStatus('shiny')}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  caughtStatus.default?.shiny
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {caughtStatus.default?.shiny ? 'Shiny ✓' : 'Mark as Shiny'}
              </button>
            </div>
          </div>
          
          <div className="md:w-2/3 md:pl-8">
            <div className="flex items-center mb-2">
              <h1 className="text-4xl font-bold capitalize mr-3">
                {name?.replace('-', ' ') || 'Unknown Pokémon'}
              </h1>
              <span className="text-2xl text-red-400 font-mono">
                #{id?.toString().padStart(3, '0') || '???'}
              </span>
            </div>
            
            {englishGenus && (
              <p className="text-xl text-red-400 mb-4">{englishGenus}</p>
            )}
            
            <div className="flex gap-2 mb-4">
              {(types || []).map((t, index) => (
                <span
                  key={index}
                  className={`${typeColors[t?.type?.name]?.accent || 'bg-gray-600'} px-3 py-1 rounded-full text-white capitalize`}
                >
                  {t?.type?.name || 'unknown'}
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
                {(abilities || []).map((a, index) => (
                  <span
                    key={index}
                    className={`bg-gray-700 px-3 py-1 rounded-full text-white ${
                      a?.is_hidden ? 'border border-red-400' : ''
                    }`}
                  >
                    {properCase(a?.ability?.name || '')}
                    {a?.is_hidden && <span className="text-red-400 ml-1">(Hidden)</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pokédex Entry and Cries */}
        {englishEntry && (
          <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6 mb-6`}>
            <h2 className="text-2xl font-bold mb-4">Pokédex Entry</h2>
            <p className="text-lg leading-relaxed mb-6">{englishEntry}</p>
            
            {cries && (cries.latest || cries.legacy) && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-400">Cries</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cries.latest && <PokemonCry src={cries.latest} label="Latest Cry" theme={theme} />}
                  {cries.legacy && <PokemonCry src={cries.legacy} label="Legacy Cry" theme={theme} />}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Grid: Training & Breeding */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Training */}
          <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
            <h2 className="text-2xl font-bold mb-4">Training</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IconSet.Experience />
                <p className="text-gray-400">Base Experience</p>
                <p className="text-xl">{base_experience || '?'}</p>
              </div>
              <div className="flex items-center gap-2">
                <IconSet.CatchRate />
                <p className="text-gray-400">Catch Rate</p>
                <p className="text-xl">
                  {capture_rate || '?'} ({catchRatePercentage}% with a Poké Ball at full HP)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <IconSet.Friendship />
                <p className="text-gray-400">Base Friendship</p>
                <p className="text-xl">{base_happiness || '?'}</p>
              </div>
              <div className="flex items-center gap-2">
                <IconSet.GrowthRate />
                <p className="text-gray-400">Growth Rate</p>
                <p className="text-xl capitalize">{growth_rate?.name?.replace('-', ' ') || '?'}</p>
              </div>
              <div className="flex items-center gap-2">
                <IconSet.EVYield />
                <p className="text-gray-400">EV Yield</p>
                <p className="text-xl">{totalEVYield}</p>
              </div>
            </div>
          </div>

          {/* Breeding */}
          <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
            <h2 className="text-2xl font-bold mb-4">Breeding</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IconSet.EggGroups />
                <p className="text-gray-400">Egg Groups</p>
                <p className="text-xl capitalize">
                  {(egg_groups || []).map(group => group?.name || '').filter(Boolean).join(', ') || '?'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <IconSet.Gender />
                <p className="text-gray-400">Gender Distribution</p>
                <p className="text-xl">{genderInfo}</p>
              </div>
              <div className="flex items-center gap-2">
                <IconSet.EggCycles />
                <p className="text-gray-400">Egg Cycles</p>
                <p className="text-xl">
                  {hatch_counter !== undefined ? `${hatch_counter} (${hatch_counter * 257} steps)` : '?'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Base Stats */}
        <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6 mb-6`}>
          <div className="flex items-center gap-2 mb-4">
            <IconSet.Stats />
            <h2 className="text-2xl font-bold">Base Stats</h2>
          </div>
          <div className="grid gap-4">
            {(stats || []).map((stat, index) => {
              if (!stat?.stat?.name) return null;
              
              const percentage = stat.base_stat ? (stat.base_stat / 255) * 100 : 0;
              const statIcons = {
                hp: "❤️",
                attack: "⚔️",
                defense: "🛡️",
                "special-attack": "✨",
                "special-defense": "🔮",
                speed: "⚡"
              };
              
              return (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize text-gray-400 flex items-center gap-2">
                      {statIcons[stat.stat.name] || "📊"}
                      {formatStatName(stat.stat.name)}
                    </span>
                    <span>{stat.base_stat || 0}</span>
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

        {/* Evolution Chain */}
        {evolutionChain && (
          <section className={`${theme.bg} bg-opacity-50 rounded-lg p-6 shadow-lg`}>
            <h2 className="text-3xl font-bold mb-6">Evolution Chain</h2>
            <EvolutionChain chain={evolutionChain} currentPokemonId={pokemon.id} />
          </section>
        )}

        {/* Moves */}
        <section className={`${theme.bg} bg-opacity-50 rounded-lg p-6 shadow-lg`}>
          <h2 className="text-3xl font-bold mb-6">Moves</h2>
          {levelUpMoves.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {levelUpMoves.map((move, index) => {
                // This is the key fix - safely get the move type or default to 'normal'
                const moveName = move?.move?.name || 'unknown';
                // Default to 'normal' type if not available
                const moveType = 'normal';
                const moveColorClass = moveTypeColors[moveType] || 'bg-gray-500';
                
                return (
                  <div
                    key={index}
                    className={`${moveColorClass} bg-opacity-90 p-4 rounded-xl flex justify-between items-center shadow-lg text-white`}
                  >
                    <div>
                      <span className="text-lg font-semibold capitalize">
                        {moveName.replace('-', ' ')}
                      </span>
                      <div className="text-sm opacity-90">
                        {moveType}
                      </div>
                    </div>
                    <span className="text-xl font-bold">
                      Lv. {move.level || '?'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-400">No level-up moves data available</p>
          )}
        </section>

        {/* Alternative Forms (simplified) */}
        {alternativeForms && alternativeForms.length > 0 && (
          <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6 mt-6`}>
            <h2 className="text-2xl font-bold mb-6">Alternative Forms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alternativeForms.map((form, index) => {
                if (!form) return null;
                
                const formSprite = form.sprites?.other?.['official-artwork']?.front_default || 
                                  form.sprites?.front_default;
                
                // Format form name for display
                const formName = form.formName || '';
                const baseName = pokemon.name || '';
                const formSpecific = formName.replace(baseName + '-', '');
                
                // Format form name for display
                const formDisplayName = (() => {
                  // Special cases
                  if (formSpecific.includes('mega')) return 'Mega';
                  if (formSpecific.includes('mega-x')) return 'Mega X';
                  if (formSpecific.includes('mega-y')) return 'Mega Y';
                  if (formSpecific.includes('gmax')) return 'Gigantamax';
                  if (formSpecific.includes('alola')) return 'Alolan Form';
                  if (formSpecific.includes('galar')) return 'Galarian Form';
                  if (formSpecific.includes('hisui')) return 'Hisuian Form';
                  if (formSpecific.includes('paldea')) return 'Paldean Form';

                  // Capitalize and clean up remaining cases
                  return formSpecific
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ') + ' Form';
                })();
                
                return (
                  <div key={index} className={`${theme.bg} bg-opacity-50 rounded-lg p-4`}>
                    <h3 className="text-xl font-semibold mb-4 text-center">
                      {formDisplayName}
                    </h3>
                    <div className="flex flex-col items-center">
                      {formSprite && (
                        <div className="bg-gray-700 p-4 rounded-lg relative w-40 h-40 mb-4">
                          <img
                            src={formSprite}
                            alt={`${formName}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateCaughtStatus('regular', formName)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            caughtStatus[formName]?.regular 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                          }`}
                        >
                          {caughtStatus[formName]?.regular ? 'Caught ✓' : 'Mark as Caught'}
                        </button>
                        
                        <button
                          onClick={() => updateCaughtStatus('shiny', formName)}
                          className={`px-3 py-1 rounded-md text-sm ${
                            caughtStatus[formName]?.shiny 
                              ? 'bg-yellow-500 text-black' 
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                          }`}
                        >
                          {caughtStatus[formName]?.shiny ? 'Shiny ✓' : 'Mark as Shiny'}
                        </button>
                      </div>
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

// Server-side data fetching with fixed serialization
export async function getStaticPaths() {
  // Return empty paths array for incremental static regeneration
  return { 
    paths: [],
    fallback: 'blocking' // On-demand rendering for Pokemon pages
  };
}

export async function getStaticProps({ params }) {
  try {
    const specialCases = {
      'deoxys': 'deoxys-normal',
      'wormadam': 'wormadam-plant',
      'giratina': 'giratina-altered',
      'shaymin': 'shaymin-land',
      'basculin': 'basculin-red-striped',
      'darmanitan': 'darmanitan-standard',
      'tornadus': 'tornadus-incarnate',
      'thundurus': 'thundurus-incarnate',
      'landorus': 'landorus-incarnate',
      'keldeo': 'keldeo-ordinary',
      'meloetta': 'meloetta-aria',
      'meowstic': 'meowstic-male',
      'aegislash': 'aegislash-shield',
      'pumpkaboo': 'pumpkaboo-average',
      'gourgeist': 'gourgeist-average',
      'urshifu': 'urshifu-single-strike',
      'enamorus': 'enamorus-incarnate',
      'oricorio': 'oricorio-baile',
      'lycanroc': 'lycanroc-midday',
      'wishiwashi': 'wishiwashi-solo',
      'minior': 'minior-red-meteor',
      'toxtricity': 'toxtricity-amped'
    };

    const pokemonName = specialCases[params.name] || params.name;
    
    // Fetch basic Pokemon data
    const resPokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    if (!resPokemon.ok) throw new Error('Failed to fetch Pokemon');
    const pokemonData = await resPokemon.json();
    
    // Extract only serializable data
    const pokemon = {
      id: pokemonData.id,
      name: pokemonData.name,
      height: pokemonData.height,
      weight: pokemonData.weight,
      base_experience: pokemonData.base_experience,
      types: pokemonData.types.map(t => ({
        type: { name: t.type.name }
      })),
      stats: pokemonData.stats.map(s => ({
        base_stat: s.base_stat,
        effort: s.effort,
        stat: { name: s.stat.name }
      })),
      abilities: pokemonData.abilities.map(a => ({
        ability: { name: a.ability.name },
        is_hidden: a.is_hidden
      })),
      moves: pokemonData.moves.map(m => ({
        move: { name: m.move.name },
        version_group_details: m.version_group_details.map(vgd => ({
          level_learned_at: vgd.level_learned_at,
          move_learn_method: { name: vgd.move_learn_method.name }
        }))
      })),
      sprites: pokemonData.sprites,
      species: { url: pokemonData.species.url }
    };
    
    // Fetch species data
    const resSpecies = await fetch(pokemon.species.url);
    if (!resSpecies.ok) throw new Error('Failed to fetch species');
    const speciesData = await resSpecies.json();
    
    // Extract only serializable data
    const species = {
      id: speciesData.id,
      name: speciesData.name,
      base_happiness: speciesData.base_happiness,
      capture_rate: speciesData.capture_rate,
      gender_rate: speciesData.gender_rate,
      hatch_counter: speciesData.hatch_counter,
      has_gender_differences: speciesData.has_gender_differences,
      egg_groups: speciesData.egg_groups,
      flavor_text_entries: speciesData.flavor_text_entries,
      genera: speciesData.genera,
      growth_rate: speciesData.growth_rate,
      evolution_chain: speciesData.evolution_chain,
      varieties: speciesData.varieties
    };
    
    // Fetch evolution chain data
    let evolutionChain = null;
    try {
      const evolutionChainRes = await fetch(species.evolution_chain.url);
      if (evolutionChainRes.ok) {
        const evolutionChainData = await evolutionChainRes.json();
        evolutionChain = evolutionChainData.chain;
      }
    } catch (error) {
      console.error('Error fetching evolution chain:', error);
    }
    
    // Fetch alternative forms
    let alternativeForms = [];
    try {
      const formPromises = species.varieties
        .filter(v => v.pokemon.name !== pokemonName)
        .map(async (variety) => {
          try {
            const resForm = await fetch(variety.pokemon.url);
            if (!resForm.ok) return null;
            const formData = await resForm.json();
            
            return {
              id: formData.id,
              formName: variety.pokemon.name,
              sprites: formData.sprites,
              types: formData.types.map(t => ({
                type: { name: t.type.name }
              }))
            };
          } catch (error) {
            console.error(`Error fetching form data for ${variety.pokemon.name}:`, error);
            return null;
          }
        });
        
      const forms = await Promise.all(formPromises);
      alternativeForms = forms.filter(Boolean);
    } catch (error) {
      console.error('Error processing form data:', error);
    }
    
    // Ensure data is serializable
    return {
      props: JSON.parse(JSON.stringify({
        pokemon,
        species,
        alternativeForms,
        evolutionChain,
        currentUser: currentUserPlaceholder
      })),
      revalidate: 86400 // Revalidate once per day
    };
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return { notFound: true };
  }
}