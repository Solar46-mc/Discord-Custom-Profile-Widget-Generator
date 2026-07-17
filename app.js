/* Widget Bench — client-side only. No data leaves the browser except your own copy/paste actions. */

const state = {
  step: 1,
  topLayout: 'hero',
  miniLayout: 'name_description',
  bottomLayout: 'none',
  dataSource: 'static',
  values: {} // fieldName -> current value entered by the user
};

/* ---------- field schema definitions ----------
   type: 1 = 文字列(string) / 2 = 数値(number) / 3 = 画像(image)
--------------------------------------------------*/
function topFieldsSchema(){
  return [
    { name: 'top-title', label: 'タイトル', type: 1 },
    { name: 'top-subtitle', label: 'サブタイトル', type: 1 },
    { name: 'top-image', label: '画像', type: 3 },
  ];
}
function miniFieldsSchema(layout){
  if (layout === 'first_stat') return [
    { name: 'mini-stat-label', label: '統計のラベル', type: 1 },
    { name: 'mini-stat-value', label: '統計の値', type: 1 },
  ];
  if (layout === 'custom_text') return [
    { name: 'mini-line-1', label: '1行目', type: 1 },
    { name: 'mini-line-2', label: '2行目', type: 1 },
  ];
  return [
    { name: 'mini-name', label: '名前', type: 1 },
    { name: 'mini-description', label: '説明', type: 1 },
  ];
}
function bottomFieldsSchema(layout){
  if (layout === 'stats_grid'){
    const f = [];
    for (let i=1;i<=6;i++){
      f.push({ name:`bottom-stat-${i}-label`, label:`統計${i} ラベル`, type:1, group:i });
      f.push({ name:`bottom-stat-${i}-value`, label:`統計${i} 値`, type:1, group:i });
    }
    return f;
  }
  if (layout === 'progress') return [
    { name:'bottom-goal-label', label:'目標のラベル', type:1 },
    { name:'bottom-progress-current', label:'現在値', type:2 },
    { name:'bottom-progress-max', label:'目標値', type:2 },
  ];
  if (layout === 'collection'){
    const f = [{ name:'bottom-collection-title', label:'タイトル（任意）', type:1 }];
    for (let i=1;i<=4;i++) f.push({ name:`bottom-collection-image-${i}`, label:`画像${i}`, type:3 });
    return f;
  }
  return [];
}

function allFields(){
  let f = [...topFieldsSchema(), ...miniFieldsSchema(state.miniLayout)];
  if (state.bottomLayout !== 'none') f = f.concat(bottomFieldsSchema(state.bottomLayout));
  return f;
}

/* ---------- rendering fields into a container ---------- */
function renderFieldInputs(container, fields){
  container.innerHTML = '';
  fields.forEach(f => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = f.type === 2 ? 'number' : 'text';
    input.id = 'field-' + f.name;
    input.placeholder = f.type === 3 ? 'https://.../image.png' : (f.type === 2 ? '0' : '');
    input.value = state.values[f.name] || '';
    input.addEventListener('input', () => {
      state.values[f.name] = input.value;
      updatePreview();
      if (state.step === 5) renderExports();
    });
    label.appendChild(document.createTextNode(f.label));
    label.appendChild(input);
    container.appendChild(label);
  });
}

/* ---------- steps ---------- */
function goToStep(n){
  state.step = n;
  document.querySelectorAll('.step-btn').forEach(b => b.classList.toggle('active', Number(b.dataset.step) === n));
  document.querySelectorAll('.panel').forEach(p => p.hidden = Number(p.dataset.panel) !== n);
  document.getElementById('prevStep').disabled = n === 1;
  document.getElementById('nextStep').textContent = n === 5 ? '完了' : '次へ →';
  if (n === 5) renderExports();
}

document.getElementById('stepNav').addEventListener('click', e => {
  const btn = e.target.closest('.step-btn');
  if (btn) goToStep(Number(btn.dataset.step));
});
document.getElementById('prevStep').addEventListener('click', () => { if (state.step > 1) goToStep(state.step - 1); });
document.getElementById('nextStep').addEventListener('click', () => { if (state.step < 5) goToStep(state.step + 1); });

