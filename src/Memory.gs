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
