// TODOs
// TODO: use the same function for PRT register decoding of X_CAN, XS_CAN, and X_CANB (decode individual registers via separate functions) => use shared library file reg_eval/x_can_prt.js
//       THIS file nows all three modules?
// TODO: add version number and version history that is shown on HTML
// TODO: better structure reg-object: problem/ugly: non-register fields are mixed with registers (flat) => non-reg stuff should be separted
// TODO: donate button
// TODO: Valiation report severity level: rename highlighted to bold

// ===================================================================
// === HOW TO ADD NEW CAN IP MODULE? =================================
// This is how to add a new CAN IP Module to the register evaluation tool.
// STEP A ###### Create <module_name>_main.js file in reg_eval/ folder.
// 1. Export these data structures:
//    - regAddrMap: Object that maps <local register addresses> to <register names> and <long register names>
//    - resAddrArray: Array of reserved address ranges {lowerResAddr, upperResAddr}
//    - regLocalAddrMask: Mask to extract local register address from full address in user memory dump (e.g., 0x000001FF)
// 2. Export these functions to decode the registers:
//    - processRegs(reg): Function that takes the reg object with named registers and decodes the registers
//    - loadExampleRegisterValues(): Function that returns example register values and CAN clock frequency
// 3. reg object (Result)
//    - HINT: all the results (decoded values, reports) are stored in the object called reg
//    - MANDATORY data structures in reg-object
//      (Reason: These are human readable values to visualize content in HTML/SVG)
//      * reg.<REGNAME>.report[] must contain report entries for register <REGNAME>
//      * reg.general.bt_arb    ==> information about arbitration phase ()
//      * reg.general.bt_datxl  ==> information about FD data phase
//      * reg.general.bt_datfd  ==> information about XL data phase
//      * reg.general.bt_global ==> information about global settings
//      => see X_CAN as example for detailed names and formats of these data structures
//    - RULE: ~ only assign reg.general.* values if they are meaningful
//            ~ do not create values, if a) according registers are not present
//                                       b) configuration disables a feature (e.g. TMS=OFF => then do not provide PWM settings & results)
// STEP B ###### Modify this file script_main.js:
//   1. Import the new module file *.js
//   2. Extend the processUserRegisterValues() function to call the new module's functions if user selects <NEWMODULE>
//   3. Extend the loadRegisterValuesExample() function to call the new module's example register values function if user selects <NEWMODULE>
//
// STEP C ###### Update the HTML file index.html:
//   1. Update the CAN Module select field to include the new module name <NEWMODULE>
// ===================================================================


// import functions
import * as draw_svg from '../draw_bits_svg.js'; // SVG drawing functions for bit timing
import * as m_can from './m_can.js';
import * as x_can from './x_can_main.js';
import * as x_canb from './x_canb_main.js';
import * as xs_can from './xs_can_main.js';
import { sevC, clearObject } from './help_functions.js';

// global variable definitions
let par_clk_freq_g = 160; // Global variable for CAN clock frequency in MHz

// Initialize GLOBAL register result object
let reg = {};

// Application version shown next to the page title
const APP_VERSION = 'V1.0.0';

// initialize report verbosity object
const reportVerbosity = {
  info: false,
  infoVerbose: false,
  infoHighlighted: false,
  calculation: false,
  recommendation: false,
  warning: false,
  error: false
};

const floatParams = [
  'par_clk_freq'
];

// Report Verbosity: filter checkboxes (must match IDs in index.html)
const checkboxReportVerbosityParams = [
  'par_report_infoVerbose',
  'par_report_info',
  'par_report_infoHighlighted',
  //'par_report_calculation',    // switched together with infoHighlighted
  //'par_report_recommendation', // switched together with infoHighlighted
  'par_report_warning',
  'par_report_error'
];

const checkboxParams = [
  'par_tms_datxl',
  'par_tdc_datfdxl'
];

const floatResults = [
  'res_clk_period',
  'res_bitrate_arb',
  'res_bitrate_datfd',
  'res_bitrate_datxl',
  'res_sp_arb',
  'res_sp_datxl',
  'res_sp_datfd',
  'res_ssp_datfd',
  'res_ssp_datxl',
  'res_tqlen_arb',
  'res_tqlen_datfd',
  'res_tqlen_datxl',
  'res_pwm_symbol_len_ns_datxl'
];

// when document is loaded: initialize page
document.addEventListener('DOMContentLoaded', init);

// ===================================================================================
// Initialisation when website is loaded
function init() {
  // set eventlistener: when parameter changes => calculate
  initEventListeners();

  // Initialize the clock frequency input field with default value
  initializeClockFrequencyHtmlField();

  // Show application version next to title
  const versionEl = document.getElementById('appVersion');
  if (versionEl) {
    versionEl.textContent = APP_VERSION;
  } else {
    console.warn('[Warning] Version element with id "appVersion" not found in HTML');
  }

  // draw empty SVGs, so it looks better
  let dummyReg = {};
  displaySVGs(dummyReg);

  // read verbosity checkboxes from HTML
  getReportVerbositySettingFromHTML(reportVerbosity);
}

// ===================================================================================
// Event-Listener activation
function initEventListeners() {
  // HTML BUTTON: Add event listener for the process register values button
  const processButton = document.getElementById('processRegisterValuesButton');
  if (processButton) {
    processButton.addEventListener('click', processUserRegisterValues);
  } else {
    console.warn('[Warning] Process register button not found in HTML');
  }

  // HTML BUTTON: Add event listener for the load register values example button
  const loadExampleButton = document.getElementById('loadRegisterValuesExampleButton');
  if (loadExampleButton) {
    loadExampleButton.addEventListener('click', loadRegisterValuesExample);
  } else {
    console.warn('[Warning] Load example register button not found in HTML');
  }

  // HTML CLK_FREQ INPUT: Add event listener for the CAN clock frequency input field
  const clkFreqHtmlField = document.getElementById('par_clk_freq');
  if (clkFreqHtmlField) {
    clkFreqHtmlField.addEventListener('change', handleClockFrequencyChange); // fires when focus leaves field
    //clkFreqHtmlField.addEventListener('input', handleClockFrequencyChange); // fires when input changes (during typing)
  } else {
    console.warn('[Warning] Clock frequency input field not found in HTML');
  }

  // HTML Verbosity checkboxes: Add event listeners for the report verbosity checkboxes
  checkboxReportVerbosityParams.forEach(param => {
    const checkbox = document.getElementById(param);
    if (checkbox) {
      checkbox.addEventListener('change', (event) => {
        getReportVerbositySettingFromHTML(reportVerbosity);
        // Refresh report view without re-processing registers: condition = reg object exists = user already processed registers once
        console.log(`[Info] Report reg object = `, reg);
        // check if reg object has content, means the register values were already processed once
        if (reg.general) {
          displayValidationReport(reg, reportVerbosity);
        }
      });
    } else {
      console.warn(`[Warning] Verbosity checkbox "${param}" not found in HTML`);
    }
  });
}

