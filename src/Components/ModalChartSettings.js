import React, { useEffect, useRef, useState } from 'react';
import closeIcon from '../Images/close.png'
import ChartSettingsPanel from './ChartSettingsPanel';
import { ChartType, ChartRender, ChartSettings, chartOptions } from '../utils/ChartUtils';
import { clone } from '../utils/utils';

export default function ModalChartSettings({
  isOpen, 
  setIsOpenModal, 
  title = "Title",
  chartSettings,
  restRoute
}) {
    let currentChartSettings = chartSettings.clone();
    const [currentRestRoute, setCurrentRestRoute] = useState(currentChartSettings.getRestUrl());
    //ChartRender.drawChart(currentChartSettings.chartType, 'chart-settings-modal', currentChartSettings.chartData);
   
    // TODO: resolver a questão de erro para não plotar aqui os gráficos.
    //useEffect(() => {
    //  fetch(process.env.REACT_APP_BACKEND_URL+currentChartSettings.getRestUrl())
    //  .then((res) => {
    //    return res.json();
    //  })
    //  .then((dataResponse) => {
    //    currentChartSettings.chartData = dataResponse;
    //    console.log(currentChartSettings.chartData);
    //    ChartRender.drawChart(currentChartSettings.chartType, 'chart-settings-modal', dataResponse);

    //  });
    //}, [currentRestRoute]);


    if(isOpen) {
        return (
            <div className='fixed flex flex-row place-content-center justify-evenly content-center left-0 top-0 size-full z-50 bg-black opacity-80'>
                <div className='flex flex-col m-auto max-w-96 bg-slate-400 border-slate-400 opacity-100 rounded-lg'>
                  <div className='h-8 flex flex-row border-2 border-slate-400 border-b-black rounded-t-lg opacity-100'>
                    <div className='flex flex-row grow justify-center'>
                        <div className=''>
                          {title}
                        </div>
                    </div>
                    <button className="p-1" onClick={setIsOpenModal}><img src={closeIcon} width="8" height="8" alt="close window"/></button> 
                  </div>
                  <div className='flex flex-col bg-white rounded-b-lg opacity-100'>
                    <ChartSettingsPanel currentChartSettings={currentChartSettings}/>
                    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-auto rounded' onClick={setIsOpenModal}>Salvar</button>
                  </div>
                </div>
                <div className='flex flex-col m-auto max-w-96'>
                  <svg id="chart-settings-modal"></svg>
                </div>
            </div>
        );
    }
    else {
        return null;
    }
}