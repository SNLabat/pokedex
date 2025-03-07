// components/TeamBuilder.js
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { XCircleIcon, SaveIcon, PlusCircleIcon, ChartBarIcon, LightningBoltIcon, TrashIcon, DownloadIcon, SwitchHorizontalIcon, ShieldExclamationIcon, LightBulbIcon, ExclamationCircleIcon } from '@heroicons/react/outline';

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

// Matchup Analysis component
const MatchupAnalysis = ({ playerTeam, opponentTeam }) => {
  // Skip analysis if either team is empty
  if (!playerTeam.length || !opponentTeam.length) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <ShieldExclamationIcon className="h-5 w-5 mr-2" />
          Team Matchup Analysis
        </h3>
        <p className="text-gray-400">Add Pokémon to both teams to see matchup analysis</p>
      </div>
    );
  }

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

  // Calculate advantage scores for each team
  const calculateTeamAdvantage = () => {
    let playerScore = 0;
    let opponentScore = 0;
    
    // For each player Pokémon, check effectiveness against opponent team
    playerTeam.forEach(playerPokemon => {
      playerPokemon.types.forEach(attackType => {
        opponentTeam.forEach(opponentPokemon => {
          // Check if opponent is weak to this type
          opponentPokemon.types.forEach(defenseType => {
            if (typeEffectiveness[defenseType].weakTo.includes(attackType)) {
              playerScore += 1;
            }
            if (typeEffectiveness[defenseType].resistantTo.includes(attackType)) {
              playerScore -= 0.5;
            }
            if (typeEffectiveness[defenseType].immuneTo.includes(attackType)) {
              playerScore -= 1;
            }
          });
        });
      });
    });
    
    // For each opponent Pokémon, check effectiveness against player team
    opponentTeam.forEach(opponentPokemon => {
      opponentPokemon.types.forEach(attackType => {
        playerTeam.forEach(playerPokemon => {
          // Check if player is weak to this type
          playerPokemon.types.forEach(defenseType => {
            if (typeEffectiveness[defenseType].weakTo.includes(attackType)) {
              opponentScore += 1;
            }
            if (typeEffectiveness[defenseType].resistantTo.includes(attackType)) {
              opponentScore -= 0.5;
            }
            if (typeEffectiveness[defenseType].immuneTo.includes(attackType)) {
              opponentScore -= 1;
            }
          });
        });
      });
    });
    
    return { playerScore, opponentScore };
  };
  
  // Calculate win percentage based on advantage scores
  const calculateWinPercentage = () => {
    const { playerScore, opponentScore } = calculateTeamAdvantage();
    
    // Normalize scores to calculate win percentage
    const totalScore = Math.abs(playerScore) + Math.abs(opponentScore);
    if (totalScore === 0) return 50; // Equal teams
    
    // Calculate win percentage (capped between 10% and 90%)
    let winPercentage = 50 + ((playerScore - opponentScore) / totalScore) * 40;
    winPercentage = Math.min(90, Math.max(10, winPercentage));
    
    return Math.round(winPercentage);
  };
  
  // Find key matchup advantages
  const findKeyMatchups = () => {
    const advantageMatchups = [];
    const disadvantageMatchups = [];
    
    // Check each player Pokémon against opponent team
    playerTeam.forEach(playerPokemon => {
      opponentTeam.forEach(opponentPokemon => {
        let advantage = 0;
        
        // Check player's offensive advantage
        playerPokemon.types.forEach(attackType => {
          opponentPokemon.types.forEach(defenseType => {
            if (typeEffectiveness[defenseType].weakTo.includes(attackType)) {
              advantage += 1;
            }
            if (typeEffectiveness[defenseType].resistantTo.includes(attackType)) {
              advantage -= 0.5;
            }
            if (typeEffectiveness[defenseType].immuneTo.includes(attackType)) {
              advantage -= 1;
            }
          });
        });
        
        // Check opponent's offensive advantage
        opponentPokemon.types.forEach(attackType => {
          playerPokemon.types.forEach(defenseType => {
            if (typeEffectiveness[defenseType].weakTo.includes(attackType)) {
              advantage -= 1;
            }
            if (typeEffectiveness[defenseType].resistantTo.includes(attackType)) {
              advantage += 0.5;
            }
            if (typeEffectiveness[defenseType].immuneTo.includes(attackType)) {
              advantage += 1;
            }
          });
        });
        
        // Record significant advantages/disadvantages
        if (advantage >= 1.5) {
          advantageMatchups.push({
            player: playerPokemon,
            opponent: opponentPokemon,
            advantage: advantage
          });
        } else if (advantage <= -1.5) {
          disadvantageMatchups.push({
            player: playerPokemon,
            opponent: opponentPokemon,
            advantage: advantage
          });
        }
      });
    });
    
    // Sort by advantage magnitude
    advantageMatchups.sort((a, b) => b.advantage - a.advantage);
    disadvantageMatchups.sort((a, b) => a.advantage - b.advantage);
    
    return {
      advantages: advantageMatchups.slice(0, 3), // Top 3 advantages
      disadvantages: disadvantageMatchups.slice(0, 3) // Top 3 disadvantages
    };
  };
  
  const winPercentage = calculateWinPercentage();
  const keyMatchups = findKeyMatchups();
  
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <ShieldExclamationIcon className="h-5 w-5 mr-2" />
        Team Matchup Analysis
      </h3>
      
      <div className="space-y-4">
        {/* Win percentage meter */}
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Estimated Win Chance</h4>
          <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full ${winPercentage > 50 ? 'bg-green-600' : 'bg-red-600'}`}
              style={{ width: `${winPercentage}%` }}
            ></div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white font-medium">
              {winPercentage}%
            </div>
          </div>
        </div>
        
        {/* Key favorable matchups */}
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Favorable Matchups</h4>
          <div className="space-y-2">
            {keyMatchups.advantages.length > 0 ? (
              keyMatchups.advantages.map((matchup, idx) => (
                <div key={idx} className="bg-gray-700 rounded-md p-2 flex items-center">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={matchup.player.sprite || `/img/pokemon/${matchup.player.id}.png`}
                      alt={matchup.player.name}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="mx-2 text-green-400">vs</div>
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={matchup.opponent.sprite || `/img/pokemon/${matchup.opponent.id}.png`}
                      alt={matchup.opponent.name}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="ml-2 flex-grow">
                    <p className="text-xs capitalize">{matchup.player.name.replace('-', ' ')} strong against {matchup.opponent.name.replace('-', ' ')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-2">
                No significant favorable matchups found
              </div>
            )}
          </div>
        </div>
        
        {/* Key unfavorable matchups */}
        <div>
          <h4 className="text-sm text-gray-400 mb-1">Unfavorable Matchups</h4>
          <div className="space-y-2">
            {keyMatchups.disadvantages.length > 0 ? (
              keyMatchups.disadvantages.map((matchup, idx) => (
                <div key={idx} className="bg-gray-700 rounded-md p-2 flex items-center">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={matchup.player.sprite || `/img/pokemon/${matchup.player.id}.png`}
                      alt={matchup.player.name}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="mx-2 text-red-400">vs</div>
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={matchup.opponent.sprite || `/img/pokemon/${matchup.opponent.id}.png`}
                      alt={matchup.opponent.name}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="ml-2 flex-grow">
                    <p className="text-xs capitalize">{matchup.player.name.replace('-', ' ')} weak against {matchup.opponent.name.replace('-', ' ')}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-2">
                No significant unfavorable matchups found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Team Suggestions component
const TeamSuggestions = ({ team, pokemonList, opponentTeam = [] }) => {
  if (!team.length || !pokemonList.length) {
    return null;
  }

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

  // All Pokémon types
  const allTypes = Object.keys(typeEffectiveness);

  // Find type coverage gaps
  const findTypeCoverageGaps = () => {
    // Initialize coverage for all types
    const typeCoverage = {};
    allTypes.forEach(type => {
      typeCoverage[type] = 0;
    });

    // Calculate current coverage
    team.forEach(pokemon => {
      pokemon.types.forEach(attackType => {
        allTypes.forEach(defenseType => {
          if (typeEffectiveness[defenseType].weakTo.includes(attackType)) {
            typeCoverage[defenseType]++;
          }
        });
      });
    });

    // Find types with no coverage
    const uncoveredTypes = Object.entries(typeCoverage)
      .filter(([_, count]) => count === 0)
      .map(([type]) => type);

    return uncoveredTypes;
  };

  // Find team weaknesses
  const findTeamWeaknesses = () => {
    // Initialize weakness counter for all types
    const weaknessCount = {};
    allTypes.forEach(type => {
      weaknessCount[type] = 0;
    });

    // Count how many Pokémon are weak to each type
    team.forEach(pokemon => {
      pokemon.types.forEach(pokeType => {
        if (typeEffectiveness[pokeType].weakTo) {
          typeEffectiveness[pokeType].weakTo.forEach(weakType => {
            weaknessCount[weakType]++;
          });
        }
      });
    });

    // Find significant weaknesses (more than half the team is weak to)
    const significantWeaknesses = Object.entries(weaknessCount)
      .filter(([_, count]) => count >= Math.ceil(team.length / 2))
      .map(([type]) => type)
      .sort((a, b) => weaknessCount[b] - weaknessCount[a]);

    return significantWeaknesses;
  };

  // Find Pokémon that could address gaps or weaknesses
  const findRecommendedPokemon = () => {
    const uncoveredTypes = findTypeCoverageGaps();
    const significantWeaknesses = findTeamWeaknesses();
    
    // Pokémon already in the team (to avoid recommending duplicates)
    const teamPokemonIds = team.map(p => p.id);
    
    // Find Pokémon that cover gaps
    const gapFillers = [];
    
    if (uncoveredTypes.length > 0 || significantWeaknesses.length > 0) {
      // Score each Pokémon in the list based on how well it addresses gaps and weaknesses
      const scoredPokemon = pokemonList
        .filter(p => !teamPokemonIds.includes(p.id)) // Exclude Pokémon already in team
        .map(pokemon => {
          let score = 0;
          
          // Score for covering uncovered types
          pokemon.types.forEach(type => {
            uncoveredTypes.forEach(uncoveredType => {
              if (typeEffectiveness[uncoveredType].weakTo.includes(type)) {
                score += 2; // Higher score for covering a gap
              }
            });
          });
          
          // Score for resisting team weaknesses
          pokemon.types.forEach(type => {
            significantWeaknesses.forEach(weakness => {
              if (typeEffectiveness[type].resistantTo.includes(weakness)) {
                score += 1; // Score for resisting a weakness
              }
              if (typeEffectiveness[type].immuneTo.includes(weakness)) {
                score += 2; // Higher score for immunity
              }
            });
          });
          
          // If opponent team exists, score for effectiveness against it
          if (opponentTeam.length > 0) {
            opponentTeam.forEach(opponent => {
              opponent.types.forEach(oppType => {
                pokemon.types.forEach(type => {
                  if (typeEffectiveness[oppType].weakTo.includes(type)) {
                    score += 0.5; // Small bonus for being effective against opponent
                  }
                });
              });
            });
          }
          
          return { pokemon, score };
        })
        .filter(item => item.score > 0) // Only include Pokémon with positive scores
        .sort((a, b) => b.score - a.score); // Sort by score descending
      
      // Take top recommendations
      return scoredPokemon.slice(0, 5);
    }
    
    return gapFillers;
  };

  // Find Pokémon that could be replaced
  const findReplaceablePokemon = () => {
    if (team.length < 2) return []; // Need at least 2 Pokémon to suggest replacements
    
    // Calculate type overlap within the team
    const typeOverlap = {};
    team.forEach(pokemon => {
      pokemon.types.forEach(type => {
        typeOverlap[type] = (typeOverlap[type] || 0) + 1;
      });
    });
    
    // Find Pokémon with overlapping types that could potentially be replaced
    const replacementCandidates = team.map(pokemon => {
      let overlapScore = 0;
      let weaknessScore = 0;
      
      // Score based on type overlap
      pokemon.types.forEach(type => {
        if (typeOverlap[type] > 1) {
          overlapScore += typeOverlap[type] - 1;
        }
      });
      
      // Score based on weaknesses to common types
      const commonWeaknesses = findTeamWeaknesses();
      pokemon.types.forEach(type => {
        commonWeaknesses.forEach(weakness => {
          if (typeEffectiveness[type].weakTo.includes(weakness)) {
            weaknessScore += 1;
          }
        });
      });
      
      // Calculate total replacement score
      const totalScore = overlapScore + weaknessScore;
      
      return { pokemon, score: totalScore };
    })
    .filter(item => item.score > 0) // Only include Pokémon with positive scores
    .sort((a, b) => b.score - a.score); // Sort by score descending
    
    return replacementCandidates.slice(0, 2); // Return top 2 candidates
  };

  const uncoveredTypes = findTypeCoverageGaps();
  const significantWeaknesses = findTeamWeaknesses();
  const recommendedPokemon = findRecommendedPokemon();
  const replaceablePokemon = findReplaceablePokemon();

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3 flex items-center">
        <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-400" />
        Team Improvement Suggestions
      </h3>
      
      <div className="space-y-4">
        {/* Type coverage gaps */}
        {uncoveredTypes.length > 0 && (
          <div>
            <h4 className="text-sm text-gray-400 mb-1">Type Coverage Gaps</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {uncoveredTypes.map(type => (
                <span 
                  key={type}
                  className={`px-2 py-1 rounded-md text-xs capitalize ${getTypeBackgroundClass(type)}`}
                >
                  {type}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Your team doesn't have moves that are super effective against these types.
            </p>
          </div>
        )}
        
        {/* Team weaknesses */}
        {significantWeaknesses.length > 0 && (
          <div>
            <h4 className="text-sm text-gray-400 mb-1">Common Team Weaknesses</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {significantWeaknesses.map(type => (
                <div 
                  key={type}
                  className={`px-2 py-1 rounded-md text-xs flex items-center ${getTypeBackgroundClass(type)}`}
                >
                  <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                  <span className="capitalize">{type}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              Multiple Pokémon on your team are weak to these types.
            </p>
          </div>
        )}
        
        {/* Recommended Pokémon */}
        {recommendedPokemon.length > 0 && (
          <div>
            <h4 className="text-sm text-gray-400 mb-1">Recommended Additions</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {recommendedPokemon.map(({ pokemon, score }) => (
                <div key={pokemon.id} className="bg-gray-700 rounded-lg p-2 text-center">
                  <div className="relative w-12 h-12 mx-auto">
                    <Image
                      src={pokemon.sprite || `/img/pokemon/${pokemon.id}.png`}
                      alt={pokemon.name}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <p className="text-xs mt-1 capitalize">{pokemon.name.replace('-', ' ')}</p>
                  <div className="flex flex-wrap justify-center gap-1 mt-1">
                    {pokemon.types.map(type => (
                      <span 
                        key={type} 
                        className={`px-1 py-0.5 rounded-full text-xs capitalize ${getTypeBackgroundClass(type)}`}
                        style={{ fontSize: '0.65rem' }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Replaceable Pokémon */}
        {replaceablePokemon.length > 0 && (
          <div>
            <h4 className="text-sm text-gray-400 mb-1">Consider Replacing</h4>
            <div className="grid grid-cols-2 gap-2">
              {replaceablePokemon.map(({ pokemon, score }) => (
                <div key={pokemon.id} className="bg-gray-700 rounded-lg p-2 flex items-center">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image
                      src={pokemon.sprite || `/img/pokemon/${pokemon.id}.png`}
                      alt={pokemon.name}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs capitalize">{pokemon.name.replace('-', ' ')}</p>
                    <p className="text-xs text-gray-400">
                      {pokemon.types.some(type => significantWeaknesses.includes(type)) 
                        ? 'Shares team weakness' 
                        : 'Type overlap with team'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* No issues found */}
        {uncoveredTypes.length === 0 && significantWeaknesses.length === 0 && (
          <p className="text-sm text-green-400">
            Your team has good type coverage and no significant weaknesses!
          </p>
        )}
      </div>
    </div>
  );
};

// Main team builder component
const TeamBuilder = ({ pokemonList = [] }) => {
  const [team, setTeam] = useState(Array(6).fill(null));
  const [opponentTeam, setOpponentTeam] = useState(Array(6).fill(null));
  const [savedTeams, setSavedTeams] = useState([]);
  const [teamName, setTeamName] = useState('My Team');
  const [showPokemonList, setShowPokemonList] = useState(false);
  const [addingToOpponent, setAddingToOpponent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedPokemon, setDraggedPokemon] = useState(null);
  const [activeTeamTab, setActiveTeamTab] = useState('player'); // 'player' or 'opponent'
  const [showSuggestions, setShowSuggestions] = useState(false);
  
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
  
  // Delete a saved team
  const deleteTeam = (teamId) => {
    if (confirm("Are you sure you want to delete this team?")) {
      const updatedTeams = savedTeams.filter(team => team.id !== teamId);
      setSavedTeams(updatedTeams);
      localStorage.setItem('savedTeams', JSON.stringify(updatedTeams));
    }
  };
  
  // Export team to CSV
  const exportTeamToCSV = (savedTeam) => {
    try {
      // Build CSV header
      const headers = ['ID', 'Name', 'Types'];
      
      // Build CSV content from team Pokémon
      const csvContent = savedTeam.pokemon
        .filter(Boolean)
        .map(pokemon => {
          const row = [
            pokemon.id,
            pokemon.name,
            pokemon.types.join('/')
          ];
          return row.join(',');
        });
      
      // Combine header and rows
      const csvData = [
        `Team: ${savedTeam.name}`,
        headers.join(','),
        ...csvContent
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link for download
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${savedTeam.name.replace(/\s+/g, '-')}_team.csv`);
      
      // Trigger download and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting team to CSV:', error);
      alert('Failed to export team. Please try again.');
    }
  };
  
  // Remove Pokemon from team
  const removePokemon = (index) => {
    if (activeTeamTab === 'player') {
      const newTeam = [...team];
      newTeam[index] = null;
      setTeam(newTeam);
    } else {
      const newOpponentTeam = [...opponentTeam];
      newOpponentTeam[index] = null;
      setOpponentTeam(newOpponentTeam);
    }
  };
  
  // Add Pokemon to team
  const addPokemon = (pokemon) => {
    if (addingToOpponent) {
      const emptyIndex = opponentTeam.findIndex(slot => slot === null);
      if (emptyIndex !== -1) {
        const newTeam = [...opponentTeam];
        newTeam[emptyIndex] = pokemon;
        setOpponentTeam(newTeam);
      }
    } else {
      const emptyIndex = team.findIndex(slot => slot === null);
      if (emptyIndex !== -1) {
        const newTeam = [...team];
        newTeam[emptyIndex] = pokemon;
        setTeam(newTeam);
      }
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
    
    if (activeTeamTab === 'player') {
      const newTeam = [...team];
      const temp = newTeam[draggedPokemon];
      newTeam[draggedPokemon] = newTeam[dropIndex];
      newTeam[dropIndex] = temp;
      setTeam(newTeam);
    } else {
      const newTeam = [...opponentTeam];
      const temp = newTeam[draggedPokemon];
      newTeam[draggedPokemon] = newTeam[dropIndex];
      newTeam[dropIndex] = temp;
      setOpponentTeam(newTeam);
    }
    
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
      
      {/* Team tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium ${activeTeamTab === 'player' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTeamTab('player')}
        >
          Your Team
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTeamTab === 'opponent' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTeamTab('opponent')}
        >
          Opponent Team
        </button>
      </div>
      
      {/* Team slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {activeTeamTab === 'player' ? (
          team.map((pokemon, index) => (
            <TeamSlot
              key={index}
              pokemon={pokemon}
              index={index}
              onRemove={removePokemon}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))
        ) : (
          opponentTeam.map((pokemon, index) => (
            <TeamSlot
              key={index}
              pokemon={pokemon}
              index={index}
              onRemove={removePokemon}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))
        )}
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={() => {
            setAddingToOpponent(activeTeamTab === 'opponent');
            setShowPokemonList(!showPokemonList);
          }}
          className={`${activeTeamTab === 'player' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg flex items-center`}
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          {showPokemonList ? 'Hide Pokémon List' : `Add Pokémon to ${activeTeamTab === 'player' ? 'Your' : 'Opponent'} Team`}
        </button>
        
        {activeTeamTab === 'player' && team.some(Boolean) && (
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <LightBulbIcon className="h-5 w-5 mr-2" />
            {showSuggestions ? 'Hide Suggestions' : 'Get Team Suggestions'}
          </button>
        )}
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
      
      {/* Team suggestions */}
      {showSuggestions && activeTeamTab === 'player' && team.some(Boolean) && (
        <div className="mb-6">
          <TeamSuggestions 
            team={team.filter(Boolean)} 
            pokemonList={pokemonList}
            opponentTeam={opponentTeam.filter(Boolean)}
          />
        </div>
      )}
      
      {/* Team stats and matchup analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Your team stats */}
        {team.some(Boolean) && (
          <div>
            <h3 className="text-lg font-medium mb-2 text-red-500">Your Team Analysis</h3>
            <TeamStats team={team.filter(Boolean)} />
          </div>
        )}
        
        {/* Opponent team stats */}
        {opponentTeam.some(Boolean) && (
          <div>
            <h3 className="text-lg font-medium mb-2 text-blue-500">Opponent Team Analysis</h3>
            <TeamStats team={opponentTeam.filter(Boolean)} />
          </div>
        )}
      </div>
      
      {/* Matchup analysis */}
      {team.some(Boolean) && opponentTeam.some(Boolean) && (
        <div className="mb-6">
          <MatchupAnalysis 
            playerTeam={team.filter(Boolean)} 
            opponentTeam={opponentTeam.filter(Boolean)} 
          />
        </div>
      )}
      
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
                <div className="flex justify-end mt-2 gap-2">
                  <button
                    onClick={() => exportTeamToCSV(savedTeam)}
                    className="text-sm text-green-400 hover:text-green-300 flex items-center"
                  >
                    <DownloadIcon className="h-4 w-4 mr-1" />
                    Export
                  </button>
                  <button
                    onClick={() => {
                      if (activeTeamTab === 'player') {
                        setTeam(savedTeam.pokemon);
                      } else {
                        setOpponentTeam(savedTeam.pokemon);
                      }
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <SwitchHorizontalIcon className="h-4 w-4 mr-1" />
                    Load to {activeTeamTab === 'player' ? 'Your' : 'Opponent'} Team
                  </button>
                  <button 
                    onClick={() => deleteTeam(savedTeam.id)}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete
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
