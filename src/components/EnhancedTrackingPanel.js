// components/EnhancedTrackingPanel.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import OriginMarks from './OriginMarks';
import TrackingOption from './TrackingOption';
import Image from 'next/image';

// Replace Heroicons with simple SVG components
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// Sprite component for visual selection
const SpriteSelector = ({ src, alt, label, isSelected, onClick, disabled = false }) => {
  const [isError, setIsError] = useState(false);
  
  return (
    <div 
      className={`relative flex flex-col items-center p-2 rounded-lg transition-all cursor-pointer
        ${isSelected ? 'bg-blue-600 bg-opacity-30 ring-2 ring-blue-500' : 'hover:bg-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={disabled ? undefined : onClick}
    >
      <div className="relative w-16 h-16 mb-1">
        {isError ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs text-center">
            No sprite
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain"
            onError={() => setIsError(true)}
          />
        )}
        {isSelected && (
          <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
            <CheckIcon />
          </div>
        )}
      </div>
      {label && <div className="text-xs text-center mt-1">{label}</div>}
    </div>
  );
};

const EnhancedTrackingPanel = ({ 
  pokemonId, 
  formName = "default", 
  updateCaughtStatus,
  caughtStatus,
  theme,
  pokemon // Add pokemon prop to access sprite data
}) => {
  const [expandedSection, setExpandedSection] = useState('visual'); // Default to visual section open
  const [localStatus, setLocalStatus] = useState(caughtStatus[formName] || {});
  const [selectedVisualTab, setSelectedVisualTab] = useState('generations');
  
  // Access the current caught status for this form
  const formStatus = caughtStatus[formName] || {};
  const originMarks = formStatus.originMarks || {};

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Handle option click with local state update
  const handleOptionClick = (optionId) => {
    const newStatus = !formStatus[optionId];
    
    // Update local state immediately for visual feedback
    setLocalStatus(prev => {
      if (optionId.startsWith('gen') || optionId === 'vc' || optionId === 'lgpe' || optionId === 'go') {
        return {
          ...prev,
          generations: {
            ...(prev.generations || {}),
            [optionId]: !formStatus.generations?.[optionId]
          }
        };
      }
      return {
        ...prev,
        [optionId]: newStatus
      };
    });
    
    // Call the parent update function
    updateCaughtStatus(optionId, formName);
  };

  // Group tracking options
  const basicOptions = [
    { id: "caught", label: "Regular", color: "green" },
    { id: "shiny", label: "Shiny", color: "yellow" },
  ];

  const specialOptions = [
    { id: "alpha", label: "Alpha", color: "red" },
    { id: "alphaShiny", label: "Alpha Shiny", color: "purple" },
  ];

  const generationOptions = [
    { 
      id: "gen6",
      label: "Generation 6",
      description: "X/Y/ORAS",
      color: "blue",
      icon: "/img/origin-marks/pentagon.png",
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vi/x-y/${pokemonId}.png`
    },
    { 
      id: "gen7",
      label: "Generation 7",
      description: "Sun/Moon/USUM",
      color: "blue",
      icon: "/img/origin-marks/clover.png",
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/${pokemonId}.png`
    },
    { 
      id: "vc",
      label: "Virtual Console",
      description: "Gen 1-2",
      color: "blue",
      icon: "/img/origin-marks/GB.png",
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/crystal/${pokemonId}.png`
    },
    { 
      id: "lgpe",
      label: "Let's Go",
      description: "Pikachu/Eevee",
      color: "blue",
      icon: "/img/origin-marks/LetsGo.png",
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/${pokemonId}.png`
    },
    { 
      id: "gen8_swsh",
      label: "Generation 8",
      description: "Sword/Shield",
      color: "blue",
      icon: "/img/origin-marks/galar.png",
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${pokemonId}.png`
    },
    { 
      id: "gen8_bdsp",
      label: "Generation 8",
      description: "BD/SP",
      color: "blue",
      icon: "/img/origin-marks/bdsp.png",
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
    },
    { 
      id: "gen8_pla",
      label: "Generation 8",
      description: "Legends: Arceus",
      color: "blue",
      icon: "/img/origin-marks/arceus.png",
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
    },
    { 
      id: "gen9",
      label: "Generation 9",
      description: "Scarlet/Violet",
      color: "blue",
      icon: "/img/origin-marks/paldea.png",
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
    },
    { 
      id: "go",
      label: "Pokémon GO",
      color: "blue",
      icon: "/img/origin-marks/GO.png",
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
    }
  ];

  // Filter generations based on Pokémon ID
  const availableGenerations = generationOptions.filter(gen => {
    if (gen.id === "go") return true; // GO is available for all Pokémon
    
    // For other generations, check if the Pokémon exists in that generation
    const genNumber = parseInt(gen.id.replace(/gen(\d+).*/, '$1'));
    const maxIds = {
      1: 151,    // Gen 1: 151 Pokémon
      2: 251,    // Gen 2: 100 new Pokémon
      3: 386,    // Gen 3: 135 new Pokémon
      4: 493,    // Gen 4: 107 new Pokémon
      5: 649,    // Gen 5: 156 new Pokémon
      6: 721,    // Gen 6: 72 new Pokémon
      7: 809,    // Gen 7: 88 new Pokémon
      8: 898,    // Gen 8: 89 new Pokémon
      9: 1010    // Gen 9: 112 new Pokémon
    };
    
    return pokemonId <= (maxIds[genNumber] || 1010);
  });

  const gameOptions = [
    { id: "home", label: "Pokémon HOME", color: "blue" },
  ];

  const customOptions = [
    { id: "livingDex", label: "Living Dex", color: "green" },
    { id: "competitive", label: "Competitive", color: "purple" },
    { id: "favorite", label: "Favorite", color: "red" },
  ];

  // Form options - would be populated from the pokemon prop
  const formOptions = [
    { 
      id: "default", 
      label: "Default", 
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png` 
    },
    // Additional forms would be added dynamically based on the pokemon data
  ];

  // Get shiny sprite URLs
  const getShinySprite = (genId, pokemonId) => {
    switch(genId) {
      case 'gen6':
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vi/x-y/shiny/${pokemonId}.png`;
      case 'gen7':
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/ultra-sun-ultra-moon/shiny/${pokemonId}.png`;
      case 'gen8_swsh':
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/shiny/${pokemonId}.png`;
      default:
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`;
    }
  };

  // Dynamically populate form options if we have alternative forms data
  const [formSprites, setFormSprites] = useState([]);
  
  useEffect(() => {
    if (pokemon) {
      // Create a default form entry
      const forms = [{
        id: "default",
        label: "Default",
        sprite: pokemon.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
        shinySprite: pokemon.sprites?.front_shiny || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`
      }];
      
      // Add any alternative forms if available
      if (pokemon.forms && pokemon.forms.length > 1) {
        // This would need to be adjusted based on the actual data structure
        // For now, we're just showing a placeholder for alternative forms
        forms.push({
          id: "alternative",
          label: "Alternative Form",
          sprite: "/img/unknown-pokemon.png",
          shinySprite: "/img/unknown-pokemon.png"
        });
      }
      
      setFormSprites(forms);
    }
  }, [pokemon, pokemonId]);

  // Get the effective status (either from local state or props)
  const getEffectiveStatus = (optionId) => {
    if (optionId.startsWith('gen') || optionId === 'vc' || optionId === 'lgpe' || optionId === 'go') {
      // Check generations object for these options
      return localStatus.generations?.[optionId] !== undefined 
        ? localStatus.generations[optionId] 
        : formStatus.generations?.[optionId] || false;
    }
    return localStatus[optionId] !== undefined ? localStatus[optionId] : formStatus[optionId];
  };

  return (
    <div className={`${theme.bg} bg-opacity-70 rounded-lg p-4 shadow-lg w-full`}>
      {/* Main Tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          onClick={() => {
            setExpandedSection('visual');
            setSelectedVisualTab('generations');
          }}
          className={`px-4 py-2 text-sm font-medium ${
            expandedSection === 'visual' && selectedVisualTab === 'generations' 
              ? 'border-b-2 border-blue-500 text-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Generations
        </button>
        <button
          onClick={() => {
            setExpandedSection('visual');
            setSelectedVisualTab('forms');
          }}
          className={`px-4 py-2 text-sm font-medium ${
            expandedSection === 'visual' && selectedVisualTab === 'forms' 
              ? 'border-b-2 border-blue-500 text-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Forms
        </button>
        <button
          onClick={() => {
            setExpandedSection('visual');
            setSelectedVisualTab('shinies');
          }}
          className={`px-4 py-2 text-sm font-medium ${
            expandedSection === 'visual' && selectedVisualTab === 'shinies' 
              ? 'border-b-2 border-blue-500 text-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Shinies
        </button>
        <button
          onClick={() => setExpandedSection(expandedSection === 'options' ? null : 'options')}
          className={`px-4 py-2 text-sm font-medium ${
            expandedSection === 'options' 
              ? 'border-b-2 border-blue-500 text-blue-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Options
        </button>
      </div>

      {/* Origin Marks */}
      {Object.keys(originMarks).length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Origin Marks</h4>
          <OriginMarks originMarks={originMarks} />
        </div>
      )}

      {/* Visual Selection Section */}
      {expandedSection === 'visual' && (
        <div className="space-y-4">
          {/* Visual Selection Tabs */}
          <div className="flex space-x-2 border-b border-gray-700">
            <button
              onClick={() => setSelectedVisualTab('generations')}
              className={`px-3 py-2 text-sm ${selectedVisualTab === 'generations' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-400'}`}
            >
              Generations
            </button>
            <button
              onClick={() => setSelectedVisualTab('forms')}
              className={`px-3 py-2 text-sm ${selectedVisualTab === 'forms' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-400'}`}
            >
              Forms
            </button>
            <button
              onClick={() => setSelectedVisualTab('shinies')}
              className={`px-3 py-2 text-sm ${selectedVisualTab === 'shinies' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-400'}`}
            >
              Shinies
            </button>
          </div>
          
          {/* Generations Tab Content */}
          {selectedVisualTab === 'generations' && (
            <div className="space-y-6">
              {/* Generation selection buttons */}
              <div className="flex flex-wrap gap-2">
                {availableGenerations.map((gen) => (
                  <button
                    key={gen.id}
                    onClick={() => handleOptionClick(gen.id)}
                    className={`px-3 py-1 rounded-full text-sm flex items-center gap-1
                      ${getEffectiveStatus(gen.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    {gen.icon && (
                      <img 
                        src={gen.icon} 
                        alt={`${gen.label} icon`} 
                        className="w-4 h-4 object-contain"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    {gen.description}
                  </button>
                ))}
              </div>
              
              {/* Generation sprites grid */}
              <div className="grid grid-cols-1 gap-4">
                {availableGenerations.filter(gen => getEffectiveStatus(gen.id)).map((gen) => (
                  <div key={gen.id} className="bg-gray-800 rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-2">{gen.label} - {gen.description}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <SpriteSelector
                        src={gen.sprite}
                        alt={`${gen.label} sprite`}
                        label="Regular"
                        isSelected={getEffectiveStatus('caught') && !getEffectiveStatus('shiny')}
                        onClick={() => handleOptionClick('caught')}
                      />
                      <SpriteSelector
                        src={getShinySprite(gen.id, pokemonId)}
                        alt={`${gen.label} shiny sprite`}
                        label="Shiny"
                        isSelected={getEffectiveStatus('shiny')}
                        onClick={() => handleOptionClick('shiny')}
                      />
                    </div>
                  </div>
                ))}
                
                {!availableGenerations.some(gen => getEffectiveStatus(gen.id)) && (
                  <div className="text-center text-gray-400 py-4">
                    Select a generation above to see sprites
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Forms Tab Content */}
          {selectedVisualTab === 'forms' && (
            <div className="grid grid-cols-3 gap-2">
              {formSprites.map((form) => (
                <SpriteSelector
                  key={form.id}
                  src={form.sprite}
                  alt={`${form.label} form`}
                  label={form.label}
                  isSelected={formName === form.id}
                  onClick={() => {/* Would navigate to the form */}}
                  disabled={form.id !== "default"} // Only enable default form for now
                />
              ))}
              <div className="col-span-3 text-center text-gray-400 text-sm mt-2">
                Note: Select a form on the main tracking tab to track different forms
              </div>
            </div>
          )}
          
          {/* Shinies Tab Content */}
          {selectedVisualTab === 'shinies' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <SpriteSelector
                  src={pokemon?.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                  alt="Regular sprite"
                  label="Regular"
                  isSelected={getEffectiveStatus('caught') && !getEffectiveStatus('shiny')}
                  onClick={() => handleOptionClick('caught')}
                />
                <SpriteSelector
                  src={pokemon?.sprites?.front_shiny || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`}
                  alt="Shiny sprite"
                  label="Shiny"
                  isSelected={getEffectiveStatus('shiny')}
                  onClick={() => handleOptionClick('shiny')}
                />
              </div>
              
              {/* Official Artwork */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Official Artwork</h4>
                <div className="grid grid-cols-2 gap-4">
                  <SpriteSelector
                    src={pokemon?.sprites?.other?.['official-artwork']?.front_default || 
                        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
                    alt="Official Artwork"
                    label="Regular"
                    isSelected={getEffectiveStatus('caught') && !getEffectiveStatus('shiny')}
                    onClick={() => handleOptionClick('caught')}
                  />
                  <SpriteSelector
                    src={pokemon?.sprites?.other?.['official-artwork']?.front_shiny || 
                        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`}
                    alt="Shiny Official Artwork"
                    label="Shiny"
                    isSelected={getEffectiveStatus('shiny')}
                    onClick={() => handleOptionClick('shiny')}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Basic Options - Always visible */}
      {expandedSection !== 'visual' && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Basic Options</h4>
          <div className="grid grid-cols-2 gap-2">
            {basicOptions.map((option) => (
              <TrackingOption
                key={option.id}
                {...option}
                isActive={getEffectiveStatus(option.id)}
                onClick={() => handleOptionClick(option.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Generation Section - Only visible in options tab */}
      {expandedSection === 'options' && (
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Generation of Origin</h4>
          <div className="grid grid-cols-1 gap-2">
            {availableGenerations.map((option) => {
              // Check if this generation is selected by looking at the generations object
              const isSelected = formStatus.generations && formStatus.generations[option.id] === true;
              
              return (
                <TrackingOption
                  key={option.id}
                  {...option}
                  isActive={isSelected}
                  onClick={() => handleOptionClick(option.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Special Forms Section - Only visible in options tab */}
      {expandedSection === 'options' && specialOptions.length > 0 && (
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Special Forms</h4>
          <div className="grid grid-cols-2 gap-2">
            {specialOptions.map((option) => (
              <TrackingOption
                key={option.id}
                {...option}
                isActive={getEffectiveStatus(option.id)}
                onClick={() => handleOptionClick(option.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Game Versions Section - Only visible in options tab */}
      {expandedSection === 'options' && gameOptions.length > 0 && (
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Additional Game Versions</h4>
          <div className="grid grid-cols-2 gap-2">
            {gameOptions.map((option) => (
              <TrackingOption
                key={option.id}
                {...option}
                isActive={getEffectiveStatus(option.id)}
                onClick={() => handleOptionClick(option.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Tags Section - Only visible in options tab */}
      {expandedSection === 'options' && customOptions.length > 0 && (
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Custom Tags</h4>
          <div className="grid grid-cols-2 gap-2">
            {customOptions.map((option) => (
              <TrackingOption
                key={option.id}
                {...option}
                isActive={getEffectiveStatus(option.id)}
                onClick={() => handleOptionClick(option.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTrackingPanel;
