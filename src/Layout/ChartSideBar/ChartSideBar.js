import Accordion from '../../Components/Accordion';
import ChartSettingsPanel from './ChartSettingsPanel';


export default function ChartSideBar({
  currentChartSettings = undefined
}) {
    return (
        <div className='border-1 rounded-md m-1'>
          <Accordion title="Selected Simulations"/>
          <Accordion title="Chart Settings for ">
            <ChartSettingsPanel
              currentChartSettings={currentChartSettings}
            />
          </Accordion>
        </div>
    );
}