import { Connection, AccountInfo, PublicKey } from '@solana/web3.js';
import { decodeUpgradeableLoaderState } from './UpgradeableLoaderState';

export async function getBinFromChain(
  programId: PublicKey,
  cluster: string
): Promise<Buffer> {
  // Taken from Solana repo
  const SIZE_OF_PROGRAMDATA_METADATA = 45;

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
        SIZE_OF_PROGRAMDATA_METADATA
      );
    }
    //@TODO handle case with buffer
  } else {
    throw new Error('Invalid program id, not owned by any loader program');
  }

  if (!deployedBin) {
    throw new Error('Incorrect bin file from deployed program');
  }

  return deployedBin;
}

export function addPaddingToBuffer(
  buf1: Buffer,
  buf2: Buffer
): { buf1: Buffer; buf2: Buffer } {
  if (buf1.length == buf2.length) {
    return {
      buf1,
      buf2,
    };
  }

  if (buf1.length > buf2.length) {
    const padding = Buffer.alloc(buf1.length - buf2.length, 0);
    return { buf1, buf2: Buffer.concat([buf2, padding]) };
  } else {
    const padding = Buffer.alloc(buf2.length - buf1.length, 0);
    return { buf1: Buffer.concat([buf1, padding]), buf2 };
  }
}
