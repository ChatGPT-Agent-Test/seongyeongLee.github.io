const CHECKLIST_STORAGE_KEY = 'root-structure-validation-checklist-state';

function getChecklistBasePath() {
  return (window.APP_CONFIG?.BASE_PATH ?? '').replace(/\/$/, '');
}

function buildChecklistPath(path) {
  const basePath = getChecklistBasePath();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}

async function fetchChecklistData() {
  const response = await fetch(buildChecklistPath('/data/root-structure-validation-checklist.json'));
  if (!response.ok) throw new Error('체크리스트 데이터를 불러오지 못했습니다.');
  return response.json();
}

async function fetchReportData() {
  const response = await fetch(buildChecklistPath('/data/reports.json'));
  if (!response.ok) throw new Error('보고서 데이터를 불러오지 못했습니다.');
  return response.json();
}

function loadChecklistState() {
  try {
    return JSON.parse(window.localStorage.getItem(CHECKLIST_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveChecklistState(state) {
  window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(state));
}

function flattenItems(data) {
  return data.sections.flatMap((section) =>
    section.groups.flatMap((group) => group.items.map((item) => ({ ...item, sectionId: section.id, sectionTitle: section.title, groupTitle: group.title })))
  );
}

function computeProgress(items, state) {
  const total = items.length;
  const completed = items.filter((item) => state[item.id]).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percentage };
}

function buildDetailPath(reportId) {
  return buildChecklistPath(`/pages/report-detail.html?reportId=${encodeURIComponent(reportId)}`);
}

function buildNextSteps(data, state) {
  const items = flattenItems(data);
  const firstUnchecked = items.find((item) => !state[item.id]);
  const progress = computeProgress(items, state);

  if (!firstUnchecked) {
    return {
      summary: '모든 점검 항목이 완료되었습니다. 배포 전 최종 검토 또는 실제 환경 테스트를 진행하면 됩니다.',
      steps: [
        'GitHub Pages 실제 배포 환경에서 최종 점검을 다시 실행하세요.',
        'Supabase 실환경 키와 RLS 정책을 최종 확인하세요.',
        '필요하면 이 체크리스트 결과를 작업 내역 보고서에 반영하세요.'
      ]
    };
  }

  const steps = [
    `다음 우선 점검 항목: ${firstUnchecked.text}`,
    `${firstUnchecked.sectionTitle} > ${firstUnchecked.groupTitle} 영역을 먼저 확인하세요.`
  ];

  if (progress.percentage < 40) {
    steps.push('먼저 메인 화면과 상세 화면의 기본 로딩 항목부터 순서대로 확인하는 것이 좋습니다.');
  } else if (progress.percentage < 80) {
    steps.push('기본 화면 점검이 끝났다면 Supabase 연결과 base path 항목을 이어서 확인하세요.');
  } else {
    steps.push('마지막 단계로 통합 시나리오와 실제 배포 환경 점검을 진행하세요.');
  }

  return {
    summary: `${progress.completed} / ${progress.total} 항목 완료. 아직 확인하지 않은 첫 번째 항목을 기준으로 다음 단계를 제안합니다.`,
    steps
  };
}

function renderProgress(data, state) {
  const items = flattenItems(data);
  const progress = computeProgress(items, state);
  document.getElementById('overallProgressBar').style.width = `${progress.percentage}%`;
  document.getElementById('overallProgressText').textContent = `총 ${progress.total}개 중 ${progress.completed}개 완료 (${progress.percentage}%)`;

  const nextSteps = buildNextSteps(data, state);
  document.getElementById('nextStepSummary').textContent = nextSteps.summary;
  document.getElementById('nextStepList').innerHTML = nextSteps.steps.map((step) => `<li>${step}</li>`).join('');
}

function renderReportLinks(reportData) {
  const target = document.getElementById('checklistReportLinks');
  if (!target) return;

  const categories = Array.isArray(reportData?.categories) ? reportData.categories : [];
  const reports = Array.isArray(reportData?.reports) ? reportData.reports : [];
  const orderedReports = categories
    .map((category) => reports.find((report) => report.category === category.key))
    .filter(Boolean);

  if (!orderedReports.length) {
    target.innerHTML = '<div class="report-item">바로 이동할 보고서가 없습니다.</div>';
    return;
  }

  target.innerHTML = orderedReports.map((report) => `
    <article class="summary-card">
      <div class="preview-label">${report.category_label ?? report.category}</div>
      <h3>${report.title}</h3>
      <div>${report.summary ?? ''}</div>
      <div class="report-meta">수정 ${new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: window.APP_CONFIG?.TIMEZONE ?? 'Asia/Seoul'
      }).format(new Date(report.updated_at))}</div>
      <a class="report-link" href="${buildDetailPath(report.report_id)}">상세 페이지로 이동</a>
    </article>
  `).join('');
}

function createSectionMarkup(section, state) {
  const sectionItems = section.groups.flatMap((group) => group.items);
  const completed = sectionItems.filter((item) => state[item.id]).length;
  const total = sectionItems.length;

  return `
    <section class="checklist-card" data-section-id="${section.id}">
      <details open>
        <summary><strong>${section.title}</strong> <span class="muted">${completed}/${total} 완료</span></summary>
        ${section.groups.map((group) => `
          <div>
            <h3 class="group-title">${group.title}</h3>
            ${group.items.map((item) => `
              <label class="check-item">
                <input type="checkbox" data-item-id="${item.id}" ${state[item.id] ? 'checked' : ''} />
                <span>${item.text}</span>
              </label>
            `).join('')}
          </div>
        `).join('')}
      </details>
    </section>
  `;
}

function renderChecklist(data, state) {
  document.getElementById('pageTitle').textContent = data.title;
  const container = document.getElementById('checklistSections');
  container.innerHTML = data.sections.map((section) => createSectionMarkup(section, state)).join('');

  container.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener('change', () => {
      state[input.dataset.itemId] = input.checked;
      saveChecklistState(state);
      renderChecklist(data, state);
      renderProgress(data, state);
    });
  });
}

function bindToolbar(data, state) {
  document.getElementById('expandAllButton').addEventListener('click', () => {
    document.querySelectorAll('#checklistSections details').forEach((detail) => { detail.open = true; });
  });

  document.getElementById('collapseAllButton').addEventListener('click', () => {
    document.querySelectorAll('#checklistSections details').forEach((detail) => { detail.open = false; });
  });

  document.getElementById('resetChecklistButton').addEventListener('click', () => {
    window.localStorage.removeItem(CHECKLIST_STORAGE_KEY);
    Object.keys(state).forEach((key) => delete state[key]);
    renderChecklist(data, state);
    renderProgress(data, state);
  });

  document.getElementById('openNextStepButton').addEventListener('click', () => {
    document.getElementById('nextStepList').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

async function initChecklistPage() {
  const [data, reportData] = await Promise.all([
    fetchChecklistData(),
    fetchReportData()
  ]);
  const state = loadChecklistState();
  renderReportLinks(reportData);
  renderChecklist(data, state);
  renderProgress(data, state);
  bindToolbar(data, state);
}

initChecklistPage().catch((error) => {
  console.error(error);
  document.getElementById('pageTitle').textContent = '체크리스트를 불러오지 못했습니다.';
  document.getElementById('nextStepSummary').textContent = '데이터 파일 경로나 base path 설정을 확인하세요.';
  const reportLinks = document.getElementById('checklistReportLinks');
  if (reportLinks) {
    reportLinks.innerHTML = '<div class="report-item">보고서 바로가기 정보를 불러오지 못했습니다.</div>';
  }
});
