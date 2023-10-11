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
 * Arguments used to create {@link PlatformConfig}
 * @category Accounts
 * @category generated
 */
export type PlatformConfigArgs = {
  escrowAmount: beet.bignum
  fee: beet.bignum
  timelock: beet.bignum
  verifiers: web3.PublicKey[] /* size: 5 */
  owner: web3.PublicKey
}

export const platformConfigDiscriminator = [160, 78, 128, 0, 248, 83, 230, 160]
/**
 * Holds the data for the {@link PlatformConfig} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class PlatformConfig implements PlatformConfigArgs {
  private constructor(
    readonly escrowAmount: beet.bignum,
    readonly fee: beet.bignum,
    readonly timelock: beet.bignum,
    readonly verifiers: web3.PublicKey[] /* size: 5 */,
    readonly owner: web3.PublicKey
  ) {}

  /**
   * Creates a {@link PlatformConfig} instance from the provided args.
   */
  static fromArgs(args: PlatformConfigArgs) {
    return new PlatformConfig(
      args.escrowAmount,
      args.fee,
      args.timelock,
      args.verifiers,
      args.owner
    )
  }

  /**
   * Deserializes the {@link PlatformConfig} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [PlatformConfig, number] {
    return PlatformConfig.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link PlatformConfig} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<PlatformConfig> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find PlatformConfig account at ${address}`)
    }
    return PlatformConfig.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      '3NBf9yiyidXZ5SZ5ggV6Jr5X62uixNCxAKxnKjdeKmAg'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, platformConfigBeet)
  }

  /**
   * Deserializes the {@link PlatformConfig} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [PlatformConfig, number] {
    return platformConfigBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link PlatformConfig} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return platformConfigBeet.serialize({
      accountDiscriminator: platformConfigDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link PlatformConfig}
   */
  static get byteSize() {
    return platformConfigBeet.byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link PlatformConfig} data from rent
   *
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      PlatformConfig.byteSize,
      commitment
    )
  }

  /**
   * Determines if the provided {@link Buffer} has the correct byte size to
   * hold {@link PlatformConfig} data.
   */
  static hasCorrectByteSize(buf: Buffer, offset = 0) {
    return buf.byteLength - offset === PlatformConfig.byteSize
  }

  /**
   * Returns a readable version of {@link PlatformConfig} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      escrowAmount: (() => {
        const x = <{ toNumber: () => number }>this.escrowAmount
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      fee: (() => {
        const x = <{ toNumber: () => number }>this.fee
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      timelock: (() => {
        const x = <{ toNumber: () => number }>this.timelock
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      verifiers: this.verifiers,
      owner: this.owner.toBase58(),
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const platformConfigBeet = new beet.BeetStruct<
  PlatformConfig,
  PlatformConfigArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['escrowAmount', beet.u64],
    ['fee', beet.u64],
    ['timelock', beet.i64],
    ['verifiers', beet.uniformFixedSizeArray(beetSolana.publicKey, 5)],
    ['owner', beetSolana.publicKey],
  ],
  PlatformConfig.fromArgs,
  'PlatformConfig'
)
