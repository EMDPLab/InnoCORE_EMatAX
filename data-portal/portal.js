/* global google */
(function portalApp() {
  'use strict';

  var root = typeof window !== 'undefined' ? window : globalThis;
  var schemaSource = root.EMATAX_SCHEMA || root.EMatAXSchema || root.EMATAX_SCHEMA_CONTRACT || root.EMATAXSchema || {};
  var tableOrder = ['datasets', 'materials', 'lots', 'batches', 'specimens', 'process', 'analysis', 'performance'];

  var tableMeta = {
    datasets: {
      ko: '데이터셋', en: 'Datasets', icon: '◇', eyebrow: 'DATASET',
      meaningKo: '하나의 연구 데이터 묶음과 공개 정책', meaningEn: 'A research collection and its access policy',
      instructionKo: '연구 목적과 공개 범위를 먼저 정하면 아래 기록이 같은 맥락으로 연결됩니다.', instructionEn: 'Define the research context and access policy before adding linked records.'
    },
    materials: {
      ko: '소재', en: 'Materials', icon: '◌', eyebrow: 'MATERIAL',
      meaningKo: '화학적 실체와 참고 물성', meaningEn: 'A material identity and reference properties',
      instructionKo: '소재 자체에 의존하는 정보와 출처를 기록합니다. 특정 lot 값은 원료 lot에 남겨 주세요.', instructionEn: 'Record properties of the material itself and their sources. Lot-dependent values belong to lots.'
    },
    lots: {
      ko: '원료 lot', en: 'Raw material lots', icon: '◍', eyebrow: 'RAW LOT',
      meaningKo: '입고 원료 한 lot의 이력', meaningEn: 'The history of one received raw-material lot',
      instructionKo: '공급사, 순도, 보관 조건처럼 lot마다 달라질 수 있는 정보를 남깁니다.', instructionEn: 'Capture lot-dependent details such as supplier, purity, and storage conditions.'
    },
    batches: {
      ko: '배치', en: 'Batches', icon: '▦', eyebrow: 'BATCH',
      meaningKo: '한 번 조제하거나 준비한 실험 배치', meaningEn: 'One prepared or formulated experimental batch',
      instructionKo: '조제량, 조성, 숙성 등 배치가 공유하는 조건을 기록합니다.', instructionEn: 'Record the shared composition and preparation conditions for a batch.'
    },
    specimens: {
      ko: '시료', en: 'Specimens', icon: '▣', eyebrow: 'SPECIMEN',
      meaningKo: '분석·시험의 대상이 되는 하나의 시료', meaningEn: 'One specimen used for analysis or testing',
      instructionKo: '상위 배치와 연결하고 기판·시료·소자 단위가 무엇인지 분명히 합니다.', instructionEn: 'Link the specimen to its parent batch and make its observation unit explicit.'
    },
    process: {
      ko: '공정 변수', en: 'Process variables', icon: '↗', eyebrow: 'PROCESS',
      meaningKo: '하나의 공정 변수값을 세로로 기록', meaningEn: 'One process variable value per row',
      instructionKo: '단계, 표준어휘, 값, 단위를 한 행에 기록합니다. 성분·단계가 늘면 행을 추가합니다.', instructionEn: 'Record one stage, vocabulary term, value, and unit per row.'
    },
    analysis: {
      ko: '분석', en: 'Analysis', icon: '⌁', eyebrow: 'ANALYSIS',
      meaningKo: '한 번의 측정과 그 조건·도출값', meaningEn: 'One measurement with conditions and derived values',
      instructionKo: 'acquisition·raw·derived를 구분하고 원본 참조와 산출식을 함께 남깁니다.', instructionEn: 'Separate acquisition, raw, and derived information and keep the source reference.'
    },
    performance: {
      ko: '성능', en: 'Performance', icon: '✦', eyebrow: 'PERFORMANCE',
      meaningKo: '한 성능 지표의 측정 결과', meaningEn: 'One measured performance metric',
      instructionKo: '지표, 값, 측정 조건, 반복수와 편차를 함께 기록합니다.', instructionEn: 'Record the metric, value, measurement conditions, repetitions, and spread.'
    }
  };

  var translations = {
    ko: {
      previewMode: '미리보기 모드', eyebrow: '연구 기록을 오래 쓰이는 데이터로', welcomeTitle: '실험의 맥락까지 남기는<br><em>가벼운 입력 창구</em>',
      welcomeLede: 'E‑MatAX의 데이터 단위를 따라 기록을 나누고, 상위 ID를 선택해 연결하세요. 저장 전에는 필수 열과 참조 관계를 확인합니다.',
      flowDataset: '데이터셋', flowDatasetNote: '공개 범위와 맥락', flowBatch: '배치', flowBatchNote: '조제·공정 단위', flowSpecimen: '시료', flowSpecimenNote: '실험 대상', flowMeasurement: '측정', flowMeasurementNote: '분석·성능',
      secureWorkspace: '연구자 전용 입력 공간', authTitle: '연구단에 연결하기', authDescription: '관리자가 발급한 입력 코드를 사용합니다. 관리자 Google 계정은 코드를 비워 연결할 수 있습니다.', inviteCode: '연구자 입력 코드', optional: '선택', invitePlaceholder: '관리자가 전달한 코드', inviteHelp: '관리자 Google 계정은 코드를 비워 연결할 수 있습니다.', contributorName: '입력자 이름', contributorEmail: '입력자 이메일', namePlaceholder: '이름을 입력하세요', emailPlaceholder: 'name@institution.ac.kr', selfReported: '이 이름과 이메일은 입력자가 직접 제공했습니다.', connect: '연결하고 시작하기', openPreview: '표 양식 미리보기', previewNotice: '현재 정적 미리보기입니다. 실제 연결은 Google Apps Script에 게시된 페이지에서 사용할 수 있습니다.',
      workspaceEyebrow: '내 연구 워크스페이스', workspaceTitle: '데이터를 차곡차곡 쌓아 보세요', workspaceLede: '각 행은 하나의 관측 단위입니다. 상위 기록을 먼저 만들면 이후 입력에서 선택할 수 있습니다.', downloadDraft: '초안 내려받기', loadDraft: '초안 불러오기', exit: '나가기', connected: '연결됨', tableNavigator: 'TABLE NAVIGATOR', tableNavigatorTitle: '기록 종류', tableNavigatorHelp: '한 종류씩 입력하고 저장합니다. 필요한 상위 기록은 먼저 만들어 주세요.', tipTitle: '좋은 기록의 기준', tipBody: '나중에 다른 사람이 같은 실험을 이해할 수 있도록 조건과 단위를 함께 남겨 주세요.',
      showOptional: '권장 열 보기', hideOptional: '권장 열 숨기기', datasetContextTitle: '현재 데이터셋', datasetContextHelp: '이 표에 입력하는 행에 공통으로 적용할 상위 데이터셋을 선택하세요.', datasetSelectLabel: '데이터셋 선택', noDatasetSelected: '선택하지 않음', createDataset: '새 데이터셋 만들기', gridHelp: '셀을 클릭해 입력하세요. Excel에서 복사한 표는 선택한 셀부터 붙여넣을 수 있습니다.', missingGuideLabel: '결측 표기', missingNA: 'N/A 해당 없음', missingDash: '- 미측정', missingBlank: '공백 미입력', pasteNote: '여러 행을 붙여넣으면 필요한 만큼 행이 늘어납니다.', schemaMissingTitle: '양식을 불러오는 중입니다', schemaMissingBody: '이 페이지는 정해진 스키마가 연결되면 입력 표를 표시합니다.', addRow: '행 추가', saveExplain: '필수 열을 채우면 저장할 수 있습니다.', validate: '입력 확인', save: 'Google Sheets에 저장', footerPrivacy: '입력자 이름과 이메일은 저장 기록의 출처로 함께 기록됩니다.', confirmTitle: '저장할 준비가 되었나요?', confirmText: '입력한 행을 Google Sheets에 보냅니다. 저장 후 서버가 돌려준 ID를 확인한 뒤 해당 행을 초안에서 지웁니다.', cancel: '취소', confirmSave: '저장하기', confirmRetry: '같은 요청 ID로 재시도',
      idAfterSave: '저장 후 발급', required: '필수', recommended: '권장', noReference: '선택 가능한 ID 없음', choose: '선택하세요', valuePlaceholder: '값 입력', missingInput: '결측 상태',
      localOnly: '정적 미리보기에서는 실제 저장을 사용할 수 없습니다.', enterRequired: '이름, 이메일, 직접 제공 확인을 입력해 주세요.', invalidEmail: '이메일 형식을 확인해 주세요.', connecting: '연결 정보를 확인하는 중…', connectionFailed: '연결할 수 없습니다.', connectedTo: '연결됨', notHosted: 'Google Apps Script에 게시된 페이지에서 연결해 주세요.', schemaUnavailable: '표준 입력 스키마를 불러오지 못했습니다.', noRows: '저장할 행이 없습니다. 먼저 한 행을 입력해 주세요.', validating: '입력을 확인하는 중…', validRows: '입력한 행을 확인했습니다.', invalidRows: '필수 열과 입력 형식을 확인해 주세요.', saving: 'Google Sheets에 저장하는 중…', saveSucceeded: '저장 완료', saveFailed: '저장하지 못했습니다.', saveTimeout: '응답 시간이 지나 저장 여부를 확인하지 못했습니다. 같은 요청 ID로 다시 시도할 수 있습니다.', retrySame: '같은 요청 ID로 재시도', referencesRefreshed: '참조 목록을 새로 고쳤습니다.', referencesRefreshFailed: '저장은 완료되었지만 참조 목록을 새로 고치지 못했습니다.', draftDownloaded: '현재 표의 초안을 내려받았습니다.', draftLoaded: '초안을 불러왔습니다.', draftInvalid: '이 파일은 선택한 표의 E‑MatAX 초안이 아닙니다.', draftSchemaMismatch: '초안의 스키마 버전이 현재 양식과 다릅니다.', draftReadFailed: '초안 파일을 읽지 못했습니다.', noDraftData: '내려받을 입력 행이 없습니다.', pasted: '표를 붙여넣었습니다.', pasteInvalid: '붙여넣은 표의 열 수가 맞지 않아 적용하지 않았습니다.', pasteId: 'ID 열은 저장 후 발급됩니다. ID 열을 포함하지 않고 붙여넣어 주세요.', rowDeleted: '행을 지웠습니다.', rowAdded: '새 행을 추가했습니다.', datasetApplied: '현재 데이터셋을 모든 행에 적용했습니다.', noDatasetField: '현재 표에는 dataset_id 열이 없습니다.', leaveWarning: '저장하지 않은 입력이 있습니다. 페이지를 나가면 사라질 수 있습니다.', authExit: '연결을 종료했습니다. 입력 초안은 이 페이지가 열려 있는 동안만 유지됩니다.', receipt: '영수증', requestId: '요청 ID', savedAt: '저장 시각', rowUnit: '행', serverRejected: '서버가 입력을 거절했습니다.', noSchemaTable: '이 표의 입력 양식이 아직 연결되지 않았습니다.',
      errRequired: '필수 입력입니다.', errNumber: '숫자를 입력하거나 N/A 또는 -를 선택해 주세요.', errChoice: '목록에서 선택해 주세요.', errReference: '상위 기록 목록에서 선택해 주세요.', errDate: '날짜 형식을 확인해 주세요.'
    },
    en: {
      previewMode: 'Preview mode', eyebrow: 'Make research records last', welcomeTitle: 'A lighter way to keep<br><em>experimental context</em>', welcomeLede: 'Split records by E‑MatAX data units and connect them with existing parent IDs. Required fields and references are checked before saving.',
      flowDataset: 'Dataset', flowDatasetNote: 'Context & access', flowBatch: 'Batch', flowBatchNote: 'Preparation unit', flowSpecimen: 'Specimen', flowSpecimenNote: 'Test subject', flowMeasurement: 'Measurement', flowMeasurementNote: 'Analysis & metrics',
      secureWorkspace: 'Researcher-only input space', authTitle: 'Connect to your group', authDescription: 'Use the input code issued by an administrator. The administrator Google account can connect with the code left blank.', inviteCode: 'Researcher input code', optional: 'Optional', invitePlaceholder: 'Code from your administrator', inviteHelp: 'The administrator Google account can connect with the code left blank.', contributorName: 'Contributor name', contributorEmail: 'Contributor email', namePlaceholder: 'Your name', emailPlaceholder: 'name@institution.ac.kr', selfReported: 'I provided this name and email myself.', connect: 'Connect and start', openPreview: 'Preview the form', previewNotice: 'This is a static preview. Live connection is available from the page published through Google Apps Script.',
      workspaceEyebrow: 'MY RESEARCH WORKSPACE', workspaceTitle: 'Build your dataset one record at a time', workspaceLede: 'Each row is one observation unit. Create parent records first so they can be selected later.', downloadDraft: 'Download draft', loadDraft: 'Load draft', exit: 'Exit', connected: 'Connected', tableNavigator: 'TABLE NAVIGATOR', tableNavigatorTitle: 'Record types', tableNavigatorHelp: 'Enter and save one type at a time. Create required parent records first.', tipTitle: 'A useful record', tipBody: 'Keep the conditions and units needed for someone else to understand the same experiment later.',
      showOptional: 'Show recommended', hideOptional: 'Hide recommended', datasetContextTitle: 'Current dataset', datasetContextHelp: 'Choose the parent dataset to apply to rows in this table.', datasetSelectLabel: 'Dataset selection', noDatasetSelected: 'None selected', createDataset: 'Create a new dataset', gridHelp: 'Click a cell to edit. Paste an Excel table from the selected cell.', missingGuideLabel: 'Missing states', missingNA: 'N/A not applicable', missingDash: '- not measured', missingBlank: 'blank not entered', pasteNote: 'Pasting multiple rows adds rows as needed.', schemaMissingTitle: 'Loading the form', schemaMissingBody: 'The input grid appears when the shared schema is connected.', addRow: 'Add row', saveExplain: 'Fill the required fields to enable saving.', validate: 'Check input', save: 'Save to Google Sheets', footerPrivacy: 'Contributor name and email are stored as the source of each record.', confirmTitle: 'Ready to save?', confirmText: 'The entered rows will be sent to Google Sheets. They leave the draft only after the server returns their assigned IDs.', cancel: 'Cancel', confirmSave: 'Save rows', confirmRetry: 'Retry with same request ID',
      idAfterSave: 'Assigned after save', required: 'Required', recommended: 'Recommended', noReference: 'No IDs available', choose: 'Choose', valuePlaceholder: 'Enter a value', missingInput: 'Missing state',
      localOnly: 'Live saving is unavailable in the static preview.', enterRequired: 'Enter your name, email, and self-report confirmation.', invalidEmail: 'Check the email format.', connecting: 'Checking connection…', connectionFailed: 'Could not connect.', connectedTo: 'Connected', notHosted: 'Open the page published through Google Apps Script to connect.', schemaUnavailable: 'The shared input schema is unavailable.', noRows: 'There are no rows to save. Enter at least one row first.', validating: 'Checking input…', validRows: 'The entered rows are valid.', invalidRows: 'Check required fields and input formats.', saving: 'Saving to Google Sheets…', saveSucceeded: 'Saved', saveFailed: 'Could not save.', saveTimeout: 'The response timed out, so the save state is unknown. You can retry with the same request ID.', retrySame: 'Retry with same request ID', referencesRefreshed: 'Reference lists refreshed.', referencesRefreshFailed: 'Saved, but reference lists could not be refreshed.', draftDownloaded: 'Downloaded the current table draft.', draftLoaded: 'Loaded the draft.', draftInvalid: 'This is not an E‑MatAX draft for the selected table.', draftSchemaMismatch: 'The draft uses a different schema version than this form.', draftReadFailed: 'Could not read the draft file.', noDraftData: 'There are no entered rows to download.', pasted: 'Pasted the table.', pasteInvalid: 'The pasted table has an inconsistent width and was not applied.', pasteId: 'IDs are assigned after save. Paste without the ID column.', rowDeleted: 'Row deleted.', rowAdded: 'New row added.', datasetApplied: 'Applied the current dataset to every row.', noDatasetField: 'This table has no dataset_id field.', leaveWarning: 'There are unsaved entries. Leaving the page may discard them.', authExit: 'Connection ended. Drafts remain only while this page stays open.', receipt: 'Receipt', requestId: 'Request ID', savedAt: 'Saved at', rowUnit: 'rows', serverRejected: 'The server rejected the input.', noSchemaTable: 'The form for this table is not connected yet.', errRequired: 'Required.', errNumber: 'Enter a number or use N/A / -.', errChoice: 'Choose one of the listed values.', errReference: 'Choose an existing parent record.', errDate: 'Check the date format.'
    }
  };

  var state = {
    lang: 'ko', connected: false, preview: false, hosted: hasScriptBridge(), token: '', contributor: { name: '', email: '' }, group: null,
    references: { datasets: [], materials: [], lots: [], batches: [], specimens: [] }, counts: {}, tableKey: 'datasets', drafts: {},
    showOptional: false, schemaVersion: schemaVersion(), validationErrors: {}, dirtyRevision: 0, pendingSave: null, saveBusy: false,
    lastFocus: null
  };

  function hasScriptBridge() {
    return !!(root.google && root.google.script && root.google.script.run && typeof root.google.script.run.withSuccessHandler === 'function');
  }

  function schemaVersion() {
    var value = schemaSource.schemaVersion || schemaSource.version || root.EMATAX_SCHEMA_VERSION;
    return value === undefined || value === null || value === '' ? '—' : String(value);
  }

  function t(key, fallback) {
    var dictionary = translations[state.lang] || translations.ko;
    return dictionary[key] || fallback || key;
  }

  function textFor(item, fallback) {
    if (item === null || item === undefined) return fallback || '';
    if (typeof item === 'string' || typeof item === 'number') return String(item);
    if (state.lang === 'en') return String(item.en || item.labelEn || item.nameEn || item.titleEn || item.english || item.ko || item.labelKo || item.label || item.name || fallback || '');
    return String(item.ko || item.labelKo || item.nameKo || item.titleKo || item.korean || item.label || item.name || item.en || fallback || '');
  }

  function esc(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function keyOf(value) {
    return String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  }

  function tableCollection() {
    return schemaSource.tables || schemaSource.TABLES || schemaSource.tableDefinitions || schemaSource.definitions || {};
  }

  function rawTableDefinition(key) {
    var collection = tableCollection();
    var aliases = { process: ['process', 'processes', 'process_variables'], datasets: ['datasets', 'dataset'], materials: ['materials', 'material'], lots: ['lots', 'lot'], batches: ['batches', 'batch'], specimens: ['specimens', 'specimen'], analysis: ['analysis', 'analyses'], performance: ['performance', 'performances'] };
    var candidates = aliases[key] || [key];
    if (Array.isArray(collection)) {
      for (var i = 0; i < collection.length; i += 1) {
        var candidateKey = keyOf(collection[i].key || collection[i].id || collection[i].table || collection[i].name);
        if (candidates.indexOf(candidateKey) >= 0) return collection[i];
      }
      return null;
    }
    for (var j = 0; j < candidates.length; j += 1) {
      if (collection && collection[candidates[j]]) return collection[candidates[j]];
    }
    return null;
  }

  function normalizeColumn(column) {
    var source = typeof column === 'string' ? { key: column } : (column || {});
    var key = String(source.key || source.field || source.fieldName || source.name || source.id || '').trim();
    var type = keyOf(source.type || source.valueType || source.dataType || 'text');
    var role = textFor(source.role || source.kind || source.semanticRole, '');
    var reference = source.reference || source.ref || source.foreignKey || source.references || source.lookup || null;
    var options = source.options || source.choices || source.enum || source.allowed || [];
    if (!Array.isArray(options) && options && typeof options === 'object') options = Object.keys(options).map(function (optionKey) { return { value: optionKey, label: options[optionKey] }; });
    var required = !!(source.required || source.isRequired || source.mandatory);
    return {
      key: key, label: textFor(source.label || source.title || source.displayName || source.name, key), labelKo: source.labelKo || source.label_ko || source.korean || source.label || '', labelEn: source.labelEn || source.label_en || source.english || source.en || '',
      help: textFor(source.help || source.description || source.hint || source.definition, ''), unit: textFor(source.unit || source.units, ''), role: role, type: type,
      required: required, optional: !!(source.optional || source.recommended || source.isRecommended || (!required && key !== 'id')), defaultValue: source.default, primaryKey: !!(source.primaryKey || source.pk || source.isPrimaryKey || source.generated || source.auto || key === 'id'), reference: reference, options: options,
      multiline: !!(source.multiline || source.long || source.longText || type === 'long_text' || type === 'text_long' || type === 'textarea'), min: source.min, max: source.max, step: source.step, maxLength: source.maxLength || source.max_length,
      missing: source.missing !== false && source.allowMissing !== false
    };
  }

  function columnsFor(key) {
    var definition = rawTableDefinition(key);
    if (!definition) return [];
    var list = definition.columns || definition.fields || definition.schema || definition.properties || definition.headers || [];
    if (!Array.isArray(list) && list && typeof list === 'object') {
      list = Object.keys(list).map(function (fieldKey) {
        var field = list[fieldKey];
        return typeof field === 'string' ? { key: fieldKey, label: field } : Object.assign({ key: fieldKey }, field);
      });
    }
    return list.map(normalizeColumn).filter(function (column) { return !!column.key; });
  }

  function tableDefinition(key) {
    var definition = rawTableDefinition(key) || {};
    var meta = tableMeta[key] || {};
    var label = state.lang === 'en' ? (definition.en || definition.labelEn || definition.titleEn || meta.en) : (definition.label || definition.labelKo || definition.titleKo || meta.ko);
    return { key: key, columns: columnsFor(key), label: label || key, meaning: textFor(definition.meaning || definition.description || definition.rowMeaning, state.lang === 'en' ? meta.meaningEn : meta.meaningKo), instruction: textFor(definition.instruction || definition.help || definition.guidance, state.lang === 'en' ? meta.instructionEn : meta.instructionKo) };
  }

  function schemaReady() {
    return !!(schemaSource && typeof schemaSource === 'object' && (typeof schemaSource.validateRows === 'function' || tableOrder.some(function (key) { return columnsFor(key).length > 0; })));
  }

  function fieldByKey(key, fieldKey) {
    var columns = tableDefinition(key).columns;
    for (var i = 0; i < columns.length; i += 1) if (columns[i].key === fieldKey) return columns[i];
    return null;
  }

  function rowValue(row, column) {
    if (!row) return '';
    var value = row[column.key];
    return value === undefined || value === null ? '' : String(value);
  }

  function isMissingValue(value) { return value === 'N/A' || value === '-'; }

  function referenceKey(reference) {
    if (!reference) return '';
    var rawKey = typeof reference === 'string' ? keyOf(reference) : keyOf(reference.table || reference.source || reference.collection || reference.entity || reference.key || reference.name);
    var aliases = { dataset: 'datasets', material: 'materials', lot: 'lots', batch: 'batches', specimen: 'specimens', performance: 'performance', entity: 'entity' };
    return aliases[rawKey] || rawKey;
  }

  function referenceItems(reference) {
    var refKey = referenceKey(reference);
    if (refKey === 'entity') {
      return ['materials', 'lots', 'batches', 'specimens'].reduce(function (items, key) { return items.concat(Array.isArray(state.references[key]) ? state.references[key] : []); }, []);
    }
    var list = state.references[refKey] || [];
    if (!Array.isArray(list)) return [];
    return list;
  }

  function referenceId(item) {
    if (item === null || item === undefined) return '';
    if (typeof item === 'string' || typeof item === 'number') return String(item);
    return String(item.id || item.value || item.key || item.dataset_id || item.material_id || item.lot_id || item.batch_id || item.specimen_id || '');
  }

  function referenceLabel(item) {
    if (item === null || item === undefined) return '';
    if (typeof item === 'string' || typeof item === 'number') return String(item);
    return textFor(item, referenceId(item));
  }

  function fieldIsId(column) {
    return !!(column && (column.primaryKey || keyOf(column.key) === 'id'));
  }

  function fieldIsDataset(column) {
    return !!(column && /(^|_)dataset(_id)?$/.test(keyOf(column.key)));
  }

  function fieldIsChoice(column) {
    return !!(column && ((column.options && column.options.length) || column.reference || ['enum', 'choice', 'select', 'boolean'].indexOf(column.type) >= 0));
  }

  function fieldInputType(column) {
    if (column.type === 'number' || column.type === 'numeric' || column.type === 'integer' || column.type === 'decimal' || column.type === 'float') return 'number';
    if (column.type === 'date' || column.type === 'datetime') return column.type === 'datetime' ? 'datetime-local' : 'date';
    if (column.type === 'email') return 'email';
    if (column.type === 'url' || column.type === 'uri') return 'url';
    return 'text';
  }

  function statusFieldFor(key, column) {
    if (!column || column.type !== 'number' && column.type !== 'integer' || !/_num$/.test(column.key)) return null;
    var columns = tableDefinition(key).columns;
    var candidate = column.key === 'value_num' ? 'value_status' : column.key.replace(/_num$/, '_status');
    for (var i = 0; i < columns.length; i += 1) if (columns[i].key === candidate) return columns[i];
    return null;
  }

  function isLockedForRetry() {
    return !!(state.pendingSave && state.pendingSave.ambiguous);
  }

  function isDecimalLiteral(value) {
    return /^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?$/.test(String(value).trim());
  }

  function isServerGroupField(key, column) {
    return key === 'datasets' && column && column.key === 'group';
  }

  function rowsFor(key) {
    if (!state.drafts[key]) state.drafts[key] = [];
    return state.drafts[key];
  }

  function ensureRow(key) {
    var rows = rowsFor(key);
    if (!rows.length && columnsFor(key).length) rows.push({});
    var groupColumn = columnsFor(key).find(function (column) { return isServerGroupField(key, column); });
    if (groupColumn && state.group) {
      var groupValue = state.group.name || state.group.code || '';
      rows.forEach(function (row) { row[groupColumn.key] = groupValue; });
    }
    return rows;
  }

  function tableFieldCount(key) {
    return columnsFor(key).length;
  }

  function referenceCount(key) {
    var values = state.references[key];
    return Array.isArray(values) ? values.length : (state.counts[key] || 0);
  }

  function renderStaticLanguage() {
    var dictionary = translations[state.lang];
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach(function (element) {
      var key = element.getAttribute('data-i18n');
      if (dictionary[key] !== undefined) element.innerHTML = dictionary[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
      var key = element.getAttribute('data-i18n-placeholder');
      if (dictionary[key] !== undefined) element.setAttribute('placeholder', dictionary[key]);
    });
    var toggle = document.getElementById('languageToggle');
    if (toggle) {
      toggle.textContent = state.lang === 'ko' ? 'EN' : 'KO';
      toggle.setAttribute('aria-label', state.lang === 'ko' ? 'Switch to English' : '한국어로 전환');
    }
    var title = document.querySelector('title');
    if (title) title.textContent = state.lang === 'ko' ? 'E-MatAX 연구데이터 입력' : 'E-MatAX research data intake';
  }

  function updateHostedNotice() {
    var notice = document.getElementById('previewNotice');
    var button = document.getElementById('connectButton');
    if (!notice || !button) return;
    if (state.hosted) {
      notice.hidden = true;
      button.disabled = false;
    } else {
      notice.hidden = false;
      button.disabled = false;
    }
  }

  function setConnectionStatus(message, kind) {
    var element = document.getElementById('connectStatus');
    if (!element) return;
    element.textContent = message || '';
    element.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  function setSaveStatus(message, kind) {
    var element = document.getElementById('saveStatus');
    if (!element) return;
    element.textContent = message || '';
    element.className = 'save-status' + (kind ? ' is-' + kind : '');
  }

  function showToast(message, kind, duration) {
    var region = document.getElementById('toastRegion');
    if (!region || !message) return;
    var toast = document.createElement('div');
    toast.className = 'toast' + (kind ? ' is-' + kind : '');
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(function () { toast.remove(); }, duration || 4300);
  }

  function rpc(method, payload, timeout) {
    return new Promise(function (resolve, reject) {
      if (!hasScriptBridge()) {
        reject({ code: 'NOT_HOSTED', message: t('notHosted') });
        return;
      }
      var settled = false;
      var timeoutId = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        reject({ code: 'TIMEOUT', message: t('saveTimeout') });
      }, timeout || 35000);
      function finish(handler, value) {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeoutId);
        handler(value);
      }
      try {
        var runner = root.google.script.run
          .withSuccessHandler(function (result) { finish(resolve, result); })
          .withFailureHandler(function (error) { finish(reject, { code: 'RPC_FAILURE', message: error && (error.message || error.toString()) || t('connectionFailed'), raw: error }); });
        if (!runner || typeof runner[method] !== 'function') {
          finish(reject, { code: 'MISSING_METHOD', message: method + ' is unavailable.' });
          return;
        }
        runner[method](payload);
      } catch (error) {
        finish(reject, { code: 'RPC_FAILURE', message: error && (error.message || error.toString()) || t('connectionFailed'), raw: error });
      }
    });
  }

  function setGroup(result) {
    var group = result && result.group ? result.group : {};
    state.group = group;
    var groupText = group.name || group.code || '—';
    if (group.code && group.name && group.code !== group.name) groupText += ' · ' + group.code;
    var badge = document.getElementById('groupBadge');
    if (badge) badge.textContent = groupText;
    var person = document.getElementById('connectedName');
    var email = document.getElementById('connectedEmail');
    var avatar = document.getElementById('personAvatar');
    if (person) person.textContent = state.contributor.name;
    if (email) email.textContent = state.contributor.email;
    if (avatar) avatar.textContent = initials(state.contributor.name);
    state.references = Object.assign({ datasets: [], materials: [], lots: [], batches: [], specimens: [] }, result && result.references || {});
    state.counts = Object.assign({}, result && result.counts || {});
  }

  function initials(name) {
    var clean = String(name || '').trim();
    if (!clean) return '—';
    var chars = clean.split(/\s+/);
    if (chars.length > 1) return chars.slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase();
    return clean.slice(0, 2).toUpperCase();
  }

  function renderConnectionState() {
    var welcome = document.getElementById('welcomeView');
    var workspace = document.getElementById('workspaceView');
    var dot = document.getElementById('connectionDot');
    var label = document.getElementById('connectionLabel');
    var workspaceVisible = state.connected || state.preview;
    if (welcome) welcome.hidden = workspaceVisible;
    if (workspace) workspace.hidden = !workspaceVisible;
    if (dot) dot.classList.toggle('is-off', !state.connected);
    if (label) label.textContent = state.connected ? t('connected') : state.preview ? t('previewMode') : (state.lang === 'ko' ? '연결 전' : 'Not connected');
    var statusPill = document.querySelector('.live-pill');
    if (statusPill) {
      statusPill.classList.toggle('is-preview', !state.connected);
      var statusText = statusPill.querySelector('span:last-child');
      if (statusText) statusText.textContent = state.connected ? t('connected') : state.preview ? t('previewMode') : (state.lang === 'ko' ? '연결 전' : 'Not connected');
    }
    var person = document.getElementById('connectedName');
    var email = document.getElementById('connectedEmail');
    var avatar = document.getElementById('personAvatar');
    var group = document.getElementById('groupBadge');
    if (state.preview && !state.connected) {
      if (person) person.textContent = state.lang === 'ko' ? '정적 미리보기' : 'Static preview';
      if (email) email.textContent = state.lang === 'ko' ? '실제 연결 전 읽기 전용' : 'Read-only before connection';
      if (avatar) avatar.textContent = '◎';
      if (group) group.textContent = t('previewMode');
    }
    var version = document.getElementById('schemaVersionLabel');
    if (version) version.textContent = 'Schema ' + state.schemaVersion;
    updateHostedNotice();
  }

  function renderDatasetSelect() {
    var select = document.getElementById('datasetSelect');
    if (!select) return;
    var current = select.value;
    var items = Array.isArray(state.references.datasets) ? state.references.datasets : [];
    select.innerHTML = '<option value="">' + esc(t('noDatasetSelected')) + '</option>' + items.map(function (item) {
      var id = referenceId(item);
      if (!id) return '';
      return '<option value="' + esc(id) + '">' + esc(referenceLabel(item)) + (referenceLabel(item) !== id ? ' · ' + esc(id) : '') + '</option>';
    }).join('');
    if (current && items.some(function (item) { return referenceId(item) === current; })) select.value = current;
    var datasetField = findDatasetField(state.tableKey);
    var context = document.getElementById('datasetContext');
    if (context) context.hidden = !datasetField;
  }

  function findDatasetField(key) {
    var columns = columnsFor(key);
    for (var i = 0; i < columns.length; i += 1) if (fieldIsDataset(columns[i])) return columns[i];
    return null;
  }

  function renderReferenceStrip() {
    var strip = document.getElementById('referenceStrip');
    if (!strip) return;
    var references = [];
    columnsFor(state.tableKey).forEach(function (column) {
      if (!column.reference) return;
      var refKey = referenceKey(column.reference);
      var count = referenceCount(refKey);
      references.push('<span class="reference-chip"><b>' + esc(column.key) + '</b> ' + esc(count) + ' ' + esc(state.lang === 'ko' ? '개 선택 가능' : (count === 1 ? 'available' : 'available')) + '</span>');
    });
    strip.innerHTML = references.length ? '<strong>' + esc(state.lang === 'ko' ? '연결 가능한 상위 기록' : 'Available parents') + '</strong>' + references.join('') : '';
    strip.hidden = !references.length;
  }

  function renderTableNav() {
    var nav = document.getElementById('tableNav');
    if (!nav) return;
    nav.innerHTML = tableOrder.map(function (key) {
      var meta = tableMeta[key] || {};
      var definition = tableDefinition(key);
      var count = rowsFor(key).length;
      var serverCount = Number(state.counts[key] || state.counts[key + 's'] || 0);
      var shownCount = count || serverCount;
      return '<button type="button" class="table-nav-item' + (state.tableKey === key ? ' is-selected' : '') + '" data-table-key="' + esc(key) + '" title="' + esc(definition.instruction) + '">' +
        '<span class="nav-icon" aria-hidden="true">' + esc(meta.icon || '◈') + '</span><span class="nav-text"><b>' + esc(definition.label) + '</b><small>' + esc(definition.meaning) + '</small></span><span class="nav-count">' + (shownCount ? esc(shownCount) : '—') + '</span></button>';
    }).join('');
    var countElement = document.getElementById('tableCount');
    if (countElement) countElement.textContent = String(tableOrder.length);
  }

  function visibleColumns(key) {
    var columns = tableDefinition(key).columns;
    if (!state.showOptional) return columns.filter(function (column) { return column.required || !column.optional; });
    return columns;
  }

  function columnClass(column) {
    return (column.optional ? ' optional-column' : '') + (fieldIsId(column) ? ' is-id' : '') + (column.required ? ' is-required' : '');
  }

  function columnLabel(column) {
    if (state.lang === 'en' && column.labelEn) return column.labelEn;
    if (state.lang === 'ko' && column.labelKo) return column.labelKo;
    return column.label;
  }

  function roleLabel(column) {
    if (!column.role) return '';
    var roleLabels = {
      identifier: { ko: '식별자', en: 'Identifier' }, metadata: { ko: '메타데이터', en: 'Metadata' }, design: { ko: '설계변수', en: 'Design variable' }, process: { ko: '공정변수', en: 'Process variable' }, environment: { ko: '환경변수', en: 'Environment variable' }, measured: { ko: '측정유래', en: 'Measured' }, target: { ko: '목적값', en: 'Target' }
    };
    var label = roleLabels[keyOf(column.role)];
    return label ? label[state.lang] : column.role;
  }

  function cellError(rowIndex, fieldKey) {
    return state.validationErrors[rowIndex + ':' + fieldKey] || '';
  }

  function optionList(column) {
    var result = [];
    if (column.reference) {
      referenceItems(column.reference).forEach(function (item) { result.push({ value: referenceId(item), label: referenceLabel(item) }); });
    }
    (column.options || []).forEach(function (item) {
      var value = typeof item === 'object' ? (item.value === undefined ? item.id : item.value) : item;
      var label = typeof item === 'object' ? textFor(item, value) : item;
      if (value !== undefined && value !== null && !result.some(function (existing) { return String(existing.value) === String(value); })) result.push({ value: String(value), label: String(label) });
    });
    if (column.type === 'boolean' && !result.length) result = [{ value: 'true', label: state.lang === 'ko' ? '예' : 'Yes' }, { value: 'false', label: state.lang === 'ko' ? '아니오' : 'No' }];
    return result;
  }

  function renderCellEditor(row, rowIndex, column, columns) {
    var value = rowValue(row, column);
    var invalid = cellError(rowIndex, column.key);
    var idField = fieldIsId(column);
    var refField = !!column.reference;
    var groupField = isServerGroupField(state.tableKey, column);
    var statusField = statusFieldFor(state.tableKey, column);
    var statusValue = statusField ? rowValue(row, statusField) : '';
    var disabled = idField || groupField || state.preview || state.saveBusy || isLockedForRetry() || (!!statusField && statusValue && statusValue !== 'measured');
    var inputHtml = '';
    var attrs = ' data-row-index="' + rowIndex + '" data-field="' + esc(column.key) + '" title="' + esc(column.help || columnLabel(column)) + '" aria-label="' + esc(columnLabel(column)) + '"';
    if (column.maxLength) attrs += ' maxlength="' + esc(column.maxLength) + '"';
    if (column.min !== undefined && column.min !== null && column.min !== '') attrs += ' min="' + esc(column.min) + '"';
    if (column.max !== undefined && column.max !== null && column.max !== '') attrs += ' max="' + esc(column.max) + '"';
    if (column.step !== undefined && column.step !== null && column.step !== '') attrs += ' step="' + esc(column.step) + '"';
    if (disabled) attrs += ' disabled';
    if (idField) {
      inputHtml = '<div class="id-cell"><span aria-hidden="true">◇</span><span class="id-note">' + esc(t('idAfterSave')) + '</span></div>';
    } else if (fieldIsChoice(column) || refField) {
      var options = optionList(column);
      inputHtml = '<select' + attrs + (refField && !options.length ? ' disabled' : '') + '><option value="">' + esc(options.length ? t('choose') : t('noReference')) + '</option>' + options.map(function (item) { return '<option value="' + esc(item.value) + '"' + (String(item.value) === value ? ' selected' : '') + '>' + esc(item.label) + (String(item.label) !== String(item.value) ? ' · ' + esc(item.value) : '') + '</option>'; }).join('') + '</select>';
    } else if (column.multiline || column.type === 'long_text' || column.type === 'text_long' || column.type === 'textarea') {
      inputHtml = '<textarea' + attrs + ' placeholder="' + esc(t('valuePlaceholder')) + '">' + esc(value) + '</textarea>';
    } else {
      inputHtml = '<input type="' + esc(fieldInputType(column)) + '"' + attrs + ' value="' + esc(value) + '" placeholder="' + esc(t('valuePlaceholder')) + '">';
    }
    var missing = !!statusField && column.missing && !idField && !refField && !fieldIsChoice(column);
    var missingSelect = missing ? '<select class="missing-select" data-missing-for="' + esc(column.key) + '" data-status-field="' + esc(statusField.key) + '" data-row-index="' + rowIndex + '" aria-label="' + esc(t('missingInput')) + '"' + (state.preview || state.saveBusy || isLockedForRetry() ? ' disabled' : '') + '><option value=""' + (!statusValue || statusValue === 'measured' ? ' selected' : '') + '>·</option><option value="not_applicable"' + (statusValue === 'not_applicable' ? ' selected' : '') + '>N/A</option><option value="not_measured"' + (statusValue === 'not_measured' ? ' selected' : '') + '>−</option></select>' : '';
    return '<div class="cell-editor' + (invalid ? ' has-error' : '') + '">' + inputHtml + missingSelect + '</div><p class="cell-error" data-error-for="' + esc(column.key) + '">' + esc(invalid) + '</p>';
  }

  function renderGrid() {
    var definition = tableDefinition(state.tableKey);
    var columns = visibleColumns(state.tableKey);
    var allColumns = definition.columns;
    var head = document.getElementById('gridHead');
    var body = document.getElementById('gridBody');
    var table = document.getElementById('dataGrid');
    var empty = document.getElementById('emptySchema');
    if (!head || !body || !table) return;
    table.classList.toggle('show-optional', state.showOptional);
    if (!allColumns.length) {
      table.hidden = true;
      if (empty) { empty.hidden = false; empty.querySelector('h3').textContent = schemaReady() ? t('noSchemaTable') : t('schemaMissingTitle'); empty.querySelector('p').textContent = schemaReady() ? t('noSchemaTable') : t('schemaMissingBody'); }
      updateButtonState();
      return;
    }
    table.hidden = false;
    if (empty) empty.hidden = true;
    head.innerHTML = '<tr><th aria-label="#">#</th>' + columns.map(function (column) {
      var role = roleLabel(column);
      return '<th class="' + esc(columnClass(column)) + '" data-field="' + esc(column.key) + '" title="' + esc(column.help || columnLabel(column)) + '"><span class="th-label"><span>' + esc(columnLabel(column)) + (column.required ? ' <span class="required-mark-header">*</span>' : '') + '</span><span class="th-key">' + esc(column.key) + '</span><span class="th-meta">' + (role ? '<span class="role-tag">' + esc(role) + '</span>' : '') + (column.unit ? '<span class="unit-tag">' + esc(column.unit) + '</span>' : '') + '</span>' + (column.help ? '<span class="column-help">' + esc(column.help) + '</span>' : '') + '</span></th>';
    }).join('') + '<th class="row-actions-header">' + esc(state.lang === 'ko' ? '작업' : 'Actions') + '</th></tr>';
    var rows = ensureRow(state.tableKey);
    body.innerHTML = rows.map(function (row, rowIndex) {
      return '<tr data-row-index="' + rowIndex + '"><td><button type="button" class="row-number" data-row-action="focus" data-row-index="' + rowIndex + '" aria-label="' + esc((state.lang === 'ko' ? '행 ' : 'Row ') + (rowIndex + 1)) + '">' + (rowIndex + 1) + '</button></td>' + columns.map(function (column) {
        var value = rowValue(row, column);
        var invalid = cellError(rowIndex, column.key);
        return '<td class="' + esc(columnClass(column)) + (invalid ? ' is-invalid' : '') + '" data-field="' + esc(column.key) + '">' + renderCellEditor(row, rowIndex, column, columns) + '</td>';
      }).join('') + '<td class="row-actions"><div class="row-actions"><button type="button" class="row-action" data-row-action="duplicate" data-row-index="' + rowIndex + '" aria-label="' + esc(state.lang === 'ko' ? '행 복제' : 'Duplicate row') + '"' + (state.preview || state.saveBusy || isLockedForRetry() ? ' disabled' : '') + '>⧉</button><button type="button" class="row-action delete" data-row-action="delete" data-row-index="' + rowIndex + '" aria-label="' + esc(state.lang === 'ko' ? '행 삭제' : 'Delete row') + '"' + (state.preview || state.saveBusy || isLockedForRetry() ? ' disabled' : '') + '>×</button></div></td></tr>';
    }).join('');
    updateRowsCount();
    updateButtonState();
  }

  function renderActiveTable() {
    var definition = tableDefinition(state.tableKey);
    var meta = tableMeta[state.tableKey] || {};
    var icon = document.getElementById('tableIcon');
    var eyebrow = document.getElementById('tableEyebrow');
    var title = document.getElementById('tableTitle');
    var meaning = document.getElementById('tableMeaning');
    var toggle = document.getElementById('toggleOptionalButton');
    if (icon) icon.textContent = meta.icon || '◈';
    if (eyebrow) eyebrow.textContent = meta.eyebrow || state.tableKey.toUpperCase();
    if (title) title.textContent = definition.label;
    if (meaning) meaning.textContent = definition.meaning;
    if (toggle) {
      var label = toggle.querySelector('[data-i18n]');
      if (label) label.textContent = t(state.showOptional ? 'hideOptional' : 'showOptional');
      toggle.querySelector('[aria-hidden="true"]').textContent = state.showOptional ? '−' : '＋';
    }
    renderDatasetSelect();
    renderReferenceStrip();
    renderGrid();
  }

  function updateRowsCount() {
    var rows = rowsFor(state.tableKey);
    var count = document.getElementById('rowCount');
    if (count) count.textContent = String(rows.length) + ' ' + (state.lang === 'ko' ? '행' : (rows.length === 1 ? 'row' : 'rows'));
  }

  function updateButtonState() {
    var save = document.getElementById('saveButton');
    var validate = document.getElementById('validateButton');
    var add = document.getElementById('addRowButton');
    var canEdit = state.connected && tableFieldCount(state.tableKey) > 0 && !state.saveBusy && !isLockedForRetry();
    if (save) save.disabled = !state.connected || !state.hosted || !schemaReady() || state.saveBusy;
    if (validate) validate.disabled = !state.connected || !schemaReady() || state.saveBusy;
    if (add) add.disabled = !canEdit;
    ['datasetSelect', 'loadDraftButton', 'draftFileInput', 'logoutButton'].forEach(function (id) {
      var control = document.getElementById(id);
      if (control) control.disabled = state.saveBusy || isLockedForRetry();
    });
    var confirm = document.getElementById('confirmSubmit');
    if (confirm) confirm.disabled = state.saveBusy;
  }

  function renderWorkspace() {
    renderStaticLanguage();
    renderConnectionState();
    renderTableNav();
    renderActiveTable();
  }

  function markDirty() {
    state.dirtyRevision += 1;
    if (state.pendingSave && state.pendingSave.ambiguous) {
      state.pendingSave = null;
      setSaveStatus('', '');
    }
    updateButtonState();
  }

  function nonEmpty(value) { return value !== undefined && value !== null && String(value).trim() !== ''; }

  function meaningfulRows(key) {
    var columns = columnsFor(key);
    return rowsFor(key).map(function (row, index) { return { row: row, index: index }; }).filter(function (entry) {
      return columns.some(function (column) { return nonEmpty(entry.row[column.key]); });
    });
  }

  function serializableRows(key, entries) {
    var columns = columnsFor(key);
    return entries.map(function (entry) {
      var row = {};
      columns.forEach(function (column) {
        var raw = Object.prototype.hasOwnProperty.call(entry.row, column.key) ? entry.row[column.key] : '';
        if (raw === undefined || raw === null || String(raw).trim() === '') {
          row[column.key] = (column.type === 'number' || column.type === 'integer') ? null : '';
        } else if (column.type === 'number' || column.type === 'integer') {
          row[column.key] = isDecimalLiteral(raw) ? Number(raw) : String(raw);
        } else if (column.type === 'boolean') {
          row[column.key] = raw === true || raw === 'true';
        } else {
          row[column.key] = String(raw);
        }
      });
      return row;
    });
  }

  function setValidationErrors(errors, entries) {
    state.validationErrors = {};
    (errors || []).forEach(function (error) {
      var rowPosition;
      if (error.rowIndex !== undefined) rowPosition = Number(error.rowIndex);
      else if (error.rowNumber !== undefined) rowPosition = Number(error.rowNumber) - 1;
      else if (error.row !== undefined) rowPosition = Number(error.row) - 1;
      else rowPosition = 0;
      if (!Number.isFinite(rowPosition)) rowPosition = 0;
      var row = entries && entries[rowPosition] ? entries[rowPosition].index : rowPosition;
      var field = String(error.field || error.column || error.key || '');
      if (!field && error.path) field = String(error.path).split('.').pop();
      if (!field) return;
      state.validationErrors[row + ':' + field] = localizeErrorMessage(error.message || error.error || t('invalidRows'));
    });
  }

  function localValidation(key, rows) {
    var columns = columnsFor(key);
    var errors = [];
    rows.forEach(function (row, rowIndex) {
      columns.forEach(function (column) {
        var value = row[column.key];
        var empty = !nonEmpty(value);
        if (column.required && empty) errors.push({ rowIndex: rowIndex, field: column.key, message: t('errRequired') });
        if (empty || isMissingValue(String(value))) return;
        if (fieldIsChoice(column)) {
          var options = optionList(column);
          if (options.length && !options.some(function (option) { return String(option.value) === String(value); })) errors.push({ rowIndex: rowIndex, field: column.key, message: column.reference ? t('errReference') : t('errChoice') });
        }
        if (['number', 'numeric', 'integer', 'decimal', 'float'].indexOf(column.type) >= 0 && (!isDecimalLiteral(value) || !Number.isFinite(Number(value)))) errors.push({ rowIndex: rowIndex, field: column.key, message: t('errNumber') });
        if ((column.type === 'date' || column.type === 'datetime') && Number.isNaN(Date.parse(String(value)))) errors.push({ rowIndex: rowIndex, field: column.key, message: t('errDate') });
      });
    });
    return errors;
  }

  function localizeErrorMessage(message) {
    var text = String(message || '');
    if (state.lang === 'en') return text;
    if (/^is required$/.test(text)) return '필수 입력입니다.';
    if (/^is required when (.+) is provided$/.test(text)) return '해당 값을 입력하면 단위도 필요합니다.';
    if (/^is required when value_status is measured$/.test(text)) return '측정값 있음이면 수치값이 필요합니다.';
    if (/^is required for (.+)$/.test(text)) return '조건에 따라 필수 입력입니다.';
    if (/^must be empty when/.test(text)) return '이 상태에서는 비워 주세요.';
    if (/^must be a finite (number|integer)/.test(text)) return '유한한 숫자를 입력해 주세요.';
    if (/^must be true or false/.test(text)) return '참 또는 거짓을 선택해 주세요.';
    if (/^must be a real ISO date/.test(text)) return '실제 날짜(YYYY-MM-DD)를 입력해 주세요.';
    if (/^is not an allowed choice/.test(text)) return '목록에서 선택해 주세요.';
    if (/^is not part of the shared schema/.test(text)) return '공유 양식에 없는 열입니다.';
    if (/^must contain one or more IDs/.test(text)) return '하나 이상의 ID를 입력해 주세요.';
    if (/^must be a text path/.test(text)) return 'URL·업로드가 아닌 텍스트 경로를 입력해 주세요.';
    if (/^or lot_id is required/.test(text)) return '자체 측정 물성에는 Lot ID가 필요합니다.';
    if (/^must be at least 1/.test(text)) return '1 이상을 입력해 주세요.';
    if (/^must be zero or greater/.test(text)) return '0 이상을 입력해 주세요.';
    if (/^belongs only/.test(text)) return '평균 집계 행에만 입력합니다.';
    return text;
  }

  function normalizeValidationResult(result, rows) {
    if (result === true || (result && result.ok === true && !result.errors)) return { ok: true, errors: [] };
    var errors = [];
    if (Array.isArray(result)) errors = result;
    else if (result && Array.isArray(result.errors)) errors = result.errors;
    else if (result && result.error) errors = [{ message: result.error }];
    else if (result && result.valid === false) errors = [{ message: t('invalidRows') }];
    if (!errors.length && result && result.ok === false) errors = [{ message: result.error || t('invalidRows') }];
    return { ok: errors.length === 0, errors: errors.map(function (error) { var normalized = typeof error === 'string' ? { message: error } : Object.assign({}, error); normalized.message = localizeErrorMessage(normalized.message); return normalized; }), rows: rows };
  }

  function callSchemaValidator(key, rows) {
    var validator = schemaSource && schemaSource.validateRows;
    if (typeof validator !== 'function') return { ok: false, errors: [{ message: t('schemaUnavailable'), code: 'SCHEMA_MISSING' }] };
    var result;
    var context = { table: key, tableKey: key, rows: rows, references: state.references, schemaVersion: state.schemaVersion };
    try {
      if (validator.length >= 2) result = validator(key, rows, context);
      else result = validator(context);
    } catch (firstError) {
      try { result = validator(key, rows, context); } catch (secondError) { return { ok: false, errors: [{ message: secondError.message || firstError.message || t('invalidRows') }] }; }
    }
    return normalizeValidationResult(result, rows);
  }

  function validateCurrent(showSuccess) {
    var entries = meaningfulRows(state.tableKey);
    if (!entries.length) {
      setValidationErrors([]);
      setSaveStatus(t('noRows'), '');
      renderGrid();
      return { ok: false, rows: [], entries: entries, errors: [{ message: t('noRows') }] };
    }
    var rows = serializableRows(state.tableKey, entries);
    var localErrors = localValidation(state.tableKey, rows);
    var schemaResult = callSchemaValidator(state.tableKey, rows);
    var errors = localErrors.concat(schemaResult.errors || []);
    if (errors.some(function (error) { return error.field && visibleColumns(state.tableKey).every(function (column) { return column.key !== error.field; }); })) state.showOptional = true;
    setValidationErrors(errors, entries);
    renderGrid();
    if (errors.length) {
      setSaveStatus(t('invalidRows'), '');
      if (showSuccess) showToast(t('invalidRows'), 'error');
      focusFirstError();
      return { ok: false, rows: rows, entries: entries, errors: errors };
    }
    setSaveStatus(showSuccess ? t('validRows') : '', 'success');
    if (showSuccess) showToast(t('validRows'), 'success');
    return { ok: true, rows: rows, entries: entries, errors: [] };
  }

  function focusFirstError() {
    var first = document.querySelector('.data-grid td.is-invalid input, .data-grid td.is-invalid select, .data-grid td.is-invalid textarea');
    if (first) first.focus();
  }

  function applyDataset(value) {
    if (state.saveBusy || isLockedForRetry()) return;
    var field = findDatasetField(state.tableKey);
    if (!field) { showToast(t('noDatasetField'), ''); return; }
    rowsFor(state.tableKey).forEach(function (row) { row[field.key] = value; });
    markDirty();
    state.validationErrors = {};
    renderGrid();
    showToast(value ? t('datasetApplied') : (state.lang === 'ko' ? '데이터셋 선택을 해제했습니다.' : 'Cleared the dataset selection.'), 'success');
  }

  function openSaveModal() {
    if (state.saveBusy) return;
    var check = validateCurrent(false);
    if (!check.ok) return;
    var modal = document.getElementById('confirmModal');
    var text = document.getElementById('confirmText');
    var submit = document.getElementById('confirmSubmit');
    var retry = canRetryPending(check);
    if (text) text.textContent = state.lang === 'ko' ? (retry ? '이전 요청의 응답이 없었습니다. 같은 요청 ID로 다시 보내 서버의 중복 저장 방지를 활용합니다.' : check.rows.length + '개 행을 Google Sheets에 저장합니다. 서버가 발급한 ID를 받은 뒤 초안에서 지웁니다.') : (retry ? 'The previous request had no response. Retry with the same request ID for idempotency.' : 'Save ' + check.rows.length + ' row(s) to Google Sheets. They leave the draft only after assigned IDs return.');
    if (submit) { var label = submit.querySelector('[data-i18n]'); if (label) label.textContent = t(retry ? 'confirmRetry' : 'confirmSave'); }
    if (modal) { modal.hidden = false; if (submit) window.setTimeout(function () { submit.focus(); }, 0); }
  }

  function closeSaveModal() { var modal = document.getElementById('confirmModal'); if (modal) modal.hidden = true; }

  function newRequestId() {
    if (root.crypto && typeof root.crypto.randomUUID === 'function') return root.crypto.randomUUID();
    return 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function canRetryPending(check) {
    return !!(state.pendingSave && state.pendingSave.ambiguous && state.pendingSave.table === state.tableKey && JSON.stringify(state.pendingSave.rows) === JSON.stringify(check.rows) && state.pendingSave.revision === state.dirtyRevision);
  }

  function receiptText(result, count, requestId) {
    var ids = Array.isArray(result.ids) ? result.ids.map(function (id) { return typeof id === 'object' ? (id.id || id.value || JSON.stringify(id)) : String(id); }) : [];
    var receipt = t('saveSucceeded') + ' · ' + count + ' ' + t('rowUnit');
    if (ids.length) receipt += ' · ID: ' + ids.join(', ');
    if (result.replayed) receipt += state.lang === 'ko' ? ' · 중복 없는 재처리 확인' : ' · idempotent replay';
    if (result.savedAt) receipt += ' · ' + t('savedAt') + ': ' + String(result.savedAt);
    receipt += ' · ' + t('requestId') + ': ' + requestId;
    return receipt;
  }

  async function submitCurrent() {
    if (state.saveBusy) return;
    closeSaveModal();
    var check = validateCurrent(false);
    if (!check.ok) return;
    if (!state.hosted) { setSaveStatus(t('localOnly'), ''); return; }
    var retry = canRetryPending(check);
    var requestId = retry ? state.pendingSave.requestId : newRequestId();
    var submittedIndices = check.entries.map(function (entry) { return entry.index; });
    state.pendingSave = { requestId: requestId, revision: state.dirtyRevision, table: state.tableKey, rows: check.rows, indices: submittedIndices, ambiguous: false };
    state.saveBusy = true;
    setSaveStatus(t('saving'), '');
    renderGrid();
    updateButtonState();
    try {
      var result = await rpc('submitRows', { token: state.token, requestId: requestId, table: state.tableKey, rows: check.rows, contributor: { name: state.contributor.name, email: state.contributor.email }, schemaVersion: state.schemaVersion });
      if (!result || result.ok !== true) {
        state.saveBusy = false;
        if (!result || result.uncertain === true) {
          state.pendingSave = { requestId: requestId, revision: state.dirtyRevision, table: state.tableKey, rows: check.rows, indices: submittedIndices, ambiguous: true };
          setSaveStatus(t('saveTimeout') + ' · ' + t('requestId') + ': ' + requestId, 'warning');
          showToast(t('saveTimeout'), 'error', 7000);
          renderGrid();
          return;
        }
        state.pendingSave = null;
        var serverErrors = result && (result.errors || [{ message: result.error || t('serverRejected') }]);
        setValidationErrors(serverErrors, check.entries);
        renderGrid();
        setSaveStatus((result && result.error) || t('saveFailed'), '');
        showToast((result && result.error) || t('saveFailed'), 'error');
        return;
      }
      var submittedTable = state.pendingSave.table;
      var submittedState = state.pendingSave;
      state.drafts[submittedTable] = rowsFor(submittedTable).filter(function (_row, index) { return submittedState.indices.indexOf(index) < 0; });
      state.pendingSave = null;
      state.saveBusy = false;
      state.validationErrors = {};
      setSaveStatus(receiptText(result, submittedState.rows.length, requestId), 'success');
      showToast(receiptText(result, submittedState.rows.length, requestId), 'success', 7000);
      renderTableNav();
      renderGrid();
      await refreshReferences(result);
    } catch (error) {
      state.saveBusy = false;
      if (error && error.code !== 'NOT_HOSTED' && error.code !== 'MISSING_METHOD') {
        state.pendingSave = { requestId: requestId, revision: state.dirtyRevision, table: state.tableKey, rows: check.rows, indices: submittedIndices, ambiguous: true };
        setSaveStatus(t('saveTimeout') + ' · ' + t('requestId') + ': ' + requestId, 'warning');
        showToast(t('saveTimeout'), 'error', 7000);
      } else {
        state.pendingSave = null;
        setSaveStatus((error && error.message) || t('saveFailed'), '');
        showToast((error && error.message) || t('saveFailed'), 'error');
      }
      renderGrid();
    } finally {
      updateButtonState();
    }
  }

  async function refreshReferences(saveResult) {
    try {
      var result = await rpc('connect', { token: state.token });
      if (!result || result.ok !== true) throw new Error(result && result.error || t('referencesRefreshFailed'));
      state.references = Object.assign({ datasets: [], materials: [], lots: [], batches: [], specimens: [] }, result.references || {});
      state.counts = Object.assign({}, result.counts || {});
      renderDatasetSelect();
      renderReferenceStrip();
      renderTableNav();
      if (saveResult && saveResult.references) state.references = Object.assign(state.references, saveResult.references);
    } catch (_error) {
      setSaveStatus(document.getElementById('saveStatus').textContent + ' · ' + t('referencesRefreshFailed'), 'warning');
      showToast(t('referencesRefreshFailed'), '');
    }
  }

  async function connect(event) {
    event.preventDefault();
    var nameElement = document.getElementById('contributorName');
    var emailElement = document.getElementById('contributorEmail');
    var selfReported = document.getElementById('selfReported');
    var tokenElement = document.getElementById('inviteToken');
    var name = nameElement ? nameElement.value.trim() : '';
    var email = emailElement ? emailElement.value.trim() : '';
    if (!name || !email || !selfReported || !selfReported.checked) { setConnectionStatus(t('enterRequired')); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setConnectionStatus(t('invalidEmail')); return; }
    if (!state.hosted) { setConnectionStatus(t('localOnly')); return; }
    state.contributor = { name: name, email: email };
    state.token = tokenElement ? tokenElement.value : '';
    var button = document.getElementById('connectButton');
    if (button) button.disabled = true;
    setConnectionStatus(t('connecting'), '');
    try {
      var result = await rpc('connect', { token: state.token });
      if (!result || result.ok !== true) throw new Error(result && result.error || t('connectionFailed'));
      setGroup(result);
      state.connected = true;
      state.preview = false;
      if (typeof root.dispatchEvent === 'function' && typeof root.CustomEvent === 'function') root.dispatchEvent(new root.CustomEvent('ematax-connected', { detail: { group: result.group } }));
      setConnectionStatus('', '');
      renderWorkspace();
      showToast(t('connectedTo') + ': ' + (state.group.name || state.group.code || ''), 'success');
    } catch (error) {
      state.token = '';
      setConnectionStatus((error && error.message) || t('connectionFailed'));
      showToast((error && error.message) || t('connectionFailed'), 'error');
    } finally {
      if (button) button.disabled = false;
    }
  }

  function logout() {
    if (state.saveBusy || isLockedForRetry()) return;
    state.connected = false;
    state.preview = false;
    state.token = '';
    state.group = null;
    state.references = { datasets: [], materials: [], lots: [], batches: [], specimens: [] };
    state.counts = {};
    state.pendingSave = null;
    state.saveBusy = false;
    if (typeof root.dispatchEvent === 'function' && typeof root.CustomEvent === 'function') root.dispatchEvent(new root.CustomEvent('ematax-disconnected'));
    var token = document.getElementById('inviteToken');
    if (token) token.value = '';
    setConnectionStatus('', '');
    renderConnectionState();
    showToast(t('authExit'), '');
  }

  function addRow() {
    if (!state.connected || !tableFieldCount(state.tableKey) || state.saveBusy || isLockedForRetry()) return;
    rowsFor(state.tableKey).push({});
    markDirty();
    state.validationErrors = {};
    renderGrid();
    var body = document.getElementById('gridBody');
    var rows = body ? body.querySelectorAll('tr') : [];
    if (rows.length) {
      var fields = rows[rows.length - 1].querySelectorAll('[data-field]');
      for (var i = 0; i < fields.length; i += 1) { if (!fieldIsId(fieldByKey(state.tableKey, fields[i].getAttribute('data-field')))) { fields[i].focus(); break; } }
    }
  }

  function duplicateRow(index) {
    var rows = rowsFor(state.tableKey);
    if (!rows[index] || state.saveBusy || isLockedForRetry()) return;
    var copy = {};
    columnsFor(state.tableKey).forEach(function (column) { if (!fieldIsId(column)) copy[column.key] = rows[index][column.key] === undefined ? '' : rows[index][column.key]; });
    rows.splice(index + 1, 0, copy);
    markDirty();
    state.validationErrors = {};
    renderGrid();
  }

  function deleteRow(index) {
    var rows = rowsFor(state.tableKey);
    if (state.saveBusy || isLockedForRetry() || index < 0 || index >= rows.length) return;
    rows.splice(index, 1);
    if (!rows.length && tableFieldCount(state.tableKey)) rows.push({});
    markDirty();
    state.validationErrors = {};
    renderGrid();
    showToast(t('rowDeleted'), '');
  }

  function updateCell(rowIndex, field, value) {
    var rows = rowsFor(state.tableKey);
    if (!rows[rowIndex] || state.preview || state.saveBusy || isLockedForRetry()) return;
    var column = fieldByKey(state.tableKey, field);
    if (column && (fieldIsId(column) || isServerGroupField(state.tableKey, column))) return;
    rows[rowIndex][field] = value;
    if (column && (column.type === 'number' || column.type === 'integer')) {
      var pairedStatus = statusFieldFor(state.tableKey, column);
      if (pairedStatus) {
        rows[rowIndex][pairedStatus.key] = nonEmpty(value) ? 'measured' : '';
        var statusElement = document.querySelector('.data-grid select[data-row-index="' + rowIndex + '"][data-field="' + CSS.escape(pairedStatus.key) + '"]');
        if (statusElement) statusElement.value = rows[rowIndex][pairedStatus.key];
      }
    }
    if (column && /_status$/.test(column.key) && value !== 'measured') {
      var numericKey = column.key.replace(/_status$/, '_num');
      if (fieldByKey(state.tableKey, numericKey)) rows[rowIndex][numericKey] = null;
    }
    delete state.validationErrors[rowIndex + ':' + field];
    markDirty();
    var cell = document.querySelector('.data-grid tr[data-row-index="' + rowIndex + '"] td[data-field="' + CSS.escape(field) + '"]');
    if (cell) cell.classList.remove('is-invalid');
  }

  function pasteIntoGrid(event) {
    var target = event.target;
    if (!target || !target.matches('[data-row-index][data-field]') || state.preview || isLockedForRetry()) return;
    var raw = event.clipboardData && event.clipboardData.getData('text/plain');
    if (!raw || (!raw.includes('\t') && !raw.includes('\n'))) return;
    event.preventDefault();
    var rows = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    if (rows.length && rows[rows.length - 1] === '') rows.pop();
    var matrix = rows.map(function (line) { return line.split('\t'); });
    var width = matrix[0] ? matrix[0].length : 0;
    if (!width || matrix.some(function (line) { return line.length !== width; })) { showToast(t('pasteInvalid'), 'error'); return; }
    var columns = visibleColumns(state.tableKey);
    var startField = target.getAttribute('data-field');
    var start = columns.findIndex(function (column) { return column.key === startField; });
    if (start < 0 || fieldIsId(columns[start]) || matrix.some(function (line) { return line.some(function (_value, offset) { return fieldIsId(columns[start + offset]); }); })) { showToast(t('pasteId'), 'error'); return; }
    if (start + width > columns.length) { showToast(t('pasteInvalid'), 'error'); return; }
    var startRow = Number(target.getAttribute('data-row-index'));
    var draftRows = rowsFor(state.tableKey);
    while (draftRows.length < startRow + matrix.length) draftRows.push({});
    matrix.forEach(function (line, rowOffset) { line.forEach(function (value, columnOffset) { draftRows[startRow + rowOffset][columns[start + columnOffset].key] = value; }); });
    markDirty();
    state.validationErrors = {};
    renderGrid();
    showToast(t('pasted'), 'success');
  }

  function exportDraft() {
    var entries = meaningfulRows(state.tableKey);
    if (!entries.length) { showToast(t('noDraftData'), ''); return; }
    var payload = { format: 'ematax-draft', draftVersion: 1, schemaVersion: state.schemaVersion, table: state.tableKey, exportedAt: new Date().toISOString(), rows: serializableRows(state.tableKey, entries) };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'ematax-' + state.tableKey + '-draft.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showToast(t('draftDownloaded'), 'success');
  }

  function importDraftFile(event) {
    var file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file || state.saveBusy || isLockedForRetry()) return;
    var reader = new FileReader();
    reader.onload = function () {
      if (state.saveBusy || isLockedForRetry()) return;
      try {
        var payload = JSON.parse(String(reader.result || ''));
        if (!payload || payload.format !== 'ematax-draft' || payload.draftVersion !== 1 || payload.table !== state.tableKey || !Array.isArray(payload.rows)) { showToast(t('draftInvalid'), 'error'); return; }
        var columns = columnsFor(state.tableKey);
        state.drafts[state.tableKey] = payload.rows.map(function (sourceRow) {
          var row = {};
          columns.forEach(function (column) { row[column.key] = fieldIsId(column) ? '' : (sourceRow[column.key] === undefined || sourceRow[column.key] === null ? '' : String(sourceRow[column.key])); });
          return row;
        });
        if (!state.drafts[state.tableKey].length) state.drafts[state.tableKey].push({});
        markDirty();
        state.validationErrors = {};
        renderTableNav();
        renderGrid();
        setSaveStatus(payload.schemaVersion && String(payload.schemaVersion) !== String(state.schemaVersion) ? t('draftSchemaMismatch') : '', 'warning');
        showToast(t('draftLoaded'), 'success');
      } catch (_error) { showToast(t('draftReadFailed'), 'error'); }
    };
    reader.onerror = function () { showToast(t('draftReadFailed'), 'error'); };
    reader.readAsText(file);
  }

  function switchTable(key) {
    if (tableOrder.indexOf(key) < 0 || key === state.tableKey || state.saveBusy || isLockedForRetry()) return;
    state.tableKey = key;
    state.validationErrors = {};
    ensureRow(key);
    renderTableNav();
    renderActiveTable();
  }

  function bindEvents() {
    var language = document.getElementById('languageToggle');
    if (language) language.addEventListener('click', function () { state.lang = state.lang === 'ko' ? 'en' : 'ko'; renderStaticLanguage(); if (state.connected || state.preview) { renderConnectionState(); renderTableNav(); renderActiveTable(); } });
    var form = document.getElementById('connectForm');
    if (form) form.addEventListener('submit', connect);
    var preview = document.getElementById('previewButton');
    if (preview) preview.addEventListener('click', function () { state.preview = true; state.connected = false; state.tableKey = 'datasets'; renderWorkspace(); showToast(state.lang === 'ko' ? '표 양식을 읽기 전용으로 열었습니다.' : 'Opened the form in read-only mode.', ''); });
    var reveal = document.getElementById('revealToken');
    if (reveal) reveal.addEventListener('click', function () { var input = document.getElementById('inviteToken'); if (!input) return; var shown = input.type === 'text'; input.type = shown ? 'password' : 'text'; reveal.textContent = shown ? (state.lang === 'ko' ? '보기' : 'Show') : (state.lang === 'ko' ? '숨기기' : 'Hide'); });
    var nav = document.getElementById('tableNav');
    if (nav) nav.addEventListener('click', function (event) { var button = event.target.closest('[data-table-key]'); if (button) switchTable(button.getAttribute('data-table-key')); });
    var add = document.getElementById('addRowButton');
    if (add) add.addEventListener('click', addRow);
    var optional = document.getElementById('toggleOptionalButton');
    if (optional) optional.addEventListener('click', function () { state.showOptional = !state.showOptional; renderActiveTable(); });
    var dataset = document.getElementById('datasetSelect');
    if (dataset) dataset.addEventListener('change', function () { applyDataset(dataset.value); });
    var createDataset = document.getElementById('createDatasetButton');
    if (createDataset) createDataset.addEventListener('click', function () { switchTable('datasets'); var first = document.querySelector('.data-grid input:not(:disabled), .data-grid textarea:not(:disabled), .data-grid select:not(:disabled)'); if (first) first.focus(); });
    var grid = document.getElementById('gridBody');
    if (grid) {
      grid.addEventListener('input', function (event) { var target = event.target.closest('[data-row-index][data-field]'); if (target) updateCell(Number(target.getAttribute('data-row-index')), target.getAttribute('data-field'), target.value); });
      grid.addEventListener('change', function (event) {
        if (state.saveBusy || isLockedForRetry()) return;
        var target = event.target;
        if (target.matches('.missing-select')) {
          var rowIndex = Number(target.getAttribute('data-row-index')); var field = target.getAttribute('data-missing-for'); var statusField = target.getAttribute('data-status-field'); var rows = rowsFor(state.tableKey); var status = target.value || ''; if (rows[rowIndex]) { rows[rowIndex][statusField] = status; if (status && status !== 'measured') rows[rowIndex][field] = null; } markDirty(); delete state.validationErrors[rowIndex + ':' + field]; delete state.validationErrors[rowIndex + ':' + statusField]; renderGrid();
        } else { var cell = target.closest('[data-row-index][data-field]'); if (cell) updateCell(Number(cell.getAttribute('data-row-index')), cell.getAttribute('data-field'), cell.value); }
      });
      grid.addEventListener('paste', pasteIntoGrid);
      grid.addEventListener('click', function (event) { var action = event.target.closest('[data-row-action]'); if (!action) return; var index = Number(action.getAttribute('data-row-index')); var kind = action.getAttribute('data-row-action'); if (kind === 'duplicate') duplicateRow(index); if (kind === 'delete') deleteRow(index); if (kind === 'focus') { var input = document.querySelector('.data-grid tr[data-row-index="' + index + '"] input:not(:disabled), .data-grid tr[data-row-index="' + index + '"] textarea:not(:disabled), .data-grid tr[data-row-index="' + index + '"] select:not(:disabled)'); if (input) input.focus(); } });
    }
    var validate = document.getElementById('validateButton');
    if (validate) validate.addEventListener('click', function () { validateCurrent(true); });
    var save = document.getElementById('saveButton');
    if (save) save.addEventListener('click', openSaveModal);
    var confirm = document.getElementById('confirmSubmit');
    if (confirm) confirm.addEventListener('click', submitCurrent);
    ['confirmClose', 'confirmCancel'].forEach(function (id) { var element = document.getElementById(id); if (element) element.addEventListener('click', closeSaveModal); });
    var modal = document.getElementById('confirmModal');
    if (modal) modal.addEventListener('click', function (event) { if (event.target === modal) closeSaveModal(); });
    var download = document.getElementById('downloadDraftButton');
    if (download) download.addEventListener('click', exportDraft);
    var load = document.getElementById('loadDraftButton');
    var file = document.getElementById('draftFileInput');
    if (load && file) { load.addEventListener('click', function () { if (!state.saveBusy && !isLockedForRetry()) file.click(); }); file.addEventListener('change', importDraftFile); }
    var logoutElement = document.getElementById('logoutButton');
    if (logoutElement) logoutElement.addEventListener('click', logout);
    window.addEventListener('beforeunload', function (event) { if (hasUnsavedData()) { event.preventDefault(); event.returnValue = t('leaveWarning'); return t('leaveWarning'); } return undefined; });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeSaveModal(); });
  }

  function hasUnsavedData() {
    return tableOrder.some(function (key) { return meaningfulRows(key).length > 0; });
  }

  function init() {
    renderStaticLanguage();
    updateHostedNotice();
    bindEvents();
    renderConnectionState();
    renderTableNav();
    renderActiveTable();
    root.EMatAXPortal = { rpc: rpc, validateCurrent: validateCurrent, getState: function () { return { connected: state.connected, table: state.tableKey, schemaVersion: state.schemaVersion }; } };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
