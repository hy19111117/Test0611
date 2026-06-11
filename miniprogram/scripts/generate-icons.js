const fs = require('fs');
const path = require('path');

const iconDir = path.join(__dirname, '../images');

if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

const icons = ['home', 'member', 'task', 'points', 'mall'];

const createPNG = (width, height, r, g, b, a) => {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const createChunk = (type, data) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const typeBuffer = Buffer.from(type);
    const crcData = Buffer.concat([typeBuffer, data]);
    const crc = Buffer.alloc(4);
    let c = 0xFFFFFFFF;
    for (let i = 0; i < crcData.length; i++) {
      c ^= crcData[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (c & 1 ? 0xEDB88320 : 0);
      }
    }
    crc.writeUInt32BE((c ^ 0xFFFFFFFF) >>> 0);
    return Buffer.concat([length, typeBuffer, data, crc]);
  };
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b, a);
    }
  }
  
  const raw = Buffer.from(rawData);
  const { deflateSync } = require('zlib');
  const compressed = deflateSync(raw);
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
};

icons.forEach(name => {
  const normal = createPNG(48, 48, 153, 153, 153, 255);
  const active = createPNG(48, 48, 255, 107, 107, 255);
  
  fs.writeFileSync(path.join(iconDir, `${name}.png`), normal);
  fs.writeFileSync(path.join(iconDir, `${name}-active.png`), active);
  
  console.log(`Created ${name}.png and ${name}-active.png`);
});

console.log('All icons created successfully!');
