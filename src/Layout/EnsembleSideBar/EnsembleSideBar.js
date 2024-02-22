import React, { Component } from 'react';
import EventEmitter from '../../utils/EventEmitter';
import TreeView from '../../Components/TreeView';

export default class EnsembleSideBar extends Component {

  constructor(props) {
    super(props);
    this.createChart = this.createChart.bind(this);
    this.treeData = [
      {
        key: "1",
        label: "Test-1",
        isChecked: false,
        children: [
          {
            key: "2",
            label: "Test-1-1",
            isChecked: false,
            children: [
              {
                key: "3",
                label: "Test-1-1-1",
                isChecked: false,
              },
              {
                key: "4",
                label: "Test-1-1-2",
                isChecked: false,
              }
            ]
          },
          {
            key: "5",
            label: "Test-1-2",
            isChecked: false,
            
          },
          {
            key: "6",
            label: "Test-1-3",
            isChecked: false,
          }
        ]
      },
      {
        key: "7",
        label: "Test-2",
        isChecked: false,
      },
      {
        key: "8",
        label: "Test-3",
        isChecked: false,
        children: [
          {
            key: "9",
            label: "Test-3-1",
            isChecked: false,
          },
          {
            key: "10",
            label: "Test-3-2",
            isChecked: false,
          }
        ]
      }
    ];
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
            <div className='border-1 m-2 bg-gray-300 border-gray-300'>
              <TreeView treeData={this.treeData}/>
            </div>
            <button onClick={this.createChart} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create chart</button>
        </div>
      )
  }
}