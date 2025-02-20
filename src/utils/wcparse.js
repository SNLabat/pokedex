export const parseWCBuffer = (buf) => {
  // Check buffer length to determine wondercard type
  if (buf.length === 784) { // WC6 Full
    return parseWC6Full(buf);
  } else if (buf.length === 264) { // WC6
    return parseWC6(buf);
  } else if (buf.length === 204) { // WC5
    return parseWC5(buf);
  } else if (buf.length === 856 || buf.length === 260) { // WC4 (PCD: 856, PGT: 260)
    return parseWC4(buf);
  } else {
    throw new Error('Invalid wondercard format');
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
  const data = {
    type: 'WC6',
    cardID: buf.readUInt16LE(0x0),
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
    }
  };
  return data;
}

// Helper functions
function readUTF16String(buf, offset, maxLength) {
  let str = '';
  for (let i = 0; i < maxLength; i += 2) {
    const code = buf.readUInt16LE(offset + i);
    if (code === 0) break;
    str += String.fromCharCode(code);
  }
  return str.trim();
}

function parseGameFlags(flags) {
  const games = [];
  if (flags & 0x1) games.push('X');
  if (flags & 0x2) games.push('Y');
  if (flags & 0x4) games.push('OR');
  if (flags & 0x8) games.push('AS');
  return games;
}

function parseDate(buf, offset) {
  const year = buf.readUInt16LE(offset);
  const month = buf.readUInt8(offset + 2);
  const day = buf.readUInt8(offset + 3);
  return new Date(year, month - 1, day);
} 