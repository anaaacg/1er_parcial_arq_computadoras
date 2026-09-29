// ============================================
// CPU - SIMULADOR CPU DE 8 BITS
// ============================================


// ============================================
// CONJUNTO DE INSTRUCCIONES
// ============================================

const INSTRUCTION_SET = {
  0x01: { mnemonic: "MOV",   type: "REG_IMM", bytes: 4 },
  0x02: { mnemonic: "MOV",   type: "REG_REG", bytes: 4 },
  0x03: { mnemonic: "LOAD",  type: "MEMORY",  bytes: 3 },
  0x04: { mnemonic: "STORE", type: "MEMORY",  bytes: 3 },

  0x10: { mnemonic: "ADD",   type: "REG_VALUE", bytes: 4 },
  0x11: { mnemonic: "SUB",   type: "REG_VALUE", bytes: 4 },
  0x12: { mnemonic: "INC",   type: "REG", bytes: 2 },
  0x13: { mnemonic: "DEC",   type: "REG", bytes: 2 },
  0x14: { mnemonic: "CMP",   type: "REG_VALUE", bytes: 4 },

  0x20: { mnemonic: "JMP",   type: "JUMP", bytes: 2 },
  0x21: { mnemonic: "JZ",    type: "JUMP", bytes: 2 },
  0x22: { mnemonic: "JNZ",   type: "JUMP", bytes: 2 },

  0xFF: { mnemonic: "HLT",   type: "NONE", bytes: 1 }
};

const REGISTER_CODES = {
  0x00: "AX",
  0x01: "BX"
};

const ADDRESSING_MODES = {
  0x00: "REGISTER",
  0x01: "IMMEDIATE",
  0x02: "MEMORY"
};

let decodedInstruction = null;



// ============================================
// FETCH
// ============================================

function fetch() {
  const pc = getRegister("PC");

  setRegister("MAR", pc);

  const memoryValue = Read(getRegister("MAR"));
  setRegister("MDR", memoryValue);

  setRegister("IR", getRegister("MDR"));

  setRegister("PC", toByte(pc + 1));
}


/**
 * Fase DECODE
 * Interpreta el opcode almacenado en IR.
 */
/**
 * Fase DECODE
 *
 * Interpreta el opcode almacenado en IR,
 * identifica el modo de direccionamiento
 * y prepara los operandos de la instrucción.
 */
function decode() {
  const opcode = getRegister("IR");
  const instruction = INSTRUCTION_SET[opcode];

  if (!instruction) {
    throw new Error(
      "Opcode desconocido: " +
      opcode.toString(16).toUpperCase().padStart(2, "0") +
      "h"
    );
  }

  decodedInstruction = {
    opcode: opcode,
    mnemonic: instruction.mnemonic,
    type: instruction.type,
    bytes: instruction.bytes,
    register: null,
    mode: null,
    operand: null,
    address: null
  };

  // PC actualmente apunta al byte siguiente al opcode
  let pc = getRegister("PC");

  switch (instruction.type) {

    // MOV reg, imm
    // ADD/SUB/CMP reg, imm/reg
    case "REG_IMM":
    case "REG_VALUE":

      decodedInstruction.register = REGISTER_CODES[Read(pc)];
      pc = toByte(pc + 1);

      decodedInstruction.mode = ADDRESSING_MODES[Read(pc)];
      pc = toByte(pc + 1);

      decodedInstruction.operand = Read(pc);
      pc = toByte(pc + 1);

      break;


    // MOV reg, reg
    case "REG_REG":

      decodedInstruction.register = REGISTER_CODES[Read(pc)];
      pc = toByte(pc + 1);

      decodedInstruction.mode = ADDRESSING_MODES[Read(pc)];
      pc = toByte(pc + 1);

      decodedInstruction.operand = Read(pc);
      pc = toByte(pc + 1);

      break;


    // INC reg / DEC reg
    case "REG":

      decodedInstruction.register = REGISTER_CODES[Read(pc)];
      pc = toByte(pc + 1);

      break;


    // LOAD reg,[dir] / STORE [dir],reg
    case "MEMORY":

      decodedInstruction.register = REGISTER_CODES[Read(pc)];
      pc = toByte(pc + 1);

      decodedInstruction.address = Read(pc);
      pc = toByte(pc + 1);

      break;


    // JMP / JZ / JNZ
    case "JUMP":

      decodedInstruction.address = Read(pc);
      pc = toByte(pc + 1);

      break;


    // HLT
    case "NONE":
      break;
  }

  // PC queda apuntando al opcode de la próxima instrucción
  setRegister("PC", pc);

  return decodedInstruction;
}

function testDecode() {
  setRegister("IR", 0x10);

  const instruction = decode();

  Logger.log("Opcode = " + instruction.opcode);
  Logger.log("Mnemónico = " + instruction.mnemonic);
  Logger.log("Operandos = " + instruction.operands);
}


function testFullDecode() {

  // ADD AX, 05h
  Write(0x00, 0x10);
  Write(0x01, 0x00);
  Write(0x02, 0x01);
  Write(0x03, 0x05);

  setRegister("PC", 0x00);

  fetch();

  const instruction = decode();

  Logger.log("Instrucción = " + instruction.mnemonic);
  Logger.log("Registro = " + instruction.register);
  Logger.log("Modo = " + instruction.mode);
  Logger.log("Operando = " + instruction.operand);
  Logger.log("PC = " + getRegister("PC"));
}

// ============================================
// EXECUTE
// ============================================

function execute() {

}


// ============================================
// STORE
// ============================================

function store() {

}


// ============================================
// CICLO COMPLETO
// ============================================

function instructionCycle() {
  fetch();
  decode();
  execute();
  store();
}