// ===================================================================================
// Handle clock frequency change event
function handleClockFrequencyChange(event) {
  const newValue = parseFloat(event.target.value);
  const clkFreqField = event.target;
  
  // Update global variable with the new value from HTML
  if (!isNaN(newValue) && newValue > 0) {
    par_clk_freq_g = newValue;
    console.log(`[Info] Clock frequency updated to: ${par_clk_freq_g} MHz`);
    
    // Remove error highlighting if value is valid
    clkFreqField.classList.remove("input-error");
    
    // Update Clock Period in HTML (calculated)
    const clkPeriodHtmlField = document.getElementById('res_clk_period');
    clkPeriodHtmlField.value = (1000.0 / par_clk_freq_g).toFixed(2); // in ns

  } else {
    console.warn('[Warning] Invalid clock frequency value:', event.target.value);
    // Add error highlighting to the input field
    clkFreqField.classList.add("input-error");
  }
}

// ===================================================================================
// Initialize the clock frequency input field with default value
function initializeClockFrequencyHtmlField() {
  const clkFreqHtmlField = document.getElementById('par_clk_freq');
  if (clkFreqHtmlField) {
    // Set the input field to the global variable value (default 160 MHz)
    clkFreqHtmlField.value = par_clk_freq_g;
    console.log(`[Info] Initialized HTML clock frequency field to: ${par_clk_freq_g} MHz`);
    // trigger change event (reason: the change will cause the clock period to be updated in HTML)
    clkFreqHtmlField.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    console.warn('[Warning] initializeClockFrequencyHtmlField(): Clock frequency input field not found in HTML');
  }
}

// ===================================================================================
// parseUserRegisterValues: Parse text and generate raw register array with addr and value
function parseUserRegisterValues(userRegText, reg) {
  // Initialize parse output in reg object
  reg.parse_output = {
    report: [],
  };
  
  // Initialize raw register array
  reg.raw = [];
  
  // counter variable
  let dumpLinesCountBlank = 0;
  let dumpLinesCountComment = 0;
  let dumpLinesCountValuesValid = 0;
  let dumpLinesCountInvalid = 0;

  const lines = userRegText.split('\n');
  const dumpLinesCountTotal = lines.length;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for blank lines => ignore them
    if (trimmedLine.length === 0) {
      // statistics
      dumpLinesCountBlank++;
      continue;
    }

    // Check if line is a comment (starts with '#')
    if (trimmedLine.startsWith('#')) {
      // Ignore comment lines - add info report for visibility
      reg.parse_output.report.push({
        severityLevel: sevC.infoVerbose,
        msg: `Ignored comment "${trimmedLine}"`
      });
      // statistics
      dumpLinesCountComment++;
      continue; // Skip to next line
    }
    
    // Decode line
    // Expected format: <address><space><register value>, e.g.: "0x000 0x87654321" or "000 87654321"
    const match = trimmedLine.match(/^(0x)?([0-9a-fA-F]+)\s+(0x)?([0-9a-fA-F]+)$/);
    if (match) {
      const addrHex = match[2];
      const valueHex = match[4];
      
      const addrValue = parseInt(addrHex, 16);
      const intValue = parseInt(valueHex, 16);
      
      if (!isNaN(addrValue) && !isNaN(intValue)) {
        // Valid Input: Store in raw register array
        reg.raw.push({
          addr: addrValue,
          value_int32: intValue
        });
        
        reg.parse_output.report.push({
          severityLevel: sevC.infoVerbose,
          msg: `Found line:     0x${addrHex.toUpperCase()}: 0x${valueHex.toUpperCase()}`
        });
        // statistics
        dumpLinesCountValuesValid++;
      } else {
        // Invalid Input
        reg.parse_output.report.push({
          severityLevel: sevC.error,
          msg: `Invalid hex values in line: "${trimmedLine}"`
        });
        // statistics
        dumpLinesCountInvalid++;
      }
    } else {
      reg.parse_output.report.push({
        severityLevel: sevC.error,
        msg: `Invalid line format: "${trimmedLine}". Expected format: "<address><space><value>, e.g. 0x0123 0x87654321"`
      });
      // statistics
      dumpLinesCountInvalid++;
    }
  } 
  // Add summary message
  const registerCount = reg.raw.length;
  if (registerCount > 0) {
    reg.parse_output.report.push({
      severityLevel: sevC.info, // info
      msg: `Raw registers parsed successfully: ${registerCount}`
    });
  }

  // add statistics to parse_output
  reg.parse_output.statistic = {};
  reg.parse_output.statistic.parse = {
    linesTotalCount: dumpLinesCountTotal,
    linesBlankCount: dumpLinesCountBlank,
    linesCommentCount: dumpLinesCountComment,
    linesValuesValidCount: dumpLinesCountValuesValid,
    linesInvalidFormatCount: dumpLinesCountInvalid
  };
}

// ===================================================================================
// Map raw register addresses to register names and create named register structure
function mapRawRegAddrToNames(reg, myRegAddrMap, myResAddrArray, myRegLocalAddrMask) {
  // Step 1: map addresses to register names
  // Step 2: check for duplicate register addresses
  // Step 3: check if reserved addresses present

  // Check if parse_output exists (in reg object)
  if (!reg.parse_output) {
    console.warn('[Warning, mapRawRegistersToNames()] reg.parse_output not found in reg object. Skipping mapping of <raw registers> to <names>. parseUserRegisterValues(userRegText, reg) must be called before this function.');
    return;
  }
  
  let mappedRegCount = 0;
  let unmappedRegCount = 0;
  let reservedRegCount = 0;
  let missingRegCount = 0;
  
  // calculate number of nibbles of myRegLocalAddrMask (neeeded for porper hex-address printing)
  const localAddNibCnt = myRegLocalAddrMask.toString(16).length;
  console.log(`[mapRawRegAddrToNames] Local address nibble count: ${localAddNibCnt}`);

  // Mapping: Process each raw register entry
  for (const rawReg of reg.raw) {
    const rawRegLocalAddr = rawReg.addr & myRegLocalAddrMask
    
    // Step 1: map addresses to register names
    const mapping = myRegAddrMap[rawRegLocalAddr];
    if (mapping) {
      // Step 2: Check if this address is a duplicate (ocurring a second time)
      if (reg[mapping.shortName]) {
        // duplicate found, ignore it and warn user
        reg.parse_output.report.push({
          severityLevel: sevC.error,
          msg: `Duplicate addr.: 0x${rawReg.addr.toString(16).toUpperCase().padStart(localAddNibCnt, '0')} (=> local address 0x${rawRegLocalAddr.toString(16).toUpperCase().padStart(localAddNibCnt, '0')}). The duplicate will be ignored.`
        });
        continue;
      } else {
        // No duplicate found, proceed with mapping
        // Create named register structure
        const regName = mapping.shortName;
        reg[regName] = {
          int32: rawReg.value_int32,
          name_long: mapping.longName,
          addr: rawReg.addr
        };

        mappedRegCount++;
        reg.parse_output.report.push({
          severityLevel: sevC.infoVerbose,
          msg: `Mapped   addr.: 0x${rawReg.addr.toString(16).toUpperCase().padStart(localAddNibCnt, '0')} to ${regName} (${mapping.longName})`
        });
      }

    // Step 3: check if reserved addresses present
    } else if (isReserved(rawRegLocalAddr, myResAddrArray)) {
      // it is a reserved address
      reservedRegCount++;
      reg.parse_output.report.push({
        severityLevel: sevC.infoVerbose,
        msg: `Reserved addr.: 0x${rawReg.addr.toString(16).toUpperCase().padStart(localAddNibCnt, '0')} - register will be ignored`
      });
    } else {
      // Unknown address
      unmappedRegCount++;
      reg.parse_output.report.push({
        severityLevel: sevC.warning,
        msg: `Unknown  addr.: 0x${rawReg.addr.toString(16).toUpperCase().padStart(localAddNibCnt, '0')} - register will be ignored`
      });
    }
  }
  
  // Add summary message
  reg.parse_output.report.push({
    severityLevel: sevC.info,
    msg: `Address mapping completed: ${mappedRegCount} reg. found, ${reservedRegCount} addr. reserved, ${unmappedRegCount} addr. unknown`
  });
  
  // Find the longest register name (shortName) to format missing register report nicely
  let longestRegNameLength = 0;
  for (const addr in myRegAddrMap) {
    const regName = myRegAddrMap[addr].shortName;
    longestRegNameLength = Math.max(longestRegNameLength, regName.length);
  }

  // report missing registers in register dump
  //    compare reg-object with registers in addressMap
  let missingRegTextArray = [];
  for (const addr in myRegAddrMap) {
    const regName = myRegAddrMap[addr].shortName;
    if (!(regName in reg)) {
      // Register is NOT present in reg object
      const addrNum = Number(addr); // convert key to number for hex formatting
      missingRegTextArray.push(`0x${addrNum.toString(16).toUpperCase().padStart(localAddNibCnt, '0')}: ${regName.padEnd(longestRegNameLength, ' ')} (${myRegAddrMap[addr].longName})`);
      missingRegCount++;
    }
  }
  
  if (missingRegCount > 0) {
    reg.parse_output.report.push({
      severityLevel: sevC.warning,
      msg: `Missing registers in memory dump (amount: ${missingRegCount}):\n` + 
           missingRegTextArray.join('\n')
    });
  }

  // store counters in reg.parse_output
  reg.parse_output.statistic.map = {
    mappedRegCount:   mappedRegCount,
    reservedRegCount: reservedRegCount,
    unmappedRegCount: unmappedRegCount,
    missingRegCount:  missingRegCount
  };

} // end mapRawRegistersToNames

