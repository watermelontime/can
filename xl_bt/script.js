// TODOs
// - Report Parameter errors: e.g. with box mit fehlermeldungen hinzufügen
// - show additional parameters like: retransmission count in register settings
// - Calculation should be done only if focus is left (reduces number of errors)

// global variable definitions
// ns
const floatParams = [
  'par_clk_freq',
  'par_dfused'
];

const buttonParams = [
  'canType',
  'transceiverType'
];

const checkboxParams = [
  'par_tms',
  'par_tdc_dat'
];

const floatResults = [
  'res_clk_period',
  'res_bitrate_arb',
  'res_bitrate_dat',
  'res_sp_arb',
  'res_sp_dat',
  'res_ssp_dat',
  'res_tqlen',
  'res_pwm_symbol_len_ns'
];

const paramFields  = Array.from(document.querySelectorAll('input[id^="par_"], select[id^="par_"]'));
const resultFields = Array.from(document.querySelectorAll('input[id^="res_"]'));

let transceiverType = 'not set';

// when document is loaded: initialize page
document.addEventListener('DOMContentLoaded', init);

// ===================================================================================
// Initialisation when website is loaded
function init() {
  // set eventlistener: when parameter changes => calculate
  initEventListeners();

  // set default transceiverType
  const myBtn = document.getElementById('btnTSICXL');
  myBtn.classList.add('active');
  transceiverType = myBtn.dataset.value;

  // set default value (based on preconfigured list
  setDefaultBTconfig('cfg08M');
}

// ===================================================================================
// Event-Listener activation
function initEventListeners() {
  // param fields
  paramFields.forEach(input => {
    input.addEventListener('input', processChanges);
  });

  // Transceiver button
  document.querySelectorAll('.select-btn[data-group="transceiverType"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedTransceiverType = btn.dataset.value;
      adjustBTconfigOptions(selectedTransceiverType);
      adjustForTransceiverSelection(selectedTransceiverType);
      transceiverType = selectedTransceiverType;

      // Optical switch of Button-Selected
      // step 1: deactivate all
      document.querySelectorAll('.select-btn[data-group="transceiverType"]').forEach(b => {
        b.classList.remove('active');
      });
      // activate the one clicked
      btn.classList.add('active');

      // calculate results
      processChanges();
   });
  });
}

// ===================================================================================
function setDefaultBTconfig(targetValue) {
  // Set deaufault value in Dropdown field
  const configSelect = document.getElementById('btConfigSelect');
  configSelect.value = targetValue; // e.g. "cfg08M" ist der Key im configMatrix
  
  // set default config to all param fields
  setExampleBTconfig(); // setzt default Parameter
}

// Buttons for transceiverType ========================================================
function adjustBTconfigOptions(selectedTransceiver) {
  const btConfigSelect = document.getElementById('btConfigSelect');
  
  Array.from(btConfigSelect.options).forEach(option => {
    // extract integer from option-name
    const match = option.value.match(/\d+/);
    const bitrate = match ? parseInt(match[0], 10) : null;
    if (((selectedTransceiver === 'TFD') && (bitrate > 2)) || ((selectedTransceiver === 'TSIC') && (bitrate > 8))) {
      option.style.display = 'none'; // Unsichtbar machen
    } else {
      option.style.display = 'block'; // Wieder sichtbar
    }
  });

  btConfigSelect.value = 'cfg02M';
}

function adjustForTransceiverSelection(selectedTransceiver) {
  // deisable TMS field: not usable without SIC XL transceivers
  const tmsField = document.getElementById('par_tms');
  // TODO: check this function, just copied into file up to now
  if (selectedTransceiver != 'TSICXL') {
    // Deselect und readonly setzen
  	tmsField.checked = false;
    tmsField.disabled = true;
    tmsField.classList.add('input-disabled');
  } else {
    // wieder aktivieren
    tmsField.disabled = false;
    tmsField.classList.remove('input-disabled');
  }
}

// ===================================================================================
// Parameter: Read from HTML (raw)
function paramsCollect() {
  // gib ein Objekt `params` zurück
  const params = {};
  
  // Read Select Button values (CAN Type + Transceiver)
   document.querySelectorAll('.select-btn.active').forEach(btn => {
     const group = btn.dataset.group;
     const btnValue = btn.dataset.value;
     params[group] = { value_raw: btnValue };
   });
 
  // Read input values
  paramFields.forEach(input => {
    const id = input.id;

    // Checkbox Parameter
    if (checkboxParams.includes(id)) {
        params[id] = {value_raw: input.checked};
	// Other Parameter
	} else {
	    params[id] = {value_raw: input.value};
	}
  });
  
  // return Object
  return params;
}

// Prüft, ob der Wert gültige Zahl ist (isFloat=0 => Integer, isFloat=1 => Float)
function isValidNumber(value, isFloat) {
  if (value.trim() === '') return false;
  if (isFloat) {
    // Erlaubt Dezimalzahlen (mit Punkt) und Integer
    if (/^-?\d+(\.\d+)?$/.test(value)) return true;
  } else {
    // Erlaubt Integer
    if (/^-?\d+$/.test(value)) return true;
  }
  return false;
}

