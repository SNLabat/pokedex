import { useState, useEffect } from 'react';

const RibbonsTab = ({ pokemon, caughtStatus, updateRibbonStatus }) => {
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
    if (!caughtStatus || !caughtStatus[pokemonForm] || !caughtStatus[pokemonForm].ribbons) {
      return false;
    }
    return caughtStatus[pokemonForm].ribbons[ribbonId] || false;
  };

  // Toggle ribbon status
  const toggleRibbonStatus = (ribbonId) => {
    const currentStatus = getRibbonStatus(ribbonId);
    updateRibbonStatus(ribbonId, !currentStatus, pokemonForm);
  };

  return (
    <div>
      <p className="text-gray-400 mb-6">
        Click on a ribbon to mark it as "Obtained" or "Missing" for this Pokémon.
        Obtained ribbons will be included when exporting your collection data.
      </p>
      
      {Object.entries(ribbonsByGen).map(([gen, genRibbons]) => (
        genRibbons.length > 0 && (
          <div key={gen} className="mb-8">
            <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
              Generation {gen.replace('gen', '')} Ribbons
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {genRibbons.map(ribbon => (
                <div 
                  key={ribbon.id}
                  onClick={() => toggleRibbonStatus(ribbon.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    getRibbonStatus(ribbon.id)
                      ? 'bg-indigo-800 bg-opacity-50 hover:bg-indigo-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{ribbon.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      getRibbonStatus(ribbon.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {getRibbonStatus(ribbon.id) ? 'Obtained' : 'Missing'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{ribbon.description}</p>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default RibbonsTab; 