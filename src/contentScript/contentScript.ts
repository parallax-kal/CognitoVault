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
  } else if (
    typeof message === "object" &&
    message.type === "set-local-storage"
  ) {
    // const localStorage = message.localStorage;
    const keys = Object.keys(localStorage);
    for (let k = 0; k < keys.length; k++) {
      let key = keys[k];
      let value = localStorage[key];
      window.localStorage.setItem(key, value);
    }
    // window.localStorage = message.localStorage;
    window.location.reload();
    sendResponse(`Successfully set localStorage for ${window.location.href}`);
    // // Reload the current page to apply the new localStorage settings
    return true;
  } else {
    sendResponse(false);
    return false;
  }
});
