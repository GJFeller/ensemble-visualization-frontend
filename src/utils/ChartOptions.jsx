// src/utils/ChartOptions.jsx
// Importante: importações devem vir ANTES de qualquer uso dos recursos importados
import { useState, useEffect } from 'react';

// Define o objeto ChartOptions com valores iniciais
export const ChartOptions = {
  // Definições iniciais (valores padrão)
  drMethodList: ['PCA', 'tSNE', 'UMAP', 'MDS'],
  
  ensembleVariableList: [], // Será preenchido com dados do backend
  
  defaultDRSettings: {
    drMethod: 'PCA',
    showConvexHull: true
  },
  
  defaultTemporalSettings: {
    temporalVariable: '', // Será definido após obter as variáveis
    logScale: false,
    drawAreas: true
  },
  
  colorPalettes: {
    categorical: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
    sequential: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
    diverging: ['#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4']
  }
};

// Função para carregar variáveis do backend - separada do objeto para evitar problemas de sintaxe
export async function loadVariables() {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/variables`);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar variáveis: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Atualiza as variáveis disponíveis
    if (data && Array.isArray(data)) {
      ChartOptions.ensembleVariableList = data;
      
      // Define a variável padrão temporal para a primeira variável disponível
      if (data.length > 0) {
        ChartOptions.defaultTemporalSettings.temporalVariable = data[0];
      }
      
      console.log("Variáveis carregadas com sucesso:", ChartOptions.ensembleVariableList);
      return true;
    } else {
      console.error("Formato de dados inválido recebido da API:", data);
      return false;
    }
  } catch (error) {
    console.error("Erro ao carregar variáveis do backend:", error);
    return false;
  }
}

// Adiciona a função ao objeto ChartOptions após a definição
ChartOptions.loadVariables = loadVariables;

// Hook para usar ChartOptions com variáveis carregadas do backend
export function useChartOptions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState(ChartOptions);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const success = await loadVariables();
        if (success) {
          setOptions({...ChartOptions});
          setError(null);
        } else {
          setError("Falha ao carregar variáveis");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  return { options, loading, error };
}

export default ChartOptions;