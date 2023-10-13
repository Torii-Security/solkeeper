import { Connection, AccountInfo, PublicKey } from "@solana/web3.js";
import { decodeUpgradeableLoaderState } from "./UpgradeableLoaderState";
import { AuditInfo } from "../generated/index";
import { sha256 } from "js-sha256";
import * as https from "https";
import { hexToUint8Array } from "./programInstructions";
import * as crypto from "crypto";

export function uint8ArrayToHex(uint8Array: number[]): string {
  return uint8Array.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function getBinFromChain(
  programId: PublicKey,
  cluster: string
): Promise<Buffer> {
  // Taken from Solana repo
  const SIZE_OF_PROGRAMDATA_METADATA = 45;

  // Use `finalized` state for verification
  const connection = new Connection(cluster, "finalized");

  // Get the deployed build artifacts.
  const accountInfo = await connection.getAccountInfo(programId);
  if (!accountInfo) {
    throw new Error("Program account not found");
  }

  let deployedBin: Buffer | undefined;
  if (
    accountInfo.owner.equals(
      new PublicKey("BPFLoader2111111111111111111111111111111111")
    ) ||
    accountInfo.owner.equals(
      new PublicKey("BPFLoader1111111111111111111111111111111111")
    )
  ) {
    deployedBin = accountInfo.data;
  } else if (
    accountInfo.owner.equals(
      new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
    )
  ) {
    const { program } = decodeUpgradeableLoaderState(accountInfo.data);
    if (program.programdataAddress) {
      const programDataAccountInfo = await connection.getAccountInfo(
        program.programdataAddress
      );

      if (!programDataAccountInfo) {
        throw new Error("ProgramData account not found");
      }
      deployedBin = programDataAccountInfo.data.slice(
        SIZE_OF_PROGRAMDATA_METADATA
      );
    }
    //@TODO handle case with buffer
  } else {
    throw new Error("Invalid program id, not owned by any loader program");
  }

  if (!deployedBin) {
    throw new Error("Incorrect bin file from deployed program");
  }

  return deployedBin;
}

export async function getImplementationAddress(
  programId: PublicKey,
  cluster: string
): Promise<PublicKey> {
  // Use `finalized` state for verification
  const connection = new Connection(cluster, "finalized");

  let implementationAddress;

  // Get the deployed build artifacts.
  const accountInfo = await connection.getAccountInfo(programId);
  if (!accountInfo) {
    throw new Error("Program account not found");
  }

  if (
    accountInfo.owner.equals(
      new PublicKey("BPFLoader2111111111111111111111111111111111")
    ) ||
    accountInfo.owner.equals(
      new PublicKey("BPFLoader1111111111111111111111111111111111")
    )
  ) {
    implementationAddress = programId;
  } else if (
    accountInfo.owner.equals(
      new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
    )
  ) {
    const { program } = decodeUpgradeableLoaderState(accountInfo.data);
    if (program.programdataAddress) {
      implementationAddress = program.programdataAddress;
    }
    //@TODO handle case with buffer
  } else {
    throw new Error("Invalid program id, not owned by any loader program");
  }

  if (!implementationAddress) {
    throw new Error("Incorrect bin file from deployed program");
  }

  return implementationAddress;
}

export async function calculateFileSHA256FromUrl(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP Error: ${response.statusCode}`));
          return;
        }

        const hash = crypto.createHash("sha256");

        response.on("data", (data) => {
          hash.update(data);
        });

        response.on("end", () => {
          const sha256Hash = hash.digest("hex");
          resolve(sha256Hash);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
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

export async function validateAudits(audits: any, clusterUrl: string) {
  if (audits.length === 0) {
    return [];
  }

  try {
    // programId should be the same across audits
    const programToValidate = audits[0].auditedProgramId;
    let deployedBin = await getBinFromChain(
      new PublicKey(programToValidate),
      clusterUrl
    );

    const binHash = sha256(deployedBin);
    // Print the retrieved accounts
    for (const audit of audits) {
      if (audit.hash === binHash) {
        audit.isUpToDate = true;
      } else {
        audit.isUpToDate = false;
      }
    }
    return audits;
  } catch (error) {
    console.error("Error:", error);
  }
}
