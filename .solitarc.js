const path = require("path");
const programDir = path.join(__dirname, "programs", "audit-verify-sol");
const idlDir = path.join(__dirname, "target", "idl");
const sdkDir = path.join(__dirname, "app", "generated");
const binaryInstallDir = path.join(__dirname, ".crates");

module.exports = {
  idlGenerator: "anchor",
  programName: "audit_verify_sol",
  programId: "Ait72SouqcsR3GwpfNwQDeDzPQHLdoG1BvL7qiFb6xHe",
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
  rustbin: {
    locked: true,
    versionRangeFallback: "0.27.0",
  },
};
