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
    const pokemonName = await getPokemonName(id); // We'll need to implement this function
    
    console.log(`Fetching event data for Pokémon #${formattedId} (${pokemonName})`);

    // Bulbapedia URLs for different generations
    const bulbapediaUrls = [
      `https://bulbapedia.bulbagarden.net/wiki/List_of_English_event_Pokémon_distributions_in_Generation_III`,
      `https://bulbapedia.bulbagarden.net/wiki/List_of_local_English_event_Pokémon_distributions_in_Generation_IV`,
      `https://bulbapedia.bulbagarden.net/wiki/List_of_Wi-Fi_English_event_Pokémon_distributions_in_Generation_IV`,
      `https://bulbapedia.bulbagarden.net/wiki/List_of_local_English_event_Pokémon_distributions_in_Generation_V`,
      `https://bulbapedia.bulbagarden.net/wiki/List_of_Wi-Fi_English_event_Pokémon_distributions_in_Generation_V`,
      `https://bulbapedia.bulbagarden.net/wiki/List_of_American_region_Nintendo_Network_event_Pokémon_distributions_in_Generation_VI`
    ];
    
    // Collect events from all generations
    const allEvents = [];
    
    for (const url of bulbapediaUrls) {
      try {
        console.log(`Fetching from: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          cache: 'no-store' // Disable caching
        });
        
        if (!response.ok) {
          console.warn(`Skipping URL ${url} due to ${response.status} response`);
          continue;
        }
        
        const html = await response.text();
        
        // Parse events for the specific Pokémon
        const events = parseBulbapediaEvents(html, formattedId, pokemonName);
        allEvents.push(...events);
        
        console.log(`Found ${events.length} events for ${pokemonName} in ${url}`);
      } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
        // Continue with other URLs even if one fails
      }
    }
    
    // Sort events by year (newest first)
    allEvents.sort((a, b) => b.year - a.year);
    
    // Return the events
    return res.status(200).json(allEvents);
    
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
 * Get the Pokémon name from its ID
 */
async function getPokemonName(id) {
  try {
    // Use the PokeAPI to get the name
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    const data = await response.json();
    return data.name.charAt(0).toUpperCase() + data.name.slice(1);
  } catch (error) {
    console.error('Error fetching Pokémon name:', error);
    return `Pokemon-${id}`;
  }
}

/**
 * Parse Bulbapedia HTML to extract event data for a specific Pokémon
 */
function parseBulbapediaEvents(html, formattedId, pokemonName) {
  const events = [];
  
  // Convert the HTML to lowercase for case-insensitive matching
  const lowerPokemonName = pokemonName.toLowerCase();
  const lowerHtml = html.toLowerCase();
  
  // Look for tables that mention this Pokémon
  // Bulbapedia uses specific table formats for event Pokémon
  const tableRegex = /<table.*?<\/table>/gs;
  const tables = html.match(tableRegex) || [];
  
  // Also look for sections that might mention this Pokémon
  const sectionRegex = /<h3.*?>(.*?)<\/h3>/gs;
  const sections = html.match(sectionRegex) || [];
  
  // Check each table for our Pokémon
  for (const table of tables) {
    if (table.toLowerCase().includes(lowerPokemonName) || 
        table.includes(`Dex No. ${formattedId}`)) {
      try {
        const event = extractEventFromTable(table, pokemonName);
        if (event) {
          events.push(event);
        }
      } catch (e) {
        console.error('Error parsing table:', e);
      }
    }
  }
  
  // Look for metadata sections that might mention the Pokémon
  for (let i = 0; i < sections.length; i++) {
    const sectionTitle = sections[i];
    if (sectionTitle.toLowerCase().includes(lowerPokemonName)) {
      try {
        // Get content until next h3
        let endIndex = html.indexOf('<h3', html.indexOf(sectionTitle) + sectionTitle.length);
        if (endIndex === -1) endIndex = html.length;
        
        const sectionContent = html.substring(
          html.indexOf(sectionTitle) + sectionTitle.length,
          endIndex
        );
        
        const event = extractEventFromSection(sectionContent, sectionTitle, pokemonName);
        if (event) {
          events.push(event);
        }
      } catch (e) {
        console.error('Error parsing section:', e);
      }
    }
  }
  
  return events;
}

/**
 * Extract event data from a Bulbapedia table
 */
function extractEventFromTable(tableHtml, pokemonName) {
  // Extract the event name/title
  const titleMatch = tableHtml.match(/<h3.*?>(.*?)<\/h3>/i) || 
                    tableHtml.match(/<tr.*?><th.*?>(.*?)<\/th>/i) ||
                    tableHtml.match(/<caption.*?>(.*?)<\/caption>/i);
  
  let name = titleMatch ? cleanHtml(titleMatch[1]) : `${pokemonName} Event`;
  
  // Extract the distribution date/period
  const dateMatch = tableHtml.match(/This Pokémon was available in.*?from.*?(January|February|March|April|May|June|July|August|September|October|November|December).*?(?:to|through).*?(\d{4})/i) ||
                   tableHtml.match(/This Pokémon was available in.*?(January|February|March|April|May|June|July|August|September|October|November|December).*?(\d{4})/i) ||
                   tableHtml.match(/Available.*?from.*?(January|February|March|April|May|June|July|August|September|October|November|December).*?(\d{4})/i);
  
  let startDate = null;
  let endDate = null;
  let year = new Date().getFullYear();
  
  if (dateMatch) {
    const monthName = dateMatch[1];
    year = parseInt(dateMatch[2], 10);
    startDate = `${monthName} ${year}`;
    endDate = dateMatch[3] ? `${dateMatch[3]} ${year}` : startDate;
  }
  
  // Extract location(s)
  const locationMatch = tableHtml.match(/This Pokémon was available in\s+<b>(.*?)<\/b>/i) ||
                       tableHtml.match(/This Pokémon was available in\s+(.*?)(?:from|in|on)/i);
  
  let location = locationMatch ? cleanHtml(locationMatch[1]) : 'Various Locations';
  
  // Extract moves
  const movesMatch = tableHtml.match(/<td.*?>Battle Moves<\/td>.*?<td.*?>(.*?)<\/td>/is);
  let moves = [];
  if (movesMatch) {
    moves = cleanHtml(movesMatch[1])
      .split(/(,|\n)/)
      .map(move => move.trim())
      .filter(move => move && !move.match(/^(,|\n)$/));
  }
  
  // Extract generation
  let generation = 'unknown';
  if (tableHtml.includes('Generation III')) generation = 'gen3';
  else if (tableHtml.includes('Generation IV')) generation = 'gen4';
  else if (tableHtml.includes('Generation V')) generation = 'gen5';
  else if (tableHtml.includes('Generation VI')) generation = 'gen6';
  else if (tableHtml.includes('Generation VII')) generation = 'gen7';
  else if (tableHtml.includes('Generation VIII')) generation = 'gen8';
  else if (tableHtml.includes('Generation IX')) generation = 'gen9';
  
  // Extract Original Trainer
  const otMatch = tableHtml.match(/<td.*?>OT<\/td>.*?<td.*?>(.*?)<\/td>/is);
  let ot = otMatch ? cleanHtml(otMatch[1]) : 'Event';
  
  // Extract whether it's shiny
  const isShiny = tableHtml.toLowerCase().includes('shiny') || 
                 tableHtml.includes('spr_') && tableHtml.includes('_s.png');
  
  return {
    name,
    startDate,
    endDate,
    year,
    location,
    distributionType: 'Official Event',
    region: 'International',
    games: extractGamesFromHtml(tableHtml),
    generation,
    OT: ot,
    isShiny,
    moves,
    notes: `This event distribution was documented on Bulbapedia.`
  };
}

/**
 * Extract event data from a Bulbapedia section
 */
function extractEventFromSection(sectionHtml, sectionTitle, pokemonName) {
  // Similar to table extraction but adapted for section content
  const cleanTitle = cleanHtml(sectionTitle);
  const name = cleanTitle || `${pokemonName} Event`;
  
  // Extract year - will look for patterns like "2011" or "in 2011"
  const yearMatch = sectionHtml.match(/\b(20\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
  
  // Extract dates - look for month names
  const dateMatch = sectionHtml.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:\s*[-–]\s*\d{1,2})?,\s+\d{4}/i);
  const startDate = dateMatch ? dateMatch[0] : null;
  
  // Extract location - often in the first paragraph
  const locationMatch = sectionHtml.match(/distributed(?:\s+at|\s+in|\s+via|\s+through)\s+(.*?)(?:\.|from|on|during|to)/i);
  const location = locationMatch ? cleanHtml(locationMatch[1]) : 'Various Locations';
  
  // Try to determine if shiny
  const isShiny = sectionHtml.toLowerCase().includes('shiny') || 
                 sectionTitle.toLowerCase().includes('shiny');
  
  return {
    name,
    startDate,
    endDate: null,
    year,
    location,
    distributionType: 'Official Event',
    region: 'International',
    games: extractGamesFromHtml(sectionHtml),
    generation: determineGenerationFromYear(year),
    isShiny,
    notes: `This event distribution was documented on Bulbapedia.`
  };
}

/**
 * Extract game names from HTML
 */
function extractGamesFromHtml(html) {
  const games = [];
  
  // Check for common game abbreviations used in Bulbapedia
  if (html.includes('D') || html.includes('Diamond')) games.push('Diamond');
  if (html.includes('P') || html.includes('Pearl')) games.push('Pearl');
  if (html.includes('Pt') || html.includes('Platinum')) games.push('Platinum');
  if (html.includes('HG') || html.includes('HeartGold')) games.push('HeartGold');
  if (html.includes('SS') || html.includes('SoulSilver')) games.push('SoulSilver');
  if (html.includes('B') || html.includes('Black')) games.push('Black');
  if (html.includes('W') || html.includes('White')) games.push('White');
  if (html.includes('B2') || html.includes('Black 2')) games.push('Black 2');
  if (html.includes('W2') || html.includes('White 2')) games.push('White 2');
  if (html.includes('X')) games.push('X');
  if (html.includes('Y')) games.push('Y');
  if (html.includes('OR') || html.includes('Omega Ruby')) games.push('Omega Ruby');
  if (html.includes('AS') || html.includes('Alpha Sapphire')) games.push('Alpha Sapphire');
  if (html.includes('S') || html.includes('Sun')) games.push('Sun');
  if (html.includes('M') || html.includes('Moon')) games.push('Moon');
  if (html.includes('US') || html.includes('Ultra Sun')) games.push('Ultra Sun');
  if (html.includes('UM') || html.includes('Ultra Moon')) games.push('Ultra Moon');
  if (html.includes('SW') || html.includes('Sword')) games.push('Sword');
  if (html.includes('SH') || html.includes('Shield')) games.push('Shield');
  if (html.includes('BD') || html.includes('Brilliant Diamond')) games.push('Brilliant Diamond');
  if (html.includes('SP') || html.includes('Shining Pearl')) games.push('Shining Pearl');
  if (html.includes('PLA') || html.includes('Legends Arceus')) games.push('Legends Arceus');
  if (html.includes('SV') || html.includes('Scarlet') || html.includes('Violet')) {
    games.push('Scarlet');
    games.push('Violet');
  }
  
  return games.length > 0 ? games : ['Unknown'];
}

/**
 * Determine generation based on year
 */
function determineGenerationFromYear(year) {
  if (year <= 2002) return 'gen2';
  if (year <= 2006) return 'gen3';
  if (year <= 2010) return 'gen4';
  if (year <= 2013) return 'gen5';
  if (year <= 2016) return 'gen6';
  if (year <= 2019) return 'gen7';
  if (year <= 2022) return 'gen8';
  return 'gen9';
}

/**
 * Clean HTML content
 */
function cleanHtml(html) {
  if (!html) return '';
  
  return html
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')  // Replace &nbsp; with spaces
    .replace(/&amp;/g, '&')   // Replace &amp; with &
    .replace(/&lt;/g, '<')    // Replace &lt; with <
    .replace(/&gt;/g, '>')    // Replace &gt; with >
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
} 