import { useEffect, useRef, useState } from "react"
import arrow from '../Images/expand-arrow.svg'
import emptyArrow from '../Images/expand-arrow-empty.svg'

export default function CollapsableArrow({
  isOpen,
  hasContent,
  width,
  height
}) {

  const [angle, setAngle] = useState(0);
  const svg = useRef(null);

  /*const animate = (arrow) => {

  };*/

  useEffect(() => {
    const arrowRef = svg.current;
    if(isOpen)
      setAngle(180);
    else
      setAngle(0)
    arrowRef.style.transform = 'rotate('+angle+'deg)';
  }, [angle, isOpen])

  return (
    hasContent ? 
    <img ref={svg} src={arrow} width={width} height={height} style={isOpen ? {transform: 'rotate(180deg)', transition: '0.5s, transform 0.5s'} : {transform: 'rotate(0deg)', transition: '0.5s, transform 0.5s'}} alt="collapsable"/> :
    <img ref={svg} src={emptyArrow} width={width} height={height} alt="empty"/>
  )
}