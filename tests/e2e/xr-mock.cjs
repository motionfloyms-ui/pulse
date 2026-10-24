/* A small WebXR mock for the end-to-end test: enough of XRSession, XRFrame and XRWebGLLayer for three.js r185
   (XRWebGLLayer path), with controllers or a hand whose poses the test sets. Drives the Himmelsraum's VR code. */
module.exports=function installXRMock(){
 const persp=(fov,aspect,n,f)=>{const t=1/Math.tan(fov/2);return new Float32Array([t/aspect,0,0,0,0,t,0,0,0,0,(f+n)/(n-f),-1,0,0,2*f*n/(n-f),0])};
 const compose=(p,q)=>{const [x,y,z,w]=q,x2=x+x,y2=y+y,z2=z+z,xx=x*x2,xy=x*y2,xz=x*z2,yy=y*y2,yz=y*z2,zz=z*z2,wx=w*x2,wy=w*y2,wz=w*z2;
  return new Float32Array([1-(yy+zz),xy+wz,xz-wy,0,xy-wz,1-(xx+zz),yz+wx,0,xz+wy,yz-wx,1-(xx+yy),0,p[0],p[1],p[2],1])};
 const lookQuat=(dir)=>{const l=Math.hypot(...dir)||1,d=dir.map(v=>v/l),f=[0,0,-1],dot=f[0]*d[0]+f[1]*d[1]+f[2]*d[2];
  if(dot<-.9999)return [0,1,0,0];const c=[f[1]*d[2]-f[2]*d[1],f[2]*d[0]-f[0]*d[2],f[0]*d[1]-f[1]*d[0]],w=1+dot,n=Math.hypot(c[0],c[1],c[2],w);return [c[0]/n,c[1]/n,c[2]/n,w/n]};
 const st=window.__xr={head:[0,1.5,0],headQ:[0,0,0,1],poses:new Map(),frame:null,session:null,frames:0,lookQuat};
 const JOINTS=['wrist','thumb-metacarpal','thumb-phalanx-proximal','thumb-phalanx-distal','thumb-tip','index-finger-metacarpal','index-finger-phalanx-proximal','index-finger-phalanx-intermediate','index-finger-phalanx-distal','index-finger-tip','middle-finger-metacarpal','middle-finger-phalanx-proximal','middle-finger-phalanx-intermediate','middle-finger-phalanx-distal','middle-finger-tip','ring-finger-metacarpal','ring-finger-phalanx-proximal','ring-finger-phalanx-intermediate','ring-finger-phalanx-distal','ring-finger-tip','pinky-finger-metacarpal','pinky-finger-phalanx-proximal','pinky-finger-phalanx-intermediate','pinky-finger-phalanx-distal','pinky-finger-tip'];
 st.controller=(handedness)=>{const s={handedness,targetRayMode:'tracked-pointer',targetRaySpace:{name:handedness+'-ray'},gripSpace:{name:handedness+'-grip'},gamepad:{axes:[0,0,0,0],buttons:[],hapticActuators:[{pulse:()=>Promise.resolve(true)}]},profiles:['oculus-touch']};st.poses.set(s.targetRaySpace,{p:[handedness==='left'?-.2:.2,1.1,-.3],q:[0,0,0,1]});st.poses.set(s.gripSpace,{p:[handedness==='left'?-.2:.2,1.1,-.25],q:[0,0,0,1]});return s};
 st.hand=(handedness)=>{const hand=new Map(JOINTS.map(n=>[n,{jointName:n}]));const s={handedness,targetRayMode:'tracked-pointer',targetRaySpace:{name:handedness+'-handray'},hand,gamepad:null,profiles:['generic-hand']};st.poses.set(s.targetRaySpace,{p:[.2,1.2,-.3],q:[0,0,0,1]});s.center=[.15,1.2,-.35];s.pinch=false;return s};
 st.aim=(space,pos,target)=>{st.poses.set(space,{p:pos,q:lookQuat([target[0]-pos[0],target[1]-pos[1],target[2]-pos[2]])})};
 class Frame{constructor(session){this.session=session}
  getViewerPose(){const h=st.head,q=st.headQ,P=persp(Math.PI/2,1,.03,5000);return {transform:{matrix:compose(h,q)},views:[{eye:'left',projectionMatrix:P,transform:{matrix:compose([h[0]-.032,h[1],h[2]],q)}},{eye:'right',projectionMatrix:P,transform:{matrix:compose([h[0]+.032,h[1],h[2]],q)}}]}}
  getPose(space){const p=st.poses.get(space);return p?{transform:{matrix:compose(p.p,p.q)}}:null}
  getJointPose(joint){const src=[...this.session.inputSources].find(s=>s.hand&&[...s.hand.values()].includes(joint));if(!src)return null;const c=src.center,i=JOINTS.indexOf(joint.jointName);
   let p=[c[0]+(i%5)*.01,c[1]+Math.floor(i/5)*.012,c[2]];if(joint.jointName==='index-finger-tip')p=[c[0],c[1]+.04,c[2]-.03];if(joint.jointName==='thumb-tip')p=src.pinch?[c[0]+.005,c[1]+.04,c[2]-.03]:[c[0]+.06,c[1]+.01,c[2]-.02];return {transform:{matrix:compose(p,(src.jointQ&&src.jointQ[joint.jointName])||[0,0,0,1])},radius:.008}}}
 class Session extends EventTarget{
  constructor(){super();this.renderState={baseLayer:null,depthNear:.1,depthFar:1000};this.inputSources=[];this.visibilityState='visible';this.enabledFeatures=['local-floor','hand-tracking'];this.environmentBlendMode='opaque';this.ended=false;this.cbs=new Map();this.nextId=1}
  updateRenderState(s){Object.assign(this.renderState,s)}
  async requestReferenceSpace(type){return {type,getOffsetReferenceSpace(){return this}}}
  requestAnimationFrame(cb){const id=this.nextId++;const h=requestAnimationFrame(t=>{this.cbs.delete(id);if(this.ended)return;const f=new Frame(this);st.frame=f;st.frames++;cb(t,f)});this.cbs.set(id,h);return id}
  cancelAnimationFrame(id){const h=this.cbs.get(id);if(h)cancelAnimationFrame(h);this.cbs.delete(id)}
  async end(){if(this.ended)return;this.ended=true;for(const h of this.cbs.values())cancelAnimationFrame(h);this.cbs.clear();this.dispatchEvent(new Event('end'))}
  setSources(list){const removed=this.inputSources.filter(s=>!list.includes(s)),added=list.filter(s=>!this.inputSources.includes(s));this.inputSources=list;const e=new Event('inputsourceschange');e.added=added;e.removed=removed;this.dispatchEvent(e)}
  fire(type,src){const e=new Event(type);e.inputSource=src;e.frame=st.frame||new Frame(this);this.dispatchEvent(e)}
 }
 window.XRWebGLLayer=class{constructor(session,gl,init){this.framebuffer=null;this.framebufferWidth=800;this.framebufferHeight=400;this.ignoreDepthValues=true;this.antialias=!!(init&&init.antialias)}getViewport(view){return view.eye==='left'?{x:0,y:0,width:400,height:400}:{x:400,y:0,width:400,height:400}}};
 try{delete window.XRWebGLBinding}catch(_){}window.XRWebGLBinding=undefined;
 for(const C of [window.WebGL2RenderingContext,window.WebGLRenderingContext])if(C)C.prototype.makeXRCompatible=function(){return Promise.resolve()};
 const xr={isSessionSupported:async m=>m==='immersive-vr',requestSession:async(mode,opts)=>{st.session=new Session();st.opts=opts;return st.session},addEventListener(){},removeEventListener(){}};
 Object.defineProperty(navigator,'xr',{value:xr,configurable:true});
};
