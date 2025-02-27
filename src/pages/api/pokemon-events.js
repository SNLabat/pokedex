import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Optional: Add caching to reduce load on Serebii
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Pokémon ID is required' });
  }
  
  try {
    // Format the ID with leading zeros
    const formattedId = String(id).padStart(3, '0');
    
    // Try to use the direct Serebii URL approach
    const url = `https://www.serebii.net/events/dex/${formattedId}.shtml`;
    
    console.log(`Fetching event data for Pokémon #${formattedId}`);
    
    // Add comprehensive headers to avoid being blocked
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.serebii.net/events/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      },
      next: { revalidate: 3600 } // Cache for 1 hour in Vercel
    });
    
    if (!response.ok) {
      console.error(`Error fetching Serebii data: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Validate the HTML response
    if (!html || html.length < 500) {
      console.error('Received empty or invalid HTML response');
      throw new Error('Received empty or invalid HTML response');
    }
    
    // Parse the HTML to extract event data
    const events = parseSerebiiEventHtml(html, formattedId);
    
    // Check if we got any events
    if (events.length === 0) {
      console.log(`No events found for Pokémon #${formattedId}`);
    } else {
      console.log(`Found ${events.length} events for Pokémon #${formattedId}`);
    }
    
    // Return the events data
    return res.status(200).json(events);
    
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch event data', 
      details: error.message,
      pokemonId: id
    });
  }
}

/**
 * Parse Serebii event HTML
 */
function parseSerebiiEventHtml(html, pokemonId) {
  const events = [];
  
  try {
    // First check if this is a "no events" page
    if (html.includes("No Events have been released for this Pokémon") || 
        html.includes("No event Pokémon have been released")) {
      console.log(`Serebii indicates no events for Pokémon #${pokemonId}`);
      return [];
    }
    
    // Use a combination of approaches to extract events
    
    // 1. Look for tables with specific event data structure
    const eventTables = findEventTables(html);
    
    for (const table of eventTables) {
      const event = extractEventFromTable(table);
      if (event && Object.keys(event).length > 3) {
        // Add generation and year data
        event.generation = determineGeneration(event.games);
        event.year = extractYear(event.startDate);
        events.push(event);
      }
    }
    
    // Sort events by year (newest first)
    return events.sort((a, b) => b.year - a.year);
    
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [];
  }
}

/**
 * Find all event tables in the HTML
 */
function findEventTables(html) {
  const tables = [];
  
  try {
    // First, check for standard dextable structure
    let tableRegex = /<table[^>]*class=["']dextable["'][^>]*>([\s\S]*?)<\/table>/gi;
    let match;
    
    while ((match = tableRegex.exec(html)) !== null) {
      const tableContent = match[0];
      
      // Check if this table has event-related content
      if (tableContent.includes('Location') || 
          tableContent.includes('Distribution') || 
          tableContent.includes('Games') || 
          tableContent.includes('Level')) {
        
        tables.push(tableContent);
      }
    }
    
    // If we didn't find any tables with the normal approach,
    // try a more general table search
    if (tables.length === 0) {
      tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
      
      while ((match = tableRegex.exec(html)) !== null) {
        const tableContent = match[0];
        
        // Check if this looks like an event table
        if ((tableContent.includes('Location') || tableContent.includes('Level')) && 
            tableContent.includes('<td') && 
            tableContent.length > 200) {
          
          tables.push(tableContent);
        }
      }
    }
    
    return tables;
    
  } catch (error) {
    console.error('Error finding event tables:', error);
    return [];
  }
}

/**
 * Extract event data from a table
 */
function extractEventFromTable(tableHtml) {
  try {
    // Extract event name (often in the first row)
    const nameMatch = tableHtml.match(/<tr[^>]*>\s*<td[^>]*>\s*(?:<b>|<a[^>]*>)?\s*([^<]+)/i);
    const eventName = nameMatch ? nameMatch[1].trim() : 'Unknown Event';
    
    // Create the event object
    const event = {
      name: eventName,
      location: '',
      distributionType: '',
      region: '',
      startDate: '',
      endDate: '',
      games: [],
      level: 0,
      OT: '',
      ID: '',
      ability: '',
      heldItem: '',
      nature: '',
      isShiny: false,
      moves: [],
      ribbons: [],
      notes: ''
    };
    
    // Define the fields we want to extract with their possible labels
    const fields = [
      { name: 'location', labels: ['Location', 'Event Location', 'Locations'] },
      { name: 'distributionType', labels: ['Distribution', 'Method', 'Distribution Method'] },
      { name: 'region', labels: ['Region', 'Area', 'Countries'] },
      { name: 'startDate', labels: ['Start Date', 'Starting', 'Begin'] },
      { name: 'endDate', labels: ['End Date', 'Ending', 'End'] },
      { name: 'games', labels: ['Games', 'Compatible Games', 'Game'] },
      { name: 'level', labels: ['Level', 'Levels'] },
      { name: 'OT', labels: ['OT', 'Original Trainer', 'Trainer'] },
      { name: 'ID', labels: ['ID', 'Trainer ID', 'TID'] },
      { name: 'ability', labels: ['Ability', 'Abilities'] },
      { name: 'heldItem', labels: ['Held Item', 'Item', 'Items'] },
      { name: 'nature', labels: ['Nature', 'Natures'] },
      { name: 'isShiny', labels: ['Shiny', 'Shining'] },
      { name: 'moves', labels: ['Moves', 'Known Moves', 'Attacks'] },
      { name: 'ribbons', labels: ['Ribbons', 'Ribbon'] },
      { name: 'notes', labels: ['Notes', 'Additional Information', 'Comments'] }
    ];
    
    // Extract rows from the table
    const rows = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    
    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      rows.push(rowMatch[1]);
    }
    
    // Extract field values from the rows
    for (const field of fields) {
      const value = extractFieldFromRows(rows, field.labels);
      
      // Handle different field types
      if (field.name === 'games' || field.name === 'moves' || field.name === 'ribbons') {
        event[field.name] = parseListValue(value);
      } else if (field.name === 'isShiny') {
        event[field.name] = value.toLowerCase().includes('yes');
      } else if (field.name === 'level') {
        event[field.name] = parseInt(value, 10) || 0;
      } else {
        event[field.name] = value;
      }
    }
    
    return event;
    
  } catch (error) {
    console.error('Error extracting event from table:', error);
    return null;
  }
}

