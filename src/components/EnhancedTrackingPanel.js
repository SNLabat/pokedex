// components/EnhancedTrackingPanel.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';

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

const TrackingOption = ({ label, isActive, onClick, color = "green" }) => {
  const colorClasses = {
    green: "bg-green-500 text-white",
    yellow: "bg-yellow-500 text-black",
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
    purple: "bg-purple-500 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md flex items-center justify-between w-full transition-all ${
        isActive ? colorClasses[color] : "bg-gray-700 hover:bg-gray-600 text-gray-300"
      }`}
    >
      <span>{label}</span>
      {isActive && <CheckIcon />}
    </button>
  );
};

const EnhancedTrackingPanel = ({ 
  pokemonId, 
  formName = "default", 
  updateCaughtStatus,
  caughtStatus,
  theme
}) => {
  const [expandedSection, setExpandedSection] = useState(null);
  
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Access the current caught status for this form
  const formStatus = caughtStatus[formName] || {};

  // Group tracking options
  const basicOptions = [
    { id: "regular", label: "Regular", color: "green" },
    { id: "shiny", label: "Shiny", color: "yellow" },
  ];

  const specialOptions = [
    { id: "alpha", label: "Alpha", color: "red" },
    { id: "alphaShiny", label: "Alpha Shiny", color: "purple" },
  ];

  const gameOptions = [
    { id: "home", label: "Pokémon HOME", color: "blue" },
    { id: "swsh", label: "Sword/Shield", color: "blue" },
    { id: "bdsp", label: "BD/SP", color: "blue" },
    { id: "pla", label: "Legends: Arceus", color: "blue" },
    { id: "sv", label: "Scarlet/Violet", color: "blue" },
  ];

  const customOptions = [
    { id: "livingDex", label: "Living Dex", color: "green" },
    { id: "competitive", label: "Competitive", color: "purple" },
    { id: "favorite", label: "Favorite", color: "red" },
  ];

  return (
    <div className={`${theme.bg} bg-opacity-70 rounded-lg p-4 shadow-lg w-full`}>
      <h3 className="text-xl font-semibold mb-4">Tracking Options</h3>

      {/* Basic Options */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2">
          {basicOptions.map((option) => (
            <TrackingOption
              key={option.id}
              label={option.label}
              isActive={formStatus[option.id]}
              onClick={() => updateCaughtStatus(option.id, formName)}
              color={option.color}
            />
          ))}
        </div>
      </div>

      {/* Collapsible Sections */}
      {/* Special Forms Section */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('special')}
          className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-md"
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
                label={option.label}
                isActive={formStatus[option.id]}
                onClick={() => updateCaughtStatus(option.id, formName)}
                color={option.color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Game Versions Section */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('games')}
          className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-md"
        >
          <span className="font-medium">Game Versions</span>
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
                label={option.label}
                isActive={formStatus[option.id]}
                onClick={() => updateCaughtStatus(option.id, formName)}
                color={option.color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Custom Tags Section */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection('custom')}
          className="flex items-center justify-between w-full px-3 py-2 bg-gray-800 rounded-md"
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
                label={option.label}
                isActive={formStatus[option.id]}
                onClick={() => updateCaughtStatus(option.id, formName)}
                color={option.color}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTrackingPanel;
