const parseWCBuffer = (buf) => {
  console.log('Buffer length:', buf.length);
  console.log('Buffer:', buf);

  try {
    // Check buffer length to determine wondercard type
    if (buf.length === 784) { // WC6 Full
      console.log('Parsing WC6 Full');
      return parseWC6Full(buf);
    } else if (buf.length === 264) { // WC6
      console.log('Parsing WC6');
      return parseWC6(buf);
    } else if (buf.length === 204) { // WC5
      console.log('Parsing WC5');
      return parseWC5(buf);
    } else if (buf.length === 856 || buf.length === 260) { // WC4 (PCD: 856, PGT: 260)
      console.log('Parsing WC4');
      return parseWC4(buf);
    } else {
      throw new Error(`Invalid wondercard format: unexpected length ${buf.length}`);
    }
  } catch (error) {
    console.error('Parsing error:', error);
    throw error;
  }
};

function parseWC6Full(buf) {
  const data = {
    type: 'WC6 Full',
    cardID: buf.readUInt16LE(0x0),
    cardTitle: readUTF16String(buf, 0x2, 36),
    gamesSupported: parseGameFlags(buf.readUInt32LE(0x4C)),
    pokemon: {
      species: buf.readUInt16LE(0x82),
      form: buf.readUInt8(0x84),
      level: buf.readUInt8(0x85),
      moves: [
        buf.readUInt16LE(0x86),
        buf.readUInt16LE(0x88),
        buf.readUInt16LE(0x8A),
        buf.readUInt16LE(0x8C)
      ],
      ability: buf.readUInt8(0x8E),
      nature: buf.readUInt8(0x8F),
      gender: buf.readUInt8(0x90),
      shiny: buf.readUInt8(0x91) === 2,
      heldItem: buf.readUInt16LE(0x92),
    },
    metadata: {
      flags: buf.readUInt32LE(0x94),
      distributionStart: parseDate(buf, 0x98),
      distributionEnd: parseDate(buf, 0x9C),
    }
  };

  // Add redemption text if present
  const redemptionText = readUTF16String(buf, 0x104, 0x200);
  if (redemptionText) {
    data.redemptionText = redemptionText;
  }

  return data;
}

function parseWC6(buf) {
  try {
    const fileName = "Unknown.wc6"; // You'll need to pass this from the file input
    const wcId = buf.readUInt16LE(0x0);
    
    const data = {
      fileName,
      wcType: "wc6",
      wcId,
      wcTitle: readUTF16String(buf, 0x2, 36),
      cardText: readUTF16String(buf, 0x4, 0x200),
      pokemonName: getPokemonName(buf.readUInt16LE(0x82)),
      move1Name: getMoveNameById(buf.readUInt16LE(0x86)),
      move2Name: getMoveNameById(buf.readUInt16LE(0x88)),
      move3Name: getMoveNameById(buf.readUInt16LE(0x8A)),
      move4Name: getMoveNameById(buf.readUInt16LE(0x8C)),
      ot: readUTF16String(buf, 0xB0, 16), // Correct offset for OT
      idNo: buf.readUInt16LE(0xA0).toString().padStart(5, '0'), // Correct offset for TID
      gender: getGenderString(buf.readUInt8(0x90)),
      Level: buf.readUInt8(0x85),
      ball: "Cherish Ball",
      heldItem: getItemNameById(buf.readUInt16LE(0x92)),
      Ribbon: "Classic Ribbon",
      language: "Yours",
      nature: getNatureString(buf.readUInt8(0x8F)),
      abilityType: getAbilityTypeString(buf.readUInt8(0x8E)),
      formName: "None",
      canBeShiny: getShinyString(buf.readUInt8(0x91)),
      giftRedeemable: "Only once",
      metLocation: "a lovely place",
      ivType: getIVString(buf.readUInt8(0xA2)), // Correct offset for IV type
      dexNo: buf.readUInt16LE(0x82)
    };

    return data;
  } catch (error) {
    console.error('Error parsing WC6:', error);
    throw error;
  }
}

// Helper functions with added error handling
function readUTF16String(buf, offset, maxLength) {
  try {
    let str = '';
    for (let i = 0; i < maxLength && (offset + i + 1) < buf.length; i += 2) {
      const code = buf.readUInt16LE(offset + i);
      if (code === 0) break;
      str += String.fromCharCode(code);
    }
    return str.trim();
  } catch (error) {
    console.error('Error in readUTF16String:', error);
    throw error;
  }
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

function parseDate(buf, offset) {
  try {
    if (offset + 4 > buf.length) {
      throw new Error('Buffer too short for date parsing');
    }
    const year = buf.readUInt16LE(offset);
    const month = buf.readUInt8(offset + 2);
    const day = buf.readUInt8(offset + 3);
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