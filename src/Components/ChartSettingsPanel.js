import React, { useEffect, useRef, useState } from 'react';
import * as ChartUtils from '../utils/ChartUtils';


export default function ChartSettingsPanel({
    currentChartSettings,
    changeRestRoute
}) {
    const [chartSettings, setChartSettings] = useState(currentChartSettings);

    useEffect( () => {
        setChartSettings(currentChartSettings);
    }, [currentChartSettings]);

    console.log(chartSettings);

    const onChangeDRSelect = (e) => {
      const value = e.target.value;
      let chartSettingsCopy = chartSettings.clone();
      console.log(chartSettingsCopy);
      chartSettingsCopy.drSettings.drMethod = value;
      setChartSettings(chartSettingsCopy);
      changeRestRoute(chartSettingsCopy);
    };

    const onChangeConvexHull = (e) => {
        let chartSettingsCopy = { ...chartSettings }
        chartSettingsCopy.drSettings.showConvexHull = !chartSettings.drSettings.showConvexHull;
        changeRestRoute();
        setChartSettings(chartSettings => ({
          ...chartSettingsCopy
        }));
    };
    const onChangeLogScale = (e) => {

    };

    return (
        <>
        {chartSettings !== undefined &&
           <div className='space-y-1 px-1'>
           {chartSettings.chartType === ChartUtils.ChartType.DR &&
               <>
               <div>
                  <label>Dimensionality reduction technique:</label>
                  <select className='text-sm max-w-full rounded-lg' onChange={onChangeDRSelect}>
                    {ChartUtils.chartOptions.drMethodList.length > 0 && ChartUtils.chartOptions.drMethodList.map((method) => {
                        return (<option key={method} value={method}>{method}</option>)
                    })}
                  </select>
               </div>
               <div>
                  <input 
                    type="checkbox"
                    id="convexHull"
                    name="convexHull"
                    value="convexHull"
                    checked={chartSettings.drSettings.showConvexHull}
                    onChange={onChangeConvexHull}
                  /> Show convex hull
               </div>
               </>
               
           }
           {chartSettings.chartType === ChartUtils.ChartType.TEMPORAL &&
               <>
               <div>
                  <label>Variable:</label>
                  <select className='text-sm max-w-full rounded-lg'>
                    {ChartUtils.chartOptions.ensembleVariableList.length > 0 && ChartUtils.chartOptions.ensembleVariableList.map((variable) => {
                        return (<option key={variable} className='text-sm' value={variable}>{variable}</option>)
                    })}
                  </select>
               </div>
               <div>
                  <input 
                    type="checkbox"
                    id="logScale"
                    name="logScale"
                    value="logScale"
                    checked={chartSettings.temporalSettings.logScale}
                    onChange={onChangeLogScale}
                  /> Use Log scale
               </div>
               <div>
                  <input 
                    type="checkbox"
                    id="drawAreas"
                    name="drawAreas"
                    value="drawAreas"
                    checked={chartSettings.temporalSettings.drawAreas}
                    onChange={onChangeLogScale}
                  /> Draw areas in chart
               </div>
               </>
           }
           </div>

        }
        </>
    );
}