// ===================================================================================
// Check if an address is within the reserved M_CAN address ranges
// Only word-aligned addresses (step = 4 bytes) are considered to be in reserved address range
function isReserved(addr, myResAddrArray) {
  // Not a word-aligned address -> treat as not reserved (register map is word-based)
  if ((addr & 0x3) !== 0) {
    return false;
  }

  for (const range of myResAddrArray) {
    if (addr >= range.lowerResAddr && addr <= range.upperResAddr) {
      return true;
    }
  }
  return false;
}

// ===================================================================================
// displayValidationReport: Format and display validation reports in HTML with colors
function displayValidationReport(reg, reportVerbosity) {
  const reportTextArea = document.getElementById('reportTextArea');
  if (!reportTextArea) {
    console.warn('[Warning] displayValidationReport(): Report textarea not found in HTML');
    return;
  }
  
  // Clear previous content
  reportTextArea.innerHTML = '';
  
  // Collect ALL reports unfiltered first (decision to print is done later)
  const allReports = [];
  if (reg && typeof reg === 'object') {
    Object.values(reg).forEach(regSection => {
      if (!regSection || !Array.isArray(regSection.report)) return;
      for (const reportInstance of regSection.report) {
        allReports.push(reportInstance);
      }
    });
  }

  // Helper function to get severity level text
  function getSeverityText(level) {
    switch (level) {
      case sevC.info: return 'I';
      case sevC.infoVerbose: return 'V';
      case sevC.infoHighlighted: return 'H';
      case sevC.calculation: return 'C';
      case sevC.recommendation: return 'R';
      case sevC.warning: return 'W';
      case sevC.error: return 'E';
      default: return 'UNKNOWN';
    }
  }
  
  // Helper function to get severity symbol
  function getSeveritySymbol(level) {
    switch (level) {
      case sevC.info: return 'ℹ️';
      case sevC.infoVerbose: return 'ℹ️';
      case sevC.infoHighlighted: return 'ℹ️';
      case sevC.calculation: return '🧮';
      case sevC.recommendation: return '💡';
      case sevC.warning: return '⚠️';
      case sevC.error: return '❌';
      default: return '❓';
    }
  }

  // Helper function to get CSS class for severity level
  function getSeverityClass(level) {
    switch (level) {
      case sevC.info: return 'report-info';
      case sevC.infoVerbose: return 'report-infoVerbose';
      case sevC.infoHighlighted: return 'report-infoHighlighted';
      case sevC.calculation: return 'report-infoCalculation';
      case sevC.recommendation: return 'report-recommendation';
      case sevC.warning: return 'report-warning';
      case sevC.error: return 'report-error';
      default: return 'report-info';
    }
  }
  
  // Count reports by severity (always based on allReports, not filtered)
  const counts = { info: 0, infoV: 0, infoH: 0, calc: 0, recom: 0, warn: 0, errors: 0};
  allReports.forEach(report => {
    switch (report.severityLevel) {
      case sevC.info: counts.info++; break;
      case sevC.infoVerbose: counts.infoV++; break;
      case sevC.infoHighlighted: counts.infoH++; break;
      case sevC.calculation: counts.calc++; break;
      case sevC.recommendation: counts.recom++; break;
      case sevC.error: counts.errors++; break;
      case sevC.warning: counts.warn++; break;
    }
  });

  // Helper to know if a severity is selected for printing
  function isSelected(level) {
    switch (level) {
      case sevC.info: return !!reportVerbosity.info;
      case sevC.infoVerbose: return !!reportVerbosity.infoVerbose;
      case sevC.infoHighlighted: return !!reportVerbosity.infoHighlighted;
      case sevC.calculation: return !!reportVerbosity.calculation;
      case sevC.recommendation: return !!reportVerbosity.recommendation;
      case sevC.warning: return !!reportVerbosity.warning;
      case sevC.error: return !!reportVerbosity.error;
      default: return false;
    }
  }
  
  // Generate header with summary
  const timestamp = new Date().toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  let reportText = `<span class="report-header">=== EVALUATION REPORT ${timestamp} ========</span>\n`;
  reportText += '<span class="report-header">' + '--- Summary ---------------------------------------' + '</span>\n';
  // Always show counts for each type; append (not printed) if disabled by user
  const lines = [
    { level: sevC.info,           label: 'Info        ',     count: counts.info },
    { level: sevC.infoVerbose,    label: 'Info Verbose',     count: counts.infoV },
    { level: sevC.infoHighlighted,label: 'Info Bold   ',     count: counts.infoH },
    { level: sevC.calculation,    label: 'Calculated  ',     count: counts.calc },
    //{ level: sevC.recommendation,label: 'Recommendations',  count: counts.recom },
    { level: sevC.warning,        label: 'Warnings    ',     count: counts.warn },
    { level: sevC.error,          label: 'Errors      ',     count: counts.errors },
  ];
  lines.forEach(({level, label, count}) => {
    const suffix = isSelected(level) ? '' : ' (not printed)';
    reportText += `<span class="${getSeverityClass(level)}">${getSeveritySymbol(level)} ${label}: ${count.toString().padStart(3, ' ')}${suffix}</span>\n`;
  });
  reportText += `Registers in memory dump: ` +
                           `${reg.parse_output.statistic.map.mappedRegCount + reg.parse_output.statistic.map.reservedRegCount + reg.parse_output.statistic.map.unmappedRegCount} total, ` + 
                           `${reg.parse_output.statistic.map.mappedRegCount} mapped (` +
                           `${reg.parse_output.statistic.map.decodedRegCount} decoded & ` +
                           `${reg.parse_output.statistic.map.mappedRegCount - reg.parse_output.statistic.map.decodedRegCount} undecoded), ` +
                           `${reg.parse_output.statistic.map.reservedRegCount} addr. reserved, ` + 
                           `${reg.parse_output.statistic.map.unmappedRegCount} unknown, (` +
                           `${reg.parse_output.statistic.map.missingRegCount} missing)\n`;
  reportText += `Lines     in memory dump: ` +
                           `${reg.parse_output.statistic.parse.linesTotalCount} total, ` +
                           `${reg.parse_output.statistic.parse.linesCommentCount} comment, ` +
                           `${reg.parse_output.statistic.parse.linesBlankCount} blank, ` +
                           `${reg.parse_output.statistic.parse.linesValuesValidCount} valid, ` +
                           `${reg.parse_output.statistic.parse.linesInvalidFormatCount} invalid\n`; 

  reportText += '<span class="report-header">' + '--- Reports ---------------------------------------' + '</span>\n';

  // Generate detailed reports; decide here whether to print or skip
  allReports.forEach((report, index) => {
    if (!isSelected(report.severityLevel)) {
      return; // skip printing this report
    }
    const severityText = getSeverityText(report.severityLevel);
    const severitySymbol = getSeveritySymbol(report.severityLevel);
    const severityClass = getSeverityClass(report.severityLevel);
    //const highlightClass = (report.highlight !== undefined && report.highlight === true) ? ' report-highlight' : '';

    // Add spaces after line breaks for proper alignment and escape HTML
    const formattedMsg = report.msg
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '\n      '); // indentation of lines 2 to N
    
    reportText += `<span class="${severityClass}">${severitySymbol} ${formattedMsg}</span>\n`;
  });
  
  // Add footer
  reportText += '<span class="report-header">=== End of evaluation report ======================</span>';
  
  // Display in element using innerHTML
  reportTextArea.innerHTML = reportText;
  
  // Scroll to top
  reportTextArea.scrollTop = 0;
}

