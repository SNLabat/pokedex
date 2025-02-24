// pages/index.js
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { parseWCBuffer } from '../utils/wcparse';
import { useRouter } from 'next/router';
import pokeballOutline from '/public/img/pokeballoutline.png';
import Head from 'next/head';
import { getPokemonCollection } from '../lib/dataManagement';

export default function Home() {
  const router = useRouter();
  const [selectedGen, setSelectedGen] = useState('all');
  const [userStats, setUserStats] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recentCaught, setRecentCaught] = useState([]);
  const [randomPokemon, setRandomPokemon] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const heroRef = useRef(null);
  
  const generations = [
    { id: 1, name: 'Kanto', years: '1996-1999', pokemon: 151, color: 'from-red-600 to-blue-600', starters: [1, 4, 7] },
    { id: 2, name: 'Johto', years: '1999-2002', pokemon: 100, color: 'from-yellow-500 to-silver-400', starters: [152, 155, 158] },
    { id: 3, name: 'Hoenn', years: '2002-2006', pokemon: 135, color: 'from-red-500 to-blue-500', starters: [252, 255, 258] },
    { id: 4, name: 'Sinnoh', years: '2006-2010', pokemon: 107, color: 'from-blue-600 to-pink-500', starters: [387, 390, 393] },
    { id: 5, name: 'Unova', years: '2010-2013', pokemon: 156, color: 'from-gray-800 to-gray-200', starters: [495, 498, 501] },
    { id: 6, name: 'Kalos', years: '2013-2016', pokemon: 72, color: 'from-blue-500 to-red-500', starters: [650, 653, 656] },
    { id: 7, name: 'Alola', years: '2016-2019', pokemon: 88, color: 'from-yellow-400 to-blue-400', starters: [722, 725, 728] },
    { id: 8, name: 'Galar', years: '2019-2022', pokemon: 89, color: 'from-red-500 to-blue-600', starters: [810, 813, 816] },
    { id: 9, name: 'Paldea', years: '2022-Present', pokemon: 110, color: 'from-purple-600 to-orange-500', starters: [906, 909, 912] },
  ];

  const featuredPokemon = [
    { id: 25, name: 'pikachu', desc: "The world's most recognizable Pokémon and mascot of the franchise." },
    { id: 143, name: 'snorlax', desc: "Known for blocking roads while sleeping and its incredible appetite." },
    { id: 384, name: 'rayquaza', desc: "A legendary Dragon Pokémon that lives in the ozone layer." },
    { id: 448, name: 'lucario', desc: "Can sense and manipulate aura, a type of energy emitted by all living things." },
    { id: 700, name: 'sylveon', desc: "Its ribbons emit a soothing aura that calms fights." },
  ];
  
  // Daily featured - changes each day
  const dailyFeaturedIndex = new Date().getDate() % featuredPokemon.length;
  const dailyFeatured = featuredPokemon[dailyFeaturedIndex];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Get user collection data
        const result = await getPokemonCollection();
        
        if (result.success && result.data) {
          // Process caught data
          const caught = [];
          let total = 0;
          let completed = 0;
          
          Object.entries(result.data).forEach(([id, forms]) => {
            const mainForm = forms['default'] || Object.values(forms)[0];
            if (mainForm && (mainForm.caught || mainForm.shiny)) {
              caught.push({
                id: parseInt(id),
                name: `pokemon-${id}`, // We'll fetch the actual name later
                isShiny: !!mainForm.shiny
              });
              
              if (mainForm.caught) completed++;
            }
            total++;
          });
          
          setUserStats({
            total,
            completed,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            shinies: caught.filter(p => p.isShiny).length
          });
          
          // Set the most recently caught Pokémon
          setRecentCaught(caught.slice(0, 6));
        }
        
        // Get recently viewed from localStorage
        if (typeof window !== 'undefined') {
          const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
          setRecentlyViewed(viewed.slice(0, 6));
        }
        
        // Get 6 random Pokémon
        const randomIds = Array.from({ length: 6 }, () => Math.floor(Math.random() * 898) + 1);
        setRandomPokemon(randomIds.map(id => ({ id, name: `pokemon-${id}` })));
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Hero parallax effect
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
        heroRef.current.style.opacity = 1 - (scrollY * 0.003);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Pokédex Live - Track Your Pokémon Collection</title>
        <meta name="description" content="Track your Pokémon collection across all games and generations" />
      </Head>

      {/* Hero Section */}
      <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div 
          ref={heroRef}
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: 'url(/img/hero-background.jpg)', 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.6)'
          }}
        ></div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">Pokédex Live</h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
            Track your Pokémon collection across all games and generations.
            Mark caught, shiny, and special forms. Build teams and share your progress.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push('/pokedex')}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full text-lg font-semibold transition-all transform hover:scale-105"
            >
              Browse Pokédex
            </button>
            
            <button
              onClick={() => {
                const randomId = Math.floor(Math.random() * 898) + 1;
                router.push(`/pokemon/${randomId}`);
              }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-semibold transition-all transform hover:scale-105"
            >
              Random Pokémon
            </button>
          </div>
        </div>
        
        {/* Floating Pokéballs */}
        <div className="absolute bottom-0 left-0 w-full">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end pb-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white shadow-lg relative overflow-hidden animate-bounce"
                  style={{ 
                    animationDuration: `${i * 0.5 + 1.5}s`,
                    animationDelay: `${i * 0.2}s` 
                  }}
                >
                  <div className="absolute inset-0 bg-red-600 rounded-t-full h-1/2"></div>
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <div className="w-1/3 h-1/3 bg-white rounded-full border-4 border-gray-800"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Find a Pokémon</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter Pokémon name or number..."
                className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <button
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </div>
            
            {/* Quick type filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Dragon'].map(type => (
                <button
                  key={type}
                  className={`px-3 py-1 rounded-full text-xs font-medium 
                    ${type === 'Fire' ? 'bg-orange-600' : ''}
                    ${type === 'Water' ? 'bg-blue-600' : ''}
                    ${type === 'Grass' ? 'bg-green-600' : ''}
                    ${type === 'Electric' ? 'bg-yellow-500 text-black' : ''}
                    ${type === 'Psychic' ? 'bg-pink-600' : ''}
                    ${type === 'Dragon' ? 'bg-purple-700' : ''}
                  `}
                >
                  {type}
                </button>
              ))}
              <Link href="/advanced-search">
                <a className="px-3 py-1 rounded-full text-xs font-medium bg-gray-600 hover:bg-gray-500">
                  More filters...
                </a>
              </Link>
            </div>
          </div>
        </div>

        {/* Pokémon of the Day */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Pokémon of the Day</h2>
          <div className="bg-gradient-to-r from-indigo-800 to-purple-800 rounded-xl overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/3 p-8 flex justify-center">
                <div className="relative w-48 h-48 transform transition-all hover:scale-110">
                  <Image 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dailyFeatured.id}.png`}
                    alt={dailyFeatured.name}
                    layout="fill"
                    objectFit="contain"
                    priority
                  />
                </div>
              </div>
              <div className="md:w-2/3 p-8">
                <span className="text-xl text-purple-300 font-semibold">#{dailyFeatured.id}</span>
                <h3 className="text-4xl font-bold capitalize mb-4">{dailyFeatured.name}</h3>
                <p className="text-lg text-purple-100 mb-6">{dailyFeatured.desc}</p>
                <Link href={`/pokemon/${dailyFeatured.name}`}>
                  <a className="inline-block px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-medium transition-colors">
                    View Details
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Showcase */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Explore Generations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {generations.map(gen => (
              <Link key={gen.id} href={`/generation/${gen.id}`}>
                <a className="block transform transition-transform hover:scale-105">
                  <div className={`bg-gradient-to-br ${gen.color} rounded-xl p-6 shadow-lg h-full`}>
                    <h3 className="text-2xl font-bold mb-2">Generation {gen.id}: {gen.name}</h3>
                    <p className="text-sm opacity-90 mb-3">{gen.years} • {gen.pokemon} Pokémon</p>
                    
                    <div className="flex justify-center gap-4 mt-6">
                      {gen.starters.map(id => (
                        <div key={id} className="w-16 h-16">
                          <Image
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                            alt={`Starter ${id}`}
                            width={64}
                            height={64}
                            className="object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* User Stats & Recent Activity */}
        {userStats && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">Your Collection</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Card */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Collection Progress</h3>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span>Completion</span>
                    <span>{userStats.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${userStats.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <span className="block text-2xl font-bold">{userStats.completed}</span>
                    <span className="text-sm text-gray-400">Caught</span>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <span className="block text-2xl font-bold">{userStats.shinies}</span>
                    <span className="text-sm text-gray-400">Shinies</span>
                  </div>
                </div>
              </div>
              
              {/* Recently Viewed */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Recently Viewed</h3>
                {recentlyViewed.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {recentlyViewed.map(pokemon => (
                      <Link key={pokemon.id} href={`/pokemon/${pokemon.name}`}>
                        <a className="block p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
                          <div className="relative w-12 h-12 mx-auto">
                            <Image
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                              alt={pokemon.name}
                              layout="fill"
                              objectFit="contain"
                            />
                          </div>
                          <span className="text-xs block mt-1 truncate capitalize">
                            {pokemon.name.replace(/-/g, ' ')}
                          </span>
                        </a>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-6">No recently viewed Pokémon</p>
                )}
              </div>
              
              {/* Recently Caught */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Recently Caught</h3>
                {recentCaught.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {recentCaught.map(pokemon => (
                      <Link key={pokemon.id} href={`/pokemon/${pokemon.id}`}>
                        <a className="block p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
                          <div className="relative w-12 h-12 mx-auto">
                            <Image
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                              alt={pokemon.name}
                              layout="fill"
                              objectFit="contain"
                            />
                            {pokemon.isShiny && (
                              <span className="absolute -top-1 -right-1 text-yellow-500">✨</span>
                            )}
                          </div>
                          <span className="text-xs block mt-1">#{pokemon.id}</span>
                        </a>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-6">Start catching Pokémon to track your progress!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">App Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Track Your Collection</h3>
              <p className="text-blue-100">
                Mark Pokémon as caught, shiny, or alpha. Track all forms and regional variants across all games.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-900 to-teal-900 rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Team Builder</h3>
              <p className="text-green-100">
                Create and save your dream teams. Analyze type coverage, strengths, and weaknesses.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 shadow-lg text-center">
              <div className="w-16 h-16 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Share Progress</h3>
              <p className="text-purple-100">
                Share your collection progress with friends. Export your data for safekeeping.
              </p>
            </div>
          </div>
        </div>

        {/* Discover Random Pokémon */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Discover Pokémon</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {randomPokemon.map(pokemon => (
              <Link key={pokemon.id} href={`/pokemon/${pokemon.id}`}>
                <a className="block bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all transform hover:scale-105">
                  <div className="relative w-24 h-24 mx-auto mb-2">
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                      alt={`Pokémon #${pokemon.id}`}
                      layout="fill"
                      objectFit="contain"
                    />
                  </div>
                  <span className="text-gray-400 text-xs">#{pokemon.id}</span>
                </a>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => {
                const randomIds = Array.from({ length: 6 }, () => Math.floor(Math.random() * 898) + 1);
                setRandomPokemon(randomIds.map(id => ({ id, name: `pokemon-${id}` })));
              }}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Show More Random Pokémon
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">Pokédex Live</h3>
              <p className="text-gray-400 text-sm">
                A comprehensive Pokémon tracking application
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-400 hover:text-blue-300">
                GitHub
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </a>
              <a href="#" className="text-blue-400 hover:text-blue-300">
                API Credits
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>
              Pokémon and Pokémon character names are trademarks of Nintendo. 
              This app is not affiliated with Nintendo, Game Freak, or The Pokémon Company.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Extracted PokemonCard component
