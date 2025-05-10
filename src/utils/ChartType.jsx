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
        console.warn(`Tipo de gráfico desconhecido: ${chartTypeStr}`);
        return this.DR; // Retorna valor padrão
    }
  }
};

// Congelando o objeto para ele ser imutável, exceto pela função fromChartTypeString
Object.freeze(ChartType.chartTypeList);

// Também podemos manter a exportação padrão para compatibilidade
export default ChartType;