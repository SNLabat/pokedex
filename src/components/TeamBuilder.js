// components/TeamBuilder.js
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { XCircleIcon, SaveIcon, PlusCircleIcon, ChartBarIcon, LightningBoltIcon } from '@heroicons/react/outline';

// Component for a single team slot
const TeamSlot = ({ pokemon, onRemove, index, onDragStart, onDragOver, onDrop }) => {
  if (!pokemon) {
    return (
      <div 
        className="w-full h-28 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-800 cursor-pointer"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, index)}
      >
        <span className="text-gray-500">Empty Slot</span>
      </div>
    );
  }

  return (
    <div 
      className="w-full bg-gray-800 rounded-lg p-2 flex items-center relative transition-all hover:bg-gray-700"
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={pokemon.sprite || `/img/pokemon/${pokemon.id}.png`}
          alt={pokemon.name}
          layout="fill"
          objectFit="contain"
          className="drop-shadow-md"
        />
      </div>
      <div className="ml-3 flex-grow">
        <div className="flex items-center">
          <p className="font-medium text-lg capitalize">{pokemon.name.replace('-', ' ')}</p>
          <p className="text-red-400 text-sm ml-2">#{pokemon.id.toString().padStart(3, '0')}</p>
        </div>
        <div className="flex gap-1">
          {pokemon.types.map((type) => (
            <span 
              key={type} 
              className={`px-2 py-0.5 rounded-full text-xs capitalize ${getTypeBackgroundClass(type)}`}
            >
              {type}
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 text-gray-400 hover:text-white"
      >
        <XCircleIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

// Helper function to get type background classes
const getTypeBackgroundClass = (type) => {
  const typeClasses = {
    normal: 'bg-gray-400 text-gray-800',
    fire: 'bg-orange-500 text-white',
    water: 'bg-blue-500 text-white',
    electric: 'bg-yellow-400 text-gray-900',
    grass: 'bg-green-500 text-white',
    ice: 'bg-cyan-300 text-gray-900',
    fighting: 'bg-red-600 text-white',
    poison: 'bg-purple-500 text-white',
    ground: 'bg-amber-600 text-white',
    flying: 'bg-indigo-400 text-white',
    psychic: 'bg-pink-500 text-white',
    bug: 'bg-lime-500 text-white',
    rock: 'bg-stone-500 text-white',
    ghost: 'bg-purple-700 text-white',
    dragon: 'bg-violet-600 text-white',
    dark: 'bg-gray-700 text-white',
    steel: 'bg-slate-400 text-white',
    fairy: 'bg-pink-300 text-gray-900'
  };
  
  return typeClasses[type] || 'bg-gray-500 text-white';
};

// Team statistics component
const TeamStats = ({ team }) => {
  // Calculate team stats
  const calculateStats = () => {
    if (!team.length) return null;
    
    // Type distribution
    const typeCount = {};
    let totalTypes = 0;
    
    team.forEach(pokemon => {
      if (!pokemon) return;
      
      pokemon.types.forEach(type => {
        typeCount[type] = (typeCount[type] || 0) + 1;
        totalTypes++;
      });
    });
    
    // Type effectiveness data
    const typeEffectiveness = {
      normal: { 
        weakTo: ['fighting'], 
        resistantTo: [], 
        immuneTo: ['ghost'] 
      },
      fire: { 
        weakTo: ['water', 'ground', 'rock'], 
        resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], 
        immuneTo: [] 
      },
      water: { 
        weakTo: ['electric', 'grass'], 
        resistantTo: ['fire', 'water', 'ice', 'steel'], 
        immuneTo: [] 
      },
      electric: { 
        weakTo: ['ground'], 
        resistantTo: ['electric', 'flying', 'steel'], 
        immuneTo: [] 
      },
      grass: { 
        weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'], 
        resistantTo: ['water', 'electric', 'grass', 'ground'], 
        immuneTo: [] 
      },
      ice: { 
        weakTo: ['fire', 'fighting', 'rock', 'steel'], 
        resistantTo: ['ice'], 
        immuneTo: [] 
      },
      fighting: { 
        weakTo: ['flying', 'psychic', 'fairy'], 
        resistantTo: ['bug', 'rock', 'dark'], 
        immuneTo: [] 
      },
      poison: { 
        weakTo: ['ground', 'psychic'], 
        resistantTo: ['grass', 'fighting', 'poison', 'bug', 'fairy'], 
        immuneTo: [] 
      },
      ground: { 
        weakTo: ['water', 'grass', 'ice'], 
        resistantTo: ['poison', 'rock'], 
        immuneTo: ['electric'] 
      },
      flying: { 
        weakTo: ['electric', 'ice', 'rock'], 
        resistantTo: ['grass', 'fighting', 'bug'], 
        immuneTo: ['ground'] 
      },
      psychic: { 
        weakTo: ['bug', 'ghost', 'dark'], 
        resistantTo: ['fighting', 'psychic'], 
        immuneTo: [] 
      },
      bug: { 
        weakTo: ['fire', 'flying', 'rock'], 
        resistantTo: ['grass', 'fighting', 'ground'], 
        immuneTo: [] 
      },
      rock: { 
        weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'], 
        resistantTo: ['normal', 'fire', 'poison', 'flying'], 
        immuneTo: [] 
      },
      ghost: { 
        weakTo: ['ghost', 'dark'], 
        resistantTo: ['poison', 'bug'], 
        immuneTo: ['normal', 'fighting'] 
      },
      dragon: { 
        weakTo: ['ice', 'dragon', 'fairy'], 
        resistantTo: ['fire', 'water', 'electric', 'grass'], 
        immuneTo: [] 
      },
      dark: { 
        weakTo: ['fighting', 'bug', 'fairy'], 
        resistantTo: ['ghost', 'dark'], 
        immuneTo: ['psychic'] 
      },
      steel: { 
        weakTo: ['fire', 'fighting', 'ground'], 
        resistantTo: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], 
        immuneTo: ['poison'] 
      },
      fairy: { 
        weakTo: ['poison', 'steel'], 
        resistantTo: ['fighting', 'bug', 'dark'], 
        immuneTo: ['dragon'] 
      }
    };
    
    // Calculate offensive coverage
    const offensiveCoverage = {};
    const allTypes = Object.keys(typeEffectiveness);
    
    // Initialize all types with 0 effectiveness
    allTypes.forEach(type => {
      offensiveCoverage[type] = 0;
    });
    
    // For each Pokémon in the team
    team.forEach(pokemon => {
      if (!pokemon) return;
      
      // For each type the Pokémon has
      pokemon.types.forEach(pokeType => {
        // Find which types this Pokémon is super effective against
        allTypes.forEach(defenderType => {
          if (typeEffectiveness[defenderType].weakTo.includes(pokeType)) {
            offensiveCoverage[defenderType]++;
          }
        });
      });
    });
    
    // Calculate defensive weaknesses
    const defensiveWeaknesses = {};
    
    // Initialize all types with 0 weakness count
    allTypes.forEach(type => {
      defensiveWeaknesses[type] = 0;
    });
    
    // For each Pokémon in the team
    team.forEach(pokemon => {
      if (!pokemon) return;
      
      // For each attacking type
      allTypes.forEach(attackingType => {
        // Check if this Pokémon is weak to the attacking type
        let isWeak = false;
        let isImmune = false;
        let isResistant = false;
        
        // Check each of the Pokémon's types
        pokemon.types.forEach(pokeType => {
          if (typeEffectiveness[pokeType].weakTo.includes(attackingType)) {
            isWeak = true;
          }
          if (typeEffectiveness[pokeType].immuneTo.includes(attackingType)) {
            isImmune = true;
          }
          if (typeEffectiveness[pokeType].resistantTo.includes(attackingType)) {
            isResistant = true;
          }
        });
        
        // If the Pokémon is weak to this type and not immune
        if (isWeak && !isImmune && !isResistant) {
          defensiveWeaknesses[attackingType]++;
        }
      });
    });
    
    // Sort offensive coverage and defensive weaknesses
    const sortedOffensive = Object.entries(offensiveCoverage)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
    
    const sortedWeaknesses = Object.entries(defensiveWeaknesses)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
    
    return {
      typeCount,
      typePercentages: Object.fromEntries(
        Object.entries(typeCount).map(([type, count]) => 
          [type, (count / totalTypes) * 100]
        )
      ),
      offensiveCoverage: sortedOffensive,
      defensiveWeaknesses: sortedWeaknesses
    };
  };
  
  const stats = calculateStats();
  
  if (!stats) return null;
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <ChartBarIcon className="h-5 w-5 mr-2" />
        Team Analysis
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Type Distribution</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.typeCount).map(([type, count]) => (
              <div 
                key={type}
                className={`px-2 py-1 rounded-md text-xs flex items-center ${getTypeBackgroundClass(type)}`}
              >
                <span className="capitalize">{type}</span>
                <span className="ml-1 font-medium">×{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Offensive Coverage</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {stats.offensiveCoverage.length > 0 ? (
              stats.offensiveCoverage.slice(0, 8).map(([type, count]) => (
                <div key={type} className={`p-2 rounded-md text-xs flex items-center justify-between ${getTypeBackgroundClass(type)}`}>
                  <span className="capitalize">{type}</span>
                  <span className="font-medium">{count} Pokémon</span>
                </div>
              ))
            ) : (
              <div className="col-span-full text-gray-500 text-center py-2">
                Add Pokémon to see offensive coverage
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Team Weaknesses</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {stats.defensiveWeaknesses.length > 0 ? (
              stats.defensiveWeaknesses.slice(0, 8).map(([type, count]) => (
                <div key={type} className={`p-2 rounded-md text-xs flex items-center justify-between ${getTypeBackgroundClass(type)}`}>
                  <span className="capitalize">{type}</span>
                  <span className="font-medium">{count} Pokémon</span>
                </div>
              ))
            ) : (
              <div className="col-span-full text-gray-500 text-center py-2">
                Add Pokémon to see team weaknesses
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main team builder component
const TeamBuilder = ({ pokemonList = [] }) => {
  const [team, setTeam] = useState(Array(6).fill(null));
  const [savedTeams, setSavedTeams] = useState([]);
  const [teamName, setTeamName] = useState('My Team');
  const [showPokemonList, setShowPokemonList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedPokemon, setDraggedPokemon] = useState(null);
  
  // Load saved teams from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedTeams');
    if (saved) {
      setSavedTeams(JSON.parse(saved));
    }
  }, []);
  
  // Save teams to localStorage
  const saveTeam = () => {
    if (team.filter(Boolean).length === 0) return;
    
    const newTeam = {
      id: Date.now(),
      name: teamName,
      pokemon: team
    };
    
    const updatedTeams = [...savedTeams, newTeam];
    setSavedTeams(updatedTeams);
    localStorage.setItem('savedTeams', JSON.stringify(updatedTeams));
  };
  
  // Remove Pokemon from team
  const removePokemon = (index) => {
    const newTeam = [...team];
    newTeam[index] = null;
    setTeam(newTeam);
  };
  
  // Add Pokemon to team
  const addPokemon = (pokemon) => {
    const emptyIndex = team.findIndex(slot => slot === null);
    if (emptyIndex !== -1) {
      const newTeam = [...team];
      newTeam[emptyIndex] = pokemon;
      setTeam(newTeam);
    }
    setShowPokemonList(false);
  };
  
  // Handle drag and drop
  const handleDragStart = (e, index) => {
    setDraggedPokemon(index);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedPokemon === null) return;
    
    const newTeam = [...team];
    const temp = newTeam[draggedPokemon];
    newTeam[draggedPokemon] = newTeam[dropIndex];
    newTeam[dropIndex] = temp;
    
    setTeam(newTeam);
    setDraggedPokemon(null);
  };
  
  // Filter Pokemon list
  const filteredPokemon = searchTerm
    ? pokemonList.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
      )
    : pokemonList;
  
  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <LightningBoltIcon className="h-6 w-6 mr-2 text-yellow-400" />
          Team Builder
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Team Name"
          />
          <button
            onClick={saveTeam}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center"
          >
            <SaveIcon className="h-5 w-5 mr-1" />
            Save
          </button>
        </div>
      </div>
      
      {/* Team slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {team.map((pokemon, index) => (
          <TeamSlot
            key={index}
            pokemon={pokemon}
            index={index}
            onRemove={removePokemon}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
      
      {/* Add Pokemon button */}
      <div className="mb-6">
        <button
          onClick={() => setShowPokemonList(!showPokemonList)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          {showPokemonList ? 'Hide Pokémon List' : 'Add Pokémon'}
        </button>
      </div>
      
      {/* Pokemon selection list */}
      {showPokemonList && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Search Pokémon..."
            />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-2">
            {filteredPokemon.map(pokemon => (
              <div
                key={pokemon.id}
                onClick={() => addPokemon(pokemon)}
                className="bg-gray-700 rounded-lg p-2 text-center cursor-pointer hover:bg-gray-600 transition-colors"
              >
                <div className="relative w-16 h-16 mx-auto">
                  <Image
                    src={pokemon.sprite || `/img/pokemon/${pokemon.id}.png`}
                    alt={pokemon.name}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <p className="text-sm mt-1 capitalize">{pokemon.name.replace('-', ' ')}</p>
                <p className="text-xs text-red-400">#{pokemon.id.toString().padStart(3, '0')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Team stats */}
      {team.some(Boolean) && <TeamStats team={team.filter(Boolean)} />}
      
      {/* Saved teams */}
      {savedTeams.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-medium mb-4">Saved Teams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedTeams.map(savedTeam => (
              <div key={savedTeam.id} className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-lg mb-2">{savedTeam.name}</h4>
                <div className="flex flex-wrap gap-2">
                  {savedTeam.pokemon.filter(Boolean).map((pokemon, idx) => (
                    <div key={idx} className="relative w-12 h-12">
                      <Image
                        src={pokemon.sprite || `/img/pokemon/${pokemon.id}.png`}
                        alt={pokemon.name}
                        layout="fill"
                        objectFit="contain"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => setTeam(savedTeam.pokemon)}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    Load
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamBuilder;
