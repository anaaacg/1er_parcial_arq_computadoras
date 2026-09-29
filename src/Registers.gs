// ============================================
// REGISTROS - SIMULADOR CPU DE 8 BITS
// ============================================

const Registers = {
  PC:  0x00,  // Program Counter
  IR:  0x00,  // Instruction Register
  MAR: 0x00,  // Memory Address Register
  MDR: 0x00,  // Memory Data Register

  AX:  0x00,  // Acumulador
  BX:  0x00   // Registro de propósito general
};

const Flags = {
  ZF: 0,  // Zero Flag
  CF: 0,  // Carry Flag
  SF: 0   // Sign Flag
};


const CPU_SHEET = "CPU";

const REGISTER_CELLS = {
  PC:  "C4",
  IR:  "C5",
  MAR: "C6",
  MDR: "C7",
  AX:  "C8",
  BX:  "C9"
};

/**
 * Quita el resaltado de todos los registros.
 */
function clearRegisterHighlights() {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CPU_SHEET);

  if (!sheet) {
    throw new Error('No existe la hoja "' + CPU_SHEET + '".');
  }

  Object.values(REGISTER_CELLS).forEach(function(cell) {
    sheet.getRange(cell).setBackground(null);
  });
}


/**
 * Resalta los registros que participan
 * en la operación actual del CPU.
 *
 * @param {string[]} registerNames Registros a resaltar.
 */
function highlightRegisters(registerNames) {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CPU_SHEET);

  if (!sheet) {
    throw new Error('No existe la hoja "' + CPU_SHEET + '".');
  }

  clearRegisterHighlights();

  registerNames.forEach(function(registerName) {

    if (!(registerName in REGISTER_CELLS)) {
      throw new Error(
        "Registro inexistente para resaltar: " + registerName
      );
    }

    sheet
      .getRange(REGISTER_CELLS[registerName])
      .setBackground("#FFF2CC");
  });
}

const FLAG_CELLS = {
  ZF: "F4",
  CF: "F5",
  SF: "F6"
};

/**
 * Escribe un valor de 8 bits en un registro.
 *
 * @param {string} registerName Nombre del registro.
 * @param {number} value Valor entre 0 y 255.
 */
function setRegister(registerName, value) {
  if (!(registerName in Registers)) {
    throw new Error("Registro inexistente: " + registerName);
  }

  if (!Number.isInteger(value) || value < 0 || value > 255) {
    throw new Error("Valor de 8 bits inválido: " + value);
  }

  Registers[registerName] = value;
  updateRegisterDisplay(registerName);
}

/**
 * Obtiene el valor actual de un registro.
 *
 * @param {string} registerName Nombre del registro.
 * @return {number} Valor almacenado en el registro.
 */
function getRegister(registerName) {

  if (!(registerName in Registers)) {
    throw new Error("Registro inexistente: " + registerName);
  }

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CPU_SHEET);

  if (!sheet) {
    throw new Error('No existe la hoja "' + CPU_SHEET + '".');
  }

  const value = sheet
    .getRange(REGISTER_CELLS[registerName])
    .getValue();

  if (value === "" || value === null) {
    return 0;
  }

  const parsedValue = parseInt(String(value), 16);

  if (isNaN(parsedValue)) {
    throw new Error(
      "Valor inválido en el registro " +
      registerName +
      ": " +
      value
    );
  }

  // Sincronizar también el objeto interno
  Registers[registerName] = parsedValue;

  return parsedValue;
}

function testRegisters() {
  setRegister("AX", 0x25);
  setRegister("BX", 0xFF);
  setRegister("PC", 0x10);

  Logger.log("AX = " + getRegister("AX"));
  Logger.log("BX = " + getRegister("BX"));
  Logger.log("PC = " + getRegister("PC"));

  try {
    setRegister("AX", 256);
    Logger.log("ERROR: se aceptó un valor mayor a 8 bits");
  } catch (error) {
    Logger.log("OK: valor 256 rechazado");
  }
}

/**
 * Modifica el valor de una bandera del CPU.
 * Las banderas únicamente pueden contener 0 o 1.
 */
