export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Pokémon ID is required' });
  }
  
  try {
    // Format the ID with leading zeros
    const formattedId = String(id).padStart(3, '0');
    const url = `https://www.serebii.net/events/dex/${formattedId}.shtml`;
    
    // Fetch the HTML content using native fetch
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML to extract event data
    const events = parseSerebiiEventHtml(html);
    
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching Pokémon event data:', error);
    return res.status(500).json({ error: 'Failed to fetch event data', details: error.message });
  }
}

/**
 * Parse Serebii event HTML without using external libraries
 */
function parseSerebiiEventHtml(html) {
  const events = [];
  
  try {
    // Extract event tables - they typically have the class "dextable"
    const dextableRegex = /<table class="dextable"[^>]*>([\s\S]*?)<\/table>/g;
    let tableMatch;
    
    while ((tableMatch = dextableRegex.exec(html)) !== null) {
      const tableHtml = tableMatch[0];
      
      // Skip tables that don't contain event data
      if (!tableHtml.includes('<td>Distribution</td>')) {
        continue;
      }
      
      // Extract the event name from the first row
      const nameMatch = tableHtml.match(/<tr>\s*<td[^>]*>\s*<a[^>]*>\s*([^<]+)/);
      const eventName = nameMatch ? nameMatch[1].trim() : 'Unknown Event';
      
      // Extract rows from the table
      const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
      let rows = [];
      let rowMatch;
      
      while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
        rows.push(rowMatch[1]);
      }
      
      // Skip tables with too few rows
      if (rows.length < 10) {
        continue;
      }
      
      // Extract data fields
      const location = extractFieldValue(rows, 'Location');
      const distributionType = extractFieldValue(rows, 'Distribution');
      const region = extractFieldValue(rows, 'Region');
      const startDate = extractFieldValue(rows, 'Start Date');
      const endDate = extractFieldValue(rows, 'End Date');
      const gamesText = extractFieldValue(rows, 'Games');
      const level = extractFieldValue(rows, 'Level');
      const ot = extractFieldValue(rows, 'OT');
      const id = extractFieldValue(rows, 'ID');
      const ability = extractFieldValue(rows, 'Ability');
      const heldItem = extractFieldValue(rows, 'Held Item');
      const nature = extractFieldValue(rows, 'Nature');
      const shinyText = extractFieldValue(rows, 'Shiny');
      const movesText = extractFieldValue(rows, 'Moves');
      const ribbonsText = extractFieldValue(rows, 'Ribbons');
      const notes = extractFieldValue(rows, 'Notes');
      
      // Process extracted data
      const games = gamesText.split(',').map(g => g.trim()).filter(Boolean);
      const moves = movesText.split(',').map(m => m.trim()).filter(Boolean);
      const ribbons = ribbonsText.split(',').map(r => r.trim()).filter(Boolean);
      const isShiny = shinyText.toLowerCase().includes('yes');
      
      // Determine generation and year
      const generation = determineGeneration(games);
      const year = extractYear(startDate);
      
      // Create event object
      const event = {
        name: eventName,
        location,
        distributionType,
        region,
        startDate,
        endDate,
        games,
        level: parseInt(level, 10) || 0,
        OT: ot,
        ID: id,
        ability,
        heldItem: heldItem === 'None' ? '' : heldItem,
        nature,
        isShiny,
        moves,
        ribbons,
        notes,
        generation,
        year
      };
      
      events.push(event);
    }
  } catch (error) {
    console.error('Error parsing HTML:', error);
  }
  
  // Sort events by year (newest first)
  return events.sort((a, b) => b.year - a.year);
}

/**
 * Extract field value from table rows
 */
function extractFieldValue(rows, fieldName) {
  for (const row of rows) {
    if (row.includes(`<td>${fieldName}</td>`)) {
      // Extract the content from the second cell in the row
      const valueMatch = row.match(/<td>.*?<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>/);
      if (valueMatch) {
        // Clean up HTML tags and trim whitespace
        return valueMatch[1]
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&nbsp;/g, ' ')  // Replace &nbsp; with spaces
          .trim();
      }
    }
  }
  return '';
}

/**
 * Determine generation based on games
 */
function determineGeneration(games) {
  const gamesText = games.join(' ');
  
  if (gamesText.includes('Scarlet') || gamesText.includes('Violet')) return 'gen9';
  if (gamesText.includes('Sword') || gamesText.includes('Shield') || 
      gamesText.includes('Brilliant Diamond') || gamesText.includes('Shining Pearl') ||
      gamesText.includes('Legends: Arceus')) return 'gen8';
  if (gamesText.includes('Sun') || gamesText.includes('Moon') || 
      gamesText.includes('Ultra') || gamesText.includes('Let\'s Go')) return 'gen7';
  if (gamesText.includes('X') || gamesText.includes('Y') || 
      gamesText.includes('Omega Ruby') || gamesText.includes('Alpha Sapphire')) return 'gen6';
  if (gamesText.includes('Black') || gamesText.includes('White')) return 'gen5';
  if (gamesText.includes('Diamond') || gamesText.includes('Pearl') || 
      gamesText.includes('Platinum') || gamesText.includes('HeartGold') || 
      gamesText.includes('SoulSilver')) return 'gen4';
  if (gamesText.includes('Ruby') || gamesText.includes('Sapphire') || 
      gamesText.includes('Emerald') || gamesText.includes('FireRed') || 
      gamesText.includes('LeafGreen')) return 'gen3';
  if (gamesText.includes('Gold') || gamesText.includes('Silver') || 
      gamesText.includes('Crystal')) return 'gen2';
  if (gamesText.includes('Red') || gamesText.includes('Blue') || 
      gamesText.includes('Yellow')) return 'gen1';
  
  return 'unknown';
}

/**
 * Extract year from date text
 */
function extractYear(dateText) {
  const yearMatch = dateText.match(/\d{4}/);
  return yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();
} 