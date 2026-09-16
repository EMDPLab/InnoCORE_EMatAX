const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const schemaPath = path.join(__dirname, "../data-portal/schema.js");
const schema = require(schemaPath);

function errorsFor(tableKey, row) {
  return schema.validateRows(tableKey, [row]);
}

function errorFields(tableKey, row) {
  return errorsFor(tableKey, row).map((error) => error.field);
}

function assertValid(tableKey, row) {
  assert.deepEqual(errorsFor(tableKey, row), [], `${tableKey} row should be valid`);
}

const dataset = {
  name: "Pilot scale-up dataset",
  description: "A small cross-group research dataset.",
  group: "platform-group",
  domain: "materials_process_ai",
  prediction_target: "device efficiency",
  prediction_time: "design",
  split_unit: "batch",
  ownership: "group",
  owner_institution: "DGIST",
  visibility: "group",
};

const material = {
  dataset_id: "DS-1",
  material_name: "Example material",
  material_type: "group-defined material class",
};

const lot = {
  dataset_id: "DS-1",
  material_id: "MAT-1",
  lot_name: "LOT-1",
};

const batch = {
  dataset_id: "DS-1",
  batch_name: "BATCH-1",
  batch_type: "mixture",
};

const specimen = {
  dataset_id: "DS-1",
  specimen_label: "SPEC-1",
  specimen_type: "film",
  batch_id: "BATCH-1",
};

const processMeasured = {
  dataset_id: "DS-1",
  parent_id: "BATCH-1",
  stage_name: "mixing",
  variable_name: "mixing_method",
  value_text: "manual stirring",
  value_status: "measured",
  role: "process",
  timing: "process",
  vocabulary_status: "pending",
};

const analysisAcquisition = {
  dataset_id: "DS-1",
  parent_id: "SPEC-1",
  measurement_id: "MEAS-1",
  analysis_type: "acquisition",
  variable_name: "temperature",
  value_num: 298.15,
  value_status: "measured",
  unit: "K",
  role: "environment",
  timing: "post_measurement",
  vocabulary_status: "pending",
  acquisition_conditions: "ambient, 1 atm",
  method: "thermocouple",
  equipment: "EQ-1",
};

const performanceMeasured = {
  dataset_id: "DS-1",
  specimen_id: "SPEC-1",
  metric_name: "efficiency",
  value_num: 12.4,
  value_status: "measured",
  unit: "%",
  role: "target",
  timing: "post_measurement",
  replicate_n: 3,
  aggregation: "individual",
  vocabulary_status: "pending",
  acquisition_conditions: "AM1.5G, 25 °C",
};

test("exports the shared contract and loads as a browser global", () => {
  assert.equal(schema.version, "1.0.0");
  assert.deepEqual(Object.keys(schema.tables), [
    "datasets",
    "materials",
    "lots",
    "batches",
    "specimens",
    "process",
    "analysis",
    "performance",
  ]);
  for (const table of Object.values(schema.tables)) {
    assert.equal(table.fields[0].key, "id");
    assert.equal(table.fields[0].required, false);
    assert.ok(Array.isArray(table.fields));
    for (const field of table.fields) {
      assert.deepEqual(Object.keys(field).slice(0, 5), ["key", "label", "en", "type", "required"]);
      if (field.options) {
        for (const option of field.options) {
          assert.deepEqual(Object.keys(option), ["value", "label", "en"]);
        }
      }
    }
  }

  const context = {};
  vm.runInNewContext(fs.readFileSync(schemaPath, "utf8"), context);
  assert.ok(context.EMATAX_SCHEMA);
  assert.equal(context.EMATAX_SCHEMA.version, schema.version);
  assert.deepEqual(Object.keys(context.EMATAX_SCHEMA.tables), Object.keys(schema.tables));
});

test("accepts valid rows for every table and keeps draft IDs optional", () => {
  assertValid("datasets", dataset);
  assertValid("materials", material);
  assertValid("lots", lot);
  assertValid("batches", batch);
  assertValid("specimens", specimen);
  assertValid("process", processMeasured);
  assertValid("analysis", analysisAcquisition);
  assertValid("performance", performanceMeasured);

  assertValid("datasets", { id: "DS-1", ...dataset, created_date: "2026-02-28" });
});

