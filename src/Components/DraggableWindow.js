import React, { useEffect, useRef, useState, memo } from "react";
import {
  ChartType,
  ChartRender,
  ChartSettings,
  chartOptions,
} from "../utils/ChartUtils";

import { Handle, Position, NodeResizer } from "@xyflow/react";
import closeIcon from "../Images/close.png";
import optionsIcon from "../Images/options.png";
import parentIcon from "../Images/arrow-small-up.png";
import ModalChartSettings from "./ModalChartSettings";
import Heatmap from "./Charts/Heatmap";
//import CorrelationMatrix from "./Charts/CorrelationMatrix";

import "@xyflow/react/dist/base.css";
import CorrelationMatrix from "./Charts/CorrelationMatrix";

const MINWIDTH = 200,
  MINHEIGHT = 200;

const DraggableWindow = ({ data }) => {
  let chartSettings = data.chartSettings;
  const closeWindow = data.closeWindow;
  const container = useRef(null);
  const resizible = useRef(null);
  const windowBodyId = "window-body-" + chartSettings.chartId;

  const [currentChartSettings, setCurrentChartSettings] =
    useState(chartSettings);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [dimensions, setDimensions] = useState([MINWIDTH, MINHEIGHT - 64]);

  let modalTitle = "Chart settings for " + currentChartSettings.chartTitle;

  const openSettings = (e) => {
    setIsOpenModal(true);
  };

  const saveChartSettings = (modifiedChartSettings) => {
    setCurrentChartSettings(modifiedChartSettings);
    setIsOpenModal(!isOpenModal);
  };

  const closeWindowPressed = (e) => {
    closeWindow(chartSettings.chartId);
  };

  useEffect(() => {
    if (currentChartSettings.chartType !== ChartType.CORRELATIONMATRIX) {
      fetch(
        process.env.REACT_APP_BACKEND_URL + currentChartSettings.getRestUrl(),
      )
        .then((res) => {
          return res.json();
        })
        .then((dataResponse) => {
          currentChartSettings.chartData = dataResponse;
          ChartRender.drawChart(
            currentChartSettings.chartId,
            currentChartSettings,
          );
        });
    }
  }, [currentChartSettings]);

  return (
    <>
      <NodeResizer
        minWidth={MINWIDTH}
        minHeight={MINHEIGHT}
        onResizeEnd={() => {
          if (currentChartSettings.chartType !== ChartType.CORRELATIONMATRIX) {
            ChartRender.drawChart(
              currentChartSettings.chartId,
              currentChartSettings,
            );
          } else {
            const plotWidth = container.current.offsetWidth;
            const plotHeight = container.current.offsetHeight;
            setDimensions([plotWidth, plotHeight]);
          }
        }}
      />
      <div
        id={"viz-" + chartSettings.chartId}
        ref={resizible}
        className="flex flex-col items-stretch min-w-full min-h-full max-w-full max-h-full border-2 overflow-clip"
      >
        <div className="handle justify-items-stretch">
          <div
            id="header"
            className="bg-gray-300 px-2 h-16 flex flex-row space-x-2 rounded"
          >
            <div className="grow place-self-center">
              <h2 className="text-center">{currentChartSettings.chartTitle}</h2>
            </div>
            <div className="place-self-center flex justify-end space-x-2">
              <button
                className="border-2 border-black rounded-lg p-1"
                onClick={openSettings}
              >
                <img
                  src={optionsIcon}
                  width="24"
                  height="24"
                  alt="chart options window"
                />
              </button>
              <button
                className="border-2 border-black rounded-lg p-1"
                onClick={closeWindowPressed}
              >
                <img
                  src={closeIcon}
                  width="24"
                  height="24"
                  alt="close window"
                />
              </button>
            </div>
          </div>
        </div>
        <div
          id={windowBodyId}
          className="flex items-center flex-auto max-w-full max-h-full overflow-auto"
          ref={container}
        >
          {currentChartSettings.chartType === ChartType.CORRELATIONMATRIX ? (
            <CorrelationMatrix
              width={dimensions[0]}
              height={dimensions[1]}
              chartSettings={currentChartSettings}
            />
          ) : (
            <svg id={currentChartSettings.chartId}></svg>
          )}
        </div>
      </div>
      <ModalChartSettings
        isOpen={isOpenModal}
        setIsOpenModal={() => setIsOpenModal(!isOpenModal)}
        title={modalTitle}
        chartSettings={currentChartSettings}
        saveChartSettings={saveChartSettings}
      ></ModalChartSettings>
    </>
  );
};

export default memo(DraggableWindow);
