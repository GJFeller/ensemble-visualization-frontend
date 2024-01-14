import React, { Component } from 'react';
import EventEmitter from '../../utils/EventEmitter';

export default class EnsembleSideBar extends Component {

  constructor(props) {
    super(props);
    this.createChart = this.createChart.bind(this);
  }

  createChart() {
    alert("Button clicked!");
    EventEmitter.emit("createChart", {
      chartType: "Test emitter"
    });
  }

  render() {
      return(
        <div>
            <button onClick={this.createChart} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create chart</button>
        </div>
      )
  }
}