// Add a listener for messages sent to the background script from other parts of the extension
window.chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  // Check if the received message is "get-local-storage"
  if (message === "get-local-storage") {
    // Get the current localStorage object
    let localStorage = window.localStorage;

    // Send the localStorage object back to the sender
    sendResponse(localStorage);

    // Return true to indicate that the response will be sent asynchronously
    return true;
  } else {
    sendResponse(false);
    return false;
  }
});

window.chrome.storage.local.onChanged.addListener((changes) => {
  const urls = Object.keys(changes);
  for (let i = 0; i < urls.length; i++) {
    if (window.location.href.includes(urls[i])) {
      let localStorage = changes[urls[i]].newValue;
      const keys = Object.keys(localStorage);
      for (let k = 0; k < keys.length; k++) {
        let key = keys[k];
        let value = localStorage[key];
        window.localStorage.setItem(key, value);
      }
      window.chrome.storage.local.remove(urls[i]);
    }
  }
});
