// console.log("Popup script loaded");

// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   const tab = tabs[0];

//   // Avoid restricted pages
//   if (!tab || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) return;

//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ['scripts/content.js']
//   });
// });

// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   const tab = tabs[0];
//   if (!tab || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) return;

//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["scripts/content.js"]
//   }, () => {
//     // Wait 200ms for storage update
//     setTimeout(() => {
//       chrome.storage.local.get("wordCount", (res) => {
//         const count = res.wordCount ?? 0;
//         document.getElementById("wordCount").textContent = count;
//         console.log("🔢 Word count from storage:", count);
//       });
//     }, 200);
//   });
// });



// // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
// //     const tab = tabs[0];
// //     if (!tab || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://")) {
// //       document.getElementById("wordCount").textContent = "N/A";
// //       return;
// //     }
  
// //     // Inject content.js into the active tab
// //     chrome.scripting.executeScript({
// //       target: { tabId: tab.id },
// //       files: ["scripts/content.js"]
// //     }, () => {
// //       const key = "wc_" + tab.id;
  
// //       // Wait a tiny moment to let content.js send the message and background.js save it
// //       setTimeout(() => {
// //         chrome.storage.local.get([key], (result) => {
// //           const count = result[key] ?? "N/A";
// //           document.getElementById("wordCount").textContent = count;
// //           console.log("📦 Got from storage", key, "=", count);
// //         });
// //       }, 300); // 300ms delay to allow content -> background -> storage
// //     });
// //   });
  
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
