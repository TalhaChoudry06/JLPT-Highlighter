(async function () {
  // Retrieve the highlight state from Chrome's local storage
  const { highlightedActive } = await chrome.storage.local.get("highlightedActive");

  // Counter for how many words are highlighted
  let count = 0;

  // Recursively walks through the DOM to find text nodes
  function walkTextNodes(node, callback) {
    if (node.nodeType === Node.TEXT_NODE) {
      // If it's a text node, apply the callback
      callback(node);
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(node.tagName)
    ) {
      // If it's a safe element (not <script>, <style>, etc.), go deeper
      Array.from(node.childNodes).forEach(child => walkTextNodes(child, callback));
    }
  }

  // Highlights any matching Japanese words in the given text node
  function highlightMatchesInNode(textNode, matchWords) {
    const text = textNode.textContent; // Original text
    let replaced = text;               // Text to modify
    let matched = false;              // Flag to track if any word matched

    for (const word of matchWords) {
      // Basic check to avoid matching 1-character particles
      if (word && word.length > 1 && replaced.includes(word)) {
        // Escape special characters for safe regex
        const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(safeWord, 'g'); // Global match

        // Replace the matched word with a highlighted <span>
        replaced = replaced.replace(regex, (match) => {
          matched = true;
          count++;
          return `<span class="__highlightedWord" style="background:lime; padding:0 2px; border-radius:2px;">${match}</span>`;
        });
      }
    }

    if (matched) {
      // If any match was found, replace the text node with a <span>
      const span = document.createElement("span");
      span.innerHTML = replaced;
      textNode.parentNode.replaceChild(span, textNode);
    }
  }

  if (highlightedActive) {
    // 🔁 If highlighting is already active, remove all highlights

    // Select all previously highlighted spans
    document.querySelectorAll("span.__highlightedWord").forEach(span => {
      // Replace each span with plain text
      span.replaceWith(document.createTextNode(span.textContent));
    });

    // Reset the state and count
    await chrome.storage.local.set({ highlightedActive: false, wordCount: 0 });
    console.log("🔁 Highlights removed.");
  } else {
    // ✅ Otherwise, enable highlighting using kuromoji

    // Build the tokenizer using the included dictionary files
    const builder = kuromoji.builder({
      dicPath: chrome.runtime.getURL("bower_components/kuromoji/dict") // Chrome-safe path to dict
    });

    // Build the tokenizer asynchronously
    builder.build((err, tokenizer) => {
      if (err) {
        // If there's an error, log and exit
        console.error("Tokenizer error:", err);
        return;
      }
      console.log("✅ Tokenizer built."); // Add this

      // Grab the full page's visible text
      const text = document.body.innerText || "";

      // Tokenize the text into Japanese words
      const tokens = tokenizer.tokenize(text);

      // Get the base form (dictionary form) of each token
      const words = tokens.map(t =>
        t.basic_form === "*" ? t.surface_form : t.basic_form
      );

      // Remove duplicates
      const uniqueWords = [...new Set(words)];

      // Walk through all visible text nodes and highlight matches
      walkTextNodes(document.body, (textNode) => {
        highlightMatchesInNode(textNode, uniqueWords);
      });

      // Save the state and number of highlights
      chrome.storage.local.set({ highlightedActive: true, wordCount: count });
      console.log("✅ Highlighted", count, "words.");
    });
  }
})();