function setFlag(flagName, value) {
  if (!(flagName in Flags)) {
    throw new Error("Bandera inexistente: " + flagName);
  }

  if (value !== 0 && value !== 1) {
    throw new Error("Una bandera solo puede contener 0 o 1.");
  }

  Flags[flagName] = value;
  updateFlagDisplay(flagName);
}

/**
 * Obtiene el valor actual de una bandera.
 */
function getFlag(flagName) {

  if (!(flagName in Flags)) {
    throw new Error("Bandera inexistente: " + flagName);
  }

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CPU_SHEET);

  if (!sheet) {
    throw new Error('No existe la hoja "' + CPU_SHEET + '".');
  }

  const value = Number(
    sheet
      .getRange(FLAG_CELLS[flagName])
      .getValue()
  );

  if (value !== 0 && value !== 1) {
    throw new Error(
      "Valor inválido en la bandera " +
      flagName +
      ": " +
      value
    );
  }

  Flags[flagName] = value;

  return value;
}

function testFlags() {
  setFlag("ZF", 1);
  setFlag("CF", 0);
  setFlag("SF", 1);

  Logger.log("ZF = " + getFlag("ZF"));
  Logger.log("CF = " + getFlag("CF"));
  Logger.log("SF = " + getFlag("SF"));

  try {
    setFlag("ZF", 2);
    Logger.log("ERROR: se aceptó un valor inválido");
  } catch (error) {
    Logger.log("OK: valor de bandera inválido rechazado");
  }
}

/**
 * Actualiza las banderas ZF y SF a partir
 * de un resultado de 8 bits.
 */
function updateResultFlags(result) {
  const byteResult = result & 0xFF;

  // Zero Flag
  setFlag("ZF", byteResult === 0 ? 1 : 0);

  // Sign Flag: bit más significativo
  setFlag("SF", (byteResult & 0x80) !== 0 ? 1 : 0);
}

/**
 * Actualiza Carry Flag comprobando si un resultado
 * está fuera del rango sin signo de 8 bits.
 */
function updateCarryFlag(result) {
  setFlag("CF", result > 0xFF || result < 0 ? 1 : 0);
}

function testFlagUpdates() {
  // Caso 1: resultado cero
  updateResultFlags(0);
  updateCarryFlag(0);

  Logger.log(
    "Resultado 0 -> ZF=" + getFlag("ZF") +
    " CF=" + getFlag("CF") +
    " SF=" + getFlag("SF")
  );

  // Caso 2: bit de signo activo
  updateResultFlags(128);
  updateCarryFlag(128);

  Logger.log(
    "Resultado 128 -> ZF=" + getFlag("ZF") +
    " CF=" + getFlag("CF") +
    " SF=" + getFlag("SF")
  );

  // Caso 3: acarreo
  updateResultFlags(256);
  updateCarryFlag(256);

  Logger.log(
    "Resultado 256 -> ZF=" + getFlag("ZF") +
    " CF=" + getFlag("CF") +
    " SF=" + getFlag("SF")
  );
}

/**
 * Actualiza visualmente un registro en la hoja CPU.
 */
function updateRegisterDisplay(registerName) {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CPU_SHEET);

  if (!sheet) {
    throw new Error('No existe la hoja "' + CPU_SHEET + '".');
  }

  // Usar directamente el valor interno que setRegister()
  // acaba de modificar.
  const value = Registers[registerName];

  const hexadecimal = value
    .toString(16)
    .toUpperCase()
    .padStart(2, "0");

  sheet
    .getRange(REGISTER_CELLS[registerName])
    .setValue(hexadecimal);
}

/**
 * Actualiza visualmente una bandera en la hoja CPU.
 */
function updateFlagDisplay(flagName) {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(CPU_SHEET);

  if (!sheet) {
    throw new Error('No existe la hoja "' + CPU_SHEET + '".');
  }

  // Usar directamente el valor que setFlag()
  // acaba de modificar.
  sheet
    .getRange(FLAG_CELLS[flagName])
    .setValue(Flags[flagName]);
}

function testCPUDisplay() {
  setRegister("PC",  0x10);
  setRegister("IR",  0x20);
  setRegister("MAR", 0x30);
  setRegister("MDR", 0x40);
  setRegister("AX",  0x25);
  setRegister("BX",  0xFF);

  setFlag("ZF", 1);
  setFlag("CF", 0);
  setFlag("SF", 1);
}
