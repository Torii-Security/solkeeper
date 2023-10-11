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
 * @category AddAudit
 * @category generated
 */
export type AddAuditInstructionArgs = {
  auditedProgramId: web3.PublicKey
  auditedImplementation: web3.PublicKey
  auditDate: beet.bignum
  hash: number[] /* size: 32 */
  auditFileHash: number[] /* size: 32 */
  auditSummary: string
  auditUrl: string
}
/**
 * @category Instructions
 * @category AddAudit
 * @category generated
 */
export const addAuditStruct = new beet.FixableBeetArgsStruct<
  AddAuditInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['auditedProgramId', beetSolana.publicKey],
    ['auditedImplementation', beetSolana.publicKey],
    ['auditDate', beet.i64],
    ['hash', beet.uniformFixedSizeArray(beet.u8, 32)],
    ['auditFileHash', beet.uniformFixedSizeArray(beet.u8, 32)],
    ['auditSummary', beet.utf8String],
    ['auditUrl', beet.utf8String],
  ],
  'AddAuditInstructionArgs'
)
/**
 * Accounts required by the _addAudit_ instruction
 *
 * @property [_writable_] auditInfo
 * @property [] auditorInfo
 * @property [_writable_, **signer**] auditor
 * @category Instructions
 * @category AddAudit
 * @category generated
 */
export type AddAuditInstructionAccounts = {
  auditInfo: web3.PublicKey
  auditorInfo: web3.PublicKey
  auditor: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const addAuditInstructionDiscriminator = [
  74, 236, 41, 55, 207, 163, 35, 143,
]

/**
 * Creates a _AddAudit_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category AddAudit
 * @category generated
 */
export function createAddAuditInstruction(
  accounts: AddAuditInstructionAccounts,
  args: AddAuditInstructionArgs,
  programId = new web3.PublicKey('3NBf9yiyidXZ5SZ5ggV6Jr5X62uixNCxAKxnKjdeKmAg')
) {
  const [data] = addAuditStruct.serialize({
    instructionDiscriminator: addAuditInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.auditInfo,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.auditorInfo,
      isWritable: false,
      isSigner: false,
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
