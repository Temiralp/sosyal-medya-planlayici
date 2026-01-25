const fs = require('fs');
const DATA_FILE = './data/posts.json';
try {
    const fd = fs.openSync(DATA_FILE, 'r');
    const size = fs.statSync(DATA_FILE).size;
    const buffer = Buffer.alloc(2000);
    const start = Math.max(0, size - 2000);
    fs.readSync(fd, buffer, 0, 2000, start);
    console.log('Last 2000 chars:');
    console.log(buffer.toString('utf8'));
    fs.closeSync(fd);
} catch (e) { console.error(e); }
