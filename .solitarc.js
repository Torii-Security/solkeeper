const path = require("path");
const programDir = path.join(__dirname, "programs", "solkeeper");
const idlDir = path.join(__dirname, "target", "idl");
const sdkDir = path.join(__dirname, "app", "generated");
const binaryInstallDir = path.join(__dirname, ".crates");

module.exports = {
  idlGenerator: "anchor",
  programName: "solkeeper",
  programId: "Cg96DsFYhhd9drE77seUS3Tqg1t8GvEFwt4mACJ1SMvj",
  removeExistingIdl: true,
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
  rustbin: {
    locked: true,
    versionRangeFallback: "0.27.0",
  },
};
