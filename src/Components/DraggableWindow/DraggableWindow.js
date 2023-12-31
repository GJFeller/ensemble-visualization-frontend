import React, { Component } from 'react';

import Draggable from 'react-draggable';

export default class DraggableWindow extends Component {
    render() {
      return(
        <Draggable
          handle='.handle' 
          defaultPosition={{x: 0, y: 0}}
          position={null}
          scale={1}
          onStart={this.handleStart}
          onDrag={this.handleDrag}
          onStop={this.handleStop}>
          <div>
          <div className="min-w-48 min-h-48 max-w-full border-2 overflow-auto resize">
            <div className='handle'>
              <div id="header" className="bg-gray-300 h-16 grid grid-cols-3 gap-4 place-items-center rounded">
                <div>
                  
                </div>
                <div className="content-center">
                  <h2 className="text-center">Header Title</h2>
                </div>
                <div className="">
                  
                </div>
              </div>
            </div>
            <div id="window-body">I can now be moved around!</div>
          </div>
          </div>
        </Draggable>
      )
  }
}