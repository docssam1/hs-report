/* Shared, browser-native MathML for every question-bank rendering surface. */
(function(root){
  'use strict';
  var namespace='http://www.w3.org/1998/Math/MathML';
  function fraction(numerator,denominator){
    return '<math xmlns="'+namespace+'"><mfrac><mn>'+numerator+'</mn><mn>'+denominator+'</mn></mfrac></math>';
  }
  function render(value){
    if(!root.BANK_CORE||typeof root.BANK_CORE.reviewedMathText!=='function')throw Error('문제은행 수식 검수 함수를 불러오지 못했습니다.');
    return root.BANK_CORE.reviewedMathText(value).split(/(<math\b[\s\S]*?<\/math>)/g).map(function(part){
      if(part.startsWith('<math'))return part;
      return part.replace(/(^|[^0-9])(\d{1,3})\/(\d{1,3})(?![0-9])/g,function(_,prefix,numerator,denominator){
        return prefix+fraction(numerator,denominator);
      });
    }).join('');
  }
  // html2canvas does not paint MathML. Capture its browser-laid-out digits and
  // bar only in the PDF clone; the live page and exported HTML keep native MathML.
  function canvasFractions(container){
    return Array.from(container.querySelectorAll('math')).map(function(math){
      var frac=math.children.length===1&&math.firstElementChild;
      if(!frac||frac.localName!=='mfrac'||frac.children.length!==2||Array.from(frac.children).some(function(child){return child.localName!=='mn';})){
        throw Error('PDF로 내보낼 수 없는 수식입니다.');
      }
      var numbers=Array.from(frac.children),style=getComputedStyle(math),scale=3;
      var size=Math.max(10,Math.round(parseFloat(style.fontSize)*.68));
      var canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
      ctx.font='400 '+size+'px '+style.fontFamily;
      var width=Math.max(Math.ceil(math.getBoundingClientRect().width),Math.ceil(Math.max(ctx.measureText(numbers[0].textContent).width,ctx.measureText(numbers[1].textContent).width)+6));
      var height=size*2+8;canvas.width=width*scale;canvas.height=height*scale;
      ctx=canvas.getContext('2d');ctx.scale(scale,scale);
      ctx.fillStyle=style.color;ctx.strokeStyle=style.color;ctx.font='400 '+size+'px '+style.fontFamily;
      ctx.textAlign='center';ctx.textBaseline='alphabetic';
      ctx.fillText(numbers[0].textContent,width/2,size+1);
      ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(1,size+3.5);ctx.lineTo(width-1,size+3.5);ctx.stroke();
      ctx.fillText(numbers[1].textContent,width/2,size*2+6);
      return {src:canvas.toDataURL('image/png'),width:width,height:height,verticalAlign:'middle'};
    });
  }
  function applyCanvasFractions(container,captures){
    var nodes=Array.from(container.querySelectorAll('math'));
    if(nodes.length!==captures.length)throw Error('PDF 수식 개수가 달라졌습니다.');
    nodes.forEach(function(node,index){
      var capture=captures[index],image=container.ownerDocument.createElement('img');
      image.src=capture.src;image.alt=node.textContent;image.width=capture.width;image.height=capture.height;
      image.style.cssText='display:inline-block;width:'+capture.width+'px;height:'+capture.height+'px;vertical-align:'+capture.verticalAlign+';white-space:nowrap';
      node.replaceWith(image);
    });
  }
  root.GFIELD_MATH_MARKUP=Object.freeze({render:render,fraction:fraction,canvasFractions:canvasFractions,applyCanvasFractions:applyCanvasFractions});
})(window);