test("reports missing required fields with one-based row numbers and rejects unknown keys", () => {
  const errors = schema.validateRows("datasets", [{ name: "missing metadata", unexpected: true }, null]);
  assert.ok(errors.some((error) => error.row === 1 && error.field === "group"));
  assert.ok(errors.some((error) => error.row === 1 && error.field === "domain"));
  assert.ok(errors.some((error) => error.row === 1 && error.field === "unexpected"));
  assert.ok(errors.some((error) => error.row === 2 && error.field === "row"));
  assert.deepEqual(schema.validateRows("no-such-table", []), [
    { row: 0, field: "table", message: "unknown table: no-such-table" },
  ]);
  assert.deepEqual(schema.validateRows("datasets", {}), [
    { row: 0, field: "rows", message: "must be an array" },
  ]);
});

test("validates finite numeric values and real ISO calendar dates", () => {
  const invalid = {
    ...dataset,
    created_date: "2026-02-29",
    embargo_date: "2026-13-01",
  };
  const errors = errorsFor("datasets", invalid);
  assert.ok(errors.some((error) => error.field === "created_date"));
  assert.ok(errors.some((error) => error.field === "embargo_date"));

  const badAnalysis = {
    ...analysisAcquisition,
    value_num: Number.POSITIVE_INFINITY,
    measurement_id: 42,
  };
  const badFields = errorFields("analysis", badAnalysis);
  assert.ok(badFields.includes("value_num"));
  assert.ok(badFields.includes("measurement_id"));
  assert.ok(errorFields("lots", { ...lot, purity_num: "N/A", purity_status: "measured", purity_unit: "%" }).includes("purity_num"));
});

test("preserves the three missing-value states and supports categorical process values", () => {
  assertValid("process", processMeasured);
  assertValid("process", {
    ...processMeasured,
    variable_name: "custom:visual_observation",
    value_num: undefined,
    value_text: "cloudy",
    value_status: "measured",
  });
  assertValid("process", {
    ...processMeasured,
    value_num: null,
    value_text: null,
    value_status: "not_applicable",
  });
  assertValid("process", {
    ...processMeasured,
    value_num: null,
    value_text: null,
    value_status: "not_measured",
  });

  assert.ok(errorFields("process", { ...processMeasured, value_num: 3, value_text: "three" }).includes("value_num"));
  assert.ok(errorFields("process", { ...processMeasured, value_num: 3, value_text: undefined }).includes("unit"));
  assert.ok(errorFields("process", { ...processMeasured, value_num: 3, value_text: undefined, value_status: "not_measured" }).includes("value_num"));
  assert.ok(errorFields("process", { ...processMeasured, value_num: undefined, value_text: undefined }).includes("value_num"));
  assert.ok(errorFields("process", { ...processMeasured, variable_name: "custom:foo", vocabulary_status: "verified", value_num: 3, unit: "1", vocabulary_code: "M999" }).includes("vocabulary_status"));
});

test("enforces numeric status and domain units for supplementary measurements", () => {
  assertValid("lots", {
    ...lot,
    purity_num: 99.5,
    purity_status: "measured",
    purity_unit: "%",
    quantity_num: 10,
    quantity_status: "measured",
    quantity_unit: "g",
  });
  assert.ok(errorFields("lots", { ...lot, purity_num: 99.5, purity_status: "measured", purity_unit: "K" }).includes("purity_unit"));
  assert.ok(errorFields("lots", { ...lot, quantity_num: 10, quantity_status: "not_measured", quantity_unit: "g" }).includes("quantity_status"));
  assertValid("batches", {
    ...batch,
    amount_num: 4,
    amount_status: "measured",
    amount_unit: "mL",
    concentration_num: 0.2,
    concentration_status: "measured",
    concentration_unit: "M",
  });
  assert.ok(errorFields("batches", { ...batch, concentration_num: 0.2, concentration_status: "measured", concentration_unit: "g" }).includes("concentration_unit"));
  assert.ok(errorFields("specimens", { ...specimen, area_num: 4, area_status: "measured", area_unit: "mL" }).includes("area_unit"));
});

