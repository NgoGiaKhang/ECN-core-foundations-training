const formatMoney = (value) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

export class App {
  constructor() {
    this.btcEl = document.getElementById("btc");
    this.jokeEl = document.getElementById("joke");
    this.adviceEl = document.getElementById("advice");
    this.btn = document.getElementById("refresh");

    this.apis = {
      btc: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
      joke: "https://official-joke-api.appspot.com/random_joke",
      advice: "https://api.adviceslip.com/advice",
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.load();
  }

  bindEvents() {
    this.btn.addEventListener("click", () => this.load());
  }

  // -----------------------------
  // retry + exponential backoff
  // -----------------------------
  async fetchWithRetry(url, retries = 3, delay = 500) {
    try {
      const res = await fetch(url);

      if (!res.ok) throw new Error("HTTP error " + res.status);

      return await res.json();
    } catch (err) {
      if (retries === 1) throw err;
      await new Promise((r) => setTimeout(r, delay));

      return this.fetchWithRetry(url, retries - 1, delay * 2);
    }
  }

  // -----------------------------
  // loading UI
  // -----------------------------
  showLoading() {
    const skeleton = `<div class="skeleton"></div>`;
    this.btcEl.innerHTML = skeleton;
    this.jokeEl.innerHTML = skeleton;
    this.adviceEl.innerHTML = skeleton;
  }

  // -----------------------------
  // load APIs in parallel
  // -----------------------------
  async load() {
    this.showLoading();

    const requests = [
      this.fetchWithRetry(this.apis.btc),
      this.fetchWithRetry(this.apis.joke),
      this.fetchWithRetry(this.apis.advice),
    ];

    const results = await Promise.allSettled(requests);

    // BTC
    if (results[0].status === "fulfilled") {
      const price = results[0].value.bitcoin.usd;

      this.btcEl.textContent = formatMoney(price);
    } else {
      this.btcEl.replaceChildren(this.createErrorElement("Failed to load BTC"));
    }

    // Joke
    if (results[1].status === "fulfilled") {
      const j = results[1].value;

      this.jokeEl.textContent = `${j.setup} - ${j.punchline}`;
    } else {
      this.jokeEl.replaceChildren(
        this.createErrorElement("Failed to load joke"),
      );
    }

    // Advice
    if (results[2].status === "fulfilled") {
      const a = results[2].value;

      this.adviceEl.textContent = a.slip.advice;
    } else {
      this.adviceEl.replaceChildren(
        this.createErrorElement("Failed to load advice"),
      );
    }
  }

  createErrorElement(message) {
    const el = document.createElement("div");

    el.classList.add("error");
    el.textContent = message;

    return el;
  }
}
