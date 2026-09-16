# E-MatAX research data intake

This portal embeds a Google Apps Script HTML application in `data.html`. The bound Google Sheet stays private. Public hosting contains application source and the web-app URL, never researcher access codes or experimental records.

## Source and scope

The user-supplied v1.2 organic guide is a guide to **designing group-specific templates**, not a mandatory organic-device schema. The portal implements its shared principles: separate datasets, materials, lots, batches and specimens; long-form process, analysis and performance records; explicit units, roles, availability timing and missingness. Group-specific required variables and national vocabulary mappings still need curator review. No NCMRD identifiers are invented. NAS integration and binary file uploads are outside this release. A raw-file reference is metadata, not proof that a file exists.

## Runtime

- `schema.js`: shared browser/server field catalog and validation.
- `portal.html`, `portal.css`, `portal.js`: editable intake workspace.
- `Code.gs`: bound Apps Script backend. `connect` and `submitRows` require a valid researcher code or verified owner identity. Owner-management endpoints verify the Google owner identity independently; helpers end in `_` and cannot be called through `google.script.run`.
- `build.cjs`: assembles the same schema into the Apps Script source and inlines the portal assets for deployment. Generated files go outside the public repository by default.
- `config.js`: public `/exec` URL only.

The embedded application uses `google.script.run`, Google's supported HTML-service RPC. It does not treat an opaque `no-cors` request as confirmation of a save. A receipt is shown only after server validation, a locked write and record-ID readback. The same request ID and body can be retried without adding duplicate records; changing an already used request body is rejected.

## Administrator operation

1. Open the bound Google Sheet and run **initializePortal** in the bound script editor once. The setup creates the typed table headers, field dictionary, read-me and researcher registry, and is safe to rerun when headers match.
2. The owner can connect with a blank input code when Apps Script receives the owner's Google identity. The owner may also issue a researcher code if the browser does not pass that identity.
3. Open the **관리자 · 연구자 입력 코드 관리** panel at the bottom of the connected portal and use **입력 코드 발급** to register a researcher and their group. The secret is displayed once; only its SHA-256 hash is retained. Deliver the secret privately. Do not put it in website configuration, links, screenshots or this repository.
4. Researchers in the same group can see the group's reference IDs and labels. Names and email entered in the form are self-reported; a researcher code proves possession of that code, not Google sign-in.
5. Use **사용 중지** in that panel to stop an input code. Historical records remain. Researcher IDs are never recycled.
6. Do not share or publish the entire spreadsheet. Dataset visibility and embargo are metadata only; they do not change Google sharing permissions or publish records.

The ID and research values of submitted records are append-only through the portal. Correction requests should identify the original ID and be reviewed by the administrator; this first release has no research-record editing UI. Do not silently overwrite IDs or sheet headers.

## Validation and practical limits

One save contains 1–100 rows of one table. Required values, finite numbers, actual ISO dates, enumerations and conditional measurement requirements are checked in the browser and again on the server. Reference IDs must already exist in the authenticated group. Drafts are kept in memory and can be downloaded explicitly; access codes are not saved in local storage or draft files.

Writes are serialized with `LockService`. A single rectangular `setValues` write stores each submitted row together with its receipt ID and body hash. The application reads back assigned IDs before confirming success. This is an initial collection service, not a transactional database. Administrators should not edit table data while submissions are running. Google Apps Script runtime and Sheets size quotas still apply; migrate to a database when table scans or collection volume become significant.

Numeric cells remain numbers. Explicit missing states are stored separately. Text beginning with spreadsheet formula characters is written as literal text. Role labels and batch/specimen IDs enable later feature/target selection and group-aware splitting; collection alone does not certify a dataset ready for ML.

## Deployment

Use a container-bound Apps Script project. Google web apps require the spreadsheets OAuth scope for openById; a current-document-only grant cannot open the bound sheet in this execution context. The script requests Google Sheets access and the owner's email, then uses only the configured intake spreadsheet ID. It has no mail-send or Drive-file API. Add generated `Code.gs` and `Portal.html` to the project. Run `initializePortal` in the editor, then deploy as a web app executing as the owner. The public form still requires owner recognition or a valid researcher input code for every data operation.

Update an existing deployment to a new version after source changes. Paste its `/exec` URL into `config.js`, run the tests, then deploy the static site. Browser-check the embedded form and the direct app, valid and rejected submissions, retry behavior, and the actual Sheet row. A static-site deployment does not update Apps Script automatically.

Official references: [Apps Script web apps](https://developers.google.com/apps-script/guides/web), [HTML service communication](https://developers.google.com/apps-script/guides/html/communication), [current-document authorization](https://developers.google.com/apps-script/guides/services/authorization).
