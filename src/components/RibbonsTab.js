import { useState, useEffect } from 'react';
import Image from 'next/image';

const RibbonsTab = ({ pokemon, caughtStatus, updateRibbonStatus, mainTypeColor }) => {
  const [failedImages, setFailedImages] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  // Use theme color from pokemon's main type or default to indigo
  const themeColor = mainTypeColor || { 
    mainColor: '#6366f1', // indigo-500
    darkColor: '#4338ca', // indigo-700 
    textColor: '#ffffff'  // white
  };
  
  // Ribbon icons mapping
  const ribbonIcons = {
    'cool-ribbon': { icon: '/img/Ribbons-Marks/coolnormalribbon.png', color: '#FF5544', fallback: '🎀' },
    'cool-ribbon-super': { icon: '/img/Ribbons-Marks/coolsuperribbon.png', color: '#FF5544', fallback: '🎀' },
    'cool-ribbon-hyper': { icon: '/img/Ribbons-Marks/coolhyperribbon.png', color: '#FF5544', fallback: '🎀' },
    'cool-ribbon-master': { icon: '/img/Ribbons-Marks/coolmasterribbon.png', color: '#FF5544', fallback: '🎀' },
    'beauty-ribbon': { icon: '/img/Ribbons-Marks/beautynormalribbon.png', color: '#FF77AA', fallback: '🎀' },
    'beauty-ribbon-super': { icon: '/img/Ribbons-Marks/beautysuperribbon.png', color: '#FF77AA', fallback: '🎀' },
    'beauty-ribbon-hyper': { icon: '/img/Ribbons-Marks/beautyhyperribbon.png', color: '#FF77AA', fallback: '🎀' },
    'beauty-ribbon-master': { icon: '/img/Ribbons-Marks/beautymasterribbon.png', color: '#FF77AA', fallback: '🎀' },
    'cute-ribbon': { icon: '/img/Ribbons-Marks/cutenormalribbon.png', color: '#FFAA33', fallback: '🎀' },
    'cute-ribbon-super': { icon: '/img/Ribbons-Marks/cutesuperribbon.png', color: '#FFAA33', fallback: '🎀' },
    'cute-ribbon-hyper': { icon: '/img/Ribbons-Marks/cutehyperribbon.png', color: '#FFAA33', fallback: '🎀' },
    'cute-ribbon-master': { icon: '/img/Ribbons-Marks/cutemasterribbon.png', color: '#FFAA33', fallback: '🎀' },
    'smart-ribbon': { icon: '/img/Ribbons-Marks/smartnormalribbon.png', color: '#33AA66', fallback: '🎀' },
    'smart-ribbon-super': { icon: '/img/Ribbons-Marks/smartsuperribbon.png', color: '#33AA66', fallback: '🎀' },
    'smart-ribbon-hyper': { icon: '/img/Ribbons-Marks/smarthyperribbon.png', color: '#33AA66', fallback: '🎀' },
    'smart-ribbon-master': { icon: '/img/Ribbons-Marks/smartmasterribbon.png', color: '#33AA66', fallback: '🎀' },
    'tough-ribbon': { icon: '/img/Ribbons-Marks/toughnormalribbon.png', color: '#BB5544', fallback: '🎀' },
    'tough-ribbon-super': { icon: '/img/Ribbons-Marks/toughsuperribbon.png', color: '#BB5544', fallback: '🎀' },
    'tough-ribbon-hyper': { icon: '/img/Ribbons-Marks/toughhyperribbon.png', color: '#BB5544', fallback: '🎀' },
    'tough-ribbon-master': { icon: '/img/Ribbons-Marks/toughmasterribbon.png', color: '#BB5544', fallback: '🎀' },
    'champion-ribbon': { icon: '/img/Ribbons-Marks/championribbon.png', color: '#FFCC33', fallback: '🏆' },
    'sinnoh-champion-ribbon': { icon: '/img/Ribbons-Marks/championribbon.png', color: '#FFCC33', fallback: '🏆' },
    'hoenn-champion-ribbon': { icon: '/img/Ribbons-Marks/championribbon.png', color: '#FFCC33', fallback: '🏆' },
    'kalos-champion-ribbon': { icon: '/img/Ribbons-Marks/kaloschampionribbon.png', color: '#FFCC33', fallback: '🏆' },
    'alola-champion-ribbon': { icon: '/img/Ribbons-Marks/alolachampionribbon.png', color: '#FFCC33', fallback: '🏆' },
    'galar-champion-ribbon': { icon: '/img/Ribbons-Marks/galarchampionribbon.png', color: '#FFCC33', fallback: '🏆' },
    'winning-ribbon': { icon: '/img/Ribbons-Marks/winningribbon.png', color: '#FFCC33', fallback: '🏆' },
    'victory-ribbon': { icon: '/img/Ribbons-Marks/victoryribbon.png', color: '#FFCC33', fallback: '🏆' },
    'ability-ribbon': { icon: '/img/Ribbons-Marks/abilityribbon.png', color: '#7766EE', fallback: '✨' },
    'great-ability-ribbon': { icon: '/img/Ribbons-Marks/greatabilityribbon.png', color: '#7766EE', fallback: '✨' },
    'double-ability-ribbon': { icon: '/img/Ribbons-Marks/doubleabilityribbon.png', color: '#7766EE', fallback: '✨' },
    'multi-ability-ribbon': { icon: '/img/Ribbons-Marks/multiabilityribbon.png', color: '#7766EE', fallback: '✨' },
    'pair-ability-ribbon': { icon: '/img/Ribbons-Marks/pairabilityribbon.png', color: '#7766EE', fallback: '✨' },
    'world-ability-ribbon': { icon: '/img/Ribbons-Marks/worldabilityribbon.png', color: '#7766EE', fallback: '✨' },
    'master-rank-ribbon': { icon: '/img/Ribbons-Marks/masterrankribbon.png', color: '#7766EE', fallback: '✨' },
    'alert-ribbon': { icon: '/img/Ribbons-Marks/alertribbon.png', color: '#FF5544', fallback: '🎀' },
    'shock-ribbon': { icon: '/img/Ribbons-Marks/shockribbon.png', color: '#FFCC33', fallback: '⚡' },
    'downcast-ribbon': { icon: '/img/Ribbons-Marks/downcastribbon.png', color: '#7766EE', fallback: '😔' },
    'careless-ribbon': { icon: '/img/Ribbons-Marks/carelessribbon.png', color: '#33AADD', fallback: '🎀' },
    'relax-ribbon': { icon: '/img/Ribbons-Marks/relaxribbon.png', color: '#33AA66', fallback: '😌' },
    'snooze-ribbon': { icon: '/img/Ribbons-Marks/snoozeribbon.png', color: '#7766EE', fallback: '😴' },
    'smile-ribbon': { icon: '/img/Ribbons-Marks/smileribbon.png', color: '#FFAA33', fallback: '😊' },
    'gorgeous-ribbon': { icon: '/img/Ribbons-Marks/gorgeousribbon.png', color: '#FF77AA', fallback: '✨' },
    'royal-ribbon': { icon: '/img/Ribbons-Marks/royalribbon.png', color: '#FFCC33', fallback: '👑' },
    'gorgeous-royal-ribbon': { icon: '/img/Ribbons-Marks/gorgeousroyalribbon.png', color: '#FFCC33', fallback: '👑' },
    'artist-ribbon': { icon: '/img/Ribbons-Marks/artistribbon.png', color: '#FF77AA', fallback: '🎨' },
    'footprint-ribbon': { icon: '/img/Ribbons-Marks/footprintribbon.png', color: '#33AADD', fallback: '👣' },
    'record-ribbon': { icon: '/img/Ribbons-Marks/recordribbon.png', color: '#FFCC33', fallback: '📊' },
    'legend-ribbon': { icon: '/img/Ribbons-Marks/legendribbon.png', color: '#FFCC33', fallback: '🏆' },
    'country-ribbon': { icon: '/img/Ribbons-Marks/countryribbon.png', color: '#33AADD', fallback: '🌍' },
    'national-ribbon': { icon: '/img/Ribbons-Marks/nationalribbon.png', color: '#33AADD', fallback: '🌎' },
    'earth-ribbon': { icon: '/img/Ribbons-Marks/earthribbon.png', color: '#33AADD', fallback: '🌏' },
    'world-ribbon': { icon: '/img/Ribbons-Marks/worldribbon.png', color: '#33AADD', fallback: '🌐' },
    'classic-ribbon': { icon: '/img/Ribbons-Marks/classicribbon.png', color: '#BB5544', fallback: '🎀' },
    'premier-ribbon': { icon: '/img/Ribbons-Marks/premierribbon.png', color: '#FFCC33', fallback: '🎖️' },
    'event-ribbon': { icon: '/img/Ribbons-Marks/eventribbon.png', color: '#FFCC33', fallback: '🎉' },
    'birthday-ribbon': { icon: '/img/Ribbons-Marks/birthdayribbon.png', color: '#FF77AA', fallback: '🎂' },
    'special-ribbon': { icon: '/img/Ribbons-Marks/specialribbon.png', color: '#FFCC33', fallback: '🎁' },
    'souvenir-ribbon': { icon: '/img/Ribbons-Marks/souvenirribbon.png', color: '#FFCC33', fallback: '🎁' },
    'wishing-ribbon': { icon: '/img/Ribbons-Marks/wishingribbon.png', color: '#FFCC33', fallback: '✨' },
    'battle-champion-ribbon': { icon: '/img/Ribbons-Marks/battlechampribbon.png', color: '#FFCC33', fallback: '🏆' },
    'regional-champion-ribbon': { icon: '/img/Ribbons-Marks/regionalchampribbon.png', color: '#FFCC33', fallback: '🏆' },
    'national-champion-ribbon': { icon: '/img/Ribbons-Marks/nationalchampribbon.png', color: '#FFCC33', fallback: '🏆' },
    'world-champion-ribbon': { icon: '/img/Ribbons-Marks/worldchampribbon.png', color: '#FFCC33', fallback: '🏆' },
    'contest-memory-ribbon': { icon: '/img/Ribbons-Marks/contestmemoryribbon.png', color: '#FF77AA', fallback: '🎀' },
    'battle-memory-ribbon': { icon: '/img/Ribbons-Marks/battlememoryribbon.png', color: '#FFCC33', fallback: '⚔️' },
    'contest-star-ribbon': { icon: '/img/Ribbons-Marks/conteststarribbon.png', color: '#FF77AA', fallback: '⭐' },
    'coolness-master-ribbon': { icon: '/img/Ribbons-Marks/coolnessmasterribbon.png', color: '#FF5544', fallback: '🎀' },
    'beauty-master-ribbon': { icon: '/img/Ribbons-Marks/beautymasterribbon.png', color: '#FF77AA', fallback: '🎀' },
    'cuteness-master-ribbon': { icon: '/img/Ribbons-Marks/cutenessmasterribbon.png', color: '#FFAA33', fallback: '🎀' },
    'cleverness-master-ribbon': { icon: '/img/Ribbons-Marks/clevernessmasterribbon.png', color: '#33AA66', fallback: '🎀' },
    'toughness-master-ribbon': { icon: '/img/Ribbons-Marks/toughnessmasterribbon.png', color: '#BB5544', fallback: '🎀' },
    'battle-tree-great-ribbon': { icon: '/img/Ribbons-Marks/battletreegreatribbon.png', color: '#FFCC33', fallback: '🏆' },
    'battle-tree-master-ribbon': { icon: '/img/Ribbons-Marks/battletreemasterribbon.png', color: '#FFCC33', fallback: '🏆' },
    'battle-royal-master-ribbon': { icon: '/img/Ribbons-Marks/battleroyalmasterribbon.png', color: '#FFCC33', fallback: '👑' },
    'best-friends-ribbon': { icon: '/img/Ribbons-Marks/bestfriendsribbon.png', color: '#FF77AA', fallback: '❤️' },
    'training-ribbon': { icon: '/img/Ribbons-Marks/trainingribbon.png', color: '#BB5544', fallback: '💪' },
    'battle-royal-ribbon': { icon: '/img/Ribbons-Marks/battleroyalribbon.png', color: '#FFCC33', fallback: '👑' },
    'master-ribbon': { icon: '/img/Ribbons-Marks/masterribbon.png', color: '#FFCC33', fallback: '🏆' },
    'expert-battler-ribbon': { icon: '/img/Ribbons-Marks/expertbattlerribbon.png', color: '#FFCC33', fallback: '⚔️' },
    'effort-ribbon': { icon: '/img/Ribbons-Marks/effortribbon.png', color: '#BB5544', fallback: '💪' },
    'blue-ribbon': { icon: '/img/Ribbons-Marks/blueribbon.png', color: '#33AADD', fallback: '🎀' },
    'green-ribbon': { icon: '/img/Ribbons-Marks/greenribbon.png', color: '#33AA66', fallback: '🎀' },
    'history-ribbon': { icon: '/img/Ribbons-Marks/historyribbon.png', color: '#BB5544', fallback: '📜' },
    'land-ribbon': { icon: '/img/Ribbons-Marks/landribbon.png', color: '#BB5544', fallback: '🏔️' },
    'marine-ribbon': { icon: '/img/Ribbons-Marks/marineribbon.png', color: '#33AADD', fallback: '🌊' },
    'festival-ribbon': { icon: '/img/Ribbons-Marks/festivalribbon.png', color: '#FFAA33', fallback: '🎉' },
    'carnival-ribbon': { icon: '/img/Ribbons-Marks/carnivalribbon.png', color: '#FFAA33', fallback: '🎪' },
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
    { id: 'sinnoh-champion-ribbon', name: 'Sinnoh Champ Ribbon', description: 'A Ribbon awarded for beating the Sinnoh Elite Four and becoming Champion.', generation: 'gen4' },
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
    { id: 'kalos-champion-ribbon', name: 'Kalos Champ Ribbon', description: 'A Ribbon awarded for beating the Kalos Elite Four and becoming Champion.', generation: 'gen6' },
    { id: 'hoenn-champion-ribbon', name: 'Hoenn Champ Ribbon', description: 'A Ribbon awarded for beating the Hoenn Elite Four and becoming Champion.', generation: 'gen6' },
    { id: 'battle-tree-great-ribbon', name: 'Battle Tree Great Ribbon', description: 'A Ribbon awarded for achieving victory in the Battle Tree.', generation: 'gen7' },
    { id: 'battle-tree-master-ribbon', name: 'Battle Tree Master Ribbon', description: 'A Ribbon awarded for achieving a certified result in the Battle Tree.', generation: 'gen7' },
    { id: 'galar-champion-ribbon', name: 'Galar Champ Ribbon', description: 'A Ribbon awarded for beating the Galar Champion and completing the Gym Challenge.', generation: 'gen8' },
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

  // Handle image error
  const handleImageError = (ribbonId) => {
    setFailedImages(prev => ({ ...prev, [ribbonId]: true }));
  };

  // Check if a ribbon is obtained
  const isRibbonObtained = (ribbonId) => {
    // Check if caughtStatus has ribbons directly
    if (caughtStatus && caughtStatus.ribbons && caughtStatus.ribbons[ribbonId] !== undefined) {
      return caughtStatus.ribbons[ribbonId] === true || caughtStatus.ribbons[ribbonId] === 'obtained';
    }
    
    // Check if caughtStatus has default form with ribbons
    if (caughtStatus && caughtStatus.default && caughtStatus.default.ribbons && caughtStatus.default.ribbons[ribbonId] !== undefined) {
      return caughtStatus.default.ribbons[ribbonId] === true || caughtStatus.default.ribbons[ribbonId] === 'obtained';
    }
    
    return false;
  };

  // Handle checkbox change
  const handleCheckboxChange = (ribbonId) => {
    // Toggle the ribbon status
    updateRibbonStatus(ribbonId);
  };

  // Check search filter
  const filterRibbons = (ribbon) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return ribbon.name.toLowerCase().includes(searchLower) || 
           ribbon.description.toLowerCase().includes(searchLower);
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
          Check the box to mark a ribbon as obtained:
        </p>
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
                const obtained = isRibbonObtained(ribbon.id);
                const iconData = ribbonIcons[ribbon.id] || { 
                  icon: '/img/Ribbons-Marks/classicribbon.png',
                  color: '#AA99CC', 
                  fallback: '🎀'
                };
                const useIconFallback = failedImages[ribbon.id];
                
                return (
                  <div 
                    key={ribbon.id}
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
                            alt={ribbon.name}
                            width={40}
                            height={40}
                            className="object-contain"
                            onError={() => handleImageError(ribbon.id)}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{ribbon.name}</h4>
                        <p className="text-sm text-gray-400">{ribbon.description}</p>
                      </div>
                      <label className="inline-flex items-center ml-2">
                        <input
                          type="checkbox"
                          checked={obtained}
                          onChange={() => handleCheckboxChange(ribbon.id)}
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
      })}
    </div>
  );
};

export default RibbonsTab; 