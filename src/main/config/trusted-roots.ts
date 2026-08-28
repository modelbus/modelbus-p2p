/**
 * Hard-coded trust roots used by the local client when no on-disk
 * bootstrap cache exists yet. These four peerIds stand in for the
 * "seed nodes" of the modelbus network. They are the only peerIds
 * the client will trust by default; everything else has to be reached
 * transitively through a trust chain or be accepted manually by the
 * user in the Settings → Register tab.
 *
 * In production these are the libp2p PeerIds of well-known nodes run
 * by the modelbus maintainers. Until the network goes live they are
 * placeholders that match the entries at the bottom of
 * `mock/nodes.json` so a fresh checkout can run end-to-end without
 * any network call.
 *
 * The companion mock file is committed alongside this list so that
 * `pnpm run dev` can resolve these IDs in the local cache and pass
 * the trust check.
 */
export const TRUSTED_ROOT_PEER_IDS: readonly string[] = [
  '12D3KooWTrustedRootAlphaaaaaaaaaaaaaa01',
  '12D3KooWTrustedRootBetaaaaaaaaaaaaaaaa02',
  '12D3KooWTrustedRootGammaaaaaaaaaaaaaaa03',
  '12D3KooWTrustedRootDeltaaaaaaaaaaaaaa04',
];