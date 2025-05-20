  // When popup loads, update checkbox and word count display
window.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["highlightedActive", "wordCount"], (res) => {
    document.getElementById("highlightToggle").checked = res.highlightedActive ?? false;
    document.getElementById("wordCount").textContent = res.wordCount ?? 0;
  });

  // When checkbox is toggled
  document.getElementById("highlightToggle").addEventListener("change", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) return;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["scripts/content.js"]
      }, () => {
        // Wait a moment then update word count in popup
        setTimeout(() => {
          chrome.storage.local.get("wordCount", (res) => {
            document.getElementById("wordCount").textContent = res.wordCount ?? 0;
          });
        }, 150);
      });
    });
  });
});
