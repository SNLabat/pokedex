// pages/pokemon/[name].js
import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '../../components/Navigation';
import LocationEncounterData from '../../components/LocationEncounterData';
import EnhancedTrackingPanel from '../../components/EnhancedTrackingPanel';
import { currentUserPlaceholder } from '../../lib/dataManagement';

// Update typeColors object with explicit color values instead of Tailwind class names
const typeColors = {
  normal: { mainColor: '#A8A878', darkColor: '#6D6D4E', textColor: '#FFFFFF' },
  fire: { mainColor: '#F08030', darkColor: '#9C531F', textColor: '#FFFFFF' },
  water: { mainColor: '#6890F0', darkColor: '#445E9C', textColor: '#FFFFFF' },
  electric: { mainColor: '#F8D030', darkColor: '#A1871F', textColor: '#000000' },
  grass: { mainColor: '#78C850', darkColor: '#4E8234', textColor: '#FFFFFF' },
  ice: { mainColor: '#98D8D8', darkColor: '#638D8D', textColor: '#000000' },
  fighting: { mainColor: '#C03028', darkColor: '#7D1F1A', textColor: '#FFFFFF' },
  poison: { mainColor: '#A040A0', darkColor: '#682A68', textColor: '#FFFFFF' },
  ground: { mainColor: '#E0C068', darkColor: '#927D44', textColor: '#000000' },
  flying: { mainColor: '#A890F0', darkColor: '#6D5E9C', textColor: '#FFFFFF' },
  psychic: { mainColor: '#F85888', darkColor: '#A13959', textColor: '#FFFFFF' },
  bug: { mainColor: '#A8B820', darkColor: '#6D7815', textColor: '#FFFFFF' },
  rock: { mainColor: '#B8A038', darkColor: '#786824', textColor: '#FFFFFF' },
  ghost: { mainColor: '#705898', darkColor: '#493963', textColor: '#FFFFFF' },
  dragon: { mainColor: '#7038F8', darkColor: '#4924A1', textColor: '#FFFFFF' },
  dark: { mainColor: '#705848', darkColor: '#49392F', textColor: '#FFFFFF' },
  steel: { mainColor: '#B8B8D0', darkColor: '#787887', textColor: '#000000' },
  fairy: { mainColor: '#EE99AC', darkColor: '#9B6470', textColor: '#000000' }
};

// Default theme if no type is available
const defaultTheme = { mainColor: '#68A090', darkColor: '#426658', textColor: '#FFFFFF' };

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

