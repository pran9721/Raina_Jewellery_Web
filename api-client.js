/* RAINA JEWELS API client — robust session/CSRF refresh for LAN/mobile access */
(() => {
  const API = window.RAINA_API_BASE || "api/index.php";
  let csrf = null;
  let csrfPromise = null;

  async function getCsrf(force = false) {
    if (force) csrf = null;
    if (csrf) return csrf;
    if (csrfPromise) return csrfPromise;
    csrfPromise = (async () => {
      const r = await fetch(`${API}?action=csrf&_=${Date.now()}`, {
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Accept": "application/json" }
      });
      let d = {};
      try { d = await r.json(); } catch (_) {}
      if (!r.ok || !d.csrf) throw new Error(d.error || `Secure session could not start (${r.status}).`);
      csrf = d.csrf;
      return csrf;
    })();
    try { return await csrfPromise; }
    finally { csrfPromise = null; }
  }

  async function send(action, options, token) {
    const method = options.method || "GET";
    const headers = { "Accept": "application/json", ...(options.headers || {}) };
    let body = options.body;
    if (body && !(body instanceof FormData) && typeof body !== "string") {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }
    if (!["GET", "HEAD"].includes(method)) headers["X-CSRF-Token"] = token;
    return fetch(`${API}?action=${encodeURIComponent(action)}${options.query ? "&" + options.query : ""}`, {
      method, headers, body, credentials: "same-origin", cache: "no-store"
    });
  }

  async function request(action, options = {}) {
    const method = options.method || "GET";
    let response;
    if (["GET", "HEAD"].includes(method)) {
      response = await send(action, options, null);
    } else {
      response = await send(action, options, await getCsrf());
      // A stale session token can happen after PHP session rotation or when opening
      // the LAN IP on a phone for the first time. Fetch a fresh token and retry once.
      if (response.status === 419) {
        csrf = null;
        response = await send(action, options, await getCsrf(true));
      }
    }
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) {
      if (response.status === 419) csrf = null;
      throw new Error(data.error || `Request failed (${response.status}).`);
    }
    if (data.csrf) csrf = data.csrf;
    return data;
  }

  async function upload(file) {
    const form = new FormData();
    form.append("file", file);
    const sendUpload = async token => fetch(window.RAINA_UPLOAD_URL || "api/upload.php", {
      method: "POST", body: form, credentials: "same-origin", cache: "no-store",
      headers: { "X-CSRF-Token": token }
    });
    let response = await sendUpload(await getCsrf());
    if (response.status === 419) {
      csrf = null;
      response = await sendUpload(await getCsrf(true));
    }
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) throw new Error(data.error || "Image upload failed.");
    return data.url;
  }

  window.RainaAPI = { request, upload, getCsrf };
})();
