import { Command } from 'commander';
import fs from 'fs';
import { sha256 } from 'js-sha256';
import { PublicKey } from '@solana/web3.js';
import { getBinFromChain, addPaddingToBuffer } from './lib';

const packageJson = require('../package.json');
const version: string = packageJson.version;

const program = new Command();

program
  .version(version)
  .name('my-command')
  .option('-d, --debug', 'enables verbose logging', false)
  .parse(process.argv);

// Example usage:
const programId = new PublicKey('Ait72SouqcsR3GwpfNwQDeDzPQHLdoG1BvL7qiFb6xHe');
const binPath = '';
const cluster = 'http://localhost:8899'; // or the Solana cluster URL you want to use
void (async () => {
  try {
    const deployedBin = await getBinFromChain(programId, cluster);
    const localBin = fs.readFileSync(binPath);
    // The deployed program probably has zero bytes appended. The default is
    // 2x the binary size in case of an upgrade.
    const { buf1, buf2 } = addPaddingToBuffer(deployedBin, localBin);

    const areSame = buf1.equals(buf2);

    if (!areSame) {
      throw new Error('Bin mismatch');
    }

    const binHash = sha256(buf1);
    console.log(binHash);
  } catch (error) {
    console.error('Error:', error);
  }
})();
