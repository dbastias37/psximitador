(function(root){
'use strict';
const W=27,H=23,S=3,grid=Array.from({length:H},()=>Array(W).fill(1));
function carve(x,z,w,h){for(let j=z;j<z+h;j++)for(let i=x;i<x+w;i++)grid[j][i]=0;}
carve(1,1,7,7);carve(10,1,7,6);carve(20,1,6,7);carve(2,11,7,6);carve(12,10,6,8);carve(21,12,5,9);carve(2,19,16,3);
carve(7,3,14,2);carve(4,7,2,13);carve(8,13,5,2);carve(14,6,2,5);carve(17,13,5,2);carve(23,7,2,6);carve(14,17,2,4);
const props=[{x:9,z:9,r:1.05},{x:18,z:15,r:1.05},{x:39,z:9,r:1.05},{x:45,z:15,r:1.05},{x:66,z:9,r:1.05},{x:72,z:18,r:1.05},{x:12,z:42,r:1.05},{x:21,z:45,r:1.05},{x:42,z:39,r:1.05},{x:48,z:48,r:1.05},{x:69,z:48,r:1.05},{x:72,z:57,r:1.05}];
function wall(x,z){return grid[Math.floor(z/S)]?.[Math.floor(x/S)]!==0;}
function free(x,z,r=.32,withProps=true){for(const dx of [-r,r])for(const dz of [-r,r])if(wall(x+dx,z+dz))return false;return !withProps||!props.some(p=>Math.hypot(x-p.x,z-p.z)<p.r+r);}
function move(p,dx,dz,r=.32){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.15));for(let i=0;i<steps;i++){if(free(p.x+dx/steps,p.z,r))p.x+=dx/steps;if(free(p.x,p.z+dz/steps,r))p.z+=dz/steps;}}
function clear(ax,az,bx,bz){const d=Math.hypot(bx-ax,bz-az),n=Math.ceil(d/.18);for(let i=1;i<=n;i++){const t=i/n;if(!free(ax+(bx-ax)*t,az+(bz-az)*t,.04))return false;}return true;}
function route(ax,az,bx,bz){const a=[Math.floor(ax/S),Math.floor(az/S)],b=[Math.floor(bx/S),Math.floor(bz/S)],key=(x,z)=>z*W+x,q=[a],prev=new Map([[key(...a),null]]);for(let k=0;k<q.length;k++){const [x,z]=q[k];if(x===b[0]&&z===b[1]){let cur=[x,z],last=cur;while(prev.get(key(...cur))){last=cur;cur=prev.get(key(...cur));}return{x:(last[0]+.5)*S,z:(last[1]+.5)*S};}for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,id=key(nx,nz);if(grid[nz]?.[nx]===0&&!prev.has(id)&&free((nx+.5)*S,(nz+.5)*S,.34)){prev.set(id,[x,z]);q.push([nx,nz]);}}}return{x:ax,z:az};}
function segmentSphere(a,b,c,r){const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,len=dx*dx+dy*dy+dz*dz;const t=len?Math.max(0,Math.min(1,((c.x-a.x)*dx+(c.y-a.y)*dy+(c.z-a.z)*dz)/len)):0;return Math.hypot(a.x+t*dx-c.x,a.y+t*dy-c.y,a.z+t*dz-c.z)<=r;}
const api={W,H,S,grid,props,wall,free,move,clear,route,segmentSphere};if(typeof module!=='undefined')module.exports=api;else root.Sim=api;
})(globalThis);
