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
   <div className='container'>
     <div className='wrapper'>
         <button>
            <p>{title}</p>
            <CollapsableArrow
              hasContent={false} 
              isOpen={false}
              width={20}
              height={20}
            />
         </button>
         <div>
            {children}
         </div>
     </div>
   </div>
  )
}