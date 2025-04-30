console.log("Popup script loaded");

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
      document.getElementById("wordCount").textContent = "N/A";
      return;
    }
  
    // Inject content.js into the active tab
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["scripts/content.js"]
    }, () => {
      const key = "wc_" + tab.id;
  
      // Wait a tiny moment to let content.js send the message and background.js save it
      setTimeout(() => {
        chrome.storage.local.get([key], (result) => {
          const count = result[key] ?? "N/A";
          document.getElementById("wordCount").textContent = count;
          console.log("📦 Got from storage", key, "=", count);
        });
      }, 300); // 300ms delay to allow content -> background -> storage
    });
  });
  