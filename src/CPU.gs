// ============================================
// CPU - SIMULADOR CPU DE 8 BITS
// ============================================

/**
 * Fase FETCH
 *
 * 1. PC → MAR
 * 2. RAM[MAR] → MDR
 * 3. MDR → IR
 * 4. PC → PC + 1
 */
function fetch() {

  // 1. Copiar PC en MAR
  const pc = getRegister("PC");
  setRegister("MAR", pc);

  // 2. Leer RAM y guardar el dato en MDR
  const memoryValue = Read(getRegister("MAR"));
  setRegister("MDR", memoryValue);

  // 3. Copiar MDR en IR
  setRegister("IR", getRegister("MDR"));

  // 4. Incrementar PC
  setRegister("PC", toByte(pc + 1));
}

function testFetch() {

  // Colocamos una instrucción de prueba en 05h
  Write(0x05, 0x10);

  // Indicamos que la próxima instrucción está en 05h
  setRegister("PC", 0x05);

  // Ejecutamos únicamente Fetch
  fetch();

  Logger.log("PC  = " + getRegister("PC"));
  Logger.log("MAR = " + getRegister("MAR"));
  Logger.log("MDR = " + getRegister("MDR"));
  Logger.log("IR  = " + getRegister("IR"));
}


/**
 * Fase DECODE
 * Interpreta la instrucción almacenada en IR.
 */
function decode() {
  // Se implementará posteriormente
}


/**
 * Fase EXECUTE
 * Ejecuta la instrucción decodificada.
 */
function execute() {
  // Se implementará posteriormente
}


/**
 * Fase STORE
 * Almacena el resultado cuando corresponda.
 */
function store() {
  // Se implementará posteriormente
}


/**
 * Ejecuta un ciclo completo de instrucción.
 */
function instructionCycle() {
  fetch();
  decode();
  execute();
  store();
}
