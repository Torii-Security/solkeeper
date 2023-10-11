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
 * @category WithdrawFee
 * @category generated
 */
export type WithdrawFeeInstructionArgs = {
  bump: number
}
/**
 * @category Instructions
 * @category WithdrawFee
 * @category generated
 */
export const withdrawFeeStruct = new beet.BeetArgsStruct<
  WithdrawFeeInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
  ],
  'WithdrawFeeInstructionArgs'
)
/**
 * Accounts required by the _withdrawFee_ instruction
 *
 * @property [] platformConfigInfo
 * @property [_writable_] feeVaultInfo
 * @property [_writable_] receiver
 * @property [_writable_, **signer**] owner
 * @category Instructions
 * @category WithdrawFee
 * @category generated
 */
export type WithdrawFeeInstructionAccounts = {
  platformConfigInfo: web3.PublicKey
  feeVaultInfo: web3.PublicKey
  receiver: web3.PublicKey
  owner: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const withdrawFeeInstructionDiscriminator = [
  14, 122, 231, 218, 31, 238, 223, 150,
]

/**
 * Creates a _WithdrawFee_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category WithdrawFee
 * @category generated
 */
export function createWithdrawFeeInstruction(
  accounts: WithdrawFeeInstructionAccounts,
  args: WithdrawFeeInstructionArgs,
  programId = new web3.PublicKey('3NBf9yiyidXZ5SZ5ggV6Jr5X62uixNCxAKxnKjdeKmAg')
) {
  const [data] = withdrawFeeStruct.serialize({
    instructionDiscriminator: withdrawFeeInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.platformConfigInfo,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.feeVaultInfo,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.receiver,
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
