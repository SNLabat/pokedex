// Import buffer utility for working with binary data
import { Buffer } from 'buffer';

// Helper function to strip null characters
function stripNullChars(str) {
  return str.replace(/\0.*|\u0000|￿/g, '');
}

// Helper function to pad numbers
function pad(input, number) {
  var nines = "";
  var zeros = "";
  for (let i = 0; i < number; i++) {
    nines += "9";
    zeros += "0";
  }
  if (input <= nines) {
    input = (zeros + input).slice(-number); 
  }
  return input;
}

// Read functions for binary buffers
function readUInt8(buffer, offset) {
  return buffer[offset];
}

function readUInt16LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8);
}

function readUInt32LE(buffer, offset) {
  return (buffer[offset]) |
         (buffer[offset + 1] << 8) |
         (buffer[offset + 2] << 16) |
         (buffer[offset + 3] << 24);
}

// Read UTF16 string from buffer
function readUTF16String(buffer, offset, maxLength) {
  let result = '';
  let currOffset = offset;
  
  while (currOffset < buffer.length && currOffset < offset + maxLength) {
    const charCode = readUInt16LE(buffer, currOffset);
    if (charCode === 0) break;
    
    result += String.fromCharCode(charCode);
    currOffset += 2;
  }
  
  return result.replace(/\u0000/g, ''); // Remove null terminators
}

// Main parsing function
export function parseWCBuffer(buffer) {
  console.log('Processing wondercard file, size:', buffer.length);
  
  // Check buffer length to determine wondercard type
  if (buffer.length === 784) { // WC6 Full
    return parseWC6Data(buffer);
  } else if (buffer.length === 264) { // WC6/WC7
    return parseWC67Data(buffer);
  } else if (buffer.length === 204) { // WC5
    return parseWC5Data(buffer);
  } else if (buffer.length === 856 || buffer.length === 260) { // WC4
    return parseWC4Data(buffer);
  } else {
    throw new Error(`Invalid wondercard format: unexpected length ${buffer.length}`);
  }
}

