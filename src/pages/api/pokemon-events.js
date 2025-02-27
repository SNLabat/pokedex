export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Pokémon ID is required' });
  }
  
  try {
    // Format the ID with leading zeros
    const formattedId = String(id).padStart(3, '0');
    const url = `https://www.serebii.net/events/dex/${formattedId}.shtml`;
    
    // For now, return mock data based on the ID
    // In a production environment, you would implement proper scraping with permission
    const events = getMockEventData(parseInt(id, 10));
    
    return res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching Pokémon event data:', error);
    return res.status(500).json({ error: 'Failed to fetch event data' });
  }
}

// Mock data function based on Serebii's Bulbasaur events
function getMockEventData(pokemonId) {
  // For this example, we'll only return data for Bulbasaur (ID: 1)
  if (pokemonId === 1) {
    return [
      {
        name: "Pokémon HOME June Update Gift",
        location: "Wi-Fi Global",
        distributionType: "Mystery Gift",
        region: "Global",
        startDate: "17 June 2021",
        endDate: "30 June 2021",
        games: ["HOME"],
        level: 14,
        OT: "HOME",
        ID: "210601",
        ability: "Overgrow",
        heldItem: "None",
        nature: "Bold",
        isShiny: false,
        moves: ["Vine Whip", "Growth", "Leech Seed", "Razor Leaf"],
        ribbons: ["Premier Ribbon"],
        generation: "gen8",
        year: 2021
      },
      // ... other Bulbasaur events ...
    ];
  }
  
  // For Pikachu (ID: 25), return some Pikachu events
  if (pokemonId === 25) {
    return [
      {
        name: "Pokémon 25th Anniversary Distribution",
        location: "Wi-Fi Global",
        distributionType: "Mystery Gift",
        region: "Global",
        startDate: "25 February 2021",
        endDate: "25 March 2021",
        games: ["Sword", "Shield"],
        level: 25,
        OT: "P25",
        ID: "210225",
        ability: "Static",
        heldItem: "Light Ball",
        nature: "Modest",
        isShiny: false,
        moves: ["Thunderbolt", "Play Nice", "Celebrate", "Sing"],
        ribbons: ["Classic Ribbon"],
        generation: "gen8",
        year: 2021
      },
      {
        name: "Pokémon GO Fest 2022",
        location: "Pokémon GO",
        distributionType: "In-Game Event",
        region: "Global",
        startDate: "4 June 2022",
        endDate: "5 June 2022",
        games: ["Pokémon GO"],
        level: 15,
        OT: "Player's OT",
        ID: "Player's ID",
        ability: "Static",
        heldItem: "None",
        nature: "Random",
        isShiny: true,
        moves: ["Thunder Shock", "Quick Attack", "Thunderbolt", "Play Rough"],
        ribbons: [],
        generation: "gen8",
        year: 2022
      }
    ];
  }
  
  // For Charizard (ID: 6), return some Charizard events
  if (pokemonId === 6) {
    return [
      {
        name: "Leonardo Charizard Distribution",
        location: "Wi-Fi Global",
        distributionType: "Serial Code",
        region: "Global",
        startDate: "11 November 2020",
        endDate: "30 November 2020",
        games: ["Sword", "Shield"],
        level: 80,
        OT: "Leonardo",
        ID: "211031",
        ability: "Solar Power",
        heldItem: "None",
        nature: "Adamant",
        isShiny: true,
        moves: ["Heat Wave", "Solar Beam", "Rock Slide", "Dragon Pulse"],
        ribbons: ["Event Ribbon"],
        generation: "gen8",
        year: 2020
      }
    ];
  }
  
  // For other Pokémon, return an empty array
  return [];
} 