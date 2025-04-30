const pageTextContent = document.body.innerText || "";
const wordMatches = pageTextContent.trim().match(/\b\w+\b/g) || [];
const wordCount = wordMatches.length;

// ❗ Send it to the background script
chrome.runtime.sendMessage({ type: "wordCount", wordCount });

console.log("Sent word count to background:", wordCount);
