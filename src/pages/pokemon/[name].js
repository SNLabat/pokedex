// pages/pokemon/[name].js
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import pokeballOutline from '/public/img/pokeballoutline.png';

// Remove the Heroicons import and use this custom IconSet component
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

// Add the enhanced typeColors object
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

// Add the SpriteToggleGroup component at the top
const SpriteToggleGroup = ({ isAnimated, isShiny, onAnimatedChange, onShinyChange, hasAnimated, hasShiny, theme }) => (
  <div className="flex flex-col gap-2">
    {/* Main sprite type toggles */}
    <div className="inline-flex rounded-lg shadow-lg" role="group">
      <button
        onClick={() => onShinyChange(false)}
        className={`px-4 py-2 text-sm font-medium rounded-l-lg border-2 transition-colors
          ${!isShiny 
            ? `${theme.accent} ${theme.text}`
            : `${theme.bg} opacity-75 hover:opacity-100`
          }`}
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

// Add utility functions at the top
const properCase = (str) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatStatName = (statName) => {
  if (statName === 'hp') return 'HP';
  return properCase(statName);
};

// Add enhanced PokemonCry component with iOS detection
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

const EvolutionChain = ({ chain, currentPokemonId }) => {
  const renderEvolution = (evolution) => {
    const isCurrentPokemon = evolution.species.url.split('/').slice(-2, -1)[0] === currentPokemonId.toString();
    
    return (
      <div className="flex flex-col items-center">
        <Link href={`/pokemon/${evolution.species.name}`}>
          <a className="flex flex-col items-center p-2 rounded-lg transition-transform hover:scale-105">
            <div className="w-20 h-20 relative">
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evolution.species.url.split('/').slice(-2, -1)[0]}.png`}
                alt={evolution.species.name}
                layout="fill"
                objectFit="contain"
              />
            </div>
            <span className={`mt-2 capitalize text-sm ${isCurrentPokemon ? 'border-b-2 border-current' : ''}`}>
              {evolution.species.name.replace(/-/g, ' ')}
            </span>
            {evolution.min_level && (
              <span className="text-xs opacity-75">Level {evolution.min_level}</span>
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
    const evolutions = [];
    let currentEvo = evolution;

    while (currentEvo) {
      evolutions.push(renderEvolution(currentEvo));
      currentEvo = currentEvo.evolves_to[0]; // Follow the first evolution path
    }

    // For split evolutions (like Eevee), render them in rows
    const splitEvolutions = evolution.evolves_to.slice(1);
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

// Update the moveTypeColors object with more vibrant colors
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

// Add this new component
const CatchButton = ({ isCaught, isShiny, onClick, theme }) => (
  <button
    onClick={onClick}
    className={`absolute bottom-2 right-2 p-1 rounded-full transition-all
      ${isCaught ? 
        (isShiny ? 'bg-yellow-500' : 'bg-green-500') : 
        'bg-gray-700 hover:bg-gray-600'}`}
  >
    <div className="w-6 h-6 relative">
      <Image
        src={pokeballOutline}
        alt="Catch status"
        layout="fill"
        className={`transition-transform ${isCaught ? 'scale-100' : 'scale-90'}`}
        unoptimized
      />
    </div>
  </button>
);

export default function PokemonDetail({ pokemon, species, alternativeForms, evolutionChain }) {
  const [isShiny, setIsShiny] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [caughtStatus, setCaughtStatus] = useState({
    default: {
      regular: false,
      shiny: false
    },
    forms: {}
  });

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
  const staticSprites = {
    regular: sprites.other?.['official-artwork']?.front_default || sprites.front_default,
    shiny: sprites.other?.['official-artwork']?.front_shiny || sprites.front_shiny
  };

  // Get 3D animated models (Gen VI+)
  const animatedSprites = {
    regular: sprites.other?.['showdown']?.front_default || 
            sprites.versions?.['generation-viii']?.['icons']?.front_default ||
            sprites.versions?.['generation-vii']?.['ultra-sun-ultra-moon']?.front_default,
    shiny: sprites.other?.['showdown']?.front_shiny ||
           sprites.versions?.['generation-viii']?.['icons']?.front_shiny ||
           sprites.versions?.['generation-vii']?.['ultra-sun-ultra-moon']?.front_shiny
  };

  // Home 3D Models
  const homeSprites = {
    regular: sprites.other?.['home']?.front_default,
    shiny: sprites.other?.['home']?.front_shiny
  };

  // Determine which sprite to display based on state
  const displaySprite = isAnimated
    ? (isShiny ? animatedSprites.shiny : animatedSprites.regular)
    : (isShiny ? staticSprites.shiny : staticSprites.regular);

  // Check sprite availability
  const hasAnimatedSprites = Boolean(animatedSprites.regular);
  const hasShinySprites = Boolean(staticSprites.shiny || animatedSprites.shiny);
  const hasHomeModels = Boolean(homeSprites.regular);

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

  // Sort level up moves by level
  const levelUpMoves = moves
    .filter(move => 
      move.version_group_details.some(
        d => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0
      )
    )
    .map(move => {
      const detail = move.version_group_details.find(
        d => d.move_learn_method.name === 'level-up' && d.level_learned_at > 0
      );
      return {
        ...move,
        level: detail.level_learned_at
      };
    })
    .sort((a, b) => a.level - b.level)
    .slice(0, 10);

  // Calculate catch rate percentage
  const catchRatePercentage = (catch_rate / 255 * 100).toFixed(1);

  // Add theme selection based on primary type
  const primaryType = pokemon.types[0].type.name;
  const theme = typeColors[primaryType] || typeColors.normal;

  // Load caught status from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('caughtPokemon');
    if (saved) {
      const savedData = JSON.parse(saved);
      if (savedData[id]) {
        setCaughtStatus(savedData[id]);
      }
    }
  }, [id]);

  // Save to localStorage whenever status changes
  const updateCaughtStatus = (type, formName = 'default') => {
    const newStatus = {
      ...caughtStatus,
      [formName]: {
        ...caughtStatus[formName] || { regular: false, shiny: false },
        [type]: !caughtStatus[formName]?.[type]
      }
    };
    setCaughtStatus(newStatus);

    const saved = localStorage.getItem('caughtPokemon');
    const savedData = saved ? JSON.parse(saved) : {};
    savedData[id] = newStatus;
    localStorage.setItem('caughtPokemon', JSON.stringify(savedData));
  };

  // Export function that includes all Pokemon data
  const exportToCSV = () => {
    const saved = localStorage.getItem('caughtPokemon');
    const caughtData = saved ? JSON.parse(saved) : {};

    const headers = [
      'Pokedex Number',
      'Name',
      'Regular Caught',
      'Shiny Caught',
      'Types',
      'Height',
      'Weight',
      'Base Stats (HP/Atk/Def/SpA/SpD/Spd)',
      'Abilities'
    ];

    const row = [
      id.toString().padStart(3, '0'),
      name,
      caughtData[id]?.regular ? 'Yes' : 'No',
      caughtData[id]?.shiny ? 'Yes' : 'No',
      types.map(t => t.type.name).join('/'),
      heightMeters,
      weightKg,
      stats.map(s => s.base_stat).join('/'),
      abilities.map(a => a.ability.name).join(', ')
    ];

    const csvContent = [
      headers.join(','),
      row.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pokemon_${id}_${name}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper function to get form name
  const getFormDisplayName = (formName) => {
    const baseName = pokemon.name;
    const formSpecific = formName.replace(baseName + '-', '');
    
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
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-rounded`}>
      {/* Top Red Bar with Navigation */}
      <div className={`${theme.accent} p-4 shadow-lg`}>
        <Link href="/">
          <a className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-2xl">←</span>
            <span>National Pokédex</span>
          </a>
        </Link>
      </div>

      <div className="container mx-auto p-4 space-y-8">
        {/* Header: Artwork and Basic Info */}
        <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6 mb-6 flex flex-col md:flex-row items-center`}>
          <div className="md:w-1/3 flex flex-col items-center mb-6 md:mb-0">
            <div className="relative w-64 h-64 mb-4">
              <Image
                src={displaySprite}
                alt={`${name} sprite`}
                width={256}
                height={256}
                className="drop-shadow-2xl"
                priority
                sizes="(max-width: 640px) 256px, 512px"
              />
            </div>
            <SpriteToggleGroup
              isAnimated={isAnimated}
              isShiny={isShiny}
              onAnimatedChange={setIsAnimated}
              onShinyChange={setIsShiny}
              hasAnimated={hasAnimatedSprites}
              hasShiny={hasShinySprites}
              theme={theme}
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
                  className={`${typeColors[t.type.name].accent} px-3 py-1 rounded-full text-white capitalize`}
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
                    {properCase(a.ability.name)}
                    {a.is_hidden && <span className="text-red-400 ml-1">(Hidden)</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Combined Pokédex Entry and Cries section */}
        {cries && (cries.latest || cries.legacy) && (
          <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6 mb-6`}>
            {englishEntry && (
              <>
                <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Pokédex Entry</h2>
                <p className="text-lg leading-relaxed mb-6">{englishEntry}</p>
              </>
            )}
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-400">Cries</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cries.latest && <PokemonCry src={cries.latest} label="Latest Cry" theme={theme} />}
                {cries.legacy && <PokemonCry src={cries.legacy} label="Legacy Cry" theme={theme} />}
              </div>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Training */}
          <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Training</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IconSet.Experience />
                <p className="text-gray-400">Base Experience</p>
                <p className="text-xl">{base_experience}</p>
              </div>
              <div className="flex items-center gap-2">
                <IconSet.CatchRate />
                <p className="text-gray-400">Catch Rate</p>
                <p className="text-xl">
                  {catch_rate} ({catchRatePercentage}% with a Poké Ball at full HP)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <IconSet.Friendship />
                <p className="text-gray-400">Base Friendship</p>
                <p className="text-xl">{base_happiness}</p>
              </div>
              <div className="flex items-center gap-2">
                <IconSet.GrowthRate />
                <p className="text-gray-400">Growth Rate</p>
                <p className="text-xl capitalize">{growth_rate.name.replace('-', ' ')}</p>
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
            <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Breeding</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IconSet.EggGroups />
                <p className="text-gray-400">Egg Groups</p>
                <p className="text-xl capitalize">
                  {egg_groups.map(group => group.name).join(', ')}
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
                <p className="text-xl">{hatch_counter} ({hatch_counter * 257} steps)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Base Stats */}
        <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6 mb-6`}>
          <div className="flex items-center gap-2 mb-4">
            <IconSet.Stats />
            <h2 className={`text-2xl font-bold ${theme.accent}`}>Base Stats</h2>
          </div>
          <div className="grid gap-4">
            {stats.map(stat => {
              const percentage = (stat.base_stat / 255) * 100;
              const statIcons = {
                hp: "❤️",
                attack: "⚔️",
                defense: "🛡️",
                "special-attack": "✨",
                "special-defense": "🔮",
                speed: "⚡"
              };
              return (
                <div key={stat.stat.name}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize text-gray-400 flex items-center gap-2">
                      {statIcons[stat.stat.name]}
                      {formatStatName(stat.stat.name)}
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

        {/* Evolution Chain */}
        {evolutionChain && (
          <section className={`${theme.bg} bg-opacity-50 rounded-lg p-6 shadow-lg`}>
            <h2 className={`text-3xl font-bold mb-6 ${theme.accent}`}>Evolution Chain</h2>
            <EvolutionChain chain={evolutionChain} currentPokemonId={pokemon.id} />
          </section>
        )}

        {/* Update the moves section to use the new styling */}
        <section className={`${theme.bg} bg-opacity-50 rounded-lg p-6 shadow-lg`}>
          <h2 className={`text-3xl font-bold mb-6 ${theme.accent}`}>Moves</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {levelUpMoves.map(move => {
              const moveType = move.move.type || 'normal'; // Default to normal if type is unknown
              return (
                <div
                  key={move.move.name}
                  className={`${moveTypeColors[moveType]} bg-opacity-90 p-4 rounded-xl flex justify-between items-center shadow-lg text-white`}
                >
                  <div>
                    <span className="text-lg font-semibold capitalize">
                      {move.move.name.replace('-', ' ')}
                    </span>
                    <div className="text-sm opacity-90">
                      {moveType}
                    </div>
                  </div>
                  <span className="text-xl font-bold">
                    Lv. {move.level}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Updated Sprites section */}
        <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
          <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Sprites & Models</h2>
          <div className="space-y-8">
            {/* Static Official Artwork */}
            <div>
              <h3 className="text-xl font-semibold text-gray-400 mb-4">Official Artwork</h3>
              <div className="grid grid-cols-2 gap-4">
                {staticSprites.regular && (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg relative">
                      <img
                        src={staticSprites.regular}
                        alt={`${name} official artwork`}
                        className="w-32 h-32 object-contain"
                      />
                      <CatchButton
                        isCaught={caughtStatus.default.regular}
                        isShiny={false}
                        onClick={() => updateCaughtStatus('regular')}
                        theme={theme}
                      />
                    </div>
                    <p className="mt-2 text-gray-400">Regular</p>
                  </div>
                )}
                {staticSprites.shiny && (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg relative">
                      <img
                        src={staticSprites.shiny}
                        alt={`${name} shiny official artwork`}
                        className="w-32 h-32 object-contain"
                      />
                      <CatchButton
                        isCaught={caughtStatus.default.shiny}
                        isShiny={true}
                        onClick={() => updateCaughtStatus('shiny')}
                        theme={theme}
                      />
                    </div>
                    <p className="mt-2 text-gray-400">Shiny</p>
                  </div>
                )}
              </div>
            </div>

            {/* Home 3D Models */}
            {hasHomeModels && (
              <div>
                <h3 className="text-xl font-semibold text-gray-400 mb-4">HOME 3D Models</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg relative">
                      <img
                        src={homeSprites.regular}
                        alt={`${name} HOME model`}
                        className="w-32 h-32 object-contain"
                      />
                      <CatchButton
                        isCaught={caughtStatus.default.regular}
                        isShiny={false}
                        onClick={() => updateCaughtStatus('regular')}
                        theme={theme}
                      />
                    </div>
                    <p className="mt-2 text-gray-400">Regular</p>
                  </div>
                  {homeSprites.shiny && (
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-700 p-4 rounded-lg relative">
                        <img
                          src={homeSprites.shiny}
                          alt={`${name} shiny HOME model`}
                          className="w-32 h-32 object-contain"
                        />
                        <CatchButton
                          isCaught={caughtStatus.default.shiny}
                          isShiny={true}
                          onClick={() => updateCaughtStatus('shiny')}
                          theme={theme}
                        />
                      </div>
                      <p className="mt-2 text-gray-400">Shiny</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Game Sprites */}
            {hasAnimatedSprites && (
              <div>
                <h3 className="text-xl font-semibold text-gray-400 mb-4">Game Models</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg relative">
                      <img
                        src={animatedSprites.regular}
                        alt={`${name} game model`}
                        className="w-32 h-32 object-contain"
                      />
                      <CatchButton
                        isCaught={caughtStatus.default.regular}
                        isShiny={false}
                        onClick={() => updateCaughtStatus('regular')}
                        theme={theme}
                      />
                    </div>
                    <p className="mt-2 text-gray-400">Regular</p>
                  </div>
                  {animatedSprites.shiny && (
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-700 p-4 rounded-lg relative">
                        <img
                          src={animatedSprites.shiny}
                          alt={`${name} shiny game model`}
                          className="w-32 h-32 object-contain"
                        />
                        <CatchButton
                          isCaught={caughtStatus.default.shiny}
                          isShiny={true}
                          onClick={() => updateCaughtStatus('shiny')}
                          theme={theme}
                        />
                      </div>
                      <p className="mt-2 text-gray-400">Shiny</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Classic Sprites */}
            <div>
              <h3 className="text-xl font-semibold text-gray-400 mb-4">Classic Sprites</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {sprites.front_default && (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <img
                        src={sprites.front_default}
                        alt={`${name} front sprite`}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <p className="mt-2 text-gray-400">Front</p>
                  </div>
                )}
                {sprites.back_default && (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <img
                        src={sprites.back_default}
                        alt={`${name} back sprite`}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <p className="mt-2 text-gray-400">Back</p>
                  </div>
                )}
                {sprites.front_shiny && (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <img
                        src={sprites.front_shiny}
                        alt={`${name} shiny front sprite`}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <p className="mt-2 text-gray-400">Shiny Front</p>
                  </div>
                )}
                {sprites.back_shiny && (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <img
                        src={sprites.back_shiny}
                        alt={`${name} shiny back sprite`}
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <p className="mt-2 text-gray-400">Shiny Back</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alternative Forms Section */}
        {alternativeForms.length > 0 && (
          <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6 mt-6`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme.accent}`}>Alternative Forms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alternativeForms.map((form) => {
                const formSprite = form.sprites.other?.['official-artwork']?.front_default || 
                                 form.sprites.front_default;
                const shinySprite = form.sprites.other?.['official-artwork']?.front_shiny ||
                                  form.sprites.front_shiny;
                
                return (
                  <div key={form.formName} className={`${theme.bg} bg-opacity-50 rounded-lg p-4`}>
                    <h3 className="text-xl font-semibold mb-4 text-center">
                      {getFormDisplayName(form.formName)}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {formSprite && (
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <img
                              src={formSprite}
                              alt={`${form.formName} regular`}
                              className="w-32 h-32 object-contain"
                            />
                          </div>
                          <p className="mt-2 text-gray-400">Regular</p>
                        </div>
                      )}
                      {shinySprite && (
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-800 p-4 rounded-lg">
                            <img
                              src={shinySprite}
                              alt={`${form.formName} shiny`}
                              className="w-32 h-32 object-contain"
                            />
                          </div>
                          <p className="mt-2 text-gray-400">Shiny</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Form-specific catch status */}
                    <div className="mt-4 flex justify-center gap-4">
                      <button
                        onClick={() => updateCaughtStatus('regular', form.formName)}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          caughtStatus[form.formName]?.regular 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      >
                        <span>{caughtStatus[form.formName]?.regular ? '✓' : '○'}</span>
                        Regular
                      </button>
                      {shinySprite && (
                        <button
                          onClick={() => updateCaughtStatus('shiny', form.formName)}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                            caughtStatus[form.formName]?.shiny 
                              ? 'bg-yellow-500 hover:bg-yellow-600' 
                              : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        >
                          <span>{caughtStatus[form.formName]?.shiny ? '✓' : '○'}</span>
                          Shiny
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Export Data */}
        <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
          <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Export Data</h2>
          <button
            onClick={exportToCSV}
            className="bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Export Data
          </button>
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

    const resPokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    if (!resPokemon.ok) {
      throw new Error('Failed to fetch Pokemon');
    }
    const pokemon = await resPokemon.json();

    const resSpecies = await fetch(pokemon.species.url);
    if (!resSpecies.ok) {
      throw new Error('Failed to fetch species');
    }
    const species = await resSpecies.json();

    const evolutionChainRes = await fetch(species.evolution_chain.url);
    if (!evolutionChainRes.ok) {
      throw new Error('Failed to fetch evolution chain');
    }
    const evolutionChainData = await evolutionChainRes.json();

    const forms = await Promise.all(
      species.varieties.map(async (variety) => {
        const resForm = await fetch(variety.pokemon.url);
        if (!resForm.ok) return null;
        const formData = await resForm.json();
        return {
          ...formData,
          formName: variety.pokemon.name
        };
      })
    );

    const alternativeForms = forms.filter(
      form => form && form.formName !== params.name
    );

    return {
      props: {
        pokemon,
        species,
        alternativeForms,
        evolutionChain: evolutionChainData.chain
      },
      revalidate: 86400
    };
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return { notFound: true };
  }
}