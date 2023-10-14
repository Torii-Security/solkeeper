import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
} from "@solana/web3.js";
import { AnchorProvider, Provider, web3, Wallet } from "@coral-xyz/anchor";
import {
  PROGRAM_ID,
  createInitializePlatformInstruction,
  createInitializeAuditorInstruction,
  createModifyAuditorVerifyStatusInstruction,
  AuditorInfo,
  AuditInfo,
  createAddAuditInstruction,
  auditInfoDiscriminator,
} from "../generated";
import * as fs from "fs";
import { BN } from "bn.js";
import * as bs58 from "bs58";
import { uint8ArrayToHex } from "./lib";

export function hexToUint8Array(hex: string): number[] {
  const result = [];
  for (let i = 0; i < hex.length; i += 2) {
    result.push(parseInt(hex.substr(i, 2), 16));
  }
  return result;
}

export async function uploadAudit(
  clusterUrl: string,
  pathToWallet: string,
  auditedProgramId: PublicKey,
  auditedImplementation: PublicKey,
  auditDate: string,
  byteCodeHash: string,
  auditFileHash: string,
  auditSummary: string,
  auditUrl: string
) {
  // Connect to the local Solana cluster
  const connection = new Connection(clusterUrl, "confirmed");

  // Read wallet key pair from the JSON file
  const walletData = JSON.parse(fs.readFileSync(pathToWallet, "utf-8"));
  const userKP = Keypair.fromSecretKey(new Uint8Array(walletData));
  const walletKeyPair = new Wallet(userKP);

  const [auditorInfo, bump1] = await PublicKey.findProgramAddress(
    [Buffer.from("auditors"), walletKeyPair.publicKey.toBuffer()],
    PROGRAM_ID
  );

  const auditorFromChain = await fetchAuditorInfo(connection, auditorInfo);

  if (!auditorFromChain) {
    console.log("Error: No auditor account.");
    return;
  }

  const [auditInfo, bump2] = await PublicKey.findProgramAddress(
    [
      Buffer.from("audit123"),
      auditedProgramId.toBuffer(),
      auditorInfo.toBuffer(),
      new BN(auditorFromChain.counter).toArrayLike(Buffer, "le", 8),
    ],
    PROGRAM_ID
  );

  // Add audit
  let ix = createAddAuditInstruction(
    {
      auditInfo,
      auditorInfo,
      auditor: walletKeyPair.publicKey,
      systemProgram: SystemProgram.programId,
    },
    {
      auditedProgramId,
      auditedImplementation,
      auditDate: new BN(auditDate),
      hash: hexToUint8Array(byteCodeHash),
      auditFileHash: hexToUint8Array(auditFileHash),
      auditSummary,
      auditUrl,
    }
  );

  // // Sign and send the transaction
  let transaction: Transaction = new Transaction().add(ix);
  await sendAndConfirmTransaction(connection, transaction, [userKP]);

  console.log(
    "Transaction confirmed. Audit account created: " + auditInfo.toString()
  );
}

export async function initializePlatform(
  clusterUrl: string,
  pathToWallet: string,
  escrowAmount: string,
  fee: string,
  timelock: string
) {
  // Connect to the local Solana cluster
  const connection = new Connection(clusterUrl, "confirmed");

  // Read wallet key pair from the JSON file
  const walletData = JSON.parse(fs.readFileSync(pathToWallet, "utf-8"));
  const userKP = Keypair.fromSecretKey(new Uint8Array(walletData));
  const walletKeyPair = new Wallet(userKP);

  const [platformConfigInfo, bump] = await PublicKey.findProgramAddress(
    [Buffer.from("platform")],
    PROGRAM_ID
  );

  // Initialize your program's ID and initialize a client
  let ix = createInitializePlatformInstruction(
    {
      platformConfigInfo,
      owner: walletKeyPair.publicKey,
      systemProgram: SystemProgram.programId,
    },
    {
      escrowAmount: new BN(escrowAmount),
      fee: new BN(fee),
      timelock: new BN(timelock),
      verifiers: [
        walletKeyPair.publicKey,
        walletKeyPair.publicKey,
        walletKeyPair.publicKey,
        walletKeyPair.publicKey,
        walletKeyPair.publicKey,
      ],
    }
  );

  // Sign and send the transaction
  let transaction: Transaction = new Transaction().add(ix);
  await sendAndConfirmTransaction(connection, transaction, [userKP]);

  console.log("Transaction confirmed. Platform initialized");
}

