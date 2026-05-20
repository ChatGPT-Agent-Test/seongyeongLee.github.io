window.APP_CONFIG = {
  REPOSITORY_NAME: 'report-hub-site',
  BASE_PATH: '',
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  TIMEZONE: 'Asia/Seoul',
  FEATURES: {
    enableSupabase: true,
    enableAcknowledgement: true,
    enableViewLogging: true
  }
};

(function resolveBasePath() {
  const config = window.APP_CONFIG;
  if (config.BASE_PATH) return;

  const { hostname, pathname } = window.location;
  if (!hostname.endsWith('github.io')) {
    config.BASE_PATH = '';
    return;
  }

  const firstSegment = pathname.split('/').filter(Boolean)[0] ?? '';
  if (firstSegment && firstSegment !== 'index.html' && firstSegment !== 'pages') {
    config.BASE_PATH = `/${firstSegment}`;
    return;
  }

  config.BASE_PATH = config.REPOSITORY_NAME ? `/${config.REPOSITORY_NAME}` : '';
})();

function getBasePath() {
  return window.APP_CONFIG?.BASE_PATH ?? '';
}

function normalizeAppPath(path = '') {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

function buildAppPath(path = '') {
  const normalizedPath = normalizeAppPath(path);
  const basePath = getBasePath();
  return `${basePath}${normalizedPath}` || '';
}

function getTimezone() {
  return window.APP_CONFIG?.TIMEZONE ?? 'Asia/Seoul';
}
