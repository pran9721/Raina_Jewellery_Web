/* RAINA JEWELS shared product, cart and wishlist data */
(function(){
let PRODUCTS={
"silver-flower-studs":{id:"silver-flower-studs",name:"Silver Flowery Snowflake Studs",price:1999,oldPrice:3799,image:"https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85",category:"Earrings"},
"silver-zircon-earrings":{id:"silver-zircon-earrings",name:"Silver Zircon Earrings",price:2099,oldPrice:4699,image:"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",category:"Earrings"},
"rose-gold-deer-necklace":{id:"rose-gold-deer-necklace",name:"Rose Gold Deer Heart Necklace",price:1999,oldPrice:6199,image:"https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85",category:"Necklaces"},
"silver-solitaire-ring":{id:"silver-solitaire-ring",name:"Silver Classic Solitaire Ring",price:3999,oldPrice:8399,image:"https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",category:"Rings"},
"minimal-gold-hoops":{id:"minimal-gold-hoops",name:"Minimal Gold Hoop Earrings",price:499,oldPrice:999,image:"https://images.unsplash.com/photo-1635767798638-3665a7b5a4b2?auto=format&fit=crop&w=900&q=85",category:"Earrings"},
"pearl-charm-bracelet":{id:"pearl-charm-bracelet",name:"Pearl Charm Bracelet",price:699,oldPrice:1299,image:"https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85",category:"Bracelets"},
"tiny-heart-pendant":{id:"tiny-heart-pendant",name:"Tiny Heart Pendant",price:599,oldPrice:1199,image:"https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85",category:"Pendants"},
"silver-chain-anklet":{id:"silver-chain-anklet",name:"Silver Everyday Anklet",price:399,oldPrice:899,image:"https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",category:"Anklets"},
"crystal-stud-pair":{id:"crystal-stud-pair",name:"Crystal Mini Studs",price:299,oldPrice:699,image:"https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=85",category:"Earrings"},
"gold-plated-chain":{id:"gold-plated-chain",name:"Gold Plated Daily Chain",price:799,oldPrice:1599,image:"https://images.unsplash.com/photo-1599459183200-59c7687a0278?auto=format&fit=crop&w=900&q=85",category:"Chains"},
"rose-quartz-ring":{id:"rose-quartz-ring",name:"Rose Quartz Adjustable Ring",price:549,oldPrice:1099,image:"https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=900&q=85",category:"Rings"},
"everyday-pendant":{id:"everyday-pendant",name:"Everyday Sparkle Pendant",price:449,oldPrice:999,image:"https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=85",category:"Pendants"},
"silver-leaf-bracelet":{id:"silver-leaf-bracelet",name:"Silver Leaf Bracelet",price:649,oldPrice:1399,image:"https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85",category:"Bracelets"},
"pearl-drop-earrings":{id:"pearl-drop-earrings",name:"Pearl Drop Earrings",price:899,oldPrice:1799,image:"https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=85",category:"Earrings"},
"dainty-star-necklace":{id:"dainty-star-necklace",name:"Dainty Star Necklace",price:749,oldPrice:1499,image:"https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85",category:"Necklaces"},
"stacking-band-ring":{id:"stacking-band-ring",name:"Minimal Stacking Band Ring",price:349,oldPrice:799,image:"https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85",category:"Rings"},
};
async function loadMySQLProducts(){
  try{
    const response=await fetch("api/index.php?action=products",{credentials:"same-origin",cache:"no-store"});
    if(!response.ok)return;
    const data=await response.json();
    if(!Array.isArray(data.products)||!data.products.length)return;
    const fromDB={};
    data.products.forEach(p=>{
      let images=[];try{images=Array.isArray(p.image_urls)?p.image_urls:JSON.parse(p.image_urls||"[]")}catch(_){}
      const id=p.slug||String(p.id);
      fromDB[id]={id,slug:id,name:p.name,price:Number(p.price),oldPrice:Number(p.mrp||p.price),image:images[0]||"",imageUrls:images,category:p.category_name||p.category||"Jewellery",description:p.description||""};
    });
    // Keep legacy dashboard/demo products available while adding the live MySQL catalogue.
    // Previously PRODUCTS=fromDB removed hard-coded card IDs, so their Add to Cart
    // buttons silently did nothing when the product was not present in MySQL.
    PRODUCTS={...PRODUCTS,...fromDB};
    window.RainaStore.PRODUCTS=PRODUCTS;
    window.dispatchEvent(new CustomEvent("raina-products-loaded"));
    window.dispatchEvent(new CustomEvent("raina-store-updated"));
  }catch(error){console.warn("MySQL catalogue not loaded:",error);}
}
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||"[]")}catch{return []}};
const write=(k,v)=>{localStorage.setItem(k,JSON.stringify(v));window.dispatchEvent(new CustomEvent("raina-store-updated"));};
const cart=()=>read("rainaCart"),wishlist=()=>read("rainaWishlist");
function updateCounts(){let c=document.getElementById("cartCount"),w=document.getElementById("wishlistCount");if(c)c.textContent=cart().reduce((s,x)=>s+(Number(x.qty)||1),0);if(w)w.textContent=wishlist().length;}
function syncHearts(){let saved=new Set(wishlist().map(x=>x.id));document.querySelectorAll("[data-wishlist]").forEach(b=>{let yes=saved.has(b.dataset.wishlist);b.classList.toggle("is-saved",yes);b.setAttribute("aria-pressed",String(yes));});}
document.addEventListener("click",e=>{let w=e.target.closest("[data-wishlist]");if(w){e.preventDefault();e.stopPropagation();let a=wishlist(),i=a.findIndex(x=>x.id===w.dataset.wishlist);if(i>=0)a.splice(i,1);else if(PRODUCTS[w.dataset.wishlist])a.push(PRODUCTS[w.dataset.wishlist]);write("rainaWishlist",a);syncHearts();updateCounts();}
let b=e.target.closest("[data-cart]");if(b){e.preventDefault();e.stopPropagation();let a=cart(),found=a.find(x=>x.id===b.dataset.cart);if(found)found.qty=(Number(found.qty)||1)+1;else if(PRODUCTS[b.dataset.cart])a.push({...PRODUCTS[b.dataset.cart],qty:1});write("rainaCart",a);updateCounts();let old=b.textContent;b.textContent="Added ✓";setTimeout(()=>{if(b.isConnected)b.textContent=old},900);if(typeof renderCartPage==="function"&&document.getElementById("cartItems"))renderCartPage();}});
window.addEventListener("storage",()=>{updateCounts();syncHearts();if(typeof renderCartPage==="function"&&document.getElementById("cartItems"))renderCartPage();});
window.RainaStore={PRODUCTS,read,write,cart,wishlist,updateCounts,syncHearts};updateCounts();syncHearts();loadMySQLProducts();})();
