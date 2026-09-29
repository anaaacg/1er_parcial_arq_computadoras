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
let cpuHalted = false;


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
      // Dirección de memoria → MAR
      setRegister("MAR", instruction.address);

      // RAM[MAR] → MDR
      setRegister(
        "MDR",
        Read(getRegister("MAR"))
      );

      // MDR → resultado temporal
      // Store se encargará de pasarlo al registro destino
      executionResult = getRegister("MDR");
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
      executionResult = null;
      cpuHalted = true;
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

/**
 * Fase STORE / WRITE-BACK
 *
 * Guarda el resultado generado durante Execute
 * en el registro o memoria correspondiente.
 */
function store() {

  if (!decodedInstruction) {
    throw new Error("No existe una instrucción decodificada");
  }

  const instruction = decodedInstruction;

  switch (instruction.mnemonic) {

    // Guardan el resultado en el registro destino
    case "MOV":
    case "ADD":
    case "SUB":
    case "INC":
    case "DEC":
    case "LOAD":

      if (executionResult !== null) {
        setRegister(
          instruction.register,
          toByte(executionResult)
        );
      }

      break;


    // Guarda el contenido preparado en memoria
    case "STORE":

      // Dirección destino → MAR
      setRegister("MAR", instruction.address);

      // Dato → MDR
      setRegister("MDR", toByte(executionResult));

      // MDR → RAM[MAR]
      Write(
        getRegister("MAR"),
        getRegister("MDR")
      );

      break;


    // Estas instrucciones no necesitan Write-back
    case "CMP":
    case "JMP":
    case "JZ":
    case "JNZ":
    case "HLT":
      break;


    default:
      throw new Error(
        "Store no implementado para: " +
        instruction.mnemonic
      );
  }
}

function testStore() {

  // ========================================
  // ADD AX, 05h
  // ========================================

  Write(0x00, 0x10);
  Write(0x01, 0x00);
  Write(0x02, 0x01);
  Write(0x03, 0x05);

  setRegister("AX", 0x03);
  setRegister("PC", 0x00);

  fetch();
  decode();
  execute();

  Logger.log("--- ANTES DE STORE ---");
  Logger.log("AX = " + getRegister("AX"));
  Logger.log("Resultado = " + executionResult);

  store();

  Logger.log("--- DESPUÉS DE STORE ---");
  Logger.log("AX = " + getRegister("AX"));


  // ========================================
  // STORE [80h], AX
  // ========================================

  decodedInstruction = {
    mnemonic: "STORE",
    register: "AX",
    address: 0x80
  };

  execute();
  store();

  Logger.log("--- STORE [80h], AX ---");
  Logger.log("MAR = " + getRegister("MAR"));
  Logger.log("MDR = " + getRegister("MDR"));
  Logger.log("RAM[80h] = " + Read(0x80));
}


// ============================================
// CICLO COMPLETO
// ============================================

function instructionCycle() {

  if (cpuHalted) {
    return;
  }

  fetch();
  decode();
  execute();
  store();
}

function testInstructionCycle() {

  // ========================================
  // Programa:
  // ADD AX, 05h
  //
  // 00h → 10h  ADD
  // 01h → 00h  AX
  // 02h → 01h  Inmediato
  // 03h → 05h  Valor
  // ========================================

  Write(0x00, 0x10);
  Write(0x01, 0x00);
  Write(0x02, 0x01);
  Write(0x03, 0x05);

  // Estado inicial
  setRegister("AX", 0x03);
  setRegister("PC", 0x00);

  Logger.log("=== ANTES DEL CICLO ===");
  Logger.log("PC = " + getRegister("PC"));
  Logger.log("AX = " + getRegister("AX"));

  // UN ciclo completo
  instructionCycle();

  Logger.log("=== DESPUÉS DEL CICLO ===");
  Logger.log("PC = " + getRegister("PC"));
  Logger.log("IR = " + getRegister("IR"));
  Logger.log("AX = " + getRegister("AX"));
  Logger.log("Instrucción = " + decodedInstruction.mnemonic);
  Logger.log("Resultado = " + executionResult);
}

