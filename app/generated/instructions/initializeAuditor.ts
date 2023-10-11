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
 * @category InitializeAuditor
 * @category generated
 */
export type InitializeAuditorInstructionArgs = {
  name: string
  url: string
}
/**
 * @category Instructions
 * @category InitializeAuditor
 * @category generated
 */
export const initializeAuditorStruct = new beet.FixableBeetArgsStruct<
  InitializeAuditorInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['name', beet.utf8String],
    ['url', beet.utf8String],
  ],
  'InitializeAuditorInstructionArgs'
)
/**
 * Accounts required by the _initializeAuditor_ instruction
 *
 * @property [_writable_] auditorInfo
 * @property [_writable_, **signer**] auditor
 * @property [_writable_] feeVaultInfo
 * @property [_writable_] platformConfigInfo
 * @category Instructions
 * @category InitializeAuditor
 * @category generated
 */
export type InitializeAuditorInstructionAccounts = {
  auditorInfo: web3.PublicKey
  auditor: web3.PublicKey
  feeVaultInfo: web3.PublicKey
  platformConfigInfo: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initializeAuditorInstructionDiscriminator = [
  253, 44, 177, 126, 156, 23, 211, 44,
]

/**
 * Creates a _InitializeAuditor_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitializeAuditor
 * @category generated
 */
export function createInitializeAuditorInstruction(
  accounts: InitializeAuditorInstructionAccounts,
  args: InitializeAuditorInstructionArgs,
  programId = new web3.PublicKey('3NBf9yiyidXZ5SZ5ggV6Jr5X62uixNCxAKxnKjdeKmAg')
) {
  const [data] = initializeAuditorStruct.serialize({
    instructionDiscriminator: initializeAuditorInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.auditorInfo,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.auditor,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.feeVaultInfo,
      isWritable: true,
      isSigner: false,
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
