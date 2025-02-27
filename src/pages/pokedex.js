import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import AdvancedSearch from '../components/AdvancedSearch';
import Navigation from '../components/Navigation';
import EnhancedExport from '../components/EnhancedExport';
import { getPokemonCollection } from '../lib/dataManagement';

export default function PokedexPage({ initialPokemon }) {
  const router = useRouter();
  const [pokemonData, setPokemonData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGen, setSelectedGen] = useState('all');
  const [searchFilters, setSearchFilters] = useState({});
  const [caughtStatus, setCaughtStatus] = useState({});
  
  // New state for modals
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(false);
  
  const generations = [
    { id: 'all', name: 'All Generations' },
    { id: '1', name: 'Generation I', range: [1, 151] },
    { id: '2', name: 'Generation II', range: [152, 251] },
    { id: '3', name: 'Generation III', range: [252, 386] },
    { id: '4', name: 'Generation IV', range: [387, 493] },
    { id: '5', name: 'Generation V', range: [494, 649] },
    { id: '6', name: 'Generation VI', range: [650, 721] },
    { id: '7', name: 'Generation VII', range: [722, 809] },
    { id: '8', name: 'Generation VIII', range: [810, 898] },
    { id: '9', name: 'Generation IX', range: [899, 1008] },
  ];

  useEffect(() => {
    // Load user's caught status data
    const loadCaughtStatus = async () => {
      try {
        const result = await getPokemonCollection();
        if (result.success && result.data) {
          setCaughtStatus(result.data);
        }
      } catch (error) {
        console.error('Error loading caught status:', error);
      }
    };
    
    loadCaughtStatus();
  }, []);

  useEffect(() => {
    // Check for URL query parameters
    if (router.query.gen) {
      setSelectedGen(router.query.gen);
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // First check if we have a selected generation
        let fetchUrl = 'https://pokeapi.co/api/v2/pokemon?limit=1008'; // Default to all Pokémon
        
        if (selectedGen !== 'all') {
          const gen = generations.find(g => g.id === selectedGen);
          if (gen) {
            const limit = gen.range[1] - gen.range[0] + 1;
            const offset = gen.range[0] - 1;
            fetchUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;
          }
        }
        
        const res = await fetch(fetchUrl);
        const data = await res.json();
        
        // Fetch additional details for each Pokémon
        const detailedPokemon = await Promise.all(
          data.results.map(async (pokemon, index) => {
            // Extract ID from URL or calculate it
            const urlParts = pokemon.url.split('/');
            const id = parseInt(urlParts[urlParts.length - 2]);
            
            // Fetch detailed data
            const detailRes = await fetch(pokemon.url);
            const detail = await detailRes.json();
            
            return {
              id,
              name: pokemon.name,
              sprite: detail.sprites.other['official-artwork'].front_default || detail.sprites.front_default,
              types: detail.types.map(t => t.type.name)
            };
          })
        );
        
        // Sort by Pokémon ID to ensure proper Dex order
        const sortedPokemon = detailedPokemon.sort((a, b) => a.id - b.id);
        setPokemonData(sortedPokemon);
      } catch (error) {
        console.error('Error fetching Pokémon data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedGen, router.query]);
  
  // Apply search filters
  const handleSearch = (filters) => {
    setSearchFilters(filters);
  };
  
  // Filter Pokémon based on search criteria
  const filteredPokemon = pokemonData.filter(pokemon => {
    // Apply name/number filter
    if (searchFilters.searchTerm && 
        !pokemon.name.includes(searchFilters.searchTerm.toLowerCase()) && 
        !pokemon.id.toString().includes(searchFilters.searchTerm)) {
      return false;
    }
    
    // Apply type filter
    if (searchFilters.types && searchFilters.types.length > 0) {
      if (!pokemon.types.some(type => searchFilters.types.includes(type))) {
        return false;
      }
    }
    
    // Add more filters as needed
    
    return true;
  });
  
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

  // Get the tracking status border class for a Pokémon
  const getTrackingBorderClass = (pokemonId) => {
    const pokemonStatus = caughtStatus[pokemonId]?.default;
    
    if (!pokemonStatus) return '';
    
    if (pokemonStatus.shiny) return 'border-2 border-yellow-400';
    if (pokemonStatus.caught) return 'border-2 border-green-500';
    
    return '';
  };

  // Render Pokemon Grid
  const renderPokemonGrid = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      );
    }
    
    const pokemonToShow = searchFilters.searchTerm || (searchFilters.types && searchFilters.types.length > 0)
      ? filteredPokemon
      : pokemonData;
    
    if (pokemonToShow.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-xl text-gray-400">No Pokémon found matching your criteria</p>
          <button 
            onClick={() => setSearchFilters({})} 
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {pokemonToShow.map(pokemon => (
          <a 
            key={`pokemon-${pokemon.id}`} 
            href={`/pokemon/${pokemon.name}`}
            className={`bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-transform hover:scale-105 flex flex-col items-center ${getTrackingBorderClass(pokemon.id)}`}
          >
            <div className="relative w-32 h-32">
              {pokemon.sprite ? (
                <Image
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  layout="fill"
                  objectFit="contain"
                  className="drop-shadow-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-full">
                  <span className="text-gray-500">?</span>
                </div>
              )}
              
              {/* Status indicator icons */}
              <div className="absolute -top-2 -right-2 flex space-x-1">
                {caughtStatus[pokemon.id]?.default?.caught && (
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {caughtStatus[pokemon.id]?.default?.shiny && (
                  <span className="text-lg absolute -top-2 -right-2">✨</span>
                )}
              </div>
            </div>
            
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-400">#{String(pokemon.id).padStart(3, '0')}</p>
              <p className="font-medium capitalize">{pokemon.name.replace(/-/g, ' ')}</p>
              <div className="flex justify-center gap-1 mt-1">
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
          </a>
        ))}
      </div>
    );
  };

  // Function to handle CSV import
  const handleImport = async (e) => {
    e.preventDefault();
    setImportError(null);
    setImportSuccess(false);
    
    if (!importFile) {
      setImportError("Please select a file to import");
      return;
    }
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const csvData = e.target.result;
          const lines = csvData.split('\n');
          const headers = lines[0].split(',');
          
          // Find the column indices for the data we need
          const idIdx = headers.findIndex(h => h.toLowerCase() === 'id');
          const caughtIdx = headers.findIndex(h => h.toLowerCase() === 'caught');
          const shinyIdx = headers.findIndex(h => h.toLowerCase() === 'shiny' || h.toLowerCase() === 'status');
          
          if (idIdx === -1) {
            setImportError("The CSV file must contain an 'id' column");
            return;
          }
          
          // Parse the CSV data
          const newCollection = { ...caughtStatus };
          
          for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;
            
            const values = lines[i].split(',');
            const id = values[idIdx].trim();
            
            if (!id || isNaN(parseInt(id))) continue;
            
            // Initialize the Pokemon in the collection if it doesn't exist
            if (!newCollection[id]) {
              newCollection[id] = { default: {} };
            }
            
            // Update caught status if the column exists
            if (caughtIdx !== -1) {
              const caughtValue = values[caughtIdx].trim().toLowerCase();
              newCollection[id].default.caught = (caughtValue === 'yes' || caughtValue === 'true' || caughtValue === '1');
            }
            
            // Update shiny status if the column exists
            if (shinyIdx !== -1) {
              const shinyValue = values[shinyIdx].trim().toLowerCase();
              newCollection[id].default.shiny = (shinyValue === 'shiny' || shinyValue === 'yes' || shinyValue === 'true' || shinyValue === '1');
            }
          }
          
          // Save the updated collection
          const { saveCollection } = await import('../lib/dataManagement');
          await saveCollection(newCollection);
          
          // Update the UI
          setCaughtStatus(newCollection);
          setImportSuccess(true);
          
          // Close the modal after a delay
          setTimeout(() => {
            setShowImportModal(false);
            setImportSuccess(false);
          }, 2000);
          
        } catch (error) {
          console.error("Error parsing CSV:", error);
          setImportError("Error parsing the CSV file. Please check the format.");
        }
      };
      
      reader.onerror = () => {
        setImportError("Error reading the file");
      };
      
      reader.readAsText(importFile);
      
    } catch (error) {
      console.error("Import error:", error);
      setImportError("An error occurred during import");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        <title>Pokédex | Pokédex Live</title>
        <meta name="description" content="Browse the complete Pokédex with all generations from Kanto to Paldea" />
      </Head>
      
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pokédex</h1>
          
          {/* Add Export/Import buttons */}
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowExportModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export
            </button>
            <button 
              onClick={() => setShowImportModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" transform="rotate(180, 10, 10)" />
              </svg>
              Import
            </button>
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-400">Displaying:</span>
              <span className="ml-2 font-semibold">
                {filteredPokemon.length > 0 ? filteredPokemon.length : pokemonData.length} Pokémon
              </span>
            </div>
          </div>
        </div>
        
        {/* Generation filter */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {generations.map(gen => (
              <button
                key={gen.id}
                onClick={() => {
                  setSelectedGen(gen.id);
                  router.push({
                    pathname: '/pokedex',
                    query: { gen: gen.id },
                  }, undefined, { shallow: true });
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedGen === gen.id 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {gen.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Legend for tracking indicators */}
        <div className="mb-4 bg-gray-800 p-3 rounded-lg">
          <h3 className="text-sm font-medium mb-2">Tracking Indicators:</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-6 h-6 border-2 border-green-500 bg-gray-700 rounded mr-2"></div>
              <span>Caught</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 border-2 border-yellow-400 bg-gray-700 rounded mr-2"></div>
              <span>Shiny</span>
            </div>
          </div>
        </div>
        
        {/* Advanced search */}
        <AdvancedSearch 
          initialFilters={searchFilters}
          onSearchClient={handleSearch}
          pokemonData={pokemonData}
          hideStatusFilters={true}
          hideSortOptions={true}
        />
        
        {/* Pokemon list */}
        <div className="mt-6">
          {renderPokemonGrid()}
        </div>
        
        {/* Pagination or "Load More" button for large generations */}
        {pokemonData.length > 60 && !isLoading && (
          <div className="mt-8 text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              Load More Pokémon
            </button>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Export Collection</h2>
                  <button 
                    onClick={() => setShowExportModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <EnhancedExport 
                  caughtData={caughtStatus} 
                  pokemonData={pokemonData} 
                  onClose={() => setShowExportModal(false)}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-lg max-w-lg w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Import Collection</h2>
                  <button 
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                      setImportError(null);
                      setImportSuccess(false);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleImport}>
                  <div className="mb-6">
                    <p className="text-gray-300 mb-4">
                      Upload a CSV file to import your Pokémon collection. The file should contain at least columns for "id" and either "caught" or "status".
                    </p>
                    
                    <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="importFile"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => setImportFile(e.target.files[0])}
                      />
                      <label 
                        htmlFor="importFile"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-gray-300">
                          {importFile ? importFile.name : "Choose a file or drag it here"}
                        </span>
                      </label>
                    </div>
                    
                    {importError && (
                      <div className="mt-4 p-3 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg text-white">
                        {importError}
                      </div>
                    )}
                    
                    {importSuccess && (
                      <div className="mt-4 p-3 bg-green-900 bg-opacity-50 border border-green-700 rounded-lg text-white">
                        Collection imported successfully!
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImportModal(false);
                        setImportFile(null);
                        setImportError(null);
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center"
                      disabled={!importFile}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" transform="rotate(180, 10, 10)" />
                      </svg>
                      Import
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>
            Pokémon and Pokémon character names are trademarks of Nintendo.
            This app is not affiliated with Nintendo, Game Freak, or The Pokémon Company.
          </p>
        </div>
      </footer>
    </div>
  );
}

export async function getStaticProps() {
  try {
    // Fetch initial Pokémon data (just first generation to start)
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
    const data = await res.json();
    
    // Process Pokémon data into a more usable format
    const pokemonList = data.results.map((pokemon, index) => {
      const id = index + 1;
      return {
        id,
        name: pokemon.name,
        url: pokemon.url
      };
    });
    
    return {
      props: {
        initialPokemon: pokemonList
      },
      revalidate: 86400 // Revalidate once per day
    };
  } catch (error) {
    console.error('Error fetching Pokémon data:', error);
    return {
      props: {
        initialPokemon: []
      },
      revalidate: 3600
    };
  }
} 