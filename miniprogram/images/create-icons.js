const fs = require('fs');
const path = require('path');

const icons = [
  'home', 'home-active',
  'member', 'member-active',
  'task', 'task-active',
  'points', 'points-active',
  'mall', 'mall-active'
];

const createSimplePNG = (color) => {
  const size = 48;
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, size, 0x00, 0x00, 0x00, size,
    0x08, 0x06, 0x00, 0x00, 0x00
  ]);
  
  const ihdrCrc = crc32(header.slice(12, 28));
  const ihdrCrcBuffer = Buffer.alloc(4);
  ihdrCrcBuffer.writeUInt32BE(ihdrCrc);
  
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  const rawData = [];
  for (let y = 0; y < size; y++) {
    rawData.push(0);
    for (let x = 0; x < size; x++) {
      rawData.push(r, g, b, 255);
    }
  }
  
  const rawBuffer = Buffer.from(rawData);
  const compressed = deflateSync(rawBuffer);
  
  const idatLength = Buffer.alloc(4);
  idatLength.writeUInt32BE(compressed.length);
  
  const idatType = Buffer.from([0x49, 0x44, 0x41, 0x54]);
  const idatCrc = crc32(Buffer.concat([idatType, compressed]));
  const idatCrcBuffer = Buffer.alloc(4);
  idatCrcBuffer.writeUInt32BE(idatCrc);
  
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
    0xAE, 0x42, 0x60, 0x82
  ]);
  
  return Buffer.concat([
    header, ihdrCrcBuffer,
    idatLength, idatType, compressed, idatCrcBuffer,
    iend
  ]);
};

const crc32 = (buf) => {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
};

const { deflateSync } = require('zlib');

const iconDir = __dirname;

icons.forEach(name => {
  const color = name.includes('active') ? '#FF6B6B' : '#999999';
  const png = createSimplePNG(color);
  fs.writeFileSync(path.join(iconDir, `${name}.png`), png);
  console.log(`Created: ${name}.png`);
});

console.log('All icons created successfully!');
