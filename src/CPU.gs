// ============================================
// CPU - SIMULADOR CPU DE 8 BITS
// ============================================

/**
 * Fase FETCH
 * Busca la siguiente instrucción desde memoria.
 */
function fetch() {
  // Se implementará en la siguiente subtarea
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
