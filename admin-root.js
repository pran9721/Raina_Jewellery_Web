const $=id=>document.getElementById(id);
let products=[],banners=[],orders=[],customers=[],activity=[];
const money=v=>"₹"+Number(v||0).toLocaleString("en-IN");
const safe=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date=v=>{const d=v?new Date(v):null;return d&&!isNaN(d)?d.toLocaleDateString("en-IN"):"—";};
const parseImages=v=>{if(Array.isArray(v))return v;try{return JSON.parse(v||"[]")}catch(_){return []}};
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2800);}
function empty(cols,msg){return `<tr><td colspan="${cols}" class="empty">${safe(msg)}</td></tr>`;}
function showError(e){console.error(e);toast(e.message||"Could not load MySQL data.");}
function showView(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+name));
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  $("pageTitle").textContent=({overview:"Overview",products:"Products",banners:"Banners",orders:"Orders & Payments",customers:"Customers",activity:"Login activity"})[name]||"Overview";
  $("sidebar").classList.remove("open");
}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.goto)));
$("menuBtn")?.addEventListener("click",()=>$("sidebar").classList.toggle("open"));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.close).close()));
async function api(action,opts={}){return RainaAPI.request(action,opts);}
$("logoutBtn").addEventListener("click",async()=>{try{await api("logout",{method:"POST",body:{}});}finally{location.replace("login.html");}});
$("refreshBtn").addEventListener("click",()=>loadAll().catch(showError));
function renderProducts(){
  $("productsRows").innerHTML=products.length?products.map(p=>{const imgs=parseImages(p.image_urls);return `<tr><td><div class="product-cell">${imgs[0]?`<img src="${safe(imgs[0])}" alt="">`:""}<div><b>${safe(p.name)}</b><small>${imgs.length} image(s)</small></div></div></td><td>${safe(p.category||p.category_name)}</td><td>${money(p.price)}</td><td>${Number(p.stock||0)}</td><td><button class="text-btn" data-edit-product="${p.id}">Edit</button> <button class="text-btn danger" data-delete-product="${p.id}">Delete</button></td></tr>`}).join(""):empty(5,"No products yet.");
  $("productsRows").querySelectorAll("[data-edit-product]").forEach(b=>b.onclick=()=>editProduct(Number(b.dataset.editProduct)));
  $("productsRows").querySelectorAll("[data-delete-product]").forEach(b=>b.onclick=()=>removeRecord("products",b.dataset.deleteProduct));
}
function renderBanners(){
  $("bannerGrid").innerHTML=banners.length?banners.map(b=>`<article class="banner-card"><img src="${safe(b.image_url)}" alt=""><div><b>${safe(b.title)}</b><p>${Number(b.is_active)?"Active":"Inactive"}</p><button class="text-btn" data-edit-banner="${b.id}">Edit</button> <button class="text-btn danger" data-delete-banner="${b.id}">Delete</button></div></article>`).join(""):'<p class="empty">No banners yet.</p>';
  $("bannerGrid").querySelectorAll("[data-edit-banner]").forEach(b=>b.onclick=()=>editBanner(Number(b.dataset.editBanner)));
  $("bannerGrid").querySelectorAll("[data-delete-banner]").forEach(b=>b.onclick=()=>removeRecord("banners",b.dataset.deleteBanner));
}
function renderOrders(){
  $("ordersRows").innerHTML=orders.map(o=>`<tr>
    <td><b>${safe(o.order_number)}</b><small>#${o.id}</small></td>
    <td>${safe(o.customer_name)}<small>${safe(o.email)}</small><small>${safe(o.phone)}</small></td>
    <td>${(o.items||[]).map(i=>`${safe(i.product_name)} × ${i.quantity}`).join("<br>")}</td>
    <td>${money(o.total)}</td><td>${safe(o.payment_method)}</td><td>${safe(o.payment_status)}</td>
    <td><select data-order-confirm="${o.id}"><option value="Pending" ${o.confirmation_status==="Pending"?"selected":""}>Pending</option><option value="Confirmed" ${o.confirmation_status==="Confirmed"?"selected":""}>Confirm</option><option value="Rejected" ${o.confirmation_status==="Rejected"?"selected":""}>Reject</option></select></td>
    <td><div class="order-admin-controls"><select data-order-status="${o.id}">${["Pending","Processing","Shipped","Cancelled"].map(x=>`<option ${o.order_status===x?"selected":""}>${x}</option>`).join("")}</select><input class="track-input" data-track="${o.id}" value="${safe(o.tracking_number||"")}" placeholder="Tracking number"><input class="track-input" data-expected="${o.id}" type="date" value="${safe(o.expected_delivery||"")}"><button class="text-btn" data-save-track="${o.id}">Save tracking</button></div></td>
    <td>${o.order_status==="Shipped"?`<div class="order-admin-controls"><input class="otp-input" data-otp="${o.id}" inputmode="numeric" maxlength="6" placeholder="Customer OTP"><button class="primary-btn verify-otp-btn" data-verify-otp="${o.id}">Verify & deliver</button><small>Customer can see OTP in My Orders.</small></div>`:o.order_status==="Delivered"?"<b class='delivered-label'>OTP verified ✓</b>":"<small>Set status to Shipped to create OTP.</small>"}</td>
  </tr>`).join("")||empty(9,"No orders found.");
  $("ordersRows").querySelectorAll("[data-order-confirm]").forEach(sel=>sel.onchange=async()=>{
    const order=orders.find(o=>o.id===Number(sel.dataset.orderConfirm));let status=order?.order_status||"Pending";
    if(sel.value==="Confirmed"&&status==="Pending")status="Processing";
    if(sel.value==="Rejected")status="Cancelled";
    try{await api("order-status",{method:"PATCH",body:{id:Number(sel.dataset.orderConfirm),confirmation_status:sel.value,order_status:status}});toast("Order confirmation updated");await loadAll();}
    catch(e){showError(e);}
  });
  $("ordersRows").querySelectorAll("[data-order-status]").forEach(sel=>sel.onchange=async()=>{
    const id=Number(sel.dataset.orderStatus),order=orders.find(o=>o.id===id);
    if(sel.value==="Shipped"&&!confirm("Mark this order as Shipped? A 6-digit delivery OTP will be generated for the customer.")){sel.value=order?.order_status||"Pending";return;}
    try{const r=await api("order-status",{method:"PATCH",body:{id,confirmation_status:order?.confirmation_status||"Pending",order_status:sel.value,tracking_number:document.querySelector(`[data-track="${id}"]`).value,expected_delivery:document.querySelector(`[data-expected="${id}"]`).value}});toast(r.otp_created?"Shipped. Delivery OTP created for customer.":"Order status updated");await loadAll();}
    catch(e){showError(e);await loadAll();}
  });
  $("ordersRows").querySelectorAll("[data-save-track]").forEach(btn=>btn.onclick=async()=>{
    const id=Number(btn.dataset.saveTrack),order=orders.find(o=>o.id===id);
    try{await api("order-status",{method:"PATCH",body:{id,confirmation_status:order?.confirmation_status||"Pending",order_status:order?.order_status||"Pending",tracking_number:document.querySelector(`[data-track="${id}"]`).value,expected_delivery:document.querySelector(`[data-expected="${id}"]`).value}});toast("Tracking details saved");await loadAll();}
    catch(e){showError(e);}
  });
  $("ordersRows").querySelectorAll("[data-verify-otp]").forEach(btn=>btn.onclick=async()=>{
    const id=Number(btn.dataset.verifyOtp),otp=document.querySelector(`[data-otp="${id}"]`).value.trim();
    if(!/^\d{6}$/.test(otp)){toast("Enter a valid 6-digit OTP");return;}
    if(!confirm("Verify customer OTP and mark this order Delivered?"))return;
    try{const r=await api("delivery-verify",{method:"PATCH",body:{id,otp}});toast(r.message);await loadAll();}
    catch(e){showError(e);}
  });
}
function renderCustomers(){
  $("customersRows").innerHTML=customers.map(c=>`<tr><td>${safe(c.name)}</td><td>${safe(c.email)}</td><td>${safe(c.phone||"—")}</td><td>${safe(date(c.created_at))}</td></tr>`).join("")||empty(4,"No customer accounts found.");
}
function renderActivity(){
  $("activityRows").innerHTML=activity.map(a=>`<tr><td>${safe(a.name||"Customer")}</td><td>${safe(a.email||"—")}</td><td>${safe(a.method||"Email")}</td><td title="${safe(a.user_agent||"")}">${safe((a.user_agent||"—").slice(0,55))}</td><td>${safe(date(a.created_at))}</td></tr>`).join("")||empty(5,"No login activity recorded yet.");
}
function renderOverview(){
  const paid=orders.filter(o=>String(o.payment_status).toLowerCase()==="paid");
  const revenue=paid.reduce((s,o)=>s+Number(o.total||0),0);
  $("totalRevenue").textContent=money(revenue);
  $("totalOrders").textContent=orders.length;
  $("totalCustomers").textContent=customers.length;
  $("pendingPayments").textContent=orders.filter(o=>!["paid","cancelled","refunded"].includes(String(o.payment_status||"").toLowerCase())).length;
  $("recentOrders").innerHTML=orders.slice(0,6).map(o=>`<tr><td>${safe(o.order_number)}</td><td>${safe(o.customer_name)}</td><td>${safe(date(o.created_at))}</td><td>${money(o.total)}</td><td>${safe(o.payment_status)}</td><td>${safe(o.order_status)}</td></tr>`).join("")||empty(6,"No orders yet.");

  const chart=$("salesChart");
  if(chart){
    const recent=[...orders].slice(0,7).reverse();
    const max=Math.max(1,...recent.map(o=>Number(o.total||0)));
    chart.innerHTML=recent.length?recent.map(o=>{
      const val=Number(o.total||0),height=Math.max(4,Math.round(val/max*145));
      return `<div class="sales-col" title="${safe(o.order_number)} · ${money(val)}"><span class="sales-value">${money(val)}</span><div class="sales-bar" style="height:${height}px"></div><span class="sales-label">${safe(String(o.order_number||"").slice(-5))}</span></div>`;
    }).join(""):'<p class="empty">No sales data available yet.</p>';
  }
  const counts={Pending:0,Processing:0,Shipped:0,Delivered:0,Cancelled:0};
  orders.forEach(o=>{const key=counts.hasOwnProperty(o.order_status)?o.order_status:"Pending";counts[key]++;});
  const colors={Pending:"#c7a65a",Processing:"#8d6b91",Shipped:"#9c8ca4",Delivered:"#43213f",Cancelled:"#d7cbd8"};
  const total=orders.length;
  const donut=$("statusDonut"),legend=$("statusLegend"),totalEl=$("donutTotal");
  if(donut&&legend&&totalEl){
    let cursor=0;const segments=[];
    Object.entries(counts).forEach(([name,count])=>{const pct=total?count/total*100:0;segments.push(`${colors[name]} ${cursor}% ${cursor+pct}%`);cursor+=pct;});
    donut.style.background=total?`conic-gradient(${segments.join(",")})`:"#eee8ee";
    totalEl.textContent=total;
    legend.innerHTML=Object.entries(counts).map(([name,count])=>`<div class="legend-item"><i class="legend-dot" style="background:${colors[name]}"></i>${name}<strong>${count}</strong></div>`).join("");
  }
}
async function loadAll(){
  const [d,o]=await Promise.all([api("admin-data"),api("orders")]);
  products=(d.products||[]).map(p=>({...p,image_urls:parseImages(p.image_urls)}));
  banners=d.banners||[];orders=o.orders||[];customers=d.users||[];activity=d.events||[];
  renderProducts();renderBanners();renderOrders();renderCustomers();renderActivity();renderOverview();
}
function editProduct(id){
  const p=products.find(x=>Number(x.id)===id);if(!p)return;
  $("productDialogTitle").textContent="Edit product";$("productId").value=id;
  $("productName").value=p.name||"";$("productPrice").value=p.price||"";
  $("productMrp").value=p.mrp||p.price||"";$("productCategory").value=p.category||"";
  $("productStock").value=p.stock||0;
  $("productDescription").value=p.description||"";$("productDialog").showModal();
}
function editBanner(id){
  const b=banners.find(x=>Number(x.id)===id);if(!b)return;
  $("bannerDialogTitle").textContent="Edit banner";$("bannerId").value=id;
  $("bannerTitle").value=b.title||"";$("bannerImages").value="";
  $("bannerImagePreview").innerHTML=`<img src="${safe(b.image_url)}" alt="Current image">`;
  $("bannerLink").value=b.link_url||"shop.html";$("bannerActive").checked=Number(b.is_active)===1;
  $("bannerDialog").showModal();
}
$("addProductBtn").addEventListener("click",()=>{$("productForm").reset();$("productId").value="";$("productDialogTitle").textContent="Add product";$("productDialog").showModal();});
$("productJsonFile")?.addEventListener("change",async e=>{
  const file=e.target.files?.[0]; if(!file)return;
  try{
    if(file.size>2*1024*1024)throw new Error("JSON file must be smaller than 2 MB.");
    const parsed=JSON.parse(await file.text());
    const products=Array.isArray(parsed)?parsed:parsed.products;
    if(!Array.isArray(products)||!products.length)throw new Error('JSON must be an array of products or an object with a "products" array.');
    if(!confirm(`Import ${products.length} product(s) into MySQL?`))return;
    const result=await api("product-import",{method:"POST",body:{products}});
    let message=`Imported ${result.created} product(s).`;
    if(result.skipped)message+=` Skipped ${result.skipped} invalid row(s). Check console for details.`;
    if(result.row_errors?.length)console.warn("Product JSON import row errors:",result.row_errors);
    toast(message); await loadAll();
  }catch(err){showError(err);}finally{e.target.value="";}
});
$("addBannerBtn").addEventListener("click",()=>{$("bannerForm").reset();$("bannerId").value="";$("bannerImagePreview").innerHTML="";$("bannerActive").checked=true;$("bannerDialogTitle").textContent="Add banner";$("bannerDialog").showModal();});
async function uploadSelected(inputId){const files=[...($(inputId).files||[])];if(files.length>20)throw new Error("Maximum 20 images allowed.");const urls=[];for(const f of files){if(!f.type.startsWith("image/")||f.size>8*1024*1024)throw new Error("Choose image files up to 8 MB each.");urls.push(await RainaAPI.upload(f));}return urls;}
$("productForm").addEventListener("submit",async e=>{
  e.preventDefault();const id=Number($("productId").value)||0;
  try{
    await api("products",{method:id?"PUT":"POST",body:{id,name:$("productName").value.trim(),price:Number($("productPrice").value),mrp:Number($("productMrp").value),category:$("productCategory").value.trim(),stock:Number($("productStock").value),description:$("productDescription").value.trim(),image_urls:[]}});
    $("productDialog").close();toast("Product saved to MySQL");await loadAll();
  }catch(err){showError(err);}
});
$("bannerForm").addEventListener("submit",async e=>{
  e.preventDefault();const id=Number($("bannerId").value)||0;
  try{
    const old=banners.find(b=>Number(b.id)===id);const uploaded=await uploadSelected("bannerImages");const image=uploaded[0]||old?.image_url;
    if(!image)throw new Error("Please upload a banner image.");
    await api("banners",{method:id?"PUT":"POST",body:{id,title:$("bannerTitle").value.trim(),image_url:image,link_url:$("bannerLink").value.trim()||"shop.html",is_active:$("bannerActive").checked}});
    $("bannerDialog").close();toast("Banner saved to MySQL");await loadAll();
  }catch(err){showError(err);}
});
async function removeRecord(collection,id){
  if(!confirm("Delete this item permanently?"))return;
  try{await api(collection,{method:"DELETE",query:"id="+encodeURIComponent(id)});toast("Deleted");await loadAll();}
  catch(e){showError(e);}
}
document.querySelectorAll('input[type="file"]').forEach(input=>input.addEventListener("change",()=>{
  const preview=$("bannerImagePreview");
  const files=[...input.files];if(files.length>20){toast("Maximum 20 images allowed.");input.value="";return;}
  preview.innerHTML=files.map(f=>`<img src="${URL.createObjectURL(f)}" alt="Selected image">`).join("")+`<span class="count">${files.length} selected</span>`;
}));
(async()=>{
  try{
    const session=await api("auth");
    if(!session.user){location.replace("login.html");return;}
    if(session.user.role!=="admin"){location.replace("dashboard.html");return;}
    $("adminName").textContent=session.user.name||"Admin";$("adminEmail").textContent=session.user.email||"";
    $("adminAvatar").textContent=(session.user.name||session.user.email||"A").charAt(0).toUpperCase();
    await loadAll();
  }catch(e){showError(e);if(/sign in|session/i.test(e.message))location.replace("login.html");}
})();
