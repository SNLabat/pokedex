// components/AdvancedSearch.js
import React, { useState, useEffect } from 'react';
import { SearchIcon, AdjustmentsIcon, XIcon } from '@heroicons/react/outline';

const typeColors = {
  normal: { bg: 'bg-gray-400', text: 'text-gray-800' },
  fire: { bg: 'bg-orange-500', text: 'text-white' },
  water: { bg: 'bg-blue-500', text: 'text-white' },
  electric: { bg: 'bg-yellow-400', text: 'text-gray-900' },
  grass: { bg: 'bg-green-500', text: 'text-white' },
  ice: { bg: 'bg-cyan-300', text: 'text-gray-900' },
  fighting: { bg: 'bg-red-600', text: 'text-white' },
  poison: { bg: 'bg-purple-500', text: 'text-white' },
  ground: { bg: 'bg-amber-600', text: 'text-white' },
  flying: { bg: 'bg-indigo-400', text: 'text-white' },
  psychic: { bg: 'bg-pink-500', text: 'text-white' },
  bug: { bg: 'bg-lime-500', text: 'text-white' },
  rock: { bg: 'bg-stone-500', text: 'text-white' },
  ghost: { bg: 'bg-purple-700', text: 'text-white' },
  dragon: { bg: 'bg-violet-600', text: 'text-white' },
  dark: { bg: 'bg-gray-700', text: 'text-white' },
  steel: { bg: 'bg-slate-400', text: 'text-white' },
  fairy: { bg: 'bg-pink-300', text: 'text-gray-900' }
};

const FilterButton = ({ label, isActive, onClick, customClasses = "" }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
      isActive 
        ? `bg-red-500 text-white` 
        : `bg-gray-700 text-gray-300 hover:bg-gray-600`
    } ${customClasses}`}
  >
    {label}
  </button>
);

const TypeButton = ({ type, isSelected, onClick }) => (
  <button
    onClick={() => onClick(type)}
    className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
      isSelected 
        ? `${typeColors[type].bg} ${typeColors[type].text} ring-2 ring-white` 
        : `${typeColors[type].bg} ${typeColors[type].text} opacity-50`
    }`}
  >
    {type}
  </button>
);

const AdvancedSearch = ({ onSearch, allPokemon = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [catchStatus, setCatchStatus] = useState('all'); // 'all', 'caught', 'uncaught'
  const [shinyStatus, setShinyStatus] = useState('all'); // 'all', 'shiny', 'not-shiny'
  const [sortBy, setSortBy] = useState('id'); // 'id', 'name', 'type'
  
  // This would need to be populated with all available types in your data
  const allTypes = Object.keys(typeColors);
  
  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTypes([]);
    setCatchStatus('all');
    setShinyStatus('all');
    setSortBy('id');
  };
  
  // Effect to trigger search when filters change
  useEffect(() => {
    const filters = {
      searchTerm,
      types: selectedTypes,
      catchStatus,
      shinyStatus,
      sortBy
    };
    
    onSearch(filters);
  }, [searchTerm, selectedTypes, catchStatus, shinyStatus, sortBy, onSearch]);
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
      {/* Search input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Search by name or number..."
        />
      </div>
      
      {/* Toggle filters button */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <AdjustmentsIcon className="h-5 w-5" />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
        
        {showFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
          >
            <XIcon className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="space-y-4">
          {/* Types filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Types</h3>
            <div className="flex flex-wrap gap-2">
              {allTypes.map(type => (
                <TypeButton 
                  key={type}
                  type={type}
                  isSelected={selectedTypes.includes(type)}
                  onClick={toggleType}
                />
              ))}
            </div>
          </div>
          
          {/* Caught status filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Caught Status</h3>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                label="All"
                isActive={catchStatus === 'all'}
                onClick={() => setCatchStatus('all')}
              />
              <FilterButton
                label="Caught"
                isActive={catchStatus === 'caught'}
                onClick={() => setCatchStatus('caught')}
              />
              <FilterButton
                label="Not Caught"
                isActive={catchStatus === 'uncaught'}
                onClick={() => setCatchStatus('uncaught')}
              />
            </div>
          </div>
          
          {/* Shiny status filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Shiny Status</h3>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                label="All"
                isActive={shinyStatus === 'all'}
                onClick={() => setShinyStatus('all')}
              />
              <FilterButton
                label="Shiny"
                isActive={shinyStatus === 'shiny'}
                onClick={() => setShinyStatus('shiny')}
                customClasses="relative"
              />
              <FilterButton
                label="Not Shiny"
                isActive={shinyStatus === 'not-shiny'}
                onClick={() => setShinyStatus('not-shiny')}
              />
            </div>
          </div>
          
          {/* Sort by filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Sort By</h3>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                label="Number"
                isActive={sortBy === 'id'}
                onClick={() => setSortBy('id')}
              />
              <FilterButton
                label="Name"
                isActive={sortBy === 'name'}
                onClick={() => setSortBy('name')}
              />
              <FilterButton
                label="Type"
                isActive={sortBy === 'type'}
                onClick={() => setSortBy('type')}
              />
              <FilterButton
                label="Catch Rate"
                isActive={sortBy === 'catchRate'}
                onClick={() => setSortBy('catchRate')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
