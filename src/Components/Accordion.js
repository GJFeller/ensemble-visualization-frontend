import { useState } from 'react'
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

  const [isOpen, setIsOpen] = useState(false);
  const hasContent = children !== undefined

  const handleClick = (e) => {
    setIsOpen(!isOpen);
  };

  return (
   <div className='container mx-auto bg-gray-300 border-gray-300'>
     <div className='wrapper mx-auto bg-gray-300 border-gray-300'>
        <div className='flex '>
        <button 
          onClick={handleClick}
          className='grow flex'
        >
            <div className='flex-1'>
              <p>{title}</p>
            </div>
            <div className='flex-none items-right'>
                <CollapsableArrow
                  hasContent={hasContent} 
                  isOpen={isOpen}
                  width={20}
                  height={20}
                />
            </div>
        </button>
        </div>
         <div className='mx-auto bg-gray-200 border-gray-300'>
            {isOpen && children}
         </div>
     </div>
   </div>
  )
}