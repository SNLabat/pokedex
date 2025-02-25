// pages/pokemon/[name].js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '../../components/Navigation';
import LocationEncounterData from '../../components/LocationEncounterData';
import EnhancedTrackingPanel from '../../components/EnhancedTrackingPanel';
import { currentUserPlaceholder } from '../../lib/dataManagement';

// Type color mapping for visual styling
const typeColors = {
  normal: { bg: 'bg-gray-700', text: 'text-gray-100', accent: 'bg-gray-500', light: 'bg-gray-600' },
  fire: { bg: 'bg-orange-900', text: 'text-orange-50', accent: 'bg-orange-600', light: 'bg-orange-800' },
  water: { bg: 'bg-blue-900', text: 'text-blue-50', accent: 'bg-blue-600', light: 'bg-blue-800' },
  electric: { bg: 'bg-yellow-700', text: 'text-yellow-50', accent: 'bg-yellow-500', light: 'bg-yellow-600' },
  grass: { bg: 'bg-green-800', text: 'text-green-50', accent: 'bg-green-600', light: 'bg-green-700' },
  ice: { bg: 'bg-cyan-800', text: 'text-cyan-50', accent: 'bg-cyan-500', light: 'bg-cyan-700' },
  fighting: { bg: 'bg-red-900', text: 'text-red-50', accent: 'bg-red-600', light: 'bg-red-800' },
  poison: { bg: 'bg-purple-900', text: 'text-purple-50', accent: 'bg-purple-600', light: 'bg-purple-800' },
  ground: { bg: 'bg-amber-900', text: 'text-amber-50', accent: 'bg-amber-600', light: 'bg-amber-800' },
  flying: { bg: 'bg-indigo-800', text: 'text-indigo-50', accent: 'bg-indigo-500', light: 'bg-indigo-700' },
  psychic: { bg: 'bg-pink-800', text: 'text-pink-50', accent: 'bg-pink-500', light: 'bg-pink-700' },
  bug: { bg: 'bg-lime-800', text: 'text-lime-50', accent: 'bg-lime-600', light: 'bg-lime-700' },
  rock: { bg: 'bg-stone-800', text: 'text-stone-50', accent: 'bg-stone-600', light: 'bg-stone-700' },
  ghost: { bg: 'bg-purple-950', text: 'text-purple-50', accent: 'bg-purple-700', light: 'bg-purple-900' },
  dragon: { bg: 'bg-violet-900', text: 'text-violet-50', accent: 'bg-violet-600', light: 'bg-violet-800' },
  dark: { bg: 'bg-neutral-900', text: 'text-neutral-50', accent: 'bg-neutral-700', light: 'bg-neutral-800' },
  steel: { bg: 'bg-zinc-800', text: 'text-zinc-50', accent: 'bg-zinc-600', light: 'bg-zinc-700' },
  fairy: { bg: 'bg-pink-700', text: 'text-pink-50', accent: 'bg-pink-500', light: 'bg-pink-600' }
};

// Default theme if no type is available
const defaultTheme = { bg: 'bg-gray-800', text: 'text-white', accent: 'bg-gray-600', light: 'bg-gray-700' };

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

