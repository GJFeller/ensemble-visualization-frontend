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

import "@xyflow/react/dist/base.css";

const NodeChart = ({ data }) => {
  let chartSettings = data.chartSettings;
  const closeWindow = data.closeWindow;
  const windowBodyId = "window-body-" + chartSettings.chartId;

  console.log(chartSettings);
  const [currentChartSettings, setCurrentChartSettings] =
    useState(chartSettings);
  const [isOpenModal, setIsOpenModal] = useState(false);

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
    fetch(process.env.REACT_APP_BACKEND_URL + currentChartSettings.getRestUrl())
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
  }, [currentChartSettings]);

  return (
    <>
      <NodeResizer minWidth={100} minHeight={100} />
      <div className="p-2">{currentChartSettings.chartTitle}</div>
    </>
  );
};

export default memo(NodeChart);
