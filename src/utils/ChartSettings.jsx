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
    temporalVariable: ChartOptions.ensembleVariableList[0],
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
    let restUrl = "/";
    switch (this.chartType) {
      case ChartType.DR:
        restUrl = `${restUrl}dimensional-reduction`;
        restUrl = `${restUrl}?method=${this.drSettings.drMethod}`;
        for (const ensemble of this.ensembleList) {
          restUrl = `${restUrl}&ensemble=${ensemble}`;
        }
        for (const simulation of this.simulationList) {
          restUrl = `${restUrl}&simulation=${simulation}`;
        }
        return restUrl;
      case ChartType.TEMPORAL:
        restUrl = `${restUrl}temporal-evolution`;
        restUrl = `${restUrl}?variable=${this.temporalSettings.temporalVariable}`;
        for (const ensemble of this.ensembleList) {
          restUrl = `${restUrl}&ensemble=${ensemble}`;
        }
        for (const simulation of this.simulationList) {
          restUrl = `${restUrl}&simulation=${simulation}`;
        }
        return restUrl;
      case ChartType.CORRELATIONMATRIX:
        restUrl = `${restUrl}correlation-matrix`;
        for (const ensemble of this.ensembleList) {
          restUrl = `${restUrl}&ensemble=${ensemble}`;
        }
        for (const simulation of this.simulationList) {
          restUrl = `${restUrl}&simulation=${simulation}`;
        }
        return restUrl;
      default:
        throw new Error("Chart type does not exist");
    }
  };
}

export default ChartSettings;