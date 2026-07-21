import{c as s}from"./createLucideIcon-CEkExjPI.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],l=s("MapPin",i),p=async(r,t,c)=>{const o="e98aad39d7172f9c6f6b78043aaee74b57e79b31a0270f548021052b337fc5ed";if(!r)throw new Error("No Tracking Number");if(!t)throw new Error("No Courier");const n=new URLSearchParams({api_key:o,courier:t,awb:r});if(c){const a=c.replace(/\D/g,"").slice(-5);a.length===5&&n.set("number",a)}let e;try{e=await(await fetch(`https://api.binderbyte.com/v1/track?${n.toString()}`)).json()}catch{throw new Error("Unable to reach tracking service. Please try again later.")}if(!e||e.status!==200){const a=(e==null?void 0:e.message)||(e==null?void 0:e.reason)||"Tracking data not available yet.";throw new Error(a)}return e};export{l as M,p as g};
