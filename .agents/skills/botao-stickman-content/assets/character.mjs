// Pilot 02 original vector character master, kept outside the installed Skill.
// All poses and future frame assets use this same design/geometry.
export const colors={paper:'#FDFDFC',ink:'#1d2522',mint:'#a8d9c7',orange:'#efb071',green:'#40856e',gray:'#778379'};
export function stroke(g,pts,width=6,color=colors.ink){g.beginPath();g.moveTo(...pts[0]);for(const p of pts.slice(1)){if(p.length===4)g.quadraticCurveTo(...p);else if(p.length===6)g.bezierCurveTo(...p);else g.lineTo(...p);}g.lineWidth=width;g.strokeStyle=color;g.lineCap='round';g.lineJoin='round';g.stroke();}
function oval(g,x,y,rx,ry,fill=colors.paper,width=5,angle=0){g.beginPath();g.ellipse(x,y,rx,ry,angle,0,Math.PI*2);g.fillStyle=fill;g.fill();if(width){g.lineWidth=width;g.strokeStyle=colors.ink;g.stroke();}}
function poly(g,points,fill){g.beginPath();g.moveTo(...points[0]);for(const p of points.slice(1))g.lineTo(...p);g.closePath();g.fillStyle=fill;g.fill();g.lineWidth=5;g.strokeStyle=colors.ink;g.lineJoin='round';g.stroke();}
function bottle(g,x,y,tilt=0){g.save();g.translate(x,y);g.rotate(tilt);g.fillStyle='#e7ece5';g.strokeStyle=colors.ink;g.lineWidth=4;g.beginPath();g.roundRect(-47,-150,94,37,9);g.fill();g.stroke();g.fillStyle='#fcf2cc';g.beginPath();g.roundRect(-59,-115,118,170,24);g.fill();g.stroke();g.fillStyle=colors.paper;g.fillRect(-55,-65,110,77);g.fillStyle=colors.ink;g.font='700 24px PilotBold';g.textAlign='center';g.textBaseline='middle';g.fillText('鱼油',0,-44);g.fillText('1000mg',0,-11);g.textAlign='left';stroke(g,[[-31,28],[32,28]],2,'#d6b75b');g.restore();}
function threeFingers(g,x,y){g.save();g.translate(x,y);g.fillStyle=colors.paper;g.strokeStyle=colors.ink;g.lineWidth=4;g.beginPath();g.moveTo(-20,13);g.lineTo(-29,-22);g.quadraticCurveTo(-33,-35,-23,-37);g.quadraticCurveTo(-16,-38,-12,-24);g.lineTo(-7,-9);g.lineTo(-7,-62);g.quadraticCurveTo(-7,-75,4,-75);g.quadraticCurveTo(14,-75,14,-62);g.lineTo(14,-17);g.lineTo(17,-68);g.quadraticCurveTo(17,-81,28,-79);g.quadraticCurveTo(38,-78,37,-66);g.lineTo(34,-17);g.lineTo(41,-57);g.quadraticCurveTo(43,-70,53,-66);g.quadraticCurveTo(63,-63,58,-49);g.lineTo(49,10);g.quadraticCurveTo(43,32,16,31);g.quadraticCurveTo(-8,31,-20,13);g.closePath();g.fill();g.stroke();g.restore();}
export function drawCharacter(g,{expression='smile',shirt=colors.mint,pose='explain',lookX=0,lookY=0,blink=1,progress=1}={}){
 g.save();g.lineCap='round';g.lineJoin='round';
 // World coordinate design is 800x1020: head300 / standing height~900 =33%.
 const p=Math.max(0,Math.min(1,progress)),lean=pose==='think'?-8:pose==='compare'?10*Math.sin(p*Math.PI):0;
 stroke(g,[[366+lean,645],[337,790],[283,939]],7);stroke(g,[[432+lean,645],[479,787],[540,940]],7);
 oval(g,264,946,39,12,colors.paper,4);oval(g,560,947,40,12,colors.paper,4);
 // A simple shirt with an actual neck; the limbs remain single pen lines.
 stroke(g,[[398+lean,375],[398+lean,403]],9);
 poly(g,[[344+lean,399],[450+lean,399],[500+lean,445],[468+lean,480],[452+lean,460],[458+lean,647],[337+lean,647],[345+lean,459],[322+lean,480],[291+lean,445]],shirt);
 stroke(g,[[345+lean,410],[400+lean,434,450+lean,410]],3,'#638c7b');
 let left,right;
 if(pose==='compare'){left=[[310+lean,463],[211,550-40*p],[154,446-30*p]];right=[[482+lean,463],[574,546-65*p],[640,445-55*p]];}
 else if(pose==='think'){left=[[310+lean,463],[270,570],[307,623]];right=[[482+lean,463],[574,511],[513,371]];}
 else if(pose==='three'){left=[[310+lean,463],[236,554],[218,500]];right=[[482+lean,463],[563,512-60*p],[584,394-65*p]];}
 else if(pose==='point'){left=[[310+lean,463],[267,568],[306,628]];right=[[482+lean,463],[579,462-30*p],[657,378-45*p]];}
 else {left=[[310+lean,463],[220,531],[187,469]];right=[[482+lean,463],[563,505-45*p],[615,390-55*p]];}
 stroke(g,left,7);stroke(g,right,7);
 const [lx,ly]=left.at(-1),[rx,ry]=right.at(-1);
 if(pose==='compare'){bottle(g,lx-16,ly-33,-.10+.08*p);bottle(g,rx+16,ry-33,.11-.08*p);}
 oval(g,lx,ly,19,13,colors.paper,4);
 if(pose==='three')threeFingers(g,rx,ry);else{oval(g,rx,ry,19,13,colors.paper,4);if(pose==='point')stroke(g,[[rx+10,ry-6],[rx+47,ry-22]],5);}
 const hx=400+lean,hy=232;
 oval(g,hx,hy,151,151,colors.paper,7);
 // Exactly three simple crown strands, retained in every pose.
 stroke(g,[[hx-15,hy-150],[hx-39,hy-183,hx-73,hy-174]],4.5);
 stroke(g,[[hx+4,hy-151],[hx+2,hy-195,hx+25,hy-206]],4.5);
 stroke(g,[[hx+20,hy-149],[hx+52,hy-180,hx+80,hy-165]],4.5);
 const eyeY=hy+4,ex=[hx-59,hx+59];
 for(const x of ex){if(blink<.12){stroke(g,[[x-40,eyeY],[x,eyeY+10,x+40,eyeY]],4.5);}else{oval(g,x,eyeY,47,61*blink,colors.paper,4.5);const px=x+Math.max(-20,Math.min(20,lookX)),py=eyeY+Math.max(-28,Math.min(28,lookY))+13;oval(g,px,py,16,22*blink,colors.ink,0);oval(g,px-5,py-7,4,5,'#ffffff',0);}}
 if(expression==='surprise'){
   stroke(g,[[hx-97,hy-78],[hx-64,hy-99,hx-31,hy-83]],5);stroke(g,[[hx+29,hy-85],[hx+63,hy-104,hx+97,hy-78]],5);oval(g,hx,hy+93,24,30,colors.paper,4.5);
 }else if(expression==='confused'){
   stroke(g,[[hx-96,hy-80],[hx-62,hy-103,hx-29,hy-89]],5);stroke(g,[[hx+31,hy-65],[hx+64,hy-61,hx+98,hy-76]],5);stroke(g,[[hx-18,hy+98],[hx+10,hy+75,hx+40,hy+91]],4.5);
 }else if(expression==='think'){
   stroke(g,[[hx-94,hy-76],[hx-62,hy-63,hx-30,hy-70]],5);stroke(g,[[hx+32,hy-74],[hx+65,hy-96,hx+98,hy-84]],5);stroke(g,[[hx-19,hy+91],[hx+13,hy+83,hx+42,hy+94]],4.5);
 }else{
   stroke(g,[[hx-94,hy-76],[hx-61,hy-95,hx-30,hy-77]],5);stroke(g,[[hx+31,hy-77],[hx+64,hy-94,hx+97,hy-75]],5);
   if(expression==='explain'){g.beginPath();g.moveTo(hx-34,hy+78);g.quadraticCurveTo(hx+5,hy+119,hx+43,hy+72);g.quadraticCurveTo(hx+4,hy+94,hx-34,hy+78);g.fillStyle='#344238';g.fill();g.lineWidth=3;g.strokeStyle=colors.ink;g.stroke();}
   else stroke(g,[[hx-34,hy+78],[hx+3,hy+123,hx+43,hy+72]],5);
 }
 g.restore();
}
