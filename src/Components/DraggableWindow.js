import React, { useEffect, useRef } from 'react';

import Draggable from 'react-draggable';

let plotId = 0;

export default function DraggableWindow({
  title = "Header Title",
  restRoute = "/",
  drawChartFunction = () => {}
}) {

  const container = useRef(null);
  const resizible = useRef(null);
  const chartId = "plot"+plotId++;

  useEffect(() => {
    fetch(process.env.REACT_APP_BACKEND_URL+restRoute)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      const handleRedrawEvent = (e) => {
        drawChartFunction(chartId, data);
      }
      drawChartFunction(chartId, data);

      const resizableDiv = resizible.current;
      resizableDiv.addEventListener("mousedown", handleRedrawEvent);
      resizableDiv.addEventListener("mouseup", handleRedrawEvent);
      return () => {
        resizableDiv.removeEventListener("mousedown", handleRedrawEvent);
        resizableDiv.removeEventListener("mouseup", handleRedrawEvent);
      };
    });
  }, [restRoute, drawChartFunction]);

  return (
    <Draggable
      handle='.handle' 
      defaultPosition={{x: 0, y: 0}}
      position={null}
      scale={1}
    >
      <div ref={resizible} className="flex flex-col items-stretch min-w-32 min-h-32 w-64 h-64 max-w-full max-h-full border-2 overflow-auto resize">
        <div className='handle'>
          <div id="header" className="bg-gray-300 h-16 grid grid-cols-3 gap-4 place-items-center rounded">
            <div>
              
            </div>
            <div className="content-center">
              <h2 className="text-center">{title}</h2>
            </div>
            <div className="">
              
            </div>
          </div>
        </div>
        <div 
          id="window-body" 
          className='flex items-center flex-auto max-w-full max-h-full overflow-auto' 
          ref={container}
        >
          <svg id={chartId}></svg>
        </div>
      </div>
    </Draggable>
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