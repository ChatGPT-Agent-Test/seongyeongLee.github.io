async function fetchReports() {
  const response = await fetch(buildAppPath('/data/reports.json'), {
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('reports.json 파일을 불러오지 못했습니다.');
  return response.json();
}

async function fetchMarkdownFile(path) {
  const response = await fetch(buildAppPath(path), {
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Markdown 파일을 불러오지 못했습니다.');
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
