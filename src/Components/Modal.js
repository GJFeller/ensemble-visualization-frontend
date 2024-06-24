import React, { useEffect, useRef, useState } from 'react';
import closeIcon from '../Images/close.png'

export default function Modal({isOpen, setIsOpenModal, title = "Title", children}) {
    
    if(isOpen) {
        return (
            <div className='fixed flex flex-col place-content-center justify-center content-center left-0 top-0 size-full z-50 bg-black opacity-80'>
                <div className='flex flex-col m-auto max-w-96 bg-white rounded-lg'>
                  <div className='h-8 flex flex-row border-2 border-b-black rounded-t-lg'>
                    <div className='flex flex-row grow justify-center'>
                        <div className=''>
                          {title}
                        </div>
                    </div>
                    <button className=" p-1"><img src={closeIcon} width="8" height="8" alt="close window"/></button> 
                  </div>
                  {children}
                  <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-auto rounded' onClick={setIsOpenModal}>Salvar</button>
                </div>
            </div>
        );
    }
    else {
        return null;
    }
}