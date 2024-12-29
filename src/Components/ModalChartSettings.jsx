import React, { useEffect, useRef, useState } from "react";
import closeIcon from "../Images/close.png";
import ChartSettingsPanel from "./ChartSettingsPanel";
import {
  ChartType,
  ChartRender,
  ChartSettings,
  chartOptions,
} from "../utils/ChartUtils";
import { clone } from "../utils/utils";
import CorrelationMatrix from "./Charts/CorrelationMatrix";
import DRScatterPlot from "./Charts/DRScatterPlot";
import TemporalPlot from "./Charts/TemporalPlot";

export default function ModalChartSettings({
  isOpen,
  setIsOpenModal,
  title = "Title",
  chartSettings,
  saveChartSettings,
  dimensions,
}) {
  const [currentChartSettings, setCurrentChartSettings] = useState(
    chartSettings.clone(),
  );
  const modalRef = useRef(null);
  const [modalDimensions, setModalDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Add resize observer to track modal dimensions
  useEffect(() => {
    if (!modalRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        console.log(currentChartSettings.chartData);
        setModalDimensions({ width, height });
      }
    });

    resizeObserver.observe(modalRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch(process.env.REACT_APP_BACKEND_URL + currentChartSettings.getRestUrl())
      .then((res) => {
        return res.json();
      })
      .then((dataResponse) => {
        currentChartSettings.chartData = dataResponse;
        setIsLoading(false);
        setUpdateTrigger(prev => prev + 1); // Add this line
      })
      .catch((error) => {
        console.error('Error fetching chart data:', error);
        setIsLoading(false);
      });;
  }, [currentChartSettings, isOpen]);

  const changeChartSettings = (modifiedChartSettings) => {
    setCurrentChartSettings(modifiedChartSettings);
  };

  const renderChart = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    const props = {
      width: modalDimensions.width,
      height: modalDimensions.height,
      chartSettings: currentChartSettings,
      key: updateTrigger
    };

    switch (currentChartSettings.chartType) {
      case ChartType.CORRELATIONMATRIX:
        return <CorrelationMatrix {...props} />;
      case ChartType.DR:
        return <DRScatterPlot {...props} />;
      default:
        return <TemporalPlot {...props} />;
    }
  };

  if (isOpen) {
    return (
      <div className="fixed flex flex-row content-center justify-stretch space-x-16 left-0 top-0 size-full z-50 bg-black opacity-80">
        <div className="flex flex-col m-auto place-self-center max-w-full max-h-full bg-slate-400 border-slate-400 opacity-100 rounded-lg">
          <div className="h-8 flex flex-row border-2 border-slate-400 border-b-black rounded-t-lg opacity-100">
            <div className="flex flex-row grow justify-center">
              <div className="">{title}</div>
            </div>
            <button className="p-1" onClick={setIsOpenModal}>
              <img src={closeIcon} width="8" height="8" alt="close window" />
            </button>
          </div>
          <div className="flex flex-col bg-white rounded-b-lg opacity-100">
            <ChartSettingsPanel
              currentChartSettings={currentChartSettings}
              changeChartSettings={changeChartSettings}
            />
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-auto rounded"
              onClick={() => saveChartSettings(currentChartSettings.clone())}
            >
              Salvar
            </button>
          </div>
        </div>
        <div className="flex flex-col place-self-center content-center justify-center w-1/2 h-1/2 max-w-full max-h-full">
          <div
            ref={modalRef}
            id={"modal-" + currentChartSettings.chartId}
            className="bg-white m-auto w-11/12 h-full"
          >
            {renderChart()}
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
}