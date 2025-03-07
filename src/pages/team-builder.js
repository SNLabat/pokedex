// pages/team-builder.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';
import TeamBuilder from '../components/TeamBuilder';

export default function TeamBuilderPage() {
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 151; // Initially load Gen 1 Pokémon

  const fetchPokemonData = async (offset = 0, limit = 151) => {
    try {
      const loadingState = offset === 0 ? setIsLoading : setIsLoadingMore;
      loadingState(true);
      
      // Fetch a batch of Pokémon
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`);
      const data = await response.json();
      
      // Create an array of promises to fetch detailed data for each Pokémon
      const detailedDataPromises = data.results.map(async (pokemon) => {
        const detailResponse = await fetch(pokemon.url);
        const detailData = await detailResponse.json();
        
        return {
          id: detailData.id,
          name: detailData.name,
          types: detailData.types.map(t => t.type.name),
          sprite: detailData.sprites.front_default,
          // Add other properties that TeamBuilder needs
        };
      });
      
      // Resolve all the promises 
      const newPokemonList = await Promise.all(detailedDataPromises);
      
      // If this is a "load more" request, append to existing list
      if (offset > 0) {
        setPokemonList(prevList => [...prevList, ...newPokemonList]);
      } else {
        setPokemonList(newPokemonList);
      }
      
      loadingState(false);
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
      const loadingState = offset === 0 ? setIsLoading : setIsLoadingMore;
      loadingState(false);
    }
  };

  useEffect(() => {
    fetchPokemonData(0, limit);
  }, []);

  const handleLoadMore = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchPokemonData(newOffset, limit);
  };

  return (
    <>
      <Head>
        <title>Team Builder | Pokédex Live</title>
        <meta name="description" content="Build and analyze your Pokémon teams" />
      </Head>
      
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Pokémon Team Builder</h1>
          <p className="text-gray-400 mb-6">
            Build your team, create an opponent team, and analyze the matchup to see your chances of winning!
          </p>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
              <p className="ml-3 text-lg">Loading Pokémon data...</p>
            </div>
          ) : (
            <>
              <TeamBuilder pokemonList={pokemonList} />
              
              {pokemonList.length < 898 && (
                <div className="mt-8 text-center">
                  <button 
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <>
                        <span className="inline-block mr-2 animate-spin">⟳</span>
                        Loading...
                      </>
                    ) : (
                      'Load More Pokémon'
                    )}
                  </button>
                  <p className="mt-2 text-gray-400 text-sm">
                    Currently showing {pokemonList.length} of 898 Pokémon
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
} 