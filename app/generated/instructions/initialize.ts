/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export type InitializeInstructionArgs = {
  auditedProgramId: web3.PublicKey
  auditDate: beet.bignum
  hash: number[] /* size: 32 */
}
/**
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export const initializeStruct = new beet.BeetArgsStruct<
  InitializeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['auditedProgramId', beetSolana.publicKey],
    ['auditDate', beet.i64],
    ['hash', beet.uniformFixedSizeArray(beet.u8, 32)],
  ],
  'InitializeInstructionArgs'
)
/**
 * Accounts required by the _initialize_ instruction
 *
 * @property [_writable_, **signer**] auditInfo
 * @property [_writable_, **signer**] auditor
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export type InitializeInstructionAccounts = {
  auditInfo: web3.PublicKey
  auditor: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initializeInstructionDiscriminator = [
  175, 175, 109, 31, 13, 152, 155, 237,
]

/**
 * Creates a _Initialize_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Initialize
 * @category generated
 */
export function createInitializeInstruction(
  accounts: InitializeInstructionAccounts,
  args: InitializeInstructionArgs,
  programId = new web3.PublicKey('Ait72SouqcsR3GwpfNwQDeDzPQHLdoG1BvL7qiFb6xHe')
) {
  const [data] = initializeStruct.serialize({
    instructionDiscriminator: initializeInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.auditInfo,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.auditor,
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