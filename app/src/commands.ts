import input from "@inquirer/input";
import confirm from "@inquirer/confirm";
import { initializeAuditorAccount, verifyAuditor } from "./programInstructions";

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
