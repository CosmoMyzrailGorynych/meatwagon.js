var meatwagon=function(){"use strict";const e=/^(?<tagName>[\w-]+)?(?<ids>(?:[\.#][\w-]+)*)(?:\((?<attrs>[^\n]*)\))?$/,t=/(\.[\w-]+)/g,a=/(#[\w-]+)/g,n=/^\s*/,s=/^(if|while|for)\s*\([\s\S]+\)\{?$/,r=["br","img","hr"],i=t=>{const a=t.split("\n"),i=[],c=[0],o=[];let l,p=i;const u=()=>{const e=o.pop();"tag"===e.type?p.push({type:"tagClose",tagName:e.tagName}):"code"===e.type&&s.test(e.value)&&p.push({type:"code",value:"}"}),c.pop()};for(let t=0;t<a.length;t++){const i=a[t],h=i.trim();if(""===h)continue;const m=c[c.length-1],d=(g=i,n.exec(g)[0].length);if(d<m){if(-1===c.indexOf(d))throw new Error(`Bad indentation at line ${t+1}, expected depth: ${c.join(", ")} spaces, got ${d}.\n${i}`);for(;c[c.length-1]!==d;)u(),p=p.parent}else if(d>m){if(["text","comment"].includes(l?.type))throw new Error(`Line ${t+1}: entry of type ${l?.type} cannot have children.\n${i}`);if("tag"===l?.type&&r.includes(l.tagName))throw new Error(`Line ${t+1}: tag ${l.tagName} cannot have children.\n${i}`);const e=[];e.parent=p,p.push(e),c.push(d),o.push(l),p=e}else"tag"===l?.type&&p.push({type:"tagClose",tagName:l.tagName});if("|"===h[0])l={type:"text",value:h.slice(1).trimStart()},p.push(l);else if(h.startsWith("//"))"-"===h[2]&&(l={type:"comment",value:h.slice(3)},p.push(l));else if("-"===h[0])l={type:"code",value:h.slice(1).trim()},s.test(l.value)&&(l.value+="{"),p.push(l);else{const a=e.exec(h);if(!a)throw new Error(`Line ${t+1}: malformed tag.\n${h}`);const{tagName:n,ids:s,attrs:r}=a.groups;l={type:"tag",tagName:n||"div",ids:s,attrs:r},p.push(l)}}for(var g;o.length;)u();return i},c=/'/g,o=e=>e.replace(c,"\\`");let l;const p=e=>{if(e instanceof Array)return e.map(p).join("");const n=l?"":"html += `";switch(l="code"!==e.type,e.type){case"comment":return`${n}\x3c!--${o(e.value)}--\x3e;`;case"code":return n?e.value:`\`;${e.value}`;case"text":return`${n}${o(e.value)}`;case"tag":let s=e.attrs?" "+e.attrs:"";if(e.ids){const n=a.exec(e.ids)?.[0],r=e.ids.match(t);if(n&&(s+=` id="${n.slice(1)}" `),r?.length){s+=' class="';for(const e of r)s+=e.slice(1)+" ";s=s.slice(0,-1)+'" '}s=s.slice(0,-1)}return`${n}<${e.tagName}${o(s)}>`;case"tagClose":return`${n}</${e.tagName}>`}},u=e=>new Function("state",e),g=e=>{let t="let html = '';";return t+=p(e),l&&(t+="`;"),t+="return html;",t};return{render:(e,t)=>u(g(i(e)))(t),renderer:e=>u(g(i(e)))}}();
