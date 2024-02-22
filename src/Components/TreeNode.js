import React, { useState } from 'react';

export default function TreeNode(props) {
    const { label } = props.node;

    const [showChildren, setShowChildren] = useState(false);

    const handleClick = () => {
        setShowChildren(!showChildren);
    };

    // TODO: Fazer um evento que rode nos TreeNode filhos para mudar o estado de suas variáveis
    const checkChildrenRecursive = (children, isChecked) => {
      if(isChecked !== undefined) {
        children?.map((node) => (
          node.isChecked = isChecked,
          checkChildrenRecursive(node.children, isChecked)
        ));
      }
      console.log(children);
    }

    const handleOnChange = () => {
      checkChildrenRecursive(props.node.children, !props.node.isChecked);
      props.node.isChecked = !props.node.isChecked;
    }

    return (
      <>
        <div onClick={handleClick} style={{ marginBottom: "10px" }}>
          <input type="checkbox" id={props.node.key} name={label} value={props.node.key} checked={props.node.isChecked} onChange={handleOnChange}/>
          <span>{label}</span>
        </div>
        <ul style={{ paddingLeft: "10px", borderLeft: "1px solid black" }}>
          {showChildren && 
          props.node.children !== undefined && props.node.children.map((node) => (
            <TreeNode key={node.key} node={node}/>
          ))}
        </ul>
      </>
    );
}