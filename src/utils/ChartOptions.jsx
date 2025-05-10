/**
 * Opções disponíveis para os gráficos
 * @type {Object}
 */
export const ChartOptions = {
  /** Lista de métodos de redução dimensional disponíveis */
  drMethodList: [
    'PCA',
    'tSNE',
    'UMAP',
    'MDS'
  ],
  
  /** Lista de variáveis de ensemble disponíveis */
  ensembleVariableList: [
    'temperature',
    'pressure',
    'humidity',
    'windSpeed',
    'precipitation'
  ],
  
  /** Configurações padrão para gráficos de redução dimensional */
  defaultDRSettings: {
    drMethod: 'PCA',
    showConvexHull: true
  },
  
  /** Configurações padrão para gráficos temporais */
  defaultTemporalSettings: {
    temporalVariable: 'temperature',
    logScale: false,
    drawAreas: true
  },
  
  /** Paletas de cores disponíveis */
  colorPalettes: {
    categorical: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
    sequential: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
    diverging: ['#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4']
  }
};

// Também exportamos como padrão para compatibilidade
export default ChartOptions;