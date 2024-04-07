import React, { useEffect, useState } from 'react';
import TreeView from '../../Components/TreeView';
import Accordion from '../../Components/Accordion';

export default function EnsembleSideBar({
  onCreateChart = () => {},
  restRoute = "/list-ensembles"
}) {
  const [treeData, setTreeData] = useState([]);
  useEffect(() => {
    fetch(process.env.REACT_APP_BACKEND_URL+restRoute)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
      var keyIdx = 1;
      var tree = [];
      for(var ensemble in data) {
        var ensembleNode = {
          key: keyIdx++,
          label: ensemble,
          isChecked: false,
          children: []
        };
        for(var [simIdx, simulation] of Object.entries(data[ensemble])) {
          var simulationNode = {
            key: keyIdx++,
            label: simulation,
            isChecked: false
          };
          ensembleNode.children.push(simulationNode);
        }
        tree.push(ensembleNode);
      }
      console.log(tree);
      setTreeData(tree);
    })
  }, [restRoute]);
  return (
        <>
            <div className='border-1 rounded-md m-1'>
            <Accordion title="Filter Options">
              <p>My content</p>
            </Accordion>
            </div>
            <div className='border-1 rounded-md m-1 bg-gray-200 border-gray-200'>
              <TreeView treeData={treeData}/>
            </div>
            <button onClick={onCreateChart} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create chart</button>
        </>
  );
}