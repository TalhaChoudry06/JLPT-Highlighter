//Authentication
document.getElementById("login").addEventListener("click", async () => {
  const clientId = "541096500259-87fha1lqua8gk8gc13v1ssedkvofp427.apps.googleusercontent.com";
  const redirectUri = chrome.identity.getRedirectURL();
  const scopes = ["https://www.googleapis.com/auth/userinfo.email"];
  
  const authUrl =
    `https://accounts.google.com/o/oauth2/auth?` +
    `client_id=${clientId}` +
    `&response_type=token` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes.join(" "))}`;

  chrome.identity.launchWebAuthFlow(
    {
      url: authUrl,
      interactive: true
    },
    function (redirectUrl) {
      if (chrome.runtime.lastError || !redirectUrl) {
        console.error(chrome.runtime.lastError);
        return;
      }

      const token = new URL(redirectUrl).hash
        .substring(1)
        .split("&")
        .find(s => s.startsWith("access_token="))
        .split("=")[1];

      console.log("Access token:", token);

      fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log("User info:", data);
        });
    }
  );
});


// When popup loads, update checkbox and word count display, change highlight toggle
window.addEventListener("", () => {
  chrome.storage.local.get(["DOMContentLoaded", "wordCount"], (res) => {
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