const PokemonCard = ({ pokemon, caughtStatus }) => {
  const id = pokemon.url.split('/').slice(-2)[0];
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  
  // Check both default and form variants for caught status
  const isCaught = caughtStatus?.default?.regular || Object.values(caughtStatus || {}).some(form => form.regular);
  const isShiny = caughtStatus?.default?.shiny || Object.values(caughtStatus || {}).some(form => form.shiny);
  
  return (
    <Link href={`/pokemon/${pokemon.name}`}>
      <a className={`bg-gray-800 rounded-lg p-4 flex flex-col items-center transform hover:scale-105 transition-transform duration-200 relative ${
        isCaught ? 'border-green-500' : 'border-gray-700 hover:border-red-500'
      }`}>
        {/* Pokeball indicator with static import */}
        <div className="absolute -top-2 -right-2 w-8 h-8">
          <Image
            src={pokeballOutline}
            alt="Pokeball"
            width={32}
            height={32}
            className={`${!isCaught && !isShiny ? 'opacity-75 filter-white' : 'opacity-0'}`}
            unoptimized // Since it's a small icon
          />
          <Image
            src={pokeballOutline}
            alt="Caught"
            width={32}
            height={32}
            className={`absolute top-0 left-0 ${isCaught ? 'opacity-100 filter-red' : 'opacity-0'}`}
            unoptimized
          />
          <Image
            src={pokeballOutline}
            alt="Shiny"
            width={32}
            height={32}
            className={`absolute top-0 left-0 ${isShiny ? 'opacity-100 filter-yellow' : 'opacity-0'}`}
            unoptimized
          />
        </div>

        {/* Pokemon artwork with optimization */}
        <div className="relative w-32 h-32 mb-4">
          <Image
            src={imageUrl}
            alt={pokemon.name}
            layout="fill"
            objectFit="contain"
            className="drop-shadow-lg"
            sizes="(max-width: 640px) 128px, 256px" // Limit size variations
            priority={parseInt(id) <= 151} // Prioritize loading for first gen Pokemon
          />
        </div>
        <p className="font-semibold text-lg text-center capitalize mb-1">
          {pokemon.name.replace('-', ' ')}
        </p>
        <p className="text-red-400 font-mono">#{id.padStart(3, '0')}</p>
      </a>
    </Link>
  );
};

export async function getStaticProps() {
  const res = await fetch('https://pokeapi.co/api/v2/generation');
  const data = await res.json();

  const generations = data.results.map((gen) => {
    const idMatch = gen.url.match(/\/generation\/(\d+)\//);
    return {
      id: idMatch ? idMatch[1] : '',
      name: gen.name,
    };
  });

  return {
    props: {
      generations,
    },
    revalidate: 3600, // Revalidate every hour
  };
}