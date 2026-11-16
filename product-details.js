(async()=>{
  const root=document.getElementById("productDetails");
  const id=new URLSearchParams(location.search).get("id");
  if(!root)return;
  const money=value=>`₹${Number(value||0).toLocaleString("en-IN")}`;
  try{
    const data=await RainaAPI.request("products");
    const p=(data.products||[]).find(x=>String(x.slug||x.id)===String(id));
    if(!p)throw new Error("Product not found");
    let images=[];try{images=Array.isArray(p.image_urls)?p.image_urls:JSON.parse(p.image_urls||"[]")}catch(_){}
    const product={id:p.slug||String(p.id),name:p.name,price:Number(p.price),oldPrice:Number(p.mrp||p.price),image:images[0]||"",category:p.category_name||p.category||"Jewellery"};
    const saved=(window.RainaStore?.wishlist()||[]).some(x=>String(x.id)===String(product.id));
    root.innerHTML=`
      <section class="details-gallery"><img class="details-main-image" src="${product.image}" alt="${product.name}"></section>
      <section class="details-copy">
        <span class="details-badge">RAINA JEWELS · ${product.category}</span>
        <div class="details-rating">RAINA SIGNATURE COLLECTION</div>
        <h1>${product.name}</h1>
        <p class="details-description">${p.description||"A timeless jewellery piece selected for everyday elegance and special occasions."}</p>
        <div class="details-price"><strong>${money(product.price)}</strong><del>${money(product.oldPrice)}</del></div>
        <div class="details-discount">You save ${money(Math.max(0,product.oldPrice-product.price))}</div>
        <div class="details-actions">
          <button class="details-add-cart" type="button" data-cart="${product.id}">ADD TO CART</button>
          <button class="details-wishlist ${saved?"is-saved":""}" type="button" data-wishlist="${product.id}" aria-pressed="${saved}"><i data-lucide="heart"></i>${saved?"SAVED TO WISHLIST":"ADD TO WISHLIST"}</button>
        </div>
        <div class="details-meta">
          <div class="details-meta-row"><strong>Category</strong><span>${product.category}</span></div>
          <div class="details-meta-row"><strong>Availability</strong><span>${Number(p.stock)>0?"In stock":"Available to order"}</span></div>
          <div class="details-meta-row"><strong>Care</strong><span>Keep away from water, perfume and harsh chemicals. Store in a dry jewellery pouch.</span></div>
        </div>
      </section>`;
    if(window.lucide)lucide.createIcons();
  }catch(e){
    root.innerHTML='<div class="details-not-found"><h2>Product not found</h2><p>Please return to the collection and choose a product.</p><a href="shop.html">Back to Shop</a></div>';
  }
})();
