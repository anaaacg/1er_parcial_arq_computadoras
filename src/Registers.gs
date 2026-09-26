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

  return Registers[registerName];
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
