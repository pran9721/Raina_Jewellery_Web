const $ = id => document.getElementById(id);
const loginTab=$("loginTab"), signupTab=$("signupTab");
const loginForm=$("loginForm"), signupForm=$("signupForm");
const passwordInput=$("signupPassword");
function showMessage(el,msg,success=false){el.textContent=msg;el.className=success?"message success":"message error";}
function clearMessage(el){el.textContent="";el.className="message";}
function switchForm(type){
  const isLogin=type==="login";
  loginTab.classList.toggle("active",isLogin); signupTab.classList.toggle("active",!isLogin);
  loginForm.classList.toggle("active",isLogin); signupForm.classList.toggle("active",!isLogin);
  $("heading").textContent=isLogin?"Welcome Back":"Create Account";
  $("subtitle").textContent=isLogin?"Sign in to explore your favourite collections.":"Join us and discover timeless elegance.";
  clearMessage($("loginMessage")); clearMessage($("signupMessage"));
}
loginTab.addEventListener("click",()=>switchForm("login"));
signupTab.addEventListener("click",()=>switchForm("signup"));
document.querySelectorAll(".toggle-password").forEach(btn=>btn.addEventListener("click",()=>{
  const input=$(btn.dataset.target),visible=input.type==="text";
  input.type=visible?"password":"text";btn.textContent=visible?"SHOW":"HIDE";
}));
passwordInput.addEventListener("input",()=>{
  const p=passwordInput.value;let n=0;
  if(p.length>=8)n++;if(/[A-Z]/.test(p))n++;if(/[0-9]/.test(p))n++;if(/[^A-Za-z0-9]/.test(p))n++;
  $("strength").textContent="Password strength: "+["Weak","Fair","Good","Strong","Very Strong"][n];
});
async function post(action,data){
  if(!window.RainaAPI) throw new Error("API client did not load. Refresh the page.");
  return window.RainaAPI.request(action,{method:"POST",body:data});
}
function routeUser(user){
  location.replace(user.role==="admin"?"admin.html":"dashboard.html");
}
loginForm.addEventListener("submit",async e=>{
  e.preventDefault();const msg=$("loginMessage"),btn=loginForm.querySelector('[type="submit"]');
  clearMessage(msg);btn.disabled=true;btn.textContent="SIGNING IN…";
  try{
    const d=await post("login",{email:$("loginEmail").value.trim(),password:$("loginPassword").value});
    showMessage(msg,d.message||"Welcome back!",true);routeUser(d.user);
  }catch(err){showMessage(msg,err.message||"Could not sign in.");}
  finally{btn.disabled=false;btn.textContent="SIGN IN";}
});
signupForm.addEventListener("submit",async e=>{
  e.preventDefault();const msg=$("signupMessage"),btn=signupForm.querySelector('[type="submit"]');
  clearMessage(msg);
  const password=$("signupPassword").value;
  if(password!==$("confirmPassword").value)return showMessage(msg,"Passwords do not match.");
  if(!$("terms").checked)return showMessage(msg,"Please accept the terms and conditions.");
  btn.disabled=true;btn.textContent="CREATING ACCOUNT…";
  try{
    const d=await post("register",{name:$("fullName").value.trim(),email:$("signupEmail").value.trim(),password});
    showMessage(msg,"Account created successfully. Redirecting…",true);routeUser(d.user);
  }catch(err){showMessage(msg,err.message||"Could not create account.");}
  finally{btn.disabled=false;btn.textContent="CREATE ACCOUNT";}
});
$("forgotLink")?.addEventListener("click",e=>{
  e.preventDefault();alert("For password reset, please contact the store administrator. Email reset can be enabled after SMTP is configured on your PHP hosting.");
});
// Social sign-in is not enabled in this MySQL-only edition.
["googleLoginBtn","googleSignupBtn"].forEach(id=>{const b=$(id);if(b)b.hidden=true;});
window.addEventListener("DOMContentLoaded",async()=>{
  try{const d=await window.RainaAPI.request("auth");if(d.user)routeUser(d.user);}catch(e){console.warn(e);}
});
