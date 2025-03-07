import { useState, useEffect } from 'react';

const MarksTab = ({ pokemon, caughtStatus, updateMarkStatus, mainTypeColor }) => {
  const [failedImages, setFailedImages] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  // Use theme color from pokemon's main type or default to green
  const themeColor = mainTypeColor || { 
    mainColor: '#10b981', // emerald-500 
    darkColor: '#047857', // emerald-700
    textColor: '#ffffff'  // white
  };
  
  // Initialize marks data
  const marks = [
    // Mood Marks
    { id: 'lively-mark', name: 'Lively Mark', description: 'A mark that shows this Pokémon is lively.', category: 'mood' },
    { id: 'sleepy-mark', name: 'Sleepy Mark', description: 'A mark that shows this Pokémon is sleepy.', category: 'mood' },
    { id: 'excited-mark', name: 'Excited Mark', description: 'A mark that shows this Pokémon is excited.', category: 'mood' },
    { id: 'worried-mark', name: 'Worried Mark', description: 'A mark that shows this Pokémon is worried.', category: 'mood' },
    { id: 'angry-mark', name: 'Angry Mark', description: 'A mark that shows this Pokémon is angry.', category: 'mood' },
    { id: 'teary-mark', name: 'Teary Mark', description: 'A mark that shows this Pokémon is teary.', category: 'mood' },
    { id: 'upbeat-mark', name: 'Upbeat Mark', description: 'A mark that shows this Pokémon is upbeat.', category: 'mood' },
    { id: 'peeved-mark', name: 'Peeved Mark', description: 'A mark that shows this Pokémon is peeved.', category: 'mood' },
    { id: 'intellectual-mark', name: 'Intellectual Mark', description: 'A mark that shows this Pokémon is intellectual.', category: 'mood' },
    { id: 'ferocious-mark', name: 'Ferocious Mark', description: 'A mark that shows this Pokémon is ferocious.', category: 'mood' },
    { id: 'crafty-mark', name: 'Crafty Mark', description: 'A mark that shows this Pokémon is crafty.', category: 'mood' },
    { id: 'scowling-mark', name: 'Scowling Mark', description: 'A mark that shows this Pokémon is scowling.', category: 'mood' },
    { id: 'kindly-mark', name: 'Kindly Mark', description: 'A mark that shows this Pokémon is kindly.', category: 'mood' },
    { id: 'flustered-mark', name: 'Flustered Mark', description: 'A mark that shows this Pokémon is flustered.', category: 'mood' },
    { id: 'pumped-up-mark', name: 'Pumped-Up Mark', description: 'A mark that shows this Pokémon is pumped-up.', category: 'mood' },
    { id: 'zero-energy-mark', name: 'Zero Energy Mark', description: 'A mark that shows this Pokémon has zero energy.', category: 'mood' },
    { id: 'prideful-mark', name: 'Prideful Mark', description: 'A mark that shows this Pokémon is prideful.', category: 'mood' },
    { id: 'unsure-mark', name: 'Unsure Mark', description: 'A mark that shows this Pokémon is unsure.', category: 'mood' },
    { id: 'humble-mark', name: 'Humble Mark', description: 'A mark that shows this Pokémon is humble.', category: 'mood' },
    { id: 'thorny-mark', name: 'Thorny Mark', description: 'A mark that shows this Pokémon is thorny.', category: 'mood' },
    { id: 'vigor-mark', name: 'Vigor Mark', description: 'A mark that shows this Pokémon has vigor.', category: 'mood' },
    { id: 'slump-mark', name: 'Slump Mark', description: 'A mark that shows this Pokémon is in a slump.', category: 'mood' },
    
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

  // Check if a mark is obtained
  const isMarkObtained = (markId) => {
    // Check if caughtStatus has marks directly
    if (caughtStatus && caughtStatus.marks && caughtStatus.marks[markId] !== undefined) {
      return caughtStatus.marks[markId] === true || caughtStatus.marks[markId] === 'obtained';
    }
    
    // Check if caughtStatus has default form with marks
    if (caughtStatus && caughtStatus.default && caughtStatus.default.marks && caughtStatus.default.marks[markId] !== undefined) {
      return caughtStatus.default.marks[markId] === true || caughtStatus.default.marks[markId] === 'obtained';
    }
    
    return false;
  };

  // Handle checkbox change
  const handleCheckboxChange = (markId) => {
    // Toggle the mark status
    updateMarkStatus(markId);
  };

  // Search filter
  const filterMarks = (mark) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return mark.name.toLowerCase().includes(searchLower) || 
           mark.description.toLowerCase().includes(searchLower);
  };

  // Filter marks by active category
  const categoryFilteredMarks = activeCategory === 'all' 
    ? marks 
    : marks.filter(mark => mark.category === activeCategory);

  // Then apply search filter
  const filteredMarks = categoryFilteredMarks.filter(filterMarks);

  return (
    <div>
      {/* Search and category filters */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search marks..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
          style={{ borderColor: themeColor.mainColor, '--tw-ring-color': themeColor.mainColor }}
        />
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeCategory === 'all'
                ? 'text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            style={activeCategory === 'all' ? { backgroundColor: themeColor.mainColor } : {}}
          >
            All
          </button>
          {Object.keys(marksByCategory).map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                activeCategory === category
                  ? 'text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={activeCategory === category ? { backgroundColor: themeColor.mainColor } : {}}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-400 mb-2">
          Check the box to mark a mark as obtained:
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredMarks.map(mark => {
          const obtained = isMarkObtained(mark.id);
          
          return (
            <div 
              key={mark.id}
              className={`p-4 rounded-lg ${
                obtained 
                  ? 'bg-opacity-10 hover:bg-opacity-20 border border-green-500 bg-green-500'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{mark.name}</h4>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={obtained}
                    onChange={() => handleCheckboxChange(mark.id)}
                    className="form-checkbox h-5 w-5 text-green-500 rounded focus:ring-green-500"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-400">{mark.description}</p>
              {mark.category && (
                <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full capitalize mt-2 inline-block">
                  {mark.category}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarksTab; 