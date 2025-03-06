import React from 'react';
import Image from 'next/image';

const OriginMarks = ({ originMarks = {} }) => {
  // Define origin mark data with images and descriptions
  const originMarkData = {
    'pentagon-symbol': {
      name: 'Pentagon Symbol',
      description: 'Caught in Pokémon X/Y or ORAS (Gen 6)',
      image: '/img/origin-marks/pentagon.png',
      fallback: '⬟'
    },
    'clover-symbol': {
      name: 'Clover Symbol',
      description: 'Caught in Pokémon Sun/Moon or USUM (Gen 7)',
      image: '/img/origin-marks/clover.png',
      fallback: '♣'
    },
    'gameboy-symbol': {
      name: 'Game Boy Symbol',
      description: 'Transferred from Pokémon Virtual Console (Gen 1-2)',
      image: '/img/origin-marks/GB.png',
      fallback: 'GB'
    },
    'go-symbol': {
      name: 'GO Symbol',
      description: 'Transferred from Pokémon GO',
      image: '/img/origin-marks/GO.png',
      fallback: 'GO'
    },
    'lets-go-symbol': {
      name: 'Let\'s Go Symbol',
      description: 'Caught in Pokémon Let\'s Go Pikachu/Eevee',
      image: '/img/origin-marks/LetsGo.png',
      fallback: 'LG'
    },
    'galar-symbol': {
      name: 'Galar Symbol',
      description: 'Caught in Pokémon Sword/Shield',
      image: '/img/origin-marks/galar.png',
      fallback: 'G'
    },
    'sinnoh-symbol': {
      name: 'Sinnoh Symbol',
      description: 'Caught in Brilliant Diamond/Shining Pearl',
      image: '/img/origin-marks/bdsp.png',
      fallback: '◇'
    },
    'arceus-symbol': {
      name: 'Arceus Symbol',
      description: 'Caught in Legends: Arceus',
      image: '/img/origin-marks/arceus.png',
      fallback: '⌒'
    },
    'paldea-symbol': {
      name: 'Paldea Symbol',
      description: 'Caught in Scarlet/Violet',
      image: '/img/origin-marks/paldea.png',
      fallback: 'P'
    }
  };

  // Filter to only show obtained marks
  const obtainedMarks = Object.keys(originMarks).filter(mark => originMarks[mark]);

  if (obtainedMarks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {obtainedMarks.map(markId => {
        const mark = originMarkData[markId];
        if (!mark) return null;

        return (
          <div
            key={markId}
            className="relative group"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-gray-800 rounded-full border border-gray-700">
              <Image
                src={mark.image}
                alt={mark.name}
                width={16}
                height={16}
                className="object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span
                className="hidden text-sm font-medium"
                style={{ color: '#e2e8f0' }}
              >
                {mark.fallback}
              </span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              {mark.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OriginMarks; 