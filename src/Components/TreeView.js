import React, { useState } from 'react';
import TreeNode from './TreeNode';

export default function TreeView(props) {
  return (
    <ul>
      {props.treeData.map((node) => (
        <TreeNode node={node} key={node.key} />
      ))}
    </ul>
  );
}