// ===================================================================================
// display parameters in HTML fields
function displayParameters(params) {
  // Display: Parameters in HTML fields

  for (const [id, value] of Object.entries(params)) {
    // Skip register structure entries and non-parameter entries
    if (id === 'reg' || !id.startsWith('par_')) continue;

    const field = document.getElementById(id);
    if (field) {
      if (checkboxParams.includes(id)) {
        field.checked = value;
      } else {
        field.value = value;
      }
    }
  }
}

// ===================================================================================
// Display Results in HTML fields
function displayResults(results) {

  for (const [id, val] of Object.entries(results)) {
    const field = document.getElementById(id);
    // check if field exists
    if (!field) {
      console.warn(`[Warning] Field with id "${id}" does not exist in HTML.`);
      continue; // skip to next iteration
    }

    if (typeof val === "string") {
		// val is a String, e.g. "err"
		field.value = val;
	  field.classList.remove("input-error");
	  } else if (typeof val === 'number' && !isNaN(val)) { // number assumed
		  field.value = floatResults.includes(id) ? val.toFixed(2) : Math.round(val);
		  field.classList.remove("input-error");
      // console.log(`[Info] printResults(): ${id} = ${field.value}`); // debug output
    } else { // value == null
	    // this line should never be used
		  field.value = 'ERR2';
      field.classList.add("input-error");
      console.warn(`[Warning] result "${id}" contains no number, nor string:`, val);
    }
  }
}

