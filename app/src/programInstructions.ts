import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
} from "@solana/web3.js";
import { AnchorProvider, Provider, web3, Wallet } from "@coral-xyz/anchor";
import { createInitializeInstruction } from "../generated/index";
import * as fs from "fs";

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
  pathToParameters: string
) {
  // Connect to the local Solana cluster
  const connection = new Connection(clusterUrl, "confirmed");

  // Read wallet key pair from the JSON file
  const walletData = JSON.parse(fs.readFileSync(pathToWallet, "utf-8"));
  const userKP = Keypair.fromSecretKey(new Uint8Array(walletData));
  const walletKeyPair = new Wallet(userKP);

  // Create a provider for the connection and wallet
  const provider: Provider = new AnchorProvider(connection, walletKeyPair, {
    preflightCommitment: "confirmed",
  });

  // Read parameters from the JSON file
  const parameters = JSON.parse(fs.readFileSync(pathToParameters, "utf-8"));

  const auditInfo = Keypair.generate();

  // Call your program's initialize function using parameters from the JSON file
  const auditedProgramId = new PublicKey(parameters.auditedProgramId);
  const auditDate = parameters.auditDate;

  // Convert the hash string into a Uint8Array
  const hashHex = parameters.hash;
  const hashUint8Array = hexToUint8Array(hashHex);

  // Initialize your program's ID and initialize a client
  let ix = createInitializeInstruction(
    {
      auditInfo: auditInfo.publicKey,
      auditor: walletKeyPair.publicKey,
      systemProgram: SystemProgram.programId,
    },
    {
      auditedProgramId,
      auditDate,
      hash: hashUint8Array,
    }
  );

  // Sign and send the transaction
  let transaction: Transaction = new Transaction().add(ix);
  await sendAndConfirmTransaction(connection, transaction, [userKP, auditInfo]);

  console.log(
    "Transaction confirmed. Audit account created: " + auditInfo.publicKey
  );
}
