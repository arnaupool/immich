<script lang="ts">
  import { getAssetUrl } from '$lib/utils';
  import { AssetTypeEnum, type AssetResponseDto } from '@immich/sdk';
  import { untrack } from 'svelte';
  import { t } from 'svelte-i18n';

  type Props = {
    asset: AssetResponseDto;
  };

  let { asset }: Props = $props();

  const assetId = $derived(asset.id);
  let container = $state<HTMLDivElement>();
  let loadError = $state(false);

  // Remount only when another asset opens, not on every update of this one (favourite,
  // tags...). The engine (immich-360-viewer, vendored) loads only when a 360 asset opens.
  $effect(() => {
    const host = container;
    const id = assetId;
    const current = untrack(() => asset);
    const url = getAssetUrl({ asset: current, forceOriginal: true });
    if (!host || !url) {
      return;
    }
    let handle: { destroy(): void } | undefined;
    let cancelled = false;
    loadError = false;
    import('./vendor/viewer360')
      .then(({ mountViewer360 }) => {
        if (cancelled) {
          return;
        }
        handle = mountViewer360(host, {
          url,
          fileName: current.originalFileName,
          kind: current.type === AssetTypeEnum.Video ? 'video' : 'image',
          assetKey: id,
          fetchInit: { credentials: 'same-origin' },
        });
      })
      .catch(() => (loadError = true));
    return () => {
      cancelled = true;
      handle?.destroy();
    };
  });
</script>

<div class="size-full" bind:this={container}>
  {#if loadError}
    <div class="flex size-full place-content-center place-items-center text-white">
      {$t('errors.failed_to_load_asset')}
    </div>
  {/if}
</div>
