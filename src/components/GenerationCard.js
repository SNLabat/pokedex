import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Component for displaying generation cards on the home page
const GenerationCard = ({ gen }) => {
  // Define gradient color classes for each generation
  const gradientColors = {
    1: 'from-red-500 to-blue-500',         // Kanto: Red to Blue
    2: 'from-yellow-500 to-amber-600',      // Johto: Gold to Silver
    3: 'from-red-600 to-blue-600',          // Hoenn: Ruby to Sapphire
    4: 'from-blue-600 to-pink-500',         // Sinnoh: Diamond to Pearl
    5: 'from-gray-800 to-gray-200',         // Unova: Black to White
    6: 'from-blue-500 to-red-500',          // Kalos: X to Y
    7: 'from-yellow-400 to-blue-400',       // Alola: Sun to Moon
    8: 'from-red-500 to-blue-600',          // Galar: Sword to Shield
    9: 'from-purple-600 to-orange-500',     // Paldea: Violet to Scarlet
  };

  return (
    <Link href={`/pokedex?gen=${gen.id}`}>
      <a className="block relative group rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl h-60">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[gen.id] || 'from-gray-700 to-gray-900'} opacity-80 group-hover:opacity-90 transition-opacity`}></div>
        
        {/* Content */}
        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-block px-3 py-1 bg-black bg-opacity-50 rounded-full text-sm mb-2">
                  Generation {gen.id}
                </span>
                <h3 className="text-2xl font-bold">{gen.name} Region</h3>
              </div>
              <span className="text-sm bg-gray-900 bg-opacity-70 px-2 py-1 rounded">
                {gen.pokemon} Pokémon
              </span>
            </div>
            <p className="text-sm text-gray-100 mt-1">{gen.years}</p>
          </div>
          
          {/* Starter Pokémon */}
          <div>
            <div className="flex justify-center mt-4 space-x-2">
              {gen.starters.map(id => (
                <div key={id} className="w-16 h-16 bg-white bg-opacity-20 rounded-full p-1 transform transition-transform hover:scale-110">
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                    alt={`Starter ${id}`}
                    width={64}
                    height={64}
                  />
                </div>
              ))}
            </div>
            <div className="block text-center mt-4 py-2 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-lg transition-all">
              Browse Gen {gen.id} Pokémon
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default GenerationCard; 