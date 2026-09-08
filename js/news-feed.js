
/* News Feed Loader - Live RSS via rss2json + feeds.js
   - Loads sources from window.newsFeeds (defined in feeds.js)
   - Fetches up to 15 latest items per feed
   - Merges, sorts, renders, with search and refresh
*/

(function () {
  const RSS2JSON_API = "https://api.rss2json.com/v1/api.json?rss_url=";
  const FALLBACK_IMG = "images/news-fallback.jpg";

  let allArticles = [];

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("news-feed")) return;
    // Ensure feeds.js loaded
    if (!window.newsFeeds || !Array.isArray(window.newsFeeds) || !window.newsFeeds.length) {
      console.error("feeds.js not loaded or contains no feeds");
      renderError("No news sources configured. Please check js/feeds.js.");
      return;
    }
    attachUIHandlers();
    loadAllFeeds();
  });

  function attachUIHandlers() {
    const refreshBtn = document.getElementById("refresh-news");
    const notif = document.getElementById("refresh-notification");
    const notifMsg = document.getElementById("notification-message");

    if (refreshBtn) {
      refreshBtn.addEventListener("click", async () => {
        refreshBtn.classList.add("refreshing");
        if (notif) {
          notif.classList.add("show");
          if (notifMsg) notifMsg.textContent = "Refreshing content...";
        }
        await loadAllFeeds();
        if (notif) {
          if (notifMsg) notifMsg.textContent = "News updated successfully.";
          setTimeout(() => notif.classList.remove("show"), 2000);
        }
        refreshBtn.classList.remove("refreshing");
      });
    }

    // Search + Filters
    const searchInput = document.getElementById("news-search");
    const searchButton = document.getElementById("search-button");
    const topicFilter = document.getElementById("topic-filter");
    const dateFilter = document.getElementById("date-filter");

    function performSearch() {
      const term = (searchInput?.value || "").trim().toLowerCase();
      const topic = (topicFilter?.value || "all").toLowerCase();
      const dateRange = (dateFilter?.value || "all").toLowerCase();
      const now = new Date();
      const nowCopy = new Date(now.getTime());

      const filtered = allArticles.filter((a) => {
        const t = (a.title + " " + a.summary).toLowerCase();
        const matchTerm = !term || t.includes(term);
        const matchTopic =
          topic === "all" ||
          (a.subcategory && a.subcategory.toLowerCase() === topic) ||
          (a.category && a.category.toLowerCase() === topic);

        let matchDate = true;
        if (dateRange !== "all") {
          const d = new Date(a.date);
          if (dateRange === "today") {
            matchDate = d.toDateString() === now.toDateString();
          } else if (dateRange === "week") {
            const weekAgo = new Date(nowCopy.getTime());
            weekAgo.setDate(weekAgo.getDate() - 7);
            matchDate = d >= weekAgo;
          } else if (dateRange === "month") {
            const monthAgo = new Date(nowCopy.getTime());
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            matchDate = d >= monthAgo;
          } else if (dateRange === "year") {
            const yearAgo = new Date(nowCopy.getTime());
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            matchDate = d >= yearAgo;
          }
        }
        return matchTerm && matchTopic && matchDate;
      });

      renderArticles(filtered);
    }

    searchButton?.addEventListener("click", performSearch);
    searchInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") performSearch();
    });
    topicFilter?.addEventListener("change", performSearch);
    dateFilter?.addEventListener("change", performSearch);
  }

  async function loadAllFeeds() {
    const container = document.getElementById("news-feed");
    if (container) {
      container.innerHTML =
        '<div class="loading-spinner"><i class="fas fa-spinner fa-pulse"></i><p>Loading latest news...</p></div>';
    }

    const feedDefs = window.newsFeeds;
    const all = [];

    // Fetch in parallel
    const tasks = feedDefs.map(async (feed) => {
      try {
        const url = RSS2JSON_API + encodeURIComponent(feed.url);
        const res = await fetch(url);
        const data = await res.json();

        if (data.status !== "ok" || !Array.isArray(data.items)) {
          console.warn("Bad feed response:", feed.url, data);
          return;
        }

        // Take latest 15 items
        const items = data.items.slice(0, 15).map((item) => mapItem(item, feed));
        all.push(...items);
      } catch (e) {
        console.error("Feed load failed:", feed.url, e);
      }
    });

    try {
      await Promise.all(tasks);
    } catch (e) {
      console.error("Some feeds failed", e);
    }

    if (!all.length) {
      renderError("Error loading news sources.");
      return;
    }

    // Sort newest first
    all.sort((a, b) => new Date(b.date) - new Date(a.date));
    allArticles = all;

    renderTabs(allArticles);
    renderArticlesByFirstTab();
    updateLastUpdatedTime();
  }

  function mapItem(item, feed) {
    const clean = (html) =>
      (html || "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const image =
      (item.enclosure && (item.enclosure.link || item.enclosure.url)) ||
      item.thumbnail ||
      extractFirstImgSrc(item.description) ||
      FALLBACK_IMG;

    return {
      title: clean(item.title) || "Untitled",
      summary: (clean(item.description) || "").slice(0, 220) + "...",
      date: item.pubDate || item.pubdate || item.isoDate || item.date || new Date().toISOString(),
      image,
      url: item.link || item.guid || "#",
      source: feed.source,
      category: feed.category,
      subcategory: feed.subcategory,
    };
  }

  function extractFirstImgSrc(html) {
    if (!html) return null;
    const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return m ? m[1] : null;
    }

  // Tabs
  function renderTabs(articles) {
    const container = document.getElementById("news-feed");
    if (!container) return;
    container.innerHTML = "";

    const categories = [...new Set(articles.map((a) => a.category))];
    const tabs = document.createElement("div");
    tabs.className = "news-tabs";

    categories.forEach((cat, i) => {
      const btn = document.createElement("button");
      btn.className = i === 0 ? "news-tab active" : "news-tab";
      btn.textContent = cat;
      btn.dataset.category = cat;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".news-tab").forEach((t) => t.classList.remove("active"));
        btn.classList.add("active");
        const filtered = allArticles.filter((a) => a.category === cat);
        renderArticles(filtered);
      });
      tabs.appendChild(btn);
    });

    container.appendChild(tabs);

    const list = document.createElement("div");
    list.className = "news-articles";
    list.id = "news-articles";
    container.appendChild(list);
  }

  function renderArticlesByFirstTab() {
    const firstActive = document.querySelector(".news-tab.active");
    const cat = firstActive ? firstActive.dataset.category : null;
    const filtered = cat ? allArticles.filter((a) => a.category === cat) : allArticles;
    renderArticles(filtered);
  }

  function renderArticles(articles) {
    const list = document.getElementById("news-articles");
    if (!list) return;
    list.innerHTML = "";

    if (!articles.length) {
      list.innerHTML = `<div class="no-content"><i class="fas fa-newspaper"></i><h3>No Articles Found</h3></div>`;
      return;
    }

    articles.forEach((a, idx) => {
      const d = new Date(a.date);
      const dateStr = d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

      const card = document.createElement("div");
      card.className = "news-article animate__animated animate__fadeIn";
      card.style.animationDelay = `${idx * 0.06}s`;

      card.innerHTML = `
        <div class="article-image">
          <a href="${a.url}" target="_blank" rel="noopener noreferrer">
            <img src="${a.image}" alt="${escapeHtml(a.title)}" onerror="this.src='${FALLBACK_IMG}'">
          </a>
          <span class="article-category">${escapeHtml(a.subcategory || "")}</span>
        </div>
        <div class="article-content">
          <span class="article-date">${dateStr}</span>
          <h3><a href="${a.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(a.title)}</a></h3>
          <p>${escapeHtml(a.summary)}</p>
          <div class="article-source">
            <span>Source: ${escapeHtml(a.source || "")}</span>
            <button class="read-more-btn" data-url="${a.url}">Read Full Article</button>
          </div>
        </div>
      `;

      // Button handler
      const btn = card.querySelector(".read-more-btn");
      btn.addEventListener("click", () => {
        const link = btn.getAttribute("data-url");
        if (link && link.startsWith("http")) {
          window.open(link, "_blank", "noopener");
        } else {
          alert("Sorry, this article link is unavailable.");
        }
      });

      list.appendChild(card);
    });
  }

  function updateLastUpdatedTime() {
    const el = document.getElementById("last-updated-time");
    if (!el) return;
    const now = new Date();
    el.textContent =
      now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
      " at " +
      now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  function renderError(msg) {
    const container = document.getElementById("news-feed");
    if (!container) return;
    container.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${msg}</div>`;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
