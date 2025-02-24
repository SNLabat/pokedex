// components/LocationEncounterData.js
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// Replace Heroicons with simple SVG components
const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6-3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const LocationMarkerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const GameCard = ({ icon, name, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-lg cursor-pointer transition-all ${
      isSelected ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
    }`}
  >
    <div className="flex items-center justify-center mb-2">
      <Image
        src={icon}
        alt={name}
        width={48}
        height={48}
        className="object-contain"
      />
    </div>
    <p className="text-center text-sm font-medium">{name}</p>
  </div>
);

const EncounterMethod = ({ method, locations, isExpanded, onToggle, gameVersion }) => {
  const methodIcons = {
    'walk': '🚶‍♂️',
    'surf': '🏄‍♂️',
    'old-rod': '🎣',
    'good-rod': '🎣',
    'super-rod': '🎣',
    'rock-smash': '💥',
    'headbutt': '🌳',
    'grass': '🌿',
    'gift': '🎁',
    'trade': '🔄',
    'cave': '🕳️',
    'honey-tree': '🍯',
    'special': '✨',
    'fishing': '🎣',
    'roaming': '👣',
    'starter': '🏁',
    'fossil': '🦴',
    'swarm': '👥',
    'hidden': '👁️',
    'event': '🎉'
  };

  // Formatting for method names
  const formatMethodName = (method) => {
    return method
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get appropriate emoji
  const getMethodIcon = (method) => {
    return methodIcons[method] || '⚡';
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden mb-3">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <div className="flex items-center">
          <span className="text-xl mr-2">{getMethodIcon(method)}</span>
          <span className="font-medium">{formatMethodName(method)}</span>
        </div>
        <div className="text-sm bg-gray-900 px-2 py-1 rounded">
          {locations.length} location{locations.length !== 1 ? 's' : ''}
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-3">
          {locations.map((location, index) => (
            <div key={index} className="border border-gray-700 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-white">{location.name}</h4>
                {location.chance && (
                  <span className="text-sm bg-red-900 text-red-300 px-2 py-1 rounded">
                    {location.chance}% chance
                  </span>
                )}
              </div>
              
              {location.level && (
                <p className="text-gray-400 text-sm">
                  Level: {typeof location.level === 'object' 
                    ? `${location.level.min} - ${location.level.max}`
                    : location.level
                  }
                </p>
              )}
              
              {location.conditions && (
                <p className="text-gray-400 text-sm mt-1">
                  <span className="text-yellow-500">Conditions:</span> {location.conditions}
                </p>
              )}
              
              {location.games && location.games.includes(gameVersion) && (
                <p className="mt-2 text-xs text-green-400">Available in {gameVersion}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SeasonalVariation = ({ season, image, description }) => (
  <div className="bg-gray-800 rounded-lg p-3 space-y-2">
    <h4 className="font-medium text-center">{season}</h4>
    {image && (
      <div className="relative h-24 w-full">
        <Image
          src={image}
          alt={`${season} appearance`}
          layout="fill"
          objectFit="contain"
        />
      </div>
    )}
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

// Main component
const LocationEncounterData = ({ pokemon, theme }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [expandedMethod, setExpandedMethod] = useState(null);
  const [encounterData, setEncounterData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Replace with actual game data and icons
  const gameVersions = [
    { id: 'scarlet', name: 'Scarlet', icon: '/img/games/scarlet.png' },
    { id: 'violet', name: 'Violet', icon: '/img/games/violet.png' },
    { id: 'sword', name: 'Sword', icon: '/img/games/sword.png' },
    { id: 'shield', name: 'Shield', icon: '/img/games/shield.png' },
    { id: 'bdsp', name: 'BD/SP', icon: '/img/games/bdsp.png' },
    { id: 'arceus', name: 'Legends', icon: '/img/games/arceus.png' }
  ];

  // In a real application, you'd fetch this data from an API
  // For this example, I'm creating mock data based on the pokemon parameter
  useEffect(() => {
    // Simulate API request
    setLoading(true);
    setTimeout(() => {
      // Mock data - in a real app this would come from your API
      const mockEncounterData = generateMockEncounterData(pokemon);
      setEncounterData(mockEncounterData);
      
      // Set first game as selected if available
      if (mockEncounterData && Object.keys(mockEncounterData).length > 0) {
        setSelectedGame(Object.keys(mockEncounterData)[0]);
      }
      
      setLoading(false);
    }, 500);
  }, [pokemon]);

  const toggleMethod = (method) => {
    setExpandedMethod(expandedMethod === method ? null : method);
  };

  // Helper function to generate mock encounter data based on Pokémon
  function generateMockEncounterData(pokemon) {
    // This would be replaced with real data from your API
    const mockData = {
      'sword': {
        methods: {
          'grass': [
            {
              name: 'Route 1',
              chance: 20,
              level: { min: 2, max: 5 },
              conditions: 'Normal weather',
              games: ['sword', 'shield']
            },
            {
              name: 'Route 2',
              chance: 15,
              level: { min: 5, max: 8 },
              conditions: 'Normal weather',
              games: ['sword', 'shield']
            }
          ],
          'hidden': [
            {
              name: 'Glimwood Tangle',
              chance: 5,
              level: { min: 34, max: 36 },
              conditions: 'Hidden encounter',
              games: ['sword']
            }
          ]
        },
        exclusivity: pokemon.id % 2 === 0 ? 'Sword Exclusive' : null,
        evolutionRequirements: 'Level up during the day with high friendship'
      },
      'shield': {
        methods: {
          'grass': [
            {
              name: 'Route 1',
              chance: 20,
              level: { min: 2, max: 5 },
              conditions: 'Normal weather',
              games: ['sword', 'shield']
            },
            {
              name: 'Route 2',
              chance: 15,
              level: { min: 5, max: 8 },
              conditions: 'Normal weather',
              games: ['sword', 'shield']
            }
          ],
          'cave': [
            {
              name: 'Galar Mine',
              chance: 10,
              level: { min: 12, max: 15 },
              conditions: 'Normal encounter',
              games: ['shield']
            }
          ]
        },
        exclusivity: pokemon.id % 2 !== 0 ? 'Shield Exclusive' : null,
        evolutionRequirements: 'Level up during the night with high friendship'
      },
      'scarlet': {
        methods: {
          'walk': [
            {
              name: 'Area Zero',
              chance: 25,
              level: { min: 50, max: 55 },
              conditions: 'Normal encounter',
              games: ['scarlet', 'violet']
            }
          ],
          'special': [
            {
              name: 'Tera Raid Battles',
              level: 60,
              conditions: '5-star raid',
              games: ['scarlet']
            }
          ]
        },
        exclusivity: pokemon.id % 3 === 0 ? 'Scarlet Exclusive' : null,
        teraTypes: ['Normal', 'Fighting', 'Fire']
      }
    };
    
    // Randomly determine which games have this Pokémon
    const availableGames = {};
    gameVersions.forEach(game => {
      // 60% chance to be available in each game
      if (Math.random() > 0.4 || mockData[game.id]) {
        availableGames[game.id] = mockData[game.id] || {
          methods: {
            'special': [
              {
                name: 'Special encounter',
                level: 30,
                conditions: 'Special conditions apply',
                games: [game.id]
              }
            ]
          }
        };
      }
    });
    
    return Object.keys(availableGames).length > 0 ? availableGames : {
      'none': {
        methods: {},
        evolutionRequirements: 'This Pokémon cannot be caught in the wild',
        exclusivity: 'Not available in current games'
      }
    };
  }

  // Conditional render based on loading state
  if (loading) {
    return (
      <div className={`${theme.bg} bg-opacity-70 rounded-lg p-6 text-center`}>
        <p>Loading encounter data...</p>
      </div>
    );
  }

  // If no encounter data is available
  if (!encounterData || Object.keys(encounterData).length === 0) {
    return (
      <div className={`${theme.bg} bg-opacity-70 rounded-lg p-6`}>
        <div className="text-center py-8">
          <MapIcon />
          <h3 className="text-xl font-medium mb-2">No Encounter Data Available</h3>
          <p className="text-gray-400">
            This Pokémon might be obtained through special means like events, trading, or evolution.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${theme.bg} bg-opacity-70 rounded-lg p-6`}>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <LocationMarkerIcon />
        Location & Encounter Data
      </h2>
      
      {/* Game version selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Select Game Version</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {gameVersions.map(game => (
            <GameCard
              key={game.id}
              icon={game.icon}
              name={game.name}
              isSelected={selectedGame === game.id}
              onClick={() => encounterData[game.id] && setSelectedGame(game.id)}
            />
          ))}
        </div>
      </div>
      
      {/* Encounter methods for selected game */}
      {selectedGame && encounterData[selectedGame] && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Encounter Methods</h3>
            
            {/* Game exclusivity badge */}
            {encounterData[selectedGame].exclusivity && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                {encounterData[selectedGame].exclusivity}
              </span>
            )}
          </div>
          
          {Object.keys(encounterData[selectedGame].methods).length > 0 ? (
            <div>
              {Object.entries(encounterData[selectedGame].methods).map(([method, locations]) => (
                <EncounterMethod
                  key={method}
                  method={method}
                  locations={locations}
                  isExpanded={expandedMethod === method}
                  onToggle={() => toggleMethod(method)}
                  gameVersion={selectedGame}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <p className="text-gray-400">
                This Pokémon cannot be encountered in the wild in {selectedGame.charAt(0).toUpperCase() + selectedGame.slice(1)}.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Evolution requirements */}
      {selectedGame && encounterData[selectedGame].evolutionRequirements && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Evolution Requirements</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <p>{encounterData[selectedGame].evolutionRequirements}</p>
          </div>
        </div>
      )}
      
      {/* Tera Type information (for Scarlet/Violet) */}
      {selectedGame && (selectedGame === 'scarlet' || selectedGame === 'violet') && encounterData[selectedGame].teraTypes && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Available Tera Types</h3>
          <div className="flex flex-wrap gap-2">
            {encounterData[selectedGame].teraTypes.map(type => (
              <span 
                key={type}
                className="px-3 py-1 rounded-full text-sm font-medium bg-purple-700 text-white"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Seasonal variations (for Pokemon that change appearance) */}
      {pokemon.id === 585 || pokemon.id === 586 || pokemon.id === 421 || pokemon.id === 422 ? (
        <div>
          <h3 className="text-lg font-medium mb-3">Seasonal Forms</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SeasonalVariation
              season="Spring"
              image={`/img/forms/${pokemon.id}_spring.png`}
              description="Green foliage with pink flowers."
            />
            <SeasonalVariation
              season="Summer"
              image={`/img/forms/${pokemon.id}_summer.png`}
              description="Green foliage with no flowers."
            />
            <SeasonalVariation
              season="Autumn"
              image={`/img/forms/${pokemon.id}_autumn.png`}
              description="Orange-brown foliage."
            />
            <SeasonalVariation
              season="Winter"
              image={`/img/forms/${pokemon.id}_winter.png`}
              description="No foliage, covered in snow."
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LocationEncounterData;
