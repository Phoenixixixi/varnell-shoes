import{c as n}from"./createLucideIcon-Dme8yF9_.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const s=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],w=n("MapPin",s),l=async(a,t,o)=>{if(!a)throw new Error("No Tracking Number");if(!t)throw new Error("No Courier");const c=new URLSearchParams({awb:a,courier:t});if(o){const e=o.replace(/\D/g,"").slice(-5);e.length===5&&c.set("number",e)}let r;try{const e=await fetch(`/cek-resi?${c.toString()}`);if(!e.ok)throw new Error("Server error.");r=await e.json()}catch{throw new Error("Unable to reach tracking service. Please try again later.")}if(!r||r.status!==200)throw new Error((r==null?void 0:r.message)||(r==null?void 0:r.reason)||"Tracking data not available yet.");return r};export{w as M,l as g};
