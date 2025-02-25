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

// Add a comprehensive game version list with local image paths
const gameVersionImages = {
  // Gen 1
  'red': '/img/games/red.png',
  'blue': '/img/games/blue.png',
  'yellow': '/img/games/yellow.png',
  
  // Gen 2
  'gold': '/img/games/gold.png',
  'silver': '/img/games/silver.png',
  'crystal': '/img/games/crystal.png',
  
  // Gen 3
  'ruby': '/img/games/ruby.png',
  'sapphire': '/img/games/sapphire.png',
  'emerald': '/img/games/emerald.png',
  'firered': '/img/games/firered.png',
  'leafgreen': '/img/games/leafgreen.png',
  
  // Gen 4
  'diamond': '/img/games/diamond.png',
  'pearl': '/img/games/pearl.png',
  'platinum': '/img/games/platinum.png',
  'heartgold': '/img/games/heartgold.png',
  'soulsilver': '/img/games/soulsilver.png',
  
  // Gen 5
  'black': '/img/games/black.png',
  'white': '/img/games/white.png',
  'black-2': '/img/games/black2.png',
  'white-2': '/img/games/white2.png',
  
  // Gen 6
  'x': '/img/games/x.png',
  'y': '/img/games/y.png',
  'omega-ruby': '/img/games/omegaruby.png',
  'alpha-sapphire': '/img/games/alphasapphire.png',
  
  // Gen 7
  'sun': '/img/games/sun.png',
  'moon': '/img/games/moon.png',
  'ultra-sun': '/img/games/ultrasun.png',
  'ultra-moon': '/img/games/ultramoon.png',
  'lets-go-pikachu': '/img/games/letsgopikachu.png',
  'lets-go-eevee': '/img/games/letsgoeevee.png',
  
  // Gen 8
  'sword': '/img/games/sword.png',
  'shield': '/img/games/shield.png',
  'brilliant-diamond': '/img/games/brilliantdiamond.png',
  'shining-pearl': '/img/games/shiningpearl.png',
  'legends-arceus': '/img/games/legendsarceus.png',
  
  // Gen 9
  'scarlet': '/img/games/scarlet.png',
  'violet': '/img/games/violet.png',
  
  // Fallback image
  'default': '/img/pokeball.png'
};

// Update the GameCard component
const GameCard = ({ game, isSelected, onClick }) => (
  <div 
    onClick={onClick}
    className={`p-4 rounded-lg cursor-pointer transition-all ${
      isSelected ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
    }`}
  >
    <div className="flex items-center justify-center mb-2">
      <Image
        src={gameVersionImages[game.id] || gameVersionImages.default}
        alt={game.name}
        width={48}
        height={48}
        className="object-contain"
        unoptimized
      />
    </div>
    <p className="text-center text-sm font-medium">{game.name}</p>
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
const LocationEncounterData = ({ pokemonId }) => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pokemonId) {
      setIsLoading(false);
      return;
    }

    const fetchLocationData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }
        
        const data = await response.json();
        
        // Process the encounter data
        const processedLocations = data.map(location => {
          const locationName = location.location_area.name.replace(/-/g, ' ').replace(/area/gi, 'Area');
          
          // Group by game
          const gameVersions = location.version_details.map(detail => ({
            game: detail.version.name,
            maxChance: detail.max_chance,
            encounterDetails: detail.encounter_details.map(encounter => ({
              method: encounter.method.name.replace(/-/g, ' '),
              chance: encounter.chance,
              minLevel: encounter.min_level,
              maxLevel: encounter.max_level || encounter.min_level
            }))
          }));
          
          return {
            name: locationName,
            gameVersions
          };
        });
        
        setLocations(processedLocations);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching location data:', error);
        setError('Unable to load location data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchLocationData();
  }, [pokemonId]);

  if (isLoading) {
    return <div className="text-center py-8">Loading encounter locations...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (locations.length === 0) {
    return <div className="text-center py-8 text-gray-400">No encounter locations found for this Pokémon.</div>;
  }

  return (
    <div className="space-y-6">
      {locations.map((location, index) => (
        <div key={index} className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3 capitalize">{location.name}</h3>
          
          <div className="space-y-4">
            {location.gameVersions.map((gameVersion, gameIndex) => (
              <div key={gameIndex} className="border-t border-gray-600 pt-3">
                <h4 className="text-md font-medium capitalize mb-2">{gameVersion.game.replace(/-/g, ' ')}</h4>
                
                <div className="space-y-2">
                  {gameVersion.encounterDetails.map((encounter, encounterIndex) => (
                    <div key={encounterIndex} className="flex justify-between text-sm">
                      <div>
                        <span className="capitalize">{encounter.method}</span>
                        {encounter.minLevel === encounter.maxLevel ? 
                          <span className="ml-2">Level {encounter.minLevel}</span> : 
                          <span className="ml-2">Levels {encounter.minLevel}-{encounter.maxLevel}</span>
                        }
                      </div>
                      <div className="text-gray-300">{encounter.chance}% chance</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LocationEncounterData;
