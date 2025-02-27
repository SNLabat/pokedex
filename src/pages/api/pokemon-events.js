import axios from 'axios';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Pokémon ID is required' });
  }
  
  try {
    // Format the ID with leading zeros
    const formattedId = String(id).padStart(3, '0');
    const url = `https://www.serebii.net/events/dex/${formattedId}.shtml`;
    
    // Fetch the HTML content
    const response = await axios.get(url);
    const html = response.data;
    
    // Parse the HTML to extract event data
    const events = parseSerebiiEvents(html, id);
    
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching Pokémon event data:', error);
    return res.status(500).json({ error: 'Failed to fetch event data' });
  }
}

function parseSerebiiEvents(html, pokemonId) {
  const $ = cheerio.load(html);
  const events = [];
  
  // Serebii's event tables have a specific structure
  // This is a simplified example - you would need to adapt this to the actual HTML structure
  $('.dextable').each((i, table) => {
    // Extract event information from each table
    const eventName = $(table).find('tr:first-child td').text().trim();
    const eventRows = $(table).find('tr');
    
    // Skip the first row (header)
    if (eventRows.length > 1) {
      const eventData = {
        name: eventName,
        location: $(eventRows[1]).find('td:nth-child(2)').text().trim(),
        distributionType: $(eventRows[2]).find('td:nth-child(2)').text().trim(),
        region: $(eventRows[3]).find('td:nth-child(2)').text().trim(),
        startDate: $(eventRows[4]).find('td:nth-child(2)').text().trim(),
        endDate: $(eventRows[5]).find('td:nth-child(2)').text().trim(),
        games: $(eventRows[6]).find('td:nth-child(2)').text().trim().split(',').map(g => g.trim()),
        level: parseInt($(eventRows[7]).find('td:nth-child(2)').text().trim(), 10) || 0,
        OT: $(eventRows[8]).find('td:nth-child(2)').text().trim(),
        ID: $(eventRows[9]).find('td:nth-child(2)').text().trim(),
        ability: $(eventRows[10]).find('td:nth-child(2)').text().trim(),
        heldItem: $(eventRows[11]).find('td:nth-child(2)').text().trim(),
        nature: $(eventRows[12]).find('td:nth-child(2)').text().trim(),
        isShiny: $(eventRows[13]).find('td:nth-child(2)').text().trim().toLowerCase().includes('yes'),
        moves: $(eventRows[14]).find('td:nth-child(2)').text().trim().split(',').map(m => m.trim()),
        ribbons: $(eventRows[15]).find('td:nth-child(2)').text().trim().split(',').map(r => r.trim()).filter(Boolean),
        notes: $(eventRows[16]).find('td:nth-child(2)').text().trim(),
        
        // Determine generation and year from the event data
        generation: determineGeneration($(eventRows[6]).find('td:nth-child(2)').text().trim()),
        year: extractYear($(eventRows[4]).find('td:nth-child(2)').text().trim())
      };
      
      events.push(eventData);
    }
  });
  
  return events;
}

function determineGeneration(gamesText) {
  // Logic to determine generation based on games
  if (gamesText.includes('Sword') || gamesText.includes('Shield')) return 'gen8';
  if (gamesText.includes('Sun') || gamesText.includes('Moon') || gamesText.includes('Ultra')) return 'gen7';
  if (gamesText.includes('X') || gamesText.includes('Y') || gamesText.includes('Omega') || gamesText.includes('Alpha')) return 'gen6';
  if (gamesText.includes('Black') || gamesText.includes('White')) return 'gen5';
  if (gamesText.includes('Diamond') || gamesText.includes('Pearl') || gamesText.includes('Platinum') || 
      gamesText.includes('HeartGold') || gamesText.includes('SoulSilver')) return 'gen4';
  if (gamesText.includes('Ruby') || gamesText.includes('Sapphire') || gamesText.includes('Emerald') || 
      gamesText.includes('FireRed') || gamesText.includes('LeafGreen')) return 'gen3';
  if (gamesText.includes('Gold') || gamesText.includes('Silver') || gamesText.includes('Crystal')) return 'gen2';
  if (gamesText.includes('Red') || gamesText.includes('Blue') || gamesText.includes('Yellow')) return 'gen1';
  
  return 'unknown';
}

function extractYear(dateText) {
  // Extract year from date text (e.g., "17 June 2021" -> 2021)
  const yearMatch = dateText.match(/\d{4}/);
  return yearMatch ? parseInt(yearMatch[0], 10) : 0;
} 