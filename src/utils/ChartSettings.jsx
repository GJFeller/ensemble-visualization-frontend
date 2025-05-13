import { ChartType } from './ChartType';
import { ChartOptions } from './ChartOptions';

/**
 * Chart settings class that stores chart configuration
 */
export class ChartSettings {
  #chartType = ChartType.DR;
  #chartTitle = "Title";
  #chartId = "";
  #chartData = null;

  #drSettings = {
    drMethod: ChartOptions.drMethodList[0],
    showConvexHull: true,
  };

  #temporalSettings = {
    temporalVariable: ChartOptions.ensembleVariableList[0] || '',
    logScale: false,
    drawAreas: true,
  };

  // Adicionando interactiveFilters como propriedade privada da classe
  #interactiveFilters = {
    enabled: true,
    ensembleList: [],
    simulationList: [],
    variables: [],
    
    scatterplot: {
      enabled: true,
      xAxisVariable: null,
      yAxisVariable: null,
      colorVariable: null,
      sizeVariable: null,
      opacityValue: 0.7,
      filterRanges: {}
    },
    
    correlationMatrix: {
      enabled: true,
      variablesIncluded: [],
      thresholdValue: 0.5,
      colorScheme: "diverging",
      filterRanges: {}
    },
    
    temporalPlot: {
      enabled: true,
      timeVariable: "time",
      valueVariables: [],
      aggregationType: "mean",
      showConfidenceInterval: true,
      filterRanges: {}
    }
  };

  #ensembleList = [];
  #simulationList = [];

  #parentChartSettings = null;
  #childrenChartSettings = [];

  constructor(
    chartType = ChartType.DR,
    chartTitle = "Title",
    chartId = "",
    chartData = null,
    parentChartSettings = null,
  ) {
    this.#chartType = chartType;
    this.#chartTitle = chartTitle;
    this.#chartId = chartId;
    this.#chartData = chartData;
    this.#parentChartSettings = parentChartSettings;
  }

  // Getter para interactiveFilters
  get interactiveFilters() {
    return this.#interactiveFilters;
  }

  // Métodos para manipular os filtros
  updateEnsembleList(newList) {
    this.#interactiveFilters.ensembleList = newList;
  }

  updateSimulationList(newList) {
    this.#interactiveFilters.simulationList = newList;
  }
  
  updateVariables(newVariables) {
    this.#interactiveFilters.variables = newVariables;
  }
  
  applyFilter(visualizationType, filterName, filterValue) {
    if (this.#interactiveFilters[visualizationType]) {
      this.#interactiveFilters[visualizationType].filterRanges[filterName] = filterValue;
    }
  }
  
  clearFilter(visualizationType, filterName) {
    if (this.#interactiveFilters[visualizationType] && 
        this.#interactiveFilters[visualizationType].filterRanges[filterName]) {
      delete this.#interactiveFilters[visualizationType].filterRanges[filterName];
    }
  }
  
  clearAllFilters(visualizationType) {
    if (this.#interactiveFilters[visualizationType]) {
      this.#interactiveFilters[visualizationType].filterRanges = {};
    }
  }

  get drSettings() {
    return this.#drSettings;
  }
  
  get temporalSettings() {
    return this.#temporalSettings;
  }
  
  get chartType() {
    return this.#chartType;
  }
  
  get chartTitle() {
    return this.#chartTitle;
  }
  
  get chartId() {
    return this.#chartId;
  }
  
  get chartData() {
    return this.#chartData;
  }
  
  get ensembleList() {
    return this.#ensembleList;
  }
  
  get simulationList() {
    return this.#simulationList;
  }
  
  get parentChartSettings() {
    return this.#parentChartSettings;
  }
  
  get childrenChartSettings() {
    return this.#childrenChartSettings;
  }

  set chartTitle(chartTitle) {
    this.#chartTitle = chartTitle;
  }
  
  set chartId(chartId) {
    this.#chartId = chartId;
  }
  
  set drSettings(drSettings) {
    this.#drSettings = drSettings;
  }
  
  set temporalSettings(temporalSettings) {
    this.#temporalSettings = temporalSettings;
  }
  
  set chartType(chartType) {
    this.#chartType = chartType;
  }
  
  set chartData(chartData) {
    this.#chartData = chartData;
  }
  
  set ensembleList(ensembleList) {
    this.#ensembleList = ensembleList;
  }
  
  set simulationList(simulationList) {
    this.#simulationList = simulationList;
  }
  
  set parentChartSettings(parentChartSettings) {
    this.#parentChartSettings = parentChartSettings;
  }
  
  set childrenChartSettings(childrenChartSettings) {
    this.#childrenChartSettings = childrenChartSettings;
  }

  static getSettings() {
    switch (this.chartType) {
      case ChartType.DR:
        return this.drSettings;
      case ChartType.TEMPORAL:
        return this.temporalSettings;
      default:
        throw new Error("Chart type does not exist");
    }
  }

  static getChartSettingsList() {
    if (this.childrenChartSettings.length === 0) {
      return [this];
    } else {
      let childrenList = [];
      for (const childChartSettings in this.childrenChartSettings) {
        let childList = childChartSettings.getChartSettingsList();
        childrenList.concat(childList);
      }
      let chartSettingsList = [this];
      return chartSettingsList.concat(childrenList);
    }
  }

  clone = function () {
    let clonedInstance = new ChartSettings(
      this.chartType,
      this.chartTitle,
      this.chartId,
    );
    clonedInstance.drSettings = JSON.parse(JSON.stringify(this.drSettings));
    clonedInstance.temporalSettings = JSON.parse(
      JSON.stringify(this.temporalSettings),
    );
    if (this.chartData) {
      clonedInstance.chartData = JSON.parse(JSON.stringify(this.chartData));
    }
    return clonedInstance;
  };

  getRestUrl = function () {
    // Log para depuração
    console.log("Gerando URL para tipo de gráfico:", this.chartType, 
                "ensembles:", this.ensembleList, 
                "simulações:", this.simulationList);
    
    // Verificações básicas
    if (!this.chartType) {
      console.error("Tipo de gráfico não definido");
      // Mesmo sem tipo definido, vamos tentar dimensional-reduction como padrão
      return "/dimensional-reduction";
    }
    
    // Construção da URL baseada no tipo de gráfico
    let url = "";
    
    switch (this.chartType) {
      case ChartType.DR:
        // EXATA rota do backend para Dimensional Reduction
        url = "/dimensional-reduction";
        
        // Adicionar parâmetros de consulta
        const drParams = new URLSearchParams();
        
        // Adicionar método DR (parâmetro 'method')
        if (this.drSettings?.drMethod) {
          drParams.append("method", this.drSettings.drMethod);
        } else {
          // Método padrão
          drParams.append("method", "PCA");
        }
        
        // Verificar se há ensembles selecionados
        if (Array.isArray(this.ensembleList) && this.ensembleList.length > 0) {
          this.ensembleList.forEach(ensemble => {
            drParams.append("ensemble", ensemble);
          });
        }
        
        // Verificar se há simulações selecionadas
        if (Array.isArray(this.simulationList) && this.simulationList.length > 0) {
          this.simulationList.forEach(simulation => {
            drParams.append("simulation", simulation);
          });
        }
        
        // Finalizar URL com parâmetros
        const drQueryString = drParams.toString();
        if (drQueryString) {
          url += `?${drQueryString}`;
        }
        
        break;
        
      case ChartType.TEMPORAL:
        // EXATA rota do backend para Temporal Evolution
        url = "/temporal-evolution";
        
        // Adicionar parâmetros de consulta
        const temporalParams = new URLSearchParams();
        
        // Adicionar variável temporal (parâmetro 'variable')
        if (this.temporalSettings?.temporalVariable) {
          temporalParams.append("variable", this.temporalSettings.temporalVariable);
        }
        
        // Verificar se há ensembles selecionados
        if (Array.isArray(this.ensembleList) && this.ensembleList.length > 0) {
          this.ensembleList.forEach(ensemble => {
            temporalParams.append("ensemble", ensemble);
          });
        }
        
        // Verificar se há simulações selecionadas
        if (Array.isArray(this.simulationList) && this.simulationList.length > 0) {
          this.simulationList.forEach(simulation => {
            temporalParams.append("simulation", simulation);
          });
        }
        
        // Finalizar URL com parâmetros
        const temporalQueryString = temporalParams.toString();
        if (temporalQueryString) {
          url += `?${temporalQueryString}`;
        }
        
        break;
        
      case ChartType.CORRELATIONMATRIX:
        // EXATA rota do backend para Correlation Matrix
        url = "/correlation-matrix";
        
        // Adicionar parâmetros de consulta
        const correlationParams = new URLSearchParams();
        
        // Verificar se há ensembles selecionados
        if (Array.isArray(this.ensembleList) && this.ensembleList.length > 0) {
          this.ensembleList.forEach(ensemble => {
            correlationParams.append("ensemble", ensemble);
          });
        }
        
        // Verificar se há simulações selecionadas
        if (Array.isArray(this.simulationList) && this.simulationList.length > 0) {
          this.simulationList.forEach(simulation => {
            correlationParams.append("simulation", simulation);
          });
        }
        
        // Finalizar URL com parâmetros
        const correlationQueryString = correlationParams.toString();
        if (correlationQueryString) {
          url += `?${correlationQueryString}`;
        }
        
        break;
        
      default:
        // Tipo desconhecido, usar rota dimensional-reduction como fallback
        console.warn("Tipo de gráfico desconhecido:", this.chartType, "usando dimensional-reduction como fallback");
        url = "/dimensional-reduction";
        if (Array.isArray(this.ensembleList) && this.ensembleList.length > 0) {
          url += "?ensemble=" + this.ensembleList.join("&ensemble=");
        }
    }
    
    // Log da URL final para depuração
    console.log(`URL final para requisição: ${url}`);
    
    return url;
  };

}

export default ChartSettings;