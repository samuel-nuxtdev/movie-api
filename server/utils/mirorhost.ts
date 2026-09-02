// server/utils/mirorhost.js

const MIRROR_HOSTS = [
  "movie-box.tv",
  "movieboxapp.in",
  "h5.aoneroom.com",
  "movieboxhd.net",
  "netnaija.video"
];

let currentHostIndex = 0;
const hostFailures = new Map();
const COOLDOWN_TIME = 120000;

export const getActiveMirror = () => {
  const now = Date.now();

  for (let i = 0; i < MIRROR_HOSTS.length; i++) {
    const idx = (currentHostIndex + i) % MIRROR_HOSTS.length;
    const host = MIRROR_HOSTS[idx];
    const cooldownUntil = hostFailures.get(host) || 0;

    if (now > cooldownUntil) {
      currentHostIndex = idx;
      return host;
    }
  }

  return MIRROR_HOSTS[0];
};

export const reportMirrorError = (host) => {
  hostFailures.set(host, Date.now() + COOLDOWN_TIME);
  currentHostIndex = (currentHostIndex + 1) % MIRROR_HOSTS.length;
};