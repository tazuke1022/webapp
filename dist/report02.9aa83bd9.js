function e(e,t,s,r){Object.defineProperty(e,t,{get:s,set:r,enumerable:!0,configurable:!0})}var t=globalThis,s={},r={},a=t.parcelRequire49ed;null==a&&((a=function(e){if(e in s)return s[e].exports;if(e in r){var t=r[e];delete r[e];var a={id:e,exports:{}};return s[e]=a,t.call(a.exports,a,a.exports),a.exports}var n=Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}).register=function(e,t){r[e]=t},t.parcelRequire49ed=a);var n=a.register;n("dFw4U",function(t,s){e(t.exports,"createRoot",()=>r,e=>r=e);var r,n=a("eKYsq");r=n.createRoot,n.hydrateRoot}),n("brsYM",function(t,s){e(t.exports,"LoginContext",()=>l),e(t.exports,"Authenticate",()=>o);var r=a("c54Ow"),n=a("lbJE2");let l=(0,n.createContext)(),o=e=>{let t=e.usernameSaveKey?`${document.location.pathname}#Authenticate${e.usernameSaveKey}`:void 0,s=t?localStorage.getItem(t):null,[a,o]=(0,n.useState)(void 0!==e.username?e.username:s),i=(0,n.useRef)(""),[c,u]=(0,n.useState)(""),[d,x]=(0,n.useState)(null),h=async()=>{try{u("");let e=await fetch("/login",{method:"post",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:a,password:i.current.value})});if(!e.ok){if(403===e.status)throw Error("ログイン・エラー");throw Error(`${e.status} ${e.statusText}`)}let s=await e.json();x(s),void 0!==t&&localStorage.setItem(t,a)}catch(e){u(e.message),x(null),void 0!==t&&localStorage.removeItem(t)}};return(0,n.useEffect)(()=>{if(void 0!==e.username&&void 0!==e.password)i.current.value=e.password,h();else if(void 0!==t){let e=localStorage.getItem(t);null!==e&&(i.current.value=e,o(e))}},[]),d?(0,r.jsxs)("div",{children:[(0,r.jsxs)("div",{className:"authenticate-logout",children:[(0,r.jsxs)("span",{children:["User: ",d?d.username:""]}),void 0!==e.username&&void 0!==e.password?null:(0,r.jsx)("button",{type:"button",onClick:()=>{x(null),void 0!==t&&localStorage.removeItem(t)},children:"ログアウト"})]}),(0,r.jsx)(l.Provider,{value:d,children:e.children})]}):(0,r.jsxs)("div",{children:[(0,r.jsxs)("div",{className:"authenticate-login",children:[(0,r.jsxs)("label",{children:[(0,r.jsx)("span",{children:"ユーザ名:"}),(0,r.jsx)("span",{children:(0,r.jsx)("input",{type:"text",placeholder:"ユーザ名",onChange:e=>o(e.target.value),value:a})})]}),(0,r.jsxs)("label",{children:[(0,r.jsx)("span",{children:"パスワード:"}),(0,r.jsx)("span",{children:(0,r.jsx)("input",{type:"password",ref:i,placeholder:"パスワード",defaultValue:""})})]}),(0,r.jsx)("button",{type:"button",onClick:h,children:"ログイン"})]}),(0,r.jsx)("div",{children:""===c?null:(0,r.jsx)("div",{className:"error-message",onClick:()=>u(""),children:c})})]})}}),n("6Jdkr",function(t,s){e(t.exports,"TextChat",()=>c);var r=a("c54Ow"),n=a("lbJE2"),l=a("brsYM"),o=a("lHCVX"),i=a("lPoRS");let c=()=>{let e=(0,n.useContext)(l.LoginContext),t=e?e.username:"",s=(0,n.useContext)(o.SocketContext),a=s?s.current:null,[c,u]=(0,n.useState)(""),[d,x]=(0,n.useState)([]),h=(0,n.useRef)(null),[m,v]=(0,n.useState)("*"),[p,g]=(0,n.useState)([]),f=(0,n.useRef)(null),j=e=>{x(t=>[...t,e])},C=e=>{g(e),0>e.indexOf(m)&&v("*")},b=()=>{a&&(a.emit("text",{from:t,to:m,text:c,image:f.current.getImageDataURL(),time:new Date().toLocaleTimeString()}),u(""))};return(0,n.useEffect)(()=>{if(a)return console.log("[TextChat] adding listeners"),a.on("text",j),a.on("user-list",C),a.emit("user-list",{from:t}),()=>{console.log("[TextChat] removing listeners"),a.off("text",j),a.off("user-list",C)}},[a,t,m]),(0,n.useEffect)(()=>{h.current&&h.current.scrollIntoView({block:"nearest"})},[d]),(0,r.jsxs)("div",{className:"text-chat",children:[(0,r.jsx)("div",{className:"text-chat-message-list-container",children:(0,r.jsxs)("div",{className:"text-chat-message-list",children:[d.map(e=>(0,r.jsx)("div",{className:e.from===t?"text-chat-from-me":"text-chat-from-them",children:(0,r.jsxs)("div",{className:"text-chat-message",children:[(0,r.jsx)("div",{className:"text-chat-from",children:e.from}),(0,r.jsxs)("div",{className:"text-chat-message-body",children:[(0,r.jsx)("div",{children:e.text}),e.image?(0,r.jsx)("img",{src:e.image,alt:"paint",onClick:e=>f.current.putImageDataURL(e.target.src)}):null]}),(0,r.jsx)("div",{className:"text-chat-message-time",children:e.time})," "]})},e.from+e.time)),(0,r.jsx)("div",{ref:h})]})}),(0,r.jsxs)("div",{className:"text-chat-input",children:[(0,r.jsxs)("select",{onChange:e=>{v(e.target.value)},value:m,children:[(0,r.jsx)("option",{value:"*",children:"*"}),p.map(e=>(0,r.jsx)("option",{value:e,children:e},e))]}),(0,r.jsx)("input",{type:"text",onChange:e=>{u(e.target.value)},value:c,onKeyUp:e=>{"Enter"===e.key&&c.length>0&&b()}}),(0,r.jsx)("button",{type:"button",onClick:b,disabled:null===a||""===c,children:"送信"})]}),(0,r.jsx)(i.Paint,{ref:f})]})}});var l=a("c54Ow"),o=a("dFw4U"),i=a("aFIWk"),c=a("brsYM"),u=a("lHCVX"),d=a("6Jdkr");(0,o.createRoot)(document.getElementById("root")).render((0,l.jsxs)(i.ErrorBoundary,{children:[(0,l.jsx)(c.Authenticate,{children:(0,l.jsx)(u.WithSocket,{nsp:"/chat",children:(0,l.jsx)(d.TextChat,{})})}),(0,l.jsx)("hr",{})]}));
//# sourceMappingURL=report02.9aa83bd9.js.map