// ===================================================================================
// Display SVGs in HTML
function displaySVGs(reg) {

  // Show SSP optionally, if TDC is enabled and TMS is disabled: generate variable here and use variable in drawBitTiming()
  let showSSP = false;
  if (reg.general &&
      reg.general.bt_global &&
      reg.general.bt_global.set &&
      reg.general.bt_global.set.tdc !== undefined && reg.general.bt_global.set.tdc === true &&
      reg.general.bt_global.set.tms !== undefined && reg.general.bt_global.set.tms !== true) {
    showSSP = true;
  }

  // ARBITRATION
  // check if all input parameters are defined for calling drawBitTiming()
  if (reg.general && reg.general.bt_arb && reg.general.bt_arb.set && reg.general.bt_arb.res &&
      reg.general.bt_arb.set.prop_and_phaseseg1 !== undefined &&
      reg.general.bt_arb.set.phaseseg2 !== undefined &&
      reg.general.bt_arb.res.sp !== undefined &&
      reg.general.bt_arb.set.sjw !== undefined) {
    // Draw Bit Timing: Arbitration Phase
    draw_svg.drawBitTiming(
      reg.general.bt_arb.set.prop_and_phaseseg1 - reg.general.bt_arb.set.phaseseg2, // calculated PROP_SEG
      reg.general.bt_arb.set.phaseseg2, // calculated PHASE_SEG1 = sames size as PHASE_SEG2
      reg.general.bt_arb.set.phaseseg2, // PHASE_SEG2
      reg.general.bt_arb.res.sp, // Sample Point in % of Bit Time
      reg.general.bt_arb.set.sjw, // SJW Length in TQ
      0, // SSP in % of Bit Time => not used because TDC = false
      false, // TDC disabled (false)
      'DrawingBTArb', // name of SVG element in HTML
      'Arbitration Phase' // label in Drawing
    ); 
  } else { // draw error message
    draw_svg.drawErrorMessage(
      'DrawingBTArb',
      'Arbitration Phase',
      'No data'
    );
  }

  // DATA FD
  // check if all input parameters are defined for calling drawBitTiming()
  if (reg.general &&
      reg.general.bt_global && reg.general.bt_global.set &&
      reg.general.bt_global.set.fd !== undefined && reg.general.bt_global.set.fd === true &&
      // parameters for drawing
      reg.general.bt_fddata && reg.general.bt_fddata.set && reg.general.bt_fddata.res &&
      reg.general.bt_global && reg.general.bt_global.set &&
      reg.general.bt_fddata.set.prop_and_phaseseg1 !== undefined &&
      reg.general.bt_fddata.set.phaseseg2 !== undefined &&
      reg.general.bt_fddata.res.sp !== undefined &&
      reg.general.bt_fddata.set.sjw !== undefined &&
      reg.general.bt_fddata.res.ssp !== undefined &&
      reg.general.bt_global.set.tdc !== undefined) {
    // Draw Bit Timing: FD Data Phase
    draw_svg.drawBitTiming(
      reg.general.bt_fddata.set.prop_and_phaseseg1 - reg.general.bt_fddata.set.phaseseg2, // calculated PROP_SEG
      reg.general.bt_fddata.set.phaseseg2, // calculated PHASE_SEG1 = sames size as PHASE_SEG2
      reg.general.bt_fddata.set.phaseseg2,
      reg.general.bt_fddata.res.sp, // Sample Point in % of Bit Time
      reg.general.bt_fddata.set.sjw, // SJW Length in TQ
      reg.general.bt_fddata.res.ssp, // SSP in % of Bit Time
      showSSP, // TDC enabled (true) or disabled (false)
      'DrawingBTFDdata', // name of SVG element in HTML
      'FD Data Phase' // label in Drawing
    ); 
  } else { // draw error message
    draw_svg.drawErrorMessage(
      'DrawingBTFDdata',
      'FD Data Phase',
      'No data or ES=OFF or TMS=ON'
    );
  }

  // DATA XL
  // check if all input parameters are defined for calling drawBitTiming()
  if (reg.general &&
      reg.general.bt_global && reg.general.bt_global.set &&
      reg.general.bt_global.set.xl !== undefined && reg.general.bt_global.set.xl === true &&
      // parameters for drawing
      reg.general.bt_xldata && reg.general.bt_xldata.set && reg.general.bt_xldata.res &&
      reg.general.bt_global && reg.general.bt_global.set &&
      reg.general.bt_xldata.set.prop_and_phaseseg1 !== undefined &&
      reg.general.bt_xldata.set.phaseseg2 !== undefined &&
      reg.general.bt_xldata.res.sp !== undefined &&
      reg.general.bt_xldata.set.sjw !== undefined &&
      reg.general.bt_xldata.res.ssp !== undefined &&
      reg.general.bt_global.set.tdc !== undefined) {
    // Draw Bit Timing: XL Data Phase
    draw_svg.drawBitTiming(
      reg.general.bt_xldata.set.prop_and_phaseseg1 - reg.general.bt_xldata.set.phaseseg2, // calculated PROP_SEG
      reg.general.bt_xldata.set.phaseseg2, // calculated PHASE_SEG1 = sames size as PHASE_SEG2
      reg.general.bt_xldata.set.phaseseg2,
      reg.general.bt_xldata.res.sp, // Sample Point in % of Bit Time
      reg.general.bt_xldata.set.sjw, // SJW Length in TQ
      reg.general.bt_xldata.res.ssp, // SSP in % of Bit Time
      showSSP, // TDC enabled (true) or disabled (false)
      'DrawingBTXLdata', // name of SVG element in HTML
      'XL Data Phase' // label in Drawing
    ); 
  } else { // draw error message
    draw_svg.drawErrorMessage(
      'DrawingBTXLdata',
      'XL Data Phase',
      'No data'
    );
  }

  // DATA XL PWM symbols
  // Check if all input parameters are defined for calling drawPWMsymbols()
  if (reg.general && reg.general.bt_global && reg.general.bt_global.set &&
      reg.general.bt_xldata && reg.general.bt_xldata.set && reg.general.bt_xldata.res &&
      reg.general.bt_global.set.tms !== undefined && reg.general.bt_global.set.tms === true &&
      reg.general.bt_xldata.set.pwm_short !== undefined &&
      reg.general.bt_xldata.set.pwm_long !== undefined &&
      reg.general.bt_xldata.res.pwm_symbols_per_bit_time !== undefined) {
    draw_svg.drawPWMsymbols(
      reg.general.bt_xldata.set.pwm_short,
      reg.general.bt_xldata.set.pwm_long,
      reg.general.bt_xldata.res.pwm_symbols_per_bit_time,
      'DrawingBTXLdataPWM',
      'XL Data Phase PWM symbols');
  } else {
    // Draw PWM symbols with error message
    draw_svg.drawErrorMessage(
      'DrawingBTXLdataPWM',
      'XL Data Phase PWM symbols',
      'No data or TMS = off'
    );
  }

  // Legend for Bit Timing Drawings: adapt width to table width
  document.getElementById("DrawingBTLegend").style.width =   document.getElementById("BitTimingTable").offsetWidth + "px";
}

