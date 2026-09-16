(function attachEMatAXSchema(root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.EMATAX_SCHEMA = factory();
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function createSchema() {
  "use strict";

  /*
   * This file is deliberately independent of the public E-MatAX page.  It is
   * the shared contract for the data portal, and can be loaded by a browser,
   * Node, or an Apps Script V8 runtime.
   *
   * Choices use one shape everywhere: { value, label, en }.  The value is the
   * stable storage value; label and en are presentation text.
   */

  var version = "1.0.0";
  var types = Object.freeze([
    "text",
    "long_text",
    "number",
    "integer",
    "date",
    "enum",
    "boolean",
  ]);

  var roles = Object.freeze([
    "identifier",
    "metadata",
    "design",
    "process",
    "environment",
    "measured",
    "target",
  ]);

  var domains = Object.freeze([
    "energy_storage",
    "energy_conversion",
    "energy_production",
    "materials_process_ai",
    "other",
  ]);

  var timings = Object.freeze(["design", "process", "post_measurement"]);

  var missingStatuses = Object.freeze([
    "measured",
    "not_applicable",
    "not_measured",
  ]);

  var analysisTypes = Object.freeze(["acquisition", "raw", "derived"]);
  var aggregationTypes = Object.freeze(["individual", "mean"]);
  var vocabularyStatuses = Object.freeze(["pending", "verified", "proposed"]);

  var sourceTypes = Object.freeze([
    "supplier",
    "literature",
    "calculated",
    "self_measured",
    "other",
  ]);

  var specimenTypes = Object.freeze([
    "substrate",
    "film",
    "electrode",
    "device",
    "sample",
    "intermediate",
    "other",
  ]);

  var resultStatuses = Object.freeze(["planned", "complete", "failed", "excluded"]);
  var batchTypes = Object.freeze([
    "solution",
    "mixture",
    "synthesis",
    "ink",
    "electrode",
    "other",
  ]);
  var splitUnits = Object.freeze(["lot", "batch", "specimen", "group", "time", "custom"]);
  var ownershipValues = Object.freeze(["group", "institution", "joint", "partner", "other"]);
  var visibilityValues = Object.freeze(["private", "group", "internal", "embargoed", "public"]);

  /*
   * The list is intentionally broad and finite.  It provides a stable common
   * vocabulary without pretending that a physical range is valid for every
   * domain.  Domain-specific units can be proposed through the vocabulary
   * workflow rather than silently accepting arbitrary strings.
   */
  var unitValues = Object.freeze([
    "1",
    "%",
    "ppm",
    "ppb",
    "K",
    "°C",
    "s",
    "ms",
    "min",
    "h",
    "day",
    "nm",
    "µm",
    "mm",
    "cm",
    "m",
    "nm²",
    "µm²",
    "mm²",
    "cm²",
    "m²",
    "kg",
    "g",
    "mg",
    "µg",
    "L",
    "mL",
    "µL",
    "mol",
    "mmol",
    "mol L⁻¹",
    "mmol L⁻¹",
    "M",
    "g L⁻¹",
    "mg mL⁻¹",
    "mg mL^{-1}",
    "g L^{-1}",
    "A m⁻²",
    "A m^{-2}",
    "mA cm⁻²",
    "mA cm^{-2}",
    "mW cm⁻²",
    "mW cm^{-2}",
    "W m⁻²",
    "W m^{-2}",
    "V",
    "mV",
    "A",
    "mA",
    "µA",
    "Ω",
    "Ω cm",
    "S cm⁻¹",
    "S cm^{-1}",
    "F g⁻¹",
    "F g^{-1}",
    "mAh g⁻¹",
    "mAh cm⁻²",
    "Ah kg⁻¹",
    "Wh kg⁻¹",
    "Wh L⁻¹",
    "W kg⁻¹",
    "g cm⁻³",
    "m² g⁻¹",
    "J mol⁻¹",
    "kJ mol⁻¹",
    "W m⁻¹ K⁻¹",
    "eV",
    "Hz",
    "rpm",
    "Pa",
    "kPa",
    "MPa",
    "bar",
    "mbar",
    "rad",
    "°",
    "cycles",
    "counts",
    "dB",
  ]);

  function choice(value, label, en) {
    return Object.freeze({ value: value, label: label, en: en });
  }

  function choices(values, labels) {
    return Object.freeze(values.map(function mapChoice(value) {
      var text = labels && labels[value];
      return choice(value, text ? text.label : value, text ? text.en : value);
    }));
  }

  var roleOptions = choices(roles, {
    identifier: { label: "식별자", en: "Identifier" },
    metadata: { label: "메타데이터", en: "Metadata" },
    design: { label: "설계변수", en: "Design variable" },
    process: { label: "공정변수", en: "Process variable" },
    environment: { label: "환경변수", en: "Environment variable" },
    measured: { label: "측정유래", en: "Measured or analysis-derived" },
    target: { label: "목적값", en: "Target" },
  });

  var domainOptions = choices(domains, {
    energy_storage: { label: "에너지 저장", en: "Energy storage" },
    energy_conversion: { label: "에너지 변환", en: "Energy conversion" },
    energy_production: { label: "에너지 생산", en: "Energy production" },
    materials_process_ai: { label: "소재·공정 AI", en: "Materials-process AI" },
    other: { label: "기타", en: "Other" },
  });

  var timingOptions = choices(timings, {
    design: { label: "설계 단계", en: "Design" },
    process: { label: "공정 단계", en: "Process" },
    post_measurement: { label: "측정 후", en: "Post-measurement" },
  });

  var missingStatusOptions = choices(missingStatuses, {
    measured: { label: "측정값 있음", en: "Measured" },
    not_applicable: { label: "해당 없음 (N/A)", en: "Not applicable (N/A)" },
    not_measured: { label: "미측정 (-)", en: "Not measured (-)" },
  });

  var analysisTypeOptions = choices(analysisTypes, {
    acquisition: { label: "측정 조건", en: "Acquisition" },
    raw: { label: "원본", en: "Raw" },
    derived: { label: "도출값", en: "Derived" },
  });

  var aggregationOptions = choices(aggregationTypes, {
    individual: { label: "개별", en: "Individual" },
    mean: { label: "평균 집계", en: "Mean aggregate" },
  });

  var vocabularyStatusOptions = choices(vocabularyStatuses, {
    pending: { label: "매핑 확인 필요", en: "Mapping pending" },
    verified: { label: "매핑 완료", en: "Verified" },
    proposed: { label: "추가 제안", en: "Proposed" },
  });

  var sourceTypeOptions = choices(sourceTypes, {
    supplier: { label: "공급사 자료", en: "Supplier" },
    literature: { label: "문헌", en: "Literature" },
    calculated: { label: "계산", en: "Calculated" },
    self_measured: { label: "자체 측정", en: "Self-measured" },
    other: { label: "기타", en: "Other" },
  });

  var specimenTypeOptions = choices(specimenTypes, {
    substrate: { label: "기판", en: "Substrate" },
    film: { label: "박막", en: "Film" },
    electrode: { label: "전극", en: "Electrode" },
    device: { label: "소자", en: "Device" },
    sample: { label: "시료", en: "Sample" },
    intermediate: { label: "중간체", en: "Intermediate" },
    other: { label: "기타", en: "Other" },
  });

  var resultStatusOptions = choices(resultStatuses, {
    planned: { label: "계획", en: "Planned" },
    complete: { label: "완료", en: "Complete" },
    failed: { label: "실패", en: "Failed" },
    excluded: { label: "제외", en: "Excluded" },
  });

  var batchTypeOptions = choices(batchTypes, {
    solution: { label: "용액", en: "Solution" },
    mixture: { label: "혼합물", en: "Mixture" },
    synthesis: { label: "합성 배치", en: "Synthesis batch" },
    ink: { label: "잉크", en: "Ink" },
    electrode: { label: "전극 배치", en: "Electrode batch" },
    other: { label: "기타", en: "Other" },
  });

  var splitUnitOptions = choices(splitUnits, {
    lot: { label: "Lot", en: "Lot" },
    batch: { label: "배치", en: "Batch" },
    specimen: { label: "시편", en: "Specimen" },
    group: { label: "연구 그룹", en: "Research group" },
    time: { label: "시간", en: "Time" },
    custom: { label: "사용자 정의", en: "Custom" },
  });

  var ownershipOptions = choices(ownershipValues, {
    group: { label: "연구 그룹", en: "Research group" },
    institution: { label: "기관", en: "Institution" },
    joint: { label: "공동 소유", en: "Joint" },
    partner: { label: "협력 기관", en: "Partner" },
    other: { label: "기타", en: "Other" },
  });

  var visibilityOptions = choices(visibilityValues, {
    private: { label: "비공개", en: "Private" },
    group: { label: "그룹 공개", en: "Group" },
    internal: { label: "연구단 내부", en: "Internal" },
    embargoed: { label: "엠바고", en: "Embargoed" },
    public: { label: "공개", en: "Public" },
  });

  var unitLabels = {
    "1": { label: "무차원", en: "Dimensionless" },
    "%": { label: "%", en: "%" },
    ppm: { label: "ppm", en: "ppm" },
    ppb: { label: "ppb", en: "ppb" },
    K: { label: "K", en: "K" },
    "°C": { label: "°C", en: "°C" },
    s: { label: "s", en: "s" },
    ms: { label: "ms", en: "ms" },
    min: { label: "min", en: "min" },
    h: { label: "h", en: "h" },
    day: { label: "일", en: "day" },
    nm: { label: "nm", en: "nm" },
    "µm": { label: "µm", en: "µm" },
    mm: { label: "mm", en: "mm" },
    cm: { label: "cm", en: "cm" },
    m: { label: "m", en: "m" },
    "nm²": { label: "nm²", en: "nm²" },
    "µm²": { label: "µm²", en: "µm²" },
    "mm²": { label: "mm²", en: "mm²" },
    "cm²": { label: "cm²", en: "cm²" },
    "m²": { label: "m²", en: "m²" },
    kg: { label: "kg", en: "kg" },
    g: { label: "g", en: "g" },
    mg: { label: "mg", en: "mg" },
    "µg": { label: "µg", en: "µg" },
    L: { label: "L", en: "L" },
    mL: { label: "mL", en: "mL" },
    "µL": { label: "µL", en: "µL" },
    mol: { label: "mol", en: "mol" },
    mmol: { label: "mmol", en: "mmol" },
    "mol L⁻¹": { label: "mol L⁻¹", en: "mol L⁻¹" },
    "mmol L⁻¹": { label: "mmol L⁻¹", en: "mmol L⁻¹" },
    M: { label: "M", en: "M" },
    "g L⁻¹": { label: "g L⁻¹", en: "g L⁻¹" },
    "mg mL⁻¹": { label: "mg mL⁻¹", en: "mg mL⁻¹" },
    "mg mL^{-1}": { label: "mg mL⁻¹", en: "mg mL⁻¹" },
    "g L^{-1}": { label: "g L⁻¹", en: "g L⁻¹" },
    "A m⁻²": { label: "A m⁻²", en: "A m⁻²" },
    "A m^{-2}": { label: "A m⁻²", en: "A m⁻²" },
    "mA cm⁻²": { label: "mA cm⁻²", en: "mA cm⁻²" },
    "mA cm^{-2}": { label: "mA cm⁻²", en: "mA cm⁻²" },
    "mW cm⁻²": { label: "mW cm⁻²", en: "mW cm⁻²" },
    "mW cm^{-2}": { label: "mW cm⁻²", en: "mW cm⁻²" },
    "W m⁻²": { label: "W m⁻²", en: "W m⁻²" },
    "W m^{-2}": { label: "W m⁻²", en: "W m⁻²" },
    V: { label: "V", en: "V" },
    mV: { label: "mV", en: "mV" },
    A: { label: "A", en: "A" },
    mA: { label: "mA", en: "mA" },
    "µA": { label: "µA", en: "µA" },
    "Ω": { label: "Ω", en: "Ω" },
    "Ω cm": { label: "Ω cm", en: "Ω cm" },
    "S cm⁻¹": { label: "S cm⁻¹", en: "S cm⁻¹" },
    "S cm^{-1}": { label: "S cm⁻¹", en: "S cm⁻¹" },
    "F g⁻¹": { label: "F g⁻¹", en: "F g⁻¹" },
    "F g^{-1}": { label: "F g⁻¹", en: "F g⁻¹" },
    "mAh g⁻¹": { label: "mAh g⁻¹", en: "mAh g⁻¹" },
    "mAh cm⁻²": { label: "mAh cm⁻²", en: "mAh cm⁻²" },
    "Ah kg⁻¹": { label: "Ah kg⁻¹", en: "Ah kg⁻¹" },
    "Wh kg⁻¹": { label: "Wh kg⁻¹", en: "Wh kg⁻¹" },
    "Wh L⁻¹": { label: "Wh L⁻¹", en: "Wh L⁻¹" },
    "W kg⁻¹": { label: "W kg⁻¹", en: "W kg⁻¹" },
    "g cm⁻³": { label: "g cm⁻³", en: "g cm⁻³" },
    "m² g⁻¹": { label: "m² g⁻¹", en: "m² g⁻¹" },
    "J mol⁻¹": { label: "J mol⁻¹", en: "J mol⁻¹" },
    "kJ mol⁻¹": { label: "kJ mol⁻¹", en: "kJ mol⁻¹" },
    "W m⁻¹ K⁻¹": { label: "W m⁻¹ K⁻¹", en: "W m⁻¹ K⁻¹" },
    eV: { label: "eV", en: "eV" },
    Hz: { label: "Hz", en: "Hz" },
    rpm: { label: "rpm", en: "rpm" },
    Pa: { label: "Pa", en: "Pa" },
    kPa: { label: "kPa", en: "kPa" },
    MPa: { label: "MPa", en: "MPa" },
    bar: { label: "bar", en: "bar" },
    mbar: { label: "mbar", en: "mbar" },
    rad: { label: "rad", en: "rad" },
    "°": { label: "°", en: "°" },
    cycles: { label: "cycles", en: "cycles" },
    counts: { label: "counts", en: "counts" },
    dB: { label: "dB", en: "dB" },
  };

  var unitOptions = choices(unitValues, unitLabels);
  var massVolumeUnitOptions = choices(["kg", "g", "mg", "µg", "L", "mL", "µL"], unitLabels);
  var purityUnitOptions = choices(["%", "1"], unitLabels);
  var areaUnitOptions = choices(["nm²", "µm²", "mm²", "cm²", "m²"], unitLabels);
  var concentrationUnitOptions = choices([
    "mol L⁻¹",
    "mmol L⁻¹",
    "M",
    "g L⁻¹",
    "mg mL⁻¹",
    "mg mL^{-1}",
    "g L^{-1}",
  ], unitLabels);

  function field(key, label, en, type, required, extra) {
    var result = {
      key: key,
      label: label,
      en: en,
      type: type,
      required: Boolean(required),
    };
    if (extra) {
      Object.keys(extra).forEach(function copyExtra(name) {
        result[name] = extra[name];
      });
    }
    return Object.freeze(result);
  }

  function idField() {
    return field("id", "ID", "ID", "text", false, {
      role: "identifier",
      help: "중앙 서버가 발급합니다. 초안에서는 생략할 수 있습니다.",
    });
  }

  function refField(key, label, en, required, target) {
    return field(key, label, en, "text", required, {
      role: "identifier",
      references: target,
      help: "등록된 " + target + " ID를 입력합니다. 존재 여부는 서버가 확인합니다.",
    });
  }

  function enumField(key, label, en, required, options, extra) {
    var extras = Object.assign({ options: options }, extra || {});
    return field(key, label, en, "enum", required, extras);
  }

  function unitField(required, extra) {
    return field("unit", "단위", "Unit", "enum", required, Object.assign({ options: unitOptions }, extra || {}));
  }

  function valueFields(defaultTiming, defaultRole) {
    return [
      field("variable_name", "변수명", "Variable name", "text", true, {
        role: "metadata",
        help: "자체 변수는 이름 앞에 custom:을 붙이고 vocabulary_status를 pending으로 둡니다.",
      }),
      field("value_num", "수치값", "Numeric value", "number", false, {
        role: "measured",
        help: "유한한 실제 수치만 입력합니다. N/A와 -는 value_status로 기록합니다.",
      }),
      field("value_text", "텍스트값", "Text value", "text", false, {
        role: "measured",
        help: "단위나 조건 보충 설명입니다. measured 상태는 value_num도 가져야 합니다.",
      }),
      enumField("value_status", "값 상태", "Value status", true, missingStatusOptions, {
        role: "metadata",
        default: "",
      }),
      unitField(false, { role: "measured" }),
      enumField("role", "역할", "Role", true, roleOptions, {
        role: "metadata",
        default: defaultRole,
      }),
      enumField("timing", "시점", "Timing", true, timingOptions, {
        role: "metadata",
        default: defaultTiming,
        help: "설계·공정·측정 후를 구분하여 예측 시점 이후의 정보 누출을 확인합니다.",
      }),
      field("vocabulary_code", "표준어휘 코드", "Vocabulary code", "text", false, {
        role: "metadata",
        help: "현행 표준어휘집에서 확인한 코드만 입력합니다. 임의의 NCMRD 번호를 만들지 않습니다.",
      }),
      enumField("vocabulary_status", "어휘 매핑 상태", "Vocabulary status", true, vocabularyStatusOptions, {
        role: "metadata",
        default: "pending",
      }),
    ];
  }

  function table(key, label, fields, en) {
    return Object.freeze({ key: key, label: label, en: en, fields: Object.freeze(fields) });
  }

  var tables = Object.freeze({
    datasets: table("datasets", "데이터셋", [
      idField(),
      field("name", "데이터셋 이름", "Dataset name", "text", true, { role: "metadata" }),
      field("description", "설명", "Description", "long_text", false, { role: "metadata" }),
      field("group", "연구 그룹", "Research group", "text", true, {
        role: "metadata",
        help: "권한과 소유 그룹은 서버가 인증 계정과 대조합니다.",
      }),
      enumField("domain", "도메인", "Domain", true, domainOptions, { role: "metadata" }),
      field("prediction_target", "예측 대상", "Prediction target", "text", true, { role: "target" }),
      enumField("prediction_time", "예측 시점", "Prediction time", true, timingOptions, {
        role: "metadata",
        default: "design",
      }),
      enumField("split_unit", "분할 단위", "Split unit", true, splitUnitOptions, { role: "metadata" }),
      enumField("ownership", "소유권", "Ownership", true, ownershipOptions, { role: "metadata" }),
      field("owner_institution", "소유 기관", "Owner institution", "text", true, { role: "metadata" }),
      enumField("visibility", "공개 범위", "Visibility", true, visibilityOptions, {
        role: "metadata",
        default: "group",
      }),
      field("split_details", "분할 기준 설명", "Split details", "long_text", false, {
        role: "metadata",
        help: "custom 분할 단위를 선택하면 실제 그룹핑 기준을 적습니다.",
      }),
      field("embargo_date", "엠바고 종료일", "Embargo date", "date", false, { role: "metadata" }),
      field("embargo_basis", "엠바고 근거", "Embargo basis", "long_text", false, {
        role: "metadata",
        help: "논문·특허 등 엠바고 날짜를 판단한 근거를 기록합니다.",
      }),
      field("source_reference", "관련 문헌·특허", "Source reference", "text", false, { role: "metadata" }),
      field("keywords", "키워드", "Keywords", "text", false, { role: "metadata" }),
      field("created_date", "생성일", "Created date", "date", false, { role: "metadata" }),
      field("notes", "비고", "Notes", "long_text", false, { role: "metadata" }),
    ], "Dataset"),

    materials: table("materials", "소재", [
      idField(),
      refField("dataset_id", "데이터셋 ID", "Dataset ID", true, "dataset"),
      field("material_name", "소재명", "Material name", "text", true, { role: "metadata" }),
      field("material_type", "소재 유형", "Material type", "text", true, {
        role: "metadata",
        help: "도메인에 종속되지 않는 그룹의 자체 분류를 입력합니다.",
      }),
      field("chemical_formula", "화학식", "Chemical formula", "text", false, { role: "design" }),
      field("structure_representation", "구조 표현", "Structure representation", "long_text", false, {
        role: "design",
        help: "SMILES, InChI, 결정 구조 등 표현 방법을 함께 적습니다.",
      }),
      field("external_identifier", "외부 식별자", "External identifier", "text", false, { role: "identifier" }),
      enumField("source_type", "출처 유형", "Source type", false, sourceTypeOptions, { role: "metadata" }),
      field("source_origin", "출처·기원", "Source origin", "text", false, { role: "metadata" }),
      field("source_reference", "출처 참고문헌·문서", "Source reference", "text", false, { role: "metadata" }),
      refField("lot_id", "Lot ID", "Lot ID", false, "lot"),
      refField("measured_lot_id", "자체 측정 Lot ID", "Self-measured lot ID", false, "lot"),
      field("reference_properties", "참고 물성", "Reference properties", "long_text", false, {
        role: "design",
        help: "문헌·공급사·계산 등 참고값과 각각의 출처를 함께 기록합니다.",
      }),
      field("property_notes", "물성 메모", "Property notes", "long_text", false, { role: "metadata" }),
      field("notes", "비고", "Notes", "long_text", false, { role: "metadata" }),
    ], "Material"),

    lots: table("lots", "원료 Lot", [
      idField(),
      refField("dataset_id", "데이터셋 ID", "Dataset ID", true, "dataset"),
      refField("material_id", "소재 ID", "Material ID", true, "material"),
      field("lot_name", "Lot 이름·라벨", "Lot name or label", "text", true, { role: "identifier" }),
      field("supplier", "공급사", "Supplier", "text", false, { role: "metadata" }),
      field("supplier_lot", "공급사 Lot", "Supplier lot", "text", false, { role: "identifier" }),
      field("purity_num", "순도", "Purity", "number", false, { role: "measured" }),
      enumField("purity_status", "순도 상태", "Purity status", false, missingStatusOptions, { role: "metadata", default: "" }),
      field("purity_unit", "순도 단위", "Purity unit", "enum", false, { options: purityUnitOptions, role: "measured", default: "%" }),
      field("received_date", "입고일", "Received date", "date", false, { role: "metadata" }),
      field("opened_date", "개봉일", "Opened date", "date", false, { role: "metadata" }),
      field("storage_condition", "보관 조건", "Storage condition", "text", false, { role: "environment" }),
      field("quantity_num", "수량", "Quantity", "number", false, { role: "metadata" }),
      enumField("quantity_status", "수량 상태", "Quantity status", false, missingStatusOptions, { role: "metadata", default: "" }),
      field("quantity_unit", "수량 단위", "Quantity unit", "enum", false, { options: massVolumeUnitOptions, role: "metadata" }),
      field("origin", "원산·기원", "Origin", "text", false, { role: "metadata" }),
      field("lot_properties", "Lot 의존 물성", "Lot-dependent properties", "long_text", false, {
        role: "measured",
        help: "분자량·분산도·Tg 등 실제로 기록할 수 있는 Lot 의존 물성을 출처와 함께 적습니다.",
      }),
      field("notes", "비고", "Notes", "long_text", false, { role: "metadata" }),
    ], "Lot"),

    batches: table("batches", "조제·합성 배치", [
      idField(),
      refField("dataset_id", "데이터셋 ID", "Dataset ID", true, "dataset"),
      field("batch_name", "배치 이름·라벨", "Batch name or label", "text", true, { role: "identifier" }),
      enumField("batch_type", "배치 유형", "Batch type", true, batchTypeOptions, { role: "metadata" }),
      refField("material_id", "대표 소재 ID", "Material ID", false, "material"),
      refField("lot_id", "대표 Lot ID", "Lot ID", false, "lot"),
      field("preparation_date", "조제·합성일", "Preparation date", "date", false, { role: "metadata" }),
      field("description", "배치 설명", "Description", "long_text", false, { role: "metadata" }),
      field("amount_num", "조제량", "Amount", "number", false, { role: "process" }),
      enumField("amount_status", "조제량 상태", "Amount status", false, missingStatusOptions, { role: "metadata", default: "" }),
      field("amount_unit", "조제량 단위", "Amount unit", "enum", false, { options: massVolumeUnitOptions, role: "process" }),
      field("concentration_num", "농도", "Concentration", "number", false, { role: "process" }),
      enumField("concentration_status", "농도 상태", "Concentration status", false, missingStatusOptions, { role: "metadata", default: "" }),
      field("concentration_unit", "농도 단위", "Concentration unit", "enum", false, { options: concentrationUnitOptions, role: "process" }),
      field("solvent", "용매·매질", "Solvent or medium", "text", false, { role: "process" }),
      field("storage_condition", "보관 조건", "Storage condition", "text", false, { role: "environment" }),
      field("notes", "비고", "Notes", "long_text", false, { role: "metadata" }),
      enumField("result_status", "결과 상태", "Result status", false, resultStatusOptions, { role: "metadata", default: "planned" }),
      field("failure_reason", "실패 사유", "Failure reason", "long_text", false, { role: "metadata" }),
      field("exclusion_reason", "제외 사유", "Exclusion reason", "long_text", false, { role: "metadata" }),
    ], "Batch"),

    specimens: table("specimens", "시편·중간체", [
      idField(),
      refField("dataset_id", "데이터셋 ID", "Dataset ID", true, "dataset"),
      field("specimen_label", "시편 라벨", "Specimen label", "text", true, { role: "identifier" }),
      enumField("specimen_type", "시편 유형", "Specimen type", true, specimenTypeOptions, { role: "metadata" }),
      refField("parent_id", "상위 시편 ID", "Parent specimen ID", false, "specimen"),
      refField("batch_id", "배치 ID", "Batch ID", false, "batch"),
      refField("material_id", "소재 ID", "Material ID", false, "material"),
      refField("lot_id", "Lot ID", "Lot ID", false, "lot"),
      field("substrate", "기판", "Substrate", "text", false, { role: "design" }),
      field("geometry", "형상", "Geometry", "text", false, { role: "design" }),
      field("area_num", "유효 면적", "Active area", "number", false, { role: "design" }),
      enumField("area_status", "면적 상태", "Area status", false, missingStatusOptions, { role: "metadata", default: "" }),
      field("area_unit", "면적 단위", "Area unit", "enum", false, { options: areaUnitOptions, role: "design" }),
      field("position", "기판 내 위치", "Position on substrate", "text", false, { role: "design" }),
      field("created_date", "제작일", "Created date", "date", false, { role: "metadata" }),
      enumField("result_status", "결과 상태", "Result status", false, resultStatusOptions, { role: "metadata", default: "planned" }),
      field("failure_reason", "실패 사유", "Failure reason", "long_text", false, { role: "metadata" }),
      field("exclusion_reason", "제외 사유", "Exclusion reason", "long_text", false, { role: "metadata" }),
      field("status_note", "상태 메모", "Status note", "long_text", false, { role: "metadata" }),
    ], "Specimen or intermediate"),

    process: table("process", "공정 변수", [
      idField(),
      refField("dataset_id", "데이터셋 ID", "Dataset ID", true, "dataset"),
      refField("parent_id", "대상 ID", "Parent entity ID", true, "entity"),
      field("step_no", "단계 번호", "Step number", "integer", false, { role: "process" }),
      field("component_index", "성분 번호", "Component index", "integer", false, { role: "process" }),
      field("stage_name", "단계명", "Stage name", "text", true, { role: "process" }),
    ].concat(valueFields("process", "process")).concat([
      refField("lot_id", "원료 Lot ID", "Raw material Lot ID", false, "lot"),
      field("recorded_date", "기록일", "Recorded date", "date", false, { role: "metadata" }),
      field("notes", "비고", "Notes", "long_text", false, { role: "metadata" }),
    ]), "Process variable"),

    analysis: table("analysis", "분석·측정", [
      idField(),
      refField("dataset_id", "데이터셋 ID", "Dataset ID", true, "dataset"),
      refField("parent_id", "분석 대상 ID", "Parent entity ID", true, "entity"),
      field("measurement_id", "측정 ID", "Measurement ID", "text", true, { role: "identifier" }),
      enumField("analysis_type", "분석 레코드 유형", "Analysis record type", true, analysisTypeOptions, { role: "metadata" }),
    ].concat(valueFields("post_measurement", "measured")).concat([
      field("acquisition_conditions", "측정 조건", "Acquisition conditions", "long_text", false, { role: "environment" }),
      field("method", "방법·산출식", "Method or derivation", "long_text", false, {
        role: "metadata",
        help: "derived 값은 원본에서 도출한 계산식 또는 방법을 기록합니다.",
      }),
      field("equipment", "장비", "Equipment", "text", false, { role: "metadata" }),
      field("raw_reference", "원본 경로", "Raw reference path", "text", false, {
        role: "identifier",
        help: "원본 파일의 텍스트 경로만 기록합니다. 파일 업로드·Blob·URL은 계약에 포함하지 않습니다.",
      }),
    ]), "Analysis record"),

    performance: table("performance", "성능", [
      idField(),
      refField("dataset_id", "데이터셋 ID", "Dataset ID", true, "dataset"),
      refField("specimen_id", "시편 ID", "Specimen ID", true, "specimen"),
    ].concat([
      field("metric_name", "성능 지표", "Metric name", "text", true, { role: "target" }),
      field("value_num", "수치값", "Numeric value", "number", false, { role: "target", help: "유한한 실제 수치만 입력합니다." }),
      field("value_text", "텍스트값", "Text value", "text", false, { role: "target" }),
      enumField("value_status", "값 상태", "Value status", true, missingStatusOptions, { role: "metadata", default: "" }),
      unitField(false, { role: "target" }),
      enumField("role", "역할", "Role", true, roleOptions, { role: "metadata", default: "target" }),
      enumField("timing", "시점", "Timing", true, timingOptions, { role: "metadata", default: "post_measurement" }),
      field("replicate_n", "반복수 n", "Replicate count n", "integer", false, { role: "measured" }),
      field("stddev", "표준편차", "Standard deviation", "number", false, { role: "measured" }),
      enumField("aggregation", "집계 방식", "Aggregation", true, aggregationOptions, { role: "metadata", default: "individual" }),
      field("included_ids", "포함 개별 ID", "Included individual IDs", "text", false, {
        role: "identifier",
        help: "평균 집계에서는 개별 ID를 쉼표 또는 공백으로 구분합니다.",
      }),
      field("formula", "집계식", "Aggregation formula", "text", false, { role: "metadata" }),
      field("vocabulary_code", "표준어휘 코드", "Vocabulary code", "text", false, { role: "metadata" }),
      enumField("vocabulary_status", "어휘 매핑 상태", "Vocabulary status", true, vocabularyStatusOptions, { role: "metadata", default: "pending" }),
      field("acquisition_conditions", "측정 조건", "Acquisition conditions", "long_text", false, { role: "environment" }),
      field("method", "측정 방법", "Method", "long_text", false, { role: "metadata" }),
      field("equipment", "장비", "Equipment", "text", false, { role: "metadata" }),
      field("measurement_date", "측정일", "Measurement date", "date", false, { role: "metadata" }),
    ]), "Performance metric"),
  });

  function isMissing(value) {
    return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
  }

  function isValidDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    var parts = value.split("-").map(Number);
    var year = parts[0];
    var month = parts[1];
    var day = parts[2];
    if (year < 1 || month < 1 || month > 12 || day < 1) return false;
    var lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return day <= lastDay;
  }

  function hasFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function optionValues(fieldDefinition) {
    return (fieldDefinition.options || []).map(function optionValue(item) {
      return item && typeof item === "object" ? item.value : item;
    });
  }

  function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function pushError(errors, row, fieldName, message) {
    errors.push({ row: row, field: fieldName, message: message });
  }

  function validateType(value, definition) {
    if (definition.type === "text" || definition.type === "long_text") {
      return typeof value === "string" ? null : "must be text";
    }
    if (definition.type === "number") {
      return hasFiniteNumber(value) ? null : "must be a finite number";
    }
    if (definition.type === "integer") {
      return hasFiniteNumber(value) && Number.isInteger(value) ? null : "must be a finite integer";
    }
    if (definition.type === "date") {
      return isValidDate(value) ? null : "must be a real ISO date (YYYY-MM-DD)";
    }
    if (definition.type === "boolean") {
      return typeof value === "boolean" ? null : "must be true or false";
    }
    if (definition.type === "enum") {
      return optionValues(definition).indexOf(value) >= 0 ? null : "is not an allowed choice";
    }
    return "has an unsupported field type";
  }

  function validateBaseRow(definition, row, rowNumber, errors) {
    var present = hasOwn(row, definition.key);
    var value = row[definition.key];
    if (definition.required && (!present || isMissing(value))) {
      pushError(errors, rowNumber, definition.key, "is required");
      return;
    }
    if (!present || isMissing(value)) return;
    var typeMessage = validateType(value, definition);
    if (typeMessage) pushError(errors, rowNumber, definition.key, typeMessage);
  }

  function validateKnownFields(definition, row, rowNumber, errors) {
    var known = Object.create(null);
    definition.fields.forEach(function remember(fieldDefinition) {
      known[fieldDefinition.key] = true;
    });
    Object.keys(row).forEach(function checkUnknown(key) {
      if (!known[key] && key !== "id") {
        pushError(errors, rowNumber, key, "is not part of the shared schema");
      }
    });
  }

  function validateValueStatus(row, rowNumber, errors, tableKey) {
    if (!hasOwn(row, "value_status") || isMissing(row.value_status)) return;
    var status = row.value_status;
    var numeric = row.value_num;
    var text = row.value_text;
    var hasNumeric = !isMissing(numeric);
    var hasText = !isMissing(text);
    var isRawAnalysis = tableKey === "analysis" && row.analysis_type === "raw";
    if (status === "measured") {
      if (!isRawAnalysis && hasNumeric === hasText) {
        pushError(errors, rowNumber, "value_num", "measured rows require exactly one of value_num or value_text");
      }
      if (hasNumeric && hasFiniteNumber(numeric) && isMissing(row.unit)) {
        pushError(errors, rowNumber, "unit", "is required when a measured numeric value is provided");
      }
    } else if (hasNumeric || hasText) {
      if (hasNumeric) pushError(errors, rowNumber, "value_num", "must be empty when value_status is " + status);
      if (hasText) pushError(errors, rowNumber, "value_text", "must be empty when value_status is " + status);
    }
  }

  function validateVocabulary(row, rowNumber, errors) {
    if (!hasOwn(row, "vocabulary_status") || isMissing(row.vocabulary_status)) return;
    if (row.vocabulary_status === "verified" && isMissing(row.vocabulary_code)) {
      pushError(errors, rowNumber, "vocabulary_code", "is required for a verified mapping");
    }
    if (typeof row.variable_name === "string" && /^custom(?:[:._-]|$)/i.test(row.variable_name.trim()) && row.vocabulary_status !== "pending") {
      pushError(errors, rowNumber, "vocabulary_status", "custom variables must remain mapping pending");
    }
  }

  function validateUnitPair(row, rowNumber, errors, valueKey, unitKey) {
    if (!isMissing(row[valueKey]) && isMissing(row[unitKey])) {
      pushError(errors, rowNumber, unitKey, "is required when " + valueKey + " is provided");
    }
  }

  function validateOptionalNumericState(row, rowNumber, errors, valueKey, statusKey, unitKey) {
    var valuePresent = !isMissing(row[valueKey]);
    var statusPresent = !isMissing(row[statusKey]);
    if (valuePresent && row[statusKey] !== "measured") {
      pushError(errors, rowNumber, statusKey, "must be measured when " + valueKey + " is provided");
    }
    if (!valuePresent && row[statusKey] === "measured") {
      pushError(errors, rowNumber, valueKey, "is required when " + statusKey + " is measured");
    }
    if (valuePresent && !isMissing(row[unitKey]) && row[statusKey] === "measured") return;
    if (valuePresent && row[statusKey] === "measured" && isMissing(row[unitKey])) {
      pushError(errors, rowNumber, unitKey, "is required when " + valueKey + " is measured");
    }
    if (!valuePresent && statusPresent && !isMissing(row[unitKey])) {
      pushError(errors, rowNumber, unitKey, "must be empty when " + valueKey + " has no value");
    }
  }

  function validateDataset(row, rowNumber, errors) {
    if (!isMissing(row.embargo_date) && isMissing(row.embargo_basis)) {
      pushError(errors, rowNumber, "embargo_basis", "is required when embargo_date is provided");
    }
    if (row.visibility === "embargoed") {
      if (isMissing(row.embargo_date)) pushError(errors, rowNumber, "embargo_date", "is required for embargoed datasets");
      if (isMissing(row.embargo_basis)) pushError(errors, rowNumber, "embargo_basis", "is required for embargoed datasets");
    }
    if (row.split_unit === "custom" && isMissing(row.split_details)) {
      pushError(errors, rowNumber, "split_details", "is required for a custom split unit");
    }
  }

  function validateMaterial(row, rowNumber, errors) {
    if (row.source_type === "self_measured" && !isMissing(row.reference_properties) && isMissing(row.measured_lot_id) && isMissing(row.lot_id)) {
      pushError(errors, rowNumber, "measured_lot_id", "or lot_id is required for self-measured reference properties");
    }
  }

  function validateLot(row, rowNumber, errors) {
    validateOptionalNumericState(row, rowNumber, errors, "purity_num", "purity_status", "purity_unit");
    validateOptionalNumericState(row, rowNumber, errors, "quantity_num", "quantity_status", "quantity_unit");
  }

  function validateBatch(row, rowNumber, errors) {
    validateOptionalNumericState(row, rowNumber, errors, "amount_num", "amount_status", "amount_unit");
    validateOptionalNumericState(row, rowNumber, errors, "concentration_num", "concentration_status", "concentration_unit");
    validateResultStatus(row, rowNumber, errors, "batch");
  }

  function validateSpecimen(row, rowNumber, errors) {
    if (isMissing(row.parent_id) && isMissing(row.batch_id) && isMissing(row.lot_id) && isMissing(row.material_id)) {
      pushError(errors, rowNumber, "parent_id", "or batch_id, lot_id, or material_id is required");
    }
    validateOptionalNumericState(row, rowNumber, errors, "area_num", "area_status", "area_unit");
    validateResultStatus(row, rowNumber, errors, "specimen");
  }

  function validateResultStatus(row, rowNumber, errors, entityName) {
    if (row.result_status === "failed" && isMissing(row.failure_reason)) {
      pushError(errors, rowNumber, "failure_reason", "is required for failed " + entityName + "s");
    }
    if (row.result_status === "excluded" && isMissing(row.exclusion_reason)) {
      pushError(errors, rowNumber, "exclusion_reason", "is required for excluded " + entityName + "s");
    }
  }

  function isRawReferencePath(value) {
    return typeof value === "string" && value.trim() !== "" && !/^[a-z][a-z\d+.-]*:\/\//i.test(value.trim()) && !/^(?:data|blob|javascript):/i.test(value.trim());
  }

  function validateAnalysis(row, rowNumber, errors) {
    if (row.analysis_type === "acquisition") {
      if (isMissing(row.acquisition_conditions)) pushError(errors, rowNumber, "acquisition_conditions", "is required for acquisition records");
      if (isMissing(row.method)) pushError(errors, rowNumber, "method", "is required for acquisition records");
      if (isMissing(row.equipment)) pushError(errors, rowNumber, "equipment", "is required for acquisition records");
    }
    if (row.analysis_type === "raw" || row.analysis_type === "derived") {
      if (isMissing(row.raw_reference)) pushError(errors, rowNumber, "raw_reference", "is required for raw and derived records");
    }
    if (row.analysis_type === "derived" && isMissing(row.method)) {
      pushError(errors, rowNumber, "method", "is required for derived records");
    }
    if (!isMissing(row.raw_reference) && !isRawReferencePath(row.raw_reference)) {
      pushError(errors, rowNumber, "raw_reference", "must be a text path, not a URL or upload object");
    }
  }

  function validatePerformance(row, rowNumber, errors) {
    if (!isMissing(row.replicate_n) && hasFiniteNumber(row.replicate_n) && row.replicate_n < 1) {
      pushError(errors, rowNumber, "replicate_n", "must be at least 1");
    }
    if (!isMissing(row.stddev) && hasFiniteNumber(row.stddev) && row.stddev < 0) {
      pushError(errors, rowNumber, "stddev", "must be zero or greater");
    }
    if (row.value_status === "measured" && isMissing(row.replicate_n)) {
      pushError(errors, rowNumber, "replicate_n", "is required for measured performance");
    }
    if (row.value_status === "measured" && isMissing(row.acquisition_conditions)) {
      pushError(errors, rowNumber, "acquisition_conditions", "is required for measured performance");
    }
    if (row.aggregation === "mean") {
      if (isMissing(row.included_ids)) pushError(errors, rowNumber, "included_ids", "is required for mean aggregates");
      if (isMissing(row.formula)) pushError(errors, rowNumber, "formula", "is required for mean aggregates");
      if (!isMissing(row.included_ids) && typeof row.included_ids === "string" && /[^\s,]+/.test(row.included_ids) === false) {
        pushError(errors, rowNumber, "included_ids", "must contain one or more IDs separated by commas or spaces");
      }
    } else if (row.aggregation === "individual") {
      if (!isMissing(row.included_ids)) pushError(errors, rowNumber, "included_ids", "belongs only on aggregate rows");
      if (!isMissing(row.formula)) pushError(errors, rowNumber, "formula", "belongs only on aggregate rows");
    }
  }

  function validateRow(tableKey, row, rowNumber) {
    var errors = [];
    var definition = tables[tableKey];
    if (!definition) {
      pushError(errors, 0, "table", "unknown table: " + tableKey);
      return errors;
    }
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      pushError(errors, rowNumber, "row", "must be an object");
      return errors;
    }
    validateKnownFields(definition, row, rowNumber, errors);
    definition.fields.forEach(function validateField(fieldDefinition) {
      validateBaseRow(fieldDefinition, row, rowNumber, errors);
    });

    if (tableKey === "datasets") validateDataset(row, rowNumber, errors);
    if (tableKey === "materials") validateMaterial(row, rowNumber, errors);
    if (tableKey === "lots") validateLot(row, rowNumber, errors);
    if (tableKey === "batches") validateBatch(row, rowNumber, errors);
    if (tableKey === "specimens") validateSpecimen(row, rowNumber, errors);
    if (tableKey === "process" || tableKey === "analysis" || tableKey === "performance") {
      validateValueStatus(row, rowNumber, errors, tableKey);
      validateVocabulary(row, rowNumber, errors);
    }
    if (tableKey === "analysis") validateAnalysis(row, rowNumber, errors);
    if (tableKey === "performance") validatePerformance(row, rowNumber, errors);
    return errors;
  }

  function validateRows(tableKey, rows) {
    if (!tables[tableKey]) return [{ row: 0, field: "table", message: "unknown table: " + tableKey }];
    if (!Array.isArray(rows)) return [{ row: 0, field: "rows", message: "must be an array" }];
    return rows.reduce(function collect(errors, row, index) {
      return errors.concat(validateRow(tableKey, row, index + 1));
    }, []);
  }

  function normalizeRow(tableKey, row) {
    if (!tables[tableKey] || !row || typeof row !== "object" || Array.isArray(row)) return row;
    var normalized = Object.assign({}, row);
    tables[tableKey].fields.forEach(function canonicalize(fieldDefinition) {
      if ((fieldDefinition.type === "number" || fieldDefinition.type === "integer") && isMissing(normalized[fieldDefinition.key])) {
        normalized[fieldDefinition.key] = null;
      }
    });
    return normalized;
  }

  function normalizeRows(tableKey, rows) {
    if (!Array.isArray(rows)) return rows;
    return rows.map(function normalize(row) {
      return normalizeRow(tableKey, row);
    });
  }

  function fields(tableKey) {
    return tables[tableKey] ? tables[tableKey].fields : [];
  }

  function getTable(tableKey) {
    return tables[tableKey] || null;
  }

  return Object.freeze({
    version: version,
    types: types,
    tables: tables,
    roles: roles,
    domains: domains,
    timings: timings,
    units: unitValues,
    missingStatuses: missingStatuses,
    analysisTypes: analysisTypes,
    aggregationTypes: aggregationTypes,
    vocabularyStatuses: vocabularyStatuses,
    table: getTable,
    fields: fields,
    validateRow: validateRow,
    validateRows: validateRows,
    normalizeRow: normalizeRow,
    normalizeRows: normalizeRows,
  });
}));
