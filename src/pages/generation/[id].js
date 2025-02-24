import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getPokemonCollection } from '../../lib/dataManagement';
import pokeballOutline from '/public/img/pokeballoutline.png';

export default function GenerationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [pokemonData, setPokemonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [caughtStatus, setCaughtStatus] = useState({});
  
  const generations = [
    { id: '1', name: 'Kanto', years: '1996-1999', range: [1, 151] },
    { id: '2', name: 'Johto', years: '1999-2002', range: [152, 251] },
    { id: '3', name: 'Hoenn', years: '2002-2006', range: [252, 386] },
    { id: '4', name: 'Sinnoh', years: '2006-2010', range: [387, 493] },
    { id: '5', name: 'Unova', years: '2010-2013', range: [494, 649] },
    { id: '6', name: 'Kalos', years: '2013-2016', range: [650, 721] },
    { id: '7', name: 'Alola', years: '2016-2019', range: [722, 809] },
    { id: '8', name: 'Galar', years: '2019-2022', range: [810, 898] },
    { id: '9', name: 'Paldea', years: '2022-Present', range: [899, 1008] },
  ];
  
  const currentGen = generations.find(g => g.id === id) || generations[0];

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch collection data
      const collectionResult = await getPokemonCollection();
      if (collectionResult.success && collectionResult.data) {
        const statusMap = {};
        
        // Process the data into a more usable format
        Object.entries(collectionResult.data).forEach(([id, forms]) => {
          const mainForm = forms['default'] || Object.values(forms)[0];
          if (mainForm) {
            statusMap[id] = {
              caught: !!mainForm.caught,
              shiny: !!mainForm.shiny,
              alpha: !!mainForm.alpha
            };
          }
        });
        
        setCaughtStatus(statusMap);
      }
      
      try {
        const gen = generations.find(g => g.id === id);
        if (!gen) {
          router.push('/404');
          return;
        }
        
        // Fetch Pokémon in this generation's range
        const [start, end] = gen.range;
        const limit = end - start + 1;
        const offset = start - 1;
        
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await res.json();
        
        // Process Pokémon
        const pokemonList = await Promise.all(data.results.map(async (pokemon, index) => {
          const id = offset + index + 1;
          
          // Fetch detailed data
          const detailRes = await fetch(pokemon.url);
          const detail = await detailRes.json();
          
          return {
            id,
            name: pokemon.name,
            image: detail.sprites.other['official-artwork'].front_default,
            types: detail.types.map(t => t.type.name)
          };
        }));
        
        setPokemonData(pokemonList);
      } catch (error) {
        console.error('Error fetching Pokémon data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, router]);
  
  // Helper function for type colors
  const getTypeColor = (type) => {
    const colors = {
      normal: 'bg-gray-500',
      fire: 'bg-orange-600 text-white',
      water: 'bg-blue-600 text-white',
      electric: 'bg-yellow-500',
      grass: 'bg-green-600 text-white',
      ice: 'bg-cyan-500',
      fighting: 'bg-red-700 text-white',
      poison: 'bg-purple-600 text-white',
      ground: 'bg-amber-700 text-white',
      flying: 'bg-indigo-500 text-white',
      psychic: 'bg-pink-600 text-white',
      bug: 'bg-lime-600 text-white',
      rock: 'bg-stone-600 text-white',
      ghost: 'bg-purple-800 text-white',
      dragon: 'bg-violet-700 text-white',
      dark: 'bg-neutral-800 text-white',
      steel: 'bg-zinc-600 text-white',
      fairy: 'bg-pink-500 text-white'
    };
    
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Generation {id}: {currentGen.name} | Pokédex Live</title>
        <meta name="description" content={`Browse Pokémon from Generation ${id} (${currentGen.name})`} />
      </Head>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Generation {id}: {currentGen.name}</h1>
          <p className="text-gray-400">{currentGen.years} • Pokémon #{currentGen.range[0]}-{currentGen.range[1]}</p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {pokemonData.map(pokemon => {
              const status = caughtStatus[pokemon.id] || {};
              
              return (
                <Link key={pokemon.id} href={`/pokemon/${pokemon.name}`}>
                  <a className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-transform hover:scale-105 relative">
                    <div className="relative w-full pt-[100%]">
                      <Image
                        src={pokemon.image || `/img/unknown-pokemon.png`}
                        alt={pokemon.name}
                        layout="fill"
                        objectFit="contain"
                        className="absolute top-0 left-0"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">#{String(pokemon.id).padStart(3, '0')}</p>
                      <p className="font-medium capitalize">{pokemon.name.replace(/-/g, ' ')}</p>
                      <div className="flex gap-1 mt-1">
                        {pokemon.types.map(type => (
                          <span 
                            key={type} 
                            className={`text-xs px-2 py-1 rounded ${getTypeColor(type)}`}
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Catch Status Indicator */}
                    <div className="absolute bottom-2 right-2 p-1 rounded-full bg-opacity-70">
                      <div className="w-6 h-6 relative">
                        <Image
                          src={pokeballOutline}
                          alt="Catch status"
                          layout="fill"
                          className={`transition-transform ${
                            status.caught || status.shiny ? 'opacity-100' : 'opacity-40'
                          } ${
                            status.shiny ? 'filter-yellow' : 
                            status.alpha ? 'filter-red' : 
                            status.caught ? 'filter-green' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        )}
        
        {/* Navigation buttons */}
        <div className="mt-10 flex justify-between">
          {parseInt(id) > 1 && (
            <Link href={`/generation/${parseInt(id) - 1}`}>
              <a className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                ← Previous Generation
              </a>
            </Link>
          )}
          
          <Link href="/pokedex">
            <a className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
              View All Generations
            </a>
          </Link>
          
          {parseInt(id) < 9 && (
            <Link href={`/generation/${parseInt(id) + 1}`}>
              <a className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                Next Generation →
              </a>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  // Pre-render all generation pages
  const paths = Array.from({ length: 9 }, (_, i) => ({
    params: { id: String(i + 1) }
  }));

  return {
    paths,
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  return {
    props: {}
  };
} 