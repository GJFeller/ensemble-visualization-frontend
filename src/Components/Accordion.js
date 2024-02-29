import { useRef, useState } from 'react'
import CollapsableArrow from './CollapsableArrow'

/**
 * Accordion component
 * 
 * Example of usage:
 * <Accordion
 *   title={"My Title"}
 * >
 *   {myContent}
 * </Accordion>
 */
export default function Accordion({
  title, 
  children}) {

  return (
   <div className='container mx-auto bg-gray-300 border-gray-300'>
     <div className='wrapper'>
        <button className='flex'>
            <div className='flex-1'>
              <p>{title}</p>
            </div>
            <div className='flex-none'>
              <CollapsableArrow
                hasContent={false} 
                isOpen={false}
                width={20}
                height={20}
              />
            </div>
        </button>
         <div>
            {children}
         </div>
     </div>
   </div>
  )
}