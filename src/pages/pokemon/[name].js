// pages/pokemon/[name].js
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import pokeballOutline from '/public/img/pokeballoutline.png';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Fix the import paths - components are now in src/components
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

// Add utility functions at the top - DEFINE ONLY ONCE
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

// Keep this outside the component
const hasAlphaForm = (pokemonName) => {
  return guaranteedAlphas.includes(pokemonName.toLowerCase());
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

// Add the SpriteToggleGroup component
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

// Enhanced PokemonCry component with iOS detection
const PokemonCry = ({ src, label, theme }) => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);
  }, []);

  if (!src) return null;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => {
          if (isIOS) {
            alert('Audio may not autoplay on iOS. Please tap the Play button in the audio player that appears.');
          }
          document.getElementById('pokemonCry')?.play();
        }}
        className={`px-4 py-2 rounded-lg ${theme.accent} hover:opacity-90 transition-opacity flex items-center gap-2`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        {label || 'Play Cry'}
      </button>
      <audio id="pokemonCry" src={src} preload="auto"></audio>
    </div>
  );
};

export default function PokemonDetail({ pokemon, species, alternativeForms, evolutionChain }) {
  const router = useRouter();
  const [isShiny, setIsShiny] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [activeSprite, setActiveSprite] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
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
    fire: {
      bg: 'bg-red-900',
      text: 'text-red-400',
      accent: 'text-red-500',
      border: 'border-red-500'
    },
    water: {
      bg: 'bg-blue-900',
      text: 'text-blue-400',
      accent: 'text-blue-500',
      border: 'border-blue-500'
    },
    electric: {
      bg: 'bg-yellow-900',
      text: 'text-yellow-400',
      accent: 'text-yellow-500',
      border: 'border-yellow-500'
    },
    grass: {
      bg: 'bg-green-900',
      text: 'text-green-400',
      accent: 'text-green-500',
      border: 'border-green-500'
    }
  };

  // Choose a theme based on the first type
  const theme = typeColors[types[0]] || { 
    bg: 'bg-gray-900', 
    text: 'text-gray-400', 
    accent: 'text-gray-200',
    border: 'border-gray-500'
  };

  // Get appropriate sprite based on current toggle states
  const getMainSprite = () => {
    // If a specific sprite is selected, use that
    if (activeSprite) return activeSprite;
    
    // Otherwise, build the sprite URL based on current toggle states
    if (isAnimated) {
      // For animated sprites
      if (isShiny) {
        return pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_shiny || 
               pokemon.sprites.front_shiny;
      } else {
        return pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || 
               pokemon.sprites.front_default;
      }
    } else {
      // For static sprites
      if (isShiny) {
        return pokemon.sprites.other?.['official-artwork']?.front_shiny || 
               pokemon.sprites.front_shiny;
      } else {
        return pokemon.sprites.other?.['official-artwork']?.front_default || 
               pokemon.sprites.front_default;
      }
    }
  };

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

  // Load saved caught status
  useEffect(() => {
    const saved = localStorage.getItem('caughtPokemon');
    if (saved) {
      const savedData = JSON.parse(saved);
      if (savedData[id]) {
        setCaughtStatus(savedData[id]);
      }
    }
    
    // Load user data if available
    const checkUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };
    
    checkUser();
  }, [id]);

  // Format a form name for display
  const getFormDisplayName = (formName) => {
    if (formName === pokemon.name) return 'Default';
    
    // Remove pokemon name from form name
    let displayName = formName.replace(pokemon.name + '-', '');
    
    // Special case handling
    if (displayName === 'mega-x') return 'Mega X';
    if (displayName === 'mega-y') return 'Mega Y';
    if (displayName === 'gmax') return 'Gigantamax';
    if (displayName === 'alola') return 'Alolan Form';
    if (displayName === 'galar') return 'Galarian Form';
    if (displayName === 'hisui') return 'Hisuian Form';
    if (displayName === 'paldea') return 'Paldean Form';
    
    // Capitalize and format remaining cases
    return displayName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Form', 'Regular', 'Shiny', 'Alpha', 'Alpha Shiny'];
    
    // Format data for CSV
    const rows = [];
    
    Object.entries(caughtStatus).forEach(([formName, status]) => {
      rows.push([
        id,
        name,
        formName === 'default' ? 'Regular' : getFormDisplayName(formName),
        status.regular ? 'Yes' : 'No',
        status.shiny ? 'Yes' : 'No',
        status.alpha ? 'Yes' : 'No',
        status.alphaShiny ? 'Yes' : 'No',
      ]);
    });
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokemon_${id}_${name.replace(' ', '_')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Sync with cloud if user is logged in
  const syncData = async () => {
    if (!user) {
      alert('Please log in to sync your data');
      return;
    }
    
    try {
      // Get data from localStorage
      const saved = localStorage.getItem('caughtPokemon');
      if (!saved) {
        alert('No local data to sync');
        return;
      }
      
      const localData = JSON.parse(saved);
      
      // Push to cloud
      const result = await syncLocalToCloud(user.uid, localData);
      
      if (result.success) {
        alert('Data synced successfully!');
      } else {
        alert(`Sync failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Define all tabs including the new sprites tab
  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'forms', label: 'Forms' },
    { id: 'sprites', label: 'Sprites' },
    { id: 'moves', label: 'Moves' },
    { id: 'locations', label: 'Locations' },
    { id: 'evolution', label: 'Evolution' }
  ];

  return (
    <div className="bg-gray-950 text-white min-h-screen pb-12">
      <Head>
        <title>{`${properCase(name)} #${id} - Pokémon Database`}</title>
        <meta name="description" content={`${properCase(name)} details and information in the Pokémon Database`} />
      </Head>

      {/* Navigation */}
      <div className="bg-red-600 py-4">
        <div className="container mx-auto px-4">
          <Link href="/">
            <a className="text-white flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Pokédex
            </a>
          </Link>
        </div>
      </div>

      {/* Pokemon Header Section */}
      <div className={`${theme.bg} py-8`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-40 h-40 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center p-4 relative">
              <img
                src={getMainSprite()} 
                alt={name} 
                className="w-32 h-32 object-contain" 
              />
              {/* ID Badge */}
              <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-sm px-2 py-1 rounded-full font-mono">
                #{id.toString().padStart(3, '0')}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold capitalize">{name}</h1>
                <div className="flex gap-2">
                  {types.map(type => (
                    <span 
                      key={type}
                      className={`${typeColors[type].bg} ${typeColors[type].text} px-3 py-1 rounded-lg text-sm`}
                    >
                      {properCase(type)}
                    </span>
                  ))}
                </div>
                <p className="text-gray-300">{flavorText}</p>
              </div>
            </div>
            
            {/* Right side options for desktop */}
            <div className="hidden md:block">
              <SpriteToggleGroup 
                isAnimated={isAnimated}
                isShiny={isShiny}
                onAnimatedChange={setIsAnimated}
                onShinyChange={setIsShiny}
                hasAnimated={!!pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default}
                hasShiny={!!pokemon.sprites.front_shiny}
                theme={theme}
              />
            </div>
          </div>
          
          {/* Mobile sprite toggle */}
          <div className="mt-6 flex justify-center md:hidden">
            <SpriteToggleGroup 
              isAnimated={isAnimated}
              isShiny={isShiny}
              onAnimatedChange={setIsAnimated}
              onShinyChange={setIsShiny}
              hasAnimated={!!pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default}
              hasShiny={!!pokemon.sprites.front_shiny}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {/* Now add a comprehensive sprite gallery */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">All Sprites</h3>
        
        {(() => {
          const SpriteCard = ({ src, label, onClick, isActive, isShiny = false, isAnimated = false, large = false }) => (
            <div 
              className={`bg-gray-800 rounded-lg p-3 cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-red-500' : 'hover:bg-gray-700'
              }`}
              onClick={onClick}
            >
              <div className={`relative ${large ? 'h-32' : 'h-24'} flex items-center justify-center`}>
                <img 
                  src={src} 
                  alt={label}
                  className={`object-contain max-h-full ${isAnimated ? 'animate-bounce-slow' : ''}`}
                />
                {isShiny && (
                  <span className="absolute top-0 right-0 text-yellow-500">✨</span>
                )}
              </div>
              <p className="text-center mt-2 text-sm">{label}</p>
            </div>
          );
          
          return (
            <>
              {/* Official Artwork */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Official Artwork</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {pokemon.sprites.other?.['official-artwork']?.front_default && (
                    <SpriteCard
                      src={pokemon.sprites.other['official-artwork'].front_default}
                      label="Official Artwork"
                      onClick={() => setActiveSprite(pokemon.sprites.other['official-artwork'].front_default)}
                      isActive={activeSprite === pokemon.sprites.other['official-artwork'].front_default}
                      large={true}
                    />
                  )}
                  {pokemon.sprites.other?.['official-artwork']?.front_shiny && (
                    <SpriteCard
                      src={pokemon.sprites.other['official-artwork'].front_shiny}
                      label="Official Shiny"
                      onClick={() => setActiveSprite(pokemon.sprites.other['official-artwork'].front_shiny)}
                      isActive={activeSprite === pokemon.sprites.other['official-artwork'].front_shiny}
                      isShiny={true}
                      large={true}
                    />
                  )}
                </div>
              </div>
              
              {/* HOME Models */}
              <div className="mb-6">
                <h4 className="text-lg font-medium mb-2">Pokémon HOME</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {pokemon.sprites.other?.home?.front_default && (
                    <SpriteCard
                      src={pokemon.sprites.other.home.front_default}
                      label="HOME Model"
                      onClick={() => setActiveSprite(pokemon.sprites.other.home.front_default)}
                      isActive={activeSprite === pokemon.sprites.other.home.front_default}
                      large={true}
                    />
                  )}
                  {pokemon.sprites.other?.home?.front_shiny && (
                    <SpriteCard
                      src={pokemon.sprites.other.home.front_shiny}
                      label="HOME Shiny"
                      onClick={() => setActiveSprite(pokemon.sprites.other.home.front_shiny)}
                      isActive={activeSprite === pokemon.sprites.other.home.front_shiny}
                      isShiny={true}
                      large={true}
                    />
                  )}
                </div>
              </div>
              
              {/* Generation 5 Sprites (Animated) */}
              {pokemon.sprites.versions?.['generation-v']?.['black-white'] && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2">Generation 5 (Black/White)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {pokemon.sprites.versions['generation-v']['black-white'].front_default && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-v']['black-white'].front_default}
                        label="Black/White"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].front_default)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].front_default}
                      />
                    )}
                    
                    {pokemon.sprites.versions['generation-v']['black-white'].front_shiny && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-v']['black-white'].front_shiny}
                        label="B/W Shiny"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].front_shiny)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].front_shiny}
                        isShiny={true}
                      />
                    )}
                    
                    {pokemon.sprites.versions['generation-v']['black-white'].animated?.front_default && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-v']['black-white'].animated.front_default}
                        label="B/W Animated"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].animated.front_default)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].animated.front_default}
                        isAnimated={true}
                      />
                    )}
                    
                    {pokemon.sprites.versions['generation-v']['black-white'].animated?.front_shiny && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-v']['black-white'].animated.front_shiny}
                        label="B/W Anim. Shiny"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].animated.front_shiny)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].animated.front_shiny}
                        isAnimated={true}
                        isShiny={true}
                      />
                    )}
                    
                    {/* Add back sprites as well */}
                    {pokemon.sprites.versions['generation-v']['black-white'].back_default && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-v']['black-white'].back_default}
                        label="B/W Back"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].back_default)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].back_default}
                      />
                    )}
                    
                    {pokemon.sprites.versions['generation-v']['black-white'].back_shiny && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-v']['black-white'].back_shiny}
                        label="B/W Back Shiny"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].back_shiny)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].back_shiny}
                        isShiny={true}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Older generations (4, 3, 2, 1) */}
              {pokemon.sprites.versions?.['generation-iv'] && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-2">Generation 4 (Diamond/Pearl, Platinum, HeartGold/SoulSilver)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {/* Diamond/Pearl */}
                    {pokemon.sprites.versions['generation-iv']?.['diamond-pearl']?.front_default && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_default}
                        label="Diamond/Pearl"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_default)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_default}
                      />
                    )}
                    
                    {pokemon.sprites.versions['generation-iv']?.['diamond-pearl']?.front_shiny && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_shiny}
                        label="D/P Shiny"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_shiny)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_shiny}
                        isShiny={true}
                      />
                    )}
                    
                    {/* Platinum */}
                    {pokemon.sprites.versions['generation-iv']?.['platinum']?.front_default && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-iv']['platinum'].front_default}
                        label="Platinum"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['platinum'].front_default)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-iv']['platinum'].front_default}
                      />
                    )}
                    
                    {pokemon.sprites.versions['generation-iv']?.['platinum']?.front_shiny && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-iv']['platinum'].front_shiny}
                        label="Platinum Shiny"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['platinum'].front_shiny)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-iv']['platinum'].front_shiny}
                        isShiny={true}
                      />
                    )}
                    
                    {/* HeartGold/SoulSilver */}
                    {pokemon.sprites.versions['generation-iv']?.['heartgold-soulsilver']?.front_default && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_default}
                        label="HGSS"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_default)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_default}
                      />
                    )}
                    
                    {pokemon.sprites.versions['generation-iv']?.['heartgold-soulsilver']?.front_shiny && (
                      <SpriteCard
                        src={pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_shiny}
                        label="HGSS Shiny"
                        onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_shiny)}
                        isActive={activeSprite === pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_shiny}
                        isShiny={true}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 my-6">
        <div className="flex overflow-x-auto space-x-2 border-b border-gray-700 pb-2">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`px-4 py-2 rounded-t-lg ${activeTab === tab.id ? 'bg-red-600 text-white' : 'text-gray-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add instructions section */}
            <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6 mb-6 md:col-span-3`}>
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
            
            {/* Left Column */}
            <div className="space-y-6">
              <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Sprites</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-700 p-4 rounded-lg relative">
                      <img
                        src={getMainSprite()}
                        alt={`${name} sprite`}
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
                  
                  {pokemon.sprites.front_shiny && (
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-700 p-4 rounded-lg relative">
                        <img
                          src={pokemon.sprites.front_shiny}
                          alt={`${name} shiny`}
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
                
                {/* Home Sprites if available */}
                {pokemon.sprites.home?.front_default && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold text-gray-400 mb-4">HOME</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <img
                            src={pokemon.sprites.home.front_default}
                            alt={`${name} HOME model`}
                            className="w-32 h-32 object-contain"
                          />
                        </div>
                        <p className="mt-2 text-gray-400">Regular</p>
                      </div>
                      
                      {pokemon.sprites.home?.front_shiny && (
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-700 p-4 rounded-lg">
                            <img
                              src={pokemon.sprites.home.front_shiny}
                              alt={`${name} HOME shiny model`}
                              className="w-32 h-32 object-contain"
                            />
                          </div>
                          <p className="mt-2 text-gray-400">Shiny</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <EnhancedTrackingPanel 
                pokemonId={id}
                formName="default"
                updateCaughtStatus={updateCaughtStatus}
                caughtStatus={caughtStatus}
                theme={theme}
              />
              
              {/* Alpha Forms Section */}
              {hasAlphaForm(name) && (
                <div className="mt-6">
                  <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
                    <h3 className="text-xl font-semibold text-gray-400 mb-4">Alpha Forms</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-700 p-4 rounded-lg relative">
                          <div className="relative">
                            <img
                              src={pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default}
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
                      {pokemon.sprites.front_shiny && (
                        <div className="flex flex-col items-center">
                          <div className="bg-gray-700 p-4 rounded-lg relative">
                            <div className="relative">
                              <img
                                src={pokemon.sprites.front_shiny}
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
                </div>
              )}
            </div>
            
            {/* Middle Column */}
            <div className="space-y-6">
              <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Physical Characteristics</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <IconSet.Height />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Height</p>
                      <p className="font-semibold">{height} m</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3">
                      <IconSet.Weight />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Weight</p>
                      <p className="font-semibold">{weight} kg</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Abilities</h3>
                  <div className="space-y-2">
                    {abilities.map((ability, index) => (
                      <div 
                        key={ability.ability.name}
                        className={`p-2 rounded ${ability.is_hidden ? 'bg-purple-900 bg-opacity-50' : 'bg-gray-800'}`}
                      >
                        <div className="flex justify-between">
                          <span className="capitalize">
                            {ability.ability.name.replace('-', ' ')}
                          </span>
                          {ability.is_hidden && (
                            <span className="text-xs bg-purple-700 px-2 py-0.5 rounded">
                              Hidden
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Training</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <IconSet.Experience />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Base Happiness</p>
                      <p className="font-semibold">{species.base_happiness}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3">
                      <IconSet.CatchRate />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Catch Rate</p>
                      <p className="font-semibold">{species.capture_rate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3">
                      <IconSet.GrowthRate />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Growth Rate</p>
                      <p className="font-semibold capitalize">
                        {species.growth_rate.name.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3">
                      <IconSet.EVYield />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">EV Yield</p>
                      <div className="text-sm">
                        {stats.filter(s => s.effort > 0).map(s => (
                          <span key={s.stat.name} className="mr-2">
                            {formatStatName(s.stat.name)}: {s.effort}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Breeding</h2>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <IconSet.Gender />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Gender Ratio</p>
                      {species.gender_rate === -1 ? (
                        <p className="font-semibold">Genderless</p>
                      ) : (
                        <div className="w-full bg-gray-700 rounded-full h-4 mt-1">
                          <div 
                            className="bg-blue-500 h-4 rounded-l-full" 
                            style={{ width: `${100 - (species.gender_rate / 8) * 100}%` }}
                          ></div>
                          <div className="flex justify-between text-xs mt-1">
                            <span>♂ {100 - (species.gender_rate / 8) * 100}%</span>
                            <span>♀ {(species.gender_rate / 8) * 100}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3">
                      <IconSet.EggGroups />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Egg Groups</p>
                      <p className="font-semibold capitalize">
                        {species.egg_groups.map(g => g.name).join(', ').replace(/-/g, ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-3">
                      <IconSet.EggCycles />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Egg Cycles</p>
                      <p className="font-semibold">{species.hatch_counter} ({species.hatch_counter * 255} steps)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Pokédex Data</h2>
                
                <div className="space-y-3">
                  <p>
                    <span className="text-gray-400">National №:</span> 
                    <span className="ml-2 font-mono">{id.toString().padStart(3, '0')}</span>
                  </p>
                  
                  {species.pokedex_numbers.map(entry => (
                    <p key={entry.pokedex.name}>
                      <span className="text-gray-400 capitalize">
                        {entry.pokedex.name.replace('-', ' ')} №:
                      </span> 
                      <span className="ml-2 font-mono">{entry.entry_number.toString().padStart(3, '0')}</span>
                    </p>
                  ))}
                  
                  <p>
                    <span className="text-gray-400">Generation:</span> 
                    <span className="ml-2 capitalize">{species.generation.name.replace('-', ' ')}</span>
                  </p>
                </div>
                
                {/* Pokemon cry */}
                {pokemon.cries?.latest && (
                  <div className="mt-4">
                    <PokemonCry 
                      src={pokemon.cries.latest} 
                      label="Play Pokémon Cry" 
                      theme={theme} 
                    />
                  </div>
                )}
              </div>
              
              {/* Export Data */}
              <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold mb-4 ${theme.accent}`}>Export Data</h2>
                <div className="space-y-3">
                  <button
                    onClick={exportToCSV}
                    className="bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    Export Data
                  </button>
                  
                  {user && (
                    <button
                      onClick={syncData}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors ml-3"
                    >
                      Sync to Cloud
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <div className={`${theme.bg} bg-opacity-50 rounded-lg p-6`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme.accent}`}>Alternative Forms</h2>
            
            {alternativeForms.length > 0 ? (
              <div className="space-y-6">
                {alternativeForms.map(form => {
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
                            <div className="bg-gray-700 p-4 rounded-lg relative">
                              <img
                                src={formSprite}
                                alt={`${form.formName} regular`}
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
                                alt={`${form.formName} shiny`}
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
            ) : (
              <p className="text-center text-gray-400">No alternative forms available for this Pokémon.</p>
            )}
          </div>
        )}
        
        {/* Sprites Tab */}
        {activeTab === 'sprites' && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">All Sprites</h3>
            
            {(() => {
              const SpriteCard = ({ src, label, onClick, isActive, isShiny = false, isAnimated = false, large = false }) => (
                <div 
                  className={`bg-gray-800 rounded-lg p-3 cursor-pointer transition-all ${
                    isActive ? 'ring-2 ring-red-500' : 'hover:bg-gray-700'
                  }`}
                  onClick={onClick}
                >
                  <div className={`relative ${large ? 'h-32' : 'h-24'} flex items-center justify-center`}>
                    <img 
                      src={src} 
                      alt={label}
                      className={`object-contain max-h-full ${isAnimated ? 'animate-bounce-slow' : ''}`}
                    />
                    {isShiny && (
                      <span className="absolute top-0 right-0 text-yellow-500">✨</span>
                    )}
                  </div>
                  <p className="text-center mt-2 text-sm">{label}</p>
                </div>
              );
              
              return (
                <>
                  {/* Official Artwork */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-2">Official Artwork</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {pokemon.sprites.other?.['official-artwork']?.front_default && (
                        <SpriteCard
                          src={pokemon.sprites.other['official-artwork'].front_default}
                          label="Official Artwork"
                          onClick={() => setActiveSprite(pokemon.sprites.other['official-artwork'].front_default)}
                          isActive={activeSprite === pokemon.sprites.other['official-artwork'].front_default}
                          large={true}
                        />
                      )}
                      {pokemon.sprites.other?.['official-artwork']?.front_shiny && (
                        <SpriteCard
                          src={pokemon.sprites.other['official-artwork'].front_shiny}
                          label="Official Shiny"
                          onClick={() => setActiveSprite(pokemon.sprites.other['official-artwork'].front_shiny)}
                          isActive={activeSprite === pokemon.sprites.other['official-artwork'].front_shiny}
                          isShiny={true}
                          large={true}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* HOME Models */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium mb-2">Pokémon HOME</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {pokemon.sprites.other?.home?.front_default && (
                        <SpriteCard
                          src={pokemon.sprites.other.home.front_default}
                          label="HOME Model"
                          onClick={() => setActiveSprite(pokemon.sprites.other.home.front_default)}
                          isActive={activeSprite === pokemon.sprites.other.home.front_default}
                          large={true}
                        />
                      )}
                      {pokemon.sprites.other?.home?.front_shiny && (
                        <SpriteCard
                          src={pokemon.sprites.other.home.front_shiny}
                          label="HOME Shiny"
                          onClick={() => setActiveSprite(pokemon.sprites.other.home.front_shiny)}
                          isActive={activeSprite === pokemon.sprites.other.home.front_shiny}
                          isShiny={true}
                          large={true}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Generation 5 Sprites (Animated) */}
                  {pokemon.sprites.versions?.['generation-v']?.['black-white'] && (
                    <div className="mb-6">
                      <h4 className="text-lg font-medium mb-2">Generation 5 (Black/White)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                        {pokemon.sprites.versions['generation-v']['black-white'].front_default && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-v']['black-white'].front_default}
                            label="Black/White"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].front_default)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].front_default}
                          />
                        )}
                        
                        {pokemon.sprites.versions['generation-v']['black-white'].front_shiny && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-v']['black-white'].front_shiny}
                            label="B/W Shiny"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].front_shiny)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].front_shiny}
                            isShiny={true}
                          />
                        )}
                        
                        {pokemon.sprites.versions['generation-v']['black-white'].animated?.front_default && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-v']['black-white'].animated.front_default}
                            label="B/W Animated"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].animated.front_default)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].animated.front_default}
                            isAnimated={true}
                          />
                        )}
                        
                        {pokemon.sprites.versions['generation-v']['black-white'].animated?.front_shiny && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-v']['black-white'].animated.front_shiny}
                            label="B/W Anim. Shiny"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].animated.front_shiny)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].animated.front_shiny}
                            isAnimated={true}
                            isShiny={true}
                          />
                        )}
                        
                        {/* Add back sprites as well */}
                        {pokemon.sprites.versions['generation-v']['black-white'].back_default && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-v']['black-white'].back_default}
                            label="B/W Back"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].back_default)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].back_default}
                          />
                        )}
                        
                        {pokemon.sprites.versions['generation-v']['black-white'].back_shiny && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-v']['black-white'].back_shiny}
                            label="B/W Back Shiny"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-v']['black-white'].back_shiny)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-v']['black-white'].back_shiny}
                            isShiny={true}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Older generations (4, 3, 2, 1) */}
                  {pokemon.sprites.versions?.['generation-iv'] && (
                    <div className="mb-6">
                      <h4 className="text-lg font-medium mb-2">Generation 4 (Diamond/Pearl, Platinum, HeartGold/SoulSilver)</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                        {/* Diamond/Pearl */}
                        {pokemon.sprites.versions['generation-iv']?.['diamond-pearl']?.front_default && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_default}
                            label="Diamond/Pearl"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_default)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_default}
                          />
                        )}
                        
                        {pokemon.sprites.versions['generation-iv']?.['diamond-pearl']?.front_shiny && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_shiny}
                            label="D/P Shiny"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_shiny)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_shiny}
                            isShiny={true}
                          />
                        )}
                        
                        {/* Platinum */}
                        {pokemon.sprites.versions['generation-iv']?.['platinum']?.front_default && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-iv']['platinum'].front_default}
                            label="Platinum"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['platinum'].front_default)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-iv']['platinum'].front_default}
                          />
                        )}
                        
                        {pokemon.sprites.versions['generation-iv']?.['platinum']?.front_shiny && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-iv']['platinum'].front_shiny}
                            label="Platinum Shiny"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['platinum'].front_shiny)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-iv']['platinum'].front_shiny}
                            isShiny={true}
                          />
                        )}
                        
                        {/* HeartGold/SoulSilver */}
                        {pokemon.sprites.versions['generation-iv']?.['heartgold-soulsilver']?.front_default && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_default}
                            label="HGSS"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_default)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_default}
                          />
                        )}
                        
                        {pokemon.sprites.versions['generation-iv']?.['heartgold-soulsilver']?.front_shiny && (
                          <SpriteCard
                            src={pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_shiny}
                            label="HGSS Shiny"
                            onClick={() => setActiveSprite(pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_shiny)}
                            isActive={activeSprite === pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_shiny}
                            isShiny={true}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

// EvolutionChain component
const EvolutionChain = ({ chain, currentPokemonName }) => {
  // Helper function to extract Pokemon ID from URL
  const getIdFromUrl = (url) => {
    const matches = url.match(/\/pokemon-species\/(\d+)/);
    return matches ? matches[1] : null;
  };

  // Render a single evolution with its sprite
  const renderEvolution = (evolution) => {
    const id = getIdFromUrl(evolution.species.url);
    const isCurrentPokemon = evolution.species.name === currentPokemonName;
    
    return (
      <div className="flex flex-col items-center">
        <Link href={`/pokemon/${evolution.species.name}`}>
          <a className={`flex flex-col items-center ${isCurrentPokemon ? 'border-b-2 border-red-500' : ''}`}>
            <div className="w-24 h-24 bg-gray-800 rounded-full p-2 flex items-center justify-center">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                alt={evolution.species.name}
                className="w-20 h-20 object-contain"
              />
            </div>
            <p className="mt-2 capitalize text-center">
              {evolution.species.name.replace(/-/g, ' ')}
            </p>
            {evolution.evolution_details[0] && (
              <p className="text-xs text-gray-400 mt-1 text-center">
                {evolution.evolution_details[0].min_level ? 
                  `Level ${evolution.evolution_details[0].min_level}` : 
                  evolution.evolution_details[0].trigger.name.replace('-', ' ')}
              </p>
            )}
          </a>
        </Link>
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