// pages/pokemon/[name].js
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import pokeballOutline from '/public/img/pokeballoutline.png';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Import the new components
import EnhancedTrackingPanel from '../../components/EnhancedTrackingPanel';
import LocationEncounterData from '../../components/LocationEncounterData';
import { syncLocalToCloud, syncCloudToLocal, getCurrentUser } from '../../lib/dataManagement';

// Add this near the top of the file with other constants
const guaranteedAlphas = [
  'kleavor',
  'lilligant', // Hisuian Lilligant
  'arcanine', // Hisuian Arcanine
  'electrode', // Hisuian Electrode
  'avalugg', // Hisuian Avalugg
  'goodra', // Hisuian Goodra
  'braviary', // Hisuian Braviary
  'zoroark', // Hisuian Zoroark
  'wyrdeer',
  'basculegion',
  'sneasler',
  'overqwil',
  'enamorus'
];

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
const CatchButton = ({ isCaught, isShiny, isAlpha, onClick, theme }) => (
  <button
    onClick={onClick}
    className={`absolute bottom-2 right-2 p-1 rounded-full transition-all
      ${isCaught ? 
        (isShiny ? 'bg-yellow-500' : isAlpha ? 'bg-red-500' : 'bg-green-500') : 
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

// Add this new component for form variants
const FormCatchButton = ({ formName, type, caughtStatus, updateCaughtStatus, theme }) => {
  const isCaught = caughtStatus[formName]?.[type] || false;
  const isShiny = type.includes('Shiny');
  const isAlpha = type.includes('alpha');
  
  return (
    <CatchButton
      isCaught={isCaught}
      isShiny={isShiny}
      isAlpha={isAlpha}
      onClick={() => updateCaughtStatus(type, formName)}
      theme={theme}
    />
  );
};

// Keep this outside the component
const hasAlphaForm = (pokemonName) => {
  return guaranteedAlphas.includes(pokemonName.toLowerCase());
};

export default function PokemonDetail({ pokemon, species, alternativeForms, evolutionChain }) {
  // Move getHisuianSprite inside the component
  const getHisuianSprite = (pokemon) => {
    const hisuianForm = alternativeForms?.find(f => 
      f.formName.toLowerCase().includes('hisui')
    );
    return hisuianForm?.sprites.other?.['official-artwork'] || pokemon.sprites.other?.['official-artwork'];
  };

  const router = useRouter();
  const [isShiny, setIsShiny] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [user, setUser] = useState(null);
  const id = pokemon.id;
  const name = pokemon.name.replace(/-/g, ' ');
  const types = pokemon.types.map(t => t.type.name);
  const stats = pokemon.stats;
  const abilities = pokemon.abilities;
  const height = pokemon.height / 10; // convert to meters
  const weight = pokemon.weight / 10; // convert to kg

  // Extract flavor text in English
  const flavorText = species.flavor_text_entries.find(
    entry => entry.language.name === 'en'
  )?.flavor_text.replace(/\f/g, ' ') || 'No description available.';

  // Extract category (genus) in English
  const category = species.genera.find(
    genus => genus.language.name === 'en'
  )?.genus || 'Unknown';

  // Game version color theme
  const colorThemes = {
    red: {
      bg: 'bg-red-900',
      text: 'text-red-400',
      accent: 'text-red-500',
      border: 'border-red-500'
    },
    blue: {
      bg: 'bg-blue-900',
      text: 'text-blue-400',
      accent: 'text-blue-500',
      border: 'border-blue-500'
    },
    yellow: {
      bg: 'bg-yellow-900',
      text: 'text-yellow-400',
      accent: 'text-yellow-500',
      border: 'border-yellow-500'
    },
    green: {
      bg: 'bg-green-900',
      text: 'text-green-400',
      accent: 'text-green-500',
      border: 'border-green-500'
    },
    black: {
      bg: 'bg-gray-900',
      text: 'text-gray-400',
      accent: 'text-gray-200',
      border: 'border-gray-500'
    }
  };

  // Choose a theme based on the first type
  const theme = colorThemes[types[0]] || colorThemes.black;

  // Format the sprites
  const staticSprites = {
    regular: pokemon.sprites.other['official-artwork'].front_default,
    shiny: pokemon.sprites.other['official-artwork'].front_shiny
  };

  const animatedSprites = {
    regular: pokemon.sprites.versions['generation-v']['black-white'].animated.front_default,
    shiny: pokemon.sprites.versions['generation-v']['black-white'].animated.front_shiny
  };

  const homeSprites = {
    regular: pokemon.sprites.other.home.front_default,
    shiny: pokemon.sprites.other.home.front_shiny
  };

  const hasAnimated = animatedSprites.regular !== null;

  // Determine which sprites to show
  const currentSprites = isAnimated ? animatedSprites : staticSprites;
  const displayedSprite = isShiny ? currentSprites.shiny : currentSprites.regular;

  // Get level-up moves only, sorted by level
  const levelUpMoves = pokemon.moves
    .filter(move => move.version_group_details.some(detail => detail.move_learn_method.name === 'level-up'))
    .map(move => {
      const levelDetail = move.version_group_details.find(detail => detail.move_learn_method.name === 'level-up');
      return {
        move: {
          name: move.move.name,
          url: move.move.url,
          level: levelDetail ? levelDetail.level_learned_at : 0,
          type: types[0] // Default to Pokémon's first type, this would need to be fetched for accuracy
        },
        level: levelDetail ? levelDetail.level_learned_at : 0
      };
    })
    .sort((a, b) => a.level - b.level);

  // Toggle shiny display
  const onShinyChange = (value) => {
    setIsShiny(value);
  };

  // Toggle animated display
  const onAnimatedChange = (value) => {
    setIsAnimated(value);
  };

  // Initialize caught status state with all possible form types
  const [caughtStatus, setCaughtStatus] = useState({
    default: {
      regular: false,
      shiny: false,
      mega: false,
      megaShiny: false,
      gmax: false,
      gmaxShiny: false,
      alpha: false,
      alphaShiny: false
    }
  });

  // Update the updateCaughtStatus function to handle all form types
  const updateCaughtStatus = (type, variant = 'default') => {
    const newStatus = {
      ...caughtStatus,
      [variant]: {
        ...(caughtStatus[variant] || {
          regular: false,
          shiny: false,
          mega: false,
          megaShiny: false,
          gmax: false,
          gmaxShiny: false,
          alpha: false,
          alphaShiny: false
        }),
        [type]: !caughtStatus[variant]?.[type]
      }
    };
    setCaughtStatus(newStatus);

    // Update localStorage with the new status
    const saved = localStorage.getItem('caughtPokemon');
    const savedData = saved ? JSON.parse(saved) : {};
    savedData[id] = {
      ...savedData[id],
      [variant]: newStatus[variant]
    };
    localStorage.setItem('caughtPokemon', JSON.stringify(savedData));
  };

  // Add exportToCSV function if not already present
  const exportToCSV = () => {
    const saved = localStorage.getItem('caughtPokemon');
    if (!saved) return;

    const pokemonData = JSON.parse(saved);
    const rows = [['ID', 'Name', 'Form', 'Regular', 'Shiny']];

    Object.entries(pokemonData).forEach(([pokemonId, forms]) => {
      Object.entries(forms).forEach(([formName, status]) => {
        rows.push([
          pokemonId,
          name,
          formName,
          status.regular ? 'Yes' : 'No',
          status.shiny ? 'Yes' : 'No'
        ]);
      });
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pokemon_collection.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Load caught status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('caughtPokemon');
    if (saved) {
      const savedData = JSON.parse(saved);
      if (savedData[id]) {
        setCaughtStatus(savedData[id]);
      }
    }

    // Check for currently logged in user
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    };
    
    checkUser();
  }, [id]);

  // Add cloud sync functionality
  const syncToCloud = async () => {
    if (!user) return;

    const saved = localStorage.getItem('caughtPokemon');
    if (saved) {
      const localData = JSON.parse(saved);
      const result = await syncLocalToCloud(user.uid, localData);
      if (result.success) {
        alert('Collection synchronized to the cloud!');
      } else {
        alert(`Sync failed: ${result.error}`);
      }
    }
  };

  // Pull data from cloud
  const syncFromCloud = async () => {
    if (!user) return;

    const result = await syncCloudToLocal(user.uid);
    if (result.success) {
      // Refresh the current Pokemon's status
      if (result.data && result.data[id]) {
        setCaughtStatus(result.data[id]);
      }
      alert('Collection downloaded from the cloud!');
    } else {
      alert(`Sync failed: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-10">
      <Head>
        <title>{name.charAt(0).toUpperCase() + name.slice(1)} | Pokémon Database</title>
        <meta name="description" content={`View info about ${name} in the Pokémon database.`} />
      </Head>

      {/* Main Content Container */}
      <div className="container mx-auto p-4">
        {/* Pokémon Header Card */}
        <div className={`${theme.bg} rounded-lg p-6 mb-8 shadow-lg`}>
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Sprite */}
            <div className="relative w-64 h-64">
              <Image
                src={displayedSprite || '/img/unknown.png'}
                alt={name}
                layout="fill"
                objectFit="contain"
                className={`drop-shadow-2xl transition-all duration-300 ${isShiny ? 'hue-rotate-15' : ''}`}
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold capitalize mb-2">{name}</h1>
                  <p className="text-xl opacity-80">{category}</p>
                </div>
                <div className="text-2xl md:text-3xl font-bold opacity-70 mt-2 md:mt-0">
                  #{id.toString().padStart(3, '0')}
                </div>
              </div>

              {/* Types */}
              <div className="flex flex-wrap gap-2 mb-6">
                {types.map(type => (
                  <span
                    key={type}
                    className={`px-3 py-1 rounded-full text-white font-medium capitalize bg-${type}`}
                    style={{ backgroundColor: getTypeColor(type) }}
                  >
                    {type}
                  </span>
                ))}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Pokédex Entry</h2>
                <p className="opacity-85">{flavorText}</p>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <h3 className="text-sm font-medium opacity-70">Height</h3>
                  <p className="text-xl">{height} m</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium opacity-70">Weight</h3>
                  <p className="text-xl">{weight} kg</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium opacity-70">Abilities</h3>
                  <div>
                    {abilities.map((ability) => (
                      <div 
                        key={ability.ability.name}
                        className="capitalize"
                      >
                        {ability.ability.name.replace('-', ' ')}
                        {ability.is_hidden && <span className="text-xs ml-1 opacity-75">(Hidden)</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium opacity-70">Base Happiness</h3>
                  <p className="text-xl">{species.base_happiness}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls for sprite display */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
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
            <button
              onClick={() => onShinyChange(true)}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border border-gray-600 
                ${isShiny 
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }
                focus:z-10 focus:ring-2 focus:ring-yellow-500`}
            >
              Shiny
            </button>
          </div>

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

        {/* Main grid for detailed content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Add instructions section */}
            <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6 mb-6`}>
              <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Tracking Instructions</h2>
              <div className="space-y-2 text-gray-200">
                <p>Click the Pokéball icon on any sprite to mark it as caught:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Empty Pokéball: Not caught</li>
                  <li>Red Pokéball: Regular form caught</li>
                  <li>Yellow Pokéball: Shiny form caught</li>
                  <li>Crimson Pokéball: Alpha form caught</li>
                </ul>
                <p className="mt-4 text-sm opacity-75">
                  Note: Each form (regular, shiny, mega, gigantamax, alpha) is tracked separately.
                </p>
              </div>
            </div>

            {/* Enhanced Tracking Panel */}
            <EnhancedTrackingPanel 
              pokemonId={id}
              formName="default"
              updateCaughtStatus={updateCaughtStatus}
              caughtStatus={caughtStatus}
              theme={theme}
            />

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
                          <FormCatchButton
                            formName="default"
                            type="regular"
                            caughtStatus={caughtStatus}
                            updateCaughtStatus={updateCaughtStatus}
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
                          <FormCatchButton
                            formName="default"
                            type="shiny"
                            caughtStatus={caughtStatus}
                            updateCaughtStatus={updateCaughtStatus}
                            theme={theme}
                          />
                        </div>
                        <p className="mt-2 text-gray-400">Shiny</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Home 3D Models */}
                {homeSprites.regular && (
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
                          <FormCatchButton
                            formName="default"
                            type="home"
                            caughtStatus={caughtStatus}
                            updateCaughtStatus={updateCaughtStatus}
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
                            <FormCatchButton
                              formName="default"
                              type="homeShiny"
                              caughtStatus={caughtStatus}
                              updateCaughtStatus={updateCaughtStatus}
                              theme={theme}
                            />
                          </div>
                          <p className="mt-2 text-gray-400">Shiny</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Game Models */}
                {hasAnimated && (
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
                          <FormCatchButton
                            formName="default"
                            type="game"
                            caughtStatus={caughtStatus}
                            updateCaughtStatus={updateCaughtStatus}
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
                            <FormCatchButton
                              formName="default"
                              type="gameShiny"
                              caughtStatus={caughtStatus}
                              updateCaughtStatus={updateCaughtStatus}
                              theme={theme}
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

            {/* Alpha forms section */}
            {hasAlphaForm(name) && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-400 mb-4">Alpha Forms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg relative">
                      <div className="relative">
                        <img
                          src={getHisuianSprite(pokemon)?.front_default || staticSprites.regular}
                          alt={`${name} alpha form`}
                          className="w-32 h-32 object-contain"
                        />
                        {/* Alpha indicator */}
                        <span className="absolute top-0 right-0 text-red-500 text-xl">α</span>
                      </div>
                      <FormCatchButton
                        formName="default"
                        type="alpha"
                        caughtStatus={caughtStatus}
                        updateCaughtStatus={updateCaughtStatus}
                        theme={theme}
                      />
                    </div>
                    <p className="mt-2 text-gray-400">Alpha</p>
                  </div>
                  {staticSprites.shiny && (
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-700 p-4 rounded-lg relative">
                        <div className="relative">
                          <img
                            src={getHisuianSprite(pokemon)?.front_shiny || staticSprites.shiny}
                            alt={`${name} shiny alpha form`}
                            className="w-32 h-32 object-contain"
                          />
                          {/* Alpha indicator */}
                          <span className="absolute top-0 right-0 text-red-500 text-xl">α</span>
                        </div>
                        <FormCatchButton
                          formName="default"
                          type="alphaShiny"
                          caughtStatus={caughtStatus}
                          updateCaughtStatus={updateCaughtStatus}
                          theme={theme}
                        />
                      </div>
                      <p className="mt-2 text-gray-400">Shiny Alpha</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Alternative Forms */}
            {alternativeForms.length > 0 && (
              <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Alternative Forms</h2>
                <div className="space-y-6">
                  {alternativeForms.map((form) => {
                    const formSprite = form.sprites.other?.['official-artwork']?.front_default || form.sprites.front_default;
                    const shinySprite = form.sprites.other?.['official-artwork']?.front_shiny || form.sprites.front_shiny;
                    
                    return (
                      <div key={form.formName} className={`${theme.bg} bg-opacity-50 rounded-lg p-4`}>
                        <h3 className="text-xl font-semibold text-center capitalize mb-4">
                          {form.formName.replace(pokemon.name, '').replace(/-/g, ' ').trim() || 'Alternate Form'}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {formSprite && (
                            <div className="flex flex-col items-center">
                              <div className="bg-gray-700 p-4 rounded-lg relative">
                                <img
                                  src={formSprite}
                                  alt={`${form.formName} form`}
                                  className="w-32 h-32 object-contain"
                                />
                                <FormCatchButton
                                  formName={form.formName}
                                  type="regular"
                                  caughtStatus={caughtStatus}
                                  updateCaughtStatus={updateCaughtStatus}
                                  theme={theme}
                                />
                              </div>
                              <p className="mt-2 text-gray-400">Regular</p>
                            </div>
                          )}
                          {shinySprite && (
                            <div className="flex flex-col items-center">
                              <div className="bg-gray-700 p-4 rounded-lg relative">
                                <img
                                  src={shinySprite}
                                  alt={`${form.formName} shiny form`}
                                  className="w-32 h-32 object-contain"
                                />
                                <FormCatchButton
                                  formName={form.formName}
                                  type="shiny"
                                  caughtStatus={caughtStatus}
                                  updateCaughtStatus={updateCaughtStatus}
                                  theme={theme}
                                />
                              </div>
                              <p className="mt-2 text-gray-400">Shiny</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
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

            {/* Cloud Sync Section (shown only when user is logged in) */}
            {user && (
              <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Cloud Sync</h2>
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-gray-300">Sync your caught status with the cloud to access from any device</p>
                  <button
                    onClick={syncToCloud}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    Upload to Cloud
                  </button>
                  <button
                    onClick={syncFromCloud}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-3.707-8.707l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 9.414V13a1 1 0 11-2 0V9.414l-1.293 1.293a1 1 0 01-1.414-1.414z" clipRule="evenodd" />
                    </svg>
                    Download from Cloud
                  </button>
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

        {/* Moves Section */}
        <section className={`${theme.bg} bg-opacity-50 rounded-lg p-6 shadow-lg mt-6`}>
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

        {/* Location Data */}
        <section className="mt-6">
          <LocationEncounterData pokemon={pokemon} theme={theme} />
        </section>
      </div>
    </div>
  );
}

// Utility functions

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

const getTypeColor = (type) => {
  const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD'
  };
  return typeColors[type] || '#999999';
};

// Icon Set for use in the UI
const IconSet = {
  Stats: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
};

const EvolutionChain = ({ chain, currentPokemonId }) => {
  const renderEvolution = (evolution) => {
    const pokemonId = evolution.species.url.split('/').slice(-2, -1)[0];
    const isCurrentPokemon = pokemonId === currentPokemonId.toString();
    
    return (
      <div className="flex flex-col items-center">
        <Link href={`/pokemon/${evolution.species.name}`}>
          <a className="flex flex-col items-center p-2 rounded-lg transition-transform hover:scale-105">
            <div className="w-20 h-20 relative">
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
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
        {evolution.evolves_to.length > 0 && (
          <span className="text-2xl mt-1 mb-1">→</span>
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
const CatchButton = ({ isCaught, isShiny, isAlpha, onClick, theme }) => (
  <button
    onClick={onClick}
    className={`absolute bottom-2 right-2 p-1 rounded-full transition-all
      ${isCaught ? 
        (isShiny ? 'bg-yellow-500' : isAlpha ? 'bg-red-500' : 'bg-green-500') : 
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

// Add this new component for form variants
const FormCatchButton = ({ formName, type, caughtStatus, updateCaughtStatus, theme }) => {
  const isCaught = caughtStatus[formName]?.[type] || false;
  const isShiny = type.includes('Shiny');
  const isAlpha = type.includes('alpha');
  
  return (
    <CatchButton
      isCaught={isCaught}
      isShiny={isShiny}
      isAlpha={isAlpha}
      onClick={() => updateCaughtStatus(type, formName)}
      theme={theme}
    />
  );
};

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

export async function getStaticPaths() {
  // Generate paths for the first 151 Pokemon (Kanto region)
  const paths = Array.from({ length: 151 }, (_, i) => {
    const id = i + 1;
    // Fetch the name for each ID
    return fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then(res => res.json())
      .then(data => ({ params: { name: data.name } }))
      .catch(() => null);
  });

  const resolvedPaths = (await Promise.all(paths)).filter(Boolean);

  return {
    paths: resolvedPaths,
    fallback: 'blocking'
  };
}