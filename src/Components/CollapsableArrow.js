import { useEffect, useRef, useState } from "react"

export default function CollapsableArrow({
  hasChildren,
  showChildren
}) {

  const [angle, setAngle] = useState(0);
  const svg = useRef(null);

  /*const animate = (arrow) => {

  };*/

  useEffect(() => {
    const arrow = svg.current;
    if(showChildren)
      setAngle(180);
    else
      setAngle(0)
    arrow.setAttribute("transform", 'rotate('+angle+')');
  }, [showChildren])

  return (
    <svg  width="15pt" height="15pt" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g ref={svg}>
        {hasChildren &&
        <path transform="scale(4.1667)" d="m21 8.5003-9 9-9-9" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="2"/>
        }
      </g>
    </svg> 
  )
}