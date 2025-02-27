export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Pokémon ID is required' });
  }
  
  try {
    // Format the ID with leading zeros
    const formattedId = String(id).padStart(3, '0');
    const url = `https://www.serebii.net/events/dex/${formattedId}.shtml`;
    
    // Add a User-Agent header to avoid being blocked
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML to extract event data
    const events = parseSerebiiEventHtml(html, formattedId);
    
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching Pokémon event data:', error);
    return res.status(500).json({ error: 'Failed to fetch event data', details: error.message });
  }
}

/**
 * Parse Serebii event HTML without using external libraries
 */
function parseSerebiiEventHtml(html, pokemonId) {
  const events = [];
  
  try {
    // Check if the page has event data
    if (!html.includes('Events') || !html.includes('dextable')) {
      return events;
    }
    
    // Find all event tables - Serebii typically uses tables with a class of "dextable" for event data
    const tableRegex = /<table class="dextable"[^>]*>([\s\S]*?)<\/table>/g;
    let tableMatch;
    
    // Process each event table
    while ((tableMatch = tableRegex.exec(html)) !== null) {
      const tableContent = tableMatch[1];
      
      // Skip tables that don't contain event data
      if (!tableContent.includes('<td>Distribution</td>') && 
          !tableContent.includes('<td>Method</td>') && 
          !tableContent.includes('<td>Games</td>')) {
        continue;
      }
      
      // Extract event name - typically in the first row, may be in an <a> tag or directly in a <td>
      const nameRegex = /<tr[^>]*>\s*<td[^>]*>\s*(?:<a[^>]*>)?\s*([^<]+)/;
      const nameMatch = tableContent.match(nameRegex);
      const eventName = nameMatch ? nameMatch[1].trim() : 'Unknown Event';
      
      // Extract all rows
      const rows = extractTableRows(tableContent);
      
      // Create event object with extracted data
      const event = {
        name: eventName,
        location: findFieldValue(rows, ['Location', 'Event Location']),
        distributionType: findFieldValue(rows, ['Distribution', 'Method', 'Distribution Method']),
        region: findFieldValue(rows, ['Region', 'Area']),
        startDate: findFieldValue(rows, ['Start Date', 'Starting']),
        endDate: findFieldValue(rows, ['End Date', 'Ending']),
        games: parseListField(findFieldValue(rows, ['Games', 'Compatible Games'])),
        level: parseInt(findFieldValue(rows, ['Level']), 10) || 0,
        OT: findFieldValue(rows, ['OT', 'Original Trainer']),
        ID: findFieldValue(rows, ['ID', 'Trainer ID']),
        ability: findFieldValue(rows, ['Ability']),
        heldItem: findFieldValue(rows, ['Held Item', 'Item']),
        nature: findFieldValue(rows, ['Nature']),
        isShiny: findFieldValue(rows, ['Shiny']).toLowerCase().includes('yes'),
        moves: parseListField(findFieldValue(rows, ['Moves', 'Known Moves'])),
        ribbons: parseListField(findFieldValue(rows, ['Ribbons', 'Ribbon'])),
        notes: findFieldValue(rows, ['Notes', 'Additional Information']),
      };
      
      // Add generation and year data
      event.generation = determineGeneration(event.games);
      event.year = extractYear(event.startDate);
      
      // Only add events with at least some basic data
      if (event.name && (event.games.length > 0 || event.location || event.distributionType)) {
        events.push(event);
      }
    }
  } catch (error) {
    console.error('Error parsing HTML:', error);
  }
  
  // Sort events by year (newest first)
  return events.sort((a, b) => b.year - a.year);
}

/**
 * Extract all rows from a table
 */
function extractTableRows(tableContent) {
  const rows = [];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let rowMatch;
  
  while ((rowMatch = rowRegex.exec(tableContent)) !== null) {
    rows.push(rowMatch[1]);
  }
  
  return rows;
}

/**
 * Find field value by possible field names
 */
function findFieldValue(rows, possibleFieldNames) {
  for (const row of rows) {
    for (const fieldName of possibleFieldNames) {
      if (row.includes(`<td>${fieldName}</td>`) || 
          row.includes(`<td>${fieldName}:</td>`) ||
          row.includes(`<td><b>${fieldName}</b></td>`)) {
        
        // Extract content from second cell
        const valueRegex = /<td[^>]*>.*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/;
        const valueMatch = row.match(valueRegex);
        
        if (valueMatch) {
          // Clean up HTML tags and trim whitespace
          return valueMatch[1]
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')  // Replace &nbsp; with spaces
            .replace(/&amp;/g, '&')   // Replace &amp; with &
            .trim();
        }
      }
    }
  }
  return '';
}

/**
 * Parse a comma-separated list field
 */
function parseListField(text) {
  if (!text) return [];
  
  return text
    .split(/,|<br>/)
    .map(item => item.trim())
    .filter(Boolean);
}

/**
 * Determine generation based on games
 */
function determineGeneration(games) {
  const gamesText = games.join(' ').toLowerCase();
  
  if (gamesText.includes('scarlet') || gamesText.includes('violet')) return 'gen9';
  if (gamesText.includes('sword') || gamesText.includes('shield') || 
      gamesText.includes('brilliant diamond') || gamesText.includes('shining pearl') ||
      gamesText.includes('legends') || gamesText.includes('arceus')) return 'gen8';
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
  const yearMatch = dateText.match(/\d{4}/);
  return yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();
} 