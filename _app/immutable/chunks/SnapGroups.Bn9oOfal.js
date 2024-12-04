import{s as Ge,c as De,r as Y,j as Te,k as fe}from"./scheduler.BeHD8Juy.js";import{S as Ve,i as Je,v as de,f as T,h as E,l as q,j as O,m as W,d as v,e as N,n as P,c as y,a as D,p as F,q as g,g as j,r as G,E as we,t as M,b as R,y as z,A as Ee,s as oe,k as Ie,u as se,w as Z,x as K,z as Q,B as x}from"./index.dv9gt0BC.js";import{X as L,H as Ce,I as je,J as Ne,Y as Le,e as le,F as ee,Z as Ue,_ as Be,$ as Ae,a0 as Pe,a1 as Fe}from"./mopidyTools.Ec-cZSvp.js";let J,A,ie,ce,ue,I,X=!1;L.subscribe(t=>{A=t});Ce.subscribe(t=>{ie=t});je.subscribe(t=>{ce=t});Ne.subscribe(t=>{ue=t});const He=(t,e,s)=>new Promise((n,l)=>{J=new WebSocket(`ws${s==="true"?"s":""}://${t}:${e}/jsonrpc`),J.onerror=o=>{console.log("[Snapcast]: error:",o),X=!1,l(new Error("error connecting to snapcast"))},J.onopen=()=>{console.log("[Snapcast]: Connected");let o={jsonrpc:"2.0",id:8,method:"Server.GetStatus"};J.send(JSON.stringify(o)),Le.set(J),X=!1,n("Connected")},J.onmessage=o=>{Re(o)}}),Me=async()=>{const t=await fetch("/muse/config");t.status===200&&(I=await t.json())},nt=async t=>{if(X){for(;X;)console.log("[Snapcast]: already connecting"),await new Promise(e=>setTimeout(e,200));return"[Snapcast]: finish waiting connection"}else if(J===void 0||t){X=!0,await Me();const e=I&&I.snapcast&&I.snapcast.host?I.snapcast.host:ie||document.defaultView.location.hostname,s=I&&I.snapcast&&I.snapcast.port?I.snapcast.port:ce||1780,n=I&&I.snapcast&&I.snapcast.ssl?(!!I.snapcast.ssl).toString():ue||(document.defaultView.location.protocol==="https:"?"true":"false");return Ce.set(e),je.set(s),Ne.set(n),`[Snapcast]: ${await He(e,s,n)}`}else return"[Snapcast]: already connected"},me=t=>{L.set(t.map(e=>({id:e.id,name:e.name,muted:e.muted,clients:e.clients.map(s=>({id:s.id,host:s.host.name,name:s.config.name,volume:s.config.volume.percent,connected:s.connected,muted:s.config.volume.muted}))})))};function Re(t){const e=JSON.parse(t.data);if(console.log("[Snapcast]: ",e),e.result&&e.result.server&&e.result.server.groups){const s=e.result.server.groups;me(s)}if(e&&e.method){if(e.method==="Client.OnDisconnect"){const s=e.params.client.id;L.set(A.map(n=>(n.clients.forEach(l=>{l.id===s&&(l.connected=!1)}),n)))}else if(e.method==="Client.OnConnect"){const s=e.params.client.id;L.set(A.map(n=>(n.clients.forEach(l=>{l.id===s&&(l.connected=!0)}),n)))}else if(e.method==="Client.OnNameChanged"){const s=e.params.id;L.set(A.map(n=>(n.clients.forEach(l=>{l.id===s&&(l.name=e.params.name)}),n)))}else if(e.method==="GrClient.OnNameChanged"){const s=e.params.id;L.set(A.map(n=>(n.id===s&&(n.client.name=e.params.name),n)))}else if(e.method==="Client.OnVolumeChanged"){const s=e.params.id;L.set(A.map(n=>(n.clients.forEach(l=>{l.id===s&&(l.volume=e.params.volume.percent)}),n)))}else if(e.method==="Server.OnUpdate"){const s=e.params.server.groups;me(s)}}}function st(t,e){console.log(`[Snapcast]: ${e?"Unmute":"Mute"} client ${t}`);let s={id:8,jsonrpc:"2.0",method:"Client.SetVolume",params:{id:t,volume:{muted:!1,percent:e?10:0}}};J.send(JSON.stringify(s)),L.set(A.map(n=>(n.clients.forEach(l=>{l.id==t&&(l.volume=e?10:0,l.muted=!e)}),n)))}function lt(t,e){console.log(`[Snapcast]: ${e?"Unmute":"Mute"} group ${t}`);let s={id:8,jsonrpc:"2.0",method:"Group.SetMute",params:{id:t,mute:!e}};J.send(JSON.stringify(s)),L.set(A.map(n=>(n.muted=!e,n.id===t&&n.clients.forEach(l=>l.muted=!e),n)))}function at(t,e){console.log(`Client ${t} - vol ${e}`);let s={id:8,jsonrpc:"2.0",method:"Client.SetVolume",params:{id:t,volume:{muted:!1,percent:e}}};J.send(JSON.stringify(s))}const qe=(t,e)=>{const s={id:8,jsonrpc:"2.0",method:"Group.SetName",params:{id:t,name:e}};J.send(JSON.stringify(s))},We=(t,e)=>{const s={id:8,jsonrpc:"2.0",method:"Client.SetName",params:{id:t,name:e}};J.send(JSON.stringify(s))},pe=(t,e)=>{const s={id:8,jsonrpc:"2.0",method:"Group.SetClients",params:{clients:e,id:t}};J.send(JSON.stringify(s))},ne=t=>{const e={id:8,jsonrpc:"2.0",method:"Server.DeleteClient",params:{id:t}};J.send(JSON.stringify(e))};function he(t,e,s){const n=t.slice();return n[21]=e[s],n[22]=e,n[23]=s,n}function _e(t,e,s){const n=t.slice();return n[24]=e[s],n[25]=e,n[26]=s,n}function ge(t){let e,s,n,l,o,f,d,h,k,w,C,_,$=le(t[6]),u=[];for(let a=0;a<$.length;a+=1)u[a]=Se(he(t,$,a));const U=a=>O(u[a],1,1,()=>{u[a]=null});let S=t[5]&&$e(t);const V=[Ze,Ye],i=[];function H(a,r){return a[4]===!0?0:1}return h=H(t),k=i[h]=V[h](t),{c(){e=N("div"),s=N("div"),n=N("aside");for(let a=0;a<u.length;a+=1)u[a].c();l=P(),S&&S.c(),o=P(),f=N("div"),d=N("a"),k.c(),this.h()},l(a){e=y(a,"DIV",{class:!0});var r=D(e);s=y(r,"DIV",{class:!0});var c=D(s);n=y(c,"ASIDE",{class:!0});var p=D(n);for(let B=0;B<u.length;B+=1)u[B].l(p);l=F(p),S&&S.l(p),p.forEach(v),c.forEach(v),o=F(r),f=y(r,"DIV",{class:!0});var m=D(f);d=y(m,"A",{class:!0,href:!0});var b=D(d);k.l(b),b.forEach(v),m.forEach(v),r.forEach(v),this.h()},h(){g(n,"class","menu svelte-ojelhk"),g(s,"class","column is-12"),g(d,"class","button"),g(d,"href",null),g(f,"class","column is-12"),g(e,"class","columns is-multiline")},m(a,r){T(a,e,r),j(e,s),j(s,n);for(let c=0;c<u.length;c+=1)u[c]&&u[c].m(n,null);j(n,l),S&&S.m(n,null),j(e,o),j(e,f),j(f,d),i[h].m(d,null),w=!0,C||(_=G(d,"click",t[20]),C=!0)},p(a,r){if(r&95){$=le(a[6]);let p;for(p=0;p<$.length;p+=1){const m=he(a,$,p);u[p]?(u[p].p(m,r),E(u[p],1)):(u[p]=Se(m),u[p].c(),E(u[p],1),u[p].m(n,l))}for(q(),p=$.length;p<u.length;p+=1)U(p);W()}a[5]?S?S.p(a,r):(S=$e(a),S.c(),S.m(n,null)):S&&(S.d(1),S=null);let c=h;h=H(a),h!==c&&(q(),O(i[c],1,1,()=>{i[c]=null}),W(),k=i[h],k||(k=i[h]=V[h](a),k.c()),E(k,1),k.m(d,null))},i(a){if(!w){for(let r=0;r<$.length;r+=1)E(u[r]);E(k),w=!0}},o(a){u=u.filter(Boolean);for(let r=0;r<u.length;r+=1)O(u[r]);O(k),w=!1},d(a){a&&v(e),we(u,a),S&&S.d(),i[h].d(),C=!1,_()}}}function ve(t){let e,s,n;function l(){t[7].call(e,t[22],t[23])}function o(){return t[8](t[21])}return{c(){e=N("input"),this.h()},l(f){e=y(f,"INPUT",{class:!0,type:!0,placeholder:!0}),this.h()},h(){g(e,"class","input svelte-ojelhk"),g(e,"type","text"),g(e,"placeholder","Group name")},m(f,d){T(f,e,d),se(e,t[21].name),s||(n=[G(e,"input",l),G(e,"input",o)],s=!0)},p(f,d){t=f,d&64&&e.value!==t[21].name&&se(e,t[21].name)},d(f){f&&v(e),s=!1,Y(n)}}}function ze(t){let e,s;return e=new ee({props:{icon:Pe,class:"icon is-small"}}),{c(){Z(e.$$.fragment)},l(n){K(e.$$.fragment,n)},m(n,l){Q(e,n,l),s=!0},i(n){s||(E(e.$$.fragment,n),s=!0)},o(n){O(e.$$.fragment,n),s=!1},d(n){x(e,n)}}}function Xe(t){let e,s;return e=new ee({props:{icon:Fe,class:"icon is-small"}}),{c(){Z(e.$$.fragment)},l(n){K(e.$$.fragment,n)},m(n,l){Q(e,n,l),s=!0},i(n){s||(E(e.$$.fragment,n),s=!0)},o(n){O(e.$$.fragment,n),s=!1},d(n){x(e,n)}}}function be(t){let e,s,n,l,o,f,d,h,k;function w(){t[12].call(s,t[26],t[22],t[23])}function C(){return t[13](t[21],t[26])}return f=new ee({props:{icon:Ae,class:"icon"}}),{c(){e=N("div"),s=N("input"),n=P(),l=N("div"),o=N("button"),Z(f.$$.fragment),this.h()},l(_){e=y(_,"DIV",{class:!0});var $=D(e);s=y($,"INPUT",{class:!0,type:!0,placeholder:!0}),$.forEach(v),n=F(_),l=y(_,"DIV",{class:!0,role:!0,tabindex:!0});var u=D(l);o=y(u,"BUTTON",{class:!0});var U=D(o);K(f.$$.fragment,U),U.forEach(v),u.forEach(v),this.h()},h(){g(s,"class","input svelte-ojelhk"),g(s,"type","text"),g(s,"placeholder","Client name"),g(e,"class","column"),g(o,"class","button"),g(l,"class","column is-narrow"),g(l,"role","button"),g(l,"tabindex","0")},m(_,$){T(_,e,$),j(e,s),se(s,t[21].clients[t[26]].name),T(_,n,$),T(_,l,$),j(l,o),Q(f,o,null),d=!0,h||(k=[G(s,"input",w),G(s,"input",C),G(l,"click",function(){fe(ne(t[24].id))&&ne(t[24].id).apply(this,arguments)}),G(l,"keypress",function(){fe(ne(t[24].id))&&ne(t[24].id).apply(this,arguments)})],h=!0)},p(_,$){t=_,$&64&&s.value!==t[21].clients[t[26]].name&&se(s,t[21].clients[t[26]].name)},i(_){d||(E(f.$$.fragment,_),d=!0)},o(_){O(f.$$.fragment,_),d=!1},d(_){_&&(v(e),v(n),v(l)),x(f),h=!1,Y(k)}}}function ke(t){let e,s,n,l,o,f,d,h=(t[24].name?t[24].name:t[24].host)+"",k,w,C,_,$,u;const U=[Xe,ze],S=[];function V(r,c){return r[24].connected?0:1}o=V(t),f=S[o]=U[o](t);let i=t[4]===!0&&be(t);function H(...r){return t[14](t[23],t[26],...r)}function a(){return t[15](t[23],t[26])}return{c(){e=N("li"),s=N("div"),n=N("div"),l=N("a"),f.c(),d=P(),k=M(h),w=P(),i&&i.c(),this.h()},l(r){e=y(r,"LI",{draggable:!0,id:!0});var c=D(e);s=y(c,"DIV",{class:!0});var p=D(s);n=y(p,"DIV",{class:!0});var m=D(n);l=y(m,"A",{href:!0,class:!0});var b=D(l);f.l(b),d=F(b),k=R(b,h),b.forEach(v),m.forEach(v),w=F(p),i&&i.l(p),p.forEach(v),c.forEach(v),this.h()},h(){g(l,"href",null),g(l,"class","svelte-ojelhk"),g(n,"class","column"),g(s,"class","columns is-mobile is-gapless"),g(e,"draggable",!0),g(e,"id",C=t[24].id),z(e,"hover",t[3].group===t[23]&&t[3].client===t[26])},m(r,c){T(r,e,c),j(e,s),j(s,n),j(n,l),S[o].m(l,null),j(l,d),j(l,k),j(s,w),i&&i.m(s,null),_=!0,$||(u=[G(e,"dragstart",H),G(e,"mouseenter",a),G(e,"mouseleave",t[16])],$=!0)},p(r,c){t=r;let p=o;o=V(t),o!==p&&(q(),O(S[p],1,1,()=>{S[p]=null}),W(),f=S[o],f||(f=S[o]=U[o](t),f.c()),E(f,1),f.m(l,d)),(!_||c&64)&&h!==(h=(t[24].name?t[24].name:t[24].host)+"")&&oe(k,h),t[4]===!0?i?(i.p(t,c),c&16&&E(i,1)):(i=be(t),i.c(),E(i,1),i.m(s,null)):i&&(q(),O(i,1,1,()=>{i=null}),W()),(!_||c&64&&C!==(C=t[24].id))&&g(e,"id",C),(!_||c&8)&&z(e,"hover",t[3].group===t[23]&&t[3].client===t[26])},i(r){_||(E(f),E(i),_=!0)},o(r){O(f),O(i),_=!1},d(r){r&&v(e),S[o].d(),i&&i.d(),$=!1,Y(u)}}}function Se(t){let e,s,n,l=t[21].name?`${t[21].name} - `:"",o,f=t[21].id+"",d,h,k,w,C,_,$,u=t[4]===!0&&ve(t);function U(...a){return t[9](t[23],...a)}function S(){return t[10](t[21])}let V=le(t[21].clients),i=[];for(let a=0;a<V.length;a+=1)i[a]=ke(_e(t,V,a));const H=a=>O(i[a],1,1,()=>{i[a]=null});return{c(){e=N("div"),s=N("b"),n=M("Group "),o=M(l),d=M(f),h=P(),u&&u.c(),k=P(),w=N("ul");for(let a=0;a<i.length;a+=1)i[a].c();this.h()},l(a){e=y(a,"DIV",{class:!0,role:!0,tabindex:!0,ondragover:!0});var r=D(e);s=y(r,"B",{class:!0});var c=D(s);n=R(c,"Group "),o=R(c,l),d=R(c,f),c.forEach(v),h=F(r),u&&u.l(r),r.forEach(v),k=F(a),w=y(a,"UL",{class:!0});var p=D(w);for(let m=0;m<i.length;m+=1)i[m].l(p);p.forEach(v),this.h()},h(){g(s,"class","svelte-ojelhk"),g(e,"class","menu-label svelte-ojelhk"),g(e,"role","button"),g(e,"tabindex","0"),g(e,"ondragover","return false"),z(e,"hovering",t[2]===t[21].name),g(w,"class","menu-list svelte-ojelhk")},m(a,r){T(a,e,r),j(e,s),j(s,n),j(s,o),j(s,d),j(e,h),u&&u.m(e,null),T(a,k,r),T(a,w,r);for(let c=0;c<i.length;c+=1)i[c]&&i[c].m(w,null);C=!0,_||($=[G(e,"drop",Ee(U)),G(e,"dragenter",S),G(e,"dragleave",t[11])],_=!0)},p(a,r){if(t=a,(!C||r&64)&&l!==(l=t[21].name?`${t[21].name} - `:"")&&oe(o,l),(!C||r&64)&&f!==(f=t[21].id+"")&&oe(d,f),t[4]===!0?u?u.p(t,r):(u=ve(t),u.c(),u.m(e,null)):u&&(u.d(1),u=null),(!C||r&68)&&z(e,"hovering",t[2]===t[21].name),r&90){V=le(t[21].clients);let c;for(c=0;c<V.length;c+=1){const p=_e(t,V,c);i[c]?(i[c].p(p,r),E(i[c],1)):(i[c]=ke(p),i[c].c(),E(i[c],1),i[c].m(w,null))}for(q(),c=V.length;c<i.length;c+=1)H(c);W()}},i(a){if(!C){for(let r=0;r<V.length;r+=1)E(i[r]);C=!0}},o(a){i=i.filter(Boolean);for(let r=0;r<i.length;r+=1)O(i[r]);C=!1},d(a){a&&(v(e),v(k),v(w)),u&&u.d(),we(i,a),_=!1,Y($)}}}function $e(t){let e,s,n,l="New group",o,f;return{c(){e=N("br"),s=P(),n=N("button"),n.textContent=l,this.h()},l(d){e=y(d,"BR",{}),s=F(d),n=y(d,"BUTTON",{class:!0,ondragover:!0,"data-svelte-h":!0}),Ie(n)!=="svelte-7t49dx"&&(n.textContent=l),this.h()},h(){g(n,"class","button is-fullwidth svelte-ojelhk"),g(n,"ondragover","return false"),z(n,"hovering",t[2]===t[6].length)},m(d,h){T(d,e,h),T(d,s,h),T(d,n,h),o||(f=[G(n,"drop",Ee(t[17])),G(n,"dragenter",t[18]),G(n,"dragleave",t[19])],o=!0)},p(d,h){h&68&&z(n,"hovering",d[2]===d[6].length)},d(d){d&&(v(e),v(s),v(n)),o=!1,Y(f)}}}function Ye(t){let e,s,n;return e=new ee({props:{icon:Ue,class:"icon"}}),{c(){Z(e.$$.fragment),s=M("   Edit clients name")},l(l){K(e.$$.fragment,l),s=R(l,"   Edit clients name")},m(l,o){Q(e,l,o),T(l,s,o),n=!0},i(l){n||(E(e.$$.fragment,l),n=!0)},o(l){O(e.$$.fragment,l),n=!1},d(l){l&&v(s),x(e,l)}}}function Ze(t){let e,s,n;return e=new ee({props:{icon:Be,class:"icon"}}),{c(){Z(e.$$.fragment),s=M("   Finish edition")},l(l){K(e.$$.fragment,l),s=R(l,"   Finish edition")},m(l,o){Q(e,l,o),T(l,s,o),n=!0},i(l){n||(E(e.$$.fragment,l),n=!0)},o(l){O(e.$$.fragment,l),n=!1},d(l){l&&v(s),x(e,l)}}}function Ke(t){let e,s,n=t[6].length>0&&ge(t);return{c(){n&&n.c(),e=de()},l(l){n&&n.l(l),e=de()},m(l,o){n&&n.m(l,o),T(l,e,o),s=!0},p(l,[o]){l[6].length>0?n?(n.p(l,o),o&64&&E(n,1)):(n=ge(l),n.c(),E(n,1),n.m(e.parentNode,e)):n&&(q(),O(n,1,1,()=>{n=null}),W())},i(l){s||(E(n),s=!0)},o(l){O(n),s=!1},d(l){l&&v(e),n&&n.d(l)}}}function Qe(t,e,s){let n;De(t,L,m=>s(6,n=m));let l=!1,o={},f,d;function h(m,b){m.dataTransfer.dropEffect="move";let B=m.dataTransfer.getData("text/plain"),te=JSON.parse(B),ye=te.item,ae=te.group;const Oe=n[ae].clients.splice(ye,1)[0];b?(Te(L,n[b].clients=[...n[b].clients,Oe],n),pe(n[b].id,n[b].clients.map(re=>re.id))):pe(n[ae].id,n[ae].clients.map(re=>re.id)),s(2,l=null),s(5,d=!1)}function k(m,b,B){s(5,d=!0),m.dataTransfer.effectAllowed="move",m.dataTransfer.dropEffect="move";let te={group:b,item:B,id:m.target.getAttribute("id")};m.dataTransfer.setData("text/plain",JSON.stringify(te))}function w(m,b){m[b].name=this.value,L.set(n)}const C=m=>qe(m.id,m.name),_=(m,b)=>h(b,m),$=m=>s(2,l=m.name),u=()=>s(2,l=null);function U(m,b,B){b[B].clients[m].name=this.value,L.set(n)}return[h,k,l,o,f,d,n,w,C,_,$,u,U,(m,b)=>We(m.clients[b].id,m.clients[b].name),(m,b,B)=>k(B,m,b),(m,b)=>s(3,o={group:m,client:b}),()=>s(3,o={}),m=>h(m,null),()=>s(2,l=n.length),()=>s(2,l=null),()=>s(4,f=!f)]}class rt extends Ve{constructor(e){super(),Je(this,e,Qe,Ke,Ge,{drop:0,dragstart:1})}get drop(){return this.$$.ctx[0]}get dragstart(){return this.$$.ctx[1]}}export{rt as S,at as a,lt as b,nt as c,st as m};