// ===================================================================================
// Parameter: Validate
function paramsValidate(params) {
  let allValid = true;
 
  // Check validity of parameters (format)
  for (const id in params) {
    const entry = params[id];

    // Checkbox Parameter
    if (checkboxParams.includes(id)) {
	  entry.value = entry.value_raw;
	  entry.valid = true;
    // Button Parameter (e.g. CAN Type, Transceiver Type)
    } else if (buttonParams.includes(id)) {
      entry.value = entry.value_raw;
      entry.valid = true;
  	// Number Parameter
  	} else {
      entry.valid = isValidNumber(entry.value_raw, floatParams.includes(id));
  	  entry.value = entry.valid ? parseFloat(entry.value_raw) : null;
  	}
  }
  
  // check value range of parameters (value range)
  for (const id in params) {
    const entry = params[id];
    if (entry.valid === true) {
  		if (id == 'par_brp') {
  			  if (!((entry.value >= 1) && (entry.value <= 32))) { entry.range_valid = false; entry.range_msg = 'BRP is not in ISO11898-1:2024 range.\nValid range: 1..32';}
  			  else {entry.range_valid = true;}
  		} else if (id == 'par_propseg_arb') {
  			  if (!((entry.value >= 1) && (entry.value <= 384))) { entry.range_valid = false; entry.range_msg = 'Arb. PropSeg is not in ISO11898-1:2024 range.\nValid range: 1..384';}
  			  else {entry.range_valid = true;}
  		} else if (id == 'par_phaseseg1_arb') {
  			  if (!((entry.value >= 1) && (entry.value <= 128))) { entry.range_valid = false; entry.range_msg = 'Arb. PhaseSeg1 is not in ISO11898-1:2024 range.\nValid range: 1..128';}
  			  else {entry.range_valid = true;}
  		} else if (id == 'par_phaseseg2_arb') {
  			  if (!((entry.value >= 2) && (entry.value <= 128))) { entry.range_valid = false; entry.range_msg = 'Arb. PhaseSeg2 is not in ISO11898-1:2024 range.\nValid range: 2..128';}
  			  else {entry.range_valid = true;}
  		} else if (id == 'par_sjw_arb') {
  			  if      (params.par_phaseseg1_arb.valid && !((entry.value <= params.par_phaseseg1_arb.value))) { entry.range_valid = false; entry.range_msg = 'Arb. SJW > Arb. PhaseSeg1;\nValid range: SJW <= min(PhaseSeg1, PhaseSeg2)';}
          else if (params.par_phaseseg2_arb.valid && !((entry.value <= params.par_phaseseg2_arb.value))) { entry.range_valid = false; entry.range_msg = 'Arb. SJW > Arb. PhaseSeg2;\nValid range: SJW <= min(PhaseSeg1, PhaseSeg2)';}
  			  else {entry.range_valid = true;}
  		} else if (id == 'par_propseg_dat') {
  			  if (!((entry.value >= 0) && (entry.value <= 128))) { entry.range_valid = false; entry.range_msg = 'Data PropSeg is not in ISO11898-1:2024 range.\nValid range: 0..128';}
  			  else {entry.range_valid = true;}
  		} else if (id == 'par_phaseseg1_dat') {
  			  if (!((entry.value >= 1) && (entry.value <= 128))) { entry.range_valid = false; entry.range_msg = 'Data PhaseSeg1 is not in ISO11898-1:2024 range.\nValid range: 1..128';}
  			  else {entry.range_valid = true;}
  		} else if (id == 'par_phaseseg2_dat') {
  			  if (!((entry.value >= 2) && (entry.value <= 128))) { entry.range_valid = false; entry.range_msg = 'Data PhaseSeg2 is not in ISO11898-1:2024 range.\nValid range: 2..128';}
  			  else {entry.range_valid = true;}
  		} else if (id == 'par_sjw_dat') {
  			  if      (params.par_phaseseg1_dat.valid && !((entry.value <= params.par_phaseseg1_dat.value))) { entry.range_valid = false; entry.range_msg = 'Data SJW > Data PhaseSeg1;\nValid range: SJW <= min(PhaseSeg1, PhaseSeg2)';}
          else if (params.par_phaseseg2_dat.valid && !((entry.value <= params.par_phaseseg2_dat.value))) { entry.range_valid = false; entry.range_msg = 'Data SJW > Data PhaseSeg2;\nValid range: SJW <= min(PhaseSeg1, PhaseSeg2)';}
  			  else {entry.range_valid = true;}
  		} else { // (entry.valid === false)
        // default check for positive values
        if (buttonParams.includes(id)) {
          // set by default to valid, since there is no range check for buttons
          entry.range_valid = true;
        } else {
          if (entry.value >= 0) {
            entry.range_valid = true; // valid range
          } else {
            entry.range_valid = false; // invalid range
            entry.range_msg = 'Value must be a positive number';
          }
        }
      }
	  } else {
      // if parameter is invalid, then the range is also invalid
      entry.range_valid = false; 
      entry.range_msg = 'Invalid parameter detected. Numeric value required.';
    }
  }

  // Mark HTLM-fields that have invalid entries
  for (const id in params) {
    const entry = params[id];
    const field = document.getElementById(id);
    if (field) {
      if (!entry.valid || !entry.range_valid) {
        field.classList.add("input-error");
        alert(`ERROR in "${id}":\n${entry.range_msg}`);
      } else {
        field.classList.remove("input-error");
      }
    } 
  }

  // Generate allValid
  allValid = true; // init: assume all valid
  for (const id in params) {
    const entry = params[id];
    if (!entry.valid || !entry.range_valid) {
      allValid = false;
    }
  }

  // Print error messages
  for (const id in params) {
    const entry = params[id];
    if (!entry.range_valid) {
      console.log(id, ': ', entry.range_msg);
    }
  }
  
  return allValid;
} // func paramValidate

