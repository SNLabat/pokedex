import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Navigation() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allPokemon, setAllPokemon] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  
  // Fetch all Pokémon for search
  useEffect(() => {
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
        setIsSearchFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Filter Pokémon based on search term
  useEffect(() => {
    if (searchTerm.length < 1) {
      setSearchResults([]);
      return;
    }
    
    const results = allPokemon
      .filter(p => p.name.includes(searchTerm.toLowerCase()))
      .slice(0, 10); // Limit to 10 results
      
    setSearchResults(results);
  }, [searchTerm, allPokemon]);
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/pokemon/${searchTerm.toLowerCase().trim()}`);
      setSearchTerm('');
      setIsSearchFocused(false);
    }
  };
  
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center space-x-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/img/pokeball.svg"
                  alt="Pokédex Live"
                  layout="fill"
                  className="filter-red"
                />
              </div>
              <span className="text-xl font-bold">Pokédex Live</span>
            </a>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/browse">
              <a className="text-gray-300 hover:text-white transition-colors">
                Browse Pokédex
              </a>
            </Link>
            
            <Link href="/team-builder">
              <a className="text-gray-300 hover:text-white transition-colors">
                Team Builder
              </a>
            </Link>
            
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search Pokémon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
              
              {/* Search results dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <ul>
                    {searchResults.map(pokemon => (
                      <li key={pokemon.id}>
                        <Link href={`/pokemon/${pokemon.name}`}>
                          <a 
                            className="block px-4 py-3 hover:bg-gray-700 transition-colors flex items-center"
                            onClick={() => {
                              setSearchTerm('');
                              setIsSearchFocused(false);
                            }}
                          >
                            <span className="text-gray-400 mr-2">#{String(pokemon.id).padStart(3, '0')}</span>
                            <span className="capitalize">{pokemon.name.replace(/-/g, ' ')}</span>
                          </a>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <Link href="/browse">
              <a className="block py-2 text-gray-300 hover:text-white transition-colors">
                Browse Pokédex
              </a>
            </Link>
            
            <Link href="/team-builder">
              <a className="block py-2 text-gray-300 hover:text-white transition-colors">
                Team Builder
              </a>
            </Link>
            
            <form onSubmit={handleSearch} className="mt-4 flex">
              <input
                type="text"
                placeholder="Search Pokémon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 text-white px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500 flex-1"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-r-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
            
            {searchResults.length > 0 && (
              <div className="mt-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <ul>
                  {searchResults.map(pokemon => (
                    <li key={pokemon.id}>
                      <Link href={`/pokemon/${pokemon.name}`}>
                        <a 
                          className="block px-4 py-3 hover:bg-gray-700 transition-colors flex items-center"
                          onClick={() => {
                            setSearchTerm('');
                            setIsMenuOpen(false);
                          }}
                        >
                          <span className="text-gray-400 mr-2">#{String(pokemon.id).padStart(3, '0')}</span>
                          <span className="capitalize">{pokemon.name.replace(/-/g, ' ')}</span>
                        </a>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
} 