// ===================================================================================
// Assign HTML Parameters and Results from reg object
function assignHtmlParamsAndResults(reg, paramsHtml, resultsHtml) {
  // Assign clock frequency parameter: Not assigned because not printed in HTML

  // Do not assign par_clk_freq, because this is a USER INPUT PARAMETER (The other parameters are from registers)
  // paramsHtml['par_clk_freq'] = reg.general.clk_freq;

  if (reg.general && reg.general.bt_global && reg.general.bt_global.set) {
    paramsHtml['par_tdc_datfdxl'] = reg.general.bt_global.set.tdc !== undefined ? reg.general.bt_global.set.tdc : false; // TDC enabled or disabled
    paramsHtml['par_tms_datxl'] = reg.general.bt_global.set.tms !== undefined ? reg.general.bt_global.set.tms : false; // TMS enabled or disabled
  } else {
    // Default values if global settings are not set
    paramsHtml['par_tdc_datfdxl'] = false; // TDC disabled by default 
    paramsHtml['par_tms_datxl'] = false; // TMS disabled by default
  }

  // Assign bit timing parameters from arbitration phase
  if (reg.general.bt_arb && reg.general.bt_arb.set) {
    paramsHtml['par_brp_arb'] = reg.general.bt_arb.set.brp !== undefined ? reg.general.bt_arb.set.brp : 'no reg';
    paramsHtml['par_prop_and_phaseseg1_arb'] = reg.general.bt_arb.set.prop_and_phaseseg1 !== undefined ? reg.general.bt_arb.set.prop_and_phaseseg1 : 'no reg';
    paramsHtml['par_phaseseg2_arb'] = reg.general.bt_arb.set.phaseseg2 !== undefined ? reg.general.bt_arb.set.phaseseg2 : 'no reg';
    paramsHtml['par_sjw_arb'] = reg.general.bt_arb.set.sjw !== undefined ? reg.general.bt_arb.set.sjw : 'no reg';
  } else {
    // Default values if arbitration phase is not set
    paramsHtml['par_brp_arb'] = 'no reg';
    paramsHtml['par_prop_and_phaseseg1_arb'] = 'no reg';
    paramsHtml['par_phaseseg2_arb'] = 'no reg';
    paramsHtml['par_sjw_arb'] = 'no reg';
  }

  // Assign bit timing parameters from FD data phase
  if (reg.general.bt_fddata && reg.general.bt_fddata.set &&
      reg.general.bt_global && reg.general.bt_global.set &&
      reg.general.bt_global.set.fd !== undefined && reg.general.bt_global.set.fd === true)
    {
    paramsHtml['par_brp_datfd'] = reg.general.bt_fddata.set.brp !== undefined ? reg.general.bt_fddata.set.brp : 'no reg';
    paramsHtml['par_prop_and_phaseseg1_datfd'] = reg.general.bt_fddata.set.prop_and_phaseseg1 !== undefined ? reg.general.bt_fddata.set.prop_and_phaseseg1 : 'no reg';
    paramsHtml['par_phaseseg2_datfd'] = reg.general.bt_fddata.set.phaseseg2 !== undefined ? reg.general.bt_fddata.set.phaseseg2 : 'no reg';
    paramsHtml['par_sjw_datfd'] = reg.general.bt_fddata.set.sjw !== undefined ? reg.general.bt_fddata.set.sjw : 'no reg';
    if (reg.general.bt_global.set.tms === true) {
      // TMS enabled, assign default value
      paramsHtml['par_sspoffset_datfd'] = 'TMS on';
    } else if (reg.general.bt_global.set.tdc === true) {
      // TDC enabled, assign SSP offset
      paramsHtml['par_sspoffset_datfd'] = reg.general.bt_fddata.set.ssp_offset !== undefined ? reg.general.bt_fddata.set.ssp_offset : 'no reg';
    } else {
      // TDC disabled, assign default value
      paramsHtml['par_sspoffset_datfd'] = 'TDC off';
    }
  } else {
    // Default values if FD data phase is not set
    paramsHtml['par_brp_datfd'] = 'no reg';
    paramsHtml['par_prop_and_phaseseg1_datfd'] = 'no reg';
    paramsHtml['par_phaseseg2_datfd'] = 'no reg';
    paramsHtml['par_sjw_datfd'] = 'no reg'; 
    paramsHtml['par_sspoffset_datfd'] = 'no reg';
  }

  // Assign bit timing parameters from XL data phase
  if (reg.general.bt_xldata && reg.general.bt_xldata.set &&
      reg.general.bt_global && reg.general.bt_global.set &&
      reg.general.bt_global.set.xl !== undefined && reg.general.bt_global.set.xl === true )
    {
    paramsHtml['par_brp_datxl'] = reg.general.bt_xldata.set.brp !== undefined ? reg.general.bt_xldata.set.brp : 'no reg';
    paramsHtml['par_prop_and_phaseseg1_datxl'] = reg.general.bt_xldata.set.prop_and_phaseseg1 !== undefined ? reg.general.bt_xldata.set.prop_and_phaseseg1 : 'no reg';
    paramsHtml['par_phaseseg2_datxl'] = reg.general.bt_xldata.set.phaseseg2 !== undefined ? reg.general.bt_xldata.set.phaseseg2 : 'no reg';
    paramsHtml['par_sjw_datxl'] = reg.general.bt_xldata.set.sjw !== undefined ? reg.general.bt_xldata.set.sjw : 'no reg';
    if (reg.general.bt_global.set.tms === true) {
      // TMS enabled, assign default value
      paramsHtml['par_sspoffset_datxl'] = 'TMS on';
    } else if (reg.general.bt_global.set.tdc === true) {
      // TDC enabled, assign SSP offset
      paramsHtml['par_sspoffset_datxl'] = reg.general.bt_xldata.set.ssp_offset !== undefined ? reg.general.bt_xldata.set.ssp_offset : 'no reg';
    } else {
      // TDC disabled, assign default value
      paramsHtml['par_sspoffset_datxl'] = 'TDC off';
    }
  } else {
    // Default values if data phase is not set
    paramsHtml['par_brp_datxl'] = 'no reg';
    paramsHtml['par_prop_and_phaseseg1_datxl'] = 'no reg';
    paramsHtml['par_phaseseg2_datxl'] = 'no reg';
    paramsHtml['par_sjw_datxl'] = 'no reg'; 
    paramsHtml['par_sspoffset_datxl'] = 'no reg';
  }

  // Assign PWM parameters from XL data phase
  if (reg.general.bt_xldata && reg.general.bt_xldata.set && reg.general.bt_global.set.tms === true) {
    paramsHtml['par_pwmo'] = reg.general.bt_xldata.set.pwm_offset !== undefined ? reg.general.bt_xldata.set.pwm_offset : 'no reg';
    paramsHtml['par_pwms'] = reg.general.bt_xldata.set.pwm_short !== undefined ? reg.general.bt_xldata.set.pwm_short : 'no reg';
    paramsHtml['par_pwml'] = reg.general.bt_xldata.set.pwm_long !== undefined ? reg.general.bt_xldata.set.pwm_long : 'no reg';
  } else {
    paramsHtml['par_pwmo'] = 'TMS off';
    paramsHtml['par_pwms'] = 'TMS off';
    paramsHtml['par_pwml'] = 'TMS off';
  }

  // Assign clock results
  resultsHtml['res_clk_period'] = reg.general.clk_period;

  // Assign bit timing results from arbitration phase
  if (reg.general.bt_arb && reg.general.bt_arb.res) {
    resultsHtml['res_bitrate_arb'] = reg.general.bt_arb.res.bitrate !== undefined ? reg.general.bt_arb.res.bitrate : 'no reg';
    resultsHtml['res_sp_arb'] = reg.general.bt_arb.res.sp !== undefined ? reg.general.bt_arb.res.sp : 'no reg';
    resultsHtml['res_tqperbit_arb'] = reg.general.bt_arb.res.tq_per_bit !== undefined ? reg.general.bt_arb.res.tq_per_bit : 'no reg';
    resultsHtml['res_bitlength_arb'] = reg.general.bt_arb.res.bit_length !== undefined ? reg.general.bt_arb.res.bit_length : 'no reg';
    resultsHtml['res_tqlen_arb'] = reg.general.bt_arb.res.tq_len !== undefined ? reg.general.bt_arb.res.tq_len : 'no reg';
  } else {
    // Default values if arbitration phase is not set
    resultsHtml['res_bitrate_arb'] = 'no reg';
    resultsHtml['res_sp_arb'] = 'no reg';
    resultsHtml['res_tqperbit_arb'] = 'no reg';
    resultsHtml['res_bitlength_arb'] = 'no reg';
    resultsHtml['res_tqlen_arb'] = 'no reg';
  } 

  // Assign bit timing results from FD data phase
  if (reg.general.bt_fddata && reg.general.bt_fddata.res &&
      reg.general.bt_global && reg.general.bt_global.set &&
      reg.general.bt_global.set.fd !== undefined && reg.general.bt_global.set.fd === true)
  {
    resultsHtml['res_bitrate_datfd'] = reg.general.bt_fddata.res.bitrate !== undefined ? reg.general.bt_fddata.res.bitrate : 'no reg';
    resultsHtml['res_sp_datfd'] = reg.general.bt_fddata.res.sp !== undefined ? reg.general.bt_fddata.res.sp : 'no reg';
    resultsHtml['res_ssp_datfd'] = reg.general.bt_fddata.res.ssp !== undefined ? reg.general.bt_fddata.res.ssp : 'no reg';
    resultsHtml['res_tqperbit_datfd'] = reg.general.bt_fddata.res.tq_per_bit !== undefined ? reg.general.bt_fddata.res.tq_per_bit : 'no reg';
    resultsHtml['res_bitlength_datfd'] = reg.general.bt_fddata.res.bit_length !== undefined ? reg.general.bt_fddata.res.bit_length : 'no reg';
    resultsHtml['res_tqlen_datfd'] = reg.general.bt_fddata.res.tq_len !== undefined ? reg.general.bt_fddata.res.tq_len : 'no reg';
  } else {
    // Default values if FD data phase is not set
    resultsHtml['res_bitrate_datfd'] = 'no reg';
    resultsHtml['res_sp_datfd'] = 'no reg';
    resultsHtml['res_ssp_datfd'] = 'no reg';
    resultsHtml['res_tqperbit_datfd'] = 'no reg';
    resultsHtml['res_bitlength_datfd'] = 'no reg';
    resultsHtml['res_tqlen_datfd'] = 'no reg';
  } 

  // Assign bit timing results from XL data phase
  if (reg.general.bt_xldata && reg.general.bt_xldata.res &&
      reg.general.bt_global && reg.general.bt_global.set &&
      reg.general.bt_global.set.xl !== undefined && reg.general.bt_global.set.xl === true)
  {
    resultsHtml['res_bitrate_datxl'] = reg.general.bt_xldata.res.bitrate !== undefined ? reg.general.bt_xldata.res.bitrate : 'no reg';
    resultsHtml['res_sp_datxl'] = reg.general.bt_xldata.res.sp !== undefined ? reg.general.bt_xldata.res.sp : 'no reg';
    resultsHtml['res_ssp_datxl'] = reg.general.bt_xldata.res.ssp !== undefined ? reg.general.bt_xldata.res.ssp : 'no reg';
    resultsHtml['res_tqperbit_datxl'] = reg.general.bt_xldata.res.tq_per_bit !== undefined ? reg.general.bt_xldata.res.tq_per_bit : 'no reg';
    resultsHtml['res_bitlength_datxl'] = reg.general.bt_xldata.res.bit_length !== undefined ? reg.general.bt_xldata.res.bit_length : 'no reg';
    resultsHtml['res_tqlen_datxl'] = reg.general.bt_xldata.res.tq_len !== undefined ? reg.general.bt_xldata.res.tq_len : 'no reg';
  } else {
    // Default values if data phase is not set
    resultsHtml['res_bitrate_datxl'] = 'no reg';
    resultsHtml['res_sp_datxl'] = 'no reg';
    resultsHtml['res_ssp_datxl'] = 'no reg';
    resultsHtml['res_tqperbit_datxl'] = 'no reg';
    resultsHtml['res_bitlength_datxl'] = 'no reg';
    resultsHtml['res_tqlen_datxl'] = 'no reg';
  } 

  // Assign PWM results from XL data phase
  if (reg.general.bt_xldata && reg.general.bt_xldata.res && reg.general.bt_global.set.tms === true) {
    resultsHtml['res_pwm_symbol_len_ns_datxl'] = reg.general.bt_xldata.res.pwm_symbol_len_ns !== undefined ? reg.general.bt_xldata.res.pwm_symbol_len_ns : 'no reg';
    resultsHtml['res_pwm_symbol_len_clk_cycles_datxl'] = reg.general.bt_xldata.res.pwm_symbol_len_clk_cycles !== undefined ? reg.general.bt_xldata.res.pwm_symbol_len_clk_cycles : 'no reg';
    resultsHtml['res_pwm_symbols_per_bit_time_datxl'] = reg.general.bt_xldata.res.pwm_symbols_per_bit_time !== undefined ? reg.general.bt_xldata.res.pwm_symbols_per_bit_time : 'no reg';
  } else {
    // Default values if PWM is not set
    resultsHtml['res_pwm_symbol_len_ns_datxl'] = 'TMS off';
    resultsHtml['res_pwm_symbol_len_clk_cycles_datxl'] = 'TMS off';
    resultsHtml['res_pwm_symbols_per_bit_time_datxl'] = 'TMS off';
  }

  console.log('[Info] assignHtmlParamsAndResults(): Assigned parameters (paramsHtml):', paramsHtml);
  console.log('[Info] assignHtmlParamsAndResults(): Assigned results   (resultsHtml):', resultsHtml);
}

