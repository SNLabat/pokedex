import Image from 'next/image';
import Link from 'next/link';

// Component for displaying generation cards on the home page
export default function GenerationCard({ gen }) {
  return (
    <Link href={`/pokedex?gen=${gen.id}`}>
      <a className="block relative group rounded-xl overflow-hidden shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl h-60">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gen.color} opacity-80 group-hover:opacity-90 transition-opacity`}></div>
        
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
} 