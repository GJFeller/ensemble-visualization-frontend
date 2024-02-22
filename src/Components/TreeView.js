import React from 'react';
import TreeNode from './TreeNode';

export default function TreeView(props) {
  return (
    <ul>
      {props.treeData.map((node) => (
        <TreeNode key={node.key} node={node}/>
      ))}
    </ul>
  );
}