// Parse WC6/7 data
function parseWC67Data(buffer) {
  try {
    // Extract basic info
    const wcId = readUInt16LE(buffer, 0x00);
    const wcTitle = readUTF16String(buffer, 0x02, 72);
    const cardType = readUInt8(buffer, 0x51) === 0 ? 'Pokemon' : 'Item';
    const cardColorId = readUInt8(buffer, 0x53);
    
    // Default implementation with basic fields
    const data = {
      wcId,
      wcTitle,
      cardText: "Thank you for playing Pokémon! Please pick up your gift from the deliveryman in any Pokémon Center.",
      cardType,
      cardColor: getCardColor(cardColorId),
      giftRedeemable: getRedeemableText(readUInt8(buffer, 0x52))
    };
    
    // Add more data based on card type
    if (cardType === 'Pokemon') {
      const dexNo = readUInt16LE(buffer, 0x82);
      const formId = readUInt8(buffer, 0x84);
      
      Object.assign(data, {
        dexNo,
        formId,
        pokemonName: `Pokémon #${dexNo}`,
        formName: formId > 0 ? `Form ${formId}` : "None",
        move1Name: getMoveNameById(readUInt16LE(buffer, 0x7A)),
        move2Name: getMoveNameById(readUInt16LE(buffer, 0x7C)),
        move3Name: getMoveNameById(readUInt16LE(buffer, 0x7E)),
        move4Name: getMoveNameById(readUInt16LE(buffer, 0x80)),
        nature: getNatureString(readUInt8(buffer, 0xA0)),
        ability: getAbilityType(readUInt8(buffer, 0xA2)),
        gender: getGenderString(readUInt8(buffer, 0xA1)),
        Level: readUInt8(buffer, 0xD0),
        ot: readUTF16String(buffer, 0xB6, 24),
        idNo: readUInt16LE(buffer, 0x68).toString().padStart(5, '0'),
        ball: "Cherish Ball",
        heldItem: getItemNameById(readUInt16LE(buffer, 0x78)),
        language: getLanguageString(readUInt8(buffer, 0x85)),
        shiny: getShinyString(readUInt8(buffer, 0xA3)),
      });
    } else if (cardType === 'Item') {
      Object.assign(data, {
        item1: getItemNameById(readUInt16LE(buffer, 0x68)) + " x" + readUInt16LE(buffer, 0x6A),
        item2: getItemNameById(readUInt16LE(buffer, 0x6C)) + " x" + readUInt16LE(buffer, 0x6E),
        item3: getItemNameById(readUInt16LE(buffer, 0x70)) + " x" + readUInt16LE(buffer, 0x72),
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing WC67 data:', error);
    throw new Error('Failed to parse wondercard file (WC6/7 format)');
  }
}

// Parse WC5 data
function parseWC5Data(buffer) {
  try {
    // Basic parsing for WC5
    const cardType = [null, 'Pokemon', 'Item', 'Power'][readUInt8(buffer, 0xB3)];
    const wcTitle = readUTF16String(buffer, 0x60, 72);
    
    return {
      wcTitle,
      cardType,
      cardText: "Please pick up your gift from the deliveryman in any Pokémon Center.",
      cardColor: [null, 'Blue', 'Pink', 'Yellow'][readUInt8(buffer, 0xB3)],
      dexNo: cardType === 'Pokemon' ? readUInt16LE(buffer, 0x1A) : 0,
      pokemonName: cardType === 'Pokemon' ? `Pokémon #${readUInt16LE(buffer, 0x1A)}` : '',
      giftRedeemable: ['Infinite', 'Only once', 'Infinite', 'Only once'][readUInt8(buffer, 0xB4)]
    };
  } catch (error) {
    console.error('Error parsing WC5 data:', error);
    throw new Error('Failed to parse wondercard file (WC5 format)');
  }
}

// Parse WC4 data
function parseWC4Data(buffer) {
  try {
    // Very basic parsing for WC4
    const cardType = [
      null, 'Pokemon', 'Egg', 'Item', 'Rule', 'Seal', 'Accessory', 
      'Manaphy Egg', 'Member Card', 'Oak\'s Letter', 'Azure Flute', 
      'Poketch', 'Secret Key', '13', 'Pokewalker', '15'
    ][readUInt16LE(buffer, 0x00)];
    
    return {
      cardType,
      wcTitle: "Generation 4 Wonder Card",
      cardText: "Please pick up your gift from the deliveryman in any Pokémon Center.",
      cardColor: 'Blue'
    };
  } catch (error) {
    console.error('Error parsing WC4 data:', error);
    throw new Error('Failed to parse wondercard file (WC4 format)');
  }
}

// Parse WC6 full data
function parseWC6Data(buffer) {
  try {
    // Combine WC67 data with additional full data
    const baseData = parseWC67Data(buffer.slice(520));
    
    // Read additional data available in full cards
    const redemptionText = readUTF16String(buffer, 0x04, 0x200);
    const gameFlags = readUInt32LE(buffer, 0x00);
    
    // Determine available games
    const gamesAvailable = [];
    if (gameFlags & 0x1) gamesAvailable.push('X');
    if (gameFlags & 0x2) gamesAvailable.push('Y');
    if (gameFlags & 0x4) gamesAvailable.push('OR');
    if (gameFlags & 0x8) gamesAvailable.push('AS');
    
    return {
      ...baseData,
      redemptionText,
      gamesAvailable: gamesAvailable.join('/')
    };
  } catch (error) {
    console.error('Error parsing WC6 full data:', error);
    throw new Error('Failed to parse wondercard file (WC6 full format)');
  }
}

// Helper Functions
function getCardColor(value) {
  const colors = ['Blue', 'Purple', 'Yellow'];
  return colors[value] || 'Blue';
}

function getRedeemableText(value) {
  const texts = [
    'May be infinite', 
    'Only once', 
    'May be infinite', 
    'Only once', 
    'Once per day', 
    '???', 
    'Once per day'
  ];
  return texts[value] || 'Unknown';
}

function getMoveNameById(id) {
  if (id === 0) return '';
  return `Move #${id}`;
}

function getItemNameById(id) {
  if (id === 0) return 'None';
  return `Item #${id}`;
}

function getNatureString(value) {
  const natures = [
    "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
    "Bold", "Docile", "Relaxed", "Impish", "Lax",
    "Timid", "Hasty", "Serious", "Jolly", "Naive",
    "Modest", "Mild", "Quiet", "Bashful", "Rash",
    "Calm", "Gentle", "Sassy", "Careful", "Quirky"
  ];
  return value < natures.length ? natures[value] : "Random";
}

function getAbilityType(value) {
  const types = [
    'Fixed ability 1', 
    'Fixed ability 2', 
    'Fixed HA', 
    'Random (no HA)', 
    'Random (including HA)'
  ];
  return types[value] || "Unknown";
}

function getGenderString(value) {
  return ['♂', '♀', 'Genderless', 'Random'][value] || "Unknown";
}

function getLanguageString(value) {
  const languages = ['Yours', 'JPN', 'ENG', 'FRE', 'ITA', 'GER', '???', 'SPA', 'KOR', 'CHS', 'CHT'];
  return languages[value] || "Unknown";
}

function getShinyString(value) {
  return ['Never', 'Random', 'Yes', 'Never'][value] || "Unknown";
} 