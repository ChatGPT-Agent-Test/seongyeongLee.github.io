async function fetchReports() {
  const requestPath = buildAppPath('/data/reports.json');
  const response = await fetch(requestPath, {
    cache: 'no-store'
  });
  if (!response.ok) {
    const error = new Error(`reports.json 파일을 불러오지 못했습니다. (${response.status} ${response.statusText})`);
    error.status = response.status;
    error.statusText = response.statusText;
    error.requestPath = requestPath;
    throw error;
  }
  return response.json();
}

async function fetchMarkdownFile(path) {
  const requestPath = buildAppPath(path);
  const response = await fetch(requestPath, {
    cache: 'no-store'
  });
  if (!response.ok) {
    const error = new Error(`Markdown 파일을 불러오지 못했습니다. (${response.status} ${response.statusText})`);
    error.status = response.status;
    error.statusText = response.statusText;
    error.requestPath = requestPath;
    throw error;
  }
  return response.text();
}

function formatKst(isoString) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: getTimezone()
  }).format(new Date(isoString));
}

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function buildDetailPath(reportId) {
  return buildAppPath(`/pages/report-detail.html?reportId=${encodeURIComponent(reportId)}`);
}

function getConnectionSummary() {
  const basePath = getBasePath() || '/';
  return {
    basePath,
    supabaseConfigured: typeof isSupabaseConfigured === 'function' ? isSupabaseConfigured() : false
  };
}