// ===================================================================================
// Load register values example based on selected CAN IP Module
function loadRegisterValuesExample() {
  // Get the selected CAN IP module
  const canIpModule = getCanIpModuleFromHTML();
  if (!canIpModule) {
    console.error('[Error] Could not determine CAN IP Module for loading example');
    return;
  }

  // Get the register textarea element
  const registerTextArea = document.getElementById('userInputRegisterValues');
  if (!registerTextArea) {
    console.error('[Error] Register textarea not found in HTML');
    return;
  }

  // initialize result object
  let exampleObj = { exampleRegisterValues: '', clockFrequency: null };

  // Call the appropriate module function to load example register values
  switch (canIpModule) {
    case 'M_CAN':
      if (m_can.loadExampleRegisterValues) {
        exampleObj = m_can.loadExampleRegisterValues();
      } else {
        console.warn(`[Warning] loadExampleRegisterValues not implemented in module: ${canIpModule}`);
        exampleObj = loadDefaultExample();
      }
      break;
    
    case 'X_CAN':
      if (x_can.loadExampleRegisterValues) {
        exampleObj = x_can.loadExampleRegisterValues();
      } else {
        console.warn(`[Warning] loadExampleRegisterValues not implemented in module: ${canIpModule}`);
        exampleObj = loadDefaultExample();
      }
      break;

    case 'XS_CAN':
      if (xs_can.loadExampleRegisterValues) {
        exampleObj = xs_can.loadExampleRegisterValues();
      } else {
        console.warn(`[Warning] loadExampleRegisterValues not implemented in module: ${canIpModule}`);
        exampleObj = loadDefaultExample();
      }
      break;

      case 'X_CANB':
      if (x_canb.loadExampleRegisterValues) {
        exampleObj = x_canb.loadExampleRegisterValues();
      } else {
        console.warn(`[Warning] loadExampleRegisterValues not implemented in module: ${canIpModule}`);
        exampleObj = loadDefaultExample();
      }
      break;

    default:
      console.warn(`[Warning] Example register values for ${canIpModule} not yet implemented`);
      exampleObj = loadDefaultExample();
      break; 
  }

  // check the loaded Object for validity
  if (typeof exampleObj === 'object' && exampleObj.exampleRegisterValues && exampleObj.clockFrequency) {
    // all OK
    // Assign the example register values to the textarea
    registerTextArea.value = exampleObj.exampleRegisterValues;
    console.log(`[Info] Loaded example register values for ${canIpModule}`);

    // assign value to global clock frequency variable
    par_clk_freq_g = exampleObj.clockFrequency;

    // update the clock frequency parameter in HTML
    const clkFreqField = document.getElementById('par_clk_freq');
    if (clkFreqField) {
      clkFreqField.value = exampleObj.clockFrequency;
    }

  } else {
    // NOT OK
    console.warn(`[Warning] loadExampleRegisterValues for <${canIpModule}> did not return a valid object!`);
  }
} // loadRegisterValuesExample()

// ===================================================================================
// Load default example register values (fallback)
function loadDefaultExample() {
  const clock = 80;
  const registerString = `# IMPORTANT: No example exists!
# Default example register values
# Format to use: 0xADDR 0xVALUE
# 0xADDR is the relative register address
0x000 0x87654321
0x004 0x00000011
0x008 0x00000000
0x020 0x00000100`;
  
  console.log('[Info] Generated default example register values');
  return {exampleRegisterValues: registerString, clockFrequency: clock};
}

// ===================================================================================
// Get selected CAN IP Module from HTML select field
function getCanIpModuleFromHTML() {
  const canIpModuleSelect = document.getElementById('canIpModuleSelect');
  if (canIpModuleSelect) {
    const selectedModule = canIpModuleSelect.value;
    console.log('[Info] Selected CAN IP Module:', selectedModule);
    return selectedModule;
  } else {
    console.error('[Error] CAN IP Module select field not found in HTML');
    return null;
  }
}

