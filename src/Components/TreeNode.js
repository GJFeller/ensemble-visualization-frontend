import React, { useState } from 'react';
import TreeView from './TreeView';

export default function TreeNode(props) {
    const { children, label } = props.node;

    const [showChildren, setShowChildren] = useState(false);

    const handleClick = () => {
        setShowChildren(!showChildren);
    };

    return (
      <>
        <div onClick={handleClick} style={{ marginBottom: "10px" }}>
          <span>{label}</span>
        </div>
        <ul style={{ paddingLeft: "10px", borderLeft: "1px solid black" }}>
          {showChildren && 
          children != undefined ? children.map((node) => (
            <TreeNode node={node} key={node.key} />
          )) : <></>}
        </ul>
      </>
    );
}