test("accepts common energy-storage capacity and energy units", () => {
  for (const unit of ["mAh g⁻¹", "mAh cm⁻²", "Ah kg⁻¹", "Wh kg⁻¹", "Wh L⁻¹", "W kg⁻¹", "g cm⁻³", "m² g⁻¹", "J mol⁻¹", "kJ mol⁻¹", "W m⁻¹ K⁻¹"]) {
    assertValid("performance", {
      ...performanceMeasured,
      metric_name: "energy-storage metric",
      unit,
    });
  }
});

test("requires the references and preserves failure or exclusion reasons", () => {
  assert.ok(errorFields("specimens", {
    dataset_id: "DS-1",
    specimen_label: "orphan",
    specimen_type: "film",
  }).includes("parent_id"));
  assertValid("specimens", { ...specimen, result_status: "failed", failure_reason: "delamination" });
  assert.ok(errorFields("specimens", { ...specimen, result_status: "excluded" }).includes("exclusion_reason"));
  assertValid("batches", { ...batch, result_status: "failed", failure_reason: "gelled" });
  assert.ok(errorFields("batches", { ...batch, result_status: "excluded" }).includes("exclusion_reason"));

  assert.ok(errorFields("materials", {
    ...material,
    source_type: "self_measured",
    reference_properties: "band gap",
  }).includes("measured_lot_id"));
  assertValid("materials", {
    ...material,
    source_type: "self_measured",
  });
});

test("validates analysis record dependencies and raw paths without accepting uploads", () => {
  assertValid("analysis", {
    ...analysisAcquisition,
    analysis_type: "raw",
    value_num: null,
    value_status: "measured",
    raw_reference: "raw/MEAS-1.csv",
    acquisition_conditions: undefined,
    method: undefined,
    equipment: undefined,
  });
  assertValid("analysis", {
    ...analysisAcquisition,
    analysis_type: "derived",
    raw_reference: "raw/MEAS-1.csv",
    method: "RMS = sqrt(mean((x - mean(x))^2))",
  });
  assert.ok(errorFields("analysis", { ...analysisAcquisition, analysis_type: "raw", raw_reference: undefined }).includes("raw_reference"));
  assert.ok(errorFields("analysis", { ...analysisAcquisition, analysis_type: "derived", raw_reference: "https://example.invalid/raw.csv" }).includes("raw_reference"));
  assert.ok(errorFields("analysis", { ...analysisAcquisition, analysis_type: "acquisition", equipment: undefined }).includes("equipment"));
});

test("requires performance measurement context and aggregate provenance", () => {
  assert.ok(errorFields("performance", { ...performanceMeasured, acquisition_conditions: undefined }).includes("acquisition_conditions"));
  assert.ok(errorFields("performance", { ...performanceMeasured, replicate_n: 0 }).includes("replicate_n"));
  assertValid("performance", {
    ...performanceMeasured,
    aggregation: "mean",
    included_ids: "SPEC-1, SPEC-2 SPEC-3",
    formula: "mean(value_num)",
    measurement_date: "2026-09-16",
  });
  assert.ok(errorFields("performance", { ...performanceMeasured, aggregation: "mean" }).includes("included_ids"));
  assert.ok(errorFields("performance", { ...performanceMeasured, aggregation: "individual", included_ids: "SPEC-1" }).includes("included_ids"));
});

test("normalizes optional numeric blanks on a copy and leaves the input untouched", () => {
  const row = { ...batch, amount_num: "", concentration_num: "" };
  const normalized = schema.normalizeRow("batches", row);
  assert.equal(normalized.amount_num, null);
  assert.equal(normalized.concentration_num, null);
  assert.equal(row.amount_num, "");
  assert.equal(row.concentration_num, "");
  assert.notEqual(normalized, row);
});