// ===================================================================================
// Get selected CAN IP Module from HTML select field
function getReportVerbositySettingFromHTML(reportVerbosity) {
  // loop through all checkboxes with class 'report-verbosity-checkbox' and strore check-box status in object
  checkboxReportVerbosityParams.forEach(param => {
    const checkbox = document.getElementById(param);
    if (checkbox) {
      const isChecked = checkbox.checked;
      switch (param) {
        case 'par_report_info': // info messages
          reportVerbosity.info = isChecked;
          break;
        case 'par_report_infoVerbose': // info verbose
          reportVerbosity.infoVerbose = isChecked;
          break;
        case 'par_report_infoHighlighted': // highlighted info messages
          reportVerbosity.infoHighlighted = isChecked;
          // show also recommendations if highlighted info is enabled (recommendations has no own checkbox, because there too many checkboxes)
          reportVerbosity.recommendation = isChecked;
          // show also recommendations if highlighted info is enabled (recommendations has no own checkbox, because there too many checkboxes)
          reportVerbosity.calculation = isChecked;
          break;
        case 'par_report_calculation': // calculated values
          reportVerbosity.calculation = isChecked;
          break;
        case 'par_report_recommendation': // recommended values
          reportVerbosity.recommendation = isChecked;
          break;
        case 'par_report_warning': // warning messages
          reportVerbosity.warning = isChecked;
          break;
        case 'par_report_error': // error messages
          reportVerbosity.error = isChecked;
          break;
        default:
          console.error(`[Error] Unknown verbosity checkbox "${param}" in HTML`);
      }
    } else {
      console.warn(`[Warning] Verbosity checkbox "${param}" not found in HTML`);
    }
  });
  console.log('[Info] Report verbosity settings:', reportVerbosity);
}

function CountDecodedRegs(reg) {
  // Summary of decoded registers: a register is considered decoded if reg.REG.fields exists and has at least one property
  if (!reg || typeof reg !== 'object') return;
  if (!reg.parse_output) reg.parse_output = {};
  if (!Array.isArray(reg.parse_output.report)) reg.parse_output.report = [];

  const decoded = [];
  let decodedRegCount = 0;
  for (const [name, obj] of Object.entries(reg)) {
    if (name === 'general' || name === 'parse_output' || name === 'raw' || name === 'memmap') continue; // skip meta sections
    if (!obj || typeof obj !== 'object') continue;
    if (obj.fields && typeof obj.fields === 'object' && Object.keys(obj.fields).length > 0) {
      decodedRegCount++;
    } else {
      console.log(`[Info] Register "${name}" is in dump but not decoded`);
    }
  }

  reg.parse_output.report.push({
    severityLevel: sevC.info,
    msg: `Registers decoded successfully: ${decodedRegCount}`
  });

  // store values in reg.parse_output
  reg.parse_output.statistic.map.decodedRegCount = decodedRegCount;
}

// ===================================================================================
// Process User Register Values from Text Area - Updated main function
function processUserRegisterValues() {
  // Basic idea of this function:
  // 1. Get Data from HTML
  // 2. Parse user input from textarea into raw register array
  // 3. Map parsed register addresses to Register Names
  // 4. Process with the appropriate CAN IP Module function
  //    This function fills the content of the reg object with calculations
  // 5. Generate HTML Data to be displayed from reg object
  //    and Display data from params, results, reg in HTML fields and SVGs

  // Step 0: Clear reg and create objects ==================================================
  clearObject(reg); // Clear global register object (keep the reference)
  reg.general = {}; // Initialize general section
  reg.general.report = []; // Initialize report array

  const paramsHtml = {}; // Initialize params object for HTML display
  const resultsHtml = {}; // Initialize results object for HTML display

  // Step 1: Get data from HTML =============================================================
  // CAN IP Module determination (from HTML) -------------------
  const canIpModule = getCanIpModuleFromHTML();
  if (!canIpModule) {
    // If select field is not found, log an error and exit
    console.log(`[Error] CAN IP Module select field not found in HTML.`);
    return;
  }
  // Add first report entry
  reg.general.report.push({
    severityLevel: sevC.infoHighlighted,
    msg: `CAN Module "${canIpModule}" assumed for register processing`
  });

  // Clock frequency: Report -----------------------------------
  // CAN Clock frequency automitically copied from HTML to par_clk_freq_g
  reg.general.clk_freq = par_clk_freq_g;
  reg.general.clk_period = 1000/par_clk_freq_g; // 1000 / MHz = ns
  // generate report for CAN Clock
  reg.general.report.push({
      severityLevel: sevC.infoHighlighted,
      msg: `CAN Clock\n` + 
           `Frequency = ${par_clk_freq_g} MHz\n` +
           `Period    = ${reg.general.clk_period} ns`
  });

  // get the text area content from HTML ----------------------
  const userRegText = document.getElementById('userInputRegisterValues').value;

  // === Step 2: PARSE the text and generate raw register array =============================
  parseUserRegisterValues(userRegText, reg);
  console.log('[Info] Step 1 - Parsed raw register values (reg.raw):', reg.raw);

  // === Step 3: MAP parsed Register addresses to Register Names ============================
  // and
  // === Step 4: PROCESS reg object with CAN IP Module specific function ====================
  switch (canIpModule) {
    case 'M_CAN':
      // Step 3
      mapRawRegAddrToNames(reg, m_can.regAddrMap, m_can.resAddrArray, m_can.regLocalAddrMask);
      console.log('[Info] Step 2 - Mapped register values (reg object):', reg);
      // Step 4:
      m_can.processRegs(reg);
      break;

    case 'X_CAN':
      // Step 3
      mapRawRegAddrToNames(reg, x_can.regAddrMap, x_can.resAddrArray, x_can.regLocalAddrMask);
      console.log('[Info] Step 2 - Mapped register values (reg object):', reg);
      // Step 4:
      x_can.processRegs(reg);
      break;

    case 'XS_CAN':
      // Step 3
      mapRawRegAddrToNames(reg, xs_can.regAddrMap, xs_can.resAddrArray, xs_can.regLocalAddrMask);
      console.log('[Info] Step 2 - Mapped register values (reg object):', reg);
      // Step 4:
      xs_can.processRegs(reg);
      break;

      case 'X_CANB':
      // Step 3
      mapRawRegAddrToNames(reg, x_canb.regAddrMap, x_canb.resAddrArray, x_canb.regLocalAddrMask);
      console.log('[Info] Step 2 - Mapped register values (reg object):', reg);
      // Step 4:
      x_canb.processRegs(reg);
      break;

    default:
      reg.general.report.push({
        severityLevel: sevC.error, // error
        msg: `Decoding of "${canIpModule}" is not yet implemented.`
      });
      // remember that no registers were processed
      break;
  }
  console.log('[Info] Registers with data and reports (reg object):', reg);

  // Count decoded registers
  CountDecodedRegs(reg);

  // === Step 5: Generate HTML objects from reg object & Display in HTML ====================
  // assign parameters and results to paramsHtml and resultsHtml objects (so they can be displayed in HTML later)
  assignHtmlParamsAndResults(reg, paramsHtml, resultsHtml);

  // display parameters in HTML fields
  displayParameters(paramsHtml);

  // Display calculation results in HTML fields
  displayResults(resultsHtml);

  // Display SVGs in HTML
  displaySVGs(reg); 

  // Display Reports in HTML textarea
  displayValidationReport(reg, reportVerbosity);
}