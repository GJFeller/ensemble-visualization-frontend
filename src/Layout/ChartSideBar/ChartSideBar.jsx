import Accordion from '../../Components/Accordion';
import ChartSettingsPanel from '../../Components/ChartSettingsPanel';


export default function ChartSideBar({
  currentChartSettings = undefined
}) {
    console.log(currentChartSettings);
    return (
        <div className='border-1 rounded-md m-1 space-y-2'>
          <Accordion title="Selected Simulations"/>
          {currentChartSettings !== undefined &&
          <Accordion title={"Chart Settings for "+currentChartSettings.chartTitle}>
            <ChartSettingsPanel
              currentChartSettings={currentChartSettings}
            />
          </Accordion>
          }
        </div>
    );
}