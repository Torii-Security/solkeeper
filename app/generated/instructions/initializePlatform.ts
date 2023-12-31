/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * @category Instructions
 * @category InitializePlatform
 * @category generated
 */
export type InitializePlatformInstructionArgs = {
  escrowAmount: beet.bignum
  fee: beet.bignum
  timelock: beet.bignum
  verifiers: web3.PublicKey[] /* size: 5 */
}
/**
 * @category Instructions
 * @category InitializePlatform
 * @category generated
 */
export const initializePlatformStruct = new beet.BeetArgsStruct<
  InitializePlatformInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['escrowAmount', beet.u64],
    ['fee', beet.u64],
    ['timelock', beet.i64],
    ['verifiers', beet.uniformFixedSizeArray(beetSolana.publicKey, 5)],
  ],
  'InitializePlatformInstructionArgs'
)
/**
 * Accounts required by the _initializePlatform_ instruction
 *
 * @property [_writable_] platformConfigInfo
 * @property [_writable_, **signer**] owner
 * @category Instructions
 * @category InitializePlatform
 * @category generated
 */
export type InitializePlatformInstructionAccounts = {
  platformConfigInfo: web3.PublicKey
  owner: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initializePlatformInstructionDiscriminator = [
  119, 201, 101, 45, 75, 122, 89, 3,
]

/**
 * Creates a _InitializePlatform_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitializePlatform
 * @category generated
 */
export function createInitializePlatformInstruction(
  accounts: InitializePlatformInstructionAccounts,
  args: InitializePlatformInstructionArgs,
  programId = new web3.PublicKey('Cg96DsFYhhd9drE77seUS3Tqg1t8GvEFwt4mACJ1SMvj')
) {
  const [data] = initializePlatformStruct.serialize({
    instructionDiscriminator: initializePlatformInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.platformConfigInfo,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.owner,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
