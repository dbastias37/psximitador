// Deterministic simulation/integration tests. No browser or GPU is mocked as verified.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const S=require('./dist/simulation.js');let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name);}
test('All three reactors and extraction reachable with player collision radius',()=>{let p={x:13.5,z:19.5};for(const [x,z]of[[46.5,7.5],[73.5,7.5],[73.5,58.5],[10.5,61.5]]){let i=0;while(Math.hypot(p.x-x,p.z-z)>.4&&i++<15000){const t=S.route(p.x,p.z,x,z),dx=t.x-p.x,dz=t.z-p.z,d=Math.hypot(dx,dz);if(d)S.move(p,dx/d*.1,dz/d*.1);}assert.ok(i<15000,`route blocked at ${JSON.stringify(p)} towards ${x},${z}`);}});
test('Player cannot tunnel through outer wall even with very large displacement',()=>{let p={x:4.5,z:4.5};S.move(p,-30,0);assert.ok(p.x>=3.32&&p.x<3.6);});
test('Solid crate prevents movement',()=>{let p={x:7,z:9};S.move(p,4,0);assert.ok(p.x<7.7);});
test('Walls occlude sight and bullets; open paths do not',()=>{assert.equal(S.clear(4.5,4.5,1.5,4.5),false);assert.equal(S.clear(13.5,19.5,13.5,10.5),true);});
test('Swept projectile detects a target between frame endpoints',()=>{assert.ok(S.segmentSphere({x:0,y:1,z:0},{x:10,y:1,z:0},{x:5,y:1,z:0},.5));assert.ok(!S.segmentSphere({x:0,y:1,z:0},{x:10,y:1,z:0},{x:5,y:3,z:0},.5));});
const T=require('./dist/vendor/three.min.js');
class Renderer{setPixelRatio(){}setSize(){}setClearColor(){}render(){}clearDepth(){}info={render:{calls:0}};getContext(){return{VERSION:1,getParameter:()=> 'Mock renderer (logic tests only)'};}}
const nodes=new Map(),context2d=new Proxy({},{get:()=>()=>{}});function node(id){if(!nodes.has(id))nodes.set(id,{style:{},value:id==='quality'?'psx':1,checked:false,hidden:true,clientWidth:800,clientHeight:600,getContext:()=>context2d});return nodes.get(id);}
const doc={getElementById:node,createElement:()=>({getContext:()=>context2d}),addEventListener(){},exitPointerLock(){}};
let src=fs.readFileSync('./dist/game.js','utf8');src=src.replace('window.ironSector={snapshot:',`window.testHooks={reset,update,fire,startReload,interact,hurt,pause,begin,resume,finish,scene,camera,cores,exit, get:()=>({player,enemies,pickups,bullets,mode,ammo,reserve,reload,kills}),play:()=>{mode='playing';started=true;},aim:()=>{camera.position.set(player.x,player.y,player.z);camera.rotation.set(player.pitch,player.yaw,0,'YXZ');camera.updateMatrixWorld();}};window.ironSector={snapshot:`);
const w={addEventListener(){}};vm.runInNewContext(src,{THREE:{...T,WebGLRenderer:Renderer},Sim:S,document:doc,window:w,performance:{now:()=>0},requestAnimationFrame(){},console,Math});const h=w.testHooks;
function tick(n){for(let i=0;i<n;i++)h.update(.02);}
test('Firing consumes ammo, projectile hits enemy, three hits kill',()=>{h.reset();h.play();const p=h.get().player;p.x=18;p.z=13.5;p.yaw=0;h.aim();for(let i=0;i<3;i++){h.fire();tick(14);}assert.equal(h.get().enemies[0].hp,-12);assert.equal(h.get().kills,1);assert.equal(h.get().ammo,9);});
test('Reload conserves total ammunition and fills magazine',()=>{const total=h.get().ammo+h.get().reserve;h.startReload();tick(60);assert.equal(h.get().ammo,12);assert.equal(h.get().ammo+h.get().reserve,total);});
test('Ammo and health pickups are collected and capped',()=>{h.reset();h.play();const p=h.get().player;p.x=7.5;p.z=16.5;tick(1);assert.equal(h.get().reserve,96);p.hp=90;p.x=19.5;p.z=19.5;tick(1);assert.equal(p.hp,100);});
test('Enemy detects player and can damage with projectiles',()=>{h.reset();h.play();const p=h.get().player;p.x=18;p.z=13.5;tick(200);assert.ok(p.hp<100);assert.ok(h.get().enemies[0].alert);});
test('Extraction stays locked until all three reactors activated',()=>{h.reset();h.play();const p=h.get().player;p.x=h.exit.x;p.z=h.exit.z;h.interact();assert.equal(h.get().mode,'playing');for(const c of h.cores){p.x=c.x;p.z=c.z;h.interact();}p.x=h.exit.x;p.z=h.exit.z;h.interact();assert.equal(h.get().mode,'won');});
test('Death, restart, and pause transitions',()=>{h.reset();h.play();h.hurt(150);assert.equal(h.get().mode,'dead');h.reset();h.play();assert.equal(h.get().player.hp,100);assert.equal(h.get().kills,0);assert.equal(h.get().ammo,12);h.pause();assert.equal(h.get().mode,'paused');});
console.log(`${passed} tests passed.`);

