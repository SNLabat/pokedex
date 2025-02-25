// pages/index.js
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { parseWCBuffer } from '../utils/wcparse';
import { useRouter } from 'next/router';
import pokeballOutline from '/public/img/pokeballoutline.png';
import Head from 'next/head';
import { getPokemonCollection } from '../lib/dataManagement';
import GenerationCard from '../components/GenerationCard';

export default function Home() {
  const router = useRouter();
  const [selectedGen, setSelectedGen] = useState('all');
  const [userStats, setUserStats] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recentCaught, setRecentCaught] = useState([]);
  const [randomPokemon, setRandomPokemon] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [allPokemon, setAllPokemon] = useState([]);
  const heroRef = useRef(null);
  const searchRef = useRef(null);
  
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

  // Handle search submission
  function handleSearch() {
    if (!searchTerm.trim()) return;
    
    // Check if search term is a number
    const isNumber = /^\d+$/.test(searchTerm.trim());
    
    if (isNumber) {
      // If it's a number, navigate directly to that Pokémon ID
      router.push(`/pokemon/${searchTerm.trim()}`);
    } else {
      // If it's a name, convert to lowercase and remove spaces
      const formattedSearch = searchTerm.trim().toLowerCase().replace(/\s+/g, '-');
      router.push(`/pokemon/${formattedSearch}`);
    }
    
    setShowSearchResults(false);
  }
  
  // Navigate to selected Pokémon from autocomplete
  function selectPokemon(pokemon) {
    setSearchTerm('');
    setShowSearchResults(false);
    router.push(`/pokemon/${pokemon.name}`);
  }

  useEffect(() => {
    // Fetch all Pokémon for search autocomplete
    const fetchAllPokemon = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1008');
        const data = await res.json();
        
        setAllPokemon(data.results.map((p, index) => ({
          id: index + 1,
          name: p.name,
        })));
      } catch (error) {
        console.error('Error fetching Pokémon data:', error);
      }
    };
    
    fetchAllPokemon();
    
    // Close search results when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
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
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter Pokémon based on search term
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Check if searchTerm is a number
    const isNumber = !isNaN(searchTerm) && !isNaN(parseFloat(searchTerm));
    
    let results;
    if (isNumber) {
      // If it's a number, filter by ID
      results = allPokemon
        .filter(p => p.id.toString().startsWith(searchTerm))
        .slice(0, 8);
    } else {
      // If it's text, filter by name
      results = allPokemon
        .filter(p => p.name.includes(searchTerm.toLowerCase()))
        .slice(0, 8);
    }
      
    setSearchResults(results);
    setShowSearchResults(true);
  }, [searchTerm, allPokemon]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Head>
        <title>Pokédex Live - Track Your Pokémon Collection</title>
        <meta name="description" content="Track your Pokémon collection across all games and generations" />
        <style jsx global>{`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          .pokeball-bounce-1 {
            animation: bounce 1.2s infinite ease-in-out;
          }
          
          .pokeball-bounce-2 {
            animation: bounce 1.2s infinite ease-in-out;
            animation-delay: 0.2s;
          }
          
          .pokeball-bounce-3 {
            animation: bounce 1.2s infinite ease-in-out;
            animation-delay: 0.4s;
          }
        `}</style>
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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
            Pokédex Live
          </h1>
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

          <div className="flex justify-center items-center mb-10 md:mb-16 mt-10 md:mt-16">
            <div className="flex space-x-10 md:space-x-16">
              {[1, 2, 3].map((_, index) => (
                <div 
                  key={index} 
                  className={`relative w-16 h-16 md:w-20 md:h-20 pokeball-bounce-${index + 1}`}
                >
                  <Image
                    src="/img/pokeball.png"
                    alt="Pokeball"
                    width={80}
                    height={80}
                    layout="responsive"
                    className="drop-shadow-xl"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Search Section with Autocomplete */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Find a Pokémon</h2>
            <div className="relative" ref={searchRef}>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Enter Pokémon name or number..."
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onFocus={() => searchTerm.length >= 2 && setShowSearchResults(true)}
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Search
                </button>
              </div>
              
              {/* Autocomplete dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                  <ul>
                    {searchResults.map(pokemon => (
                      <li key={pokemon.id}>
                        <button 
                          onClick={() => selectPokemon(pokemon)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-600 flex items-center"
                        >
                          <div className="w-8 h-8 relative mr-2">
                            <Image
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                              alt={pokemon.name}
                              layout="fill"
                            />
                          </div>
                          <span className="text-gray-400 mr-2">#{String(pokemon.id).padStart(3, '0')}</span>
                          <span className="capitalize">{pokemon.name.replace(/-/g, ' ')}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Quick type filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Dragon'].map(type => (
                <button
                  key={type}
                  onClick={() => router.push(`/type/${type.toLowerCase()}`)}
                  className={`px-3 py-1 rounded-full text-xs font-medium 
                    ${type === 'Fire' ? 'bg-orange-600' : ''}
                    ${type === 'Water' ? 'bg-blue-600' : ''}
                    ${type === 'Grass' ? 'bg-green-600' : ''}
                    ${type === 'Electric' ? 'bg-yellow-500' : ''}
                    ${type === 'Psychic' ? 'bg-pink-600' : ''}
                    ${type === 'Dragon' ? 'bg-violet-600' : ''}
                  `}
                >
                  {type}
                </button>
              ))}
              <Link href="/pokedex">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {generations.map(gen => (
              <GenerationCard key={gen.id} gen={gen} />
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