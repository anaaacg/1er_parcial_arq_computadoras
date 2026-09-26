// ============================================
// ALU - SIMULADOR CPU DE 8 BITS
// ============================================

/**
 * Mantiene un resultado dentro del rango de 8 bits.
 *
 * @param {number} value Valor a normalizar.
 * @return {number} Valor entre 0 y 255.
 */
function toByte(value) {
  return value & 0xFF;
}


/**
 * Suma dos valores de 8 bits.
 */
function aluAdd(a, b) {
  const result = a + b;

  updateCarryFlag(result);

  const byteResult = toByte(result);
  updateResultFlags(byteResult);

  return byteResult;
}

/**
 * Resta dos valores de 8 bits.
 */
function aluSub(a, b) {
  const result = a - b;

  updateCarryFlag(result);

  const byteResult = toByte(result);
  updateResultFlags(byteResult);

  return byteResult;
}

/**
 * Incrementa un valor en una unidad.
 */
function aluInc(value) {
  const result = value + 1;

  updateCarryFlag(result);

  const byteResult = toByte(result);
  updateResultFlags(byteResult);

  return byteResult;
}

/**
 * Decrementa un valor en una unidad.
 */
function aluDec(value) {
  const result = value - 1;

  updateCarryFlag(result);

  const byteResult = toByte(result);
  updateResultFlags(byteResult);

  return byteResult;
}

function testArithmeticOperations() {
  Logger.log("ADD 5 + 3 = " + aluAdd(5, 3));
  Logger.log("ADD 255 + 1 = " + aluAdd(255, 1));

  Logger.log("SUB 10 - 3 = " + aluSub(10, 3));
  Logger.log("SUB 0 - 1 = " + aluSub(0, 1));

  Logger.log("INC 5 = " + aluInc(5));
  Logger.log("INC 255 = " + aluInc(255));

  Logger.log("DEC 5 = " + aluDec(5));
  Logger.log("DEC 0 = " + aluDec(0));
}
