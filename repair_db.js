const fs = require('fs');

const DATA_FILE = './data/posts.json';
const BACKUP_FILE = DATA_FILE + '.repair_backup';

function repair() {
    console.log('Starting repair attempt 5 (BUFFER mode)...');

    if (fs.existsSync(BACKUP_FILE)) {
        console.log('Restoring backup...');
        fs.copyFileSync(BACKUP_FILE, DATA_FILE);
    }

    const size = fs.statSync(DATA_FILE).size;
    const CHUNK_SIZE = 50000;
    const fd = fs.openSync(DATA_FILE, 'r+');

    const buffer = Buffer.alloc(CHUNK_SIZE);
    const startPos = Math.max(0, size - CHUNK_SIZE);
    const readLen = size - startPos;

    fs.readSync(fd, buffer, 0, readLen, startPos);

    // Search in BUFFER directly to handle UTF-8 correctly
    // We search for "},". In UTF-8, } is 0x7D, , is 0x2C
    const searchBuf = Buffer.from('},');

    const idx = buffer.lastIndexOf(searchBuf, readLen);

    if (idx !== -1) {
        console.log('Found "}," at buffer index:', idx);

        // Context (bytes)
        const ctxStart = Math.max(0, idx - 10);
        const ctxEnd = Math.min(readLen, idx + 10);
        const ctxBuf = buffer.subarray(ctxStart, ctxEnd);
        console.log('Context (string):', ctxBuf.toString());

        // idx is the start of "},"
        // so buffer[idx] = '}'
        // buffer[idx+1] = ','

        // We want to keep '}' (idx)
        // So we truncate at startPos + idx + 1

        const truncateAt = startPos + idx + 1;

        console.log(`Truncating at global pos: ${truncateAt}`);

        // Verification
        const checkBuf = Buffer.alloc(1);
        fs.readSync(fd, checkBuf, 0, 1, truncateAt);
        console.log(`Byte at truncateAt is: 0x${checkBuf[0].toString(16)} ('${checkBuf.toString()}')`);

        if (checkBuf[0] !== 0x2C) { // 0x2C is comma
            console.error('CRITICAL: Byte is not comma! Aborting.');
            fs.closeSync(fd);
            return;
        }

        fs.ftruncateSync(fd, truncateAt);
        console.log('Truncated.');

        // Append ']'
        fs.writeSync(fd, Buffer.from(']'), 0, 1, truncateAt);
        console.log('Appended ].');

        fs.closeSync(fd);

        // Verify
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            JSON.parse(data);
            console.log('Success! JSON is valid.');
        } catch (e) {
            console.error('Still invalid:', e.message);
        }
    } else {
        console.error('Could not find "}," in buffer.');
        fs.closeSync(fd);
    }
}

repair();
