import { AssetTypeEnum, getAssetInfo } from '@immich/sdk';
import { authManager } from '$lib/managers/auth-manager.svelte';
import type { TimelineAsset } from '$lib/managers/timeline-manager/types';
import { is360Asset } from './vendor/detect360';

const lookups = new Map<string, Promise<boolean>>();

const near = (ratio: number, target: number) => Math.abs(ratio - target) < 0.05;

/**
 * 360 detection for grid thumbnails (T2.3). Time buckets carry neither the file name
 * nor the tags, so a raw camera file (square fisheye .insv, 2:1 dual fisheye .insp)
 * looks like any other asset there. Equirectangular assets are decided from the
 * bucket; square videos and 2:1 photos without projection fetch the full asset once.
 */
export const timeline360 = (asset: TimelineAsset): boolean | Promise<boolean> => {
  const type = asset.isVideo ? AssetTypeEnum.Video : AssetTypeEnum.Image;
  if (
    is360Asset({
      type,
      originalFileName: '',
      width: asset.ratio,
      height: 1,
      exifInfo: { projectionType: asset.projectionType },
    })
  ) {
    return true;
  }
  const candidate = asset.isVideo ? near(asset.ratio, 1) : !asset.projectionType && near(asset.ratio, 2);
  if (!candidate) {
    return false;
  }
  let lookup = lookups.get(asset.id);
  if (!lookup) {
    lookup = getAssetInfo({ ...authManager.params, id: asset.id })
      .then((info) => is360Asset(info))
      .catch(() => false);
    lookups.set(asset.id, lookup);
  }
  return lookup;
};