// Update the EvolutionChainRenderer to include the missing renderEvolutionDetails function
const EvolutionChainRenderer = ({ chain, currentPokemonId }) => {
  if (!chain || !chain.species) return null;
  
  const renderPokemonInChain = (speciesData) => {
    if (!speciesData) return null;
    
    // Extract ID from URL
    const urlParts = speciesData.url.split('/');
    const id = urlParts[urlParts.length - 2];
    const isCurrentPokemon = id === currentPokemonId?.toString();
    
    return (
      <Link href={`/pokemon/${speciesData.name}`} passHref>
        <a className="flex flex-col items-center p-3 m-1 rounded-lg">
          <div className="relative w-24 h-24">
              <Image
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
              alt={speciesData.name}
                layout="fill"
                objectFit="contain"
              />
            </div>
          <span className={`mt-2 text-center capitalize ${
            isCurrentPokemon 
              ? 'font-bold text-red-400 border-b-2 border-red-400' 
              : 'hover:border-b-2 hover:border-gray-300 transition-all'
          }`}>
            {speciesData.name.replace(/-/g, ' ')}
            </span>
          </a>
        </Link>
    );
  };
  
  // Add the missing renderEvolutionDetails function
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
      <div className="flex flex-col items-center justify-center mx-4">
        <div className="flex items-center">
          <div className="h-0.5 w-8 bg-gray-600"></div>
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <div className="h-0.5 w-8 bg-gray-600"></div>
          </div>
        <span className="text-xs text-center text-gray-400 mt-1">{evolutionMethod}</span>
      </div>
    );
  };

  // Render evolution chain horizontally
  const renderEvolutionStage = (evolutionData, depth = 0) => {
    if (!evolutionData || !evolutionData.species) return null;

    // Simple case: single evolution line
    if (!evolutionData.evolves_to || evolutionData.evolves_to.length <= 1) {
      return (
        <div className="flex flex-wrap justify-center items-center overflow-visible p-2">
          {renderPokemonInChain(evolutionData.species)}
          
          {evolutionData.evolves_to && evolutionData.evolves_to.length > 0 && (
            <>
              {renderEvolutionDetails(evolutionData.evolves_to[0].evolution_details)}
              {renderPokemonInChain(evolutionData.evolves_to[0].species)}
              
              {evolutionData.evolves_to[0].evolves_to && evolutionData.evolves_to[0].evolves_to.length > 0 && (
                <>
                  {renderEvolutionDetails(evolutionData.evolves_to[0].evolves_to[0].evolution_details)}
                  {renderPokemonInChain(evolutionData.evolves_to[0].evolves_to[0].species)}
                </>
              )}
            </>
          )}
        </div>
      );
    }
    
    // Complex case: branched evolution
      return (
      <div className="flex flex-col items-center overflow-visible">
        <div className="mb-4 p-2">
          {renderPokemonInChain(evolutionData.species)}
          </div>
        
        {/* Branch point indicator */}
        <div className="h-8 w-0.5 bg-gray-600 mb-2"></div>
        
        {/* Horizontal branches */}
        <div className="flex flex-wrap justify-center gap-8 overflow-visible p-2">
          {evolutionData.evolves_to.map((evo, index) => (
            <div key={index} className="flex flex-col items-center overflow-visible">
              <div className="mb-2 px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-400">
                {evo.evolution_details[0]?.trigger?.name === 'level-up' 
                  ? `Level ${evo.evolution_details[0]?.min_level || '?'}`
                  : evo.evolution_details[0]?.trigger?.name || 'Special'}
              </div>
              
              <div className="flex items-center overflow-visible">
                {renderPokemonInChain(evo.species)}
                
                {evo.evolves_to && evo.evolves_to.length > 0 && (
                  <>
                    {renderEvolutionDetails(evo.evolves_to[0].evolution_details)}
                    {renderPokemonInChain(evo.evolves_to[0].species)}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        </div>
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

// Hero section with circular Pokémon image and type-based theming
const PokemonHero = ({ pokemon, isShiny, setIsShiny, isAnimated, setIsAnimated, speciesText }) => {
  // Determine the theme based on Pokémon's types
  const mainType = pokemon.types[0]?.type.name || 'normal';
  const mainTypeColor = typeColors[mainType] || defaultTheme;
  
  // Create background style
  let heroBgStyle;
  
  if (mainType && pokemon.types[1]?.type.name) {
    // Gradient for dual types
    const secondType = pokemon.types[1]?.type.name;
    const secondTypeColor = typeColors[secondType] || defaultTheme;
    heroBgStyle = {
      background: `linear-gradient(to right, ${mainTypeColor.darkColor}, ${secondTypeColor.darkColor})`
    };
  } else {
    // Solid color for single type
    heroBgStyle = {
      backgroundColor: mainTypeColor.darkColor
    };
  }

  // Get sprite based on shiny status (simplified to just use official artwork)
  const getSprite = () => {
    if (isShiny) {
      return pokemon.sprites.other['official-artwork'].front_shiny || 
             pokemon.sprites.front_shiny;
    } else {
      return pokemon.sprites.other['official-artwork'].front_default || 
             pokemon.sprites.front_default;
    }
  };

  return (
    <div style={heroBgStyle} className="py-10 mb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Pokemon Image in Circle */}
          <div className="relative mb-6 md:mb-0 md:mr-10">
            <div className="w-64 h-64 rounded-full overflow-hidden relative flex items-center justify-center bg-gray-900">
              {/* Type-based outer ring based on number of types */}
              <div className="absolute inset-0 rounded-full overflow-hidden border-8 border-gray-900">
                {pokemon.types.length === 1 ? (
                  // Single type - full circle
                  <div className="absolute inset-0" style={{ backgroundColor: mainTypeColor.mainColor }}></div>
                ) : pokemon.types.length === 2 ? (
                  // Two types - half and half
                  <>
                    <div className="absolute top-0 left-0 w-1/2 h-full" style={{ backgroundColor: mainTypeColor.mainColor }}></div>
                    <div className="absolute top-0 right-0 w-1/2 h-full" style={{ backgroundColor: typeColors[pokemon.types[1]?.type.name]?.mainColor || defaultTheme.mainColor }}></div>
                  </>
                ) : null}
              </div>
              
              {/* Pokemon sprite */}
              <div className="relative z-10 w-56 h-56 bg-gray-900 rounded-full flex items-center justify-center">
                <Image
                  src={getSprite()}
                  alt={pokemon.name}
                  width={200}
                  height={200}
                  priority
                />
              </div>
            </div>
          
            {/* Type Pills */}
            <div className="flex justify-center mt-4 space-x-2">
              {pokemon.types.map(typeData => {
                const typeStyle = typeColors[typeData.type.name] || defaultTheme;
                return (
                <span
                    key={typeData.type.name}
                    style={{ 
                      backgroundColor: typeStyle.mainColor,
                      color: typeStyle.textColor
                    }}
                    className="px-4 py-2 rounded-full text-sm capitalize font-medium"
                  >
                    {typeData.type.name}
                </span>
                );
              })}
            </div>
            
            {/* Simplified Sprite Toggle Pills - Normal and Shiny */}
            <div className="flex justify-center mt-4">
              <div className="inline-flex rounded-full p-1 bg-gray-700 shadow-lg">
                <button
                  onClick={() => setIsShiny(false)}
                  className={`px-5 py-2 rounded-full transition-all ${
                    !isShiny 
                      ? 'bg-blue-500 text-white font-medium shadow-md' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setIsShiny(true)}
                  className={`px-5 py-2 rounded-full transition-all ${
                    isShiny 
                      ? 'bg-yellow-500 text-gray-900 font-medium shadow-md' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  ✨ Shiny
                </button>
              </div>
            </div>
          </div>
            
          {/* Rest of the hero content */}
          <div className="flex-1">
            <div className="flex flex-col">
              <div className="mb-4">
                <p className="text-gray-300 text-xl mb-1">#{String(pokemon.id).padStart(3, '0')}</p>
                <h1 className="text-4xl md:text-5xl font-bold capitalize mb-2 text-white">{pokemon.name.replace(/-/g, ' ')}</h1>
                <p className="text-xl text-gray-300 italic">{speciesText}</p>
              </div>
              
              {/* Basic Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">Height</p>
                  <p className="font-medium text-white">{(pokemon.height / 10).toFixed(1)}m</p>
              </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">Weight</p>
                  <p className="font-medium text-white">{(pokemon.weight / 10).toFixed(1)}kg</p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">Base XP</p>
                  <p className="font-medium text-white">{pokemon.base_experience || 'N/A'}</p>
              </div>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">Abilities</p>
                  <p className="font-medium capitalize text-white">
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

// Full Ribbon Collection based on your list
const pokemonRibbons = [
  // Champion Ribbons
  { id: 'champion-hoenn', name: 'Champion Ribbon', category: 'champion', description: 'Ribbon for clearing the Pokémon League and entering the Hall of Fame in another region', obtainMethod: 'Ruby/Sapphire/Emerald: EverGrande City, FireRed/LeafGreen: Indigo Plateau' },
  { id: 'sinnoh-champ', name: 'Sinnoh Champ Ribbon', category: 'champion', description: 'Ribbon awarded for beating the Sinnoh Champion and entering the Hall of Fame', obtainMethod: 'Diamond/Pearl/Platinum: Pokémon League' },
  { id: 'kalos-champion', name: 'Kalos Champion Ribbon', category: 'champion', description: 'Ribbon for beating the Kalos Champion and entering the Kalos Hall of Fame', obtainMethod: 'Defeat the Kalos Elite Four with this Pokémon' },
  { id: 'alola-champion', name: 'Alola Champion Ribbon', category: 'champion', description: 'A Ribbon awarded for becoming the Alola Champion and entering the Alola Hall of Fame', obtainMethod: 'Sun/Moon: Defeat the Alola Elite Four with this Pokémon' },
  { id: 'galar-champion', name: 'Galar Champion Ribbon', category: 'champion', description: 'A Ribbon awarded for becoming the Galar Champion and entering the Galar Hall of Fame', obtainMethod: 'Defeat the Champion Cup' },
  
  // Hoenn Contest Ribbons
  { id: 'cool-normal', name: 'Cool Ribbon', category: 'contest', description: 'Hoenn Cool Contest - Normal Rank Winner', obtainMethod: 'Ruby/Sapphire: Verdanturf Town, Emerald: Lilycove City' },
  { id: 'cool-super', name: 'Cool Ribbon Super', category: 'contest', description: 'Hoenn Cool Contest - Super Rank Winner', obtainMethod: 'Ruby/Sapphire: Fallabor Town, Emerald: Lilycove City' },
  { id: 'cool-hyper', name: 'Cool Ribbon Hyper', category: 'contest', description: 'Hoenn Cool Contest - Hyper Rank Winner', obtainMethod: 'Ruby/Sapphire: Slateport City, Emerald: Lilycove City' },
  { id: 'cool-master', name: 'Cool Ribbon Master', category: 'contest', description: 'Hoenn Cool Contest - Master Rank Winner', obtainMethod: 'Ruby/Sapphire/Emerald: Lilycove City' },
  
  { id: 'beauty-normal', name: 'Beauty Ribbon', category: 'contest', description: 'Hoenn Beauty Contest - Normal Rank Winner', obtainMethod: 'Ruby/Sapphire: Verdanturf Town, Emerald: Lilycove City' },
  { id: 'beauty-super', name: 'Beauty Ribbon Super', category: 'contest', description: 'Hoenn Beauty Contest - Super Rank Winner', obtainMethod: 'Ruby/Sapphire: Fallabor Town, Emerald: Lilycove City' },
  { id: 'beauty-hyper', name: 'Beauty Ribbon Hyper', category: 'contest', description: 'Hoenn Beauty Contest - Hyper Rank Winner', obtainMethod: 'Ruby/Sapphire: Slateport City, Emerald: Lilycove City' },
  { id: 'beauty-master', name: 'Beauty Ribbon Master', category: 'contest', description: 'Hoenn Beauty Contest - Master Rank Winner', obtainMethod: 'Ruby/Sapphire/Emerald: Lilycove City' },
  
  { id: 'cute-normal', name: 'Cute Ribbon', category: 'contest', description: 'Hoenn Cute Contest - Normal Rank Winner', obtainMethod: 'Ruby/Sapphire: Verdanturf Town, Emerald: Lilycove City' },
  { id: 'cute-super', name: 'Cute Ribbon Super', category: 'contest', description: 'Hoenn Cute Contest - Super Rank Winner', obtainMethod: 'Ruby/Sapphire: Fallabor Town, Emerald: Lilycove City' },
  { id: 'cute-hyper', name: 'Cute Ribbon Hyper', category: 'contest', description: 'Hoenn Cute Contest - Hyper Rank Winner', obtainMethod: 'Ruby/Sapphire: Slateport City, Emerald: Lilycove City' },
  { id: 'cute-master', name: 'Cute Ribbon Master', category: 'contest', description: 'Hoenn Cute Contest - Master Rank Winner', obtainMethod: 'Ruby/Sapphire/Emerald: Lilycove City' },
  
  { id: 'smart-normal', name: 'Smart Ribbon', category: 'contest', description: 'Hoenn Smart Contest - Normal Rank Winner', obtainMethod: 'Ruby/Sapphire: Verdanturf Town, Emerald: Lilycove City' },
  { id: 'smart-super', name: 'Smart Ribbon Super', category: 'contest', description: 'Hoenn Smart Contest - Super Rank Winner', obtainMethod: 'Ruby/Sapphire: Fallabor Town, Emerald: Lilycove City' },
  { id: 'smart-hyper', name: 'Smart Ribbon Hyper', category: 'contest', description: 'Hoenn Smart Contest - Hyper Rank Winner', obtainMethod: 'Ruby/Sapphire: Slateport City, Emerald: Lilycove City' },
  { id: 'smart-master', name: 'Smart Ribbon Master', category: 'contest', description: 'Hoenn Smart Contest - Master Rank Winner', obtainMethod: 'Ruby/Sapphire/Emerald: Lilycove City' },
  
  { id: 'tough-normal', name: 'Tough Ribbon', category: 'contest', description: 'Hoenn Tough Contest - Normal Rank Winner', obtainMethod: 'Ruby/Sapphire: Verdanturf Town, Emerald: Lilycove City' },
  { id: 'tough-super', name: 'Tough Ribbon Super', category: 'contest', description: 'Hoenn Tough Contest - Super Rank Winner', obtainMethod: 'Ruby/Sapphire: Fallabor Town, Emerald: Lilycove City' },
  { id: 'tough-hyper', name: 'Tough Ribbon Hyper', category: 'contest', description: 'Hoenn Tough Contest - Hyper Rank Winner', obtainMethod: 'Ruby/Sapphire: Slateport City, Emerald: Lilycove City' },
  { id: 'tough-master', name: 'Tough Ribbon Master', category: 'contest', description: 'Hoenn Tough Contest - Master Rank Winner', obtainMethod: 'Ruby/Sapphire/Emerald: Lilycove City' },
  
  // Sinnoh Contest Ribbons
  { id: 'cool-contest-normal-s', name: 'Cool Ribbon', category: 'contest', description: 'Super Contest Cool Category Normal Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'cool-contest-super-s', name: 'Cool Ribbon Super', category: 'contest', description: 'Super Contest Cool Category Super Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'cool-contest-ultra-s', name: 'Cool Ribbon Ultra', category: 'contest', description: 'Super Contest Cool Category Ultra Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'cool-contest-master-s', name: 'Cool Ribbon Master', category: 'contest', description: 'Super Contest Cool Category Master Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  
  { id: 'beauty-contest-normal-s', name: 'Beauty Ribbon', category: 'contest', description: 'Super Contest Beauty Category Normal Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'beauty-contest-super-s', name: 'Beauty Ribbon Super', category: 'contest', description: 'Super Contest Beauty Category Super Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'beauty-contest-ultra-s', name: 'Beauty Ribbon Ultra', category: 'contest', description: 'Super Contest Beauty Category Ultra Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'beauty-contest-master-s', name: 'Beauty Ribbon Master', category: 'contest', description: 'Super Contest Beauty Category Master Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  
  { id: 'cute-contest-normal-s', name: 'Cute Ribbon', category: 'contest', description: 'Super Contest Cute Category Normal Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'cute-contest-super-s', name: 'Cute Ribbon Super', category: 'contest', description: 'Super Contest Cute Category Super Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'cute-contest-ultra-s', name: 'Cute Ribbon Ultra', category: 'contest', description: 'Super Contest Cute Category Ultra Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'cute-contest-master-s', name: 'Cute Ribbon Master', category: 'contest', description: 'Super Contest Cute Category Master Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  
  { id: 'smart-contest-normal-s', name: 'Smart Ribbon', category: 'contest', description: 'Super Contest Smart Category Normal Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'smart-contest-super-s', name: 'Smart Ribbon Super', category: 'contest', description: 'Super Contest Smart Category Super Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'smart-contest-ultra-s', name: 'Smart Ribbon Ultra', category: 'contest', description: 'Super Contest Smart Category Ultra Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'smart-contest-master-s', name: 'Smart Ribbon Master', category: 'contest', description: 'Super Contest Smart Category Master Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  
  { id: 'tough-contest-normal-s', name: 'Tough Ribbon', category: 'contest', description: 'Super Contest Tough Category Normal Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'tough-contest-super-s', name: 'Tough Ribbon Super', category: 'contest', description: 'Super Contest Tough Category Super Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'tough-contest-ultra-s', name: 'Tough Ribbon Ultra', category: 'contest', description: 'Super Contest Tough Category Ultra Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  { id: 'tough-contest-master-s', name: 'Tough Ribbon Master', category: 'contest', description: 'Super Contest Tough Category Master Rank winner!', obtainMethod: 'Diamond/Pearl/Platinum: Hearthome City' },
  
  // Master Ribbons from BDSP
  { id: 'beauty-master-2', name: 'Beauty Master Ribbon', category: 'contest', description: 'A Ribbon awarded to a Pokémon that has perfectly embodied Beauty in Pokémon Contests', obtainMethod: 'Win the Beauty Master Rank Contest' },
  { id: 'cleverness-master', name: 'Cleverness Master Ribbon', category: 'contest', description: 'A Ribbon awarded to a Pokémon that has perfectly embodied Cleverness in Pokémon Contests', obtainMethod: 'Win the Cleverness Master Rank Contest' },
  { id: 'coolness-master', name: 'Coolness Master Ribbon', category: 'contest', description: 'A Ribbon awarded to a Pokémon that has perfectly embodied Coolness in Pokémon Contests', obtainMethod: 'Win the Coolness Master Rank Contest' },
  { id: 'cuteness-master', name: 'Cuteness Master Ribbon', category: 'contest', description: 'A Ribbon awarded to a Pokémon that has perfectly embodied Cuteness in Pokémon Contests', obtainMethod: 'Win the Cuteness Master Rank Contest' },
  { id: 'toughness-master', name: 'Toughness Master Ribbon', category: 'contest', description: 'A Ribbon awarded to a Pokémon that has perfectly embodied Toughness in Pokémon Contests', obtainMethod: 'Win the Toughness Master Rank Contest' },
  { id: 'contest-star', name: 'Contest Star Ribbon', category: 'contest', description: 'A Ribbon awarded to a Pokémon that has performed superbly in the Master Rank at a Super Contest Show', obtainMethod: 'Hearthome City - Get Master Rank in all 5 Ranks' },
  { id: 'twinkling-star', name: 'Twinkling Star Ribbon', category: 'contest', description: 'A Ribbon awarded to a Pokémon that has perfectly embodied shining brilliance in Super Contest Shows', obtainMethod: 'Hearthome City - Be Star of the Show in all Ranks of Super Contest' },
  
  // Battle Ribbons - Hoenn
  { id: 'winning', name: 'Winning Ribbon', category: 'battle', description: 'Ribbon awarded for clearing the Hoenn Battle Tower\'s Lv. 50 challenge', obtainMethod: 'Ruby/Sapphire: Battle Tower, Emerald: Battle Frontier' },
  { id: 'victory', name: 'Victory Ribbon', category: 'battle', description: 'Ribbon awarded for clearing the Hoenn Battle Tower\'s Lv. 100 challenge', obtainMethod: 'Ruby/Sapphire: Battle Tower, Emerald: Battle Frontier' },
  
  // Battle Ribbons - Sinnoh
  { id: 'ability', name: 'Ability Ribbon', category: 'battle', description: 'A Ribbon awarded for defeating the Tower Tycoon at the Battle Tower', obtainMethod: 'Diamond/Pearl: Battle Tower, Platinum/HeartGold/SoulSilver: Battle Frontier' },
  { id: 'great-ability', name: 'Great Ability Ribbon', category: 'battle', description: 'A Ribbon awarded for defeating the Tower Tycoon at the Battle Tower', obtainMethod: 'Diamond/Pearl: Battle Tower, Platinum/HeartGold/SoulSilver: Battle Frontier' },
  { id: 'double-ability', name: 'Double Ability Ribbon', category: 'battle', description: 'A Ribbon awarded for completing the Battle Tower Double challenge', obtainMethod: 'Diamond/Pearl: Battle Tower, Platinum/HeartGold/SoulSilver: Battle Frontier' },
  { id: 'multi-ability', name: 'Multi Ability Ribbon', category: 'battle', description: 'A Ribbon awarded for completing the Battle Tower Multi challenge', obtainMethod: 'Diamond/Pearl: Battle Tower, Platinum/HeartGold/SoulSilver: Battle Frontier' },
  { id: 'pair-ability', name: 'Pair Ability Ribbon', category: 'battle', description: 'A Ribbon awarded for completing the Battle Tower Link Multi challenge', obtainMethod: 'Diamond/Pearl: Battle Tower, Platinum/HeartGold/SoulSilver: Battle Frontier' },
  { id: 'world-ability', name: 'World Ability Ribbon', category: 'battle', description: 'A Ribbon awarded for completing the Wi-Fi Battle Tower challenge', obtainMethod: 'Diamond/Pearl: Battle Tower, Platinum/HeartGold/SoulSilver: Battle Frontier' },
  
  // Battle Ribbons - Kalos
  { id: 'skillful-battler', name: 'Skillful Battler Ribbon', category: 'battle', description: 'Ribbon that can be given to a Pokémon that has achieved victory in difficult battles', obtainMethod: 'Defeat one of the heads of the Battle Maison with the Pokémon' },
  { id: 'expert-battler', name: 'Expert Battler Ribbon', category: 'battle', description: 'Ribbon that can be given to a Pokémon that has achieved victory in difficult battles', obtainMethod: 'Defeat one of the heads of the Battle Maison with the Pokémon in the Super battles' },
  
  // Battle Ribbons - Alola
  { id: 'battle-royal-master', name: 'Battle Royal Master Ribbon', category: 'battle', description: 'A Ribbon that can be given to a Pokémon that has achieved victory in the Battle Royal', obtainMethod: 'Sun/Moon: Defeat Battle Royal Master Rank battle at Royal Avenue' },
  { id: 'battle-tree-great', name: 'Battle Tree Great Ribbon', category: 'battle', description: 'A Ribbon awarded for winning against a Battle Legend in the Battle Tree', obtainMethod: 'Sun/Moon: Battle Tree' },
  { id: 'battle-tree-master', name: 'Battle Tree Master Ribbon', category: 'battle', description: 'A Ribbon awarded for winning against a Battle Legend in super battles in the Battle Tree', obtainMethod: 'Sun/Moon: Battle Tree' },
  
  // Battle Ribbons - Galar
  { id: 'tower-master', name: 'Tower Master Ribbon', category: 'battle', description: 'A Ribbon awarded for winning against a champion in the Battle Tower', obtainMethod: 'Defeat Leon in one of the higher tiers of the Battle Tower' },
  { id: 'master-rank', name: 'Master Rank Ribbon', category: 'battle', description: 'A Ribbon awarded for winning against a Trainer in the Master Ball Tier of Ranked Battles', obtainMethod: 'Defeat a Master Ball tier trainer in Ranked Battle' },
  
  // Memory Ribbons
  { id: 'contest-memory', name: 'Contest Memory Ribbon', category: 'memory', description: 'A commemorative Ribbon representing all the Ribbons you collected in far-off lands for contests', obtainMethod: 'Transfer a Pokémon who had ribbons from Contests in Ruby, Sapphire or Emerald, or Super Contests in Diamond, Pearl or Platinum' },
  { id: 'battle-memory', name: 'Battle Memory Ribbon', category: 'memory', description: 'A commemorative Ribbon representing all the Ribbons you collected in far-off lands for battling', obtainMethod: 'Transfer a Pokémon who had ribbons from Battle Tower in Diamond, Pearl, Platinum, HeartGold or SoulSilver' },
  { id: 'contest-memory-2', name: 'Contest Memory Ribbon (All)', category: 'memory', description: 'A commemorative Ribbon representing all the Ribbons you collected in far-off lands for contests', obtainMethod: 'Transfer a Pokémon who had all the ribbons from Contests in Ruby, Sapphire or Emerald, or Super Contests in Diamond, Pearl or Platinum' },
  { id: 'battle-memory-2', name: 'Battle Memory Ribbon (All)', category: 'memory', description: 'A commemorative Ribbon representing all the Ribbons you collected in far-off lands for battling', obtainMethod: 'Transfer a Pokémon who had all the ribbons from Battle Tower in Diamond, Pearl, Platinum, HeartGold or SoulSilver' },
  
  // Colosseum/XD Ribbons  
  { id: 'national', name: 'National Ribbon', category: 'special', description: 'A Ribbon awarded for overcoming all difficult challenges', obtainMethod: 'Colosseum: Relic Stone, XD: Purification Chamber - Purify the Pokémon' },
  { id: 'earth', name: 'Earth Ribbon', category: 'special', description: 'A Ribbon awarded for winning 100 matches in a row', obtainMethod: 'Colosseum/XD: Mt. Battle' },
  
  // Special Event Ribbons
  { id: 'country', name: 'Country Ribbon', category: 'event', description: 'Pokémon League - Champion Ribbon', obtainMethod: 'Given to the Pokemon on the team of the winners of Japanese Regionals in 2003 and 2004' },
  { id: 'world', name: 'World Ribbon', category: 'event', description: 'Pokémon League - Champion Ribbon', obtainMethod: 'Given to the Pokemon on the team of the winners of Japanese Nationals in 2003 and 2004' },
  { id: 'marine', name: 'Marine Ribbon', category: 'event', description: '2005 National Tournament Runner-up Ribbon', obtainMethod: 'Special Event Only' },
  { id: 'land', name: 'Land Ribbon', category: 'event', description: '2003 National Tournament Semifinalist Ribbon', obtainMethod: 'Special Event Only' },
  { id: 'sky', name: 'Sky Ribbon', category: 'event', description: 'A Commemorative Ribbon obtained in a Mystery Zone', obtainMethod: 'Special Event Only' },
  { id: 'classic', name: 'Classic Ribbon', category: 'event', description: 'A Ribbon that proclaims love for Pokémon', obtainMethod: 'Placed on Event Download Pokémon - Prevents trade on Global Trade Station' },
  { id: 'premier', name: 'Premier Ribbon', category: 'event', description: 'A Ribbon awarded for a special holiday', obtainMethod: 'Special Event' },
  { id: 'birthday', name: 'Birthday Ribbon', category: 'event', description: 'A Ribbon that commemorates a birthday', obtainMethod: 'Special Event' },
  { id: 'special', name: 'Special Ribbon', category: 'event', description: 'A special Ribbon for a special day', obtainMethod: 'Special Event' },
  { id: 'event', name: 'Event Ribbon', category: 'event', description: 'A Ribbon awarded for participating in a special Pokémon event', obtainMethod: 'Special Event' },
  { id: 'souvenir', name: 'Souvenir Ribbon', category: 'event', description: 'A Ribbon for cherishing a special memory', obtainMethod: 'Special Event' },
  { id: 'battle-champ', name: 'Battle Champion Ribbon', category: 'event', description: 'A Ribbon awarded to a Battle Competition Champion', obtainMethod: 'Special Event' },
  { id: 'regional-champ', name: 'Regional Champion Ribbon', category: 'event', description: 'A Ribbon awarded to a Regional Champion in the Pokémon World Championships', obtainMethod: 'Special Event' },
  { id: 'national-champ', name: 'National Champion Ribbon', category: 'event', description: 'A Ribbon awarded to a National Champion in the Pokémon World Championships', obtainMethod: 'Special Event' },
  
  // Special Merit Ribbons
  { id: 'legend', name: 'Legend Ribbon', category: 'special', description: 'A Ribbon awarded for setting a legendary record', obtainMethod: 'HeartGold/SoulSilver: Defeat Red at Mt. Silver' },
  { id: 'artist', name: 'Artist Ribbon', category: 'special', description: 'Ribbon awarded for being chosen as a super sketch model in Hoenn', obtainMethod: 'Ruby/Sapphire/Emerald: Lilycove City - Defeat Master Rank with top score' },
  { id: 'effort', name: 'Effort Ribbon', category: 'special', description: 'Ribbon awarded for being an exceptionally hard worker', obtainMethod: 'Ruby/Sapphire/Emerald: Slateport City, Diamond/Pearl/Platinum: Sunyshore City, HeartGold/SoulSilver: Blackthorn City, Sun/Moon: Royal Avenue - Max out Effort Values on the Pokémon' },
  { id: 'training', name: 'Training Ribbon', category: 'special', description: 'Ribbon that can be given to a Pokémon that has overcome rigorous trials and training', obtainMethod: 'Show a Pokémon who has gold medalled every Super Training event to man in Lumiose City café' },
  { id: 'best-friends', name: 'Best Friends Ribbon', category: 'special', description: 'Ribbon that can be given to a Pokémon with which you share a close and meaningful bond', obtainMethod: 'X/Y: Max affection with a Pokémon in Pokémon Amie and show Bonnie in Lumiose City Centrico Plaza, Sun/Moon: Max affection with a Pokémon in Pokémon Amie and show person in Malie City Community Center' },
  { id: 'footprint', name: 'Footprint Ribbon', category: 'special', description: 'A Ribbon awarded to a Pokémon deemed to have a top-quality footprint', obtainMethod: 'Diamond/Pearl/Platinum: Route 213, Sun/Moon: Hano Grand Resort - Show Mr. Footprint a Pokémon that has gained 30 Levels' },
  
  // Mood/Feeling Ribbons from Sinnoh
  { id: 'alert', name: 'Alert Ribbon', category: 'mood', description: 'A Ribbon for recalling an invigorating event that created life energy', obtainMethod: 'Diamond/Pearl/Platinum: Sunyshore City - Monday, HeartGold/SoulSilver: Route 40 - Monday' },
  { id: 'shock', name: 'Shock Ribbon', category: 'mood', description: 'A Ribbon for recalling a thrilling event that made life more exciting', obtainMethod: 'Diamond/Pearl/Platinum: Sunyshore City - Tuesday, HeartGold/SoulSilver: Route 29 - Tuesday' },
  { id: 'downcast', name: 'Downcast Ribbon', category: 'mood', description: 'A Ribbon for recalling feelings of sadness that added spice to life', obtainMethod: 'Diamond/Pearl/Platinum: Sunyshore City - Wednesday, HeartGold/SoulSilver: Lake of Rage - Wednesday' },
  { id: 'careless', name: 'Careless Ribbon', category: 'mood', description: 'A Ribbon for recalling a careless error that helped steer life decisions', obtainMethod: 'Diamond/Pearl/Platinum: Sunyshore City - Thursday, HeartGold/SoulSilver: Route 36 - Thursday' },
  { id: 'relax', name: 'Relax Ribbon', category: 'mood', description: 'A Ribbon for recalling a refreshing event that added sparkle to life', obtainMethod: 'Diamond/Pearl/Platinum: Sunyshore City - Friday, HeartGold/SoulSilver: Route 32 - Friday' },
  { id: 'snooze', name: 'Snooze Ribbon', category: 'mood', description: 'A Ribbon for recalling a deep slumber that made life soothing', obtainMethod: 'Diamond/Pearl/Platinum: Sunyshore City - Saturday, HeartGold/SoulSilver: Blackthorn City - Saturday' },
  { id: 'smile', name: 'Smile Ribbon', category: 'mood', description: 'A Ribbon for recalling that smiles enrich the quality of life', obtainMethod: 'Diamond/Pearl/Platinum: Sunyshore City - Sunday, HeartGold/SoulSilver: Route 37 - Sunday' },
  
  // Luxury Ribbons from Sinnoh
  { id: 'gorgeous', name: 'Gorgeous Ribbon', category: 'luxury', description: 'An extraordinary gorgeous and extravagant Ribbon', obtainMethod: 'Diamond/Pearl/Platinum: Resort Area - Buy for 10,000' },
  { id: 'royal', name: 'Royal Ribbon', category: 'luxury', description: 'An incredibly regal Ribbon with an air of nobility', obtainMethod: 'Diamond/Pearl/Platinum: Resort Area - Buy for 100,000' },
  { id: 'gorgeous-royal', name: 'Gorgeous Royal Ribbon', category: 'luxury', description: 'A gorgeous and regal Ribbon that is the peak of fabulous', obtainMethod: 'Diamond/Pearl/Platinum: Resort Area - Buy for 999,999' },
  
  // Removed Ribbons (for completeness)
  { id: 'record', name: 'Record Ribbon', category: 'removed', description: 'A Ribbon awarded for setting an incredible record', obtainMethod: 'Removed from code after Gen 4' },
  { id: 'history', name: 'History Ribbon', category: 'removed', description: 'A Ribbon awarded for setting a historical record', obtainMethod: 'Removed from code after Gen 4' },
  { id: 'red', name: 'Red Ribbon', category: 'removed', description: 'A commemorative Ribbon obtained in a Mystery Zone', obtainMethod: 'Removed from code after Gen 4' },
  { id: 'green', name: 'Green Ribbon', category: 'removed', description: 'A commemorative Ribbon obtained in a Mystery Zone', obtainMethod: 'Removed from code after Gen 4' },
  { id: 'blue', name: 'Blue Ribbon', category: 'removed', description: 'A commemorative Ribbon obtained in a Mystery Zone', obtainMethod: 'Removed from code after Gen 4' },
  { id: 'festival', name: 'Festival Ribbon', category: 'removed', description: 'A commemorative Ribbon obtained in a Mystery Zone', obtainMethod: 'Removed from code after Gen 4' },
  { id: 'carnival', name: 'Carnival Ribbon', category: 'removed', description: 'A commemorative Ribbon obtained in a Mystery Zone', obtainMethod: 'Removed from code after Gen 4' }
];

// Full Marks Collection
const pokemonMarks = [
  // Time-based Marks
  { id: 'lunchtime', name: 'Lunchtime Mark', category: 'time', description: 'A mark for a peckish Pokémon', method: 'Found in the middle of the day' },
  { id: 'sleepy-time', name: 'Sleepy-Time Mark', category: 'time', description: 'A mark for a sleepy Pokémon', method: 'Found at night' },
  { id: 'dusk', name: 'Dusk Mark', category: 'time', description: 'A mark for a dozy Pokémon', method: 'Found in the evening' },
  { id: 'dawn', name: 'Dawn Mark', category: 'time', description: 'A mark for an early-riser Pokémon', method: 'Found in the morning' },
  
  // Weather Marks
  { id: 'cloudy', name: 'Cloudy Mark', category: 'weather', description: 'A mark for a cloud-watching Pokémon', method: 'Found while it\'s overcast' },
  { id: 'rainy', name: 'Rainy Mark', category: 'weather', description: 'A mark for a sodden Pokémon', method: 'Found while it\'s raining' },
  { id: 'stormy', name: 'Stormy Mark', category: 'weather', description: 'A mark for a thunderstruck Pokémon', method: 'Found while it\'s stormy' },
  { id: 'snowy', name: 'Snowy Mark', category: 'weather', description: 'A mark for a snow-frolicking Pokémon', method: 'Found while it\'s snowing' },
  { id: 'blizzard', name: 'Blizzard Mark', category: 'weather', description: 'A mark for a shivering Pokémon', method: 'Found while there\'s a snowstorm' },
  { id: 'dry', name: 'Dry Mark', category: 'weather', description: 'A mark for a parched Pokémon', method: 'Found when it\'s intense sunlight' },
  { id: 'sandstorm', name: 'Sandstorm Mark', category: 'weather', description: 'A mark for a sandswept Pokémon', method: 'Found in a sandstorm' },
  { id: 'misty', name: 'Misty Mark', category: 'weather', description: 'A mark for a mist-drifter Pokémon', method: 'Found in fog' },
  
  // Personality Marks
  { id: 'rare', name: 'Rare Mark', category: 'personality', description: 'A mark for a reclusive Pokémon', method: 'Very rare chance on any caught Pokémon' },
  { id: 'rowdy', name: 'Rowdy Mark', category: 'personality', description: 'A mark for a rowdy Pokémon', method: 'Small chance on any caught Pokémon' },
  { id: 'absent-minded', name: 'Absent-Minded Mark', category: 'personality', description: 'A mark for a spacey Pokémon', method: 'Small chance on any caught Pokémon' },
  { id: 'jittery', name: 'Jittery Mark', category: 'personality', description: 'A mark for an anxious Pokémon', method: 'Small chance on any caught Pokémon' },
  { id: 'excited', name: 'Excited Mark', category: 'personality', description: 'A mark for a giddy Pokémon', method: 'Small chance on any caught Pokémon' },
  { id: 'charismatic', name: 'Charismatic Mark', category: 'personality', description: 'A mark for a radiant Pokémon', method: 'Small chance on any caught Pokémon' },
  { id: 'calmness', name: 'Calmness Mark', category: 'personality', description: 'A mark for a serene Pokémon', method: 'Small chance on any caught Pokémon' },
  { id: 'intense', name: 'Intense Mark', category: 'personality', description: 'A mark for a feisty Pokémon', method: 'Small chance on any caught Pokémon' },
  { id: 'zoned-out', name: 'Zoned-Out Mark', category: 'personality', description: 'A mark for a daydreaming Pokémon', method: 'Small chance on any caught Pokémon' },
  { id: 'joyful', name: 'Joyful Mark', category: 'personality', description: 'A mark for a joyful Pokémon', method: 'Small chance on any caught Pokémon' },
  { id: 'angry', name: 'Angry Mark', category: 'personality', description: 'A mark for a furious Pokémon', method: 'Small chance on any caught Pokémon' },
  
  // Special Method Marks
  { id: 'fishing', name: 'Fishing Mark', category: 'special', description: 'A mark for a catch-of-the-day Pokémon', method: 'Found by fishing' },
  { id: 'curry', name: 'Curry Mark', category: 'special', description: 'A mark for a curry-connoisseur Pokémon', method: 'From a Pokémon that joins after cooking curry' },
  { id: 'uncommon', name: 'Uncommon Mark', category: 'special', description: 'A mark for a sociable Pokémon', method: 'Small chance on any caught Pokémon' },
  { id: 'destiny', name: 'Destiny Mark', category: 'special', description: 'A mark of a chosen Pokémon', method: 'Special circumstances' },
  
  // And many more based on your list...
];

// Update the ribbonIcons object to use local images
const ribbonIcons = {
// Gen 3 Contest Ribbons
'champion-hoenn': { 
  icon: '/img/Ribbons-Marks/championribbon.png', 
  color: '#22AA44',
  fallback: '🎀'
},
'cool-normal': { 
  icon: '/img/Ribbons-Marks/coolnormalribbon.png', 
  color: '#FF4444',
  fallback: '🎀'
},
'cool-super': { 
  icon: '/img/Ribbons-Marks/coolsuperribbon.png', 
  color: '#FF4444',
  fallback: '🎀'
},
'cool-hyper': { 
  icon: '/img/Ribbons-Marks/coolhyperribbon.png', 
  color: '#FF4444',
  fallback: '🎀'
},
'cool-master': { 
  icon: '/img/Ribbons-Marks/coolmasterribbon.png', 
  color: '#FF4444',
  fallback: '🎀'
},
'beauty-normal': { 
  icon: '/img/Ribbons-Marks/beautynormalribbon.png', 
  color: '#FF88DD',
  fallback: '🎀'
},
'beauty-super': { 
  icon: '/img/Ribbons-Marks/beautysuperribbon.png', 
  color: '#FF88DD',
  fallback: '🎀'
},
'beauty-hyper': { 
  icon: '/img/Ribbons-Marks/beautyhyperribbon.png', 
  color: '#FF88DD',
  fallback: '🎀'
},
'beauty-master': { 
  icon: '/img/Ribbons-Marks/beautymasterribbon.png', 
  color: '#FF88DD',
  fallback: '🎀'
},
'cute-normal': { 
  icon: '/img/Ribbons-Marks/cutenormalribbon.png', 
  color: '#FFAA44',
  fallback: '🎀'
},
'cute-super': { 
  icon: '/img/Ribbons-Marks/cutesuperribbon.png', 
  color: '#FFAA44',
  fallback: '🎀'
},
'cute-hyper': { 
  icon: '/img/Ribbons-Marks/cutehyperribbon.png', 
  color: '#FFAA44',
  fallback: '🎀'
},
'cute-master': { 
  icon: '/img/Ribbons-Marks/cutemasterribbon.png', 
  color: '#FFAA44',
  fallback: '🎀'
},
'smart-normal': { 
  icon: '/img/Ribbons-Marks/smartnormalribbon.png', 
  color: '#44BB44',
  fallback: '🎀'
},
'smart-super': { 
  icon: '/img/Ribbons-Marks/smartsuperribbon.png', 
  color: '#44BB44',
  fallback: '🎀'
},
'smart-hyper': { 
  icon: '/img/Ribbons-Marks/smarthyperribbon.png', 
  color: '#44BB44',
  fallback: '🎀'
},
'smart-master': { 
  icon: '/img/Ribbons-Marks/smartmasterribbon.png', 
  color: '#44BB44',
  fallback: '🎀'
},
'tough-normal': { 
  icon: '/img/Ribbons-Marks/toughnormalribbon.png', 
  color: '#BB6644',
  fallback: '🎀'
},
'tough-super': { 
  icon: '/img/Ribbons-Marks/toughsuperribbon.png', 
  color: '#BB6644',
  fallback: '🎀'
},
'tough-hyper': { 
  icon: '/img/Ribbons-Marks/toughhyperribbon.png', 
  color: '#BB6644',
  fallback: '🎀'
},
'tough-master': { 
  icon: '/img/Ribbons-Marks/toughmasterribbon.png', 
  color: '#BB6644',
  fallback: '🎀'
},
'winning': { 
  icon: '/img/Ribbons-Marks/winningribbon.png', 
  color: '#DDAA22',
  fallback: '🎀'
},
'victory': { 
  icon: '/img/Ribbons-Marks/victoryribbon.png', 
  color: '#DDAA22',
  fallback: '🎀'
},
'artist': { 
  icon: '/img/Ribbons-Marks/artistribbon.png', 
  color: '#FF88AA',
  fallback: '🎀'
},
'effort': { 
  icon: '/img/Ribbons-Marks/effortribbon.png', 
  color: '#DDAA22',
  fallback: '🎀'
},
'marine': { 
  icon: '/img/Ribbons-Marks/marineribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'land': { 
  icon: '/img/Ribbons-Marks/landribbon.png', 
  color: '#BB6644',
  fallback: '🎀'
},
'sky': { 
  icon: '/img/Ribbons-Marks/skyribbon.png', 
  color: '#88AAFF',
  fallback: '🎀'
},
'country': { 
  icon: '/img/Ribbons-Marks/countryribbon.png', 
  color: '#DDAA22',
  fallback: '🎀'
},
'national': { 
  icon: '/img/Ribbons-Marks/nationalribbon.png', 
  color: '#DD2222',
  fallback: '🎀'
},
'earth': { 
  icon: '/img/Ribbons-Marks/earthribbon.png', 
  color: '#44BB44',
  fallback: '🎀'
},
'world': { 
  icon: '/img/Ribbons-Marks/worldribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'sinnoh-champ': { 
  icon: '/img/Ribbons-Marks/sinnohchampribbon.png', 
  color: '#22AA44',
  fallback: '🎀'
},
'cool-contest-normal-s': { 
  icon: '/img/Ribbons-Marks/coolcontestnormalrankribbon-s.png', 
  color: '#FF4444',
  fallback: '🎀'
},
'cool-contest-super-s': { 
  icon: '/img/Ribbons-Marks/coolcontestsuperrankribbon-s.png', 
  color: '#FF4444',
  fallback: '🎀'
},
'cool-contest-ultra-s': { 
  icon: '/img/Ribbons-Marks/coolcontesthyperrankribbon-s.png',
  color: '#FF6666',
  fallback: '🔥'
},
'cool-contest-master-s': { 
  icon: '/img/Ribbons-Marks/coolcontestmasterrankribbon-s.png', 
  color: '#FF4444',
  fallback: '🎀'
},
'beauty-contest-normal-s': { 
  icon: '/img/Ribbons-Marks/beautycontestnormalrankribbon-s.png', 
  color: '#FF88DD',
  fallback: '🎀'
},
'beauty-contest-super-s': { 
  icon: '/img/Ribbons-Marks/beautycontestsuperrankribbon-s.png', 
  color: '#FF88DD',
  fallback: '🎀'
},
'beauty-contest-ultra-s': { 
  icon: '/img/Ribbons-Marks/beautycontesthyperrankribbon-s.png',
  color: '#6699FF',
  fallback: '💙'
},
'beauty-contest-master-s': { 
  icon: '/img/Ribbons-Marks/beautycontestmasterrankribbon-s.png', 
  color: '#FF88DD',
  fallback: '🎀'
},
'cute-contest-normal-s': { 
  icon: '/img/Ribbons-Marks/cutecontestnormalrankribbon-s.png', 
  color: '#FFAA44',
  fallback: '🎀'
},
'cute-contest-super-s': { 
  icon: '/img/Ribbons-Marks/cutecontestsuperrankribbon-s.png', 
  color: '#FFAA44',
  fallback: '🎀'
},
'cute-contest-ultra-s': { 
  icon: '/img/Ribbons-Marks/cutecontesthyperrankribbon-s.png',
  color: '#FF99CC',
  fallback: '💕'
},
'cute-contest-master-s': { 
  icon: '/img/Ribbons-Marks/cutecontestmasterrankribbon-s.png', 
  color: '#FFAA44',
  fallback: '🎀'
},
'smart-contest-normal-s': { 
  icon: '/img/Ribbons-Marks/smartcontestnormalrankribbon-s.png', 
  color: '#44BB44',
  fallback: '🎀'
},
'smart-contest-super-s': { 
  icon: '/img/Ribbons-Marks/smartcontestsuperrankribbon-s.png', 
  color: '#44BB44',
  fallback: '🎀'
},
'smart-contest-ultra-s': { 
  icon: '/img/Ribbons-Marks/smartcontesthyperrankribbon-s.png',
  color: '#99CC33',
  fallback: '🧠'
},
'smart-contest-master-s': { 
  icon: '/img/Ribbons-Marks/smartcontestmasterrankribbon-s.png', 
  color: '#44BB44',
  fallback: '🎀'
},
'tough-contest-normal-s': { 
  icon: '/img/Ribbons-Marks/toughcontestnormalrankribbon-s.png', 
  color: '#BB6644',
  fallback: '🎀'
},
'tough-contest-super-s': { 
  icon: '/img/Ribbons-Marks/toughcontestsuperrankribbon-s.png', 
  color: '#BB6644',
  fallback: '🎀'
},
'tough-contest-ultra-s': { 
  icon: '/img/Ribbons-Marks/toughcontesthyperrankribbon-s.png',
  color: '#FF9900',
  fallback: '💪'
},
'tough-contest-master-s': { 
  icon: '/img/Ribbons-Marks/toughcontestmasterrankribbon-s.png', 
  color: '#BB6644',
  fallback: '🎀'
},
'ability': { 
  icon: '/img/Ribbons-Marks/abilityribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'great-ability': { 
  icon: '/img/Ribbons-Marks/greatabilityribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'double-ability': { 
  icon: '/img/Ribbons-Marks/doubleabilityribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'multi-ability': { 
  icon: '/img/Ribbons-Marks/multiabilityribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'pair-ability': { 
  icon: '/img/Ribbons-Marks/pairabilityribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'world-ability': { 
  icon: '/img/Ribbons-Marks/worldabilityribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'alert': { 
  icon: '/img/Ribbons-Marks/alertribbon.png', 
  color: '#FFAA44',
  fallback: '🎀'
},
'shock': { 
  icon: '/img/Ribbons-Marks/shockribbon.png', 
  color: '#FFCC44',
  fallback: '🎀'
},
'downcast': { 
  icon: '/img/Ribbons-Marks/downcastribbon.png', 
  color: '#8888AA',
  fallback: '🎀'
},
'careless': { 
  icon: '/img/Ribbons-Marks/carelessribbon.png', 
  color: '#AAAAAA',
  fallback: '🎀'
},
'relax': { 
  icon: '/img/Ribbons-Marks/relaxribbon.png', 
  color: '#88CCAA',
  fallback: '🎀'
},
'snooze': { 
  icon: '/img/Ribbons-Marks/snoozeribbon.png', 
  color: '#99AAFF',
  fallback: '🎀'
},
'smile': { 
  icon: '/img/Ribbons-Marks/smileribbon.png', 
  color: '#FFCC44',
  fallback: '🎀'
},
'gorgeous': { 
  icon: '/img/Ribbons-Marks/gorgeousribbon.png', 
  color: '#FF88AA',
  fallback: '🎀'
},
'royal': { 
  icon: '/img/Ribbons-Marks/royalribbon.png', 
  color: '#AA66CC',
  fallback: '🎀'
},
'gorgeous-royal': { 
  icon: '/img/Ribbons-Marks/gorgeousroyalribbon.png', 
  color: '#FF88AA',
  fallback: '🎀'
},
'footprint': { 
  icon: '/img/Ribbons-Marks/footprintribbon.png', 
  color: '#88CCAA',
  fallback: '🎀'
},
'legend': { 
  icon: '/img/Ribbons-Marks/legendribbon.png', 
  color: '#DDAA22',
  fallback: '🎀'
},
'classic': { 
  icon: '/img/Ribbons-Marks/classicribbon.png', 
  color: '#DDAA22',
  fallback: '🎀'
},
'premier': { 
  icon: '/img/Ribbons-Marks/premierribbon.png', 
  color: '#DD2222',
  fallback: '🎀'
},
'birthday': { 
  icon: '/img/Ribbons-Marks/birthdayribbon.png', 
  color: '#FF88AA',
  fallback: '🎀'
},
'special': { 
  icon: '/img/Ribbons-Marks/specialribbon.png', 
  color: '#DD2222',
  fallback: '🎀'
},
'event': { 
  icon: '/img/Ribbons-Marks/eventribbon.png', 
  color: '#DD2222',
  fallback: '🎀'
},
'souvenir': { 
  icon: '/img/Ribbons-Marks/souvenirribbon.png', 
  color: '#DDAA22',
  fallback: '🎀'
},
'battle-champ': { 
  icon: '/img/Ribbons-Marks/battlechampribbon.png', 
  color: '#22AA44',
  fallback: '🎀'
},
'regional-champ': { 
  icon: '/img/Ribbons-Marks/regionalchampribbon.png', 
  color: '#22AA44',
  fallback: '🎀'
},
'national-champ': { 
  icon: '/img/Ribbons-Marks/nationalchampribbon.png', 
  color: '#22AA44',
  fallback: '🎀'
},
'kalos-champion': { 
  icon: '/img/Ribbons-Marks/kaloschampionribbon.png', 
  color: '#22AA44',
  fallback: '🎀'
},
'training': { 
  icon: '/img/Ribbons-Marks/trainingribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'skillful-battler': { 
  icon: '/img/Ribbons-Marks/skillfulbattlerribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'expert-battler': { 
  icon: '/img/Ribbons-Marks/expertbattlerribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'best-friends': { 
  icon: '/img/Ribbons-Marks/bestfriendsribbon.png', 
  color: '#FF88AA',
  fallback: '🎀'
},
'contest-memory': { 
  icon: '/img/Ribbons-Marks/contestmemoryribbon.png', 
  color: '#FF88AA',
  fallback: '🎀'
},
'battle-memory': { 
  icon: '/img/Ribbons-Marks/battlememoryribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'contest-memory-2': { 
  icon: '/img/Ribbons-Marks/contestmemoryribbon2.png', 
  color: '#FF88AA',
  fallback: '🎀'
},
'battle-memory-2': { 
  icon: '/img/Ribbons-Marks/battlememoryribbon2.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'alola-champion': { 
  icon: '/img/Ribbons-Marks/alolachampionribbon.png', 
  color: '#22AA44',
  fallback: '🎀'
},
'battle-royal-master': { 
  icon: '/img/Ribbons-Marks/battleroyalmasterribbon.png', 
  color: '#DDAA22',
  fallback: '🎀'
},
'battle-tree-great': { 
  icon: '/img/Ribbons-Marks/battletreegreatribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'battle-tree-master': { 
  icon: '/img/Ribbons-Marks/battletreemasterribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'galar-champion': { 
  icon: '/img/Ribbons-Marks/galarchampionribbon.png', 
  color: '#22AA44',
  fallback: '🎀'
},
'tower-master': { 
  icon: '/img/Ribbons-Marks/towermasterribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'master-rank': { 
  icon: '/img/Ribbons-Marks/masterrankribbon.png', 
  color: '#DDAA22',
  fallback: '🎀'
},
'record': { 
  icon: '/img/Ribbons-Marks/recordribbon.png', 
  color: '#DDAA22',
  fallback: '🎀'
},
'history': { 
  icon: '/img/Ribbons-Marks/historyribbon.png', 
  color: '#DDAA22',
  fallback: '🎀'
},
'red': { 
  icon: '/img/Ribbons-Marks/redribbon.png', 
  color: '#DD2222',
  fallback: '🎀'
},
'green': { 
  icon: '/img/Ribbons-Marks/greenribbon.png', 
  color: '#44BB44',
  fallback: '🎀'
},
'blue': { 
  icon: '/img/Ribbons-Marks/blueribbon.png', 
  color: '#4488DD',
  fallback: '🎀'
},
'festival': { 
  icon: '/img/Ribbons-Marks/festivalribbon.png', 
  color: '#FF88AA',
  fallback: '🎀'
},
'carnival': { 
  icon: '/img/Ribbons-Marks/carnivalribbon.png', 
  color: '#FFAA44',
  fallback: '🎀'
},
'beauty-master-2': { 
  icon: '/img/Ribbons-Marks/beautymasterribbon2.png', 
  color: '#FF88DD',
  fallback: '🎀'
},
'cleverness-master': { 
  icon: '/img/Ribbons-Marks/clevernessmasterribbon.png', 
  color: '#44BB44',
  fallback: '🎀'
},
'coolness-master': { 
  icon: '/img/Ribbons-Marks/coolnessmasterribbon.png', 
  color: '#FF4444',
  fallback: '🎀'
},
'cuteness-master': { 
  icon: '/img/Ribbons-Marks/cutenessmasterribbon.png', 
  color: '#FFAA44',
  fallback: '🎀'
},
'toughness-master': { 
  icon: '/img/Ribbons-Marks/toughnessmasterribbon.png', 
  color: '#BB6644',
  fallback: '🎀'
},
'contest-star': { 
  icon: '/img/Ribbons-Marks/conteststarribbon.png', 
  color: '#FFCC44',
  fallback: '🎀'
},
'twinkling-star': { 
  icon: '/img/Ribbons-Marks/twinklingstarribbon.png', 
  color: '#FFCC44',
  fallback: '🎀'
}
};

// Update the markIcons object to use local images
const markIcons = {
'lunchtime': { 
  icon: '/img/Ribbons-Marks/lunchtimemark.png', 
  color: '#FF9944',
  fallback: '❌'
},
'sleepy-time': { 
  icon: '/img/Ribbons-Marks/sleepy-timemark.png', 
  color: '#99AAFF',
  fallback: '❌'
},
'dusk': { 
  icon: '/img/Ribbons-Marks/duskmark.png', 
  color: '#9977CC',
  fallback: '❌'
},
'dawn': { 
  icon: '/img/Ribbons-Marks/dawnmark.png', 
  color: '#FFBB77',
  fallback: '❌'
},
'cloudy': { 
  icon: '/img/Ribbons-Marks/cloudymark.png', 
  color: '#AABBCC',
  fallback: '❌'
},
'rainy': { 
  icon: '/img/Ribbons-Marks/rainymark.png', 
  color: '#6699FF',
  fallback: '❌'
},
'stormy': { 
  icon: '/img/Ribbons-Marks/stormymark.png', 
  color: '#7766CC',
  fallback: '❌'
},
'snowy': { 
  icon: '/img/Ribbons-Marks/snowymark.png', 
  color: '#AADDFF',
  fallback: '❌'
},
'blizzard': { 
  icon: '/img/Ribbons-Marks/blizzardmark.png', 
  color: '#AADDFF',
  fallback: '❌'
},
'dry': { 
  icon: '/img/Ribbons-Marks/drymark.png', 
  color: '#FFAA44',
  fallback: '❌'
},
'sandstorm': { 
  icon: '/img/Ribbons-Marks/sandstormmark.png', 
  color: '#DDBB66',
  fallback: '❌'
},
'misty': { 
  icon: '/img/Ribbons-Marks/mistymark.png', 
  color: '#AABBCC',
  fallback: '❌'
},
'destiny': { 
  icon: '/img/Ribbons-Marks/destinymark.png', 
  color: '#AA66CC',
  fallback: '❌'
},
'fishing': { 
  icon: '/img/Ribbons-Marks/fishingmark.png', 
  color: '#4488DD',
  fallback: '❌'
},
'curry': { 
  icon: '/img/Ribbons-Marks/currymark.png', 
  color: '#FF6622',
  fallback: '❌'
},
'uncommon': { 
  icon: '/img/Ribbons-Marks/uncommonmark.png', 
  color: '#DDAA22',
  fallback: '❌'
},
'rare': { 
  icon: '/img/Ribbons-Marks/raremark.png', 
  color: '#DD2222',
  fallback: '❌'
},
'rowdy': { 
  icon: '/img/Ribbons-Marks/rowdymark.png', 
  color: '#FF5544',
  fallback: '❌'
},
'absent-minded': { 
  icon: '/img/Ribbons-Marks/absent-mindedmark.png', 
  color: '#AAAAAA',
  fallback: '❌'
},
'jittery': { 
  icon: '/img/Ribbons-Marks/jitterymark.png', 
  color: '#FFAA44',
  fallback: '❌'
},
'excited': { 
  icon: '/img/Ribbons-Marks/excitedmark.png', 
  color: '#FFCC44',
  fallback: '❌'
},
'charismatic': { 
  icon: '/img/Ribbons-Marks/charismaticmark.png', 
  color: '#FF88AA',
  fallback: '❌'
},
'calmness': { 
  icon: '/img/Ribbons-Marks/calmnessmark.png', 
  color: '#88CCFF',
  fallback: '❌'
},
'intense': { 
  icon: '/img/Ribbons-Marks/intensemark.png', 
  color: '#FF4422',
  fallback: '❌'
},
'zoned-out': { 
  icon: '/img/Ribbons-Marks/zoned-outmark.png', 
  color: '#AAAAAA',
  fallback: '❌'
},
'joyful': { 
  icon: '/img/Ribbons-Marks/joyfulmark.png', 
  color: '#FFAA44',
  fallback: '❌'
},
'angry': { 
  icon: '/img/Ribbons-Marks/angrymark.png', 
  color: '#FF4422',
  fallback: '❌'
},
'smiley': { 
  icon: '/img/Ribbons-Marks/smileymark.png', 
  color: '#FFCC44',
  fallback: '❌'
},
'teary': { 
  icon: '/img/Ribbons-Marks/tearymark.png', 
  color: '#88AAFF',
  fallback: '❌'
},
'upbeat': { 
  icon: '/img/Ribbons-Marks/upbeatmark.png', 
  color: '#FFAA44',
  fallback: '❌'
},
'peeved': { 
  icon: '/img/Ribbons-Marks/peevedmark.png', 
  color: '#FF6644',
  fallback: '❌'
},
'intellectual': { 
  icon: '/img/Ribbons-Marks/intellectualmark.png', 
  color: '#44AADD',
  fallback: '❌'
},
'ferocious': { 
  icon: '/img/Ribbons-Marks/ferociousmark.png', 
  color: '#FF4422',
  fallback: '❌'
},
'crafty': { 
  icon: '/img/Ribbons-Marks/craftymark.png', 
  color: '#AA66CC',
  fallback: '❌'
},
'scowling': { 
    icon: '/img/Ribbons-Marks/scowlingmark.png', 
    color: '#666666',
    fallback: '❌'
  },
  'kindly': { 
    icon: '/img/Ribbons-Marks/kindlymark.png', 
    color: '#FFAACC',
    fallback: '❌'
  },
  'flustered': { 
    icon: '/img/Ribbons-Marks/flusteredmark.png', 
    color: '#FF88AA',
    fallback: '❌'
  },
  'pumped-up': { 
    icon: '/img/Ribbons-Marks/pumped-upmark.png', 
    color: '#FF5544',
    fallback: '❌'
  },
  'zeroenergy': { 
    icon: '/img/Ribbons-Marks/zeroenergymark.png', 
    color: '#AAAAAA',
    fallback: '❌'
  },
  'prideful': { 
    icon: '/img/Ribbons-Marks/pridefulmark.png', 
    color: '#FFCC44',
    fallback: '❌'
  },
  'unsure': { 
    icon: '/img/Ribbons-Marks/unsuremark.png', 
    color: '#AAAAAA',
    fallback: '❌'
  },
  'humble': { 
    icon: '/img/Ribbons-Marks/humblemark.png', 
    color: '#88CCAA',
    fallback: '❌'
  },
  'thorny': { 
    icon: '/img/Ribbons-Marks/thornymark.png', 
    color: '#CC6644',
    fallback: '❌'
  },
  'vigor': { 
    icon: '/img/Ribbons-Marks/vigormark.png', 
    color: '#FF5544',
    fallback: '❌'
  },
  'slump': { 
    icon: '/img/Ribbons-Marks/slumpmark.png', 
    color: '#8888AA',
    fallback: '❌'
  }
};

// Updated RibbonsTab component with table view option
const RibbonsTab = ({ pokemon, caughtStatus, updateRibbonStatus }) => {
  const [failedImages, setFailedImages] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  // Group ribbons by category
  const ribbonsByCategory = useMemo(() => {
    const filtered = searchText 
      ? pokemonRibbons.filter(r => r.name.toLowerCase().includes(searchText.toLowerCase()) || 
                                  r.description.toLowerCase().includes(searchText.toLowerCase()) ||
                                  r.obtainMethod?.toLowerCase().includes(searchText.toLowerCase()))
      : pokemonRibbons;
    
    return filtered.reduce((acc, ribbon) => {
      const category = ribbon.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(ribbon);
      return acc;
    }, {});
  }, [searchText]);
  
  const handleImageError = (ribbonId) => {
    setFailedImages(prev => ({ ...prev, [ribbonId]: true }));
  };
  
  return (
    <div className="pt-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Ribbon Collection</h2>
        <p className="text-gray-400 mb-4">Track the ribbons you&apos;ve earned with this Pokémon.</p>
      
        <div className="mb-6">
          {/* Search input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search ribbons..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchText && (
              <button 
                onClick={() => setSearchText('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-8">
          {Object.keys(ribbonsByCategory).map(category => (
            <div key={category} className="overflow-x-auto">
              <h3 className="text-lg font-semibold capitalize mb-4">{category} Ribbons</h3>
              <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider w-16"></th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Ribbon</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">How to Obtain</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {ribbonsByCategory[category].map(ribbon => {
                    const iconData = ribbonIcons[ribbon.id] || { 
                      icon: 'https://www.serebii.net/ribbons/classicribbon.png',
                      color: '#AA99CC', 
                      fallback: '🎀'
                    };
                    const hasRibbon = caughtStatus.ribbons?.[ribbon.id];
                    const useIconFallback = failedImages[ribbon.id];
                    
                    return (
                      <tr 
                        key={ribbon.id}
                        onClick={() => updateRibbonStatus(ribbon.id, pokemon.name)}
                        className={`hover:bg-gray-600 cursor-pointer transition-colors ${
                          hasRibbon ? 'bg-indigo-900 bg-opacity-30' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto bg-gray-800"
                            style={{ 
                              border: `2px solid ${iconData.color}`
                            }}
                          >
                            {useIconFallback ? (
                              <span className="text-lg">{iconData.fallback}</span>
                            ) : (
                              <Image 
                                src={iconData.icon} 
                                alt={ribbon.name}
                                width={40}
                                height={40}
                                className="object-contain"
                                onError={() => handleImageError(ribbon.id)}
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{ribbon.name}</td>
                        <td className="py-3 px-4 text-gray-300">{ribbon.description}</td>
                        <td className="py-3 px-4 text-gray-300">{ribbon.obtainMethod}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            hasRibbon 
                              ? 'bg-indigo-100 text-indigo-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {hasRibbon ? 'Obtained' : 'Missing'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Updated MarksTab component with table-like format
const MarksTab = ({ pokemon, caughtStatus, updateMarkStatus }) => {
  const [failedImages, setFailedImages] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  // Group marks by category
  const marksByCategory = useMemo(() => {
    const filtered = searchText 
      ? pokemonMarks.filter(m => m.name.toLowerCase().includes(searchText.toLowerCase()) || 
                                m.description.toLowerCase().includes(searchText.toLowerCase()) ||
                                m.method.toLowerCase().includes(searchText.toLowerCase()))
      : pokemonMarks;
    
    return filtered.reduce((acc, mark) => {
      const category = mark.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(mark);
      return acc;
    }, {});
  }, [searchText]);
  
  const handleImageError = (markId) => {
    setFailedImages(prev => ({ ...prev, [markId]: true }));
  };
  
  return (
    <div className="pt-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">Mark Collection</h2>
        <p className="text-gray-400 mb-4">Track the marks you&apos;ve found on this Pokémon.</p>
        
        <div className="mb-6">
          {/* Search input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search marks..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchText && (
              <button 
                onClick={() => setSearchText('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-8">
          {Object.keys(marksByCategory).map(category => (
            <div key={category} className="overflow-x-auto">
              <h3 className="text-lg font-semibold capitalize mb-4">{category} Marks</h3>
              <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider w-16"></th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Mark</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">How to Obtain</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider w-24">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {marksByCategory[category].map(mark => {
                    const iconData = markIcons[mark.id] || { 
                      icon: 'https://www.serebii.net/ribbons/raremark.png',
                      color: '#99CCFF', 
                      fallback: '❌'
                    };
                    const hasMark = caughtStatus.marks?.[mark.id];
                    const useIconFallback = failedImages[mark.id];
                    
                    return (
                      <tr 
                        key={mark.id}
                        onClick={() => updateMarkStatus(mark.id, pokemon.name)}
                        className={`hover:bg-gray-600 cursor-pointer transition-colors ${
                          hasMark ? 'bg-green-600 hover:bg-green-700 text-white' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto bg-gray-800"
                            style={{ 
                              border: `2px solid ${iconData.color}`
                            }}
                          >
                            {useIconFallback ? (
                              <span className="text-lg">{iconData.fallback}</span>
                            ) : (
                              <Image 
                                src={iconData.icon} 
                                alt={mark.name}
                                width={40}
                                height={40}
                                className="object-contain"
                                onError={() => handleImageError(mark.id)}
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">{mark.name}</td>
                        <td className="py-3 px-4 text-gray-300">{mark.description}</td>
                        <td className="py-3 px-4 text-gray-300">{mark.method}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            hasMark ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {hasMark ? 'Obtained' : 'Missing'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Updated component to display sprites for a specific generation with side-by-side comparison
const SpriteGeneration = ({ generation, pokemon }) => {
  // Check if this generation has any sprites
  let hasSprites = false;
  
  if (generation.id === "home") {
    hasSprites = !!pokemon.sprites.other?.home?.front_default || !!pokemon.sprites.other?.["official-artwork"]?.front_default;
  } else {
    hasSprites = !!pokemon.sprites.versions?.[generation.id];
  }
  
  if (!hasSprites) return null;
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">{generation.name}</h3>
      
      <div className="space-y-6">
        {generation.id === "home" ? (
          <HomeSprites pokemon={pokemon} />
        ) : (
          generation.versions.map(version => (
            <VersionSprites
              key={version}
              versionId={version}
              generation={generation.id}
              pokemon={pokemon}
            />
          ))
        )}
            </div>
    </div>
  );
};

// Updated HomeSprites to show regular and shiny side-by-side
const HomeSprites = ({ pokemon }) => {
  const homeSprites = pokemon.sprites.other?.home;
  const artworkSprites = pokemon.sprites.other?.["official-artwork"];
  
  if (!homeSprites && !artworkSprites) return null;
  
  return (
    <div className="space-y-6">
      {/* HOME sprites */}
      {homeSprites && (
                    <div>
          <h4 className="font-medium mb-3">Pokémon HOME</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Default form - regular and shiny side by side */}
            <div className="bg-gray-700 rounded-lg p-3">
              <h5 className="text-sm font-medium mb-2 text-center">Default Form</h5>
              <div className="flex">
                <div className="w-1/2 flex flex-col items-center">
                  {homeSprites.front_default ? (
                    <SpriteImage 
                      src={homeSprites.front_default} 
                      alt="Default" 
                      label="Regular" 
                      large 
                    />
                  ) : (
                    <div className="h-32 w-32 flex items-center justify-center text-gray-500">
                      Not Available
          </div>
                  )}
        </div>
                <div className="w-1/2 flex flex-col items-center">
                  {homeSprites.front_shiny ? (
                    <SpriteImage 
                      src={homeSprites.front_shiny} 
                      alt="Shiny" 
                      label="Shiny" 
                      large 
                    />
                  ) : (
                    <div className="h-32 w-32 flex items-center justify-center text-gray-500">
                      Not Available
          </div>
                  )}
                  </div>
                  </div>
                </div>
            
            {/* Female form if available */}
            {(homeSprites.front_female || homeSprites.front_shiny_female) && (
              <div className="bg-gray-700 rounded-lg p-3">
                <h5 className="text-sm font-medium mb-2 text-center">Female Form</h5>
                <div className="flex">
                  <div className="w-1/2 flex flex-col items-center">
                    {homeSprites.front_female ? (
                      <SpriteImage 
                        src={homeSprites.front_female} 
                        alt="Female" 
                        label="Regular" 
                        large 
                      />
                    ) : (
                      <div className="h-32 w-32 flex items-center justify-center text-gray-500">
                        Not Available
          </div>
                    )}
        </div>
                  <div className="w-1/2 flex flex-col items-center">
                    {homeSprites.front_shiny_female ? (
                      <SpriteImage 
                        src={homeSprites.front_shiny_female} 
                        alt="Female Shiny" 
                        label="Shiny" 
                        large 
                      />
                    ) : (
                      <div className="h-32 w-32 flex items-center justify-center text-gray-500">
                        Not Available
                  </div>
                    )}
                </div>
                </div>
              </div>
            )}
              </div>
            </div>
          )}
          
      {/* Official artwork */}
      {artworkSprites && (
            <div className="mt-6">
          <h4 className="font-medium mb-3">Official Artwork</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              {artworkSprites.front_default ? (
                <SpriteImage 
                  src={artworkSprites.front_default} 
                  alt="Default Artwork" 
                  label="Regular" 
                  large={true}
                  extraLarge={true}
                />
              ) : (
                <div className="h-40 w-40 flex items-center justify-center text-gray-500">
                  Not Available
                </div>
              )}
            </div>
            <div className="flex flex-col items-center">
              {artworkSprites.front_shiny ? (
                <SpriteImage 
                  src={artworkSprites.front_shiny} 
                  alt="Shiny Artwork" 
                  label="Shiny" 
                  large={true}
                  extraLarge={true}
                />
              ) : (
                <div className="h-40 w-40 flex items-center justify-center text-gray-500">
                  Not Available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Updated VersionSprites to show regular and shiny side-by-side for each variant
const VersionSprites = ({ versionId, generation, pokemon }) => {
  // Get sprites for this version
  const versionSprites = pokemon.sprites.versions?.[generation]?.[versionId];
  
  if (!versionSprites) return null;
  
  // Format version name
  const versionName = versionId.replace(/-/g, ' ').split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  // Check if this version has animated sprites
  const hasAnimated = !!versionSprites.animated?.front_default;
  
  return (
    <div>
      <h4 className="font-medium mb-3">{versionName}</h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Front sprites */}
        <div className="bg-gray-700 rounded-lg p-3">
          <h5 className="text-sm font-medium mb-2 text-center">Front View</h5>
          <div className="flex">
            <div className="w-1/2 flex flex-col items-center">
              {hasAnimated && versionSprites.animated?.front_default ? (
                <SpriteImage 
                  src={versionSprites.animated.front_default} 
                  alt="Front Default Animated" 
                  label="Regular" 
                  animated={true} 
                />
              ) : versionSprites.front_default ? (
                <SpriteImage 
                  src={versionSprites.front_default} 
                  alt="Front Default" 
                  label="Regular" 
                  animated={versionSprites.front_default.includes('.gif')} 
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center text-gray-500">
                  N/A
          </div>
              )}
          </div>
            <div className="w-1/2 flex flex-col items-center">
              {hasAnimated && versionSprites.animated?.front_shiny ? (
                <SpriteImage 
                  src={versionSprites.animated.front_shiny} 
                  alt="Front Shiny Animated" 
                  label="Shiny" 
                  animated={true} 
                />
              ) : versionSprites.front_shiny ? (
                <SpriteImage 
                  src={versionSprites.front_shiny} 
                  alt="Front Shiny" 
                  label="Shiny" 
                  animated={versionSprites.front_shiny.includes('.gif')} 
                />
              ) : (
                <div className="h-20 w-20 flex items-center justify-center text-gray-500">
                  N/A
        </div>
              )}
                    </div>
          </div>
        </div>
        
        {/* Back sprites */}
        {(versionSprites.back_default || versionSprites.back_shiny || 
          versionSprites.animated?.back_default || versionSprites.animated?.back_shiny) && (
          <div className="bg-gray-700 rounded-lg p-3">
            <h5 className="text-sm font-medium mb-2 text-center">Back View</h5>
            <div className="flex">
              <div className="w-1/2 flex flex-col items-center">
                {hasAnimated && versionSprites.animated?.back_default ? (
                  <SpriteImage 
                    src={versionSprites.animated.back_default} 
                    alt="Back Default Animated" 
                    label="Regular" 
                    animated={true} 
                  />
                ) : versionSprites.back_default ? (
                  <SpriteImage 
                    src={versionSprites.back_default} 
                    alt="Back Default" 
                    label="Regular" 
                    animated={versionSprites.back_default.includes('.gif')} 
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center text-gray-500">
                    N/A
                  </div>
                )}
              </div>
              <div className="w-1/2 flex flex-col items-center">
                {hasAnimated && versionSprites.animated?.back_shiny ? (
                  <SpriteImage 
                    src={versionSprites.animated.back_shiny} 
                    alt="Back Shiny Animated" 
                    label="Shiny" 
                    animated={true} 
                  />
                ) : versionSprites.back_shiny ? (
                  <SpriteImage 
                    src={versionSprites.back_shiny} 
                    alt="Back Shiny" 
                    label="Shiny" 
                    animated={versionSprites.back_shiny.includes('.gif')} 
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center text-gray-500">
                    N/A
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Female sprites if they exist - in a separate row */}
      {(versionSprites.front_female || versionSprites.front_shiny_female || 
        versionSprites.animated?.front_female || versionSprites.animated?.front_shiny_female) && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-3">
            <h5 className="text-sm font-medium mb-2 text-center">Female Front</h5>
            <div className="flex">
              <div className="w-1/2 flex flex-col items-center">
                {hasAnimated && versionSprites.animated?.front_female ? (
                  <SpriteImage 
                    src={versionSprites.animated.front_female} 
                    alt="Female Animated" 
                    label="Regular" 
                    animated={true} 
                  />
                ) : versionSprites.front_female ? (
                  <SpriteImage 
                    src={versionSprites.front_female} 
                    alt="Female" 
                    label="Regular" 
                    animated={versionSprites.front_female.includes('.gif')} 
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center text-gray-500">
                    N/A
                    </div>
                )}
              </div>
              <div className="w-1/2 flex flex-col items-center">
                {hasAnimated && versionSprites.animated?.front_shiny_female ? (
                  <SpriteImage 
                    src={versionSprites.animated.front_shiny_female} 
                    alt="Female Shiny Animated" 
                    label="Shiny" 
                    animated={true} 
                  />
                ) : versionSprites.front_shiny_female ? (
                  <SpriteImage 
                    src={versionSprites.front_shiny_female} 
                    alt="Female Shiny" 
                    label="Shiny" 
                    animated={versionSprites.front_shiny_female.includes('.gif')} 
                  />
                ) : (
                  <div className="h-20 w-20 flex items-center justify-center text-gray-500">
                    N/A
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Back female sprites if they exist */}
          {(versionSprites.back_female || versionSprites.back_shiny_female || 
            versionSprites.animated?.back_female || versionSprites.animated?.back_shiny_female) && (
            <div className="bg-gray-700 rounded-lg p-3">
              <h5 className="text-sm font-medium mb-2 text-center">Female Back</h5>
              <div className="flex">
                <div className="w-1/2 flex flex-col items-center">
                  {hasAnimated && versionSprites.animated?.back_female ? (
                    <SpriteImage 
                      src={versionSprites.animated.back_female} 
                      alt="Female Back Animated" 
                      label="Regular" 
                      animated={true} 
                    />
                  ) : versionSprites.back_female ? (
                    <SpriteImage 
                      src={versionSprites.back_female} 
                      alt="Female Back" 
                      label="Regular" 
                      animated={versionSprites.back_female.includes('.gif')} 
                    />
                  ) : (
                    <div className="h-20 w-20 flex items-center justify-center text-gray-500">
                      N/A
                    </div>
                  )}
                </div>
                <div className="w-1/2 flex flex-col items-center">
                  {hasAnimated && versionSprites.animated?.back_shiny_female ? (
                    <SpriteImage 
                      src={versionSprites.animated.back_shiny_female} 
                      alt="Female Back Shiny Animated" 
                      label="Shiny" 
                      animated={true} 
                    />
                  ) : versionSprites.back_shiny_female ? (
                    <SpriteImage 
                      src={versionSprites.back_shiny_female} 
                      alt="Female Back Shiny" 
                      label="Shiny" 
                      animated={versionSprites.back_shiny_female.includes('.gif')} 
                    />
                  ) : (
                    <div className="h-20 w-20 flex items-center justify-center text-gray-500">
                      N/A
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
              </div>
                );
};

// Improved SpriteImage component to ensure animations work properly
const SpriteImage = ({ src, alt, label, animated = false, large = false, extraLarge = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  
  if (isError) return null;
  
  // Determine size classes based on props
  let sizeClass = 'w-20 h-20';
  let imgSizeClass = 'max-w-[60px] max-h-[60px]';
  
  if (extraLarge) {
    sizeClass = 'w-40 h-40';
    imgSizeClass = 'max-w-[120px] max-h-[120px]';
  } else if (large) {
    sizeClass = 'w-32 h-32';
    imgSizeClass = 'max-w-[100px] max-h-[100px]';
  }

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClass} bg-gray-900 rounded-lg flex items-center justify-center p-2`}>
        {!isLoaded && (
          <div className="text-gray-500">Loading...</div>
        )}
        <img
          src={src}
          alt={alt}
          className={`${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgSizeClass}`}
          style={animated ? { imageRendering: 'pixelated' } : {}} // Better rendering for pixel art
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
        />
      </div>
      {label && <div className="text-xs text-gray-400 mt-1 text-center">{label}</div>}
    </div>
  );
};

// Sprites Tab Component
const SpritesTab = ({ pokemon }) => {
  const [selectedGeneration, setSelectedGeneration] = useState('main');
  
  const generations = [
    { id: 'main', name: 'Official Artwork' },
    { id: 'home', name: 'Pokémon HOME' },
    { id: 'gen1', name: 'Generation 1' },
    { id: 'gen2', name: 'Generation 2' },
    { id: 'gen3', name: 'Generation 3' },
    { id: 'gen4', name: 'Generation 4' },
    { id: 'gen5', name: 'Generation 5' },
    { id: 'gen6', name: 'Generation 6' },
    { id: 'gen7', name: 'Generation 7' },
    { id: 'gen8', name: 'Generation 8' }
  ];
  
  // Filter generations that have sprites for this Pokémon
  const availableGenerations = generations.filter(gen => {
    if (gen.id === 'main' || gen.id === 'home') return true;
    
    // For other generations, check if there are sprites
    const genNumber = parseInt(gen.id.replace('gen', ''));
    return pokemon.id <= getMaxIdForGeneration(genNumber);
  });
  
  // Helper function to get max Pokémon ID for each generation
  function getMaxIdForGeneration(gen) {
    const maxIds = {
      1: 151,    // Gen 1: 151 Pokémon
      2: 251,    // Gen 2: 100 new Pokémon
      3: 386,    // Gen 3: 135 new Pokémon
      4: 493,    // Gen 4: 107 new Pokémon
      5: 649,    // Gen 5: 156 new Pokémon
      6: 721,    // Gen 6: 72 new Pokémon
      7: 809,    // Gen 7: 88 new Pokémon
      8: 898     // Gen 8: 89 new Pokémon
    };
    return maxIds[gen] || 898;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {availableGenerations.map(gen => (
          <button
            key={gen.id}
            onClick={() => setSelectedGeneration(gen.id)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedGeneration === gen.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {gen.name}
          </button>
        ))}
      </div>
      
      <div className="space-y-8">
        {selectedGeneration === 'main' && <OfficialArtworkSection pokemon={pokemon} />}
        {selectedGeneration === 'home' && <HomeSpritesSection pokemon={pokemon} />}
        {selectedGeneration.startsWith('gen') && <GenerationSpritesSection generation={selectedGeneration} pokemon={pokemon} />}
      </div>
    </div>
  );
};

// Official Artwork Section
const OfficialArtworkSection = ({ pokemon }) => {
  const [isShiny, setIsShiny] = useState(false);
  
  // Official artwork URLs
  const artworkNormalUrl = pokemon.sprites.other?.['official-artwork']?.front_default || 
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
  const artworkShinyUrl = pokemon.sprites.other?.['official-artwork']?.front_shiny || 
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`;
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Official Artwork</h3>
      
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setIsShiny(false)}
          className={`px-4 py-2 rounded-l-lg ${!isShiny ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Regular
        </button>
        <button
          onClick={() => setIsShiny(true)}
          className={`px-4 py-2 rounded-r-lg ${isShiny ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Shiny
        </button>
      </div>
      
      <div className="flex justify-center">
        <SpriteImage 
          src={isShiny ? artworkShinyUrl : artworkNormalUrl}
          alt={`${pokemon.name} ${isShiny ? 'shiny' : 'regular'} artwork`}
          extraLarge={true}
        />
      </div>
    </div>
  );
};

// HOME Sprites Section
const HomeSpritesSection = ({ pokemon }) => {
  const [isShiny, setIsShiny] = useState(false);
  
  // HOME sprite URLs
  const homeNormalUrl = pokemon.sprites.other?.home?.front_default || 
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`;
  const homeShinyUrl = pokemon.sprites.other?.home?.front_shiny || 
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${pokemon.id}.png`;
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Pokémon HOME Sprites</h3>
      
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setIsShiny(false)}
          className={`px-4 py-2 rounded-l-lg ${!isShiny ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Regular
        </button>
        <button
          onClick={() => setIsShiny(true)}
          className={`px-4 py-2 rounded-r-lg ${isShiny ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          Shiny
        </button>
      </div>
      
      <div className="flex justify-center">
        <SpriteImage 
          src={isShiny ? homeShinyUrl : homeNormalUrl}
          alt={`${pokemon.name} ${isShiny ? 'shiny' : 'regular'} HOME sprite`}
          extraLarge={true}
        />
      </div>
    </div>
  );
};

// Generation Sprites Section
const GenerationSpritesSection = ({ generation, pokemon }) => {
  const [isShiny, setIsShiny] = useState(false);
  
  // Map generation IDs to their corresponding sprite paths
  const generationMapping = {
    gen1: {
      title: "Generation 1 (Red/Blue/Yellow)",
      regular: {
        front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/${pokemon.id}.png`,
        back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/back/${pokemon.id}.png`,
        frontGray: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/yellow/${pokemon.id}.png`,
        backGray: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/yellow/back/${pokemon.id}.png`
      },
      // Gen 1 doesn't have shiny sprites
      shiny: null
    },
    gen2: {
      title: "Generation 2 (Gold/Silver/Crystal)",
      regular: {
        front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/${pokemon.id}.png`,
        back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/back/${pokemon.id}.png`,
        frontCrystal: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/${pokemon.id}.png`,
        backCrystal: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/back/${pokemon.id}.png`
      },
      shiny: {
        front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/shiny/${pokemon.id}.png`,
        back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/back/shiny/${pokemon.id}.png`,
        frontCrystal: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/shiny/${pokemon.id}.png`,
        backCrystal: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/back/shiny/${pokemon.id}.png`
      }
    },
    gen3: {
      title: "Generation 3 (Ruby/Sapphire/Emerald/FireRed/LeafGreen)",
      regular: {
        frontRS: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/ruby-sapphire/${pokemon.id}.png`,
        backRS: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/ruby-sapphire/back/${pokemon.id}.png`,
        frontEmerald: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/${pokemon.id}.png`,
        backEmerald: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/back/${pokemon.id}.png`,
        frontFRLG: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/${pokemon.id}.png`,
        backFRLG: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/back/${pokemon.id}.png`
      },
      shiny: {
        // Gen 3 doesn't have separate shiny sprites in the API
      }
    },
    gen4: {
      title: "Generation 4 (Diamond/Pearl/Platinum/HeartGold/SoulSilver)",
      regular: {
        frontDP: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/${pokemon.id}.png`,
        backDP: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/back/${pokemon.id}.png`,
        frontPt: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/platinum/${pokemon.id}.png`,
        backPt: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/platinum/back/${pokemon.id}.png`,
        frontHGSS: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/${pokemon.id}.png`,
        backHGSS: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/back/${pokemon.id}.png`
      },
      shiny: {
        frontDP: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/shiny/${pokemon.id}.png`,
        backDP: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/back/shiny/${pokemon.id}.png`,
        frontPt: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/platinum/shiny/${pokemon.id}.png`,
        backPt: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/platinum/back/shiny/${pokemon.id}.png`,
        frontHGSS: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/shiny/${pokemon.id}.png`,
        backHGSS: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/back/shiny/${pokemon.id}.png`
      }
    },
    gen5: {
      title: "Generation 5 (Black/White/Black 2/White 2)",
      regular: {
        front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/${pokemon.id}.png`,
        back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/back/${pokemon.id}.png`,
        frontAnimated: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif`,
        backAnimated: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${pokemon.id}.gif`
      },
      shiny: {
        front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/shiny/${pokemon.id}.png`,
        back: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/back/shiny/${pokemon.id}.png`,
        frontAnimated: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/shiny/${pokemon.id}.gif`,
        backAnimated: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/shiny/${pokemon.id}.gif`
      }
    },
    gen6: {
      title: "Generation 6 (X/Y/Omega Ruby/Alpha Sapphire)",
      regular: {
        frontXY: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vi/x-y/${pokemon.id}.png`,
        frontORAS: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/${pokemon.id}.png`
      },
      shiny: {
        frontXY: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vi/x-y/shiny/${pokemon.id}.png`,
        frontORAS: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vi/omegaruby-alphasapphire/shiny/${pokemon.id}.png`
      }
    },
    gen7: {
      title: "Generation 7 (Sun/Moon/Ultra Sun/Ultra Moon)",
      regular: {
        front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/${pokemon.id}.png`
      },
      shiny: {
        front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/shiny/${pokemon.id}.png`
      }
    },
    gen8: {
      title: "Generation 8 (Sword/Shield)",
      regular: {
        front: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${pokemon.id}.png`
      },
      shiny: null // Gen 8 doesn't have shiny sprites in the API
    }
  };
  
  const genData = generationMapping[generation];
  
  if (!genData) {
    return <div>No sprite data available for this generation</div>;
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{genData.title}</h3>
      
      {genData.shiny && (
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setIsShiny(false)}
            className={`px-4 py-2 rounded-l-lg ${!isShiny ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Regular
          </button>
          <button
            onClick={() => setIsShiny(true)}
            className={`px-4 py-2 rounded-r-lg ${isShiny ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            Shiny
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Display sprites based on generation and shiny status */}
        {genData && (isShiny ? genData.shiny : genData.regular) && 
          Object.entries(isShiny ? genData.shiny || {} : genData.regular || {}).map(([key, url]) => (
            <SpriteImage 
              key={key}
              src={url}
              alt={`${pokemon.name} ${key} sprite`}
              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              animated={key.includes('Animated')}
              large={generation === 'gen6' || generation === 'gen7'}
            />
          ))
        }
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
  
  // Get the main type for theming throughout the page
  const mainType = pokemon?.types?.[0]?.type?.name || 'normal';
  const mainTypeColor = typeColors[mainType] || defaultTheme;
  
  // Create styles for the main page background and container
  const pageStyle = {
    background: `linear-gradient(to bottom, ${mainTypeColor.mainColor}22, ${mainTypeColor.mainColor}11)`,
    minHeight: '100vh'
  };
  
  // Create styles for card backgrounds to maintain readability
  const cardStyle = {
    backgroundColor: '#1f2937', // dark gray
    borderLeft: `4px solid ${mainTypeColor.mainColor}`
  };
  
  // Initialize next/prev Pokémon IDs
  const currentId = pokemon?.id || 0;
  const prevId = currentId > 1 ? currentId - 1 : null;
  const nextId = currentId < 898 ? currentId + 1 : null;
  
  // Get species description and category
  const englishFlavorText = species?.flavor_text_entries?.find(entry => entry.language.name === 'en')?.flavor_text || '';
  const category = species?.genera?.find(genus => genus.language.name === 'en')?.genus || '';
  
  // Get resistances and weaknesses
  const types = pokemon?.types?.map(t => t.type.name) || [];
  const weaknesses = getWeaknesses(types);
  const resistances = getResistances(types);
  const immunities = getImmunities(types);
  
  // Update caught status to include ribbons and marks
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
    } catch (error) {
      console.error('Error updating caught status:', error);
    }
  };
  
  // Add ribbon toggle function
  const updateRibbonStatus = (ribbonId, formName = 'default') => {
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
      
      if (!caughtData[pokemon.id][formName].ribbons) {
        caughtData[pokemon.id][formName].ribbons = {};
      }
      
      // Toggle the ribbon status
      caughtData[pokemon.id][formName].ribbons[ribbonId] = !caughtData[pokemon.id][formName].ribbons[ribbonId];
      
      // Update state and localStorage
      setCaughtStatus(caughtData[pokemon.id]);
      localStorage.setItem('caughtPokemon', JSON.stringify(caughtData));
    } catch (error) {
      console.error('Error updating ribbon status:', error);
    }
  };
  
  // Add mark toggle function
  const updateMarkStatus = (markId, formName = 'default') => {
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
      
      if (!caughtData[pokemon.id][formName].marks) {
        caughtData[pokemon.id][formName].marks = {};
      }
      
      // Toggle the mark status
      caughtData[pokemon.id][formName].marks[markId] = !caughtData[pokemon.id][formName].marks[markId];
      
      // Update state and localStorage
      setCaughtStatus(caughtData[pokemon.id]);
      localStorage.setItem('caughtPokemon', JSON.stringify(caughtData));
    } catch (error) {
      console.error('Error updating mark status:', error);
    }
  };
  
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
  }, [pokemon?.id]); // Only depend on pokemon.id to avoid unnecessary resets
  
  // Add a new useEffect to scroll the active tab into view
  useEffect(() => {
    // Scroll active tab into view when tab changes
    if (activeTab) {
      setTimeout(() => {
        document.getElementById(`tab-${activeTab}`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }, 100);
    }
  }, [activeTab]);
  
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
  
  return (
    <div style={pageStyle} className="text-white">
      <Head>
        <title>{properCase(pokemon.name)} | Pokédex Live</title>
        <meta name="description" content={`View details for ${properCase(pokemon.name)} - ${category}`} />
      </Head>
      
      <Navigation />
      
      <PokemonHero 
        pokemon={pokemon} 
        isShiny={isShiny} 
        setIsShiny={setIsShiny} 
        isAnimated={isAnimated}
        setIsAnimated={setIsAnimated}
        speciesText={category}
      />
      
      {/* Main content area with tabs */}
      <div className="container mx-auto px-4 pb-12">
        {/* Navigation links */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => router.push('/pokedex', undefined, { shallow: false })}
            className="hover:text-gray-300 flex items-center"
            style={{ color: mainTypeColor.darkColor }}
          >
            <span className="mr-2">←</span> Back to Pokédex
          </button>
          
          <div className="flex space-x-4">
            {prevId && (
              <button
                onClick={() => router.push(`/pokemon/${prevId}`)}
                className="hover:text-gray-300"
                style={{ color: mainTypeColor.darkColor }}
              >
                ← Prev
              </button>
            )}
            {nextId && (
              <button
                onClick={() => router.push(`/pokemon/${nextId}`)}
                className="hover:text-gray-300"
                style={{ color: mainTypeColor.darkColor }}
              >
                Next →
              </button>
            )}
          </div>
        </div>
        
        {/* Tab Navigation - scrollable for mobile */}
        <div className="relative mb-6">
          {/* Scrollable tab container */}
          <div className="overflow-x-auto hide-scrollbar pb-1">
            <div className="flex whitespace-nowrap">
              {['info', 'stats', 'evolution', 'moves', 'locations', 
                ...(ENABLE_EVENTS_TAB ? ['events'] : []), 
                'tracking', 'ribbons', 'marks', 'sprites'].map((tab) => {
                const isActive = activeTab === tab;
                
                // Create a style for active and inactive tabs
                const tabStyle = isActive 
                  ? { 
                      backgroundColor: mainTypeColor.mainColor, 
                      color: mainTypeColor.textColor,
                    }
                  : { 
                      backgroundColor: 'transparent',
                      color: 'white',
                      opacity: 0.8
                    };
                
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      // Scroll tab into view if needed
                      document.getElementById(`tab-${tab}`)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'center'
                      });
                    }}
                    id={`tab-${tab}`}
                    className={`px-5 py-3 text-center transition-all hover:opacity-100 min-w-max rounded-t-lg ${
                      isActive ? 'font-medium border-b-2' : ''
                    }`}
                    style={tabStyle}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Tab content with consistent styling */}
        {activeTab === 'info' && (
          <div style={cardStyle} className="rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold mb-4">Pokédex Data</h2>
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <p className="mb-4">{englishFlavorText.replace(/\f/g, ' ')}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Height</p>
                      <p>{(pokemon.height / 10).toFixed(1)}m</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Weight</p>
                      <p>{(pokemon.weight / 10).toFixed(1)}kg</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Category</p>
                      <p>{category}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Abilities</p>
                      <ul>
                        {pokemon.abilities.map((ability, index) => (
                          <li key={index} className="capitalize">
                            {ability.is_hidden ? (
                              <span className="text-purple-400">
                                {ability.ability.name.replace(/-/g, ' ')} (Hidden)
                          </span>
                            ) : (
                              ability.ability.name.replace(/-/g, ' ')
                            )}
                          </li>
                        ))}
                      </ul>
                </div>
              </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4">Type Effectiveness</h2>
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Weaknesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {weaknesses.length > 0 ? (
                        weaknesses.map(type => {
                          const typeStyle = typeColors[type] || defaultTheme;
                          return (
                            <span 
                              key={type} 
                              style={{ 
                                backgroundColor: typeStyle.mainColor,
                                color: typeStyle.textColor
                              }}
                              className="px-3 py-1 rounded-full text-sm capitalize font-medium"
                            >
                              {type}
                            </span>
                          );
                        })
                      ) : (
                        <p className="text-gray-400">No specific weaknesses</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Resistances</h3>
                    <div className="flex flex-wrap gap-2">
                      {resistances.length > 0 ? (
                        resistances.map(type => {
                          const typeStyle = typeColors[type] || defaultTheme;
                          return (
                            <span 
                              key={type} 
                              style={{ 
                                backgroundColor: typeStyle.mainColor,
                                color: typeStyle.textColor
                              }}
                              className="px-3 py-1 rounded-full text-sm capitalize font-medium"
                            >
                              {type}
                            </span>
                          );
                        })
                      ) : (
                        <p className="text-gray-400">No specific resistances</p>
                      )}
                    </div>
                  </div>
                  
                  {immunities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Immunities</h3>
                      <div className="flex flex-wrap gap-2">
                        {immunities.map(type => {
                          const typeStyle = typeColors[type] || defaultTheme;
                          return (
                            <span 
                              key={type} 
                              style={{ 
                                backgroundColor: typeStyle.mainColor,
                                color: typeStyle.textColor
                              }}
                              className="px-3 py-1 rounded-full text-sm capitalize font-medium"
                            >
                              {type}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div style={cardStyle} className="rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Base Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                {pokemon.stats.map((stat, index) => {
                  const statName = formatStatName(stat.stat.name);
                      const statValue = stat.base_stat;
                  const statPercentage = Math.min(100, (statValue / 255) * 100);
                      
                      return (
                    <div key={index} className="mb-4">
                          <div className="flex justify-between mb-1">
                        <span className="text-gray-300">{statName}</span>
                        <span className="font-medium">{statValue}</span>
                    </div>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div 
                          className="h-2.5 rounded-full" 
                          style={{ 
                            width: `${statPercentage}%`,
                            backgroundColor: mainTypeColor.mainColor 
                          }}
                            ></div>
                  </div>
                      </div>
                      );
                    })}
                    
                <div className="mt-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Total</span>
                    <span className="font-medium">
                      {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
                        </span>
                </div>
              </div>
                </div>
                
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Training</h3>
                <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <p className="text-gray-400">Base Exp</p>
                    <p>{pokemon.base_experience || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Growth Rate</p>
                    <p className="capitalize">{species.growth_rate?.name?.replace(/-/g, ' ') || 'N/A'}</p>
                    </div>
                    
                  <div>
                    <p className="text-gray-400">EV Yield</p>
                    <p>
                      {pokemon.stats
                        .filter(stat => stat.effort > 0)
                        .map(stat => `${stat.effort} ${formatStatName(stat.stat.name)}`)
                        .join(', ') || 'None'}
                    </p>
                  </div>
                    
                  <div>
                    <p className="text-gray-400">Catch Rate</p>
                    <p>{species.capture_rate} ({Math.round((species.capture_rate / 255) * 100)}%)</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'evolution' && (
          <div style={cardStyle} className="rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Evolution Chain</h2>
                  </div>
                    
            {evolutionChain?.chain ? (
              <div className="w-full overflow-visible pb-6">
                <div className="min-w-full">
                  <EvolutionChainRenderer 
                    chain={evolutionChain.chain} 
                    currentPokemonId={pokemon.id}
                  />
                    </div>
                  </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No evolution information available
                    </div>
            )}
                  </div>
        )}
        
        {activeTab === 'moves' && (
          <div style={cardStyle} className="rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Moves</h2>
            
            <div className="space-y-8">
              <MovesTable 
                moves={pokemon.moves} 
                learnMethod="level-up" 
                title="Moves Learned by Level Up" 
              />
              
              <MovesTable 
                moves={pokemon.moves} 
                learnMethod="machine" 
                title="Moves Learned by TM/HM" 
              />
              
              <MovesTable 
                moves={pokemon.moves} 
                learnMethod="egg" 
                title="Egg Moves" 
              />
              </div>
            </div>
        )}
        
        {activeTab === 'locations' && (
          <div style={cardStyle} className="rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Encounter Locations</h2>
            
            <LocationEncounterData pokemonId={pokemon.id} />
          </div>
          )}
          
        {activeTab === 'tracking' && (
          <div style={cardStyle} className="rounded-lg p-6">
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
              {alternativeForms?.map((form, index) => {
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
          
        {activeTab === 'ribbons' && (
          <div style={cardStyle} className="rounded-lg p-6">
            <RibbonsTab 
                pokemon={pokemon} 
              caughtStatus={caughtStatus[pokemon.id] || {}} 
              updateRibbonStatus={(ribbonId, status, formName) => 
                updateRibbonStatus(ribbonId, status, formName)
              } 
              />
                    </div>
          )}
          
        {activeTab === 'marks' && (
          <div style={cardStyle} className="rounded-lg p-6">
            <MarksTab 
              pokemon={pokemon} 
              caughtStatus={caughtStatus[pokemon.id] || {}} 
              updateMarkStatus={(markId, status, formName) => 
                updateMarkStatus(markId, status, formName)
              } 
            />
          </div>
        )}
        
        {activeTab === 'sprites' && (
          <div style={cardStyle} className="rounded-lg p-6">
            <SpritesTab pokemon={pokemon} />
          </div>
        )}
        
        {ENABLE_EVENTS_TAB && activeTab === 'events' && (
          <div style={cardStyle} className="rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Event Distributions</h2>
            <EventsTab pokemonId={pokemon.id} pokemonName={pokemon.name} />
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

// Update the EventsTab component to show more helpful loading/error states
const EventsTab = ({ pokemonId, pokemonName }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGeneration, setActiveGeneration] = useState('all');
  
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the API route to fetch event data
        const response = await fetch(`/api/pokemon-events?id=${pokemonId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch event data');
        }
        
        const data = await response.json();
        
        // Normalize and validate the data
        const validatedEvents = data.map(event => ({
          ...event,
          // Ensure required properties exist
          name: event.name || 'Unknown Event',
          location: event.location || 'Unknown',
          games: Array.isArray(event.games) ? event.games : [],
          moves: Array.isArray(event.moves) ? event.moves : [],
          ribbons: Array.isArray(event.ribbons) ? event.ribbons : [],
          year: event.year || new Date().getFullYear(),
          generation: event.generation || 'unknown'
        }));
        
        setEvents(validatedEvents);
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError(err.message || "Failed to load event data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvents();
  }, [pokemonId]);
  
  // Filter events by generation
  const filteredEvents = activeGeneration === 'all' 
    ? events 
    : events.filter(event => event.generation === activeGeneration);
  
  // Group events by year
  const eventsByYear = filteredEvents.reduce((acc, event) => {
    const year = event.year;
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {});
  
  // Sort years in descending order
  const sortedYears = Object.keys(eventsByYear).sort((a, b) => b - a);
  
  // Safely join array with fallback
  const safeJoin = (array, separator = ', ') => {
    if (!Array.isArray(array) || array.length === 0) return 'None';
    return array.join(separator);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
        <p className="text-gray-400">Fetching event data from Serebii.net...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4 text-center">
        <p className="text-red-400">{error}</p>
        <p className="text-gray-400 mt-2">
          This might be due to network issues or changes to Serebii's website structure.
        </p>
        <div className="mt-4 flex justify-center">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg mr-4"
          >
            Retry
          </button>
          <a 
            href={`https://www.serebii.net/events/dex/${String(pokemonId).padStart(3, '0')}.shtml`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center"
          >
            View on Serebii
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <SerebiiAttribution pokemonId={pokemonId} />
        <p className="text-gray-400">No event distributions found for {properCase(pokemonName)}.</p>
        <p className="text-sm text-gray-500 mt-2">
          If you believe this is an error, please check Serebii.net for the latest information.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <SerebiiAttribution pokemonId={pokemonId} />
      
      {/* Generation filter */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Filter by Generation:</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveGeneration('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeGeneration === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Generations
          </button>
          {['gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6', 'gen7', 'gen8', 'gen9'].map(gen => (
            <button
              key={gen}
              onClick={() => setActiveGeneration(gen)}
              className={`px-3 py-1 rounded-full text-sm ${
                activeGeneration === gen
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {gen.replace('gen', 'Gen ')}
            </button>
          ))}
        </div>
      </div>
      
      {/* Events by year */}
      <div className="space-y-8">
        {sortedYears.map(year => (
          <div key={year}>
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">{year}</h3>
            <div className="space-y-4">
              {eventsByYear[year].map((event, index) => (
                <EventCard key={index} event={event} safeJoin={safeJoin} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Serebii Attribution Component
const SerebiiAttribution = ({ pokemonId }) => {
  const serebiiUrl = `https://www.serebii.net/events/dex/${String(pokemonId).padStart(3, '0')}.shtml`;
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
      <div className="flex items-center">
        <div className="mr-3">
          <img 
            src="https://www.serebii.net/favicon.ico" 
            alt="Serebii.net" 
            width={24} 
            height={24} 
            className="rounded"
          />
        </div>
        <div>
          <p className="text-gray-300 text-sm">
            Event data sourced from{' '}
            <a 
              href={serebiiUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:underline font-medium"
            >
              Serebii.net
            </a>
            , the premier source for Pokémon information since 1999.
          </p>
        </div>
      </div>
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, safeJoin }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format date range
  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return 'Unknown date';
    if (!endDate) return startDate;
    return `${startDate} - ${endDate}`;
  };
  
  return (
    <div 
      className={`bg-gray-800 rounded-lg overflow-hidden transition-all duration-200 ${
        isExpanded ? 'shadow-lg' : 'hover:bg-gray-700'
      }`}
    >
      {/* Header - always visible */}
      <div 
        className="p-4 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h4 className="font-medium text-lg">{event.name || 'Unknown Event'}</h4>
          <p className="text-gray-400 text-sm">
            {event.location || 'Unknown location'} • 
            {formatDateRange(event.startDate, event.endDate)}
          </p>
        </div>
        <div className="flex items-center">
          {event.isShiny && (
            <span className="mr-2 text-yellow-400" title="Shiny available">✨</span>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">Distribution Details</h5>
              <ul className="space-y-1 text-sm">
                <li><span className="text-gray-400">Type:</span> {event.distributionType || 'Unknown'}</li>
                <li><span className="text-gray-400">Region:</span> {event.region || 'Unknown'}</li>
                <li><span className="text-gray-400">Games:</span> {safeJoin(event.games)}</li>
                {event.serialCode && (
                  <li><span className="text-gray-400">Serial Code:</span> {event.serialCode}</li>
                )}
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Pokémon Details</h5>
              <ul className="space-y-1 text-sm">
                <li><span className="text-gray-400">Level:</span> {event.level || '?'}</li>
                <li><span className="text-gray-400">OT:</span> {event.OT || 'Unknown'}</li>
                <li><span className="text-gray-400">ID:</span> {event.ID || 'Unknown'}</li>
                <li><span className="text-gray-400">Ability:</span> {event.ability || 'Unknown'}</li>
                {event.heldItem && (
                  <li><span className="text-gray-400">Held Item:</span> {event.heldItem}</li>
                )}
                <li><span className="text-gray-400">Nature:</span> {event.nature || 'Random'}</li>
              </ul>
            </div>
          </div>
          
          {/* Moves */}
          <div className="mt-4">
            <h5 className="font-medium mb-2">Moves</h5>
            {event.moves && event.moves.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {event.moves.map((move, index) => (
                  <div key={index} className="bg-gray-700 rounded px-3 py-1 text-sm">{move}</div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No moves data available</p>
            )}
          </div>
          
          {/* Ribbons if any */}
          {event.ribbons && event.ribbons.length > 0 && (
            <div className="mt-4">
              <h5 className="font-medium mb-2">Ribbons</h5>
              <div className="flex flex-wrap gap-2">
                {event.ribbons.map((ribbon, index) => (
                  <div key={index} className="bg-indigo-900 bg-opacity-50 rounded px-3 py-1 text-sm">{ribbon}</div>
                ))}
              </div>
            </div>
          )}
          
          {/* Additional notes */}
          {event.notes && (
            <div className="mt-4 text-sm text-gray-400">
              <p>{event.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add a feature flag at the top of your component
const ENABLE_EVENTS_TAB = false; // Set to true when ready to enable
