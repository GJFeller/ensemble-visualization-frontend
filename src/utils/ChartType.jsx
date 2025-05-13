/**
 * Enum de tipos de gráficos disponíveis no sistema
 * @readonly
 * @enum {string}
 */
export const ChartType = {
  /** Gráfico de redução dimensional */
  DR: 'DR',
  
  /** Gráfico temporal */
  TEMPORAL: 'TEMPORAL',
  
  /** Matriz de correlação */
  CORRELATIONMATRIX: 'CORRELATIONMATRIX',
  
  /** Lista de todos os tipos de gráficos disponíveis */
  chartTypeList: ['DR', 'TEMPORAL', 'CORRELATIONMATRIX'],
  
  /**
   * Verifica se um tipo de gráfico é válido
   * @param {string} type - Tipo de gráfico a ser verificado
   * @returns {boolean} - Verdadeiro se for válido
   */
  isValidType: function(type) {
    return type === this.DR || 
           type === this.TEMPORAL || 
           type === this.CORRELATIONMATRIX;
  },
  
  /**
   * Converte uma string para o tipo de gráfico correspondente
   * @param {string} chartTypeStr - String representando o tipo de gráfico
   * @returns {string} - Constante ChartType correspondente
   */
  fromChartTypeString: function(chartTypeStr) {
    switch (chartTypeStr) {
      case 'DR':
        return this.DR;
      case 'TEMPORAL':
        return this.TEMPORAL;
      case 'CORRELATIONMATRIX':
        return this.CORRELATIONMATRIX;
      default:
        console.warn(`Tipo de gráfico desconhecido: ${chartTypeStr}. Usando DR como padrão.`);
        return this.DR; // Retorna valor padrão
    }
  },
  
  /**
   * Obtém o nome amigável para um tipo de gráfico
   * @param {string} type - Tipo de gráfico
   * @returns {string} - Nome amigável
   */
  getDisplayName: function(type) {
    switch (type) {
      case this.DR:
        return "Dimensional Reduction";
      case this.TEMPORAL:
        return "Temporal Evolution";
      case this.CORRELATIONMATRIX:
        return "Correlation Matrix";
      default:
        return "Unknown Chart Type";
    }
  }
};

// Congelando o objeto para ele ser imutável
Object.freeze(ChartType);
Object.freeze(ChartType.chartTypeList);

// Também mantemos a exportação padrão para compatibilidade
export default ChartType;