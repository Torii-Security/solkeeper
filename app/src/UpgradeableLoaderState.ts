/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as borsh from '@coral-xyz/borsh';

const UPGRADEABLE_LOADER_STATE_LAYOUT = borsh.rustEnum(
  [
    borsh.struct([], 'uninitialized'),
    borsh.struct(
      [borsh.option(borsh.publicKey(), 'authorityAddress')],
      'buffer'
    ),
    borsh.struct([borsh.publicKey('programdataAddress')], 'program'),
    borsh.struct(
      [
        borsh.u64('slot'),
        borsh.option(borsh.publicKey(), 'upgradeAuthorityAddress'),
      ],
      'programData'
    ),
  ],
  undefined,
  borsh.u32()
);

export function decodeUpgradeableLoaderState(data: Buffer): any {
  return UPGRADEABLE_LOADER_STATE_LAYOUT.decode(data);
}