// Type effectiveness data
const typeEffectiveness = {
  normal: { weakTo: ['fighting'], resistantTo: [], immuneTo: ['ghost'] },
  fire: { weakTo: ['water', 'ground', 'rock'], resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immuneTo: [] },
  water: { weakTo: ['electric', 'grass'], resistantTo: ['fire', 'water', 'ice', 'steel'], immuneTo: [] },
  electric: { weakTo: ['ground'], resistantTo: ['electric', 'flying', 'steel'], immuneTo: [] },
  grass: { weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'], resistantTo: ['water', 'electric', 'grass', 'ground'], immuneTo: [] },
  ice: { weakTo: ['fire', 'fighting', 'rock', 'steel'], resistantTo: ['ice'], immuneTo: [] },
  fighting: { weakTo: ['flying', 'psychic', 'fairy'], resistantTo: ['bug', 'rock', 'dark'], immuneTo: [] },
  poison: { weakTo: ['ground', 'psychic'], resistantTo: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immuneTo: [] },
  ground: { weakTo: ['water', 'grass', 'ice'], resistantTo: ['poison', 'rock'], immuneTo: ['electric'] },
  flying: { weakTo: ['electric', 'ice', 'rock'], resistantTo: ['grass', 'fighting', 'bug'], immuneTo: ['ground'] },
  psychic: { weakTo: ['bug', 'ghost', 'dark'], resistantTo: ['fighting', 'psychic'], immuneTo: [] },
  bug: { weakTo: ['fire', 'flying', 'rock'], resistantTo: ['grass', 'fighting', 'ground'], immuneTo: [] },
  rock: { weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'], resistantTo: ['normal', 'fire', 'poison', 'flying'], immuneTo: [] },
  ghost: { weakTo: ['ghost', 'dark'], resistantTo: ['poison', 'bug'], immuneTo: ['normal', 'fighting'] },
  dragon: { weakTo: ['ice', 'dragon', 'fairy'], resistantTo: ['fire', 'water', 'electric', 'grass'], immuneTo: [] },
  dark: { weakTo: ['fighting', 'bug', 'fairy'], resistantTo: ['ghost', 'dark'], immuneTo: ['psychic'] },
  steel: { weakTo: ['fire', 'fighting', 'ground'], resistantTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immuneTo: ['poison'] },
  fairy: { weakTo: ['poison', 'steel'], resistantTo: ['fighting', 'bug', 'dark'], immuneTo: ['dragon'] }
};

// Helper function to calculate weaknesses considering dual types
const getWeaknesses = (types) => {
  if (!types || types.length === 0) return [];
  
  const weaknesses = new Map();
  const resistances = new Map();
  const immunities = new Set();
  
  // Process each type
  types.forEach(type => {
    const data = typeEffectiveness[type];
    if (!data) return;
    
    // Add weaknesses
    data.weakTo.forEach(t => weaknesses.set(t, (weaknesses.get(t) || 1) * 2));
    
    // Add resistances
    data.resistantTo.forEach(t => resistances.set(t, (resistances.get(t) || 1) * 0.5));
    
    // Add immunities (these override everything else)
    data.immuneTo.forEach(t => immunities.add(t));
  });
  
  // Return only types that result in weakness after all calculations
  return [...weaknesses.entries()]
    .filter(([type, value]) => !immunities.has(type) && value / (resistances.get(type) || 1) > 1)
    .map(([type]) => type);
};

// Helper function to calculate resistances considering dual types
const getResistances = (types) => {
  if (!types || types.length === 0) return [];
  
  const weaknesses = new Map();
  const resistances = new Map();
  const immunities = new Set();
  
  // Process each type
  types.forEach(type => {
    const data = typeEffectiveness[type];
    if (!data) return;
    
    // Add weaknesses
    data.weakTo.forEach(t => weaknesses.set(t, (weaknesses.get(t) || 1) * 2));
    
    // Add resistances
    data.resistantTo.forEach(t => resistances.set(t, (resistances.get(t) || 1) * 0.5));
    
    // Add immunities
    data.immuneTo.forEach(t => immunities.add(t));
  });
  
  // Return only types that result in resistance after all calculations
  return [...resistances.entries()]
    .filter(([type, value]) => !immunities.has(type) && value / (weaknesses.get(type) || 1) < 1)
    .map(([type]) => type);
};

// Helper function to calculate immunities
const getImmunities = (types) => {
  if (!types || types.length === 0) return [];
  
  const immunities = new Set();
  
  // Process each type
  types.forEach(type => {
    const data = typeEffectiveness[type];
    if (!data) return;
    
    // Add immunities
    data.immuneTo.forEach(t => immunities.add(t));
  });
  
  return [...immunities];
};

// Evolution Chain Renderer Component
const EvolutionChainRenderer = ({ chain, currentPokemonId, isExpanded }) => {
  if (!chain || !chain.species) return null;
  
  const renderPokemonInChain = (speciesData) => {
    if (!speciesData) return null;
    
    // Extract ID from URL
    const urlParts = speciesData.url.split('/');
    const id = urlParts[urlParts.length - 2];
    const isCurrentPokemon = id === currentPokemonId?.toString();
    
    return (
      <Link href={`/pokemon/${speciesData.name}`} passHref>
        <a className={`flex flex-col items-center p-3 rounded-lg transition-transform hover:scale-105 ${
          isCurrentPokemon ? 'bg-gray-700 ring-2 ring-red-500' : 'hover:bg-gray-700'
        }`}>
          <div className="relative w-24 h-24">
            <Image
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
              alt={speciesData.name}
              layout="fill"
              objectFit="contain"
            />
          </div>
          <span className="mt-2 text-center capitalize">
            {speciesData.name.replace(/-/g, ' ')}
          </span>
        </a>
      </Link>
    );
  };
  
  const renderEvolutionDetails = (details) => {
    if (!details || details.length === 0) return null;
    
    const detail = details[0]; // Take first evolution method
    let evolutionMethod = '';
    
    if (detail.min_level) {
      evolutionMethod = `Level ${detail.min_level}`;
    } else if (detail.item) {
      evolutionMethod = `Use ${properCase(detail.item.name)}`;
    } else if (detail.trigger && detail.trigger.name === 'trade') {
      evolutionMethod = 'Trade';
      if (detail.held_item) evolutionMethod += ` holding ${properCase(detail.held_item.name)}`;
    } else if (detail.happiness) {
      evolutionMethod = `High Friendship`;
    } else if (detail.min_beauty) {
      evolutionMethod = `High Beauty`;
    } else if (detail.min_affection) {
      evolutionMethod = `High Affection`;
    } else {
      evolutionMethod = 'Special condition';
    }
    
    return (
      <div className="flex flex-col items-center text-sm text-gray-400 mx-2">
        <div className="h-0.5 w-12 bg-gray-600 my-2"></div>
        <span>{evolutionMethod}</span>
        <div className="h-0.5 w-12 bg-gray-600 my-2"></div>
      </div>
    );
  };
  
  // Render first evolution stage
  const renderEvolutionStage = (evolutionData, depth = 0) => {
    if (!evolutionData || !evolutionData.species) return null;
    
    // For each evolution path
    return (
      <>
        <div className="flex flex-col items-center">
          {renderPokemonInChain(evolutionData.species)}
          
          {/* Handle divergent evolution paths */}
          {evolutionData.evolves_to && evolutionData.evolves_to.length > 0 && (
            <div className="flex flex-wrap justify-center mt-4">
              {evolutionData.evolves_to.map((evo, index) => (
                <div key={index} className="flex flex-col items-center mx-2">
                  {renderEvolutionDetails(evo.evolution_details)}
                  {renderPokemonInChain(evo.species)}
                  
                  {/* Third evolution stage */}
                  {isExpanded && evo.evolves_to && evo.evolves_to.length > 0 && (
                    <div className="flex flex-wrap justify-center mt-4">
                      {evo.evolves_to.map((thirdEvo, thirdIndex) => (
                        <div key={thirdIndex} className="flex flex-col items-center mx-2">
                          {renderEvolutionDetails(thirdEvo.evolution_details)}
                          {renderPokemonInChain(thirdEvo.species)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };
  
  return renderEvolutionStage(chain);
};

// Moves Table Component
const MovesTable = ({ moves, learnMethod, title }) => {
  if (!moves) return null;
  
  // Filter moves by the requested learn method
  const filteredMoves = moves
    .filter(moveData => moveData.version_group_details
      .some(detail => {
        if (learnMethod === 'level-up') {
          return detail.move_learn_method.name === 'level-up';
        } else if (learnMethod === 'machine') {
          return detail.move_learn_method.name === 'machine';
        } else if (learnMethod === 'egg') {
          return detail.move_learn_method.name === 'egg';
        }
        return false;
      })
    )
    .sort((a, b) => {
      if (learnMethod === 'level-up') {
        // Sort by level
        const levelA = Math.min(...a.version_group_details
          .filter(d => d.move_learn_method.name === 'level-up')
          .map(d => d.level_learned_at));
        const levelB = Math.min(...b.version_group_details
          .filter(d => d.move_learn_method.name === 'level-up')
          .map(d => d.level_learned_at));
        return levelA - levelB;
      }
      // Sort alphabetically by default
      return a.move.name.localeCompare(b.move.name);
    });
  
  if (filteredMoves.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-3">{title}</h3>
        <p className="text-gray-400">No moves found for this method</p>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-700">
            <tr>
              {learnMethod === 'level-up' && <th className="px-4 py-2 text-left">Level</th>}
              <th className="px-4 py-2 text-left">Move</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-right">Power</th>
              <th className="px-4 py-2 text-right">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredMoves.map(moveData => {
              // For simplicity, we'll use placeholder values for move details
              // In a real app, you'd fetch these from an API
              return (
                <tr key={moveData.move.name} className="hover:bg-gray-700">
                  {learnMethod === 'level-up' && (
                    <td className="px-4 py-2">
                      {Math.min(...moveData.version_group_details
                        .filter(d => d.move_learn_method.name === 'level-up')
                        .map(d => d.level_learned_at))}
                    </td>
                  )}
                  <td className="px-4 py-2 capitalize">{moveData.move.name.replace('-', ' ')}</td>
                  <td className="px-4 py-2">-</td>
                  <td className="px-4 py-2">-</td>
                  <td className="px-4 py-2 text-right">-</td>
                  <td className="px-4 py-2 text-right">-</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Hero section redesign with circular pokemon image and sprite toggles
const PokemonHero = ({ pokemon, isShiny, setIsShiny, isAnimated, setIsAnimated, theme, speciesText }) => {
  return (
    <div className="bg-gray-950 py-10 mb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Pokemon Image in Circle */}
          <div className="relative mb-6 md:mb-0 md:mr-10">
            <div className={`w-64 h-64 rounded-full overflow-hidden relative flex items-center justify-center
              ${pokemon.types.length > 0 ? theme.light : defaultTheme.light}`}
            >
              {/* Type-based outer ring */}
              <div className={`absolute inset-0 rounded-full ${
                pokemon.types.length > 1 
                  ? `bg-gradient-to-r from-${pokemon.types[0].type.name} to-${pokemon.types[1].type.name}` 
                  : theme.accent
                } z-0 p-3`}>
                <div className="w-full h-full bg-gray-900 rounded-full"></div>
              </div>
              
              {/* Pokemon sprite */}
              <div className="relative z-10 w-56 h-56">
                <Image
                  src={
                    isAnimated
                      ? (isShiny 
                          ? pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_shiny || pokemon.sprites.front_shiny 
                          : pokemon.sprites.versions?.['generation-v']?.['black-white']?.animated?.front_default || pokemon.sprites.front_default)
                      : (isShiny
                          ? pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny
                          : pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default)
                  }
                  alt={pokemon.name}
                  layout="fill"
                  objectFit="contain"
                  priority
                />
              </div>
            </div>
            
            {/* Type Pills */}
            <div className="flex justify-center mt-4 space-x-2">
              {pokemon.types.map(typeData => (
                <span
                  key={typeData.type.name}
                  className={`${typeColors[typeData.type.name]?.accent || 'bg-gray-600'} 
                    px-4 py-2 rounded-full text-sm capitalize font-medium`}
                >
                  {typeData.type.name}
                </span>
              ))}
            </div>
          </div>
          
          {/* Pokemon Info and Toggles */}
          <div className="flex-1">
            <div className="flex flex-col">
              <div className="mb-4">
                <p className="text-gray-400 text-xl mb-1">#{String(pokemon.id).padStart(3, '0')}</p>
                <h1 className="text-4xl md:text-5xl font-bold capitalize mb-2">{pokemon.name.replace(/-/g, ' ')}</h1>
                <p className="text-xl text-gray-300 italic">{speciesText}</p>
              </div>
              
              {/* Sprite Toggle Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => setIsShiny(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !isShiny ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setIsShiny(true)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isShiny ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Shiny
                </button>
                <button
                  onClick={() => setIsAnimated(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !isAnimated ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Static
                </button>
                <button
                  onClick={() => setIsAnimated(true)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isAnimated ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  Animated
                </button>
              </div>
              
              {/* Basic Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Height</p>
                  <p className="font-medium">{(pokemon.height / 10).toFixed(1)}m</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Weight</p>
                  <p className="font-medium">{(pokemon.weight / 10).toFixed(1)}kg</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Base XP</p>
                  <p className="font-medium">{pokemon.base_experience || 'N/A'}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-sm">Abilities</p>
                  <p className="font-medium capitalize">
                    {pokemon.abilities.map(a => a.ability.name.replace(/-/g, ' ')).join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
export default function PokemonDetail({ pokemon, species, evolutionChain, alternativeForms }) {
  const router = useRouter();
  const [isShiny, setIsShiny] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [caughtStatus, setCaughtStatus] = useState({});
  const [isEvolutionExpanded, setIsEvolutionExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset states when the route changes to handle direct navigation
  useEffect(() => {
    // Get caught status from localStorage when Pokémon data changes
    if (pokemon && typeof window !== 'undefined') {
      try {
        const caughtData = JSON.parse(localStorage.getItem('caughtPokemon') || '{}');
        setCaughtStatus(caughtData[pokemon.id] || {});
        
        // Update recently viewed
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const filteredRecent = recentlyViewed.filter(p => p.id !== pokemon.id);
        const updatedRecent = [
          { id: pokemon.id, name: pokemon.name },
          ...filteredRecent
        ].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
      } catch (error) {
        console.error('Error getting caught status or updating recently viewed:', error);
      }
    }
    
    // Reset other states
    setIsShiny(false);
    setIsAnimated(false);
    setActiveTab('info');
    setIsEvolutionExpanded(false);
  }, [pokemon?.id]); // Only depend on pokemon.id to avoid unnecessary resets
  
  // If the page is loading from a fallback route
  if (router.isFallback || !pokemon || !species) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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
  const englishEntries = species.flavor_text_entries
    ?.filter(entry => entry?.language?.name === 'en')
    ?.map(entry => entry?.flavor_text?.replace(/\f/g, ' '))
    || [];
  
  // Get a longer, non-repetitive description by combining entries
  const uniqueEntries = [...new Set(englishEntries)];
  const pokedexEntry = uniqueEntries.length > 0 ? uniqueEntries[0] : '';
  const additionalEntries = uniqueEntries.slice(1, 3);

  // Calculate basic stats for display
  const heightMeters = pokemon.height ? (pokemon.height / 10).toFixed(1) : '?';
  const heightFeet = pokemon.height ? Math.floor(pokemon.height * 0.32808) : '?';
  const heightInches = pokemon.height ? Math.round((pokemon.height * 0.32808 - Math.floor(pokemon.height * 0.32808)) * 12) : '?';
  const weightKg = pokemon.weight ? (pokemon.weight / 10).toFixed(1) : '?';
  const weightLbs = pokemon.weight ? (pokemon.weight / 4.536).toFixed(1) : '?';
  const totalStats = pokemon.stats?.reduce((sum, stat) => sum + (stat?.base_stat || 0), 0) || 0;

  // Get genus (category)
  const category = species.genera?.find(g => g?.language?.name === 'en')?.genus || '';

  // Previous and next Pokémon navigation
  const prevId = id > 1 ? id - 1 : null;
  const nextId = id < 1008 ? id + 1 : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>{properCase(name)} | Pokédex Live</title>
        <meta name="description" content={`View details for ${properCase(name)} - ${category}`} />
      </Head>
      
      <Navigation />
      
      {/* Updated hero section with circular image and toggles */}
      <PokemonHero 
        pokemon={pokemon} 
        isShiny={isShiny} 
        setIsShiny={setIsShiny} 
        isAnimated={isAnimated}
        setIsAnimated={setIsAnimated}
        theme={theme}
        speciesText={category}
      />
      
      {/* Main content - rest of your existing tabs */}
      <div className="container mx-auto px-4 pb-12">
        {/* Navigation links */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => router.push('/pokedex', undefined, { shallow: false })}
            className="text-white hover:text-gray-300 flex items-center"
          >
            <span className="mr-2">←</span> Back to Pokédex
          </button>
          
          <div className="flex space-x-4">
            <button
              onClick={() => router.push(`/pokemon/${prevId}`)}
              className="text-white hover:text-gray-300"
              disabled={!prevId}
            >
              ← Prev
            </button>
            <button
              onClick={() => router.push(`/pokemon/${nextId}`)}
              className="text-white hover:text-gray-300"
              disabled={!nextId}
            >
              Next →
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`mr-2 px-4 py-2 rounded-t-lg ${
              activeTab === 'info' ? theme.accent : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`mr-2 px-4 py-2 rounded-t-lg ${
              activeTab === 'stats' ? theme.accent : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab('evolution')}
            className={`mr-2 px-4 py-2 rounded-t-lg ${
              activeTab === 'evolution' ? theme.accent : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Evolution
          </button>
          <button
            onClick={() => setActiveTab('moves')}
            className={`mr-2 px-4 py-2 rounded-t-lg ${
              activeTab === 'moves' ? theme.accent : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Moves
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`mr-2 px-4 py-2 rounded-t-lg ${
              activeTab === 'locations' ? theme.accent : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Locations
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`mr-2 px-4 py-2 rounded-t-lg ${
              activeTab === 'tracking' ? theme.accent : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            Tracking
          </button>
        </div>
        
        {/* Tab Content - keep your existing tabs, but update the tracking tab */}
        
        {/* Tracking Tab with Forms */}
        {activeTab === 'tracking' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Collection Tracking</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Form */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Default Form</h3>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center">
                    <button
                      onClick={() => updateCaughtStatus('caught', 'default')}
                      className={`flex-1 py-2 rounded-lg mr-2 ${
                        caughtStatus['default']?.caught 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    >
                      {caughtStatus['default']?.caught ? 'Caught ✓' : 'Mark as Caught'}
                    </button>
                    
                    <button
                      onClick={() => updateCaughtStatus('shiny', 'default')}
                      className={`flex-1 py-2 rounded-lg ${
                        caughtStatus['default']?.shiny
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    >
                      {caughtStatus['default']?.shiny ? 'Shiny ✓' : 'Mark as Shiny'}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => updateCaughtStatus('alpha', 'default')}
                    className={`py-2 rounded-lg ${
                      caughtStatus['default']?.alpha
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  >
                    {caughtStatus['default']?.alpha ? 'Alpha ✓' : 'Mark as Alpha'}
                  </button>
                </div>
              </div>
              
              {/* Alternative Forms */}
              {alternativeForms && alternativeForms.map((form, index) => {
                if (!form) return null;
                
                // Extract form name from full name
                let formName = form.name;
                const displayName = properCase(formName.replace(pokemon.name + '-', ''));
                
                return (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3">{displayName || 'Alternative Form'}</h3>
                    
                    <div className="flex items-center mb-3">
                      <div className="relative w-16 h-16 mr-3">
                        <Image
                          src={form.sprites?.other?.['official-artwork']?.front_default || 
                              form.sprites?.front_default ||
                              '/img/unknown-pokemon.png'}
                          alt={formName}
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                      
                      <div className="flex gap-1">
                        {form.types?.map(typeData => (
                          <span
                            key={typeData.type.name}
                            className={`${typeColors[typeData.type.name]?.accent || 'bg-gray-600'} 
                              px-2 py-1 rounded text-xs capitalize`}
                          >
                            {typeData.type.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center">
                        <button
                          onClick={() => updateCaughtStatus('caught', formName)}
                          className={`flex-1 py-2 rounded-lg mr-2 ${
                            caughtStatus[formName]?.caught 
                              ? 'bg-green-600 text-white' 
                              : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        >
                          {caughtStatus[formName]?.caught ? 'Caught ✓' : 'Mark as Caught'}
                        </button>
                        
                        <button
                          onClick={() => updateCaughtStatus('shiny', formName)}
                          className={`flex-1 py-2 rounded-lg ${
                            caughtStatus[formName]?.shiny
                              ? 'bg-yellow-500 text-black'
                              : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        >
                          {caughtStatus[formName]?.shiny ? 'Shiny ✓' : 'Mark as Shiny'}
                        </button>
                      </div>
                      
                      <button
                        onClick={() => updateCaughtStatus('alpha', formName)}
                        className={`py-2 rounded-lg ${
                          caughtStatus[formName]?.alpha
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      >
                        {caughtStatus[formName]?.alpha ? 'Alpha ✓' : 'Mark as Alpha'}
                      </button>
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

export async function getStaticPaths() {
  try {
    // Get the first 151 Pokémon for better initial loading
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    const data = await res.json();
    
    const paths = data.results.map(pokemon => ({
      params: { name: pokemon.name }
    }));
    
    return { 
      paths,
      fallback: true // Change to true instead of 'blocking' for better UX
    };
  } catch (error) {
    console.error("Error in getStaticPaths:", error);
    return {
      paths: [],
      fallback: true
    };
  }
}

export async function getStaticProps({ params }) {
  try {
    // Use a direct fetch with a timeout to ensure it doesn't hang
    const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    };

    const pokemonName = params.name.toLowerCase();
    
    // Try to fetch by name first
    let resPokemon = await fetchWithTimeout(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    
    // If that fails, try to fetch by ID
    if (!resPokemon.ok && !isNaN(pokemonName)) {
      resPokemon = await fetchWithTimeout(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    }
    
    // If still not OK, throw an error
    if (!resPokemon.ok) throw new Error('Failed to fetch Pokemon');
    
    const pokemon = await resPokemon.json();
    
    // Fetch species data
    const resSpecies = await fetch(pokemon.species.url);
    if (!resSpecies.ok) throw new Error('Failed to fetch species');
    const species = await resSpecies.json();
    
    // Fetch evolution chain
    let evolutionChain = null;
    try {
      const evolutionChainRes = await fetch(species.evolution_chain.url);
      if (evolutionChainRes.ok) {
        evolutionChain = await evolutionChainRes.json();
      }
    } catch (error) {
      console.error('Error fetching evolution chain:', error);
    }
    
    // Fetch alternative forms
    let alternativeForms = [];
    try {
      if (species.varieties && species.varieties.length > 0) {
        const formPromises = species.varieties
          .filter(v => v.pokemon.name !== pokemonName)
          .map(async (variety) => {
            try {
              const resForm = await fetch(variety.pokemon.url);
              if (!resForm.ok) return null;
              const formData = await resForm.json();
              
              return {
                id: formData.id,
                name: formData.name,
                sprites: formData.sprites,
                types: formData.types
              };
            } catch (error) {
              console.error(`Error fetching form data for ${variety.pokemon.name}:`, error);
              return null;
            }
          });
          
        const forms = await Promise.all(formPromises);
        alternativeForms = forms.filter(Boolean);
      }
    } catch (error) {
      console.error('Error processing form data:', error);
    }
    
    // Return with a short revalidation time for dynamic content
    return {
      props: JSON.parse(JSON.stringify({
        pokemon,
        species,
        evolutionChain,
        alternativeForms
      })),
      revalidate: 60 // Revalidate more frequently to ensure fresh data
    };
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return { 
      notFound: true,
      revalidate: 30 // Try again after 30 seconds in case of temporary API issues
    };
  }
}