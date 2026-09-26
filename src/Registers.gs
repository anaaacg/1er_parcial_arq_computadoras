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
}

/**
 * Obtiene el valor actual de una bandera.
 */
function getFlag(flagName) {
  if (!(flagName in Flags)) {
    throw new Error("Bandera inexistente: " + flagName);
  }

  return Flags[flagName];
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
