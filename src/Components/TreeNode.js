import React, { useState } from 'react';

export default function TreeNode(props) {
    const label = props.node.label;

    const [isChecked, setChecked] = useState(props.node.isChecked);

    const [showChildren, setShowChildren] = useState(false);

    const handleClick = () => {
        setShowChildren(!showChildren);
    };

    const checkChildrenRecursive = (children, isChecked) => {
        children?.map((node) => (
          node.isChecked = isChecked,
          checkChildrenRecursive(node.children)
        ));
        console.log(children);
    }

    const handleOnChange = () => {
      checkChildrenRecursive(props.node.children, !isChecked);
      setChecked(!isChecked);
    }

    return (
      <>
        <div onClick={handleClick} style={{ marginBottom: "10px" }}>
          <input type="checkbox" id={props.key} name={label} value={props.key} checked={isChecked} onChange={handleOnChange}/>
          <span>{label}</span>
        </div>
        <ul style={{ paddingLeft: "10px", borderLeft: "1px solid black" }}>
          {showChildren && 
          props.node.children !== undefined ? props.node.children.map((node) => (
            <TreeNode node={node} key={node.key} />
          )) : <></>}
        </ul>
      </>
    );
}