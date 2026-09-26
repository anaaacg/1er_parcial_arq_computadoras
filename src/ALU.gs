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