// ===================================================================================
// Generate HW Register Values
function generateHardwareRegisters(results, params) {
  // add Register Values to results object
  const boschRegisters = {
    res_reg_MODE: 0x00000000,
    res_reg_NBTP: 0x00000000,
    res_reg_XBTP: 0x00000000,
    res_reg_PCFG: 0x00000000,
  };

  // Help-Function: Writes numeric value to specific bit position
  function setBits(regVal, value, endBit, startBit) {
    // regVal: current register value
    // value: value to set in the register
    // endBit: last bit position to set (0-31), endBit must be >= startBit
    // startBit: first bit position to set (0-31), endBit must be >= startBit
    // example: setBits(0x00000000, 32, 0, 7) sets bit 7 to 0 in the register => 0x0000002F
	  const length = endBit - startBit + 1;
    const mask = ((1 << length) - 1) << startBit;
    return (regVal & ~mask) | ((value << startBit) & mask);
  }

  // ### Bosch Registers of X_CAN, XS_CAN, X_CANB ###
  // MODE.EFDI
  boschRegisters.res_reg_MODE = params.par_tms.value ? setBits(boschRegisters.res_reg_MODE, 1, 10, 10) : setBits(boschRegisters.res_reg_MODE, 0, 10, 10);
  // MODE.XLTR
  boschRegisters.res_reg_MODE = params.par_tms.value ? setBits(boschRegisters.res_reg_MODE, 1, 9, 9) : setBits(boschRegisters.res_reg_MODE, 0, 9, 9);
  // MODE.TDCE
  boschRegisters.res_reg_MODE = params.par_tdc_dat.value ? setBits(boschRegisters.res_reg_MODE, 1, 2, 2) : setBits(boschRegisters.res_reg_MODE, 0, 2, 2);
  // MODE.XLOE
  boschRegisters.res_reg_MODE = setBits(boschRegisters.res_reg_MODE, 1, 1, 1);
  // MODE.FDOE
  boschRegisters.res_reg_MODE = setBits(boschRegisters.res_reg_MODE, 1, 0, 0);

  // NBTP.BRP
  boschRegisters.res_reg_NBTP = setBits(boschRegisters.res_reg_NBTP, params.par_brp.value -1, 29, 25);
  // NBTP.NTSEG1
  boschRegisters.res_reg_NBTP = setBits(boschRegisters.res_reg_NBTP, params.par_propseg_arb.value + params.par_phaseseg1_arb.value -1, 24, 16);
  // NBTP.NTSEG2
  boschRegisters.res_reg_NBTP = setBits(boschRegisters.res_reg_NBTP, params.par_phaseseg2_arb.value -1, 14, 8);
  // NBTP.SJW
  boschRegisters.res_reg_NBTP = setBits(boschRegisters.res_reg_NBTP, params.par_sjw_arb.value -1, 6, 0);

  // XBTP.XTDCO
  boschRegisters.res_reg_XBTP = (params.par_tdc_dat.value && !params.par_tms.value) ? setBits(boschRegisters.res_reg_XBTP, results.res_sspoffset_dat, 31, 24) : setBits(boschRegisters.res_reg_XBTP, 0, 31, 24);
  // XBTP.XTSEG1
  boschRegisters.res_reg_XBTP = setBits(boschRegisters.res_reg_XBTP, params.par_propseg_dat.value + params.par_phaseseg1_dat.value -1, 23, 16);
  // XBTP.XTSEG2
  boschRegisters.res_reg_XBTP = setBits(boschRegisters.res_reg_XBTP, params.par_phaseseg2_dat.value -1, 14, 8);
  // XBTP.XSJW
  boschRegisters.res_reg_XBTP = setBits(boschRegisters.res_reg_XBTP, params.par_sjw_dat.value -1, 6, 0);

  if (params.par_tms.value === true) {
    // PCFG.PWMO
    boschRegisters.res_reg_PCFG = setBits(boschRegisters.res_reg_PCFG, results.res_pwmo, 21, 16);
    // PCFG.PWML
    boschRegisters.res_reg_PCFG = setBits(boschRegisters.res_reg_PCFG, results.res_pwml-1, 13, 8);
    // PCFG.PWMS
    boschRegisters.res_reg_PCFG = setBits(boschRegisters.res_reg_PCFG, results.res_pwms-1, 5, 0);
  }

  // Convert Register-Values into Hex-Strings (0x AA BB CC DD)
  for (const [name, val] of Object.entries(boschRegisters)) {
    results[name] =
      '0x ' +
      val
        .toString(16)
        .toUpperCase()
        .padStart(8, '0')
        .match(/.{2}/g) // in 2er-Gruppen (Bytes) teilen
        .join(' ');  }
}

