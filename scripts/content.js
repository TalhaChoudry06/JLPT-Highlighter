// === Initialize resources ===
if (typeof window.termBank1 === "undefined") {
  window.termBank1 = chrome.runtime.getURL('../vocabToJlptLevel/term_meta_bank_1.json');
}
if (typeof window.termBank2 === "undefined") {
  window.termBank2 = chrome.runtime.getURL('../vocabToJlptLevel/term_meta_bank_2.json');
}
if (!window.indexedDB) {
  alert("Sorry! This browser does not support IndexedDB.");
}

if (typeof window.openRequest === 'undefined') {
  window.openRequest = indexedDB.open("Bookmark", 4);
}

if (typeof window.clickListenerAttached === "undefined") {
  window.clickListenerAttached = false;
}

if (typeof window.db === 'undefined') {
  window.db = null;
}

openRequest.onupgradeneeded = function(event) {
  const db = event.target.result;
  if (!db.objectStoreNames.contains("myObjectStore")) {
    const objectStore = db.createObjectStore("myObjectStore", { keyPath: "id" });
    objectStore.createIndex("nameIndex", "name", { unique: false });
  }
  if (!db.objectStoreNames.contains("words")) {
    db.createObjectStore("words", { autoIncrement: true });
  }
};

openRequest.onsuccess = function(event) {
  window.db = event.target.result;
};

openRequest.onerror = function(event) {
  console.error("DB error:", openRequest.error);
};

function addBookmark(word, id) {
  if (!window.db) {
    console.error("Database not initialized yet");
    return;
  }
  const transaction = window.db.transaction(["words"], "readwrite");
  const store = transaction.objectStore("words");
  const wordEntry = { id, word };
  const request = store.add(wordEntry);
  request.onsuccess = () => console.log("Word added:", wordEntry);
  request.onerror = () => console.error("Error adding word:", request.error);
}

// === Main Highlighter Logic ===
(async function () {
  const { highlightedActive } = await chrome.storage.local.get("highlightedActive");
  let count = 0;

  function walkTextNodes(node, callback) {
    if (node.nodeType === Node.TEXT_NODE) {
      callback(node);
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(node.tagName)
    ) {
      Array.from(node.childNodes).forEach(child => walkTextNodes(child, callback));
    }
  }

  function highlightMatchesInNode(textNode, matchWords) {
    const text = textNode.textContent;
    const parent = textNode.parentNode;
    let didMatch = false;

    const escapedWords = matchWords
      .filter(word => word && word.length > 1)
      .map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (escapedWords.length === 0) return;

    const regex = new RegExp(`(${escapedWords.join('|')})`, 'g');
    const parts = text.split(regex);
    const fragment = document.createDocumentFragment();

    for (const part of parts) {
      if (regex.test(part)) {
        const span = document.createElement("span");
        span.className = "__highlightedWord";
        span.dataset.word = part;
        span.textContent = part;

        // Apply JLPT highlight coloring
        fetch(window.termBank1)
          .then(res => res.json())
          .then(data => {
            const match = data.find(entry => entry[0] === part);
            span.style.background = match ? "lime" : "yellow";
          })
          .catch(() => {
            span.style.background = "yellow";
          });

        span.style.cursor = "pointer";
        fragment.appendChild(span);
        count++;
        didMatch = true;
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    }

    if (didMatch) {
      parent.replaceChild(fragment, textNode);
    }
  }

  if (highlightedActive) {
    document.querySelectorAll("span.__highlightedWord").forEach(span => {
      span.replaceWith(document.createTextNode(span.textContent));
    });
    await chrome.storage.local.set({ highlightedActive: false, wordCount: 0 });
    console.log("🔁 Highlights removed.");
  } else {
    const builder = kuromoji.builder({
      dicPath: chrome.runtime.getURL("bower_components/kuromoji/dict")
    });

    builder.build((err, tokenizer) => {
      if (err) {
        console.error("Tokenizer error:", err);
        return;
      }

      console.log("✅ Tokenizer built.");

      const tokens = tokenizer.tokenize(document.body.innerText || "");

      function extractMergedWords(tokens) {
        const words = [];
        let i = 0;
        while (i < tokens.length) {
          const current = tokens[i];
          const next = tokens[i + 1];
          const next2 = tokens[i + 2];

          if (current.pos === "動詞" && next?.pos === "助動詞") {
            words.push(current.surface_form + next.surface_form);
            i += 2;
            continue;
          }

          if (current.pos === "動詞" && next?.pos === "助動詞" && next2?.pos === "助動詞") {
            words.push(current.surface_form + next.surface_form + next2.surface_form);
            i += 3;
            continue;
          }

          if (current.basic_form && current.basic_form !== "*") {
            words.push(current.basic_form);
          }

          words.push(current.surface_form);
          i++;
        }
        return [...new Set(words)];
      }

      const uniqueWords = extractMergedWords(tokens);

      walkTextNodes(document.body, (textNode) => {
        highlightMatchesInNode(textNode, uniqueWords);
      });

      if (!window.clickListenerAttached) {
        document.addEventListener("click", function (e) {

            // You can do anything here:
            // - Open a popup
            // - Search the word
            //window.open(https://jisho.org/search/${word}, "_blank");

            // - Look it up in your database
            // - Show a translation
            // - Send to background.js

          if (e.target.classList.contains("__highlightedWord")) {
            const word = e.target.dataset.word;

            Promise.all([
              fetch(window.termBank1).then(res => res.json()),
              fetch(window.termBank2).then(res => res.json())
            ])
              .then(([bank1, bank2]) => {
                const combined = [...bank1, ...bank2];
                const match = combined.find(entry => entry[0] === word);
                const id = match?.[2]?.frequency?.displayValue || "unknown";

                if (match) {
                  addBookmark(word, id);
                  alert(`📘 Bookmarked "${word}" with ID: ${id}`);
                } else {
                  alert(`⚠️ Word "${word}" not found in either bank.`);
                }
              })
              .catch(err => console.error("An error occurred:", err));
          }
        });
        window.clickListenerAttached = true;
      }

      chrome.storage.local.set({ highlightedActive: true, wordCount: count });
      console.log("✅ Highlighted", count, "words.");
    });
  }
})();
