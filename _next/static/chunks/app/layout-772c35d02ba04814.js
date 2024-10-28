(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[185],{62131:function(e,t,o){Promise.resolve().then(o.bind(o,78725))},78725:function(e,t,o){"use strict";o.r(t),o.d(t,{default:function(){return B}});var r=o(57437),n=o(2265);let l=n.createContext(null);function c(){return n.useContext(l)}var i="function"==typeof Symbol&&Symbol.for?Symbol.for("mui.nested"):"__THEME_NESTED__",s=function(e){let{children:t,theme:o}=e,s=c(),a=n.useMemo(()=>{let e=null===s?{...o}:"function"==typeof o?o(s):{...s,...o};return null!=e&&(e[i]=null!==s),e},[o,s]);return(0,r.jsx)(l.Provider,{value:a,children:t})},a=o(34692),d=o(80184),m=o(77126),h=o(17804);let u={};function f(e,t,o){let r=arguments.length>3&&void 0!==arguments[3]&&arguments[3];return n.useMemo(()=>{let n=e&&t[e]||t;if("function"==typeof o){let l=o(n),c=e?{...t,[e]:l}:l;return r?()=>c:c}return e?{...t,[e]:o}:{...t,...o}},[e,t,o,r])}var g=function(e){let{children:t,theme:o,themeId:n}=e,l=(0,d.Z)(u),i=c()||u,g=f(n,l,o),p=f(n,i,o,!0),S="rtl"===g.direction;return(0,r.jsx)(s,{theme:p,children:(0,r.jsx)(a.T.Provider,{value:g,children:(0,r.jsx)(m.Z,{value:S,children:(0,r.jsx)(h.Z,{value:null==g?void 0:g.components,children:t})})})})},p=o(22166);function S(e){let{theme:t,...o}=e,n=p.Z in t?t[p.Z]:void 0;return(0,r.jsx)(g,{...o,themeId:n?p.Z:void 0,theme:n||t})}var y=o(38720),v=o(18598);let k="mode",b="color-scheme";function C(e){if("undefined"!=typeof window&&"function"==typeof window.matchMedia&&"system"===e)return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function x(e,t){return"light"===e.mode||"system"===e.mode&&"light"===e.systemMode?t("light"):"dark"===e.mode||"system"===e.mode&&"dark"===e.systemMode?t("dark"):void 0}function j(e,t){let o;if("undefined"!=typeof window){try{(o=localStorage.getItem(e)||void 0)||localStorage.setItem(e,t)}catch(e){}return o||t}}var w=o(99163),M=o(84792);let{CssVarsProvider:E,useColorScheme:$,getInitColorSchemeScript:I}=function(e){let{themeId:t,theme:o={},modeStorageKey:l=k,colorSchemeStorageKey:i=b,disableTransitionOnChange:s=!1,defaultColorScheme:a,resolveTheme:d}=e,m={allColorSchemes:[],colorScheme:void 0,darkColorScheme:void 0,lightColorScheme:void 0,mode:void 0,setColorScheme:()=>{},setMode:()=>{},systemMode:void 0},h=n.createContext(void 0),u="string"==typeof a?a:a.light,f="string"==typeof a?a:a.dark;return{CssVarsProvider:function(e){let{children:m,theme:u,modeStorageKey:f=l,colorSchemeStorageKey:p=i,disableTransitionOnChange:S=s,storageWindow:y="undefined"==typeof window?void 0:window,documentNode:w="undefined"==typeof document?void 0:document,colorSchemeNode:M="undefined"==typeof document?void 0:document.documentElement,disableNestedContext:E=!1,disableStyleSheetGeneration:$=!1,defaultMode:I="system"}=e,Z=n.useRef(!1),_=c(),T=n.useContext(h),W=!!T&&!E,A=n.useMemo(()=>u||("function"==typeof o?o():o),[u]),L=A[t],{colorSchemes:O={},components:F={},cssVarPrefix:z,...P}=L||A,V=Object.keys(O).filter(e=>!!O[e]).join(","),K=n.useMemo(()=>V.split(","),[V]),N="string"==typeof a?a:a.light,B="string"==typeof a?a:a.dark,H=O[N]&&O[B]?I:O[P.defaultColorScheme]?.palette?.mode||P.palette?.mode,{mode:R,setMode:q,systemMode:Y,lightColorScheme:D,darkColorScheme:G,colorScheme:J,setColorScheme:Q}=function(e){let{defaultMode:t="light",defaultLightColorScheme:o,defaultDarkColorScheme:r,supportedColorSchemes:l=[],modeStorageKey:c=k,colorSchemeStorageKey:i=b,storageWindow:s="undefined"==typeof window?void 0:window}=e,a=l.join(","),d=l.length>1,[m,h]=n.useState(()=>{let e=j(c,t),n=j("".concat(i,"-light"),o),l=j("".concat(i,"-dark"),r);return{mode:e,systemMode:C(e),lightColorScheme:n,darkColorScheme:l}}),[,u]=n.useState(!1),f=n.useRef(!1);n.useEffect(()=>{d&&u(!0),f.current=!0},[d]);let g=x(m,e=>"light"===e?m.lightColorScheme:"dark"===e?m.darkColorScheme:void 0),p=n.useCallback(e=>{h(o=>{if(e===o.mode)return o;let r=null!=e?e:t;try{localStorage.setItem(c,r)}catch(e){}return{...o,mode:r,systemMode:C(r)}})},[c,t]),S=n.useCallback(e=>{e?"string"==typeof e?e&&!a.includes(e)?console.error("`".concat(e,"` does not exist in `theme.colorSchemes`.")):h(t=>{let o={...t};return x(t,t=>{try{localStorage.setItem("".concat(i,"-").concat(t),e)}catch(e){}"light"===t&&(o.lightColorScheme=e),"dark"===t&&(o.darkColorScheme=e)}),o}):h(t=>{let n={...t},l=null===e.light?o:e.light,c=null===e.dark?r:e.dark;if(l){if(a.includes(l)){n.lightColorScheme=l;try{localStorage.setItem("".concat(i,"-light"),l)}catch(e){}}else console.error("`".concat(l,"` does not exist in `theme.colorSchemes`."))}if(c){if(a.includes(c)){n.darkColorScheme=c;try{localStorage.setItem("".concat(i,"-dark"),c)}catch(e){}}else console.error("`".concat(c,"` does not exist in `theme.colorSchemes`."))}return n}):h(e=>{try{localStorage.setItem("".concat(i,"-light"),o),localStorage.setItem("".concat(i,"-dark"),r)}catch(e){}return{...e,lightColorScheme:o,darkColorScheme:r}})},[a,i,o,r]),y=n.useCallback(e=>{"system"===m.mode&&h(t=>{let o=(null==e?void 0:e.matches)?"dark":"light";return t.systemMode===o?t:{...t,systemMode:o}})},[m.mode]),v=n.useRef(y);return v.current=y,n.useEffect(()=>{if("function"!=typeof window.matchMedia||!d)return;let e=function(){for(var e=arguments.length,t=Array(e),o=0;o<e;o++)t[o]=arguments[o];return v.current(...t)},t=window.matchMedia("(prefers-color-scheme: dark)");return t.addListener(e),e(t),()=>{t.removeListener(e)}},[d]),n.useEffect(()=>{if(s&&d){let e=e=>{let o=e.newValue;"string"==typeof e.key&&e.key.startsWith(i)&&(!o||a.match(o))&&(e.key.endsWith("light")&&S({light:o}),e.key.endsWith("dark")&&S({dark:o})),e.key===c&&(!o||["light","dark","system"].includes(o))&&p(o||t)};return s.addEventListener("storage",e),()=>{s.removeEventListener("storage",e)}}},[S,p,c,i,a,t,s,d]),{...m,mode:f.current||!d?m.mode:void 0,systemMode:f.current||!d?m.systemMode:void 0,colorScheme:f.current||!d?g:void 0,setMode:p,setColorScheme:S}}({supportedColorSchemes:K,defaultLightColorScheme:N,defaultDarkColorScheme:B,modeStorageKey:f,colorSchemeStorageKey:p,defaultMode:H,storageWindow:y}),U=R,X=J;W&&(U=T.mode,X=T.colorScheme);let ee=X||P.defaultColorScheme,et=P.generateThemeVars?.()||P.vars,eo={...P,components:F,colorSchemes:O,cssVarPrefix:z,vars:et};if("function"==typeof eo.generateSpacing&&(eo.spacing=eo.generateSpacing()),ee){let e=O[ee];e&&"object"==typeof e&&Object.keys(e).forEach(t=>{e[t]&&"object"==typeof e[t]?eo[t]={...eo[t],...e[t]}:eo[t]=e[t]})}let er=P.colorSchemeSelector;n.useEffect(()=>{if(X&&M&&er&&"media"!==er){let e=er;if("class"===er&&(e=".%s"),"data"===er&&(e="[data-%s]"),er?.startsWith("data-")&&!er.includes("%s")&&(e=`[${er}="%s"]`),e.startsWith("."))M.classList.remove(...K.map(t=>e.substring(1).replace("%s",t))),M.classList.add(e.substring(1).replace("%s",X));else{let t=e.replace("%s",X).match(/\[([^\]]+)\]/);if(t){let[e,o]=t[1].split("=");o||K.forEach(t=>{M.removeAttribute(e.replace(X,t))}),M.setAttribute(e,o?o.replace(/"|'/g,""):"")}else M.setAttribute(e,X)}}},[X,er,M,K]),n.useEffect(()=>{let e;if(S&&Z.current&&w){let t=w.createElement("style");t.appendChild(w.createTextNode("*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),w.head.appendChild(t),window.getComputedStyle(w.body),e=setTimeout(()=>{w.head.removeChild(t)},1)}return()=>{clearTimeout(e)}},[X,S,w]),n.useEffect(()=>(Z.current=!0,()=>{Z.current=!1}),[]);let en=n.useMemo(()=>({allColorSchemes:K,colorScheme:X,darkColorScheme:G,lightColorScheme:D,mode:U,setColorScheme:Q,setMode:q,systemMode:Y}),[K,X,G,D,U,Q,q,Y]),el=!0;($||!1===P.cssVariables||W&&_?.cssVarPrefix===z)&&(el=!1);let ec=(0,r.jsxs)(n.Fragment,{children:[(0,r.jsx)(g,{themeId:L?t:void 0,theme:d?d(eo):eo,children:m}),el&&(0,r.jsx)(v.Z,{styles:eo.generateStyleSheets?.()||[]})]});return W?ec:(0,r.jsx)(h.Provider,{value:en,children:ec})},useColorScheme:()=>n.useContext(h)||m,getInitColorSchemeScript:e=>(function(e){let{defaultMode:t="system",defaultLightColorScheme:o="light",defaultDarkColorScheme:n="dark",modeStorageKey:l=k,colorSchemeStorageKey:c=b,attribute:i="data-color-scheme",colorSchemeNode:s="document.documentElement",nonce:a}=e||{},d="",m=i;if("class"===i&&(m=".%s"),"data"===i&&(m="[data-%s]"),m.startsWith(".")){let e=m.substring(1);d+=`${s}.classList.remove('${e}'.replace('%s', light), '${e}'.replace('%s', dark));
      ${s}.classList.add('${e}'.replace('%s', colorScheme));`}let h=m.match(/\[([^\]]+)\]/);if(h){let[e,t]=h[1].split("=");t||(d+=`${s}.removeAttribute('${e}'.replace('%s', light));
      ${s}.removeAttribute('${e}'.replace('%s', dark));`),d+=`
      ${s}.setAttribute('${e}'.replace('%s', colorScheme), ${t?`${t}.replace('%s', colorScheme)`:'""'});`}else d+=`${s}.setAttribute('${m}', colorScheme);`;return(0,r.jsx)("script",{suppressHydrationWarning:!0,nonce:"undefined"==typeof window?a:"",dangerouslySetInnerHTML:{__html:`(function() {
try {
  let colorScheme = '';
  const mode = localStorage.getItem('${l}') || '${t}';
  const dark = localStorage.getItem('${c}-dark') || '${n}';
  const light = localStorage.getItem('${c}-light') || '${o}';
  if (mode === 'system') {
    // handle system mode
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    if (mql.matches) {
      colorScheme = dark
    } else {
      colorScheme = light
    }
  }
  if (mode === 'light') {
    colorScheme = light;
  }
  if (mode === 'dark') {
    colorScheme = dark;
  }
  if (colorScheme) {
    ${d}
  }
} catch(e){}})();`}},"mui-color-scheme-init")})({colorSchemeStorageKey:i,defaultLightColorScheme:u,defaultDarkColorScheme:f,modeStorageKey:l,...e})}}({themeId:p.Z,theme:()=>(0,w.Z)({cssVariables:!0}),colorSchemeStorageKey:"mui-color-scheme",modeStorageKey:"mui-mode",defaultColorScheme:{light:"light",dark:"dark"},resolveTheme:e=>{let t={...e,typography:(0,M.Z)(e.palette,e.typography)};return t.unstable_sx=function(e){return(0,y.Z)({sx:e,theme:this})},t}});function Z(e){let{theme:t,...o}=e;return"function"!=typeof t&&"colorSchemes"in(p.Z in t?t[p.Z]:t)?(0,r.jsx)(E,{theme:t,...o}):(0,r.jsx)(S,{theme:t,...o})}var _=o(1848),T=o(37053);let W="function"==typeof(0,_.zY)({}),A=(e,t)=>({WebkitFontSmoothing:"antialiased",MozOsxFontSmoothing:"grayscale",boxSizing:"border-box",WebkitTextSizeAdjust:"100%",...t&&!e.vars&&{colorScheme:e.palette.mode}}),L=e=>({color:(e.vars||e).palette.text.primary,...e.typography.body1,backgroundColor:(e.vars||e).palette.background.default,"@media print":{backgroundColor:(e.vars||e).palette.common.white}}),O=function(e){var t,o;let r=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n={};r&&e.colorSchemes&&"function"==typeof e.getColorSchemeSelector&&Object.entries(e.colorSchemes).forEach(t=>{var o,r;let[l,c]=t,i=e.getColorSchemeSelector(l);i.startsWith("@")?n[i]={":root":{colorScheme:null===(o=c.palette)||void 0===o?void 0:o.mode}}:n[i.replace(/\s*&/,"")]={colorScheme:null===(r=c.palette)||void 0===r?void 0:r.mode}});let l={html:A(e,r),"*, *::before, *::after":{boxSizing:"inherit"},"strong, b":{fontWeight:e.typography.fontWeightBold},body:{margin:0,...L(e),"&::backdrop":{backgroundColor:(e.vars||e).palette.background.default}},...n},c=null===(o=e.components)||void 0===o?void 0:null===(t=o.MuiCssBaseline)||void 0===t?void 0:t.styleOverrides;return c&&(l=[l,c]),l},F="mui-ecs",z=e=>{let t=O(e,!1),o=Array.isArray(t)?t[0]:t;return!e.vars&&o&&(o.html[":root:has(".concat(F,")")]={colorScheme:e.palette.mode}),e.colorSchemes&&Object.entries(e.colorSchemes).forEach(t=>{var r,n;let[l,c]=t,i=e.getColorSchemeSelector(l);i.startsWith("@")?o[i]={[":root:not(:has(.".concat(F,"))")]:{colorScheme:null===(r=c.palette)||void 0===r?void 0:r.mode}}:o[i.replace(/\s*&/,"")]={["&:not(:has(.".concat(F,"))")]:{colorScheme:null===(n=c.palette)||void 0===n?void 0:n.mode}}}),t},P=(0,_.zY)(W?e=>{let{theme:t,enableColorScheme:o}=e;return O(t,o)}:e=>{let{theme:t}=e;return z(t)});var V=function(e){let{children:t,enableColorScheme:o=!1}=(0,T.i)({props:e,name:"MuiCssBaseline"});return(0,r.jsxs)(n.Fragment,{children:[W&&(0,r.jsx)(P,{enableColorScheme:o}),!W&&!o&&(0,r.jsx)("span",{className:F,style:{display:"none"}}),t]})};let K=(0,w.Z)({palette:{mode:"light",primary:{main:"#FF69B4"},secondary:{main:"#FFB6C1"}}});function N(e){let{children:t}=e;return(0,r.jsxs)(Z,{theme:K,children:[(0,r.jsx)(V,{}),t]})}function B(e){let{children:t}=e;return(0,r.jsxs)("html",{lang:"en",children:[(0,r.jsxs)("head",{children:[(0,r.jsx)("title",{children:"Expense Tracker"}),(0,r.jsx)("meta",{name:"description",content:"Track your expenses with this beautiful app"})]}),(0,r.jsx)("body",{children:(0,r.jsx)(N,{children:t})})]})}o(2778)},2778:function(){}},function(e){e.O(0,[461,140,971,117,744],function(){return e(e.s=62131)}),_N_E=e.O()}]);