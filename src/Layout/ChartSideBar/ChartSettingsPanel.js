import { useState, useEffect, createContext, useContext } from 'react';
import * as ChartUtils from '../../utils/ChartUtils';


export default function ChartSettingsPanel(
    currentChartSettings = undefined
) {
    //const [chartSettings, setChartSettings] = useState(currentChartSettings);

    //useEffect( () => {
    //    console.log("Teste");
    //    setChartSettings(currentChartSettings);
    //}, [currentChartSettings]);

    console.log(currentChartSettings);
    console.log(ChartUtils.chartOptions)

    const onChangeConvexHull = (e) => {

    };
    const onChangeLogScale = (e) => {

    };

    return (
        <>
        {currentChartSettings !== undefined &&
           <div className='space-y-1 px-1'>
           {currentChartSettings.currentChartSettings.chartType === ChartUtils.ChartType.DR &&
               <>
               <div>
                  <label>Dimensionality reduction technique:</label>
                  <select className='text-sm max-w-full rounded-lg'>
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
                    checked={currentChartSettings.currentChartSettings.drSettings.showConvexHull}
                    onChange={onChangeConvexHull}
                  /> Show convex hull
               </div>
               </>
               
           }
           {currentChartSettings.currentChartSettings.chartType === ChartUtils.ChartType.TEMPORAL &&
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
                    checked={currentChartSettings.currentChartSettings.temporalSettings.logScale}
                    onChange={onChangeLogScale}
                  /> Use Log scale
               </div>
               <div>
                  <input 
                    type="checkbox"
                    id="drawAreas"
                    name="drawAreas"
                    value="drawAreas"
                    checked={currentChartSettings.currentChartSettings.temporalSettings.drawAreas}
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