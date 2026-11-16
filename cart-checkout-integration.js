/*
  RAINA cart -> checkout bridge
  Add this script AFTER product-store.js, store-pages.js and renderCartPage()
  in cart.html. It reads the already-rendered cart page, so it does not need
  to know the private storage key used by your existing cart scripts.
*/
(() => {
  function connectCheckoutButton() {
    const button = document.getElementById("checkoutButton");
    if (!button || button.dataset.checkoutBridgeReady === "yes") return;
    button.dataset.checkoutBridgeReady = "yes";

    // Capture phase ensures this navigation takes priority over older button handlers.
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const textOf = (id) => document.getElementById(id)?.textContent?.trim() || "—";
      const cartItems = document.getElementById("cartItems");
      const itemText = cartItems?.innerText?.trim() || "";
      const snapshot = {
        itemsText: itemText,
        itemCount: textOf("cartItemCount"),
        subtotal: textOf("mrpTotal"),
        discount: [
          textOf("mrpDiscount"),
          document.getElementById("couponLine")?.hidden ? "" : textOf("couponDiscount")
        ].filter(Boolean).join(" + "),
        shipping: textOf("shippingCost"),
        total: textOf("grandTotal"),
        coupon: document.getElementById("couponInput")?.value?.trim() || "",
        giftWrap: document.getElementById("giftWrap")?.checked || false,
        capturedAt: new Date().toISOString()
      };

      if (!itemText) {
        alert("Your shopping cart is empty. Please add an item before checkout.");
        return;
      }

      try {
        sessionStorage.setItem("rainaCheckoutSnapshot", JSON.stringify(snapshot));
        window.location.href = "checkout.html";
      } catch (error) {
        alert("Checkout could not save your cart details. Please enable browser storage and try again.");
      }
    }, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", connectCheckoutButton);
  } else {
    connectCheckoutButton();
  }
})();