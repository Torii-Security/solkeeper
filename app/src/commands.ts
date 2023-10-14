import input from "@inquirer/input";
import confirm from "@inquirer/confirm";
import {
  initializeAuditorAccount,
  verifyAuditor,
  getAuditorFromChain,
  uploadAudit,
  getAuditsFromChain,
} from "./programInstructions";

import {
  getImplementationAddress,
  calculateFileSHA256FromUrl,
  getBinFromChain,
  addPaddingToBuffer,
  validateAudits,
} from "./lib";
import { PublicKey } from "@solana/web3.js";
import fs from "fs";
import { sha256 } from "js-sha256";

export async function addAuditorAccountCommand(
  pathToWallet: string,
  clusterUrl: string
) {
  const keyPath = await input({
    message: "Path to main auditor wallet:",
    default: pathToWallet,
  });

  const name = await input({
    message: "Auditor name:",
  });
  const url = await input({
    message: "Url to your official auditor site:",
  });

  await confirm({
    message: `
        Path to main auditor key: ${keyPath}
        Auditor name: ${name}
        Auditor url: ${url}
  `,
  });

  await initializeAuditorAccount(clusterUrl, keyPath, name, url);
}

export async function verifyAuditorCommand(
  pathToWallet: string,
  clusterUrl: string
) {
  const auditorPubkey = await input({
    message: "Auditor pubkey:",
  });

  const isVerified = await input({
    message: "Is verified:",
  });

  await confirm({
    message: `
          Auditor pubkey: ${auditorPubkey}
          Is verified: ${isVerified}
    `,
  });

  await verifyAuditor(
    clusterUrl,
    pathToWallet,
    auditorPubkey,
    isVerified === "true" ? true : false
  );
}

export async function addAuditCommand(
  pathToWallet: string,
  clusterUrl: string
) {
  const auditedProgramId = await input({
    message: "Audited programId:",
  });

  const auditedProgramIdKey = new PublicKey(auditedProgramId);
  let implementationAddress: string;
  try {
    let resonse = await getImplementationAddress(
      auditedProgramIdKey,
      clusterUrl
    );

    implementationAddress = resonse.toString();
    // if implementation address not found - user should put it by hand
  } catch {
    implementationAddress = "";
  }

  const implementationAddressAnswer = await input({
    message: "Implementation address:",
    default: implementationAddress,
  });

  const pathToLocallyBuildByteCode = await input({
    message: "Path to audited bytecode build locally:",
  });

  //@todo should get bin from implementation
  //(can be different if user provide different implementation than default)
  const deployedBin = await getBinFromChain(auditedProgramIdKey, clusterUrl);
  const localBin = fs.readFileSync(pathToLocallyBuildByteCode);

  const { buf1, buf2 } = addPaddingToBuffer(deployedBin, localBin);

  const areSame = buf1.equals(buf2);

  const binHash = sha256(buf1);

  if (!areSame) {
    console.log("Different bytecodes. Exiting...");
    return;
  }

  const auditDate = await input({
    message: "Audit date (UNIX timestamp):",
    default: Date.now().toString(),
  });

  const auditSummary = await input({
    message: "Audit summary (max 250 characters):",
  });

  const auditUrl = await input({
    message: "Audit Report URL:",
  });

  const auditReportHash = await calculateFileSHA256FromUrl(auditUrl);

  await confirm({
    message: `
            Audited Program ID: ${auditedProgramIdKey.toString()}
            Implementation address: ${implementationAddressAnswer}
            Bytecode hash: ${binHash}
            Audit date: ${auditDate}
            Audit summary: ${auditSummary}
            Audit url: ${auditUrl}
            Audit report hash: ${auditReportHash}
      `,
  });

  await uploadAudit(
    clusterUrl,
    pathToWallet,
    auditedProgramIdKey,
    new PublicKey(implementationAddressAnswer),
    auditDate,
    binHash,
    auditReportHash,
    auditSummary,
    auditUrl
  );
}

export async function getAuditorCommand(clusterUrl: string) {
  const auditorPubkey = await input({
    message: "Auditor pubkey:",
  });

  await confirm({
    message: `
            Auditor pubkey: ${auditorPubkey}
      `,
  });

  await getAuditorFromChain(clusterUrl, auditorPubkey);
}

export async function getAuditsCommand(clusterUrl: string) {
  const programId = await input({
    message: "Program pubkey:",
  });

  await confirm({
    message: `
            Program pubkey: ${programId}
      `,
  });

  const audits = await getAuditsFromChain(clusterUrl, programId);
  const auditsVerified = await validateAudits(audits, clusterUrl);
  console.log(auditsVerified);
}
