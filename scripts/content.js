// const pageTextContent = document.body.innerText || "";
// const wordMatches = pageTextContent.trim().match(/\b\w+\b/g) || [];
// const wordCount = wordMatches.length;

// // ❗ Send it to the background script
// chrome.runtime.sendMessage({ type: "wordCount", wordCount });

// console.log("Sent word count to background:", wordCount);

(async function () {
  const { highlightedActive } = await chrome.storage.local.get("highlightedActive");

  // Global count to track matched words
  let count = 0;

  // Function to walk and highlight Japanese text nodes
  function walkAndHighlight(node) {
    const japaneseRegex = /[\u3040-\u30FF\u4E00-\u9FFF]+/g;

    if (node.nodeType === Node.TEXT_NODE) {
      const matches = node.textContent.match(japaneseRegex);
      if (matches) {
        const span = document.createElement("span");
        span.innerHTML = node.textContent.replace(japaneseRegex, (match) => {
          count++;
          return `<span class="__highlightedWord" style="background:lime; padding:0 2px; border-radius:2px;">${match}</span>`;
        });
        node.parentNode.replaceChild(span, node);
      }
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(node.tagName)
    ) {
      Array.from(node.childNodes).forEach(child => walkAndHighlight(child));
    }
  }

  if (highlightedActive) {
    // Remove highlights
    document.querySelectorAll("span.__highlightedWord").forEach(span => {
      span.replaceWith(document.createTextNode(span.textContent));
    });

    await chrome.storage.local.set({ highlightedActive: false, wordCount: 0 });
    console.log("🔁 Highlights removed.");
  } else {
    // Highlight all Japanese words
    walkAndHighlight(document.body);

    await chrome.storage.local.set({ highlightedActive: true, wordCount: count });
    console.log("✅ Highlighted", count, "words.");
  }
})();