/* ---------- layout option listeners ---------- */
document.querySelectorAll('input[name="topLayout"]').forEach(r => r.addEventListener('change', () => {
  state.topLayout = document.querySelector('input[name="topLayout"]:checked').value;
  updatePreview();
}));

document.querySelectorAll('input[name="miniLayout"]').forEach(r => r.addEventListener('change', () => {
  state.miniLayout = document.querySelector('input[name="miniLayout"]:checked').value;
  renderFieldInputs(document.getElementById('miniFields'), miniFieldsSchema(state.miniLayout));
  updatePreview();
}));

document.querySelectorAll('input[name="bottomLayout"]').forEach(r => r.addEventListener('change', () => {
  state.bottomLayout = document.querySelector('input[name="bottomLayout"]:checked').value;
  renderFieldInputs(document.getElementById('bottomFields'), bottomFieldsSchema(state.bottomLayout));
  updatePreview();
}));

document.querySelectorAll('input[name="dataSource"]').forEach(r => r.addEventListener('change', () => {
  state.dataSource = document.querySelector('input[name="dataSource"]:checked').value;
  const note = document.getElementById('sourceNote');
  if (state.dataSource === 'bot_custom'){
    note.textContent = '同梱の bot-template/providers/static.js を土台に、ご自身のロジック（ゲームAPI・自作サーバーなど）から値を取得するコードに書き換えてください。送信先エンドポイントとペイロード形式は書き出しタブに出力されます。';
  } else {
    note.textContent = '入力した値がそのまま一度だけ送信され、以後は手動で更新しない限り変化しません。botを常時動かす必要がありません。';
  }
}));

/* top fields are static (not layout-dependent), render once */
function wireTopStaticInputs(){
  const map = { 'top-title':'top-title', 'top-subtitle':'top-subtitle', 'top-image':'top-image' };
  Object.keys(map).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = state.values[map[id]] || '';
    el.oninput = () => { state.values[map[id]] = el.value; updatePreview(); if (state.step===5) renderExports(); };
  });
}

/* ---------- preview ---------- */
function updatePreview(){
  const title = state.values['top-title'] || 'タイトル';
  const subtitle = state.values['top-subtitle'] || 'サブタイトル';
  const image = state.values['top-image'];

  document.getElementById('mockTitle').textContent = title;
  document.getElementById('mockSubtitle').textContent = subtitle;
  const imgEl = document.getElementById('mockImage');
  imgEl.style.background = image ? `center/cover url('${image}')` : '';

  const mockTop = document.getElementById('mockTop');
  mockTop.style.minHeight = state.topLayout === 'hero' ? '110px' : '70px';

  const mini = document.getElementById('mockMini');
  if (state.miniLayout === 'first_stat'){
    mini.textContent = `${state.values['mini-stat-label'] || '統計値1'}: ${state.values['mini-stat-value'] || '—'}`;
  } else if (state.miniLayout === 'custom_text'){
    mini.textContent = `${state.values['mini-line-1']||''} ${state.values['mini-line-2']||''}`.trim() || 'カスタムテキスト';
  } else {
    mini.textContent = `${state.values['mini-name']||'名前'} ・ ${state.values['mini-description']||'説明'}`;
  }

  const bottom = document.getElementById('mockBottom');
  bottom.innerHTML = '';
  if (state.bottomLayout === 'stats_grid'){
    bottom.style.gridTemplateColumns = 'repeat(3,1fr)';
    for (let i=1;i<=6;i++){
      const d = document.createElement('div');
      d.className = 'mock-stat';
      d.innerHTML = `<b>${state.values[`bottom-stat-${i}-value`]||'--'}</b>${state.values[`bottom-stat-${i}-label`]||`項目${i}`}`;
      bottom.appendChild(d);
    }
  } else if (state.bottomLayout === 'progress'){
    bottom.style.gridTemplateColumns = '1fr';
    const cur = Number(state.values['bottom-progress-current']||0);
    const max = Number(state.values['bottom-progress-max']||100) || 100;
    const pct = Math.min(100, Math.max(0, (cur/max)*100));
    bottom.innerHTML = `<div style="font-size:10.5px;color:var(--ink-dim);margin-bottom:4px;">${state.values['bottom-goal-label']||'目標'}</div>
      <div style="background:#0f1a30;border-radius:5px;height:8px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:var(--accent);"></div></div>`;
  } else if (state.bottomLayout === 'collection'){
    bottom.style.gridTemplateColumns = 'repeat(4,1fr)';
    for (let i=1;i<=4;i++){
      const d = document.createElement('div');
      d.style.height = '30px';
      d.style.borderRadius = '4px';
      d.style.background = 'linear-gradient(135deg,var(--accent),#4a7bd6)';
      bottom.appendChild(d);
    }
  } else {
    bottom.style.display = 'none';
    return;
  }
  bottom.style.display = 'grid';
}

