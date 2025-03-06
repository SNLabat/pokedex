// components/EnhancedTrackingPanel.js
import React, { useState } from 'react';
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

const EnhancedTrackingPanel = ({ 
  pokemonId, 
  formName = "default", 
  updateCaughtStatus,
  caughtStatus,
  theme
}) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [localStatus, setLocalStatus] = useState(caughtStatus[formName] || {});
  
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Access the current caught status for this form
  const formStatus = caughtStatus[formName] || {};
  const originMarks = formStatus.originMarks || {};

  // Handle option click with local state update
  const handleOptionClick = (optionId) => {
    const newStatus = !formStatus[optionId];
    // Update local state immediately for visual feedback
    setLocalStatus(prev => ({
      ...prev,
      [optionId]: newStatus
    }));
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
      icon: "/img/origin-marks/pentagon.png"
    },
    { 
      id: "gen7",
      label: "Generation 7",
      description: "Sun/Moon/USUM",
      color: "blue",
      icon: "/img/origin-marks/clover.png"
    },
    { 
      id: "vc",
      label: "Virtual Console",
      description: "Gen 1-2",
      color: "blue",
      icon: "/img/origin-marks/GB.png"
    },
    { 
      id: "lgpe",
      label: "Let's Go",
      description: "Pikachu/Eevee",
      color: "blue",
      icon: "/img/origin-marks/LetsGo.png"
    },
    { 
      id: "gen8_swsh",
      label: "Generation 8",
      description: "Sword/Shield",
      color: "blue",
      icon: "/img/origin-marks/galar.png"
    },
    { 
      id: "gen8_bdsp",
      label: "Generation 8",
      description: "BD/SP",
      color: "blue",
      icon: "/img/origin-marks/bdsp.png"
    },
    { 
      id: "gen8_pla",
      label: "Generation 8",
      description: "Legends: Arceus",
      color: "blue",
      icon: "/img/origin-marks/arceus.png"
    },
    { 
      id: "gen9",
      label: "Generation 9",
      description: "Scarlet/Violet",
      color: "blue",
      icon: "/img/origin-marks/paldea.png"
    },
    { 
      id: "go",
      label: "Pokémon GO",
      color: "blue",
      icon: "/img/origin-marks/GO.png"
    }
  ];

  const gameOptions = [
    { id: "home", label: "Pokémon HOME", color: "blue" },
  ];

  const customOptions = [
    { id: "livingDex", label: "Living Dex", color: "green" },
    { id: "competitive", label: "Competitive", color: "purple" },
    { id: "favorite", label: "Favorite", color: "red" },
  ];

  // Get the effective status (either from local state or props)
  const getEffectiveStatus = (optionId) => {
    return localStatus[optionId] !== undefined ? localStatus[optionId] : formStatus[optionId];
  };

  return (
    <div className={`${theme.bg} bg-opacity-70 rounded-lg p-4 shadow-lg w-full`}>
      <h3 className="text-xl font-semibold mb-4">Tracking Options</h3>

      {/* Origin Marks */}
      {Object.keys(originMarks).length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Origin Marks</h4>
          <OriginMarks originMarks={originMarks} />
        </div>
      )}

      {/* Basic Options */}
      <div className="mb-4">
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

      {/* Generation Section */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('generation')}
          className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium">Generation of Origin</span>
          {expandedSection === 'generation' ? (
            <MinusIcon />
          ) : (
            <PlusIcon />
          )}
        </button>
        {expandedSection === 'generation' && (
          <div className="mt-2 grid grid-cols-1 gap-2">
            {generationOptions.map((option) => (
              <TrackingOption
                key={option.id}
                {...option}
                isActive={getEffectiveStatus(option.id)}
                onClick={() => handleOptionClick(option.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Special Forms Section */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('special')}
          className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium">Special Forms</span>
          {expandedSection === 'special' ? (
            <MinusIcon />
          ) : (
            <PlusIcon />
          )}
        </button>
        {expandedSection === 'special' && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {specialOptions.map((option) => (
              <TrackingOption
                key={option.id}
                {...option}
                isActive={getEffectiveStatus(option.id)}
                onClick={() => handleOptionClick(option.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Game Versions Section */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('games')}
          className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium">Additional Game Versions</span>
          {expandedSection === 'games' ? (
            <MinusIcon />
          ) : (
            <PlusIcon />
          )}
        </button>
        {expandedSection === 'games' && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {gameOptions.map((option) => (
              <TrackingOption
                key={option.id}
                {...option}
                isActive={getEffectiveStatus(option.id)}
                onClick={() => handleOptionClick(option.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom Tags Section */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('custom')}
          className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium">Custom Tags</span>
          {expandedSection === 'custom' ? (
            <MinusIcon />
          ) : (
            <PlusIcon />
          )}
        </button>
        {expandedSection === 'custom' && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {customOptions.map((option) => (
              <TrackingOption
                key={option.id}
                {...option}
                isActive={getEffectiveStatus(option.id)}
                onClick={() => handleOptionClick(option.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTrackingPanel;