function testMultipleInstructions() {

  // ========================================
  // PROGRAMA DE PRUEBA
  //
  // MOV AX, 05h
  // ADD AX, 03h
  // INC AX
  // ========================================

  // MOV AX, 05h
  // 01 00 01 05
  Write(0x00, 0x01);
  Write(0x01, 0x00);
  Write(0x02, 0x01);
  Write(0x03, 0x05);

  // ADD AX, 03h
  // 10 00 01 03
  Write(0x04, 0x10);
  Write(0x05, 0x00);
  Write(0x06, 0x01);
  Write(0x07, 0x03);

  // INC AX
  // 12 00
  Write(0x08, 0x12);
  Write(0x09, 0x00);

  // Estado inicial
  setRegister("PC", 0x00);
  setRegister("AX", 0x00);

  Logger.log("=== ESTADO INICIAL ===");
  Logger.log("PC = " + getRegister("PC"));
  Logger.log("AX = " + getRegister("AX"));


  // ========================================
  // CICLO 1: MOV AX, 05h
  // ========================================
  instructionCycle();

  Logger.log("=== CICLO 1 ===");
  Logger.log("Instrucción = " + decodedInstruction.mnemonic);
  Logger.log("PC = " + getRegister("PC"));
  Logger.log("AX = " + getRegister("AX"));


  // ========================================
  // CICLO 2: ADD AX, 03h
  // ========================================
  instructionCycle();

  Logger.log("=== CICLO 2 ===");
  Logger.log("Instrucción = " + decodedInstruction.mnemonic);
  Logger.log("PC = " + getRegister("PC"));
  Logger.log("AX = " + getRegister("AX"));


  // ========================================
  // CICLO 3: INC AX
  // ========================================
  instructionCycle();

  Logger.log("=== CICLO 3 ===");
  Logger.log("Instrucción = " + decodedInstruction.mnemonic);
  Logger.log("PC = " + getRegister("PC"));
  Logger.log("AX = " + getRegister("AX"));
}


function testLoadWithMarMdr() {

  // Valor de prueba en memoria
  Write(0x80, 0x25);

  // LOAD AX, [80h]
  Write(0x00, 0x03);
  Write(0x01, 0x00);
  Write(0x02, 0x80);

  setRegister("AX", 0x00);
  setRegister("PC", 0x00);

  instructionCycle();

  Logger.log("--- LOAD AX, [80h] ---");
  Logger.log("MAR = " + getRegister("MAR"));
  Logger.log("MDR = " + getRegister("MDR"));
  Logger.log("AX = " + getRegister("AX"));
  Logger.log("PC = " + getRegister("PC"));
}

function testArithmeticISA() {

  // ========================================
  // 1. ADD AX, 05h
  // AX = 03h → resultado esperado = 08h
  // ========================================
  Write(0x00, 0x10);
  Write(0x01, 0x00); // AX
  Write(0x02, 0x01); // Inmediato
  Write(0x03, 0x05);

  setRegister("AX", 0x03);
  setRegister("PC", 0x00);

  instructionCycle();

  Logger.log("--- ADD AX, 05h ---");
  Logger.log("AX = " + getRegister("AX"));
  Logger.log("ZF = " + getFlag("ZF"));
  Logger.log("CF = " + getFlag("CF"));
  Logger.log("SF = " + getFlag("SF"));


  // ========================================
  // 2. ADD AX, BX
  // AX = 05h, BX = 03h → 08h
  // ========================================
  Write(0x10, 0x10);
  Write(0x11, 0x00); // AX
  Write(0x12, 0x00); // Registro
  Write(0x13, 0x01); // BX

  setRegister("AX", 0x05);
  setRegister("BX", 0x03);
  setRegister("PC", 0x10);

  instructionCycle();

  Logger.log("--- ADD AX, BX ---");
  Logger.log("AX = " + getRegister("AX"));


  // ========================================
  // 3. SUB AX, 03h
  // AX = 08h → 05h
  // ========================================
  Write(0x20, 0x11);
  Write(0x21, 0x00);
  Write(0x22, 0x01);
  Write(0x23, 0x03);

  setRegister("AX", 0x08);
  setRegister("PC", 0x20);

  instructionCycle();

  Logger.log("--- SUB AX, 03h ---");
  Logger.log("AX = " + getRegister("AX"));


  // ========================================
  // 4. INC AX
  // 05h → 06h
  // ========================================
  Write(0x30, 0x12);
  Write(0x31, 0x00);

  setRegister("AX", 0x05);
  setRegister("PC", 0x30);

  instructionCycle();

  Logger.log("--- INC AX ---");
  Logger.log("AX = " + getRegister("AX"));


  // ========================================
  // 5. DEC AX
  // 06h → 05h
  // ========================================
  Write(0x40, 0x13);
  Write(0x41, 0x00);

  setRegister("AX", 0x06);
  setRegister("PC", 0x40);

  instructionCycle();

  Logger.log("--- DEC AX ---");
  Logger.log("AX = " + getRegister("AX"));


  // ========================================
  // 6. CMP AX, 05h
  // AX debe permanecer igual
  // ========================================
  Write(0x50, 0x14);
  Write(0x51, 0x00);
  Write(0x52, 0x01);
  Write(0x53, 0x05);

  setRegister("AX", 0x05);
  setRegister("PC", 0x50);

  instructionCycle();

  Logger.log("--- CMP AX, 05h ---");
  Logger.log("AX = " + getRegister("AX"));
  Logger.log("ZF = " + getFlag("ZF"));
  Logger.log("CF = " + getFlag("CF"));
  Logger.log("SF = " + getFlag("SF"));


  // ========================================
  // 7. CASO LÍMITE
  // FFh + 01h → 00h
  // ========================================
  Write(0x60, 0x10);
  Write(0x61, 0x00);
  Write(0x62, 0x01);
  Write(0x63, 0x01);

  setRegister("AX", 0xFF);
  setRegister("PC", 0x60);

  instructionCycle();

  Logger.log("--- FFh + 01h ---");
  Logger.log("AX = " + getRegister("AX"));
  Logger.log("ZF = " + getFlag("ZF"));
  Logger.log("CF = " + getFlag("CF"));
  Logger.log("SF = " + getFlag("SF"));
}

