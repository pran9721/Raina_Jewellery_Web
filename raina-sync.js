/* Sync customer cart and wishlist with MySQL when a session exists. */
(async()=>{
  if(!window.RainaAPI)return;
  const read=key=>{try{return JSON.parse(localStorage.getItem(key)||"[]")}catch(_){return []}};
  const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  let signedIn=false;
  try{const auth=await RainaAPI.request("auth");signedIn=!!auth.user;}catch(_){}
  if(!signedIn)return;
  const toApiCart=items=>items.map(x=>({product_ref:String(x.slug||x.id),quantity:Number(x.qty||x.quantity||1)}));
  const sync=async()=>{
    try{
      await RainaAPI.request("cart",{method:"PUT",body:{items:toApiCart(read("rainaCart"))}});
      const wish=read("rainaWishlist").map(x=>typeof x==="object"?String(x.slug||x.id):String(x));
      await RainaAPI.request("wishlist",{method:"PUT",body:{product_ids:wish}});
    }catch(e){console.warn("Cart/wishlist sync failed:",e.message);}
  };
  // Existing browser cart takes precedence; restore the SQL cart only when local cart is empty.
  if(!read("rainaCart").length){
    try{
      const d=await RainaAPI.request("cart");
      if(d.items?.length){
        const items=d.items.map(x=>{let imgs=[];try{imgs=JSON.parse(x.image_urls||"[]")}catch(_){}
          return{id:x.slug,slug:x.slug,name:x.name,price:Number(x.price),oldPrice:Number(x.mrp||x.price),image:imgs[0]||"",qty:Number(x.quantity)};
        });write("rainaCart",items);window.dispatchEvent(new CustomEvent("raina-store-updated"));
      }
    }catch(_){}
  }else await sync();
  if(!read("rainaWishlist").length){
    try{
      const d=await RainaAPI.request("wishlist");
      if(d.items?.length){write("rainaWishlist",d.items.map(x=>{let imgs=[];try{imgs=JSON.parse(x.image_urls||"[]")}catch(_){}
        return{id:x.slug,slug:x.slug,name:x.name,price:Number(x.price),oldPrice:Number(x.mrp||x.price),image:imgs[0]||""};
      }));window.dispatchEvent(new CustomEvent("raina-store-updated"));}
    }catch(_){}
  }else await sync();
  window.addEventListener("raina-store-updated",sync);
})();
