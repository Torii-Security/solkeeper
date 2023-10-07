import { Command } from 'commander';
import fs from 'fs';
import { Connection, AccountInfo, PublicKey } from '@solana/web3.js';
import { decodeUpgradeableLoaderState } from './UpgradeableLoaderState';
import { sha256 } from 'js-sha256';

const packageJson = require('../package.json');
const version: string = packageJson.version;

const program = new Command();

program
  .version(version)
  .name('my-command')
  .option('-d, --debug', 'enables verbose logging', false)
  .parse(process.argv);

const size_of_programdata_metadata = 45;

// Function code for CLI goes here

async function verifyBin(
  programId: PublicKey,
  binPath: string,
  cluster: string
): Promise<Buffer> {
  // Use `finalized` state for verification
  const connection = new Connection(cluster, 'finalized');

  // Get the deployed build artifacts.
  const accountInfo = await connection.getAccountInfo(programId);
  if (!accountInfo) {
    throw new Error('Program account not found');
  }

  let deployedBin: Buffer | undefined;
  if (
    accountInfo.owner.equals(
      new PublicKey('BPFLoader2111111111111111111111111111111111')
    ) ||
    accountInfo.owner.equals(
      new PublicKey('BPFLoader1111111111111111111111111111111111')
    )
  ) {
    deployedBin = accountInfo.data;
  } else if (
    accountInfo.owner.equals(
      new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
    )
  ) {
    const { program } = decodeUpgradeableLoaderState(accountInfo.data);
    if (program.programdataAddress) {
      const programDataAccountInfo = await connection.getAccountInfo(
        program.programdataAddress
      );

      if (!programDataAccountInfo) {
        throw new Error('ProgramData account not found');
      }
      deployedBin = programDataAccountInfo.data.slice(
        size_of_programdata_metadata
      );
    }
    //@TODO handle case with buffer
  } else {
    throw new Error('Invalid program id, not owned by any loader program');
  }

  let localBin = fs.readFileSync(binPath);

  if (!deployedBin) {
    throw new Error('Invalid program id, not owned by any loader program');
  }

  // The deployed program probably has zero bytes appended. The default is
  // 2x the binary size in case of an upgrade.
  if (localBin.length < deployedBin.length) {
    const padding = Buffer.alloc(deployedBin.length - localBin.length, 0);
    localBin = Buffer.concat([localBin, padding]);
  }

  const hashFromChain = sha256(localBin);
  const hashFromLocal = sha256(deployedBin);

  // // Finally, check the bytes.
  const isVerified = localBin.equals(deployedBin);

  return isVerified;
}

// Example usage:
const programId = new PublicKey('Ait72SouqcsR3GwpfNwQDeDzPQHLdoG1BvL7qiFb6xHe');
const binPath = '';
const cluster = 'http://localhost:8899'; // or the Solana cluster URL you want to use

verifyBin(programId, binPath, cluster)
  .then(result => {
    console.log('Verification Result:', result);
  })
  .catch(error => {
    console.error('Error:', error);
  });
