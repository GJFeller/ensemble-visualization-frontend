import { useState, useEffect, createContext, useContext } from 'react';
import * as ChartUtils from '../../utils/ChartUtils';


export default function ChartSettingsPanel(
    currentChartSettings = undefined
) {
    const [chartSettings, setChartSettings] = useState(currentChartSettings);

    useEffect( () => {
        console.log("Teste");
        setChartSettings(currentChartSettings);
    }, [currentChartSettings]);

    console.log(currentChartSettings);

    return (
        <div>
            <p>Teste</p>
        {chartSettings !== undefined ?
            (
                <div>
                {chartSettings.chartType === ChartUtils.ChartType.DR &&
                (
                    <label>Dimensionality reduction technique: </label>
                )
                }
                {chartSettings.chartType === ChartUtils.ChartType.TEMPORAL &&
                (
                    <label>Variable: </label>
                )
                }
                </div>
            ) :
            (<p>undefined</p>)
        }
        </div>
    );
}