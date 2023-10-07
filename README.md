## For auditors
Install anchor
```
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

Have Docker installed. (on mac M1 turn rosetta feature - https://collabnix.com/warning-the-requested-images-platform-linux-amd64-does-not-match-the-detected-host-platform-linux-arm64-v8/)


## Problems
When deployed locally - IDL is not uploaded - so verify instruction not pass.

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