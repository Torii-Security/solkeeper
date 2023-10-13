import { Command } from "commander";
import fs from "fs";
import { sha256 } from "js-sha256";
import { getBinFromChain, addPaddingToBuffer } from "./lib";
import { PublicKey } from "@solana/web3.js";
import { uploadAudit, initializePlatform } from "./programInstructions";
import {
  addAuditorAccountCommand,
  verifyAuditorCommand,
  getAuditorCommand,
  addAuditCommand,
  getAuditsCommand,
} from "./commands";
import select, { Separator } from "@inquirer/select";

const packageJson = require("../package.json");
const version: string = packageJson.version;

const program = new Command();

program
  .name("solana-verifier")
  .description("Torii Solana Verifier tool")
  .version(version);

program
  .command("get-program-hash-validate")
  .description("Get program hash and validate with local binary")
  .requiredOption("--programId <programId>", "Program ID")
  .requiredOption("--pathToProgram <pathToProgram>", "Path to Program")
  .requiredOption("--clusterUrl <clusterUrl>", "Cluster URL")
  .action((options) => {
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
          throw new Error("Bin mismatch");
        }

        const binHash = sha256(buf1);
        console.log(binHash);
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  });

program
  .command("initialize")
  .description("Initialize platform")
  .requiredOption("--pathToWallet <pathToWallet>", "Path to wallet")
  .requiredOption("--clusterUrl <clusterUrl>", "Cluster URL")
  .requiredOption(
    "--escrowAmount <escrowAmount>",
    "Amount of escrow in lamports"
  )
  .requiredOption("--fee <fee>", "Fee in lamports")
  .requiredOption("--timelock <timelock>", "Escrow timelock")
  .action((options) => {
    void (async () => {
      const { pathToWallet, clusterUrl, escrowAmount, fee, timelock } = options;
      try {
        initializePlatform(
          clusterUrl,
          pathToWallet,
          escrowAmount,
          fee,
          timelock
        );
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  });

program
  .command("get-program-hash")
  .description("Get program hash from cluster")
  .requiredOption("--programId <programId>", "Program ID")
  .requiredOption("--clusterUrl <clusterUrl>", "Cluster URL")
  .action((options) => {
    void (async () => {
      const { clusterUrl } = options;
      const programId = new PublicKey(options.programId);

      try {
        const deployedBin = await getBinFromChain(programId, clusterUrl);
        const binHash = sha256(deployedBin);
        console.log(binHash);
      } catch (error) {
        console.error("Error:", error);
      }
    })();
  });

program
  .command("upload-audit")
  .description("Upload audit")
  .requiredOption("--clusterUrl <clusterUrl>", "Cluster URL")
  .requiredOption("--pathToWallet <pathToWallet>", "Path to wallet")
  .requiredOption("--pathToParameters <pathToParameters>", "Path to parameters")
  .action((options) => {
    void (async () => {
      const { clusterUrl, pathToWallet, pathToParameters } = options;
      const parameters = JSON.parse(fs.readFileSync(pathToParameters, "utf-8"));

      const {
        auditedProgramId,
        implementationAddress,
        auditDate,
        byteCodeHash,
        auditFileHash,
        auditSummary,
        auditUrl,
      } = parameters;

      await uploadAudit(
        clusterUrl,
        pathToWallet,
        new PublicKey(auditedProgramId),
        new PublicKey(implementationAddress),
        auditDate,
        byteCodeHash,
        auditFileHash,
        auditSummary,
        auditUrl
      );
    })();
  });

program
  .command("start")
  .description("Start")
  .option("--pathToWallet <pathToWallet>", "Path to wallet")
  .requiredOption("--clusterUrl <clusterUrl>", "Cluster URL")
  .action((options) => {
    void (async () => {
      const answer = await select({
        message: "Action:",
        choices: [
          {
            name: "Add auditor account",
            value: "addAuditorAccount",
            description: "Add new auditor account.",
          },
          {
            name: "Add audit",
            value: "addAudit",
            description: "Add a new audit.",
          },
          {
            name: "Get auditor",
            value: "getAuditor",
            description: "Get information about auditor",
          },
          {
            name: "Get audits for program.",
            value: "getAudits",
            description: "Get audits for Solana program.",
          },
          {
            name: "Verify an auditor",
            value: "verify",
            description: "Can be called only by verifier.",
          },
        ],
      });

      const { pathToWallet, clusterUrl } = options;

      switch (answer) {
        case "addAuditorAccount":
          await addAuditorAccountCommand(pathToWallet, clusterUrl);
          break;
        case "addAudit":
          await addAuditCommand(pathToWallet, clusterUrl);
          break;
        case "getAudits":
          await getAuditsCommand(clusterUrl);
          break;
        case "getAuditor":
          await getAuditorCommand(clusterUrl);
          break;
        case "verify":
          await verifyAuditorCommand(pathToWallet, clusterUrl);
          break;
      }
    })();
  });

program.parse(process.argv);
