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

    return (
        <>
        {currentChartSettings !== undefined &&
           <div>
           {currentChartSettings.currentChartSettings.chartType === ChartUtils.ChartType.DR &&
               <>
               <div>
                  <label>Dimensionality reduction technique:</label>
                  <select>
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
                    checked={currentChartSettings.currentChartSettings.drOptions.showConvexHull}
                    onChange={onChangeConvexHull}
                  /> Show convex hull
               </div>
               </>
               
           }
           {currentChartSettings.currentChartSettings.chartType === ChartUtils.ChartType.TEMPORAL &&
               <label>Variable:</label>
           }
           </div>

        }
        </>
    );
}