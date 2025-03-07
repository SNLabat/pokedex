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
    includeSprites: true,
    includeUnchecked: false,
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
    
    if (pokemonIds.length === 0) {
      alert("No data to export");
      return;
    }
    
    for (const id of pokemonIds) {
      // Find the Pokemon data
      const pokemon = pokemonData.find(p => p.id.toString() === id) || {
        id,
        name: `Unknown #${id}`,
        types: []
      };
      
      // Get sprite URLs if option is enabled
      const spriteUrls = exportOptions.includeSprites ? getSpriteUrls(pokemon.id) : null;
      
      // Process all forms of this Pokemon
      const forms = caughtData[id] || {};
      
      // Process each form
      Object.entries(forms).forEach(([formName, status]) => {
        if (!status) return; // Skip if status is null or undefined
        
        // For simple format, combine all statuses into a single entry
        const formStatuses = [];
        
        // Basic tracking info
        if (status.caught === true && exportOptions.includeRegular) formStatuses.push('Regular');
        if (status.shiny === true && exportOptions.includeShiny) formStatuses.push('Shiny');
        if (status.alpha === true && exportOptions.includeSpecialForms) formStatuses.push('Alpha');
        if (status.alphaShiny === true && exportOptions.includeSpecialForms) formStatuses.push('Alpha Shiny');
        
        // Handle special forms if enabled
        if (exportOptions.includeSpecialForms) {
          if (status.mega) formStatuses.push('Mega');
          if (status.megaShiny) formStatuses.push('Mega Shiny');
          if (status.gmax) formStatuses.push('Gigantamax');
          if (status.gmaxShiny) formStatuses.push('Gigantamax Shiny');
        }
        
        // Handle game versions if enabled
        if (exportOptions.includeGameVersions) {
          // Check stored generations
          if (status.generations && typeof status.generations === 'object') {
            const activeGens = Object.entries(status.generations)
              .filter(([_, isActive]) => isActive === true)
              .map(([gen, _]) => {
                // Map generation codes to readable names
                const genNames = {
                  'gen6': 'Gen 6',
                  'gen7': 'Gen 7',
                  'gen8_swsh': 'Sword/Shield',
                  'gen8_bdsp': 'BD/SP',
                  'gen8_pla': 'Legends Arceus',
                  'gen9': 'Scarlet/Violet',
                  'vc': 'Virtual Console',
                  'lgpe': 'Let\'s Go',
                  'go': 'Pokémon GO'
                };
                return genNames[gen] || gen;
              });
            
            if (activeGens.length > 0) {
              formStatuses.push(`Games: ${activeGens.join(', ')}`);
            }
          }
          
          // Legacy format or explicit game flags
          if (status.home) formStatuses.push('HOME');
          if (status.swsh) formStatuses.push('SwSh');
          if (status.bdsp) formStatuses.push('BDSP');
          if (status.pla) formStatuses.push('PLA');
          if (status.sv) formStatuses.push('SV');
        }
        
        // Handle custom tags if enabled
        if (exportOptions.includeCustomTags) {
          if (status.livingDex) formStatuses.push('Living');
          if (status.competitive) formStatuses.push('Competitive');
          if (status.favorite) formStatuses.push('Favorite');
        }
        
        // Handle ribbons and marks if enabled
        if (exportOptions.includeRibbons && status.ribbons && typeof status.ribbons === 'object') {
          const ribbonData = Object.entries(status.ribbons)
            .filter(([_, ribbonStatus]) => ribbonStatus === true || ribbonStatus === 'obtained')
            .map(([ribbonId, _]) => ribbonId);
            
          if (ribbonData.length > 0) {
            formStatuses.push(`Ribbons: ${ribbonData.length}`);
          }
        }
        
        if (exportOptions.includeMarks && status.marks && typeof status.marks === 'object') {
          const markData = Object.entries(status.marks)
            .filter(([_, markStatus]) => markStatus === true || markStatus === 'obtained')
            .map(([markId, _]) => markId);
            
          if (markData.length > 0) {
            formStatuses.push(`Marks: ${markData.length}`);
          }
        }
        
        // Add to export data if we have statuses or including uncaught
        if (formStatuses.length > 0 || exportOptions.includeUncaught) {
          const exportEntry = {
            id: pokemon.id,
            dexNum: String(pokemon.id).padStart(3, '0'),
            name: pokemon.name.replace(/-/g, ' '),
            form: formName === 'default' ? 'Regular' : formatFormName(formName),
            types: pokemon.types?.join('/') || '',
            generation: getGeneration(pokemon.id),
            caught: (status.caught || status.shiny) ? 'Yes' : 'No',
            shiny: status.shiny ? 'Yes' : 'No',
            caughtStatus: formStatuses.length > 0 ? formStatuses.join(', ') : 'Not Caught'
          };
          
          // Add sprite URLs if option is enabled
          if (exportOptions.includeSprites && spriteUrls) {
            if (status.shiny) {
              exportEntry.spriteUrl = spriteUrls.shiny;
            } else {
              exportEntry.spriteUrl = spriteUrls.regular;
            }
          }
          
          exportData.push(exportEntry);
        }
      });
    }
    
    // If no data after processing, alert and return
    if (exportData.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Export the data in the chosen format
    if (exportType === 'csv') {
      // Get all unique headers from the export data
      const allHeaders = new Set();
      exportData.forEach(entry => {
        Object.keys(entry).forEach(key => allHeaders.add(key));
      });
      
      // Convert to array and ensure consistent order
      const headers = Array.from(allHeaders);
      
      // Create CSV header row
      let csv = headers.join(',') + '\n';
      
      // Add data rows
      exportData.forEach(entry => {
        const row = headers.map(header => {
          // Get value or empty string
          const value = entry[header] || '';
          // Properly escape value for CSV
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csv += row.join(',') + '\n';
      });
      
      // Create and download the CSV file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `pokemon_collection_${Date.now()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (exportType === 'json') {
      // For JSON export
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `pokemon_collection_${Date.now()}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (exportType === 'html') {
      // For HTML export
      if (exportData.length === 0) {
        alert('No data to export');
        return;
      }
      
      // Generate statistics
      const timestamp = new Date().toLocaleString();
      const totalCount = exportData.filter(row => !row.status || (!row.status.startsWith('Ribbon:') && !row.status.startsWith('Mark:'))).length;
      const uniqueSpecies = new Set(exportData.map(row => row.id));
      const shinyCount = exportData.filter(row => row.status && row.status.includes('Shiny')).length;
      const specialFormCount = exportData.filter(row => 
        row.form && 
        row.form !== 'Regular' && 
        !row.form.includes('Shiny')
      ).length;
      
      // Create HTML content with the updated template
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Pokémon Collection Export</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2 {
            color: #e53935;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .stats {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
          }
          .stat-item {
            background-color: #f5f5f5;
            padding: 10px 15px;
            border-radius: 4px;
          }
          .pokemon-sprite {
            width: 68px;
            height: 68px;
            image-rendering: pixelated;
          }
          .legend {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 4px;
          }
          .legend-item {
            display: inline-block;
            margin-right: 20px;
          }
          .obtained {
            color: #4ade80;
          }
          .missing {
            color: #ef4444;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
          }
          .origin-mark-stats, .generation-stats {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
          }
          .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            background-color: #e53935;
            color: white;
            font-size: 0.8em;
            margin-left: 5px;
          }
          .tabs {
            display: flex;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
          }
          .tab {
            padding: 10px 15px;
            cursor: pointer;
            border: 1px solid transparent;
            border-bottom: none;
            margin-bottom: -1px;
          }
          .tab.active {
            background-color: #fff;
            border-color: #ddd;
            border-bottom-color: #fff;
          }
          .tab-content {
            display: none;
          }
          .tab-content.active {
            display: block;
          }
        </style>
        <script>
          function switchTab(tabId) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(tab => {
              tab.classList.remove('active');
            });
            
            // Deactivate all tabs
            document.querySelectorAll('.tab').forEach(tab => {
              tab.classList.remove('active');
            });
            
            // Activate selected tab and content
            document.getElementById(tabId).classList.add('active');
            document.getElementById(tabId + '-content').classList.add('active');
          }
          
          // Initialize with the first tab active
          window.onload = function() {
            switchTab('tab-main');
          }
        </script>
      </head>
      <body>
        <h1>Pokémon Collection Export</h1>
        <p>Generated on ${timestamp}</p>
        
        <div class="stats">
          <div class="stat-item">Total Pokémon: ${totalCount}</div>
          <div class="stat-item">Unique Species: ${uniqueSpecies.size}</div>
          <div class="stat-item">Shiny Pokémon: ${shinyCount}</div>
          <div class="stat-item">Special Forms: ${specialFormCount}</div>
        </div>
        
        <div class="tabs">
          <div id="tab-main" class="tab active" onclick="switchTab('tab-main')">Main Collection</div>
          <div id="tab-generations" class="tab" onclick="switchTab('tab-generations')">Generations</div>
          <div id="tab-origin-marks" class="tab" onclick="switchTab('tab-origin-marks')">Origin Marks</div>
        </div>
        
        <div id="tab-main-content" class="tab-content active">
          <div class="legend">
            <h3>Status Legend:</h3>
            <div class="legend-item"><span class="obtained">■</span> Obtained</div>
            <div class="legend-item"><span class="missing">■</span> Missing</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Dex #</th>
                <th>Name</th>
                <th>Form</th>
                <th>Caught</th>
                <th>Status</th>
                <th>Types</th>
                <th>Generation</th>
                ${exportOptions.includeSprites ? '<th>Sprite</th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${exportData.map(row => {
                let statusCell = '';
                
                // Handle ribbons and marks with their status
                if (row.caughtStatus && (row.caughtStatus.startsWith('Ribbon:') || row.caughtStatus.startsWith('Mark:'))) {
                  const statusParts = row.caughtStatus.match(/(Ribbon|Mark): (.+) \((.+)\)/);
                  if (statusParts) {
                    const [, type, name, status] = statusParts;
                    const statusClass = status === 'Obtained' ? 'obtained' : 'missing';
                    statusCell = `<td class="${statusClass}">${type}: ${name} (${status})</td>`;
                  } else {
                    statusCell = `<td>${row.caughtStatus}</td>`;
                  }
                } else {
                  statusCell = `<td>${row.caughtStatus || ''}</td>`;
                }
                
                // Create sprite cell if sprites are included
                let spriteCell = '';
                if (exportOptions.includeSprites && row.spriteUrl) {
                  spriteCell = `<td><img src="${row.spriteUrl}" alt="${row.name}" class="pokemon-sprite"></td>`;
                }
                
                return `
                  <tr>
                    <td>${row.dexNum}</td>
                    <td>${row.name}</td>
                    <td>${row.form}</td>
                    <td>${row.caught}</td>
                    ${statusCell}
                    <td>${row.types}</td>
                    <td>${row.generation}</td>
                    ${exportOptions.includeSprites ? spriteCell : ''}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <div id="tab-generations-content" class="tab-content">
          <h2>Generation Statistics</h2>
          <p>This tab shows which generations your Pokémon come from.</p>
          
          <div class="generation-stats">
            <h3>Pokémon by Generation</h3>
            <div class="stats-grid">
              ${Object.entries(exportData.reduce((acc, row) => {
                Object.keys(row).forEach(key => {
                  if (key.startsWith('gen_') && row[key] === 'Yes') {
                    const genName = key.replace('gen_', '');
                    acc[genName] = (acc[genName] || 0) + 1;
                  }
                });
                return acc;
              }, {})).map(([gen, count]) => {
                const genDisplayNames = {
                  'Virtual_Console': 'Virtual Console (Gen 1-2)',
                  'Gen3': 'Gen 3 (RSE/FRLG)',
                  'Gen4': 'Gen 4 (DPPt/HGSS)',
                  'Gen5': 'Gen 5 (BW/B2W2)',
                  'Gen6': 'Gen 6 (XY/ORAS)',
                  'Gen7': 'Gen 7 (SM/USUM)',
                  'SwSh': 'Sword/Shield',
                  'BDSP': 'Brilliant Diamond/Shining Pearl',
                  'PLA': 'Legends Arceus',
                  'SV': 'Scarlet/Violet',
                  'LetsGo': 'Let\'s Go Pikachu/Eevee',
                  'GO': 'Pokémon GO'
                };
                
                const displayName = genDisplayNames[gen] || gen;
                return `<div class="stat-item">${displayName} <span class="badge">${count}</span></div>`;
              }).join('')}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Dex #</th>
                <th>Name</th>
                <th>Form</th>
                ${Object.keys(exportData.reduce((acc, row) => {
                  Object.keys(row).forEach(key => {
                    if (key.startsWith('gen_') && row[key] === 'Yes') {
                      const genName = key.replace('gen_', '');
                      acc[genName] = true;
                    }
                  });
                  return acc;
                }, {})).map(gen => {
                  const genDisplayNames = {
                    'Virtual_Console': 'VC',
                    'Gen3': 'Gen 3',
                    'Gen4': 'Gen 4',
                    'Gen5': 'Gen 5',
                    'Gen6': 'Gen 6',
                    'Gen7': 'Gen 7',
                    'SwSh': 'SwSh',
                    'BDSP': 'BDSP',
                    'PLA': 'PLA',
                    'SV': 'SV',
                    'LetsGo': 'LGPE',
                    'GO': 'GO'
                  };
                  
                  return `<th>${genDisplayNames[gen] || gen}</th>`;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${exportData.map(row => {
                const genColumns = Object.keys(exportData.reduce((acc, r) => {
                  Object.keys(r).forEach(key => {
                    if (key.startsWith('gen_') && r[key] === 'Yes') {
                      const genName = key.replace('gen_', '');
                      acc[genName] = true;
                    }
                  });
                  return acc;
                }, {})).map(gen => {
                  const genKey = `gen_${gen}`;
                  const hasGen = row[genKey] === 'Yes';
                  return `<td class="${hasGen ? 'obtained' : 'missing'}">${hasGen ? '✓' : '✗'}</td>`;
                }).join('');
                
                return `
                  <tr>
                    <td>${row.dexNum}</td>
                    <td>${row.name}</td>
                    <td>${row.form}</td>
                    ${genColumns}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        <div id="tab-origin-marks-content" class="tab-content">
          <h2>Origin Mark Statistics</h2>
          <p>This tab shows which origin marks your Pokémon have.</p>
          
          <div class="origin-mark-stats">
            <h3>Pokémon by Origin Mark</h3>
            <div class="stats-grid">
              ${Object.entries(exportData.reduce((acc, row) => {
                Object.keys(row).forEach(key => {
                  if (key.startsWith('mark_') && row[key] === 'Yes') {
                    const markName = key.replace('mark_', '');
                    acc[markName] = (acc[markName] || 0) + 1;
                  }
                });
                return acc;
              }, {})).map(([mark, count]) => {
                const markDisplayNames = {
                  'gb': 'Game Boy',
                  'pentagon': 'Pentagon (Gen 6)',
                  'clover': 'Clover (Gen 7)',
                  'letsgo': 'Let\'s Go',
                  'galar': 'Galar (SwSh)',
                  'bdsp': 'BDSP',
                  'arceus': 'Arceus (PLA)',
                  'paldea': 'Paldea (SV)',
                  'go': 'GO'
                };
                
                const displayName = markDisplayNames[mark] || mark;
                return `<div class="stat-item">${displayName} <span class="badge">${count}</span></div>`;
              }).join('')}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Dex #</th>
                <th>Name</th>
                <th>Form</th>
                ${Object.keys(exportData.reduce((acc, row) => {
                  Object.keys(row).forEach(key => {
                    if (key.startsWith('mark_') && row[key] === 'Yes') {
                      const markName = key.replace('mark_', '');
                      acc[markName] = true;
                    }
                  });
                  return acc;
                }, {})).map(mark => {
                  const markDisplayNames = {
                    'gb': 'Game Boy',
                    'pentagon': 'Pentagon',
                    'clover': 'Clover',
                    'letsgo': 'Let\'s Go',
                    'galar': 'Galar',
                    'bdsp': 'BDSP',
                    'arceus': 'Arceus',
                    'paldea': 'Paldea',
                    'go': 'GO'
                  };
                  
                  return `<th>${markDisplayNames[mark] || mark}</th>`;
                }).join('')}
              </tr>
            </thead>
            <tbody>
              ${exportData.map(row => {
                const markColumns = Object.keys(exportData.reduce((acc, r) => {
                  Object.keys(r).forEach(key => {
                    if (key.startsWith('mark_') && r[key] === 'Yes') {
                      const markName = key.replace('mark_', '');
                      acc[markName] = true;
                    }
                  });
                  return acc;
                }, {})).map(mark => {
                  const markKey = `mark_${mark}`;
                  const hasMark = row[markKey] === 'Yes';
                  return `<td class="${hasMark ? 'obtained' : 'missing'}">${hasMark ? '✓' : '✗'}</td>`;
                }).join('');
                
                return `
                  <tr>
                    <td>${row.dexNum}</td>
                    <td>${row.name}</td>
                    <td>${row.form}</td>
                    ${markColumns}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </body>
      </html>
      `;
      
      // Create and download the HTML file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `pokemon_collection_${Date.now()}.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
  
  // Helper function to get sprite URLs for a Pokémon
  const getSpriteUrls = (id) => {
    return {
      regular: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
      officialArtwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      officialArtworkShiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`,
      home: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`,
      homeShiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${id}.png`
    };
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
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeSprites"
              checked={exportOptions.includeSprites}
              onChange={() => toggleOption('includeSprites')}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <label htmlFor="includeSprites" className="text-gray-300">Include Sprites</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeUnchecked"
              checked={exportOptions.includeUnchecked}
              onChange={() => toggleOption('includeUnchecked')}
              className="rounded text-red-500 focus:ring-red-500"
            />
            <label htmlFor="includeUnchecked" className="text-gray-300">Include Missing Marks/Ribbons</label>
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
