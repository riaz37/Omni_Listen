import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, '../public/esapai_logo.png');
const outputFile = path.join(__dirname, '../public/esapai_logo.ico');

console.log('Converting icon...');

pngToIco(inputFile)
    .then(buf => {
        fs.writeFileSync(outputFile, buf);
        console.log('Icon created successfully at:', outputFile);
    })
    .catch(err => {
        console.error('Error converting icon:', err);
        process.exit(1);
    });