/* ---------- exports ---------- */
function typeLabel(t){ return t===1 ? '文字列 (Text)' : t===2 ? '数値 (Number)' : '画像 (Application Asset)'; }

function renderExports(){
  const fields = allFields();

  // 1) fields table
  const tableLines = fields.map(f => `${f.name.padEnd(28,' ')} type=${f.type}  ${typeLabel(f.type)}  # ${f.label}`);
  document.getElementById('fieldsTable').textContent = tableLines.join('\n');

  // 2) patch json
  const dynamic = fields.map(f => {
    const raw = state.values[f.name] ?? '';
    if (f.type === 3){
      return { type: 3, name: f.name, value: { url: raw || 'https://example.com/image.png' } };
    }
    if (f.type === 2){
      return { type: 2, name: f.name, value: raw === '' ? 0 : Number(raw) };
    }
    return { type: 1, name: f.name, value: raw || '' };
  });
  const patchBody = { data: { dynamic } };
  const patchJsonStr = JSON.stringify(patchBody, null, 2);
  document.getElementById('patchJson').textContent = patchJsonStr;

  // 3) console script
  document.getElementById('consoleScript').textContent =
`let _mods=webpackChunkdiscord_app.push([[Symbol()],{},e=>e.c]);webpackChunkdiscord_app.pop();
let findByProps=(...e)=>{for(let t of Object.values(_mods))try{if(!t.exports||t.exports===window)continue;if(e.every(e=>t.exports?.[e]))return t.exports;for(let r in t.exports)if(e.every(e=>t.exports?.[r]?.[e])&&"IntlMessagesProxy"!==t.exports[r][Symbol.toStringTag])return t.exports[r]}catch{}};
findByProps("getFeaturedApplicationIds").getFeaturedApplicationIds().push("APPLICATION_ID");`;

  // 4) curl / pwsh
  const url = 'https://discord.com/api/v9/applications/APPLICATION_ID/users/USER_ID/identities/0/profile';
  document.getElementById('curlCmd').textContent =
`curl -X PATCH "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bot BOT_TOKEN" \\
  -d '${patchJsonStr.replace(/\n\s*/g,' ')}'`;

  document.getElementById('pwshCmd').textContent =
`Invoke-RestMethod -Uri "${url}" -Method PATCH \`
  -Headers @{"Content-Type"="application/json"; "Authorization"="Bot BOT_TOKEN"} \`
  -Body '${patchJsonStr.replace(/\n\s*/g,' ')}'`;
}

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.copy;
    const text = document.getElementById(targetId).textContent;
    navigator.clipboard.writeText(text).then(() => {
      const original = btn.textContent;
      btn.textContent = 'コピーしました';
      setTimeout(() => btn.textContent = original, 1400);
    });
  });
});

document.getElementById('downloadConfig').addEventListener('click', () => {
  const fields = allFields();
  const config = {
    generatedBy: 'widget-bench',
    topLayout: state.topLayout,
    miniLayout: state.miniLayout,
    bottomLayout: state.bottomLayout,
    dataSource: state.dataSource,
    fields: fields.map(f => ({ name: f.name, type: f.type, label: f.label })),
    staticValues: state.values
  };
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'config.json';
  a.click();
});

/* ---------- init ---------- */
renderFieldInputs(document.getElementById('miniFields'), miniFieldsSchema(state.miniLayout));
renderFieldInputs(document.getElementById('bottomFields'), bottomFieldsSchema(state.bottomLayout));
wireTopStaticInputs();
updatePreview();
goToStep(1);
