import { useState, useEffect } from 'react';

const MarksTab = ({ pokemon, caughtStatus, updateMarkStatus }) => {
  const [failedImages, setFailedImages] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  // Initialize marks data
  const marks = [
    // Mood Marks
    { id: 'lively-mark', name: 'Lively Mark', description: 'A mark that shows this Pokémon is lively.' },
    { id: 'sleepy-mark', name: 'Sleepy Mark', description: 'A mark that shows this Pokémon is sleepy.' },
    { id: 'excited-mark', name: 'Excited Mark', description: 'A mark that shows this Pokémon is excited.' },
    { id: 'worried-mark', name: 'Worried Mark', description: 'A mark that shows this Pokémon is worried.' },
    { id: 'angry-mark', name: 'Angry Mark', description: 'A mark that shows this Pokémon is angry.' },
    { id: 'teary-mark', name: 'Teary Mark', description: 'A mark that shows this Pokémon is teary.' },
    { id: 'upbeat-mark', name: 'Upbeat Mark', description: 'A mark that shows this Pokémon is upbeat.' },
    { id: 'peeved-mark', name: 'Peeved Mark', description: 'A mark that shows this Pokémon is peeved.' },
    { id: 'intellectual-mark', name: 'Intellectual Mark', description: 'A mark that shows this Pokémon is intellectual.' },
    { id: 'ferocious-mark', name: 'Ferocious Mark', description: 'A mark that shows this Pokémon is ferocious.' },
    { id: 'crafty-mark', name: 'Crafty Mark', description: 'A mark that shows this Pokémon is crafty.' },
    { id: 'scowling-mark', name: 'Scowling Mark', description: 'A mark that shows this Pokémon is scowling.' },
    { id: 'kindly-mark', name: 'Kindly Mark', description: 'A mark that shows this Pokémon is kindly.' },
    { id: 'flustered-mark', name: 'Flustered Mark', description: 'A mark that shows this Pokémon is flustered.' },
    { id: 'pumped-up-mark', name: 'Pumped-Up Mark', description: 'A mark that shows this Pokémon is pumped-up.' },
    { id: 'zero-energy-mark', name: 'Zero Energy Mark', description: 'A mark that shows this Pokémon has zero energy.' },
    { id: 'prideful-mark', name: 'Prideful Mark', description: 'A mark that shows this Pokémon is prideful.' },
    { id: 'unsure-mark', name: 'Unsure Mark', description: 'A mark that shows this Pokémon is unsure.' },
    { id: 'humble-mark', name: 'Humble Mark', description: 'A mark that shows this Pokémon is humble.' },
    { id: 'thorny-mark', name: 'Thorny Mark', description: 'A mark that shows this Pokémon is thorny.' },
    { id: 'vigor-mark', name: 'Vigor Mark', description: 'A mark that shows this Pokémon has vigor.' },
    { id: 'slump-mark', name: 'Slump Mark', description: 'A mark that shows this Pokémon is in a slump.' },
    
    // Time Marks
    { id: 'dawn-mark', name: 'Dawn Mark', description: 'A mark that shows this Pokémon was caught in the early morning.', category: 'time' },
    { id: 'day-mark', name: 'Day Mark', description: 'A mark that shows this Pokémon was caught during the day.', category: 'time' },
    { id: 'dusk-mark', name: 'Dusk Mark', description: 'A mark that shows this Pokémon was caught in the evening.', category: 'time' },
    { id: 'night-mark', name: 'Night Mark', description: 'A mark that shows this Pokémon was caught at night.', category: 'time' },
    { id: 'cloudy-mark', name: 'Cloudy Mark', description: 'A mark that shows this Pokémon was caught on a cloudy day.', category: 'weather' },
    { id: 'rainy-mark', name: 'Rainy Mark', description: 'A mark that shows this Pokémon was caught on a rainy day.', category: 'weather' },
    { id: 'stormy-mark', name: 'Stormy Mark', description: 'A mark that shows this Pokémon was caught on a stormy day.', category: 'weather' },
    { id: 'snowy-mark', name: 'Snowy Mark', description: 'A mark that shows this Pokémon was caught on a snowy day.', category: 'weather' },
    { id: 'blizzard-mark', name: 'Blizzard Mark', description: 'A mark that shows this Pokémon was caught on a blizzard day.', category: 'weather' },
    { id: 'dry-mark', name: 'Dry Mark', description: 'A mark that shows this Pokémon was caught on a very dry day.', category: 'weather' },
    { id: 'sandstorm-mark', name: 'Sandstorm Mark', description: 'A mark that shows this Pokémon was caught on a sandstorm day.', category: 'weather' },
    { id: 'misty-mark', name: 'Misty Mark', description: 'A mark that shows this Pokémon was caught on a misty day.', category: 'weather' },
    { id: 'fishing-mark', name: 'Fishing Mark', description: 'A mark that shows this Pokémon was caught while fishing.', category: 'method' },
    { id: 'curry-mark', name: 'Curry Mark', description: 'A mark that shows this Pokémon joined after eating curry.', category: 'method' },
    
    // Rare Marks
    { id: 'uncommon-mark', name: 'Uncommon Mark', description: 'A mark that shows this Pokémon is somewhat special.', category: 'rare' },
    { id: 'rare-mark', name: 'Rare Mark', description: 'A mark that shows this Pokémon is quite special.', category: 'rare' },
    { id: 'rowdy-mark', name: 'Rowdy Mark', description: 'A mark that shows this Pokémon is rowdy.', category: 'rare' },
    { id: 'absent-minded-mark', name: 'Absent-Minded Mark', description: 'A mark that shows this Pokémon is absent-minded.', category: 'rare' },
    { id: 'jittery-mark', name: 'Jittery Mark', description: 'A mark that shows this Pokémon is jittery.', category: 'rare' },
    { id: 'excited-mark', name: 'Excited Mark', description: 'A mark that shows this Pokémon is excited.', category: 'rare' },
    { id: 'charismatic-mark', name: 'Charismatic Mark', description: 'A mark that shows this Pokémon is charismatic.', category: 'rare' },
    { id: 'calmness-mark', name: 'Calmness Mark', description: 'A mark that shows this Pokémon has calmness.', category: 'rare' },
    { id: 'intense-mark', name: 'Intense Mark', description: 'A mark that shows this Pokémon is intense.', category: 'rare' },
    { id: 'zoned-out-mark', name: 'Zoned-Out Mark', description: 'A mark that shows this Pokémon is zoned-out.', category: 'rare' },
    { id: 'joyful-mark', name: 'Joyful Mark', description: 'A mark that shows this Pokémon is joyful.', category: 'rare' },
    { id: 'furious-mark', name: 'Furious Mark', description: 'A mark that shows this Pokémon is furious.', category: 'rare' },
    { id: 'shield-mark', name: 'Shield Mark', description: 'A mark that shows this Pokémon is from Galar.', category: 'special' },
    { id: 'sword-mark', name: 'Sword Mark', description: 'A mark that shows this Pokémon is from Galar.', category: 'special' },
    { id: 'champion-mark', name: 'Champion Mark', description: 'A mark that shows this Pokémon was defeated as the Champion.', category: 'special' },
    { id: 'battle-tree-great-mark', name: 'Battle Tree Great Mark', description: 'A mark that shows this Pokémon has great achievements in the Battle Tree.', category: 'special' },
    { id: 'battle-tree-master-mark', name: 'Battle Tree Master Mark', description: 'A mark that shows this Pokémon has master achievements in the Battle Tree.', category: 'special' }
  ];

  // Group marks by category for better organization
  const marksByCategory = {
    'mood': marks.filter(m => !m.category || m.category === 'mood'),
    'time': marks.filter(m => m.category === 'time'),
    'weather': marks.filter(m => m.category === 'weather'),
    'method': marks.filter(m => m.category === 'method'),
    'rare': marks.filter(m => m.category === 'rare'),
    'special': marks.filter(m => m.category === 'special')
  };

  // Filter to show only marks for current Pokémon form
  const pokemonForm = 'default'; // You can update this if needed to track different forms

  // Get the mark status for the current Pokémon
  const getMarkStatus = (markId) => {
    if (!caughtStatus || !caughtStatus.default || !caughtStatus.default.marks) {
      return false;
    }
    return caughtStatus.default.marks[markId] || false;
  };

  // Toggle mark status
  const toggleMarkStatus = (markId) => {
    updateMarkStatus(markId);
  };

  // Status dropdown component
  const StatusDropdown = ({ markId }) => {
    const isObtained = getMarkStatus(markId);
    
    return (
      <select 
        value={isObtained ? "obtained" : "missing"}
        onChange={(e) => {
          if (e.target.value === "obtained" && !isObtained) {
            toggleMarkStatus(markId);
          } else if (e.target.value === "missing" && isObtained) {
            toggleMarkStatus(markId);
          }
        }}
        onClick={(e) => e.stopPropagation()} // Prevent row click when clicking dropdown
        className={`px-2 py-1 rounded text-xs font-medium ${
          isObtained 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-gray-100 text-gray-800 border border-gray-300'
        }`}
      >
        <option value="missing">Missing</option>
        <option value="obtained">Obtained</option>
      </select>
    );
  };

  return (
    <div>
      <p className="text-gray-400 mb-6">
        Select a status for each mark to track your collection.
        Obtained marks will be included when exporting your collection data.
      </p>
      
      {Object.entries(marksByCategory).map(([category, categoryMarks]) => (
        categoryMarks.length > 0 && (
          <div key={category} className="mb-8">
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
              {category.charAt(0).toUpperCase() + category.slice(1)} Marks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categoryMarks.map(mark => (
                <div 
                  key={mark.id}
                  onClick={() => toggleMarkStatus(mark.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    getMarkStatus(mark.id)
                      ? 'bg-purple-800 bg-opacity-50 hover:bg-purple-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{mark.name}</h4>
                    <StatusDropdown markId={mark.id} />
                  </div>
                  <p className="text-sm text-gray-400">{mark.description}</p>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default MarksTab; 