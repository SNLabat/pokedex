// components/EnhancedExport.js
import React, { useState } from 'react';
import { DownloadIcon, DocumentTextIcon, PhotographIcon } from '@heroicons/react/outline';

const ExportOption = ({ icon, title, description, onClick, active }) => (
  <div 
    onClick={onClick}
    className={`rounded-lg p-4 cursor-pointer transition-all ${
      active ? 'bg-red-600 bg-opacity-30 border border-red-500' : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
    }`}
  >
    <div className="flex items-center mb-2">
      {icon}
      <h3 className="text-lg font-medium ml-2">{title}</h3>
    </div>
    <p className="text-sm text-gray-400">{description}</p>
  </div>
);

const EnhancedExport = ({ caughtData, pokemonData }) => {
  const [exportType, setExportType] = useState('csv');
  const [exportOptions, setExportOptions] = useState({
    includeRegular: true,
    includeShiny: true,
    includeSpecialForms: true,
    includeGameVersions: true,
    includeCustomTags: true,
    includeRibbons: true,
    includeMarks: true,
    includeUncaught: false,
    format: 'simple'
  });
  
  const toggleOption = (option) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const exportCollection = () => {
    // Process the data based on chosen options
    let exportData = [];
    
    // Get all Pokemon IDs that have caught data
    const pokemonIds = Object.keys(caughtData);
    
    for (const id of pokemonIds) {
      // Find the Pokemon data
      const pokemon = pokemonData.find(p => p.id.toString() === id) || {
        id,
        name: `Unknown #${id}`,
        types: []
      };
      
      // Check if any form of this Pokemon is caught
      const forms = caughtData[id];
      const hasCaughtForms = Object.values(forms).some(form => 
        (exportOptions.includeRegular && form.regular) ||
        (exportOptions.includeShiny && form.shiny) ||
        (exportOptions.includeSpecialForms && (form.alpha || form.alphaShiny || form.mega || form.megaShiny || form.gmax || form.gmaxShiny))
      );
      
      // Skip uncaught Pokemon if not including them
      if (!exportOptions.includeUncaught && !hasCaughtForms) continue;
      
      // Process each form
      Object.entries(forms).forEach(([formName, status]) => {
        // Extract ribbons and marks data if available
        const obtainedRibbons = [];
        const obtainedMarks = [];
        
        if (exportOptions.includeRibbons && status.ribbons) {
          Object.entries(status.ribbons).forEach(([ribbonId, isObtained]) => {
            if (isObtained) {
              obtainedRibbons.push(ribbonId);
            }
          });
        }
        
        if (exportOptions.includeMarks && status.marks) {
          Object.entries(status.marks).forEach(([markId, isObtained]) => {
            if (isObtained) {
              obtainedMarks.push(markId);
            }
          });
        }
        
        // For detailed format, create separate entries for each form and status
        if (exportOptions.format === 'detailed') {
          if (exportOptions.includeRegular) {
            exportData.push({
              id: pokemon.id,
              dexNum: String(pokemon.id).padStart(3, '0'),
              name: pokemon.name.replace(/-/g, ' '),
              form: formName === 'default' ? 'Regular' : formatFormName(formName),
              caught: status.regular ? 'Yes' : 'No',
              status: 'Regular',
              types: pokemon.types?.join('/') || '',
              generation: getGeneration(pokemon.id)
            });
          }
          
          if (exportOptions.includeShiny) {
            exportData.push({
              id: pokemon.id,
              dexNum: String(pokemon.id).padStart(3, '0'),
              name: pokemon.name.replace(/-/g, ' '),
              form: formName === 'default' ? 'Regular' : formatFormName(formName),
              caught: status.shiny ? 'Yes' : 'No',
              status: 'Shiny',
              types: pokemon.types?.join('/') || '',
              generation: getGeneration(pokemon.id)
            });
          }
          
          if (exportOptions.includeSpecialForms) {
            const specialForms = [
              { key: 'alpha', label: 'Alpha' },
              { key: 'alphaShiny', label: 'Alpha Shiny' },
              { key: 'mega', label: 'Mega' },
              { key: 'megaShiny', label: 'Mega Shiny' },
              { key: 'gmax', label: 'Gigantamax' },
              { key: 'gmaxShiny', label: 'Gigantamax Shiny' }
            ];
            
            specialForms.forEach(({ key, label }) => {
              if (status[key]) {
                exportData.push({
                  id: pokemon.id,
                  dexNum: String(pokemon.id).padStart(3, '0'),
                  name: pokemon.name.replace(/-/g, ' '),
                  form: formName === 'default' ? 'Regular' : formatFormName(formName),
                  caught: status[key] ? 'Yes' : 'No',
                  status: label,
                  types: pokemon.types?.join('/') || '',
                  generation: getGeneration(pokemon.id)
                });
              }
            });
          }
          
          if (exportOptions.includeGameVersions) {
            const gameVersions = [
              { key: 'home', label: 'Pokémon HOME' },
              { key: 'swsh', label: 'Sword/Shield' },
              { key: 'bdsp', label: 'BD/SP' },
              { key: 'pla', label: 'Legends: Arceus' },
              { key: 'sv', label: 'Scarlet/Violet' }
            ];
            
            gameVersions.forEach(({ key, label }) => {
              if (status[key]) {
                exportData.push({
                  id: pokemon.id,
                  dexNum: String(pokemon.id).padStart(3, '0'),
                  name: pokemon.name.replace(/-/g, ' '),
                  form: formName === 'default' ? 'Regular' : formatFormName(formName),
                  caught: status[key] ? 'Yes' : 'No',
                  status: label,
                  types: pokemon.types?.join('/') || '',
                  generation: getGeneration(pokemon.id)
                });
              }
            });
          }
          
          if (exportOptions.includeCustomTags) {
            const customTags = [
              { key: 'livingDex', label: 'Living Dex' },
              { key: 'competitive', label: 'Competitive' },
              { key: 'favorite', label: 'Favorite' }
            ];
            
            customTags.forEach(({ key, label }) => {
              if (status[key]) {
                exportData.push({
                  id: pokemon.id,
                  dexNum: String(pokemon.id).padStart(3, '0'),
                  name: pokemon.name.replace(/-/g, ' '),
                  form: formName === 'default' ? 'Regular' : formatFormName(formName),
                  caught: status[key] ? 'Yes' : 'No',
                  status: label,
                  types: pokemon.types?.join('/') || '',
                  generation: getGeneration(pokemon.id)
                });
              }
            });
          }
          
          // Add ribbons if any
          if (exportOptions.includeRibbons && obtainedRibbons.length > 0) {
            obtainedRibbons.forEach(ribbonId => {
              exportData.push({
                id: pokemon.id,
                dexNum: String(pokemon.id).padStart(3, '0'),
                name: pokemon.name.replace(/-/g, ' '),
                form: formName === 'default' ? 'Regular' : formatFormName(formName),
                caught: 'Yes',
                status: `Ribbon: ${formatRibbonName(ribbonId)}`,
                types: pokemon.types?.join('/') || '',
                generation: getGeneration(pokemon.id)
              });
            });
          }
          
          // Add marks if any
          if (exportOptions.includeMarks && obtainedMarks.length > 0) {
            obtainedMarks.forEach(markId => {
              exportData.push({
                id: pokemon.id,
                dexNum: String(pokemon.id).padStart(3, '0'),
                name: pokemon.name.replace(/-/g, ' '),
                form: formName === 'default' ? 'Regular' : formatFormName(formName),
                caught: 'Yes',
                status: `Mark: ${formatMarkName(markId)}`,
                types: pokemon.types?.join('/') || '',
                generation: getGeneration(pokemon.id)
              });
            });
          }
        } 
        // For simple format, combine all statuses into a single entry
        else {
          const formStatuses = [];
          if (status.regular && exportOptions.includeRegular) formStatuses.push('Regular');
          if (status.shiny && exportOptions.includeShiny) formStatuses.push('Shiny');
          
          if (exportOptions.includeSpecialForms) {
            if (status.alpha) formStatuses.push('Alpha');
            if (status.alphaShiny) formStatuses.push('Alpha Shiny');
            if (status.mega) formStatuses.push('Mega');
            if (status.megaShiny) formStatuses.push('Mega Shiny');
            if (status.gmax) formStatuses.push('Gigantamax');
            if (status.gmaxShiny) formStatuses.push('Gigantamax Shiny');
          }
          
          if (exportOptions.includeGameVersions) {
            if (status.home) formStatuses.push('HOME');
            if (status.swsh) formStatuses.push('SwSh');
            if (status.bdsp) formStatuses.push('BDSP');
            if (status.pla) formStatuses.push('PLA');
            if (status.sv) formStatuses.push('SV');
          }
          
          if (exportOptions.includeCustomTags) {
            if (status.livingDex) formStatuses.push('Living');
            if (status.competitive) formStatuses.push('Competitive');
            if (status.favorite) formStatuses.push('Favorite');
          }
          
          // Add ribbons and marks to the status list
          if (exportOptions.includeRibbons && obtainedRibbons.length > 0) {
            formStatuses.push(`Ribbons: ${obtainedRibbons.length}`);
          }
          
          if (exportOptions.includeMarks && obtainedMarks.length > 0) {
            formStatuses.push(`Marks: ${obtainedMarks.length}`);
          }
          
          // Add to export data if we have statuses or if including uncaught
          if (formStatuses.length > 0 || exportOptions.includeUncaught) {
            const exportEntry = {
              id: pokemon.id,
              dexNum: String(pokemon.id).padStart(3, '0'),
              name: pokemon.name.replace(/-/g, ' '),
              form: formName === 'default' ? 'Regular' : formatFormName(formName),
              types: pokemon.types?.join('/') || '',
              generation: getGeneration(pokemon.id),
              caughtStatus: formStatuses.length > 0 ? formStatuses.join(', ') : 'Not Caught'
            };
            
            // Add specific ribbons and marks data for JSON and HTML exports
            if (exportType !== 'csv') {
              if (exportOptions.includeRibbons && obtainedRibbons.length > 0) {
                exportEntry.ribbons = obtainedRibbons.map(formatRibbonName);
              }
              
              if (exportOptions.includeMarks && obtainedMarks.length > 0) {
                exportEntry.marks = obtainedMarks.map(formatMarkName);
              }
            }
            
            exportData.push(exportEntry);
          }
        }
      });
    }
    
    // Export the data in the chosen format
    if (exportType === 'csv') {
      exportToCsv(exportData);
    } else if (exportType === 'json') {
      exportToJson(exportData);
    } else if (exportType === 'html') {
      exportToHtml(exportData);
    }
  };
  
  // Helper function to format form names
  const formatFormName = (formName) => {
    const baseName = formName.split('-')[0];
    const formSpecific = formName.replace(`${baseName}-`, '');
    
    // Special cases
    if (formSpecific.includes('mega')) return 'Mega';
    if (formSpecific.includes('mega-x')) return 'Mega X';
    if (formSpecific.includes('mega-y')) return 'Mega Y';
    if (formSpecific.includes('gmax')) return 'Gigantamax';
    if (formSpecific.includes('alola')) return 'Alolan Form';
    if (formSpecific.includes('galar')) return 'Galarian Form';
    if (formSpecific.includes('hisui')) return 'Hisuian Form';
    if (formSpecific.includes('paldea')) return 'Paldean Form';
    
    // Capitalize and clean up remaining cases
    return formSpecific
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' Form';
  };
  
  // Helper function to determine generation based on Pokémon ID
  const getGeneration = (id) => {
    const numId = parseInt(id);
    if (numId <= 151) return 'I';
    if (numId <= 251) return 'II';
    if (numId <= 386) return 'III';
    if (numId <= 493) return 'IV';
    if (numId <= 649) return 'V';
    if (numId <= 721) return 'VI';
    if (numId <= 809) return 'VII';
    if (numId <= 905) return 'VIII';
    return 'IX';
  };
  
  // Helper function to format ribbon names
  const formatRibbonName = (ribbonId) => {
    return ribbonId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Helper function to format mark names
  const formatMarkName = (markId) => {
    return markId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Export to CSV
  const exportToCsv = (data) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    data.forEach(row => {
      csvContent += headers.map(header => {
        const cell = row[header];
        // Handle values with commas by enclosing in quotes
        return typeof cell === 'string' && cell.includes(',') 
          ? `"${cell}"` 
          : cell;
      }).join(',') + '\n';
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `pokemon_collection_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Export to JSON
  const exportToJson = (data) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `pokemon_collection_${timestamp}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Export to HTML
  const exportToHtml = (data) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Get headers
    const headers = Object.keys(data[0]);
    
    // Create HTML content
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pokémon Collection Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #e53e3e;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f8f8;
            font-weight: bold;
          }
          tr:hover {
            background-color: #f5f5f5;
          }
          .timestamp {
            color: #666;
            font-style: italic;
            margin-bottom: 20px;
          }
          .stats {
            background-color: #f8f8f8;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h1>Pokémon Collection Report</h1>
        <p class="timestamp">Generated on ${new Date().toLocaleString()}</p>
        
        <div class="stats">
          <h2>Collection Statistics</h2>
          <p>Total Pokémon: ${data.filter(row => row.status === 'Regular' || row.caughtStatus).length}</p>
          <p>Unique Species: ${new Set(data.map(row => row.id)).size}</p>
          <p>Shiny Pokémon: ${data.filter(row => row.status === 'Shiny' || (row.caughtStatus && row.caughtStatus.includes('Shiny'))).length}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              ${headers.map(header => `<th>${header.charAt(0).toUpperCase() + header.slice(1)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${headers.map(header => `<td>${row[header]}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    // Create and download the file
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `pokemon_collection_${timestamp}.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-white">Export Collection</h2>
      
      {/* Export format options */}
      <div className="mb-6">
        <h3 className="text-lg text-white mb-3">Export Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ExportOption
            icon={<DocumentTextIcon className="h-6 w-6 text-green-500" />}
            title="CSV"
            description="Export as CSV for spreadsheet applications like Excel"
            onClick={() => setExportType('csv')}
            active={exportType === 'csv'}
          />
          <ExportOption
            icon={<DocumentTextIcon className="h-6 w-6 text-blue-500" />}
            title="JSON"
            description="Export as JSON for data analysis or import to other tools"
            onClick={() => setExportType('json')}
            active={exportType === 'json'}
          />
          <ExportOption
            icon={<PhotographIcon className="h-6 w-6 text-yellow-500" />}
            title="HTML Report"
            description="Export as a formatted HTML report that can be viewed in a browser"
            onClick={() => setExportType('html')}
            active={exportType === 'html'}
          />
        </div>
      </div>
      
      {/* Content options */}
      <div className="mb-6">
        <h3 className="text-lg text-white mb-3">Data to Include</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeRegular"
              checked={exportOptions.includeRegular}
              onChange={() => toggleOption('includeRegular')}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <label htmlFor="includeRegular" className="text-gray-300">Regular Forms</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeShiny"
              checked={exportOptions.includeShiny}
              onChange={() => toggleOption('includeShiny')}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <label htmlFor="includeShiny" className="text-gray-300">Shiny Forms</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeSpecialForms"
              checked={exportOptions.includeSpecialForms}
              onChange={() => toggleOption('includeSpecialForms')}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <label htmlFor="includeSpecialForms" className="text-gray-300">Special Forms (Alpha, Mega, etc.)</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeGameVersions"
              checked={exportOptions.includeGameVersions}
              onChange={() => toggleOption('includeGameVersions')}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <label htmlFor="includeGameVersions" className="text-gray-300">Game Versions</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeCustomTags"
              checked={exportOptions.includeCustomTags}
              onChange={() => toggleOption('includeCustomTags')}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <label htmlFor="includeCustomTags" className="text-gray-300">Custom Tags</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeRibbons"
              checked={exportOptions.includeRibbons}
              onChange={() => toggleOption('includeRibbons')}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <label htmlFor="includeRibbons" className="text-gray-300">Ribbons</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeMarks"
              checked={exportOptions.includeMarks}
              onChange={() => toggleOption('includeMarks')}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <label htmlFor="includeMarks" className="text-gray-300">Marks</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeUncaught"
              checked={exportOptions.includeUncaught}
              onChange={() => toggleOption('includeUncaught')}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <label htmlFor="includeUncaught" className="text-gray-300">Include Uncaught Pokémon</label>
          </div>
        </div>
      </div>
      
      {/* Format options */}
      <div className="mb-6">
        <h3 className="text-lg text-white mb-3">Report Format</h3>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="formatSimple"
              checked={exportOptions.format === 'simple'}
              onChange={() => setExportOptions(prev => ({ ...prev, format: 'simple' }))}
              className="text-red-500 focus:ring-red-500"
            />
            <label htmlFor="formatSimple" className="text-gray-300">Simple (one row per form)</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="formatDetailed"
              checked={exportOptions.format === 'detailed'}
              onChange={() => setExportOptions(prev => ({ ...prev, format: 'detailed' }))}
              className="text-red-500 focus:ring-red-500"
            />
            <label htmlFor="formatDetailed" className="text-gray-300">Detailed (separate rows for each status)</label>
          </div>
        </div>
      </div>
      
      {/* Export button */}
      <button
        onClick={exportCollection}
        className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg flex items-center justify-center"
      >
        <DownloadIcon className="h-5 w-5 mr-2" />
        Export Collection
      </button>
    </div>
  );
};

export default EnhancedExport;
