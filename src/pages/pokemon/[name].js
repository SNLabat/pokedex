// pages/pokemon/[name].js
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import pokeballOutline from '/public/img/pokeballoutline.png';
import Head from 'next/head';
import { useRouter } from 'next/router';

// Fix the import paths - components are now in src/components
import EnhancedTrackingPanel from '../../components/EnhancedTrackingPanel';
import LocationEncounterData from '../../components/LocationEncounterData';
import { syncLocalToCloud, syncCloudToLocal, getCurrentUser } from '../../lib/dataManagement';

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

// Add utility functions at the top
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

// Keep this outside the component
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

const hasAlphaForm = (pokemonName) => {
  return guaranteedAlphas.includes(pokemonName.toLowerCase());
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

// Add the SpriteToggleGroup component
const SpriteToggleGroup = ({ isAnimated, isShiny, onAnimatedChange, onShinyChange, hasAnimated, hasShiny, theme = typeColors.normal }) => (
  <div className="flex flex-col gap-2">
    {/* Main sprite type toggles */}
    <div className="inline-flex rounded-lg shadow-lg" role="group">
      <button
        onClick={() => onShinyChange(false)}
        className={`px-4 py-2 text-sm font-medium rounded-l-lg border-2 transition-colors
          ${!isShiny 
            ? `${theme?.accent || 'bg-gray-500'} ${theme?.text || 'text-white'}`
            : `${theme?.bg || 'bg-gray-700'} opacity-75 hover:opacity-100`
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
          </span>
        </button>
      )}
    </div>
  </div>
);

// Pokemon cry audio component
const PokemonCry = ({ src, label, theme = defaultTheme }) => {
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
      <div className={`${theme?.bg || 'bg-gray-800'} bg-opacity-50 p-4 rounded-lg shadow-lg`}>
        <p className={`${theme?.text || 'text-white'} opacity-75 mb-2`}>{label}</p>
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
    <div className={`${theme?.bg || 'bg-gray-800'} bg-opacity-50 p-4 rounded-lg shadow-lg`}>
      <p className={`${theme?.text || 'text-white'} opacity-75 mb-2`}>{label}</p>
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

// Main component
export default function PokemonDetail({ pokemon, species, alternativeForms, evolutionChain }) {
  const router = useRouter();
  const [isShiny, setIsShiny] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [activeSprite, setActiveSprite] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const id = pokemon.id;
  const name = pokemon.name.replace(/-/g, ' ');
  
  // Define all tabs including the new sprites tab
  const tabs = [
    { id: 'info', label: 'Info' },
    { id: 'forms', label: 'Forms' },
    { id: 'sprites', label: 'Sprites' },
    { id: 'moves', label: 'Moves' },
    { id: 'stats', label: 'Stats' },
    { id: 'abilities', label: 'Abilities' },
    { id: 'locations', label: 'Locations' },
    { id: 'evolution', label: 'Evolution' }
  ];

  // Fix type theme access
  const safeTypes = pokemon?.types || [];
  const primaryType = safeTypes.length > 0 ? safeTypes[0]?.type?.name : null;
  
  // Create a safe theme with fallbacks for every property access
  const safeTheme = {
    bg: primaryType && typeColors[primaryType]?.bg ? typeColors[primaryType].bg : defaultTheme.bg,
    text: primaryType && typeColors[primaryType]?.text ? typeColors[primaryType].text : defaultTheme.text,
    accent: primaryType && typeColors[primaryType]?.accent ? typeColors[primaryType].accent : defaultTheme.accent
  };

  return (
    <div className={`min-h-screen ${safeTheme.bg} ${safeTheme.text} font-rounded`}>
      <Head>
        <title>{properCase(name)} | Pokédex Live</title>
        <meta name="description" content={`View details for ${properCase(name)}`} />
      </Head>

      <div className="container mx-auto p-4">
        {/* Pokemon Header */}
        <div className="mb-6 flex flex-col md:flex-row gap-6">
          {/* Pokemon Image */}
          <div className="md:w-1/3 relative bg-gray-800 rounded-xl p-4 flex flex-col items-center">
            <div className="relative w-64 h-64">
              <Image
                src={isShiny ? (pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny) : pokemon.sprites.other['official-artwork'].front_default}
                alt={name}
                layout="fill"
                objectFit="contain"
                priority
              />
            </div>
            
            {/* Shiny Toggle */}
            <button
              onClick={() => setIsShiny(!isShiny)}
              className={`mt-4 px-4 py-2 rounded-md 
                ${isShiny ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              {isShiny ? 'View Regular' : 'View Shiny'}
            </button>
          </div>
          
          {/* Pokemon Info */}
          <div className="md:w-2/3 bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold capitalize">{name}</h1>
                <p className="text-xl text-gray-400">#{String(id).padStart(3, '0')}</p>
            </div>
              <div className="flex gap-2">
                {pokemon.types.map(type => (
                <span
                    key={type.type.name}
                    className={`${typeColors[type.type.name].accent} px-4 py-1 rounded-lg text-white capitalize`}
                >
                    {type.type.name}
                </span>
              ))}
            </div>
            </div>
            
            <EnhancedTrackingPanel
              pokemonId={id}
              pokemonName={pokemon.name}
              hasAlphaForm={hasAlphaForm(pokemon.name)}
              onStatusChange={() => {}}
            />
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-gray-400 text-sm">Height</h3>
                <p>{(pokemon.height / 10).toFixed(1)} m</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Weight</h3>
                <p>{(pokemon.weight / 10).toFixed(1)} kg</p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm">Abilities</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {pokemon.abilities.map(ability => (
                  <span
                      key={ability.ability.name}
                      className="px-2 py-1 bg-gray-700 rounded text-sm capitalize"
                    >
                      {ability.ability.name.replace('-', ' ')}
                      {ability.is_hidden && <span className="ml-1 text-yellow-500">*</span>}
                  </span>
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-gray-800 rounded-lg overflow-hidden mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
              </div>
            </div>

        {/* Tab Content */}
          <div className="bg-gray-800 rounded-lg p-6">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pokemon information content but without the sprites section */}
                <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Pokédex Data</h3>
                  
                  {/* Display Pokedex entry */}
                  {species.flavor_text_entries && (
                    <div className="mb-6">
                      <p className="mb-2 leading-relaxed">
                        {species.flavor_text_entries
                          .find(entry => entry.language.name === 'en')
                          ?.flavor_text.replace(/\f/g, ' ')}
                      </p>
              </div>
                  )}
                  
                  {/* Species info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-gray-400">Species</h4>
                      <p>
                        {species.genera?.find(g => g.language.name === 'en')?.genus || '-'}
                      </p>
          </div>

                    <div>
                      <h4 className="text-sm text-gray-400">Habitat</h4>
                      <p className="capitalize">
                        {species.habitat?.name?.replace('-', ' ') || 'Unknown'}
                </p>
              </div>
                    
                    <div>
                      <h4 className="text-sm text-gray-400">Base Friendship</h4>
                      <p>{species.base_happiness || '-'}</p>
              </div>
                    
                    <div>
                      <h4 className="text-sm text-gray-400">Capture Rate</h4>
                      <p>{species.capture_rate || '-'}</p>
              </div>
                    
                    <div>
                      <h4 className="text-sm text-gray-400">Growth Rate</h4>
                      <p className="capitalize">{species.growth_rate?.name?.replace('-', ' ') || '-'}</p>
            </div>
                    
                    <div>
                      <h4 className="text-sm text-gray-400">Base Experience</h4>
                      <p>{pokemon.base_experience || '-'}</p>
          </div>
        </div>
          </div>
                
                {/* Base Stats/Physical data card - can remain */}
                <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Base Stats</h3>
                  <div className="space-y-3">
                    {pokemon.stats.map(stat => {
                      const percentage = Math.min(100, (stat.base_stat / 255) * 100);
              return (
                <div key={stat.stat.name}>
                  <div className="flex justify-between mb-1">
                            <span className="text-gray-300">{formatStatName(stat.stat.name)}</span>
                    <span>{stat.base_stat}</span>
                  </div>
                          <div className="h-2 bg-gray-600 rounded-full">
                    <div
                              className={`${typeColors[stat.stat.name].accent} h-2 rounded-full`} 
                      style={{ width: `${percentage}%` }}
                            ></div>
                  </div>
                </div>
              );
            })}
                    
                    {/* Total Stats */}
                    <div className="pt-2 border-t border-gray-600">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">
                          {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                        </span>
          </div>
        </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Forms Tab */}
          {activeTab === 'forms' && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Alternative Forms</h3>
              
              {alternativeForms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {alternativeForms.map(form => (
                    <div key={form.id} className="bg-gray-700 rounded-lg p-4 flex flex-col items-center">
                      <div className="relative w-40 h-40 mb-4">
                        <Image
                          src={
                            form.sprites.other?.['official-artwork']?.front_default ||
                            form.sprites.front_default
                          }
                          alt={form.name}
                          layout="fill"
                          objectFit="contain"
                        />
          </div>
                      <h4 className="text-lg font-medium capitalize mb-2">
                        {form.name.replace(pokemon.name + '-', '').replace('-', ' ')}
                      </h4>
                      <div className="flex gap-2 mt-2">
                        {form.types.map(type => (
                          <span
                            key={type.type.name}
                            className={`${typeColors[type.type.name].accent} px-2 py-1 rounded text-xs text-white capitalize`}
                          >
                            {type.type.name}
                </span>
            ))}
          </div>
        </div>
                  ))}
                    </div>
              ) : (
                <p className="text-gray-400">No alternative forms available for this Pokémon.</p>
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
                    className={`bg-gray-700 rounded-lg p-3 flex flex-col items-center cursor-pointer transition-all ${
                      isActive ? 'ring-2 ring-red-500' : 'hover:bg-gray-600'
                    } ${large ? 'col-span-2 row-span-2' : ''}`}
                    onClick={onClick}
                  >
                    {src ? (
                      <div className={`relative ${large ? 'w-40 h-40' : 'w-20 h-20'} ${isAnimated ? 'animate-bounce-slow' : ''}`}>
                        <Image
                          src={src}
                          alt={label}
                          layout="fill"
                          objectFit="contain"
                      />
                    </div>
                    ) : (
                      <div className={`flex items-center justify-center ${large ? 'w-40 h-40' : 'w-20 h-20'} bg-gray-800 rounded`}>
                        <span className="text-gray-600">N/A</span>
                  </div>
                )}
                    <span className={`mt-2 text-xs text-center ${isShiny ? 'text-yellow-400' : ''}`}>
                      {label}
                    </span>
              </div>
                );

                // Group sprites by generation and type
                const spriteGroups = [
                  {
                    name: "Generation 1 (RBY)",
                    sprites: [
                      { src: pokemon.sprites.versions['generation-i']['red-blue'].front_default, label: "Red/Blue Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-i']['red-blue'].back_default, label: "Red/Blue Back", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-i'].yellow.front_default, label: "Yellow Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-i'].yellow.back_default, label: "Yellow Back", isAnimated: false },
                    ]
                  },
                  {
                    name: "Generation 2 (GSC)",
                    sprites: [
                      { src: pokemon.sprites.versions['generation-ii'].crystal.front_default, label: "Crystal Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-ii'].crystal.back_default, label: "Crystal Back", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-ii'].crystal.front_shiny, label: "Crystal Shiny Front", isShiny: true },
                      { src: pokemon.sprites.versions['generation-ii'].crystal.back_shiny, label: "Crystal Shiny Back", isShiny: true },
                      { src: pokemon.sprites.versions['generation-ii'].gold.front_default, label: "Gold Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-ii'].gold.back_default, label: "Gold Back", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-ii'].silver.front_default, label: "Silver Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-ii'].silver.back_default, label: "Silver Back", isAnimated: false },
                    ]
                  },
                  {
                    name: "Generation 3 (RSE)",
                    sprites: [
                      { src: pokemon.sprites.versions['generation-iii']['ruby-sapphire'].front_default, label: "Ruby/Sapphire Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-iii']['ruby-sapphire'].back_default, label: "Ruby/Sapphire Back", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-iii']['ruby-sapphire'].front_shiny, label: "Ruby/Sapphire Shiny Front", isShiny: true },
                      { src: pokemon.sprites.versions['generation-iii']['ruby-sapphire'].back_shiny, label: "Ruby/Sapphire Shiny Back", isShiny: true },
                      { src: pokemon.sprites.versions['generation-iii'].emerald.front_default, label: "Emerald Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-iii'].emerald.back_default, label: "Emerald Back", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-iii']['firered-leafgreen'].front_default, label: "FireRed/LeafGreen Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-iii']['firered-leafgreen'].back_default, label: "FireRed/LeafGreen Back", isAnimated: false },
                    ]
                  },
                  {
                    name: "Generation 4 (DPPt)",
                    sprites: [
                      { src: pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_default, label: "Diamond/Pearl Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-iv']['diamond-pearl'].back_default, label: "Diamond/Pearl Back", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_female, label: "Diamond/Pearl Female Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-iv']['diamond-pearl'].back_female, label: "Diamond/Pearl Female Back", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_shiny, label: "Diamond/Pearl Shiny Front", isShiny: true },
                      { src: pokemon.sprites.versions['generation-iv']['diamond-pearl'].back_shiny, label: "Diamond/Pearl Shiny Back", isShiny: true },
                      { src: pokemon.sprites.versions['generation-iv']['diamond-pearl'].front_shiny_female, label: "D/P Shiny Female Front", isShiny: true },
                      { src: pokemon.sprites.versions['generation-iv']['diamond-pearl'].back_shiny_female, label: "D/P Shiny Female Back", isShiny: true },
                      { src: pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].front_default, label: "HeartGold/SoulSilver Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-iv']['heartgold-soulsilver'].back_default, label: "HeartGold/SoulSilver Back", isAnimated: false },
                    ]
                  },
                  {
                    name: "Generation 5 (BW)",
                    sprites: [
                      { src: pokemon.sprites.versions['generation-v']['black-white'].front_default, label: "Black/White Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].back_default, label: "Black/White Back", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].front_female, label: "Black/White Female Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].back_female, label: "Black/White Female Back", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].front_shiny, label: "Black/White Shiny Front", isShiny: true },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].back_shiny, label: "Black/White Shiny Back", isShiny: true },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].front_shiny_female, label: "B/W Shiny Female Front", isShiny: true },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].back_shiny_female, label: "B/W Shiny Female Back", isShiny: true },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].animated.front_default, label: "Animated Front", isAnimated: true },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].animated.back_default, label: "Animated Back", isAnimated: true },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].animated.front_female, label: "Animated Female Front", isAnimated: true },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].animated.back_female, label: "Animated Female Back", isAnimated: true },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].animated.front_shiny, label: "Animated Shiny Front", isShiny: true, isAnimated: true },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].animated.back_shiny, label: "Animated Shiny Back", isShiny: true, isAnimated: true },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].animated.front_shiny_female, label: "Animated Shiny Female Front", isShiny: true, isAnimated: true },
                      { src: pokemon.sprites.versions['generation-v']['black-white'].animated.back_shiny_female, label: "Animated Shiny Female Back", isShiny: true, isAnimated: true },
                    ]
                  },
                  {
                    name: "Generation 6-7 (XY, SM)",
                    sprites: [
                      { src: pokemon.sprites.versions['generation-vi']['x-y'].front_default, label: "X/Y Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-vi']['x-y'].front_female, label: "X/Y Female Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-vi']['x-y'].front_shiny, label: "X/Y Shiny Front", isShiny: true },
                      { src: pokemon.sprites.versions['generation-vi']['x-y'].front_shiny_female, label: "X/Y Shiny Female Front", isShiny: true },
                      { src: pokemon.sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_default, label: "ORAS Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_female, label: "ORAS Female Front", isAnimated: false },
                      { src: pokemon.sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_shiny, label: "ORAS Shiny Front", isShiny: true },
                      { src: pokemon.sprites.versions['generation-vi']['omegaruby-alphasapphire'].front_shiny_female, label: "ORAS Shiny Female Front", isShiny: true },
                    ]
                  },
                  {
                    name: "Latest Sprites",
                    sprites: [
                      { src: pokemon.sprites.front_default, label: "Default Front", isAnimated: false, large: true },
                      { src: pokemon.sprites.back_default, label: "Default Back", isAnimated: false, large: true },
                      { src: pokemon.sprites.front_female, label: "Female Front", isAnimated: false },
                      { src: pokemon.sprites.back_female, label: "Female Back", isAnimated: false },
                      { src: pokemon.sprites.front_shiny, label: "Shiny Front", isShiny: true, large: true },
                      { src: pokemon.sprites.back_shiny, label: "Shiny Back", isShiny: true, large: true },
                      { src: pokemon.sprites.front_shiny_female, label: "Shiny Female Front", isShiny: true },
                      { src: pokemon.sprites.back_shiny_female, label: "Shiny Female Back", isShiny: true },
                    ]
                  },
                  {
                    name: "Artwork & Icons",
                    sprites: [
                      { src: pokemon.sprites.other['official-artwork'].front_default, label: "Official Artwork", isAnimated: false, large: true },
                      { src: pokemon.sprites.other['official-artwork'].front_shiny, label: "Official Artwork (Shiny)", isShiny: true, large: true },
                      { src: pokemon.sprites.other.home.front_default, label: "HOME Model", isAnimated: false, large: true },
                      { src: pokemon.sprites.other.home.front_female, label: "HOME Model (Female)", isAnimated: false },
                      { src: pokemon.sprites.other.home.front_shiny, label: "HOME Model (Shiny)", isShiny: true, large: true },
                      { src: pokemon.sprites.other.home.front_shiny_female, label: "HOME (Shiny Female)", isShiny: true },
                      { src: pokemon.sprites.other['dream_world'].front_default, label: "Dream World", isAnimated: false, large: true },
                      { src: pokemon.sprites.other['dream_world'].front_female, label: "Dream World (Female)", isAnimated: false },
                    ]
                  }
                ];

                return (
                  <div className="space-y-8">
                    {spriteGroups.map((group, idx) => (
                      <div key={idx} className="mb-8">
                        <h3 className="text-xl font-medium mb-4">{group.name}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                          {group.sprites
                            .filter(sprite => sprite.src != null)
                            .map((sprite, idx) => (
                              <SpriteCard
                                key={idx}
                                src={sprite.src}
                                label={sprite.label}
                                onClick={() => setActiveSprite(sprite.src)}
                                isActive={activeSprite === sprite.src}
                                isShiny={sprite.isShiny}
                                isAnimated={sprite.isAnimated}
                                large={sprite.large}
                              />
                            ))}
                    </div>
                  </div>
                    ))}
                      </div>
                );
              })()}
                    </div>
                  )}
          
          {/* Moves Tab */}
          {activeTab === 'moves' && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Moves</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Power
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        PP
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Method
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {pokemon.moves.slice(0, 50).map((move, index) => (
                      <tr key={move.move.name} className={index % 2 === 0 ? 'bg-gray-750' : 'bg-gray-700'}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm capitalize">
                          {move.move.name.replace(/-/g, ' ')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 rounded text-xs bg-red-600 text-white">
                            Type
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          Physical
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          90
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          100%
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          15
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {move.version_group_details[0].move_learn_method.name.replace('-', ' ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Stats & Attributes</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Base Stats with bars */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-medium mb-4">Base Stats</h4>
                  
                  <div className="space-y-4">
                    {pokemon.stats.map(stat => {
                      const statValue = stat.base_stat;
                      const percentage = Math.min(100, (statValue / 255) * 100);
                      
                      // Color based on stat value
                      let barColor;
                      if (statValue < 50) barColor = 'bg-red-500';
                      else if (statValue < 80) barColor = 'bg-yellow-500';
                      else if (statValue < 120) barColor = 'bg-green-500';
                      else barColor = 'bg-blue-500';
                      
                      return (
                        <div key={stat.stat.name}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{formatStatName(stat.stat.name)}</span>
                            <span>{statValue}</span>
                    </div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div 
                              className={`${barColor} h-2.5 rounded-full`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                  </div>
                      </div>
                      );
                    })}
                    
                    {/* Total Stats */}
                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">
                          {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                        </span>
                    </div>
                </div>
              </div>
                </div>
                
                {/* Training Data */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-medium mb-4">Training</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Base EXP</span>
                      <span>{pokemon.base_experience}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Catch Rate</span>
                      <span>{species.capture_rate} ({(species.capture_rate / 255 * 100).toFixed(1)}%)</span>
                  </div>
                    
                    <div className="flex justify-between">
                      <span>Base Happiness</span>
                      <span>{species.base_happiness}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Growth Rate</span>
                      <span className="capitalize">{species.growth_rate?.name?.replace('-', ' ') || '-'}</span>
                  </div>
                    
                    {/* EV Yield */}
                    <div className="pt-2 border-t border-gray-700">
                      <h5 className="font-medium mb-2">EV Yield</h5>
                      <div className="space-y-1">
                        {pokemon.stats.filter(stat => stat.effort > 0).map(stat => (
                          <div key={stat.stat.name} className="flex justify-between">
                            <span>{formatStatName(stat.stat.name)}</span>
                            <span>+{stat.effort}</span>
                    </div>
                        ))}
                  </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
          )}
          
          {/* Abilities Tab */}
          {activeTab === 'abilities' && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Abilities</h3>
              
              <div className="grid gap-4">
                {pokemon.abilities.map((ability, index) => (
                  <div key={ability.ability.name} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-medium capitalize">
                        {ability.ability.name.replace('-', ' ')}
                        {ability.is_hidden && <span className="ml-2 text-sm text-yellow-400">(Hidden Ability)</span>}
                      </h4>
                      <span className="text-sm bg-gray-600 px-2 py-1 rounded">
                        Slot {index + 1}
                      </span>
                          </div>
                    <p className="text-gray-300">
                      Ability description would appear here if available through the API.
                    </p>
                        </div>
                ))}
                          </div>
                        </div>
                      )}
          
          {/* Locations Tab */}
          {activeTab === 'locations' && (
            <div className="mt-6">
              <LocationEncounterData 
                pokemon={pokemon} 
                theme={pokemon.types && pokemon.types.length > 0 
                  ? typeColors[pokemon.types[0].type.name] 
                  : typeColors.normal} 
              />
                    </div>
          )}
          
          {/* Evolution Tab */}
          {activeTab === 'evolution' && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Evolution Chain</h3>
              <div className="bg-gray-700 rounded-lg p-6">
                {evolutionChain ? (
                  <EvolutionChain 
                    chain={evolutionChain} 
                    currentPokemonId={pokemon?.id?.toString() || '0'} 
                  />
                ) : (
                  <p>No evolution data available</p>
                )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

// Server-side data fetching
export async function getStaticPaths() {
  // Fetch all Pokémon for pre-rendering
  const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1008'); 
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
    // Handle special cases for Pokémon with multiple forms
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

    // Get alternative forms
    const forms = await Promise.all(
      species.varieties.map(async (variety) => {
        try {
        const resForm = await fetch(variety.pokemon.url);
        if (!resForm.ok) return null;
        const formData = await resForm.json();
        return {
          ...formData,
          formName: variety.pokemon.name
        };
        } catch (error) {
          console.error(`Error fetching form data for ${variety.pokemon.name}:`, error);
          return null;
        }
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
      revalidate: 86400 // Revalidate once per day
    };
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return { notFound: true };
  }
}