function testControlFlow() {

  // ========================================
  // 1. JMP 40h
  // Debe saltar siempre
  // ========================================
  Write(0x00, 0x20);
  Write(0x01, 0x40);

  setRegister("PC", 0x00);

  instructionCycle();

  Logger.log("--- JMP 40h ---");
  Logger.log("PC = " + getRegister("PC"));


  // ========================================
  // 2. JZ 50h con ZF = 1
  // DEBE saltar
  // ========================================
  Write(0x10, 0x21);
  Write(0x11, 0x50);

  setRegister("PC", 0x10);
  setFlag("ZF", 1);

  instructionCycle();

  Logger.log("--- JZ 50h con ZF=1 ---");
  Logger.log("PC = " + getRegister("PC"));


  // ========================================
  // 3. JZ 50h con ZF = 0
  // NO debe saltar
  // ========================================
  Write(0x20, 0x21);
  Write(0x21, 0x50);

  setRegister("PC", 0x20);
  setFlag("ZF", 0);

  instructionCycle();

  Logger.log("--- JZ 50h con ZF=0 ---");
  Logger.log("PC = " + getRegister("PC"));


  // ========================================
  // 4. JNZ 60h con ZF = 0
  // DEBE saltar
  // ========================================
  Write(0x30, 0x22);
  Write(0x31, 0x60);

  setRegister("PC", 0x30);
  setFlag("ZF", 0);

  instructionCycle();

  Logger.log("--- JNZ 60h con ZF=0 ---");
  Logger.log("PC = " + getRegister("PC"));


  // ========================================
  // 5. JNZ 60h con ZF = 1
  // NO debe saltar
  // ========================================
  Write(0x40, 0x22);
  Write(0x41, 0x60);

  setRegister("PC", 0x40);
  setFlag("ZF", 1);

  instructionCycle();

  Logger.log("--- JNZ 60h con ZF=1 ---");
  Logger.log("PC = " + getRegister("PC"));
}

function resetCpuHalt() {
  cpuHalted = false;
}

function testHalt() {

  resetCpuHalt();

  // HLT en 00h
  Write(0x00, 0xFF);

  // Una instrucción después de HLT
  // INC AX
  Write(0x01, 0x12);
  Write(0x02, 0x00);

  setRegister("AX", 0x05);
  setRegister("PC", 0x00);

  // Ejecuta HLT
  instructionCycle();

  Logger.log("--- DESPUÉS DE HLT ---");
  Logger.log("CPU detenido = " + cpuHalted);
  Logger.log("PC = " + getRegister("PC"));
  Logger.log("AX = " + getRegister("AX"));

  // Intentamos ejecutar INC AX
  instructionCycle();

  Logger.log("--- INTENTO DESPUÉS DE HLT ---");
  Logger.log("CPU detenido = " + cpuHalted);
  Logger.log("PC = " + getRegister("PC"));
  Logger.log("AX = " + getRegister("AX"));
}
