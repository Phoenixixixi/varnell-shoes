import{c}from"./createLucideIcon-Lbucs2oG.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],s=c("MapPin",i),f=async(a,e)=>{const t="e98aad39d7172f9c6f6b78043aaee74b57e79b31a0270f548021052b337fc5ed";if(!a)throw new Error("No Tracking Number");if(!e)throw new Error("No Courier");const r=await fetch(`https://api.binderbyte.com/v1/track?api_key=${t}&courier=${e}&awb=${a}`),o=await r.json();if(!r.ok)throw new Error(o.message||"failed to fetch");return o};export{s as M,f as g};
