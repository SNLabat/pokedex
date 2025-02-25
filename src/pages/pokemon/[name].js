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
  const secondType = pokemon.types[1]?.type.name;
  
  // Get theme colors for the main type
  const mainTypeColor = typeColors[mainType] || defaultTheme;
  const secondTypeColor = secondType ? typeColors[secondType] || defaultTheme : null;
  
  // Create background style
  let heroBgStyle;
  
  if (mainType && secondType) {
    // Gradient for dual types
    heroBgStyle = {
      background: `linear-gradient(to right, ${mainTypeColor.darkColor}, ${secondTypeColor.darkColor})`
    };
  } else {
    // Solid color for single type
    heroBgStyle = {
      backgroundColor: mainTypeColor.darkColor
    };
  }

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
                    <div className="absolute top-0 right-0 w-1/2 h-full" style={{ backgroundColor: secondTypeColor.mainColor }}></div>
                  </>
                ) : null}
              </div>
              
              {/* Pokemon sprite */}
              <div className="relative z-10 w-56 h-56 bg-gray-900 rounded-full flex items-center justify-center">
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
                  width={isAnimated ? 120 : 200}
                  height={isAnimated ? 120 : 200}
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
          </div>
          
          {/* Rest of the hero content */}
          <div className="flex-1">
            <div className="flex flex-col">
              <div className="mb-4">
                <p className="text-gray-300 text-xl mb-1">#{String(pokemon.id).padStart(3, '0')}</p>
                <h1 className="text-4xl md:text-5xl font-bold capitalize mb-2 text-white">{pokemon.name.replace(/-/g, ' ')}</h1>
                <p className="text-xl text-gray-300 italic">{speciesText}</p>
              </div>
              
              {/* Sprite Toggle Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={() => setIsShiny(false)}
                  style={!isShiny ? { backgroundColor: mainTypeColor.mainColor, color: mainTypeColor.textColor } : {}}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !isShiny ? '' : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setIsShiny(true)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isShiny ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  Shiny
                </button>
                <button
                  onClick={() => setIsAnimated(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !isAnimated ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  Static
                </button>
                <button
                  onClick={() => setIsAnimated(true)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isAnimated ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  Animated
                </button>
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
  // Gen 3 Contest Ribbons
  { id: 'cool-normal', name: 'Cool Ribbon', category: 'contest', description: 'Hoenn Cool Contest - Normal Rank Winner', game: 'gen3' },
  { id: 'cool-super', name: 'Cool Ribbon Super', category: 'contest', description: 'Hoenn Cool Contest - Super Rank Winner', game: 'gen3' },
  { id: 'cool-hyper', name: 'Cool Ribbon Hyper', category: 'contest', description: 'Hoenn Cool Contest - Hyper Rank Winner', game: 'gen3' },
  { id: 'cool-master', name: 'Cool Ribbon Master', category: 'contest', description: 'Hoenn Cool Contest - Master Rank Winner', game: 'gen3' },
  
  { id: 'beauty-normal', name: 'Beauty Ribbon', category: 'contest', description: 'Hoenn Beauty Contest - Normal Rank Winner', game: 'gen3' },
  { id: 'beauty-super', name: 'Beauty Ribbon Super', category: 'contest', description: 'Hoenn Beauty Contest - Super Rank Winner', game: 'gen3' },
  { id: 'beauty-hyper', name: 'Beauty Ribbon Hyper', category: 'contest', description: 'Hoenn Beauty Contest - Hyper Rank Winner', game: 'gen3' },
  { id: 'beauty-master', name: 'Beauty Ribbon Master', category: 'contest', description: 'Hoenn Beauty Contest - Master Rank Winner', game: 'gen3' },
  
  // Champion Ribbons
  { id: 'champion-hoenn', name: 'Champion Ribbon', category: 'champion', description: 'Ribbon for clearing the Pokémon League and entering the Hall of Fame in another region', game: 'gen3' },
  { id: 'champion-sinnoh', name: 'Sinnoh Champ Ribbon', category: 'champion', description: 'Ribbon awarded for beating the Sinnoh Champion and entering the Hall of Fame', game: 'gen4' },
  { id: 'champion-kalos', name: 'Kalos Champion Ribbon', category: 'champion', description: 'Ribbon for beating the Kalos Champion and entering the Kalos Hall of Fame', game: 'gen6' },
  { id: 'champion-alola', name: 'Alola Champion Ribbon', category: 'champion', description: 'Ribbon awarded for becoming the Alola Champion and entering the Alola Hall of Fame', game: 'gen7' },
  { id: 'champion-galar', name: 'Galar Champion Ribbon', category: 'champion', description: 'Ribbon awarded for becoming the Galar Champion and entering the Galar Hall of Fame', game: 'gen8' },
  
  // Battle Ribbons
  { id: 'winning', name: 'Winning Ribbon', category: 'battle', description: 'Ribbon awarded for clearing the Hoenn Battle Tower\'s Lv. 50 challenge', game: 'gen3' },
  { id: 'victory', name: 'Victory Ribbon', category: 'battle', description: 'Ribbon awarded for clearing the Hoenn Battle Tower\'s Lv. 100 challenge', game: 'gen3' },
  { id: 'battle-tower', name: 'Ability Ribbon', category: 'battle', description: 'A Ribbon awarded for defeating the Tower Tycoon at the Battle Tower', game: 'gen4' },
  { id: 'battle-tree-great', name: 'Battle Tree Great Ribbon', category: 'battle', description: 'A Ribbon awarded for winning against a Battle Legend in the Battle Tree', game: 'gen7' },
  { id: 'battle-tree-master', name: 'Battle Tree Master Ribbon', category: 'battle', description: 'A Ribbon awarded for winning against a Battle Legend in super battles in the Battle Tree', game: 'gen7' },
  { id: 'battle-royal-master', name: 'Battle Royal Master Ribbon', category: 'battle', description: 'A Ribbon that can be given to a Pokémon that has achieved victory in the Battle Royal', game: 'gen7' },
  { id: 'tower-master', name: 'Tower Master Ribbon', category: 'battle', description: 'A Ribbon awarded for winning against a champion in the Battle Tower', game: 'gen8' },
  
  // Special Ribbons
  { id: 'artist', name: 'Artist Ribbon', category: 'special', description: 'Ribbon awarded for being chosen as a super sketch model in Hoenn', game: 'gen3' },
  { id: 'effort', name: 'Effort Ribbon', category: 'special', description: 'Ribbon awarded for being an exceptionally hard worker', game: 'gen3' },
  { id: 'birthday', name: 'Birthday Ribbon', category: 'special', description: 'A Ribbon that commemorates a birthday', game: 'event' },
  { id: 'special', name: 'Special Ribbon', category: 'special', description: 'A special Ribbon for a special day', game: 'event' },
  { id: 'classic', name: 'Classic Ribbon', category: 'special', description: 'A Ribbon that proclaims love for Pokémon', game: 'event' },
  { id: 'event', name: 'Event Ribbon', category: 'special', description: 'A Ribbon awarded for participating in a special Pokémon event', game: 'event' },
  { id: 'gift', name: 'Souvenir Ribbon', category: 'special', description: 'A Ribbon for cherishing a special memory', game: 'event' },
  { id: 'wishing', name: 'Premier Ribbon', category: 'special', description: 'A Ribbon awarded for a special holiday', game: 'event' },
  
  // And many more based on your list...
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

// Icon mappings for all ribbons with standard ribbon fallback
const ribbonIcons = {
  // Gen 3 Contest Ribbons
  'cool-normal': { 
    icon: 'https://www.serebii.net/ribbons/coolnormalribbon.png', 
    color: '#FF4444',
    fallback: '🎀'  // Standard ribbon icon for all ribbons
  },
  'cool-super': { 
    icon: 'https://www.serebii.net/ribbons/coolsuperribbon.png', 
    color: '#FF4444',
    fallback: '🎀'  // Standard ribbon icon
  },
  'cool-hyper': { 
    icon: 'https://www.serebii.net/ribbons/coolhyperribbon.png', 
    color: '#FF4444',
    fallback: '🎀'
  },
  'cool-master': { 
    icon: 'https://www.serebii.net/ribbons/coolmasterribbon.png', 
    color: '#FF4444',
    fallback: '🎀'
  },
  'beauty-normal': { 
    icon: 'https://www.serebii.net/ribbons/beautynormalribbon.png', 
    color: '#FF88DD',
    fallback: '🎀'
  },
  'champion-hoenn': { 
    icon: 'https://www.serebii.net/ribbons/championribbon.png', 
    color: '#22AA44',
    fallback: '🎀'
  },
  // And more ribbon definitions...
};

// Icon mappings for all marks with standard X fallback
const markIcons = {
  'lunchtime': { 
    icon: 'https://www.serebii.net/ribbons/lunchtimemark.png', 
    color: '#FF9944',
    fallback: '❌'  // Standard X icon for all marks
  },
  'sleepy-time': { 
    icon: 'https://www.serebii.net/ribbons/sleepy-timemark.png', 
    color: '#99AAFF',
    fallback: '❌'  // Standard X icon
  },
  'dusk': { 
    icon: 'https://www.serebii.net/ribbons/duskmark.png', 
    color: '#9977CC',
    fallback: '❌'
  },
  'dawn': { 
    icon: 'https://www.serebii.net/ribbons/dawnmark.png', 
    color: '#FFBB77',
    fallback: '❌'
  },
  // And more mark definitions...
};

// Enhance the RibbonsTab component with filtering and pagination
const RibbonsTab = ({ pokemon, caughtStatus, updateRibbonStatus }) => {
  // State for filters and pagination
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  
  // Filter ribbons based on active filter and search query
  const filteredRibbons = pokemonRibbons.filter(ribbon => {
    const matchesFilter = activeFilter === 'all' || ribbon.category === activeFilter || ribbon.game === activeFilter;
    const matchesSearch = searchQuery === '' || 
      ribbon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ribbon.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  // Group filtered ribbons by category for better organization
  const ribbonsByCategory = filteredRibbons.reduce((acc, ribbon) => {
    if (!acc[ribbon.category]) {
      acc[ribbon.category] = [];
    }
    acc[ribbon.category].push(ribbon);
    return acc;
  }, {});
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredRibbons.length / itemsPerPage);
  
  // Get current page of ribbons
  const currentRibbons = filteredRibbons.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
  // State to track image loading errors
  const [failedImages, setFailedImages] = useState({});
  
  // Handle image loading errors
  const handleImageError = (ribbonId) => {
    setFailedImages(prev => ({ ...prev, [ribbonId]: true }));
  };
  
  const categoryNames = {
    'contest': 'Contest Ribbons',
    'champion': 'Champion Ribbons',
    'battle': 'Battle Ribbons',
    'special': 'Special Ribbons'
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Ribbon Collection</h2>
      <p className="text-gray-400 mb-4">Track the ribbons you've earned with this Pokémon.</p>
      
      <div className="space-y-6">
        {Object.keys(ribbonsByCategory).map(category => (
          <div key={category}>
            <h3 className="text-lg font-medium mb-3 border-b border-gray-700 pb-2">
              {categoryNames[category] || properCase(category)}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ribbonsByCategory[category].map(ribbon => {
                const iconData = ribbonIcons[ribbon.id] || { 
                  icon: 'https://www.serebii.net/ribbons/classicribbon.png', // Default icon
                  color: '#AA99CC', 
                  fallback: '🎀'  // Standard ribbon fallback
                };
                const hasRibbon = caughtStatus.ribbons?.[ribbon.id];
                const useIconFallback = failedImages[ribbon.id];
                
                return (
                  <button
                    key={ribbon.id}
                    onClick={() => updateRibbonStatus(ribbon.id, pokemon.name)}
                    className={`py-3 px-4 rounded-lg text-left transition-colors ${
                      hasRibbon 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-3 bg-gray-800"
                        style={{ 
                          border: `2px solid ${iconData.color}`
                        }}
                      >
                        {useIconFallback ? (
                          <span className="text-xl">{iconData.fallback}</span>
                        ) : (
                          <img 
                            src={iconData.icon} 
                            alt={ribbon.name}
                            className="w-9 h-9 object-contain"
                            onError={() => handleImageError(ribbon.id)}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{ribbon.name}</p>
                        {hasRibbon && (
                          <p className="text-xs opacity-80">Obtained</p>
                        )}
                      </div>
                      {hasRibbon && (
                        <span className="ml-2 text-xl">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Update the MarksTab component similarly
const MarksTab = ({ pokemon, caughtStatus, updateMarkStatus }) => {
  // State to track image loading errors
  const [failedImages, setFailedImages] = useState({});
  
  // Handle image loading errors
  const handleImageError = (markId) => {
    setFailedImages(prev => ({ ...prev, [markId]: true }));
  };
  
  // Group marks by category for better organization
  const marksByCategory = pokemonMarks.reduce((acc, mark) => {
    if (!acc[mark.category]) {
      acc[mark.category] = [];
    }
    acc[mark.category].push(mark);
    return acc;
  }, {});
  
  const categoryNames = {
    'personality': 'Personality Marks',
    'time': 'Time Marks',
    'weather': 'Weather Marks',
    'rare': 'Rare Marks'
  };
  
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-6">Mark Collection</h2>
      <p className="text-gray-400 mb-4">Track the marks you've found on this Pokémon.</p>
      
      <div className="space-y-6">
        {Object.keys(marksByCategory).map(category => (
          <div key={category}>
            <h3 className="text-lg font-medium mb-3 border-b border-gray-700 pb-2">
              {categoryNames[category] || properCase(category)}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {marksByCategory[category].map(mark => {
                const iconData = markIcons[mark.id] || { 
                  icon: 'https://www.serebii.net/ribbons/raremark.png', // Default icon
                  color: '#99CCFF', 
                  fallback: '❌'  // Standard X fallback
                };
                const hasMark = caughtStatus.marks?.[mark.id];
                const useIconFallback = failedImages[mark.id];
                
                return (
                  <button
                    key={mark.id}
                    onClick={() => updateMarkStatus(mark.id, pokemon.name)}
                    className={`py-3 px-4 rounded-lg text-left transition-colors ${
                      hasMark 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-3 bg-gray-800"
                        style={{ 
                          border: `2px solid ${iconData.color}`
                        }}
                      >
                        {useIconFallback ? (
                          <span className="text-xl">{iconData.fallback}</span>
                        ) : (
                          <img 
                            src={iconData.icon} 
                            alt={mark.name}
                            className="w-9 h-9 object-contain"
                            onError={() => handleImageError(mark.id)}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{mark.name}</p>
                        {hasMark && (
                          <p className="text-xs opacity-80">Found</p>
                        )}
                      </div>
                      {hasMark && (
                        <span className="ml-2 text-xl">✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
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
        
        {/* Tab Navigation - use the main type's theming with darker accents */}
        <div className="flex flex-wrap border-b border-gray-700 mb-6">
          {['info', 'stats', 'evolution', 'moves', 'locations', 'tracking', 'ribbons', 'marks'].map((tab) => {
            const isActive = activeTab === tab;
            
            // Create a style for active and inactive tabs
            const tabStyle = isActive 
              ? { 
                  backgroundColor: mainTypeColor.mainColor, 
                  color: mainTypeColor.textColor,
                  borderBottom: `3px solid ${mainTypeColor.darkColor}`
                }
              : { 
                  backgroundColor: mainTypeColor.darkColor,
                  color: mainTypeColor.textColor,
                  opacity: 0.7
                };
            
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`mr-2 px-4 py-2 rounded-t-lg transition-all hover:opacity-100`}
                style={tabStyle}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            );
          })}
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
                        weaknesses.map(type => (
                          <span 
                            key={type} 
                            className={`${typeColors[type]?.accent || 'bg-gray-600'} px-3 py-1 rounded-full text-sm capitalize`}
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-400">No specific weaknesses</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-medium mb-2">Resistances</h3>
                    <div className="flex flex-wrap gap-2">
                      {resistances.length > 0 ? (
                        resistances.map(type => (
                          <span 
                            key={type} 
                            className={`${typeColors[type]?.accent || 'bg-gray-600'} px-3 py-1 rounded-full text-sm capitalize`}
                          >
                            {type}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-400">No specific resistances</p>
                      )}
                    </div>
                  </div>
                  
                  {immunities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Immunities</h3>
                      <div className="flex flex-wrap gap-2">
                        {immunities.map(type => (
                          <span 
                            key={type} 
                            className={`${typeColors[type]?.accent || 'bg-gray-600'} px-3 py-1 rounded-full text-sm capitalize`}
                          >
                            {type}
                          </span>
                        ))}
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
              caughtStatus={caughtStatus} 
              updateRibbonStatus={updateRibbonStatus} 
            />
          </div>
        )}
        
        {activeTab === 'marks' && (
          <div style={cardStyle} className="rounded-lg p-6">
            <MarksTab 
              pokemon={pokemon} 
              caughtStatus={caughtStatus} 
              updateMarkStatus={updateMarkStatus} 
            />
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