/**
 * Extract field value from table rows
 */
function extractFieldFromRows(rows, labelVariations) {
  for (const row of rows) {
    for (const label of labelVariations) {
      // Check for various label formats
      if (row.includes(`<td>${label}</td>`) || 
          row.includes(`<td>${label}:</td>`) ||
          row.includes(`<td><b>${label}</b></td>`) ||
          row.includes(`<td class="fooinfo">${label}</td>`)) {
        
        // Extract the value cell
        const valueMatch = row.match(/<td[^>]*>.*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/i);
        
        if (valueMatch) {
          // Clean up the value
          return cleanHtmlValue(valueMatch[1]);
        }
      }
    }
  }
  
  return '';
}

/**
 * Clean HTML value by removing tags and normalizing whitespace
 */
function cleanHtmlValue(html) {
  return html
    .replace(/<(?!br\s*\/?>)[^>]+>/g, '') // Remove all HTML tags except <br>
    .replace(/<br\s*\/?>/gi, ', ')        // Replace <br> with commas
    .replace(/&nbsp;/g, ' ')              // Replace &nbsp; with spaces
    .replace(/&amp;/g, '&')               // Replace &amp; with &
    .replace(/&lt;/g, '<')                // Replace &lt; with <
    .replace(/&gt;/g, '>')                // Replace &gt; with >
    .replace(/,\s*,/g, ',')               // Remove double commas
    .replace(/\s+/g, ' ')                 // Normalize whitespace
    .trim();
}

/**
 * Parse a comma-separated list value
 */
function parseListValue(value) {
  if (!value) return [];
  
  return value
    .split(/,\s*/)
    .map(item => item.trim())
    .filter(Boolean);
}

/**
 * Determine generation based on games
 */
function determineGeneration(games) {
  if (!games || games.length === 0) return 'unknown';
  
  const gamesText = games.join(' ').toLowerCase();
  
  if (gamesText.includes('scarlet') || gamesText.includes('violet')) return 'gen9';
  if (gamesText.includes('sword') || gamesText.includes('shield') || 
      gamesText.includes('brilliant diamond') || gamesText.includes('shining pearl') ||
      gamesText.includes('legends') || gamesText.includes('arceus') ||
      gamesText.includes('home')) return 'gen8';
  if (gamesText.includes('sun') || gamesText.includes('moon') || 
      gamesText.includes('ultra') || gamesText.includes('let\'s go')) return 'gen7';
  if (gamesText.includes('x') || gamesText.includes('y') || 
      gamesText.includes('omega ruby') || gamesText.includes('alpha sapphire')) return 'gen6';
  if (gamesText.includes('black') || gamesText.includes('white')) return 'gen5';
  if (gamesText.includes('diamond') || gamesText.includes('pearl') || 
      gamesText.includes('platinum') || gamesText.includes('heartgold') || 
      gamesText.includes('soulsilver')) return 'gen4';
  if (gamesText.includes('ruby') || gamesText.includes('sapphire') || 
      gamesText.includes('emerald') || gamesText.includes('firered') || 
      gamesText.includes('leafgreen')) return 'gen3';
  if (gamesText.includes('gold') || gamesText.includes('silver') || 
      gamesText.includes('crystal')) return 'gen2';
  if (gamesText.includes('red') || gamesText.includes('blue') || 
      gamesText.includes('yellow')) return 'gen1';
  
  return 'unknown';
}

/**
 * Extract year from date text
 */
function extractYear(dateText) {
  if (!dateText) return new Date().getFullYear();
  
  const yearMatch = dateText.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();
} 