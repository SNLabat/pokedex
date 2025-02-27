// Helper function to read binary data
function createDataView(buffer) {
  return new DataView(buffer instanceof ArrayBuffer ? buffer : buffer.buffer);
}

function readUInt8(buffer, offset) {
  return buffer[offset];
}

function readUInt16LE(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8);
}

function readUInt32LE(buffer, offset) {
  return buffer[offset] | 
         (buffer[offset + 1] << 8) | 
         (buffer[offset + 2] << 16) | 
         (buffer[offset + 3] << 24);
}

const parseWCBuffer = (buf) => {
  console.log('Buffer length:', buf.length);
  console.log('Buffer:', buf);

  try {
    const dataView = createDataView(buf);

    // Check buffer length to determine wondercard type
    if (buf.length === 784) { // WC6 Full
      console.log('Parsing WC6 Full');
      return parseWC6Full(dataView);
    } else if (buf.length === 264) { // WC6
      console.log('Parsing WC6');
      return parseWC6(dataView);
    } else if (buf.length === 204) { // WC5
      console.log('Parsing WC5');
      return parseWC5(dataView);
    } else if (buf.length === 856 || buf.length === 260) { // WC4 (PCD: 856, PGT: 260)
      console.log('Parsing WC4');
      return parseWC4(dataView);
    } else {
      throw new Error(`Invalid wondercard format: unexpected length ${buf.length}`);
    }
  } catch (error) {
    console.error('Parsing error:', error);
    throw error;
  }
};

function parseWC6Full(dataView) {
  const data = {
    type: 'WC6 Full',
    cardID: readUInt16LE(dataView, 0x0),
    cardTitle: readUTF16String(dataView, 0x2, 36),
    gamesSupported: parseGameFlags(readUInt32LE(dataView, 0x4C)),
    pokemon: {
      species: readUInt16LE(dataView, 0x82),
      form: readUInt8(dataView, 0x84),
      level: readUInt8(dataView, 0x85),
      moves: [
        readUInt16LE(dataView, 0x86),
        readUInt16LE(dataView, 0x88),
        readUInt16LE(dataView, 0x8A),
        readUInt16LE(dataView, 0x8C)
      ],
      ability: readUInt8(dataView, 0x8E),
      nature: readUInt8(dataView, 0x8F),
      gender: readUInt8(dataView, 0x90),
      shiny: readUInt8(dataView, 0x91) === 2,
      heldItem: readUInt16LE(dataView, 0x92),
    },
    metadata: {
      flags: readUInt32LE(dataView, 0x94),
      distributionStart: parseDate(dataView, 0x98),
      distributionEnd: parseDate(dataView, 0x9C),
    }
  };

  // Add redemption text if present
  const redemptionText = readUTF16String(dataView, 0x104, 0x200);
  if (redemptionText) {
    data.redemptionText = redemptionText;
  }

  return data;
}

function parseWC6(dataView) {
  try {
    const fileName = "Unknown.wc6"; // You'll need to pass this from the file input
    const wcId = readUInt16LE(dataView, 0x0);
    
    const data = {
      fileName,
      wcType: "wc6",
      wcId,
      wcTitle: readUTF16String(dataView, 0x2, 36),
      cardText: readUTF16String(dataView, 0x4, 0x200),
      pokemonName: getPokemonName(readUInt16LE(dataView, 0x82)),
      move1Name: getMoveNameById(readUInt16LE(dataView, 0x86)),
      move2Name: getMoveNameById(readUInt16LE(dataView, 0x88)),
      move3Name: getMoveNameById(readUInt16LE(dataView, 0x8A)),
      move4Name: getMoveNameById(readUInt16LE(dataView, 0x8C)),
      ot: readUTF16String(dataView, 0xB0, 16), // Correct offset for OT
      idNo: readUInt16LE(dataView, 0xA0).toString().padStart(5, '0'), // Correct offset for TID
      gender: getGenderString(readUInt8(dataView, 0x90)),
      Level: readUInt8(dataView, 0x85),
      ball: "Cherish Ball",
      heldItem: getItemNameById(readUInt16LE(dataView, 0x92)),
      Ribbon: "Classic Ribbon",
      language: "Yours",
      nature: getNatureString(readUInt8(dataView, 0x8F)),
      abilityType: getAbilityTypeString(readUInt8(dataView, 0x8E)),
      formName: "None",
      canBeShiny: getShinyString(readUInt8(dataView, 0x91)),
      giftRedeemable: "Only once",
      metLocation: "a lovely place",
      ivType: getIVString(readUInt8(dataView, 0xA2)), // Correct offset for IV type
      dexNo: readUInt16LE(dataView, 0x82)
    };

    return data;
  } catch (error) {
    console.error('Error parsing WC6:', error);
    throw error;
  }
}

// Helper function to read UTF-16 strings from DataView
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

function parseGameFlags(flags) {
  try {
    const games = [];
    if (flags & 0x1) games.push('X');
    if (flags & 0x2) games.push('Y');
    if (flags & 0x4) games.push('OR');
    if (flags & 0x8) games.push('AS');
    return games;
  } catch (error) {
    console.error('Error in parseGameFlags:', error);
    throw error;
  }
}

function parseDate(dataView, offset) {
  try {
    if (offset + 4 > dataView.byteLength) {
      throw new Error('Buffer too short for date parsing');
    }
    const year = readUInt16LE(dataView, offset);
    const month = readUInt8(dataView, offset + 2);
    const day = readUInt8(dataView, offset + 3);
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error('Error in parseDate:', error);
    throw error;
  }
}

// Helper functions implementation
function getPokemonName(dexNo) {
  // Temporary implementation - you'll want to replace this with a proper lookup
  return `Pokemon #${dexNo}`;
}

function getMoveNameById(moveId) {
  // Temporary implementation - you'll want to replace this with a proper lookup
  return `Move #${moveId}`;
}

function getItemNameById(itemId) {
  if (itemId === 0) return "None";
  return `Item #${itemId}`;
}

function getGenderString(value) {
  switch (value) {
    case 0: return "Male";
    case 1: return "Female";
    case 2: return "Genderless";
    default: return "Unknown";
  }
}

function getNatureString(value) {
  if (value === 0xFF) return "Random";
  const natures = [
    "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
    "Bold", "Docile", "Relaxed", "Impish", "Lax",
    "Timid", "Hasty", "Serious", "Jolly", "Naive",
    "Modest", "Mild", "Quiet", "Bashful", "Rash",
    "Calm", "Gentle", "Sassy", "Careful", "Quirky"
  ];
  return natures[value] || "Unknown";
}

function getAbilityTypeString(value) {
  switch (value) {
    case 0: return "Fixed ability 1";
    case 1: return "Fixed ability 2";
    case 2: return "Random ability 1/2";
    case 3: return "Hidden ability";
    case 4: return "Random ability 1/2/H";
    default: return "Unknown ability type";
  }
}

function getShinyString(value) {
  switch (value) {
    case 0: return "Never";
    case 1: return "Random";
    case 2: return "Always";
    default: return "Unknown";
  }
}

function getIVString(value) {
  switch (value) {
    case 0: return "Random IVs";
    case 1: return "All IVs 31";
    case 2: return "3 random guaranteed IVs of 31";
    case 3: return "4 random guaranteed IVs of 31";
    case 4: return "5 random guaranteed IVs of 31";
    default: return "Unknown IV spread";
  }
}

// Single export statement at the end
export {
  parseWCBuffer,
  parseWC6,
  parseWC6Full,
  readUTF16String,
  parseGameFlags,
  parseDate
}; 