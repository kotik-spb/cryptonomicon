const API_KEY =
  "9c60c6d2022f78e67710e55f58b688115870d7cad053780af466b8614e2efb8b";

const tickersHandlers = new Map();

export const loadTickers = () => {
  if (!tickersHandlers.size) {
    return;
  }

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys()
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then(r => r.json())
    .then(rawData => {
      const updatedPrice = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrice).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach(fn => fn(newPrice));
      });
    });
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = ticker => {
  tickersHandlers.delete(ticker);
};

setInterval(loadTickers, 5000);

window.tickersHandlers = tickersHandlers;
