chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.type === "wordCount" && sender.tab?.id !== undefined) {
      const key = "wc_" + sender.tab.id;
      chrome.storage.local.set({ [key]: message.wordCount });
      console.log("Stored", message.wordCount, "in", key);
    }
  });
  