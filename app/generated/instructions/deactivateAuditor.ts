/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category DeactivateAuditor
 * @category generated
 */
export type DeactivateAuditorInstructionArgs = {
  bump: number
}
/**
 * @category Instructions
 * @category DeactivateAuditor
 * @category generated
 */
export const deactivateAuditorStruct = new beet.BeetArgsStruct<
  DeactivateAuditorInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
  ],
  'DeactivateAuditorInstructionArgs'
)
/**
 * Accounts required by the _deactivateAuditor_ instruction
 *
 * @property [] auditorInfo
 * @property [_writable_, **signer**] auditor
 * @property [_writable_] platformConfigInfo
 * @category Instructions
 * @category DeactivateAuditor
 * @category generated
 */
export type DeactivateAuditorInstructionAccounts = {
  auditorInfo: web3.PublicKey
  auditor: web3.PublicKey
  platformConfigInfo: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const deactivateAuditorInstructionDiscriminator = [
  102, 20, 95, 35, 70, 69, 223, 119,
]

/**
 * Creates a _DeactivateAuditor_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category DeactivateAuditor
 * @category generated
 */
export function createDeactivateAuditorInstruction(
  accounts: DeactivateAuditorInstructionAccounts,
  args: DeactivateAuditorInstructionArgs,
  programId = new web3.PublicKey('3NBf9yiyidXZ5SZ5ggV6Jr5X62uixNCxAKxnKjdeKmAg')
) {
  const [data] = deactivateAuditorStruct.serialize({
    instructionDiscriminator: deactivateAuditorInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
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
      pubkey: accounts.platformConfigInfo,
      isWritable: true,
      isSigner: false,
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
