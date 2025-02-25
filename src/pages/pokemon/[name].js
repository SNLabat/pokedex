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
      <Link href={`/pokemon/${speciesData.name}`}>
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

// Main component
export default function PokemonDetail({ pokemon, species, evolutionChain, alternativeForms }) {
  const router = useRouter();
  const [isShiny, setIsShiny] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [caughtStatus, setCaughtStatus] = useState({});
  const [isEvolutionExpanded, setIsEvolutionExpanded] = useState(false);
  
  // Add this loading state handling
  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Loading Pokémon data...</h1>
          <p>Please wait while we fetch the details</p>
        </div>
      </div>
    );
  }
  
  // Update recently viewed in localStorage
  useEffect(() => {
    if (pokemon && typeof window !== 'undefined') {
      try {
        // Get existing recently viewed
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        
        // Remove this Pokémon from the list if it exists
        const filteredRecent = recentlyViewed.filter(p => p.id !== pokemon.id);
        
        // Add this Pokémon to the start of the list
        const updatedRecent = [
          { id: pokemon.id, name: pokemon.name },
          ...filteredRecent
        ].slice(0, 10); // Keep only the 10 most recent
        
        localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
      } catch (error) {
        console.error('Error updating recently viewed:', error);
      }
    }
  }, [pokemon]);
  
  // Get caught status from localStorage
  useEffect(() => {
    if (pokemon && typeof window !== 'undefined') {
      try {
        const caughtData = JSON.parse(localStorage.getItem('caughtPokemon') || '{}');
        setCaughtStatus(caughtData[pokemon.id] || {});
      } catch (error) {
        console.error('Error getting caught status:', error);
      }
    }
  }, [pokemon]);
  
  // Update caught status
  const updateCaughtStatus = (statusType, formName = 'default') => {
    if (!pokemon) return;
    
    try {
      // Get current caught data
      const caughtData = JSON.parse(localStorage.getItem('caughtPokemon') || '{}');
      
      // Initialize if needed
      if (!caughtData[pokemon.id]) {
        caughtData[pokemon.id] = {};
      }
      
      if (!caughtData[pokemon.id][formName]) {
        caughtData[pokemon.id][formName] = {};
      }
      
      // Toggle the status
      caughtData[pokemon.id][formName][statusType] = !caughtData[pokemon.id][formName][statusType];
      
      // Update state and localStorage
      setCaughtStatus(caughtData[pokemon.id]);
      localStorage.setItem('caughtPokemon', JSON.stringify(caughtData));
      localStorage.setItem('lastUpdated', new Date().toISOString());
    } catch (error) {
      console.error('Error updating caught status:', error);
    }
  };
  
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
    <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
      <Head>
        <title>{properCase(name)} (#{id.toString().padStart(3, '0')}) | Pokédex Live</title>
        <meta name="description" content={`View detailed information about ${properCase(name)}, a ${primaryType}-type Pokémon.${pokedexEntry ? ` ${pokedexEntry.slice(0, 100)}...` : ''}`} />
        <meta property="og:image" content={displaySprite} />
      </Head>

      <Navigation />

      {/* Hero section with background */}
      <div className={`${theme.light} py-4 md:py-8`}>
        <div className="container mx-auto px-4">
          {/* Navigation links */}
          <div className="flex justify-between items-center mb-4">
            <Link href="/pokedex">
              <a className="text-white hover:text-gray-300 flex items-center">
                <span className="mr-2">←</span> Back to Pokédex
              </a>
            </Link>
            
            <div className="flex space-x-4">
              {prevId && (
                <Link href={`/pokemon/${prevId}`}>
                  <a className="text-white hover:text-gray-300 flex items-center">
                    <span className="mr-1">←</span> #{prevId}
                  </a>
                </Link>
              )}
              
              {nextId && (
                <Link href={`/pokemon/${nextId}`}>
                  <a className="text-white hover:text-gray-300 flex items-center">
                    #{nextId} <span className="ml-1">→</span>
                  </a>
                </Link>
              )}
            </div>
          </div>
          
          {/* Pokémon header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Pokémon image */}
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="relative w-56 h-56 mb-4">
                {displaySprite && (
                  <Image
                    src={displaySprite}
                    alt={name}
                    layout="fill"
                    objectFit="contain"
                    priority
                    className="drop-shadow-lg"
                  />
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsShiny(!isShiny)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isShiny 
                      ? 'bg-yellow-500 text-black' 
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {isShiny ? 'View Normal' : 'View Shiny'}
                </button>
                
                <button
                  onClick={() => updateCaughtStatus('caught', 'default')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                    caughtStatus?.default?.caught
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-1">
                    {caughtStatus?.default?.caught ? '✓' : ''}
                  </span>
                  {caughtStatus?.default?.caught ? 'Caught' : 'Mark as Caught'}
                </button>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => updateCaughtStatus('shiny', 'default')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                    caughtStatus?.default?.shiny
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-1">
                    {caughtStatus?.default?.shiny ? '✓' : ''}
                  </span>
                  {caughtStatus?.default?.shiny ? 'Shiny Caught' : 'Mark as Shiny'}
                </button>
              </div>
            </div>

            {/* Pokémon info */}
            <div className="md:w-2/3">
              <div className="flex flex-wrap justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-lg">#{String(id).padStart(3, '0')}</p>
                  <h1 className="text-4xl font-bold capitalize mb-1">{name}</h1>
                  {category && (
                    <p className="text-lg italic opacity-80">{category}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                  {pokemon.types?.map(typeData => (
                    <span
                      key={typeData.type.name}
                      className={`${typeColors[typeData.type.name]?.accent || 'bg-gray-600'} 
                        px-4 py-2 rounded-lg text-white capitalize text-lg`}
                    >
                      {typeData.type.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Height</p>
                  <p className="text-lg">{heightMeters} m ({heightFeet}&apos;{heightInches}&quot;)</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Weight</p>
                  <p className="text-lg">{weightKg} kg ({weightLbs} lbs)</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Abilities</p>
                  <div className="flex flex-wrap gap-2">
                    {pokemon.abilities?.map(abilityData => (
                      <span
                        key={abilityData.ability.name}
                        className="bg-gray-700 px-3 py-1 rounded text-sm capitalize"
                      >
                        {abilityData.ability.name.replace('-', ' ')}
                        {abilityData.is_hidden && (
                          <span className="ml-1 text-yellow-500" title="Hidden Ability">*</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Base Experience</p>
                  <p className="text-lg">{pokemon.base_experience || '?'} XP</p>
                </div>
              </div>

              {pokedexEntry && (
                <div className="bg-black bg-opacity-20 rounded-lg p-4 mb-4">
                  <p className="text-gray-400 text-sm mb-1">Pokédex Entry</p>
                  <p className="italic">{pokedexEntry}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="bg-black bg-opacity-30 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto space-x-1 py-2">
            <button 
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === 'info' 
                  ? `${theme.accent} text-white` 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Stats & Info
            </button>
            <button 
              onClick={() => setActiveTab('evolution')}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === 'evolution' 
                  ? `${theme.accent} text-white` 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Evolution Chain
            </button>
            <button 
              onClick={() => setActiveTab('moves')}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === 'moves' 
                  ? `${theme.accent} text-white` 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Moves
            </button>
            <button 
              onClick={() => setActiveTab('locations')}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === 'locations' 
                  ? `${theme.accent} text-white` 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Locations
            </button>
            <button 
              onClick={() => setActiveTab('forms')}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === 'forms' 
                  ? `${theme.accent} text-white` 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Forms
            </button>
            <button 
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTab === 'tracking' 
                  ? `${theme.accent} text-white` 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Tracking
            </button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats & Info Tab */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Base Stats */}
            <div className="bg-gray-800 rounded-lg p-6 col-span-1 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Base Stats</h2>
              <div className="space-y-4">
                {pokemon.stats?.map(stat => (
                  <div key={stat.stat.name}>
                    <div className="flex justify-between mb-1">
                      <span className="capitalize">{formatStatName(stat.stat.name)}</span>
                      <span>{stat.base_stat}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-2 ${theme.accent} rounded-full`}
                        style={{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">{totalStats}</span>
                  </div>
                </div>
              </div>
              
              {/* Additional Pokédex entries */}
              {additionalEntries.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Additional Pokédex Entries</h3>
                  <div className="space-y-3">
                    {additionalEntries.map((entry, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-3 italic">
                        &quot;{entry}&quot;
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Type effectiveness */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Type Effectiveness</h2>
              
              {/* Implement a type effectiveness calculator here */}
              <div className="space-y-4">
                {pokemon.types?.length > 0 && (
                  <>
                    <div>
                      <h3 className="text-md font-medium mb-2">Weak To (Takes 2x Damage)</h3>
                      <div className="flex flex-wrap gap-1">
                        {/* This would be populated by a type calculator */}
                        {getWeaknesses(pokemon.types.map(t => t.type.name)).map(type => (
                          <span
                            key={type}
                            className={`${typeColors[type]?.accent || 'bg-gray-600'} 
                              px-2 py-1 rounded capitalize text-white text-sm`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">Resistant To (Takes 0.5x Damage)</h3>
                      <div className="flex flex-wrap gap-1">
                        {/* This would be populated by a type calculator */}
                        {getResistances(pokemon.types.map(t => t.type.name)).map(type => (
                          <span
                            key={type}
                            className={`${typeColors[type]?.accent || 'bg-gray-600'} 
                              px-2 py-1 rounded capitalize text-white text-sm`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium mb-2">Immune To (Takes 0x Damage)</h3>
                      <div className="flex flex-wrap gap-1">
                        {/* This would be populated by a type calculator */}
                        {getImmunities(pokemon.types.map(t => t.type.name)).map(type => (
                          <span
                            key={type}
                            className={`${typeColors[type]?.accent || 'bg-gray-600'} 
                              px-2 py-1 rounded capitalize text-white text-sm`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {/* Breeding info */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Breeding Info</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-400 text-sm">Egg Groups</p>
                    <div className="mt-1">
                      {species.egg_groups?.map(group => (
                        <span 
                          key={group.name}
                          className="bg-gray-700 px-2 py-1 rounded text-sm capitalize mr-2"
                        >
                          {group.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Gender Ratio</p>
                    <p className="mt-1">
                      {species.gender_rate === -1 
                        ? 'Genderless' 
                        : `${(8 - species.gender_rate) * 12.5}% ♂ / ${species.gender_rate * 12.5}% ♀`}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Hatch Steps</p>
                    <p className="mt-1">
                      {species.hatch_counter ? species.hatch_counter * 257 : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Base Happiness</p>
                    <p className="mt-1">{species.base_happiness}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Evolution Chain Tab */}
        {activeTab === 'evolution' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Evolution Chain</h2>
            
            {evolutionChain && evolutionChain.chain ? (
              <div className="flex flex-col items-center">
                <EvolutionChainRenderer 
                  chain={evolutionChain.chain} 
                  currentPokemonId={pokemon.id}
                  isExpanded={isEvolutionExpanded}
                />
                
                {(evolutionChain.chain.evolves_to?.length > 0 && 
                 evolutionChain.chain.evolves_to[0]?.evolves_to?.length > 0) && (
                  <button
                    onClick={() => setIsEvolutionExpanded(!isEvolutionExpanded)}
                    className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                  >
                    {isEvolutionExpanded ? 'Collapse' : 'Show All Evolutions'}
                  </button>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-400">No evolution information available</p>
            )}
          </div>
        )}
        
        {/* Moves Tab */}
        {activeTab === 'moves' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Moves</h2>
            
            <div className="mb-4">
              <MovesTable 
                moves={pokemon.moves}
                learnMethod="level-up"
                title="Moves Learned by Leveling Up"
              />
            </div>
            
            <div className="mb-4">
              <MovesTable 
                moves={pokemon.moves}
                learnMethod="machine"
                title="Moves Learned by TM/HM"
              />
            </div>
            
            <div className="mb-4">
              <MovesTable 
                moves={pokemon.moves}
                learnMethod="egg"
                title="Egg Moves"
              />
            </div>
          </div>
        )}
        
        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <LocationEncounterData pokemon={pokemon} theme={theme} />
        )}
        
        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Alternative Forms</h2>
            
            {alternativeForms && alternativeForms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {alternativeForms.map((form, index) => {
                  if (!form) return null;
                  
                  const formSprite = form.sprites?.other?.['official-artwork']?.front_default || 
                                   form.sprites?.front_default;
                  
                  // Extract form name from full name
                  let formName = form.name;
                  const displayName = properCase(formName.replace(pokemon.name + '-', ''));
                  
                  return (
                    <div key={index} className="bg-gray-700 rounded-lg p-4 flex flex-col items-center">
                      <h3 className="text-lg font-medium mb-3">{displayName || 'Alternative Form'}</h3>
                      
                      <div className="relative w-32 h-32 mb-4">
                        {formSprite && (
                          <Image
                            src={formSprite}
                            alt={formName}
                            layout="fill"
                            objectFit="contain"
                          />
                        )}
                      </div>
                      
                      <div className="flex gap-2 mb-3">
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
                      
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => updateCaughtStatus('caught', formName)}
                          className={`px-3 py-1 text-xs rounded ${
                            caughtStatus[formName]?.caught
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        >
                          {caughtStatus[formName]?.caught ? 'Caught ✓' : 'Mark Caught'}
                        </button>
                        
                        <button
                          onClick={() => updateCaughtStatus('shiny', formName)}
                          className={`px-3 py-1 text-xs rounded ${
                            caughtStatus[formName]?.shiny
                              ? 'bg-yellow-500 text-black'
                              : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        >
                          {caughtStatus[formName]?.shiny ? 'Shiny ✓' : 'Mark Shiny'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-400">No alternative forms available for this Pokémon</p>
            )}
          </div>
        )}
        
        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <EnhancedTrackingPanel 
            pokemon={pokemon} 
            caughtStatus={caughtStatus}
            updateCaughtStatus={updateCaughtStatus}
            currentUser={currentUserPlaceholder}
          />
        )}
      </div>
    </div>
  );
}

export async function getStaticPaths() {
  try {
    // Fetch a larger set of initial Pokémon to pre-render
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151'); // At least first generation
    const data = await res.json();
    
    const paths = data.results.map(pokemon => ({
      params: { name: pokemon.name }
    }));
    
    return { 
      paths,
      fallback: true // Change from 'blocking' to true for better UX
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
    
    // Ensure data is serializable
    return {
      props: JSON.parse(JSON.stringify({
        pokemon,
        species,
        evolutionChain,
        alternativeForms,
        currentUser: currentUserPlaceholder
      })),
      revalidate: 86400 // Revalidate once per day
    };
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return { notFound: true };
  }
}