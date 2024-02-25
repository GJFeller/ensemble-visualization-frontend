import { useEffect, useRef, useState } from "react"
import arrow from '../Images/expand-arrow.svg'
import emptyArrow from '../Images/expand-arrow-empty.svg'

export default function CollapsableArrow({
  hasChildren,
  showChildren
}) {

  const [angle, setAngle] = useState(0);
  const svg = useRef(null);

  /*const animate = (arrow) => {

  };*/

  useEffect(() => {
    const arrowRef = svg.current;
    if(showChildren)
      setAngle(180);
    else
      setAngle(0)
    arrowRef.setAttribute("transform", 'rotate('+angle+'deg)');
  }, [angle, showChildren])

  return (
    hasChildren ? 
    <img ref={svg} src={arrow} style={showChildren ? {transform: 'rotate(180deg)'} : {}} alt="collapsable"/> :
    <img ref={svg} src={emptyArrow} alt="empty"/>
  )
}