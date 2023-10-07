import { Command } from 'commander';
import fs from 'fs';
import { sha256 } from 'js-sha256';
import { getBinFromChain, addPaddingToBuffer } from './lib';
import { PublicKey } from '@solana/web3.js';

const packageJson = require('../package.json');
const version: string = packageJson.version;

const program = new Command();

program
  .name('solana-verifier')
  .description('Torii Solana Verifier tool')
  .version(version);

program
  .command('get-program-hash-validate')
  .description('Get program hash and validate with local binary')
  .requiredOption('--programId <programId>', 'Program ID')
  .requiredOption('--pathToProgram <pathToProgram>', 'Path to Program')
  .requiredOption('--clusterUrl <clusterUrl>', 'Cluster URL')
  .action(options => {
    void (async () => {
      const { pathToProgram, clusterUrl } = options;
      const programId = new PublicKey(options.programId);

      try {
        const deployedBin = await getBinFromChain(programId, clusterUrl);
        const localBin = fs.readFileSync(pathToProgram);
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
  });

program
  .command('get-program-hash')
  .description('Get program hash from cluster')
  .requiredOption('--programId <programId>', 'Program ID')
  .requiredOption('--clusterUrl <clusterUrl>', 'Cluster URL')
  .action(options => {
    void (async () => {
      const { clusterUrl } = options;
      const programId = new PublicKey(options.programId);

      try {
        const deployedBin = await getBinFromChain(programId, clusterUrl);
        const binHash = sha256(deployedBin);
        console.log(binHash);
      } catch (error) {
        console.error('Error:', error);
      }
    })();
  });

program
  .command('validate-program')
  .description('Validate program')
  .requiredOption('--pathToProgram <pathToProgram>', 'Path to Program')
  .requiredOption('--clusterUrl <clusterUrl>', 'Cluster URL')
  .action(options => {
    console.log('Validating program...');
    console.log('Path to Program:', options.pathToProgram);
    console.log('Cluster URL:', options.clusterUrl);
    // Implement your logic here for validating the program.
  });

program.parse(process.argv);
