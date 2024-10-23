import React, { useState, useEffect } from 'react';
import './LineGame.css';

function LineGame() {
  let totalCount = 3;
  let imgGroups;
  let svgContain;
  let initFirstimg;
  let initFirstimgPostion;
  let svg1;
  let targetid = "";
  let rellayTargid = "";

  let isDragging = false;
  let startX, startY;
  let lineElement;
  let isRightNode;
  let areaTarget = [];
  let dragTimeoff = false; // 图片放大控制
  let dragTime; // 图片放大控制定时器
  let isMoveArea = false;// 这次拖动还没有完毕

  let svgSource = [];// 点击对象数组

  useEffect(() => {
    initDom();
    domDownandMove();
  }, [])

  const initDom = () => {
    imgGroups = document.querySelectorAll('.imgGroup')[0];
    svgContain = document.getElementById('svgContain');
    initFirstimg = document.getElementById('img1');
    initFirstimgPostion = initFirstimg.getBoundingClientRect();
    const svgContainImgs = document.querySelectorAll('.targetGroup img');
    svgContainImgs.forEach(detail => { // 目标据添加
      const nodePostion = detail.getBoundingClientRect()
      const obj = JSON.parse(JSON.stringify(nodePostion));
      areaTarget.push({
        ...obj,
        hasline: false,
        targetid: detail?.id
      })
    })
    const sourceGroupImgs = document.querySelectorAll('.sourceGroup img');
    sourceGroupImgs.forEach(detail => { // 源数据添加
      const nodePostion = detail.getBoundingClientRect();
      const obj = JSON.parse(JSON.stringify(nodePostion));
      svgSource.push({
        ...obj,
        sourceid: detail?.id
      })
    })
  }

  const domDownandMove = () => {
    imgGroups.addEventListener('mousedown', startDragFromSVG1);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', endDrag);
  }

  const startDragFromSVG1 = (event) => {
    isDragging = true;
    if (event?.target?.className?.includes('imgGroup') || dragTimeoff) {
      return;
    }
    dragTimeoff = true;
    dragTime = setTimeout(() => {
      dragTimeoff = false;
      event.target.classList.toggle('scaleImg')
      clearTimeout(dragTime);
    }, 500)
    svg1 = event.target;
    event.target.classList.add('scaleImg')
    targetid = event.target.getAttribute('targetid');
    const obj = svgSource.find(item => item?.sourceid === event.target.id)
    startX = obj.x + obj.width / 2;
    startY = obj.y + obj.height;
  }

  const endDrag = () => {
    isDragging = false;
    isMoveArea = false;
    if (lineElement && rellayTargid !== targetid) {
      svgContain.removeChild(lineElement);
      removetarget(rellayTargid)
      svg1.removeAttribute("isHas");
    } 
    successEnd();
    lineElement = null;

  }

  const removetarget = (rellayTargid) => {
    areaTarget.forEach(detail => {
      if (detail.targetid === rellayTargid) {
        detail.hasline = false;
      }
    })
  }

  const successEnd = () => {
    const successArr = (areaTarget ?? []).filter(item => item?.hasline);
    if (successArr?.length === totalCount) {

    }
  }

  const  isPointInRect = (x, y, left, top, bottom, right) =>  {
    return x >= left && x <= right && y >= top && y <= bottom;
  }
  
  const handleMouseMove = (event) => {
    if (isDragging && !dragTimeoff) {
      for (const key in areaTarget) {
        const { left, top, right, bottom, hasline, targetid } = areaTarget[key];
        isRightNode = isPointInRect(event?.clientX, event?.clientY, left, top, bottom, right);
        const isHasLine = svg1.getAttribute("isHas");

        if (isRightNode && !hasline && !isMoveArea && !isHasLine) {
          const endX = left + (right - left) / 2;
          lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          lineElement.setAttribute('x1', startX - initFirstimgPostion.left);
          lineElement.setAttribute('y1', startY - initFirstimgPostion.bottom);
          lineElement.setAttribute('stroke', 'blue');
          lineElement.setAttribute('stroke-width', '2');
          svgContain.appendChild(lineElement);
          lineElement.setAttribute('x2', endX - initFirstimgPostion.left);
          lineElement.setAttribute('y2', top - initFirstimgPostion.bottom);
          areaTarget[key]['hasline'] = true;
          rellayTargid = targetid;
          isMoveArea = true;
          svg1.setAttribute("isHas",1);
        }
      }
    }
  }

  return (
    <div>
      <div className="printContain">
        <div className="imgGroup sourceGroup">
          <img id="img1" className="drag" targetid="img2" url="../images/a1.png" x="0" y="0" width="100"
            height="100"></img>
          <img id="img3" className="drag" targetid="img4" url="../images/a1.png" x="300" y="0" width="100"
            height="100"></img>
          <img id="img5" className="drag lastItem" targetid="img6" url="../images/a1.png" x="400" y="0" width="100"
            height="100"></img>
        </div>
        <svg id="svgContain">
        </svg>
        <div className="imgGroup targetGroup">
          <img id="img4" url="../images/a1.png" x="100" y="300" width="100" height="100"></img>
          <img id="img2" url="../images/a1.png" x="300" y="300" width="100" height="100"></img>
          <img id="img6" className="lastItem" url="../images/a1.png" x="500" y="300" width="100" height="100"></img>
        </div>
      </div>
    </div>

  );
};

export default LineGame;