// ===================================================================================
// calculate results from params
function calculate(params) {
  // input: params object with all parameters
  // output: results object with all calculated results
  
  const results = {};

  // --- define local function ----------------------------
  // Calculates the number of PWM symbols per Bit (local function)
  function getPWMsymbolsPerBit(bit_len_in_clk_periods, clk_period_ns) {
    let result_PWMsymbolsPerBit =   0; // return value
    const min_pwm_symbol_len_ns =  50; // ns
    const max_pwm_symbol_len_ns = 200; // ns
   
    // check if search is necessary, or 1 PWM symbol is fine
    if ((bit_len_in_clk_periods * clk_period_ns) <= max_pwm_symbol_len_ns) {
 	    // check if search is necessary, or bit rate is too high
 	    if ((bit_len_in_clk_periods * clk_period_ns) < min_pwm_symbol_len_ns) {
 	    	return 0; // NO PWM POSSIBLE (Error case)
 	    } else {	
 	    	return 1; // 1 PWM symbol per bit
 	    }
    }
    
    // Here it is clear: >1 PWM symbols needed.
    // Search for the biggest PWM symbol usable; stop when smallest allowed PWM symbol reached
    // HINT: There is no valid result (solution), if bit_len_in_clk_periods is no integer multiple of any valid PWM symbol length
    
    // determine the minimum devisor to start with (min value should be at least 2)
    let min_pwm_symbols_per_bit = Math.ceil((bit_len_in_clk_periods * clk_period_ns) / max_pwm_symbol_len_ns);
    
    for (let i = min_pwm_symbols_per_bit; i < 100; i++) {
    if ((bit_len_in_clk_periods % i) === 0) {
      // integer divisor found
      // no we need to check if the PWM symbol is long enough, > min PWM symbol length
      const pwm_symbol_len_in_clk_periods = bit_len_in_clk_periods / i;
      const pwm_symbol_len_in_ns = pwm_symbol_len_in_clk_periods * clk_period_ns;
      if (pwm_symbol_len_in_ns >= min_pwm_symbol_len_ns) {
 	    // valid PWM symbol length found
 	    result_PWMsymbolsPerBit = i;
      } else { // NO valid PWM symbol length found
 	    result_PWMsymbolsPerBit = 0; // error feedback
      }
 		break; // Schleife wird hier beendet
      }
    }
    
    return result_PWMsymbolsPerBit;
  }

  // Calculate results
  results['res_clk_period']   = 1000/params.par_clk_freq.value;
  results['res_tqperbit_arb'] = 1 + params.par_propseg_arb.value + params.par_phaseseg1_arb.value + params.par_phaseseg2_arb.value;
  results['res_tqperbit_dat'] = 1 + params.par_propseg_dat.value + params.par_phaseseg1_dat.value + params.par_phaseseg2_dat.value;
  results['res_bitrate_arb']  = params.par_clk_freq.value / (params.par_brp.value * results.res_tqperbit_arb);
  results['res_bitrate_dat']  = params.par_clk_freq.value / (params.par_brp.value * results.res_tqperbit_dat);
  results['res_sp_arb']       = (1 - params.par_phaseseg2_arb.value/results.res_tqperbit_arb) * 100;
  results['res_sp_dat']       = (1 - params.par_phaseseg2_dat.value/results.res_tqperbit_dat) * 100;

  if (params.par_tdc_dat.value === true) {
	  if (params.par_tms.value === false) {
	    results['res_sspoffset_dat']= (params.par_propseg_dat.value + params.par_phaseseg1_dat.value + 1)* params.par_brp.value - 1;
    } else { // true
	    results['res_sspoffset_dat']= 'TMS on';
    }
  } else { // tdc=false
	  results['res_sspoffset_dat']= 'TDC off';
	}
	
  if (typeof results.res_sspoffset_dat === "number") {
    results['res_ssp_dat'] = results.res_sspoffset_dat/(results.res_tqperbit_dat*params.par_brp.value) * 100;
  } else if (typeof results.res_sspoffset_dat === "string") {
	  results['res_ssp_dat'] = results.res_sspoffset_dat;
  }
  
  results['res_bitlength_arb'] = 1000 / results.res_bitrate_arb;
  results['res_bitlength_dat'] = 1000 / results.res_bitrate_dat;
	
  results['res_tqlen'] = results.res_clk_period * params.par_brp.value;

  // PWM Ergenisse
  // derive the number of PWM symbols per bit
  let pwm_symbols_per_bit = getPWMsymbolsPerBit(results.res_tqperbit_dat * params.par_brp.value, results.res_clk_period);

	if (pwm_symbols_per_bit > 0) {
		// result found
		let pwm_symbol_length_in_clk_periods = (results.res_tqperbit_dat * params.par_brp.value)/pwm_symbols_per_bit;
		
		results['res_pwms'] = Math.ceil(pwm_symbol_length_in_clk_periods/4);
		results['res_pwml'] = pwm_symbol_length_in_clk_periods - results.res_pwms;
		results['res_pwmo'] = (results.res_tqperbit_arb * params.par_brp.value) % pwm_symbol_length_in_clk_periods;
		
		results['res_pwm_symbol_len_ns']         = pwm_symbol_length_in_clk_periods * results.res_clk_period;
		results['res_pwm_symbol_len_clk_cycles'] = pwm_symbol_length_in_clk_periods;
		results['res_pwm_symbols_per_bit_time']  = pwm_symbols_per_bit;
		
	} else { // no result found for PWM settings for this bit rate
		results['res_pwmo'] = 'no PWM';
		results['res_pwms'] = "config";
		results['res_pwml'] = 'exists';

		results['res_pwm_symbol_len_ns']         = "no PWM";
		results['res_pwm_symbol_len_clk_cycles'] = 'config';
		results['res_pwm_symbols_per_bit_time']  = 'exists';
	}
	
	// check if TMS disabled
	if (params.par_tms.value === false) {
	  results['res_pwms'] = 'TMS off';
	  results['res_pwml'] = 'TMS off';
	  results['res_pwmo'] = 'TMS off';
	  
	  results['res_pwm_symbol_len_ns']         = 'TMS off';
	  results['res_pwm_symbol_len_clk_cycles'] = 'TMS off';
	  results['res_pwm_symbols_per_bit_time']  = 'TMS off';
	}	

  return results; // return results object
}

