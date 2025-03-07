import { useState, useEffect } from 'react';
import Image from 'next/image';

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
  
  // Preload mark images
  useEffect(() => {
    // Reset failed images when component mounts or when marks change
    setFailedImages({});
  }, []);
  
  // Mark icons mapping - only including marks that exist in Scarlet & Violet according to Serebii
  const markIcons = {
    // Weather Marks
    'cloudy-mark': { icon: '/img/Ribbons-Marks/cloudymark.png', color: '#33AADD', fallback: '☁️' },
    'rainy-mark': { icon: '/img/Ribbons-Marks/rainymark.png', color: '#33AADD', fallback: '🌧️' },
    'stormy-mark': { icon: '/img/Ribbons-Marks/stormymark.png', color: '#7766EE', fallback: '⛈️' },
    'snowy-mark': { icon: '/img/Ribbons-Marks/snowymark.png', color: '#33AADD', fallback: '❄️' },
    'blizzard-mark': { icon: '/img/Ribbons-Marks/blizzardmark.png', color: '#33AADD', fallback: '🌨️' },
    'dry-mark': { icon: '/img/Ribbons-Marks/drymark.png', color: '#FF5544', fallback: '🏜️' },
    'sandstorm-mark': { icon: '/img/Ribbons-Marks/sandstormmark.png', color: '#FFAA33', fallback: '🏜️' },
    'misty-mark': { icon: '/img/Ribbons-Marks/mistymark.png', color: '#33AADD', fallback: '🌫️' },
    
    // Time Marks
    'dawn-mark': { icon: '/img/Ribbons-Marks/dawnmark.png', color: '#FFAA33', fallback: '🌅' },
    'day-mark': { icon: '/img/Ribbons-Marks/daymark.png', color: '#FFAA33', fallback: '☀️' },
    'dusk-mark': { icon: '/img/Ribbons-Marks/duskmark.png', color: '#7766EE', fallback: '🌆' },
    'night-mark': { icon: '/img/Ribbons-Marks/nightmark.png', color: '#7766EE', fallback: '🌙' },
    
    // Method Marks
    'fishing-mark': { icon: '/img/Ribbons-Marks/fishingmark.png', color: '#33AADD', fallback: '🎣' },
    'curry-mark': { icon: '/img/Ribbons-Marks/currymark.png', color: '#FFAA33', fallback: '🍛' },
    'lunchtime-mark': { icon: '/img/Ribbons-Marks/lunchtimemark.png', color: '#FFAA33', fallback: '🍱' },
    'sleepy-time-mark': { icon: '/img/Ribbons-Marks/sleepytimemark.png', color: '#7766EE', fallback: '😴' },
    'destiny-mark': { icon: '/img/Ribbons-Marks/destinymark.png', color: '#FFCC33', fallback: '✨' },
    
    // Rare Marks
    'uncommon-mark': { icon: '/img/Ribbons-Marks/uncommonmark.png', color: '#33AA66', fallback: '⭐' },
    'rare-mark': { icon: '/img/Ribbons-Marks/raremark.png', color: '#33AADD', fallback: '⭐⭐' },
    
    // Personality Marks
    'rowdy-mark': { icon: '/img/Ribbons-Marks/rowdymark.png', color: '#FF5544', fallback: '😤' },
    'absent-minded-mark': { icon: '/img/Ribbons-Marks/absent-mindedmark.png', color: '#7766EE', fallback: '🤔' },
    'jittery-mark': { icon: '/img/Ribbons-Marks/jitterymark.png', color: '#FF5544', fallback: '😰' },
    'excited-mark': { icon: '/img/Ribbons-Marks/excitedmark.png', color: '#FFAA33', fallback: '😃' },
    'charismatic-mark': { icon: '/img/Ribbons-Marks/charismaticmark.png', color: '#FFCC33', fallback: '✨' },
    'calmness-mark': { icon: '/img/Ribbons-Marks/calmnessmark.png', color: '#33AA66', fallback: '😌' },
    'intense-mark': { icon: '/img/Ribbons-Marks/intensemark.png', color: '#FF5544', fallback: '😠' },
    'zoned-out-mark': { icon: '/img/Ribbons-Marks/zonedoutmark.png', color: '#7766EE', fallback: '😶' },
    'joyful-mark': { icon: '/img/Ribbons-Marks/joyfulmark.png', color: '#FFAA33', fallback: '😊' },
    'angry-mark': { icon: '/img/Ribbons-Marks/angrymark.png', color: '#FF5544', fallback: '😡' },
    'smiley-mark': { icon: '/img/Ribbons-Marks/smileymark.png', color: '#FFAA33', fallback: '😄' },
    'teary-mark': { icon: '/img/Ribbons-Marks/tearymark.png', color: '#33AADD', fallback: '😢' },
    'upbeat-mark': { icon: '/img/Ribbons-Marks/upbeatmark.png', color: '#FFAA33', fallback: '🥳' },
    'peeved-mark': { icon: '/img/Ribbons-Marks/peevedmark.png', color: '#FF5544', fallback: '😒' },
    'intellectual-mark': { icon: '/img/Ribbons-Marks/intellectualmark.png', color: '#33AA66', fallback: '🧠' },
    'ferocious-mark': { icon: '/img/Ribbons-Marks/ferociousmark.png', color: '#FF5544', fallback: '👹' },
    'crafty-mark': { icon: '/img/Ribbons-Marks/craftymark.png', color: '#33AA66', fallback: '🦊' },
    'scowling-mark': { icon: '/img/Ribbons-Marks/scowlingmark.png', color: '#FF5544', fallback: '😠' },
    'kindly-mark': { icon: '/img/Ribbons-Marks/kindlymark.png', color: '#FF77AA', fallback: '🤗' },
    'flustered-mark': { icon: '/img/Ribbons-Marks/flusteredmark.png', color: '#FF77AA', fallback: '😳' },
    'pumped-up-mark': { icon: '/img/Ribbons-Marks/pumped-upmark.png', color: '#FF5544', fallback: '💪' },
    'zero-energy-mark': { icon: '/img/Ribbons-Marks/zeroenergymark.png', color: '#7766EE', fallback: '😩' },
    'prideful-mark': { icon: '/img/Ribbons-Marks/pridefulmark.png', color: '#FFCC33', fallback: '😏' },
    'unsure-mark': { icon: '/img/Ribbons-Marks/unsuremark.png', color: '#7766EE', fallback: '🤷' },
    'humble-mark': { icon: '/img/Ribbons-Marks/humblemark.png', color: '#33AA66', fallback: '🙏' },
    'thorny-mark': { icon: '/img/Ribbons-Marks/thornymark.png', color: '#FF5544', fallback: '🌵' },
    'vigor-mark': { icon: '/img/Ribbons-Marks/vigormark.png', color: '#FF5544', fallback: '💪' },
    'slump-mark': { icon: '/img/Ribbons-Marks/slumpmark.png', color: '#7766EE', fallback: '😞' }
  };
  
  // Initialize marks data - only including marks that exist in Scarlet & Violet according to Serebii
  const marks = [
    // Weather Marks
    { id: 'cloudy-mark', name: 'Cloudy Mark', description: 'A mark that shows this Pokémon was caught on a cloudy day.', category: 'weather' },
    { id: 'rainy-mark', name: 'Rainy Mark', description: 'A mark that shows this Pokémon was caught on a rainy day.', category: 'weather' },
    { id: 'stormy-mark', name: 'Stormy Mark', description: 'A mark that shows this Pokémon was caught on a stormy day.', category: 'weather' },
    { id: 'snowy-mark', name: 'Snowy Mark', description: 'A mark that shows this Pokémon was caught on a snowy day.', category: 'weather' },
    { id: 'blizzard-mark', name: 'Blizzard Mark', description: 'A mark that shows this Pokémon was caught on a blizzard day.', category: 'weather' },
    { id: 'dry-mark', name: 'Dry Mark', description: 'A mark that shows this Pokémon was caught on a very dry day.', category: 'weather' },
    { id: 'sandstorm-mark', name: 'Sandstorm Mark', description: 'A mark that shows this Pokémon was caught on a sandstorm day.', category: 'weather' },
    { id: 'misty-mark', name: 'Misty Mark', description: 'A mark that shows this Pokémon was caught on a misty day.', category: 'weather' },
    
    // Time Marks
    { id: 'dawn-mark', name: 'Dawn Mark', description: 'A mark that shows this Pokémon was caught in the early morning.', category: 'time' },
    { id: 'day-mark', name: 'Day Mark', description: 'A mark that shows this Pokémon was caught during the day.', category: 'time' },
    { id: 'dusk-mark', name: 'Dusk Mark', description: 'A mark that shows this Pokémon was caught in the evening.', category: 'time' },
    { id: 'night-mark', name: 'Night Mark', description: 'A mark that shows this Pokémon was caught at night.', category: 'time' },
    
    // Method Marks
    { id: 'fishing-mark', name: 'Fishing Mark', description: 'A mark that shows this Pokémon was caught while fishing.', category: 'method' },
    { id: 'curry-mark', name: 'Curry Mark', description: 'A mark that shows this Pokémon joined after eating curry.', category: 'method' },
    { id: 'lunchtime-mark', name: 'Lunchtime Mark', description: 'A mark that shows this Pokémon was caught during lunchtime.', category: 'method' },
    { id: 'sleepy-time-mark', name: 'Sleepy-Time Mark', description: 'A mark that shows this Pokémon was caught while sleeping.', category: 'method' },
    { id: 'destiny-mark', name: 'Destiny Mark', description: 'A mark that shows this Pokémon was destined to be caught.', category: 'method' },
    
    // Rare Marks
    { id: 'uncommon-mark', name: 'Uncommon Mark', description: 'A mark that shows this Pokémon is somewhat special.', category: 'rare' },
    { id: 'rare-mark', name: 'Rare Mark', description: 'A mark that shows this Pokémon is quite special.', category: 'rare' },
    
    // Personality Marks
    { id: 'rowdy-mark', name: 'Rowdy Mark', description: 'A mark that shows this Pokémon is rowdy.', category: 'personality' },
    { id: 'absent-minded-mark', name: 'Absent-Minded Mark', description: 'A mark that shows this Pokémon is absent-minded.', category: 'personality' },
    { id: 'jittery-mark', name: 'Jittery Mark', description: 'A mark that shows this Pokémon is jittery.', category: 'personality' },
    { id: 'excited-mark', name: 'Excited Mark', description: 'A mark that shows this Pokémon is excited.', category: 'personality' },
    { id: 'charismatic-mark', name: 'Charismatic Mark', description: 'A mark that shows this Pokémon is charismatic.', category: 'personality' },
    { id: 'calmness-mark', name: 'Calmness Mark', description: 'A mark that shows this Pokémon has calmness.', category: 'personality' },
    { id: 'intense-mark', name: 'Intense Mark', description: 'A mark that shows this Pokémon is intense.', category: 'personality' },
    { id: 'zoned-out-mark', name: 'Zoned-Out Mark', description: 'A mark that shows this Pokémon is zoned-out.', category: 'personality' },
    { id: 'joyful-mark', name: 'Joyful Mark', description: 'A mark that shows this Pokémon is joyful.', category: 'personality' },
    { id: 'angry-mark', name: 'Angry Mark', description: 'A mark that shows this Pokémon is angry.', category: 'personality' },
    { id: 'smiley-mark', name: 'Smiley Mark', description: 'A mark that shows this Pokémon is smiley.', category: 'personality' },
    { id: 'teary-mark', name: 'Teary Mark', description: 'A mark that shows this Pokémon is teary.', category: 'personality' },
    { id: 'upbeat-mark', name: 'Upbeat Mark', description: 'A mark that shows this Pokémon is upbeat.', category: 'personality' },
    { id: 'peeved-mark', name: 'Peeved Mark', description: 'A mark that shows this Pokémon is peeved.', category: 'personality' },
    { id: 'intellectual-mark', name: 'Intellectual Mark', description: 'A mark that shows this Pokémon is intellectual.', category: 'personality' },
    { id: 'ferocious-mark', name: 'Ferocious Mark', description: 'A mark that shows this Pokémon is ferocious.', category: 'personality' },
    { id: 'crafty-mark', name: 'Crafty Mark', description: 'A mark that shows this Pokémon is crafty.', category: 'personality' },
    { id: 'scowling-mark', name: 'Scowling Mark', description: 'A mark that shows this Pokémon is scowling.', category: 'personality' },
    { id: 'kindly-mark', name: 'Kindly Mark', description: 'A mark that shows this Pokémon is kindly.', category: 'personality' },
    { id: 'flustered-mark', name: 'Flustered Mark', description: 'A mark that shows this Pokémon is flustered.', category: 'personality' },
    { id: 'pumped-up-mark', name: 'Pumped-Up Mark', description: 'A mark that shows this Pokémon is pumped-up.', category: 'personality' },
    { id: 'zero-energy-mark', name: 'Zero Energy Mark', description: 'A mark that shows this Pokémon has zero energy.', category: 'personality' },
    { id: 'prideful-mark', name: 'Prideful Mark', description: 'A mark that shows this Pokémon is prideful.', category: 'personality' },
    { id: 'unsure-mark', name: 'Unsure Mark', description: 'A mark that shows this Pokémon is unsure.', category: 'personality' },
    { id: 'humble-mark', name: 'Humble Mark', description: 'A mark that shows this Pokémon is humble.', category: 'personality' },
    { id: 'thorny-mark', name: 'Thorny Mark', description: 'A mark that shows this Pokémon is thorny.', category: 'personality' },
    { id: 'vigor-mark', name: 'Vigor Mark', description: 'A mark that shows this Pokémon has vigor.', category: 'personality' },
    { id: 'slump-mark', name: 'Slump Mark', description: 'A mark that shows this Pokémon is in a slump.', category: 'personality' }
  ];

  // Group marks by category for better organization
  const marksByCategory = {
    'weather': marks.filter(m => m.category === 'weather'),
    'time': marks.filter(m => m.category === 'time'),
    'method': marks.filter(m => m.category === 'method'),
    'rare': marks.filter(m => m.category === 'rare'),
    'personality': marks.filter(m => m.category === 'personality')
  };

  // Handle image error with retry mechanism
  const handleImageError = (markId) => {
    // Simply mark the image as failed so we can use the fallback
    setFailedImages(prev => ({ ...prev, [markId]: true }));
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
          const iconData = markIcons[mark.id] || { 
            icon: `/img/Ribbons-Marks/${mark.id.replace(/-/g, '')}mark.png`,
            color: '#99CCFF', 
            fallback: '❓'
          };
          const useIconFallback = failedImages[mark.id];
          
          return (
            <div 
              key={mark.id}
              className={`p-4 rounded-lg ${
                obtained 
                  ? 'bg-opacity-10 hover:bg-opacity-20 border border-green-500 bg-green-500'
                  : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
              }`}
            >
              <div className="flex items-center mb-2">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mr-3 bg-gray-800"
                  style={{ 
                    border: `2px solid ${iconData.color}`
                  }}
                >
                  {useIconFallback ? (
                    <span className="text-lg">{iconData.fallback}</span>
                  ) : (
                    <Image 
                      src={iconData.icon} 
                      alt={mark.name}
                      width={40}
                      height={40}
                      className="object-contain"
                      onError={() => handleImageError(mark.id)}
                      unoptimized={true}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{mark.name}</h4>
                  <p className="text-sm text-gray-400">{mark.description}</p>
                  {mark.category && (
                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full capitalize mt-1 inline-block">
                      {mark.category}
                    </span>
                  )}
                </div>
                <label className="inline-flex items-center ml-2">
                  <input
                    type="checkbox"
                    checked={obtained}
                    onChange={() => handleCheckboxChange(mark.id)}
                    className="form-checkbox h-5 w-5 text-green-500 rounded focus:ring-green-500"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarksTab; 