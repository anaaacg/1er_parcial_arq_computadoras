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
let executionResult = null;



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

/**
 * Obtiene el valor real de un operando
 * según su modo de direccionamiento.
 */
function resolveOperand(instruction) {

  if (instruction.mode === "IMMEDIATE") {
    return instruction.operand;
  }

  if (instruction.mode === "REGISTER") {
    const registerName = REGISTER_CODES[instruction.operand];

    if (!registerName) {
      throw new Error("Registro de operando inválido");
    }

    return getRegister(registerName);
  }

  if (instruction.mode === "MEMORY") {
    return Read(instruction.operand);
  }

  throw new Error("Modo de direccionamiento no válido");
}

// ============================================
// EXECUTE
// ============================================

/**
 * Fase EXECUTE
 * Ejecuta la operación indicada por la
 * instrucción previamente decodificada.
 */
function execute() {

  if (!decodedInstruction) {
    throw new Error("No existe una instrucción decodificada");
  }

  executionResult = null;

  const instruction = decodedInstruction;

  switch (instruction.mnemonic) {

    case "ADD":
      executionResult = aluAdd(
        getRegister(instruction.register),
        resolveOperand(instruction)
      );
      break;

    case "SUB":
      executionResult = aluSub(
        getRegister(instruction.register),
        resolveOperand(instruction)
      );
      break;

    case "INC":
      executionResult = aluInc(
        getRegister(instruction.register)
      );
      break;

    case "DEC":
      executionResult = aluDec(
        getRegister(instruction.register)
      );
      break;

    case "CMP":
      aluCmp(
        getRegister(instruction.register),
        resolveOperand(instruction)
      );
      break;

    case "MOV":
      // Prepara el valor que posteriormente Store
      // escribirá en el registro destino.
      executionResult = resolveOperand(instruction);
      break;

    case "LOAD":
      // Lee el valor almacenado en la dirección indicada.
      executionResult = Read(instruction.address);
      break;

    case "STORE":
      // Prepara el valor del registro para que Store
      // lo escriba posteriormente en memoria.
      executionResult = getRegister(instruction.register);
      break;

    case "JMP":
      // Salto incondicional.
      setRegister("PC", instruction.address);
      break;

    case "JZ":
      // Salta únicamente cuando ZF = 1.
      if (getFlag("ZF") === 1) {
        setRegister("PC", instruction.address);
      }
      break;

    case "JNZ":
      // Salta únicamente cuando ZF = 0.
      if (getFlag("ZF") === 0) {
        setRegister("PC", instruction.address);
      }
      break;

    case "HLT":
      // La detención completa del reloj se conectará
      // posteriormente con el control de ejecución.
      executionResult = null;
      break;

    default:
      throw new Error(
        "Instrucción no implementada: " + instruction.mnemonic
      );
  }


  return executionResult;
}

function testExecuteComplete() {

  // ========================================
  // 1. MOV AX, BX
  // ========================================
  setRegister("BX", 0x07);

  decodedInstruction = {
    mnemonic: "MOV",
    register: "AX",
    mode: "REGISTER",
    operand: 0x01
  };

  execute();

  Logger.log("--- MOV AX, BX ---");
  Logger.log("Resultado = " + executionResult);


  // ========================================
  // 2. LOAD AX, [80h]
  // ========================================
  Write(0x80, 0x25);

  decodedInstruction = {
    mnemonic: "LOAD",
    register: "AX",
    address: 0x80
  };

  execute();

  Logger.log("--- LOAD AX, [80h] ---");
  Logger.log("Resultado = " + executionResult);


  // ========================================
  // 3. STORE [80h], AX
  // ========================================
  setRegister("AX", 0x15);

  decodedInstruction = {
    mnemonic: "STORE",
    register: "AX",
    address: 0x80
  };

  execute();

  Logger.log("--- STORE [80h], AX ---");
  Logger.log("Resultado preparado = " + executionResult);


  // ========================================
  // 4. JMP 40h
  // ========================================
  decodedInstruction = {
    mnemonic: "JMP",
    address: 0x40
  };

  execute();

  Logger.log("--- JMP 40h ---");
  Logger.log("PC = " + getRegister("PC"));


  // ========================================
  // 5. JZ 50h con ZF = 1
  // ========================================
  setFlag("ZF", 1);

  decodedInstruction = {
    mnemonic: "JZ",
    address: 0x50
  };

  execute();

  Logger.log("--- JZ 50h ---");
  Logger.log("PC = " + getRegister("PC"));


  // ========================================
  // 6. JNZ 60h con ZF = 0
  // ========================================
  setFlag("ZF", 0);

  decodedInstruction = {
    mnemonic: "JNZ",
    address: 0x60
  };

  execute();

  Logger.log("--- JNZ 60h ---");
  Logger.log("PC = " + getRegister("PC"));


  // ========================================
  // 7. HLT
  // ========================================
  decodedInstruction = {
    mnemonic: "HLT"
  };

  execute();

  Logger.log("--- HLT ---");
  Logger.log("Resultado = " + executionResult);
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