// ===================================================================================
// Print Results to HTML fields
function printResults(results) {

  for (const [id, val] of Object.entries(results)) {
    const field = document.getElementById(id);
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
    }
  }

}

// ===================================================================================
// ProcessChanges(): Collect input values, Calculate results, Draw Figures
function processChanges() {
  // Collect parameters from HTML (raw values)
  const params = paramsCollect();

  // Validate parameters (also enriches params object with valid/invalid flags and error messages)
  let allParamsValid = paramsValidate(params);

  // react on invalid parameters
  if (allParamsValid === false) {
    // write ERROR into all result fields
    resultFields.forEach(field => (field.value = 'err'));
    return; // STOP further processing
  }

  // Valid parameters at this point: continue with calculations

  // calcualte results
  const results = calculate(params); // returns results object

  // generate Register Contents: Bosch X_CAN, XS_CAN, X_CANB
  generateHardwareRegisters(results, params);

  // Print results to HTML fields
  printResults(results);

  // Draw Bit Timing: Arbitration Phase
  drawBitTiming(
    params.par_propseg_arb.value,
    params.par_phaseseg1_arb.value,
    params.par_phaseseg2_arb.value,
    results.res_sp_arb, // Sample Point in % of Bit Time
    params.par_sjw_arb.value, // SJW Length in TQ
    10, // SSP in % of Bit Time => not used because TDC = false
    false, // TDC disabled (false)
    'DrawingBTArb', // name of SVG element in HTML
    'Arbitration Phase' // label in Drawing
  ); 
  
  // Draw Bit Timing: XL Data Phase
  drawBitTiming(
    params.par_propseg_dat.value, 
    params.par_phaseseg1_dat.value,
    params.par_phaseseg2_dat.value,
    results.res_sp_dat, // Sample Point in % of Bit Time
    params.par_sjw_dat.value, // SJW Length in TQ
    results.res_ssp_dat, // SSP in % of Bit Time
    params.par_tdc_dat.value, // TDC enabled (true) or disabled (false)
    'DrawingBTXLdata', // name of SVG element in HTML
    'XL Data Phase' // label in Drawing
  ); 

  // Draw PWM symbols for XL Data Phase
  if (params.par_tms.value === true) {
    // Check if PWM symbols exist
    if (results.res_pwm_symbols_per_bit_time > 0) {
      // Draw PWM symbols
      drawPWMsymbols(results.res_pwms, results.res_pwml, results.res_pwm_symbols_per_bit_time, 'DrawingBTXLdataPWM', 'XL Data Phase PWM symbols');
    } else { // no PWM symbols exist
      // Draw PWM symbols with error message
      drawPWMsymbols(0, 0, 0, 'DrawingBTXLdataPWM', 'XL Data Phase: no PWM config exists');  
    }
  } else {
    // Draw PWM symbols with error message
    drawPWMsymbols(0, 0, 0, 'DrawingBTXLdataPWM', 'XL Data Phase: TMS = off');
  }

  // Legend for Bit Timing Drawings: adapt width to table width
  document.getElementById("DrawingBTLegend").style.width =   document.getElementById("BitTimingTable").offsetWidth + "px";
}

// ===================================================================================
// Set Example Bit Timing Configurations from CiA 612-1
function setExampleBTconfig() {
  const selected = document.getElementById('btConfigSelect').value;
  let bt_cfg_preset = null; // default value

  // Order of parameter-ids (columns of the config matrix)
  const paramIds = [
    'par_clk_freq',
    'par_dfused',
    'par_clk_jitter',

    'par_brp',
    'par_propseg_arb',
    'par_phaseseg1_arb',
    'par_phaseseg2_arb',
    'par_sjw_arb',

    'par_propseg_dat',
    'par_phaseseg1_dat',
    'par_phaseseg2_dat',
    'par_sjw_dat',
    'par_tdc_dat',
	  'par_tms',
  ];

  // Konfigurationsmatrix: Jede Zeile enthält alle Werte der oben definierten IDs
  const configMatrixSICXL = {
    cfg01M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0, 80, 79, 79, true, true],
    cfg02M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0, 40, 39, 39, true, true],
    cfg05M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0, 16, 15, 15, true, true],
    cfg08M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0, 10,  9,  9, true, true],
	  cfg10M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0,  8,  7,  7, true, true],
    cfg12M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0,  6,  6,  6, true, true],
    cfg13M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0,  6,  5,  5, true, true],
    cfg14M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0,  5,  5,  5, true, true],
    cfg16M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0,  5,  4,  4, true, true],
	  cfg17M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0,  4,  4,  4, true, true],
	  cfg20M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0,  4,  3,  3, true, true]	
  };
  // TODO: adapt values for SIC transceivers
  const configMatrixSIC = {
    cfg01M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0, 80, 79, 79, true, false],
    cfg02M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0, 40, 39, 39, true, false],
    cfg05M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0, 16, 15, 15, true, false],
    cfg08M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0, 10,  9,  9, true, false]
  };
