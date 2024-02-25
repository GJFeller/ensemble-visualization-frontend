import React, { useState } from 'react';
import CollapsableArrow from './CollapsableArrow';

export default function TreeNode(props) {

  const { label } = props.node;

  const [isChecked, setIsChecked] = useState(props.node.isChecked);
  const [showChildren, setShowChildren] = useState(false);

  const handleClick = (e) => {
      setShowChildren(!showChildren);
  };

  /**
   * Change the check state for all children of the node
   * @param {array} children 
   * @param {boolean} isChecked 
   */
  const checkChildrenRecursive = (children, isChecked) => {
    if(isChecked !== undefined) {
      children?.map((node) => (
        // eslint-disable-next-line no-sequences
        node.isChecked = isChecked,
        checkChildrenRecursive(node.children, isChecked)
      ));
    }
    console.log(children);
  }

  const handleOnChange = () => {
    checkChildrenRecursive(props.node.children, !props.node.isChecked);
    props.node.isChecked = !props.node.isChecked;
    setIsChecked(!isChecked);
  }

  return (
    <>
      <div className="flex flex-row mb-2">
        <CollapsableArrow 
          onClick={handleClick} 
          hasChildren={props.node.children !== undefined} 
          showChildren={showChildren}
        />
        <input type="checkbox" 
          id={props.node.key} 
          name={label} 
          value={props.node.key} 
          checked={props.node.isChecked} 
          onChange={handleOnChange}
        />
        <button onClick={handleClick}>{label}</button>
      </div>
      <ul className="pl-2">
        {showChildren && 
        props.node.children !== undefined && props.node.children.map((node) => (
          <TreeNode key={node.key} node={node}/>
        ))}
      </ul>
    </>
  );
}