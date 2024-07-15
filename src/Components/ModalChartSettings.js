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
  saveChartSettings
}) {
    const [currentChartSettings, setCurrentChartSettings] = useState(chartSettings.clone());

    const changeChartSettings = (modifiedChartSettings) => {
      console.log(currentChartSettings);
      console.log(currentChartSettings.getRestUrl());
      setCurrentChartSettings(modifiedChartSettings);
    };

    console.log(currentChartSettings);

    useEffect(() => {
      fetch(process.env.REACT_APP_BACKEND_URL+currentChartSettings.getRestUrl())
      .then((res) => {
        return res.json();
      })
      .then((dataResponse) => {
        currentChartSettings.chartData = dataResponse;
        console.log(currentChartSettings.chartData);
        ChartRender.drawChart('chart-settings-modal-'+currentChartSettings.chartId, currentChartSettings);
      });
    }, [currentChartSettings, isOpen]);


    if(isOpen) {
        return (
            <div className='fixed flex flex-row content-center justify-stretch space-x-16 left-0 top-0 size-full z-50 bg-black opacity-80'>
                <div className='flex flex-col m-auto place-self-center max-w-full max-h-full bg-slate-400 border-slate-400 opacity-100 rounded-lg'>
                  <div className='h-8 flex flex-row border-2 border-slate-400 border-b-black rounded-t-lg opacity-100'>
                    <div className='flex flex-row grow justify-center'>
                        <div className=''>
                          {title}
                        </div>
                    </div>
                    <button className="p-1" onClick={setIsOpenModal}><img src={closeIcon} width="8" height="8" alt="close window"/></button> 
                  </div>
                  <div className='flex flex-col bg-white rounded-b-lg opacity-100'>
                    <ChartSettingsPanel currentChartSettings={currentChartSettings} changeChartSettings={changeChartSettings}/>
                    <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-auto rounded' onClick={() => saveChartSettings(currentChartSettings.clone())}>Salvar</button>
                  </div>
                </div>
                <div className='flex flex-col place-self-center content-center justify-center w-1/2 h-1/2 max-w-full max-h-full'>
                  <div 
                  id={"modal-"+currentChartSettings.chartId}
                  className='bg-white m-auto w-11/12 h-full'>
                    <svg id={"chart-settings-modal-"+currentChartSettings.chartId}></svg>
                  </div>
                </div>
            </div>
        );
    }
    else {
        return null;
    }
}