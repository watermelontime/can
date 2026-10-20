// All rights reserved. (c) 2026 //
// ===================================================================================
// report_export.js
// Exports the current state of the CAN Register Evaluator as a single, self-contained
// HTML file ("Exported Report"). It inlines the stylesheet, bakes the current input
// values into the markup, keeps the already rendered inline SVGs, and embeds a small
// script so the report filter checkboxes stay functional in the exported file.
// ===================================================================================

// Checkbox id -> severity CSS classes that it controls (infoBold also controls calculation)
const REPORT_FILTER_MAP = {
  par_report_info: ['report-info'],
  par_report_infoVerbose: ['report-infoVerbose'],
  par_report_infoBold: ['report-infoBold', 'report-infoCalculation'],
  par_report_warning: ['report-warning'],
  par_report_error: ['report-error']
};

// ===================================================================================
// Public entry point: build and download the exported report HTML file.
// options.canIpModule : selected CAN module name (used for the file name)
// options.reportHtml  : report innerHTML rendered with ALL severities (so filtering works)
export async function downloadEvaluationReport({ canIpModule, reportHtml }) {
  // 1. Inline the stylesheet (same-origin fetch)
  let cssText = '';
  try {
    const res = await fetch('../styles.css', { cache: 'no-cache' });
    cssText = await res.text();
  } catch (err) {
    console.warn('[ReportExport] Could not fetch styles.css, export will be unstyled:', err);
  }

  // 2. Assemble the self-contained HTML document
  const htmlDoc = buildExportDocument(cssText, reportHtml);

  // 3. Trigger the download
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`; // YYYY-MM-DD
  const timeStr = `${pad(now.getHours())}_${pad(now.getMinutes())}_${pad(now.getSeconds())}`; // HH_MM_SS
  const fileName = `${(canIpModule || 'CAN').replace(/[^\w.-]/g, '_')}_report_${dateStr}_${timeStr}.html`;
  triggerDownload(htmlDoc, fileName);
}

// ===================================================================================
// Build the complete export HTML document string.
function buildExportDocument(cssText, reportHtml) {
  const pageHeaderHtml = buildPageHeader();
  const containerHtml = buildResponsiveContainer(reportHtml);

  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CAN Register Evaluator - Exported Report</title>
  <style>
${cssText}
  </style>
</head>

<body>

  <main>
${pageHeaderHtml}
${containerHtml}
  </main>

  <script>
${buildFilterScript()}
  </script>

</body>

</html>`;
}

// ===================================================================================
// Clone the page header, drop the interactive actions (copy link / help) and append
// " - Exported Report" to the visible title.
function buildPageHeader() {
  const live = document.querySelector('.page-header');
  if (!live) {
    return '<div class="page-header"><h1>CAN Register Evaluator - Exported Report</h1></div>';
  }
  const clone = live.cloneNode(true);

  // Remove the header actions (Copy link button + Help link): non-functional in a static file
  const actions = clone.querySelector('.header-actions');
  if (actions) actions.remove();

  // Append " - Exported Report" to the title heading
  const h1 = clone.querySelector('h1');
  if (h1) h1.appendChild(document.createTextNode(' - Exported Report'));

  return clone.outerHTML;
}

// ===================================================================================
// Clone the 3-column container and turn it into a static snapshot:
// - bake input values and checkbox states into the markup
// - keep the report filter checkboxes interactive
// - remove the "load example", "process register values" and "download" controls
// - insert the full (all severities) report into the report pane
function buildResponsiveContainer(reportHtml) {
  const live = document.querySelector('.responsive-container');
  if (!live) return '';
  const clone = live.cloneNode(true);

  // Bake input field values and checkbox states
  clone.querySelectorAll('input').forEach(input => {
    const liveInput = input.id ? document.getElementById(input.id) : null;
    if (!liveInput) return;

    if (input.type === 'checkbox') {
      if (liveInput.checked) {
        input.setAttribute('checked', '');
      } else {
        input.removeAttribute('checked');
      }
      // Keep the report filter checkboxes clickable; freeze all other checkboxes
      if (!input.id.startsWith('par_report_')) {
        input.setAttribute('disabled', '');
      }
    } else {
      input.setAttribute('value', liveInput.value);
      input.setAttribute('readonly', '');
    }
  });

  // Bake the selected CAN module and disable the dropdown
  const select = clone.querySelector('#canIpModuleSelect');
  if (select) {
    const liveSelect = document.getElementById('canIpModuleSelect');
    Array.from(select.options).forEach(opt => {
      if (liveSelect && opt.value === liveSelect.value) {
        opt.setAttribute('selected', '');
      } else {
        opt.removeAttribute('selected');
      }
    });
    select.setAttribute('disabled', '');
  }

  // Bake the memory dump text into the textarea and make it read-only
  const textarea = clone.querySelector('#userInputRegisterValues');
  if (textarea) {
    const liveTextarea = document.getElementById('userInputRegisterValues');
    textarea.textContent = liveTextarea ? liveTextarea.value : '';
    textarea.setAttribute('readonly', '');
  }

  // Remove interactive controls that have no function in a static export
  ['loadRegisterValuesExampleButton', 'processRegisterValuesButton', 'downloadReportLink']
    .forEach(id => {
      const el = clone.querySelector('#' + id);
      if (el) el.remove();
    });

  // Remove the bit-timing SVG/PNG download links (JS-only, non-functional when static)
  const btDownloads = clone.querySelector('.download-links');
  if (btDownloads) btDownloads.remove();

  // Insert the full report (all severities) so the filter checkboxes can show/hide lines
  const reportPre = clone.querySelector('#reportTextArea');
  if (reportPre && typeof reportHtml === 'string' && reportHtml.length > 0) {
    reportPre.innerHTML = reportHtml;
    reportPre.removeAttribute('readonly');
  }

  return clone.outerHTML;
}

// ===================================================================================
// Embedded script for the exported file: wires the report filter checkboxes so they
// show/hide the detail lines (summary lines stay visible). Self-contained, no imports.
function buildFilterScript() {
  const mapLiteral = JSON.stringify(REPORT_FILTER_MAP);
  return `    (function () {
      var map = ${mapLiteral};
      function apply() {
        Object.keys(map).forEach(function (id) {
          var cb = document.getElementById(id);
          if (!cb) return;
          var show = cb.checked;
          map[id].forEach(function (cls) {
            document.querySelectorAll('.report-detail.' + cls).forEach(function (el) {
              el.style.display = show ? '' : 'none';
            });
          });
        });
      }
      Object.keys(map).forEach(function (id) {
        var cb = document.getElementById(id);
        if (cb) cb.addEventListener('change', apply);
      });
      apply();
    })();`;
}

// ===================================================================================
// Helpers
// ===================================================================================

// Create a Blob from the HTML string and trigger a browser download.
function triggerDownload(htmlString, fileName) {
  const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
