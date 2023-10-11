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
 * Arguments used to create {@link AuditorInfo}
 * @category Accounts
 * @category generated
 */
export type AuditorInfoArgs = {
  name: string
  url: string
  owner: web3.PublicKey
  registrationTime: beet.bignum
  escrowAmount: beet.bignum
  isVerified: boolean
  isActive: boolean
}

export const auditorInfoDiscriminator = [169, 37, 161, 233, 33, 97, 119, 98]
/**
 * Holds the data for the {@link AuditorInfo} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class AuditorInfo implements AuditorInfoArgs {
  private constructor(
    readonly name: string,
    readonly url: string,
    readonly owner: web3.PublicKey,
    readonly registrationTime: beet.bignum,
    readonly escrowAmount: beet.bignum,
    readonly isVerified: boolean,
    readonly isActive: boolean
  ) {}

  /**
   * Creates a {@link AuditorInfo} instance from the provided args.
   */
  static fromArgs(args: AuditorInfoArgs) {
    return new AuditorInfo(
      args.name,
      args.url,
      args.owner,
      args.registrationTime,
      args.escrowAmount,
      args.isVerified,
      args.isActive
    )
  }

  /**
   * Deserializes the {@link AuditorInfo} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [AuditorInfo, number] {
    return AuditorInfo.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link AuditorInfo} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<AuditorInfo> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find AuditorInfo account at ${address}`)
    }
    return AuditorInfo.fromAccountInfo(accountInfo, 0)[0]
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
    return beetSolana.GpaBuilder.fromStruct(programId, auditorInfoBeet)
  }

  /**
   * Deserializes the {@link AuditorInfo} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [AuditorInfo, number] {
    return auditorInfoBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link AuditorInfo} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return auditorInfoBeet.serialize({
      accountDiscriminator: auditorInfoDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link AuditorInfo} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: AuditorInfoArgs) {
    const instance = AuditorInfo.fromArgs(args)
    return auditorInfoBeet.toFixedFromValue({
      accountDiscriminator: auditorInfoDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link AuditorInfo} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: AuditorInfoArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      AuditorInfo.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link AuditorInfo} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      name: this.name,
      url: this.url,
      owner: this.owner.toBase58(),
      registrationTime: (() => {
        const x = <{ toNumber: () => number }>this.registrationTime
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
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
      isVerified: this.isVerified,
      isActive: this.isActive,
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const auditorInfoBeet = new beet.FixableBeetStruct<
  AuditorInfo,
  AuditorInfoArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['name', beet.utf8String],
    ['url', beet.utf8String],
    ['owner', beetSolana.publicKey],
    ['registrationTime', beet.i64],
    ['escrowAmount', beet.u64],
    ['isVerified', beet.bool],
    ['isActive', beet.bool],
  ],
  AuditorInfo.fromArgs,
  'AuditorInfo'
)