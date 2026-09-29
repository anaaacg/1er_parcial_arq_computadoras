// ============================================
// MEMORIA RAM - SIMULADOR CPU DE 8 BITS
// ============================================

// Cantidad total de posiciones de memoria
const MEMORY_SIZE = 256;

// Valores permitidos en una posición de 8 bits
const MIN_BYTE_VALUE = 0;
const MAX_BYTE_VALUE = 255;

// Nombre de la hoja donde se representa la memoria
const MEMORY_SHEET = "RAM";

// Posición inicial de la matriz 16x16 en Google Sheets
const MEMORY_START_ROW = 4;
const MEMORY_START_COLUMN = 2;


/**
 * Verifica si una dirección pertenece a la memoria RAM.
 * Direcciones válidas: 0 - 255 (00h - FFh).
 */
function isValidAddress(address) {
  return Number.isInteger(address) &&
         address >= 0 &&
         address < MEMORY_SIZE;
}

/**
 * Verifica si un valor puede almacenarse en una posición de 8 bits.
 * Valores válidos: 0 - 255.
 */
function isValidByte(value) {
  return Number.isInteger(value) &&
         value >= MIN_BYTE_VALUE &&
         value <= MAX_BYTE_VALUE;
}

/**
 * Convierte una dirección de memoria (0-255)
 * en su posición correspondiente dentro de la matriz 16x16.
 */
function addressToCell(address) {
  if (!isValidAddress(address)) {
    throw new Error("Dirección de memoria inválida: " + address);
  }

  const rowOffset = Math.floor(address / 16);
  const columnOffset = address % 16;

  return {
    row: MEMORY_START_ROW + rowOffset,
    column: MEMORY_START_COLUMN + columnOffset
  };
}

/**
 * Escribe un byte en una dirección de la memoria RAM.
 *
 * @param {number} address Dirección entre 0 y 255.
 * @param {number} value Valor entre 0 y 255.
 */
function Write(address, value) {
  if (!isValidAddress(address)) {
    throw new Error("Dirección de memoria inválida: " + address);
  }

  if (!isValidByte(value)) {
    throw new Error("Valor de 8 bits inválido: " + value);
  }

  highlightMemory(address);

  const position = addressToCell(address);

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(MEMORY_SHEET);

  if (!sheet) {
    throw new Error('No existe la hoja "' + MEMORY_SHEET + '".');
  }

  const hexValue = value
    .toString(16)
    .toUpperCase()
    .padStart(2, "0");

  sheet
    .getRange(position.row, position.column)
    .setValue(hexValue);
}


// pruebita
function testWrite() {
  Write(0x12, 0xAB);
}


/**
 * Lee el byte almacenado en una dirección de la memoria RAM.
 *
 * @param {number} address Dirección entre 0 y 255.
 * @return {number} Valor almacenado entre 0 y 255.
 */
function Read(address) {
  if (!isValidAddress(address)) {
    throw new Error("Dirección de memoria inválida: " + address);
  }

  highlightMemory(address);

  const position = addressToCell(address);

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(MEMORY_SHEET);

  if (!sheet) {
    throw new Error('No existe la hoja "' + MEMORY_SHEET + '".');
  }

  const value = sheet
    .getRange(position.row, position.column)
    .getValue();

  const byteValue = parseInt(value, 16);

  if (!isValidByte(byteValue)) {
    throw new Error(
      "La dirección " +
      address.toString(16).toUpperCase().padStart(2, "0") +
      "h no contiene un byte válido."
    );
  }

  return byteValue;
}

function testRead() {
  const value = Read(0x12);
  Logger.log(value);
}


/**
 * Muestra en el panel de inspección las diferentes
 * representaciones del byte almacenado en una dirección.
 */
