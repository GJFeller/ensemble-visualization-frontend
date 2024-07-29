import React, { useEffect, useRef, useState } from 'react';
import { ChartType, ChartRender, ChartSettings, chartOptions } from '../utils/ChartUtils';

import Draggable from 'react-draggable';
import closeIcon from '../Images/close.png'
import optionsIcon from '../Images/options.png'
import ModalChartSettings from './ModalChartSettings';

let plotId = 0;


export default function DraggableWindow({
  title = "Header Title",
  restRoute = "/",
  chartType = ChartType.DR,
  selectedEnsembleList = [],
  selectedSimulationList = []
}) {

  const container = useRef(null);
  const resizible = useRef(null);
  const windowBodyId = "window-body"+plotId;
  const chartId = "plot"+plotId++;

  let tempChartSettings = new ChartSettings(chartType, title, chartId);
  tempChartSettings.ensembleList = [...selectedEnsembleList];
  tempChartSettings.simulationList = [...selectedSimulationList];
  const [chartSettings, setChartSettings] = useState(tempChartSettings);
  const [isOpenModal, setIsOpenModal] = useState(false);

  console.log("Chart settings:");
  console.log(chartSettings);

  let modalTitle = "Chart settings for " + chartSettings.chartTitle;

  console.log("DR method list:");
  console.log(chartOptions.getOptions(ChartType.DR));

  const openSettings = (e) => {
    setIsOpenModal(true);
  }

  const saveChartSettings = (modifiedChartSettings) => {
    console.log(modifiedChartSettings);
    setChartSettings(modifiedChartSettings);
    setIsOpenModal(!isOpenModal);
  }

  const closeWindow = (e) => {
    console.log("Clicked to close window:", chartId);
  }

  useEffect(() => {
    console.log(chartSettings);
    fetch(process.env.REACT_APP_BACKEND_URL+chartSettings.getRestUrl())
    .then((res) => {
      return res.json();
    })
    .then((dataResponse) => {
      chartSettings.chartData = dataResponse;
      console.log(chartSettings.chartData);
      ChartRender.drawChart(chartSettings.chartId, chartSettings);

      // Create a new ResizeObserver instance
      const resizeObserver = new ResizeObserver(entries => {
        console.log(chartSettings);
        ChartRender.drawChart(chartSettings.chartId, chartSettings);
      });

      resizeObserver.observe(resizible.current);
      return () => {
        resizeObserver.disconnect();
      };
    });
  }, [chartSettings]);

  return (
    <>
      <Draggable
        handle='.handle' 
        defaultPosition={{x: 0, y: 0}}
        position={null}
        scale={1}
      >
        <div ref={resizible} className="flex flex-col items-stretch min-w-32 min-h-32 w-64 h-64 max-w-full max-h-full border-2 overflow-auto resize">
          <div className='handle justify-items-stretch'>
            <div id="header" className="bg-gray-300 px-2 h-16 flex flex-row space-x-2 rounded">
              <div className="grow place-self-center">
                <h2 className="text-center">{chartSettings.chartTitle}</h2>
              </div>
              <div className="place-self-center flex justify-end space-x-2">
                <button className="border-2 border-black rounded-lg p-1" onClick={openSettings}><img src={optionsIcon} width="24" height="24" alt="close window"/></button> 
                <button className="border-2 border-black rounded-lg p-1" onClick={closeWindow}><img src={closeIcon} width="24" height="24" alt="close window"/></button> 
              </div>
            </div>
          </div>
          <div 
            id={windowBodyId}
            className='flex items-center flex-auto max-w-full max-h-full overflow-auto' 
            ref={container}
          >
            <svg id={chartSettings.chartId}></svg>
          </div>
        </div>
      </Draggable>
      <ModalChartSettings 
        isOpen={isOpenModal} 
        setIsOpenModal={() => setIsOpenModal(!isOpenModal)}
        title={modalTitle}
        chartSettings={chartSettings}
        saveChartSettings={saveChartSettings}
        >
      </ModalChartSettings>
    </>
  );
}

//export type DraggableWindowProps = { 
//  windowTitle?: string
// };
//
//export default class DraggableWindow extends Component<DraggableWindowProps> {
//  constructor(props) {
//        super(props);
//        this.chartId = "plot"+plotId++;
//        this.state = {
//			    dimensions: null
//		    };
//    }
//
//  componentDidMount() {
//    this.setState({
//			dimensions: {
//				width: this.container.offsetWidth,
//				height: this.container.offsetHeight,
//			}
//		});
//    this.drawChart();
//  }
//
//  drawChart() {
//    const data = [12, 5, 6, 6, 9, 10];
//    console.log(this.container.offsetWidth);
//    const width = this.container.offsetWidth;
//    const barSize = width/data.length - 5*(data.length-1);
//
//        const svg = d3.select("#"+this.chartId)
//                    .attr("width", width)
//                    .attr("height", 300);
//
//        svg.selectAll("rect")
//            .data(data)
//            .enter()
//            .append("rect")
//            .attr("x", (d, i) => i * (barSize + 10))
//            .attr("y", (d, i) => 300 - 10 * d)
//            .attr("width", barSize)
//            .attr("height", (d, i) => d * 10)
//            .attr("fill", "green");
//  }
//  
//  render() {
//      const { windowTitle = "Header Title" } = this.props;
//      return(
//        <Draggable
//          handle='.handle' 
//          defaultPosition={{x: 0, y: 0}}
//          position={null}
//          scale={1}
//          onStart={this.handleStart}
//          onDrag={this.handleDrag}
//          onStop={this.handleStop}>
//          <div>
//          <div className="min-w-48 min-h-48 w-64 max-w-full border-2 overflow-auto resize">
//            <div className='handle'>
//              <div id="header" className="bg-gray-300 h-16 grid grid-cols-3 gap-4 place-items-center rounded">
//                <div>
//                  
//                </div>
//                <div className="content-center">
//                  <h2 className="text-center">{windowTitle}</h2>
//                </div>
//                <div className="">
//                  
//                </div>
//              </div>
//            </div>
//            <div id="window-body" ref={e => (this.container = e)}><svg id={this.chartId}></svg></div>
//          </div>
//          </div>
//        </Draggable>
//      )
//  }
//}