// TODO: adapt values for FD transceivers
  const configMatrixFD = {
    cfg01M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0, 80, 79, 79, true, false],
    cfg02M: [160, 0.2, 700, 1, 191, 64, 64, 64, 0, 40, 39, 39, true, false]
  };

  // select BTconfigData from matrix based on transceiverType
  if ((transceiverType === 'TSICXL')) {
    bt_cfg_preset = configMatrixSICXL[selected];
  } else if (transceiverType === 'TSIC') {
    bt_cfg_preset = configMatrixSIC[selected];
  } else if (transceiverType === 'TFD') {
    bt_cfg_preset = configMatrixFD[selected];
  }
  
  if (!bt_cfg_preset) {
	  console.log('[Error] setExampleBTconfig(): bt_cfg_preset variable has no content!');
	  return;
  }
  
  // copy values from array to the document
  bt_cfg_preset.forEach((val, index) => {
    const id = paramIds[index];
    const input = document.getElementById(id);
    if (input) {
		if (checkboxParams.includes(id)) {
			input.checked = val;
		} else {
			input.value = val;
		}
	}
  });
  
  // calculate results
  processChanges();
}

/**
 * Zeichnet das CAN Bit Timing als Balkendiagramm mit SVG.
 * @param {string} HTMLDrawingName - Name des SVG-Elements, in dem gezeichnet werden soll.
 *   Beispiel: 'DrawingBTNominal' für das nominale Bit Timing.
 * @param {string} BitTimingName - Name des Bit Timings, der im Balkenbereich angezeigt wird.
 *   Beispiel: 'Nominal Bit Timing' für das nominale Bit Timing.
 * @param {number} spPercent - Prozentualer Wert des Sample-Punkts (0-100).
 *   Beispiel: 80 für 80% des Bit Timing. 
 * @param {number} PropSeg, PhaseSeg1, PhaseSeg2, sjwLen - Bit timing parameter in TQ.
 * @param {number} sspPercent - Prozentualer Wert des SSP (0-100).
 *   Beispiel: 60 für 60% des Bit Timing.
 * @param {number} tdcEna - TDC enabled (true) or disabled (false).
 */
