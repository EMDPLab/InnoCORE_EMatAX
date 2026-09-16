const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');const {test}=require('node:test');
const schema=require('../data-portal/schema.js');
const ctx={EMATAX_SCHEMA:schema};vm.createContext(ctx);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../data-portal/Code.gs'),'utf8'),ctx);
const refs={datasets:[{id:'DS-1'}],materials:[{id:'MAT-1'}],lots:[{id:'LOT-1'}],batches:[{id:'BAT-1'}],specimens:[{id:'SP-1',batch_id:'BAT-1'},{id:'SP-2',batch_id:'BAT-1'}]};
test('Foreign references use the field catalog and reject missing group records',()=>{
  assert.equal(ctx.referenceErrors_('lots',[{dataset_id:'DS-1',material_id:'MAT-1'}],refs).length,0);
  assert.equal(ctx.referenceErrors_('performance',[{dataset_id:'DS-1',specimen_id:'SP-OUTSIDE'}],refs)[0].field,'specimen_id');
  assert.equal(ctx.referenceErrors_('materials',[{dataset_id:'DS-1',measured_lot_id:'LOT-OUTSIDE'}],refs)[0].field,'measured_lot_id');
});
test('Specimen parents must be specimens and explicit batch must agree with parent',()=>{
  assert.equal(ctx.referenceErrors_('specimens',[{parent_id:'MAT-1'}],refs)[0].field,'parent_id');
  assert.ok(ctx.referenceErrors_('specimens',[{parent_id:'SP-1',batch_id:'BAT-OTHER'}],refs).some(e=>e.field==='batch_id'));
});
test('Aggregate identifiers are unique, registered, and match the repeat count',()=>{
  assert.equal(ctx.referenceErrors_('performance',[{included_ids:'SP-1, SP-2',replicate_n:2}],refs).length,0);
  assert.ok(ctx.referenceErrors_('performance',[{included_ids:'SP-1,SP-1',replicate_n:2}],refs).some(e=>e.field==='included_ids'));
  assert.ok(ctx.referenceErrors_('performance',[{included_ids:'SP-1,SP-2',replicate_n:3}],refs).some(e=>e.field==='replicate_n'));
});
test('Text cannot become a spreadsheet formula and literal measurements are not evaluated',()=>{
  assert.equal(ctx.safeText_('=IMPORTXML("https://example.com", "//x")'),'\'=IMPORTXML("https://example.com", "//x")');
  assert.equal(ctx.safeText_('CB → PVDF → AM'),'CB → PVDF → AM');
});
