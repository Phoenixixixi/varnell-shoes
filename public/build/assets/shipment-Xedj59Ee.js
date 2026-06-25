import{r as P,m as H,j as e,L as M}from"./app-CZngBwfx.js";import{B as R,A as V}from"./app-layout-Db69ckjx.js";import{C as T,a as D,b as U,c as J}from"./card-C-01l5la.js";import{T as W,a as q,b as j,c as a,d as G,e as r}from"./table-CAdAypI_.js";import{B as o}from"./badge-3RykQkPL.js";import{B as u}from"./button-CODqS5cL.js";import{D as K,a as Q,b as X,c as Y,e as Z}from"./dialog-C75UDBOn.js";import{I}from"./index-wR98qV5L.js";import{L as N}from"./label-RnlHU6eo.js";import{S as ee,a as se,b as te,c as re,e as b}from"./select-Um7ctkFW.js";import{C as ae,a as oe}from"./clock-D4FjbeQN.js";import{T as v}from"./truck-Be0MBkuB.js";import{M as ie}from"./map-pin-ClANI13A.js";import{f as ne}from"./format-CBpsKyOP.js";import{P as le}from"./printer-B5Dgd3D-.js";import{P as de}from"./pen-CmqfZhyi.js";/* empty css            */import"./index-DCqUyuJZ.js";import"./createLucideIcon-xR7h_y-p.js";import"./x-_8OrIsKI.js";import"./chevron-right-BVtsr8So.js";import"./app-logo-icon-DKnG6vNB.js";import"./credit-card-DgP7lWTz.js";import"./package-DTyYC56I.js";const ce=[{title:"Shipments",href:"/admin/shipment"}];function Be({shipments:w,stats:l}){const[y,k]=P.useState(null),[L,d]=P.useState(!1),{data:c,setData:m,patch:A,processing:f,reset:z}=H({status:"",courier:"",tracking_number:""}),B=s=>{var C,S,_;const t=(C=s.order)==null?void 0:C.shippind_address,x=((_=(S=s.order)==null?void 0:S.user)==null?void 0:_.name)||"Customer",n=s.order_id,i=window.open("","_blank");if(!i)return;const p=typeof t=="object"?t==null?void 0:t.street:t,g=typeof t=="object"?t==null?void 0:t.phone:"",h=typeof t=="object"?t==null?void 0:t.postal_code:"";i.document.write(`
            <html>
                <head>
                    <title>Shipping Label - #${n}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                        body { font-family: 'Inter', sans-serif; padding: 20px; color: #000; background: #fff; }
                        .label-card { 
                            border: 3px solid #000; 
                            padding: 40px; 
                            width: 100%;
                            max-width: 550px; 
                            margin: 0 auto;
                            box-sizing: border-box;
                        }
                        .header { border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
                        .header h1 { margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 4px; }
                        .order-id { font-weight: bold; font-size: 20px; background: #000; color: #fff; padding: 5px 15px; }
                        .section { margin-bottom: 25px; }
                        .label { font-size: 11px; text-transform: uppercase; color: #000; margin-bottom: 8px; font-weight: 800; border-bottom: 1px solid #eee; display: inline-block; }
                        .content { font-size: 20px; line-height: 1.4; font-weight: 500; }
                        .phone { margin-top: 10px; font-size: 24px; font-weight: 800; border: 2px solid #000; display: inline-block; padding: 5px 15px; }
                        .footer { margin-top: 40px; font-size: 11px; text-align: center; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
                        @media print {
                            body { padding: 0; }
                            .label-card { border: 3px solid #000; box-shadow: none; width: 100%; max-width: none; height: auto; }
                            @page { margin: 1cm; }
                        }
                    </style>
                </head>
                <body>
                    <div class="label-card">
                        <div class="header">
                            <h1>VARNELL</h1>
                            <div class="order-id">#${n}</div>
                        </div>
                        
                        <div class="section">
                            <div class="label">Recipient / Penerima:</div>
                            <div class="content"><strong>${x}</strong></div>
                        </div>

                        <div class="section">
                            <div class="label">Shipping Address / Alamat:</div>
                            <div class="content">
                                ${p}<br>
                                <strong>POSTAL: ${h||"-"}</strong>
                            </div>
                        </div>

                        <div class="section">
                            <div class="label">Phone / No. Telepon:</div>
                            <br>
                            <div class="phone">${g||"-"}</div>
                        </div>

                        <div class="footer">
                            Varnell Collection - Premium Craftsmanship
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => { window.close(); }, 500);
                        }
                    <\/script>
                </body>
            </html>
        `),i.document.close()},E=[{title:"Pending",count:l.pending,icon:ae,color:"text-yellow-500",bg:"bg-gray-900/30"},{title:"In Progress",count:l.progress,icon:v,color:"text-blue-500",bg:"bg-gray-900/30"},{title:"Packaging",count:l.packaging,icon:R,color:"text-purple-500",bg:"bg-gray-900/30"},{title:"Completed",count:l.completed,icon:oe,color:"text-green-500",bg:"bg-gray-900/30"}],$=s=>{switch(s){case"pending":return e.jsx(o,{variant:"outline",className:"border-yellow-200 bg-yellow-50 text-yellow-700 font-medium",children:"Pending"});case"progress":case"sent_to_courier":return e.jsx(o,{variant:"outline",className:"border-blue-200 bg-blue-50 text-blue-700 font-medium",children:"In Progress"});case"packaging":return e.jsx(o,{variant:"outline",className:"border-purple-200 bg-purple-50 text-purple-700 font-medium",children:"Packaging"});case"completed":return e.jsx(o,{variant:"outline",className:"border-green-200 bg-green-50 text-green-700 font-medium",children:"Completed"});default:return e.jsx(o,{variant:"outline",className:"font-medium",children:s})}},O=s=>{k(s),m({status:s.status,courier:s.courier||"",tracking_number:s.tracking_number||""}),d(!0)},F=s=>{s.preventDefault(),y&&A(route("admin.shipment.update",y.id),{onSuccess:()=>{d(!1),z(),k(null)}})};return e.jsxs(V,{breadcrumbs:ce,children:[e.jsx(M,{title:"Shipments"}),e.jsxs("div",{className:"mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8",children:[e.jsx("div",{className:"grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",children:E.map(s=>e.jsx(T,{className:"border-sidebar-border/70 shadow-sm overflow-hidden hover:border-sidebar-border transition-colors",children:e.jsxs(D,{className:"flex items-center gap-4 p-6",children:[e.jsx("div",{className:`rounded-xl ${s.bg} p-3`,children:e.jsx(s.icon,{className:`h-6 w-6 ${s.color}`})}),e.jsxs("div",{children:[e.jsx("p",{className:"text-xs font-semibold uppercase tracking-wider text-muted-foreground",children:s.title}),e.jsx("h3",{className:"text-2xl font-bold mt-1",children:s.count})]})]})},s.title))}),e.jsxs(T,{className:"border-sidebar-border/70 bg-transparent shadow-sm overflow-hidden",children:[e.jsx(U,{className:"bg-muted/30 border-b border-sidebar-border/70",children:e.jsx(J,{className:"text-lg font-headline",children:"Order Shipments"})}),e.jsx(D,{className:"p-0",children:e.jsx("div",{className:"overflow-x-auto",children:e.jsxs(W,{children:[e.jsx(q,{children:e.jsxs(j,{className:"bg-muted/20",children:[e.jsx(a,{className:"font-bold",children:"Order ID"}),e.jsx(a,{className:"font-bold",children:"Customer"}),e.jsx(a,{className:"font-bold",children:"Payment"}),e.jsx(a,{className:"font-bold",children:"Courier & Tracking"}),e.jsx(a,{className:"font-bold",children:"Live Status"}),e.jsx(a,{className:"font-bold",children:"Status"}),e.jsx(a,{className:"font-bold",children:"Date"}),e.jsx(a,{className:"text-right font-bold",children:"Actions"})]})}),e.jsx(G,{children:w.length>0?w.map(s=>{var t,x,n,i,p,g,h;return e.jsxs(j,{className:"hover:bg-muted/10 transition-colors",children:[e.jsxs(r,{className:"font-medium",children:["#",s.order_id]}),e.jsx(r,{children:e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("span",{className:"font-semibold text-primary",children:((x=(t=s.order)==null?void 0:t.user)==null?void 0:x.name)||"Unknown"}),((n=s.order)==null?void 0:n.shippind_address)&&e.jsxs("div",{className:"text-xs text-muted-foreground mt-1 max-w-[200px]",children:[e.jsx("p",{className:"truncate",title:s.order.shippind_address.street,children:s.order.shippind_address.street}),e.jsxs("p",{children:["Postal: ",s.order.shippind_address.postal_code]}),e.jsxs("p",{children:["Phone: ",s.order.shippind_address.phone]})]})]})}),e.jsx(r,{children:e.jsxs("div",{className:"flex flex-col gap-1",children:[((p=(i=s.order)==null?void 0:i.payment)==null?void 0:p.status)==="success"?e.jsx(o,{className:"bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20",children:"Success"}):e.jsx(o,{variant:"outline",className:"text-yellow-600 border-yellow-500/20",children:"Pending"}),e.jsx("span",{className:"text-[10px] text-muted-foreground uppercase tracking-widest",children:((h=(g=s.order)==null?void 0:g.payment)==null?void 0:h.method)||"N/A"})]})}),e.jsx(r,{children:e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("span",{className:"text-sm font-medium",children:s.courier||"-"}),e.jsx("span",{className:"font-mono text-xs text-muted-foreground",children:s.tracking_number||"No tracking"})]})}),e.jsx(r,{children:s.tracking_details?e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsxs("div",{className:"flex items-center gap-2 text-xs font-semibold text-secondary",children:[e.jsx(v,{className:"h-3 w-3"}),s.tracking_details.status]}),e.jsxs("div",{className:"flex items-center gap-1 text-[10px] text-muted-foreground",children:[e.jsx(ie,{className:"h-2.5 w-2.5"}),s.tracking_details.position]})]}):e.jsx("span",{className:"text-xs text-muted-foreground italic",children:"N/A"})}),e.jsx(r,{children:$(s.status)}),e.jsx(r,{className:"text-xs text-muted-foreground",children:ne(new Date(s.created_at),"MMM d, yyyy")}),e.jsx(r,{className:"text-right",children:e.jsxs("div",{className:"flex justify-end gap-2",children:[e.jsx(u,{variant:"ghost",size:"icon",onClick:()=>B(s),className:"h-8 w-8 hover:bg-primary hover:text-white transition-colors",title:"Print Shipping Label",children:e.jsx(le,{className:"h-4 w-4"})}),e.jsx(u,{variant:"ghost",size:"icon",onClick:()=>O(s),className:"h-8 w-8 hover:bg-secondary hover:text-white transition-colors",children:e.jsx(de,{className:"h-4 w-4"})})]})})]},s.id)}):e.jsx(j,{children:e.jsx(r,{colSpan:7,className:"h-24 text-center text-muted-foreground",children:"No shipments found."})})})]})})})]})]}),e.jsx(K,{open:L,onOpenChange:d,children:e.jsxs(Q,{className:"sm:max-w-[425px] border-sidebar-border shadow-2xl",children:[e.jsx(X,{children:e.jsx(Y,{className:"font-headline text-xl",children:"Update Shipment"})}),e.jsxs("form",{onSubmit:F,className:"space-y-6 py-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(N,{htmlFor:"status",className:"text-xs font-bold uppercase tracking-wider text-muted-foreground",children:"Status"}),e.jsxs(ee,{value:c.status,onValueChange:s=>m("status",s),children:[e.jsx(se,{className:"w-full",children:e.jsx(te,{placeholder:"Select status"})}),e.jsxs(re,{children:[e.jsx(b,{value:"pending",children:"Pending"}),e.jsx(b,{value:"packaging",children:"Packaging"}),e.jsx(b,{value:"sent_to_courier",children:"Sent to Courier"}),e.jsx(b,{value:"completed",children:"Completed"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(N,{htmlFor:"courier",className:"text-xs font-bold uppercase tracking-wider text-muted-foreground",children:"Courier Name"}),e.jsx(I,{id:"courier",value:c.courier,onChange:s=>m("courier",s.target.value),placeholder:"e.g. JNE, FedEx, DHL",className:"bg-muted/10 border-sidebar-border"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(N,{htmlFor:"tracking_number",className:"text-xs font-bold uppercase tracking-wider text-muted-foreground",children:"Tracking Number"}),e.jsxs("div",{className:"relative",children:[e.jsx(I,{id:"tracking_number",value:c.tracking_number,onChange:s=>m("tracking_number",s.target.value),placeholder:"Enter tracking number",className:"bg-muted/10 border-sidebar-border font-mono pr-10"}),c.tracking_number&&e.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2",children:e.jsx(v,{className:"h-4 w-4 text-secondary opacity-50"})})]}),e.jsx("p",{className:"text-[10px] text-muted-foreground italic mt-1",children:"Integrating with external API for real-time tracking."})]}),e.jsxs(Z,{className:"pt-4",children:[e.jsx(u,{type:"button",variant:"outline",onClick:()=>d(!1),disabled:f,children:"Cancel"}),e.jsx(u,{type:"submit",className:"bg-secondary text-white hover:bg-secondary/90",disabled:f,children:f?"Updating...":"Save Changes"})]})]})]})})]})}export{Be as default};