// ===================================================================================
function drawBitTiming(PropSeg, PhaseSeg1, PhaseSeg2, spPercent, sjwLen, sspPercent, tdcEna, HTMLDrawingName, BitTimingName) {
  // svg widht/height
  const svgHeight = 60; // Height of the SVG element in Pixel
  const svgWidth = document.getElementById('BitTimingTable').offsetWidth; // Width of the SVG element

  // dimension svg element
  svg = document.getElementById(HTMLDrawingName);
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);

  // Erase previous content (drawing + text)
  svg.innerHTML = '';

  // define colors
  sjwColor = '#999999'; // Farbe der SJW Linie
  spColor = 'red'; // Farbe der Sample Point Linie
  sspColor = '#800080'; // Farbe der SSP Linie (TDC)
  textColor = 'black'; // Farbe der Beschriftung
  syncSegColor = '#555555'; // Farbe des SyncSeg Balkens
  PropSegColor = '#4CAF50'; // Farbe des PropSeg Balkens
  PhaseSeg1Color = '#2196F3'; // Farbe des PhaseSeg1 Balkens
  PhaseSeg2Color = '#FF9800'; // Farbe des PhaseSeg2 Balkens

  // Positions in SVG
  const fontSize = 14; // Schriftgröße
  const yTextSP = 0; // Text position SP
  const yTextName = 0; // Y-Position des Textes
  const xTextName = 0; // X-Position des Textes

  const ySPueberstand = 5; // Sample Point Line übersteht den Balken um 5px nach oben und unten
  const yBarTop = fontSize + ySPueberstand + 2; // Y-Position of bar
  const yBarHeigth = svg.clientHeight - yBarTop - ySPueberstand;

  const spLineWidht = 5; // Dicke der SP Linie
  const sspLineWidht = 2; // Dicke der SSP Linie
  const sjwLineWidth = 8; // Dicke der SJW Linie

  // Berechnungen für die Balken
  const totalTQ = 1 + PropSeg + PhaseSeg1 + PhaseSeg2;; // Gesamtlänge in TQ
  let x = 0; // current x-Position in SVG

  // Sample Point
  let sampleX = null;
  let segWidthPixel = 0; // width of the current segment in pixels
  let rect = null; // SVG rectangle element for segments

  // DEBUG: draw a rectangle around the SVG area
  //const debugRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  //debugRect.setAttribute('x', 0);
  //debugRect.setAttribute('y', 0);
  //debugRect.setAttribute('width', svgWidth);
  //debugRect.setAttribute('height', svgHeight);
  //debugRect.setAttribute('fill', 'none');
  //debugRect.setAttribute('stroke', 'red');
  //debugRect.setAttribute('stroke-width', 1);
  //svg.appendChild(debugRect);

  // SyncSeg drawing ----------------------------------
  segWidthPixel = (1 / totalTQ) * svgWidth;
  rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', yBarTop); // 25px Abstand von oben
  rect.setAttribute('width', segWidthPixel);
  rect.setAttribute('height', yBarHeigth);
  rect.setAttribute('fill', syncSegColor);
  svg.appendChild(rect);
  x += segWidthPixel; // x-Position for next Segment

  // PropSeg drawing ----------------------------------
  segWidthPixel = (PropSeg / totalTQ) * svgWidth;
  rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', yBarTop); // 25px Abstand von oben
  rect.setAttribute('width', segWidthPixel);
  rect.setAttribute('height', yBarHeigth);
  rect.setAttribute('fill', PropSegColor);
  svg.appendChild(rect);
  x += segWidthPixel; // x-Position for next Segment

  // PhaseSeg1 drawing ----------------------------------
  segWidthPixel = (PhaseSeg1 / totalTQ) * svgWidth;
  rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', yBarTop); // 25px Abstand von oben
  rect.setAttribute('width', segWidthPixel);
  rect.setAttribute('height', yBarHeigth);
  rect.setAttribute('fill', PhaseSeg1Color);
  svg.appendChild(rect);
  x += segWidthPixel; // x-Position for next Segment

  // SP Position: X-Postion merken
  sampleX = x; // Position am Ende des PhaseSeg1, hier wird der Sample Point gezeichnet
  
  // PhaseSeg1 drawing ----------------------------------
  segWidthPixel = (PhaseSeg2 / totalTQ) * svgWidth;
  rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', yBarTop); // 25px Abstand von oben
  rect.setAttribute('width', segWidthPixel);
  rect.setAttribute('height', yBarHeigth);
  rect.setAttribute('fill', PhaseSeg2Color);
  svg.appendChild(rect);

  // SJW drawing ----------------------------------------
  const sjwPixel = (sjwLen / totalTQ) * svgWidth;
  const sjwLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  sjwLine.setAttribute('x1', sampleX - sjwPixel);
  sjwLine.setAttribute('x2', sampleX + sjwPixel);
  sjwLine.setAttribute('y1', yBarTop + yBarHeigth - sjwLineWidth/2);
  sjwLine.setAttribute('y2', yBarTop + yBarHeigth - sjwLineWidth/2);
  sjwLine.setAttribute('stroke', sjwColor);
  sjwLine.setAttribute('stroke-width', sjwLineWidth);
  sjwLine.setAttribute('marker-start', 'url(#arrow)');
  sjwLine.setAttribute('marker-end', 'url(#arrow)');
  svg.appendChild(sjwLine);

  // SP drawing ----------------------------------------
  if (sampleX !== null && typeof spPercent === 'number') {
    // Sample Point Line
    const spLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    spLine.setAttribute('x1', sampleX);
    spLine.setAttribute('x2', sampleX);
    spLine.setAttribute('y1', yBarTop - ySPueberstand);
    spLine.setAttribute('y2', yBarTop + yBarHeigth + ySPueberstand);
    spLine.setAttribute('stroke', spColor);
    spLine.setAttribute('stroke-width', spLineWidht);
    svg.appendChild(spLine);
    // Sample Point Label
    const spLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    spLabel.setAttribute('x', sampleX);
    spLabel.setAttribute('y', yTextSP);
    spLabel.setAttribute('fill', spColor);
    spLabel.setAttribute('font-size', fontSize);
    spLabel.setAttribute('font-family', 'sans-serif');
    spLabel.setAttribute('text-anchor', 'middle');
    spLabel.setAttribute('dominant-baseline', 'text-before-edge'); // Vertical alignment: auto, middle, central, hanging, text-before-edge, text-after-edge, alphabetic (default), ideographic
    spLabel.textContent = `SP ${Math.round(spPercent)}%`;
    svg.appendChild(spLabel);
  } else {
    console.log(`[Error] drawBitTiming(${BitTimingName}): sampleX or spPercent is not defined!`);
  }

  // SSP drawing -----------------------------------------
  if (tdcEna === true && typeof sspPercent === 'number') {
    const xSSPposition = sspPercent/100 * svgWidth; // X-Position of SSP Line
    // SSP Line
    const spLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    spLine.setAttribute('x1', xSSPposition);
    spLine.setAttribute('x2', xSSPposition);
    spLine.setAttribute('y1', yBarTop - ySPueberstand);
    spLine.setAttribute('y2', yBarTop + yBarHeigth + ySPueberstand);
    spLine.setAttribute('stroke', sspColor);
    spLine.setAttribute('stroke-width', sspLineWidht);
    svg.appendChild(spLine);
    //// SSP Label
    //const spLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    //spLabel.setAttribute('x', sampleX);
    //spLabel.setAttribute('y', yTextSP);
    //spLabel.setAttribute('fill', sspColor);
    //spLabel.setAttribute('font-size', fontSize);
    //spLabel.setAttribute('font-family', 'sans-serif');
    //spLabel.setAttribute('text-anchor', 'middle');
    //spLabel.setAttribute('dominant-baseline', 'text-before-edge'); // Vertical alignment: auto, middle, central, hanging, text-before-edge, text-after-edge, alphabetic (default), ideographic
    //spLabel.textContent = `SP ${Math.round(sspPercent)}%`;
    //svg.appendChild(spLabel);
  } else {
    // since SSP is optional, we can skip this part
    // Debug: console.log(`[Error] drawBitTiming(${BitTimingName}): tdcEna or sspPercent is not defined!`);
  }

  // Gesamtbeschriftung im Balkenbereich (links)
  const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleText.setAttribute('x', xTextName);       // Abstand vom linken Rand
  titleText.setAttribute('y', yTextName);  
  titleText.setAttribute('fill', textColor);
  titleText.setAttribute('font-size', fontSize);
  titleText.setAttribute('font-family', 'sans-serif');
  titleText.setAttribute('dominant-baseline', 'text-before-edge'); // Vertical alignment: auto, middle, central, hanging, text-before-edge, text-after-edge, alphabetic (default), ideographic
  titleText.textContent = BitTimingName;
  svg.appendChild(titleText);
}

