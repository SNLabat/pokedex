import { useState, useEffect } from 'react';

const MarksTab = ({ pokemon, caughtStatus, updateMarkStatus, mainTypeColor }) => {
  const [failedImages, setFailedImages] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [clickedMark, setClickedMark] = useState(null);
  const [localCaughtStatus, setLocalCaughtStatus] = useState(caughtStatus);
  
  // Update local state when caughtStatus changes
  useEffect(() => {
    setLocalCaughtStatus(caughtStatus);
  }, [caughtStatus]);
  
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

  // Filter to show only marks for current Pokémon form
  const pokemonForm = 'default'; // You can update this if needed to track different forms

  // Get the mark status for the current Pokémon
  const getMarkStatus = (markId) => {
    // Check if localCaughtStatus has marks directly
    if (localCaughtStatus && localCaughtStatus.marks && localCaughtStatus.marks[markId] !== undefined) {
      const status = localCaughtStatus.marks[markId];
      if (status === true) return 'obtained';
      if (status === false) return 'missing';
      return status;
    }
    
    // Check if localCaughtStatus has default form with marks
    if (localCaughtStatus && localCaughtStatus.default && localCaughtStatus.default.marks && localCaughtStatus.default.marks[markId] !== undefined) {
      const status = localCaughtStatus.default.marks[markId];
      if (status === true) return 'obtained';
      if (status === false) return 'missing';
      return status;
    }
    
    // Default to unchecked if no status found
    return 'unchecked';
  };

  // Cycle through mark statuses: unchecked -> missing -> obtained -> unchecked
  const cycleMarkStatus = (markId) => {
    setClickedMark(markId);
    
    const currentStatus = getMarkStatus(markId);
    let newStatus;
    
    if (currentStatus === 'unchecked') {
      newStatus = 'missing';
    } else if (currentStatus === 'missing') {
      newStatus = 'obtained';
    } else {
      newStatus = 'unchecked';
    }
    
    // Call the parent component's update function with the mark ID
    // The updateMarkStatus function in PokemonDetail will handle the cycling of states
    updateMarkStatus(markId);
    
    // Clear the animation after a short delay
    setTimeout(() => {
      setClickedMark(null);
    }, 300);
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

  // Get status color and text based on mark status
  const getStatusStyles = (status) => {
    switch(status) {
      case 'obtained':
        return {
          bgColor: themeColor.mainColor,
          textColor: themeColor.textColor,
          borderColor: themeColor.mainColor,
          label: 'Obtained'
        };
      case 'missing':
        return {
          bgColor: '#ef4444', // red-500
          textColor: '#ffffff',
          borderColor: '#ef4444',
          label: 'Missing'
        };
      case 'unchecked':
      default:
        return {
          bgColor: '#9ca3af', // gray-400
          textColor: '#1f2937',
          borderColor: '#6b7280', // gray-500
          label: 'Unchecked'
        };
    }
  };

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
          Click on a mark to cycle through tracking states:
        </p>
        <div className="flex space-x-4">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
            <span className="text-sm text-gray-300">Unchecked</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span className="text-sm text-gray-300">Missing</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: themeColor.mainColor }}></span>
            <span className="text-sm text-gray-300">Obtained</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredMarks.map(mark => {
          const status = getMarkStatus(mark.id);
          const isClicked = clickedMark === mark.id;
          const statusStyles = getStatusStyles(status);
          
          return (
            <div 
              key={mark.id}
              onClick={() => cycleMarkStatus(mark.id)}
              className={`p-4 rounded-lg cursor-pointer transition-all transform ${
                isClicked ? 'scale-95' : ''
              } ${
                status !== 'unchecked' 
                  ? 'bg-opacity-10 hover:bg-opacity-20 border'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
              }`}
              style={status !== 'unchecked' ? { 
                backgroundColor: statusStyles.bgColor,
                borderColor: statusStyles.borderColor
              } : {}}
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{mark.name}</h4>
                <span className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: statusStyles.bgColor,
                    color: statusStyles.textColor
                  }}
                >
                  {statusStyles.label}
                </span>
              </div>
              <p className="text-sm text-gray-400">{mark.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarksTab; 