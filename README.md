## For auditors
Install anchor
```
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

Have Docker installed. (on mac M1 turn rosetta feature - https://collabnix.com/warning-the-requested-images-platform-linux-amd64-does-not-match-the-detected-host-platform-linux-arm64-v8/)


## Problems
When deployed locally - IDL is not uploaded - so verify instruction could not pass.

## Usage
### Get Deployed Program Hash Validate
Get program hash and validate with local binary
```
npm start get-program-hash-validate -- --programId {PROGRAM_ID} --clusterUrl {CLUSTER_URL} --pathToProgram {LOCAL_BIN_PATH}
```

### Get Deployed Program Hash
Get program hash from cluster
```
npm start get-program-hash -- --programId {PROGRAM_ID} --clusterUrl {CLUSTER_URL}
```

### Upload audit
Upload audit
```
npm start upload-audit -- --clusterUrl {CLUSTER_URL} --pathToWallet {SIGNER_WALLET} --pathToParameters {PATH_TO_PARAMETERS}
```

### Get audits
Get valid and stale audits for program
```
npm start get-audits -- --clusterUrl {CLUSTER_URL} --programId {PROGRAM_ID}
```