// ===================================================================================
// Draw PWM symbols of 1 XL Data Phase Bit
function drawPWMsymbols(PWMS, PWML, pwm_symbols_per_bit, HTMLDrawingName, NameToPrint) {
  // svg widht/height
  const svgHeight = 60; // Height of the SVG element in Pixel
  const svgWidth = document.getElementById('BitTimingTable').offsetWidth; // Width of the SVG element

  // dimension svg element
  svg = document.getElementById(HTMLDrawingName);
  svg.setAttribute('width', svgWidth);
  svg.setAttribute('height', svgHeight);

  // Erase previous content (drawing + text)
  svg.innerHTML = '';

  // Positions in SVG
  const fontSize = 14; // Schriftgröße
  const yTextName = 0; // Y-Position des Textes
  const xTextName = 0; // X-Position des Textes

  const lineWidth = 6; // Dicke der SJW Linie
  const lineColor = 'black'; // Color of the Line
  const noPWMboxColor = '#DDDDDD'; // Color of the box, if no PWM symbols are possible

  const yMarginText2PWM = 7; // Sample Point Line übersteht den Balken um 5px nach oben und unten
  const yMarginPWM2Bottom = lineWidth/2 + 1; // Margin from PWM symbols to bottom of SVG: as much, that the line is fully visible
  const y_pwm_top = fontSize + yMarginText2PWM + lineWidth/2; // y-Position of PWM symbol
  const y_pwm_bottom = svg.clientHeight - yMarginPWM2Bottom; // y-Position des Balkens unten

  // Calculate pixels for PWMs and PWML
  const totalMTQ = (PWMS + PWML) * pwm_symbols_per_bit; // Total lenght in mTQ (minimum TQ = CAN CLOCK Periods)
  
  // Drawing the PWM symbols
  let x = lineWidth/2; // current position in SVG, start with half line width to center the first symbol

  // DEBUG: draw a rectangle around the SVG area
  //const debugRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  //debugRect.setAttribute('x', 0);
  //debugRect.setAttribute('y', 0);
  //debugRect.setAttribute('width', svgWidth);
  //debugRect.setAttribute('height', svgHeight);
  //debugRect.setAttribute('fill', 'none');
  //debugRect.setAttribute('stroke', 'red');
  //debugRect.setAttribute('stroke-width', 1);
  //svg.appendChild(debugRect);

  if (pwm_symbols_per_bit > 0) {
    // Draw PWM symbols
    for (let i = 0; i < pwm_symbols_per_bit; i++) {
      // Berechne Breite des aktuellen PWM-Symbols
      const PWMSwidthPX = (svgWidth / totalMTQ) * PWMS; // Width of PWMS in Pixel
      const PWMLwidthPX = (svgWidth / totalMTQ) * PWML; // Width of PWML in Pixel
    
      // PWMS: Vertical rising edge of PWM Symbol
      let myline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      myline.setAttribute('x1', x);
      myline.setAttribute('x2', x);
      myline.setAttribute('y1', y_pwm_bottom);
      myline.setAttribute('y2', y_pwm_top);
      myline.setAttribute('stroke', lineColor);
      myline.setAttribute('stroke-width', lineWidth);
      myline.setAttribute('stroke-linecap', 'square'); // or round, square or butt
      svg.appendChild(myline);
    
      // PWMS: Horizontal line
      myline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      myline.setAttribute('x1', x);
      myline.setAttribute('x2', x + PWMSwidthPX);
      myline.setAttribute('y1', y_pwm_top);
      myline.setAttribute('y2', y_pwm_top);
      myline.setAttribute('stroke', lineColor);
      myline.setAttribute('stroke-width', lineWidth);
      myline.setAttribute('stroke-linecap', 'square'); // or round, square or butt
      svg.appendChild(myline);
    
      x += PWMSwidthPX; // update X position for next line
    
      // PWML: Vertical rising edge of PWM Symbol
      myline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      myline.setAttribute('x1', x);
      myline.setAttribute('x2', x);
      myline.setAttribute('y1', y_pwm_top);
      myline.setAttribute('y2', y_pwm_bottom);
      myline.setAttribute('stroke', lineColor);
      myline.setAttribute('stroke-width', lineWidth);
      myline.setAttribute('stroke-linecap', 'square'); // or round, square or butt
      svg.appendChild(myline);
    
      // PWML: Horizontal line
      myline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      myline.setAttribute('x1', x);
      myline.setAttribute('x2', x + PWMLwidthPX);
      myline.setAttribute('y1', y_pwm_bottom);
      myline.setAttribute('y2', y_pwm_bottom);
      myline.setAttribute('stroke', lineColor);
      myline.setAttribute('stroke-width', lineWidth);
      myline.setAttribute('stroke-linecap', 'square'); // or round, square or butt
      svg.appendChild(myline);
    
      x += PWMLwidthPX; // update X position for next line
    }
  } else {
    // No PWM symbols possible, draw a box
    // Draw a box to indicate no PWM symbols
    let myrect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');  
    myrect.setAttribute('x', 0);
    myrect.setAttribute('y', y_pwm_top - lineWidth/2); // y-Position of the top edge of the rectangle
    myrect.setAttribute('width', svgWidth); // fill the rest of the SVG
    myrect.setAttribute('height', y_pwm_bottom - y_pwm_top + lineWidth/2); // height of the rectangle
    myrect.setAttribute('fill', noPWMboxColor);
    svg.appendChild(myrect);
  }

  // Label
  const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  titleText.setAttribute('x', xTextName); // Distance from left edge
  titleText.setAttribute('y', yTextName); // Distance from top edge
  titleText.setAttribute('fill', 'black');
  titleText.setAttribute('font-size', fontSize);
  titleText.setAttribute('font-family', 'sans-serif');
  titleText.setAttribute('dominant-baseline', 'text-before-edge'); // Vertical alignment: auto, middle, central, hanging, text-before-edge, text-after-edge, alphabetic (default), ideographic
  titleText.textContent = NameToPrint;
  svg.appendChild(titleText);
}