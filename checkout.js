(() => {
  const $=id=>document.getElementById(id);
  let snapshot=null;try{snapshot=JSON.parse(sessionStorage.getItem("rainaCheckoutSnapshot")||"null");}catch(_){}
  const money=v=>"₹"+Number(v||0).toLocaleString("en-IN");
  if(snapshot){
    $("checkoutItems").textContent=snapshot.itemsText||"";
    $("itemCount").textContent=snapshot.itemCount||"—";
    $("subtotal").textContent=snapshot.subtotal||"—";
    $("discount").textContent=snapshot.discount||"—";
    $("shipping").textContent=snapshot.shipping||"—";
    $("total").textContent=snapshot.total||"—";
  }
  $("year").textContent=new Date().getFullYear();
  (async()=>{try{const d=await RainaAPI.request("profile");const u=d.user||{};if(!$("fullName").value)$("fullName").value=u.name||"";if(!$("email").value)$("email").value=u.email||"";if(!$("phone").value)$("phone").value=u.phone||"";}catch(_){location.replace("login.html");}})();
  const message=(text,type="error")=>{const el=$("formMessage");el.textContent=text;el.className=`form-message show ${type}`;el.scrollIntoView({behavior:"smooth",block:"center"});};
  $("checkoutForm").addEventListener("submit",async e=>{
    e.preventDefault();const form=e.currentTarget;
    if(!form.checkValidity()){form.reportValidity();return;}
    const phone=$("phone").value.trim(),pin=$("pincode").value.trim();
    if(!/^[6-9]\d{9}$/.test(phone))return message("Enter a valid 10-digit Indian mobile number.");
    if(!/^\d{6}$/.test(pin))return message("Enter a valid 6-digit PIN code.");
    let cart=[];try{cart=JSON.parse(localStorage.getItem("rainaCart")||"[]");}catch(_){}
    if(!cart.length)return message("Your cart is empty. Go back and add products.");
    const payment=form.querySelector('input[name="payment"]:checked')?.value;
    const items=cart.map(x=>({product_ref:String(x.slug||x.id),quantity:Number(x.qty||x.quantity||1)}));
    if(items.some(x=>!x.product_ref||!Number.isFinite(x.quantity)||x.quantity<1))return message("Cart contains an invalid product. Please refresh your cart.");
    const customer={name:$("fullName").value.trim(),email:$("email").value.trim(),phone,address:$("address").value.trim(),landmark:$("landmark").value.trim(),pincode:pin,city:$("city").value.trim(),state:$("state").value.trim(),note:$("note").value.trim()};
    if(!payment)return message("Please select a payment method.");
    const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent=payment==="Cashfree"?"CONNECTING TO CASHFREE…":"PLACING COD ORDER…";
    try{
      if(payment==="Cashfree"){
        if(typeof Cashfree!=="function")throw new Error("Cashfree checkout SDK could not load. Check your internet connection and refresh.");
        const result=await RainaAPI.request("cashfree-create",{method:"POST",body:{customer,items,coupon:localStorage.getItem("rainaCoupon")?.replaceAll('"',"")||"",gift_wrap:!!snapshot?.giftWrap}});
        const cashfree=Cashfree({mode:result.environment==="production"?"production":"sandbox"});
        await cashfree.checkout({paymentSessionId:result.payment_session_id,redirectTarget:"_self"});
        return;
      }
      const result=await RainaAPI.request("orders",{method:"POST",body:{customer,items,coupon:localStorage.getItem("rainaCoupon")?.replaceAll('"',"")||"",gift_wrap:!!snapshot?.giftWrap}});
      localStorage.removeItem("rainaCart");localStorage.removeItem("rainaCoupon");sessionStorage.removeItem("rainaCheckoutSnapshot");
      $("checkoutGrid").hidden=true;$("orderSuccess").hidden=false;
      $("confirmedOrderNumber").textContent=result.order.order_number;$("confirmedOrderAmount").textContent=money(result.order.total);
      $("confirmedPaymentMethod").textContent="Cash on Delivery";$("confirmedPaymentStatus").textContent="Pending";
      $("successDescription").textContent="Your Cash on Delivery order has been placed successfully. Our team will review and confirm it shortly.";
      $("orderSuccess").scrollIntoView({behavior:"smooth",block:"start"});
    }catch(error){message("PAYMENT / ORDER ERROR: "+(error.message||"Server error. Please try again."));button.disabled=false;button.innerHTML='CONTINUE TO PLACE ORDER <span>→</span>';}
  });
})();