function inspectMemory(address) {
  if (!isValidAddress(address)) {
    throw new Error("Dirección de memoria inválida: " + address);
  }

  const value = Read(address);

  const hexadecimal = value
    .toString(16)
    .toUpperCase()
    .padStart(2, "0");

  const binary = value
    .toString(2)
    .padStart(8, "0");

  const decimal = value;

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(MEMORY_SHEET);

  sheet.getRange("T4").setValue(
    address.toString(16).toUpperCase().padStart(2, "0") + "h"
  );

  sheet.getRange("T5").setValue(hexadecimal);
  sheet.getRange("T6").setValue(binary);
  sheet.getRange("T7").setValue(decimal);
  sheet.getRange("T8").setValue(getMnemonic(value));
}

function testInspectMemory() {
  Write(0x12, 0xAB);
  inspectMemory(0x12);
}

/**
 * Devuelve el mnemónico asociado a un opcode.
 * Si el byte no corresponde a una instrucción conocida,
 * devuelve "-".
 */
function getMnemonic(value) {
  const mnemonics = {
    0x01: "MOV reg, imm",
    0x02: "MOV reg, reg",
    0x03: "LOAD reg, [dir]",
    0x04: "STORE [dir], reg",

    0x10: "ADD reg, imm/reg",
    0x11: "SUB reg, imm/reg",
    0x12: "INC reg",
    0x13: "DEC reg",
    0x14: "CMP reg, imm/reg",

    0x20: "JMP dir",
    0x21: "JZ dir",
    0x22: "JNZ dir",

    0xFF: "HLT"
  };

  return mnemonics[value] || "-";
}

function testMnemonic() {
  Write(0x20, 0x10);
  inspectMemory(0x20);
}

// Segmentación lógica de la memoria
const CODE_START = 0x00;
const CODE_END   = 0x7F;

const DATA_START = 0x80;
const DATA_END   = 0xFF;

function testMemory() {
  Logger.log("=== PRUEBAS DE MEMORIA RAM ===");

  // 1. Primera dirección de memoria
  Write(0x00, 0x00);
  Logger.log("00h -> " + Read(0x00));

  // 2. Última dirección de memoria
  Write(0xFF, 0xFF);
  Logger.log("FFh -> " + Read(0xFF));

  // 3. Dirección intermedia
  Write(0x80, 0x7A);
  Logger.log("80h -> " + Read(0x80));

  // 4. Dirección inválida
  try {
    Write(256, 10);
    Logger.log("ERROR: se aceptó una dirección inválida");
  } catch (error) {
    Logger.log("OK: dirección 256 rechazada");
  }

  // 5. Dirección negativa
  try {
    Write(-1, 10);
    Logger.log("ERROR: se aceptó una dirección negativa");
  } catch (error) {
    Logger.log("OK: dirección -1 rechazada");
  }

  // 6. Valor mayor a 8 bits
  try {
    Write(0x10, 256);
    Logger.log("ERROR: se aceptó un valor mayor a 8 bits");
  } catch (error) {
    Logger.log("OK: valor 256 rechazado");
  }

  // 7. Valor negativo
  try {
    Write(0x10, -1);
    Logger.log("ERROR: se aceptó un valor negativo");
  } catch (error) {
    Logger.log("OK: valor -1 rechazado");
  }

  Logger.log("=== FIN DE PRUEBAS ===");
}
/**
 * Elimina el resaltado de todas las posiciones de RAM.
 */
function clearMemoryHighlight() {

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("RAM");

  if (!sheet) {
    throw new Error('No existe la hoja "RAM".');
  }

  sheet
    .getRange("B4:Q19")
    .setBackground(null);
}


/**
 * Resalta una dirección específica de RAM.
 *
 * 00h = B4
 * FFh = Q19
 *
 * @param {number} address Dirección entre 0 y 255.
 */
function highlightMemory(address) {

  if (
    !Number.isInteger(address) ||
    address < 0 ||
    address > 0xFF
  ) {
    throw new Error(
      "Dirección de memoria inválida: " + address
    );
  }

  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName("RAM");

  if (!sheet) {
    throw new Error('No existe la hoja "RAM".');
  }

  clearMemoryHighlight();

  const row = Math.floor(address / 16);
  const column = address % 16;

  sheet
    .getRange(
      4 + row,
      2 + column
    )
    .setBackground("#FFF2CC");
}


