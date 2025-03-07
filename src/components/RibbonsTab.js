import { useState, useEffect } from 'react';

const RibbonsTab = ({ pokemon, caughtStatus, updateRibbonStatus, mainTypeColor }) => {
  const [failedImages, setFailedImages] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [clickedRibbon, setClickedRibbon] = useState(null);
  
  // Use theme color from pokemon's main type or default to indigo
  const themeColor = mainTypeColor || { 
    mainColor: '#6366f1', // indigo-500
    darkColor: '#4338ca', // indigo-700 
    textColor: '#ffffff'  // white
  };
  
  // Initialize ribbons data
  const ribbons = [
    // Gen 3 Contest Ribbons
    { id: 'cool-ribbon', name: 'Cool Ribbon', description: 'A Ribbon awarded for winning the Cool Contest in Normal Rank.', generation: 'gen3' },
    { id: 'cool-ribbon-super', name: 'Cool Ribbon Super', description: 'A Ribbon awarded for winning the Cool Contest in Super Rank.', generation: 'gen3' },
    { id: 'cool-ribbon-hyper', name: 'Cool Ribbon Hyper', description: 'A Ribbon awarded for winning the Cool Contest in Hyper Rank.', generation: 'gen3' },
    { id: 'cool-ribbon-master', name: 'Cool Ribbon Master', description: 'A Ribbon awarded for winning the Cool Contest in Master Rank.', generation: 'gen3' },
    { id: 'beauty-ribbon', name: 'Beauty Ribbon', description: 'A Ribbon awarded for winning the Beauty Contest in Normal Rank.', generation: 'gen3' },
    { id: 'beauty-ribbon-super', name: 'Beauty Ribbon Super', description: 'A Ribbon awarded for winning the Beauty Contest in Super Rank.', generation: 'gen3' },
    { id: 'beauty-ribbon-hyper', name: 'Beauty Ribbon Hyper', description: 'A Ribbon awarded for winning the Beauty Contest in Hyper Rank.', generation: 'gen3' },
    { id: 'beauty-ribbon-master', name: 'Beauty Ribbon Master', description: 'A Ribbon awarded for winning the Beauty Contest in Master Rank.', generation: 'gen3' },
    { id: 'cute-ribbon', name: 'Cute Ribbon', description: 'A Ribbon awarded for winning the Cute Contest in Normal Rank.', generation: 'gen3' },
    { id: 'cute-ribbon-super', name: 'Cute Ribbon Super', description: 'A Ribbon awarded for winning the Cute Contest in Super Rank.', generation: 'gen3' },
    { id: 'cute-ribbon-hyper', name: 'Cute Ribbon Hyper', description: 'A Ribbon awarded for winning the Cute Contest in Hyper Rank.', generation: 'gen3' },
    { id: 'cute-ribbon-master', name: 'Cute Ribbon Master', description: 'A Ribbon awarded for winning the Cute Contest in Master Rank.', generation: 'gen3' },
    { id: 'smart-ribbon', name: 'Smart Ribbon', description: 'A Ribbon awarded for winning the Smart Contest in Normal Rank.', generation: 'gen3' },
    { id: 'smart-ribbon-super', name: 'Smart Ribbon Super', description: 'A Ribbon awarded for winning the Smart Contest in Super Rank.', generation: 'gen3' },
    { id: 'smart-ribbon-hyper', name: 'Smart Ribbon Hyper', description: 'A Ribbon awarded for winning the Smart Contest in Hyper Rank.', generation: 'gen3' },
    { id: 'smart-ribbon-master', name: 'Smart Ribbon Master', description: 'A Ribbon awarded for winning the Smart Contest in Master Rank.', generation: 'gen3' },
    { id: 'tough-ribbon', name: 'Tough Ribbon', description: 'A Ribbon awarded for winning the Tough Contest in Normal Rank.', generation: 'gen3' },
    { id: 'tough-ribbon-super', name: 'Tough Ribbon Super', description: 'A Ribbon awarded for winning the Tough Contest in Super Rank.', generation: 'gen3' },
    { id: 'tough-ribbon-hyper', name: 'Tough Ribbon Hyper', description: 'A Ribbon awarded for winning the Tough Contest in Hyper Rank.', generation: 'gen3' },
    { id: 'tough-ribbon-master', name: 'Tough Ribbon Master', description: 'A Ribbon awarded for winning the Tough Contest in Master Rank.', generation: 'gen3' },
    
    // Gen 3 Battle Ribbons
    { id: 'winning-ribbon', name: 'Winning Ribbon', description: 'A Ribbon awarded for clearing Lv. 50 of the Battle Tower\'s Battle Dome.', generation: 'gen3' },
    { id: 'victory-ribbon', name: 'Victory Ribbon', description: 'A Ribbon awarded for clearing Lv. 100 of the Battle Tower\'s Battle Dome.', generation: 'gen3' },
    { id: 'artist-ribbon', name: 'Artist Ribbon', description: 'A Ribbon awarded for being chosen as a super sketch model in Hoenn.', generation: 'gen3' },
    { id: 'effort-ribbon', name: 'Effort Ribbon', description: 'A Ribbon awarded for being completely trained (maximum EVs).', generation: 'gen3' },
    { id: 'champion-ribbon', name: 'Champion Ribbon', description: 'A Ribbon awarded for clearing the Pokémon League and entering the Hall of Fame.', generation: 'gen3' },
    
    // Gen 4 Ribbons
    { id: 'sinnoh-champ-ribbon', name: 'Sinnoh Champ Ribbon', description: 'A Ribbon awarded for beating the Sinnoh Elite Four and becoming Champion.', generation: 'gen4' },
    { id: 'ability-ribbon', name: 'Ability Ribbon', description: 'A Ribbon awarded for defeating the Tower Tycoon at the Battle Tower.', generation: 'gen4' },
    { id: 'great-ability-ribbon', name: 'Great Ability Ribbon', description: 'A Ribbon awarded for defeating the Tower Tycoon at the Battle Tower.', generation: 'gen4' },
    { id: 'double-ability-ribbon', name: 'Double Ability Ribbon', description: 'A Ribbon awarded for defeating the Tower Tycoon at the Battle Tower in Double battles.', generation: 'gen4' },
    { id: 'multi-ability-ribbon', name: 'Multi Ability Ribbon', description: 'A Ribbon awarded for defeating the Tower Tycoon at the Battle Tower in Multi battles.', generation: 'gen4' },
    { id: 'pair-ability-ribbon', name: 'Pair Ability Ribbon', description: 'A Ribbon awarded for defeating the Tower Tycoon at the Battle Tower in Link Multi battles.', generation: 'gen4' },
    { id: 'world-ability-ribbon', name: 'World Ability Ribbon', description: 'A Ribbon awarded for defeating the World Champion at the Battle Tower.', generation: 'gen4' },
    { id: 'alert-ribbon', name: 'Alert Ribbon', description: 'A Ribbon for recalling an invigorating event that created life energy.', generation: 'gen4' },
    { id: 'shock-ribbon', name: 'Shock Ribbon', description: 'A Ribbon for recalling a thrilling event that made life more exciting.', generation: 'gen4' },
    { id: 'downcast-ribbon', name: 'Downcast Ribbon', description: 'A Ribbon for recalling feelings of sadness that added spice to life.', generation: 'gen4' },
    { id: 'careless-ribbon', name: 'Careless Ribbon', description: 'A Ribbon for recalling a careless error that helped steer life decisions.', generation: 'gen4' },
    { id: 'relax-ribbon', name: 'Relax Ribbon', description: 'A Ribbon for recalling a refreshing event that added sparkle to life.', generation: 'gen4' },
    { id: 'snooze-ribbon', name: 'Snooze Ribbon', description: 'A Ribbon for recalling a deep slumber that made life soothing.', generation: 'gen4' },
    { id: 'smile-ribbon', name: 'Smile Ribbon', description: 'A Ribbon for recalling that smiles enrich the quality of life.', generation: 'gen4' },
    
    // Gen 5 and later ribbons
    { id: 'gorgeous-ribbon', name: 'Gorgeous Ribbon', description: 'A gorgeous and very special Ribbon.', generation: 'gen5' },
    { id: 'royal-ribbon', name: 'Royal Ribbon', description: 'A high-class Ribbon of regal elegance.', generation: 'gen5' },
    { id: 'gorgeous-royal-ribbon', name: 'Gorgeous Royal Ribbon', description: 'A gorgeous Ribbon of regal elegance.', generation: 'gen5' },
    { id: 'kalos-champ-ribbon', name: 'Kalos Champ Ribbon', description: 'A Ribbon awarded for beating the Kalos Elite Four and becoming Champion.', generation: 'gen6' },
    { id: 'hoenn-champ-ribbon', name: 'Hoenn Champ Ribbon', description: 'A Ribbon awarded for beating the Hoenn Elite Four and becoming Champion.', generation: 'gen6' },
    { id: 'battle-tree-great-ribbon', name: 'Battle Tree Great Ribbon', description: 'A Ribbon awarded for achieving victory in the Battle Tree.', generation: 'gen7' },
    { id: 'battle-tree-master-ribbon', name: 'Battle Tree Master Ribbon', description: 'A Ribbon awarded for achieving a certified result in the Battle Tree.', generation: 'gen7' },
    { id: 'galar-champ-ribbon', name: 'Galar Champ Ribbon', description: 'A Ribbon awarded for beating the Galar Champion and completing the Gym Challenge.', generation: 'gen8' },
    { id: 'tower-master-ribbon', name: 'Tower Master Ribbon', description: 'A Ribbon awarded for achieving the Rank of Master in the Battle Tower.', generation: 'gen8' },
    { id: 'master-rank-ribbon', name: 'Master Rank Ribbon', description: 'A Ribbon awarded for reaching Master Ball tier in Ranked Battles.', generation: 'gen8' }
  ];

  // Group ribbons by generation for better organization
  const ribbonsByGen = {
    'gen3': ribbons.filter(r => r.generation === 'gen3'),
    'gen4': ribbons.filter(r => r.generation === 'gen4'),
    'gen5': ribbons.filter(r => r.generation === 'gen5'),
    'gen6': ribbons.filter(r => r.generation === 'gen6'),
    'gen7': ribbons.filter(r => r.generation === 'gen7'),
    'gen8': ribbons.filter(r => r.generation === 'gen8'),
    'gen9': ribbons.filter(r => r.generation === 'gen9')
  };

  // Filter to show only ribbons for current Pokémon form
  const pokemonForm = 'default'; // You can update this if needed to track different forms

  // Get the ribbon status for the current Pokémon
  const getRibbonStatus = (ribbonId) => {
    // Check if caughtStatus has ribbons directly
    if (caughtStatus && caughtStatus.ribbons && caughtStatus.ribbons[ribbonId] !== undefined) {
      const status = caughtStatus.ribbons[ribbonId];
      if (status === true) return 'obtained';
      if (status === false) return 'missing';
      return status;
    }
    
    // Check if caughtStatus has default form with ribbons
    if (caughtStatus && caughtStatus.default && caughtStatus.default.ribbons && caughtStatus.default.ribbons[ribbonId] !== undefined) {
      const status = caughtStatus.default.ribbons[ribbonId];
      if (status === true) return 'obtained';
      if (status === false) return 'missing';
      return status;
    }
    
    // Default to unchecked if no status found
    return 'unchecked';
  };

  // Cycle through ribbon statuses: unchecked -> missing -> obtained -> unchecked
  const cycleRibbonStatus = (ribbonId) => {
    setClickedRibbon(ribbonId);
    
    const currentStatus = getRibbonStatus(ribbonId);
    let newStatus;
    
    if (currentStatus === 'unchecked') {
      newStatus = 'missing';
    } else if (currentStatus === 'missing') {
      newStatus = 'obtained';
    } else {
      newStatus = 'unchecked';
    }
    
    // Call the parent component's update function with the new status
    updateRibbonStatus(ribbonId, newStatus);
    
    // Clear the animation after a short delay
    setTimeout(() => {
      setClickedRibbon(null);
    }, 300);
  };

  // Check search filter
  const filterRibbons = (ribbon) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return ribbon.name.toLowerCase().includes(searchLower) || 
           ribbon.description.toLowerCase().includes(searchLower);
  };

  // Get status color and text based on ribbon status
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
      {/* Search input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search ribbons..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
          style={{ borderColor: themeColor.mainColor, '--tw-ring-color': themeColor.mainColor }}
        />
      </div>
      
      <div className="mb-6">
        <p className="text-gray-400 mb-2">
          Click on a ribbon to cycle through tracking states:
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
      
      {Object.entries(ribbonsByGen).map(([gen, genRibbons]) => {
        // Filter ribbons based on search
        const filteredRibbons = genRibbons.filter(filterRibbons);
        
        // Skip empty generations after filtering
        if (filteredRibbons.length === 0) return null;
        
        return (
          <div key={gen} className="mb-8">
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
              Generation {gen.replace('gen', '')} Ribbons
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredRibbons.map(ribbon => {
                const status = getRibbonStatus(ribbon.id);
                const isClicked = clickedRibbon === ribbon.id;
                const statusStyles = getStatusStyles(status);
                
                return (
                  <div 
                    key={ribbon.id}
                    onClick={() => cycleRibbonStatus(ribbon.id)}
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
                      <h4 className="font-medium">{ribbon.name}</h4>
                      <span className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: statusStyles.bgColor,
                          color: statusStyles.textColor
                        }}
                      >
                        {statusStyles.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{ribbon.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RibbonsTab; 