export async function initializeAuditorAccount(
  clusterUrl: string,
  pathToWallet: string,
  name: string,
  url: string
) {
  // Connect to the local Solana cluster
  const connection = new Connection(clusterUrl, "confirmed");

  // Read wallet key pair from the JSON file
  const walletData = JSON.parse(fs.readFileSync(pathToWallet, "utf-8"));
  const userKP = Keypair.fromSecretKey(new Uint8Array(walletData));
  const walletKeyPair = new Wallet(userKP);

  const [platformConfigInfo, bump] = await PublicKey.findProgramAddress(
    [Buffer.from("platform")],
    PROGRAM_ID
  );

  const [auditorInfo, bump2] = await PublicKey.findProgramAddress(
    [Buffer.from("auditors"), walletKeyPair.publicKey.toBuffer()],
    PROGRAM_ID
  );

  const [feeVaultInfo, bump3] = await PublicKey.findProgramAddress(
    [Buffer.from("feevault")],
    PROGRAM_ID
  );

  // Initialize your program's ID and initialize a client
  let ix = createInitializeAuditorInstruction(
    {
      auditorInfo,
      platformConfigInfo,
      feeVaultInfo,
      auditor: walletKeyPair.publicKey,
      systemProgram: SystemProgram.programId,
    },
    {
      name,
      url,
    }
  );

  // Sign and send the transaction
  let transaction: Transaction = new Transaction().add(ix);
  await sendAndConfirmTransaction(connection, transaction, [userKP]);

  console.log("Transaction confirmed. Auditor account initialized");
}

export async function verifyAuditor(
  clusterUrl: string,
  pathToWallet: string,
  auditorPKString: string,
  isVerified: boolean
) {
  // Connect to the local Solana cluster
  const connection = new Connection(clusterUrl, "confirmed");

  // Read wallet key pair from the JSON file
  const walletData = JSON.parse(fs.readFileSync(pathToWallet, "utf-8"));
  const userKP = Keypair.fromSecretKey(new Uint8Array(walletData));
  const walletKeyPair = new Wallet(userKP);
  const auditorPubkey = new PublicKey(auditorPKString);

  const [auditorInfo, bump2] = await PublicKey.findProgramAddress(
    [Buffer.from("auditors"), auditorPubkey.toBuffer()],
    PROGRAM_ID
  );
  const [platformConfigInfo, bump] = await PublicKey.findProgramAddress(
    [Buffer.from("platform")],
    PROGRAM_ID
  );

  // Initialize your program's ID and initialize a client
  let ix = createModifyAuditorVerifyStatusInstruction(
    {
      platformConfigInfo,
      auditorInfo,
      verifier: walletKeyPair.publicKey,
      auditor: auditorPubkey,
      systemProgram: SystemProgram.programId,
    },
    {
      isVerified,
    }
  );

  // Sign and send the transaction
  let transaction: Transaction = new Transaction().add(ix);
  await sendAndConfirmTransaction(connection, transaction, [userKP]);

  console.log("Transaction confirmed. Auditor account status modified");
}

export async function getAuditorFromChain(
  clusterUrl: string,
  auditorPKString: string
) {
  // Connect to the local Solana cluster
  const connection = new Connection(clusterUrl, "confirmed");

  // Read wallet key pair from the JSON file
  const auditorPubkey = new PublicKey(auditorPKString);

  const [auditorInfo, bump2] = await PublicKey.findProgramAddress(
    [Buffer.from("auditors"), auditorPubkey.toBuffer()],
    PROGRAM_ID
  );

  let auditor = await fetchAuditorInfo(connection, auditorInfo);

  console.log(auditor ? auditor.pretty() : {});
}

async function fetchAuditorInfo(
  connection: Connection,
  auditorPublicKey: PublicKey
): Promise<AuditorInfo | null> {
  const auditorAccountInfo = await connection.getAccountInfo(auditorPublicKey);
  if (auditorAccountInfo) {
    const [auditorInfoDeserialized, num] = AuditorInfo.fromAccountInfo(
      auditorAccountInfo,
      0
    );
    return auditorInfoDeserialized;
  }
  return null;
}

export async function getAuditsFromChain(
  clusterUrl: string,
  programId: string
) {
  // Connect to the local Solana cluster
  const connection = new Connection(clusterUrl, "confirmed");

  const audits = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0, // number of bytes
          bytes: bs58.encode(auditInfoDiscriminator), // base58 encoded string
        },
      },
      {
        memcmp: {
          offset: 8, // number of bytes
          bytes: programId, // base58 encoded string
        },
      },
    ],
  });

  if (audits.length === 0) {
    return audits;
  }

  let response: any[] = [];

  for (const audit of audits) {
    const [auditInfoDeserialized, num] = AuditInfo.fromAccountInfo(
      audit.account
    );
    let auditor = await fetchAuditorInfo(
      connection,
      auditInfoDeserialized.auditor
    );

    let auditPretty: any = auditInfoDeserialized.pretty();
    auditPretty.auditFileHash = uint8ArrayToHex(auditPretty.auditFileHash);
    auditPretty.hash = uint8ArrayToHex(auditPretty.hash);

    const auditorPretty = auditor ? auditor.pretty() : {};
    response.push({
      ...auditPretty,
      ...auditorPretty,
    });
  }

  return response;
}
