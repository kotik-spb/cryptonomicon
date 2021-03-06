<template>
  <div
    id="app"
    class="container mx-auto flex flex-col items-center bg-gray-100 p-4"
  >
    <div
      v-if="!coinsList.length"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <div class="container">
      <div class="w-full my-4"></div>
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                type="text"
                name="wallet"
                v-model="ticker"
                @input="makeSuggestion"
                @keydown.enter="addTicker"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
            </div>
            <div
              v-if="suggestCoins.length"
              class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
            >
              <span
                v-for="suggest in suggestCoins"
                :key="suggest"
                @click.stop="addTickerToInput($event)"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ suggest }}
              </span>
            </div>
            <div v-if="isTickerAddedError" class="text-sm text-red-600">
              Такой тикер уже добавлен
            </div>
          </div>
        </div>
        <button
          @click="addTicker"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>

      <template v-if="tickers.length">
        <div>
          <hr class="w-full border-t border-gray-600 my-4" />
          <button
            @click="page--"
            v-if="page > 1"
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Назад
          </button>
          <button
            v-if="hasNextPage"
            @click="page++"
            class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Вперед
          </button>
          <div>
            Фильтр:
            <input v-model.trim="filter" @input="page = 1" />
          </div>
        </div>
        <hr class="w-full border-t border-gray-600 my-4" />
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div
            v-for="t in paginatedTickers"
            :key="t.name"
            @click="select(t)"
            :class="{
              'border-4': selectedTicker === t
            }"
            class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
          >
            <div class="px-4 py-5 sm:p-6 text-center">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {{ t.name }}
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {{ t.price }}
              </dd>
            </div>
            <div class="w-full border-t border-gray-200"></div>
            <button
              @click.stop="removeTicker(t)"
              class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
            >
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="#718096"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                ></path></svg
              >Удалить
            </button>
          </div>
        </dl>
        <hr class="w-full border-t border-gray-600 my-4" />
        <section v-if="selectedTicker" class="relative">
          <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
            {{ selectedTicker.name }} - USD
          </h3>
          <div class="flex items-end border-gray-600 border-b border-l h-64">
            <div
              v-for="(bar, idx) in normalizedGraph"
              :key="idx"
              :style="{ height: bar + '%' }"
              class="bg-purple-800 border w-10"
            ></div>
          </div>
          <button
            @click="selectedTicker = null"
            type="button"
            class="absolute top-0 right-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns:svgjs="http://svgjs.com/svgjs"
              version="1.1"
              width="30"
              height="30"
              x="0"
              y="0"
              viewBox="0 0 511.76 511.76"
              style="enable-background:new 0 0 512 512"
              xml:space="preserve"
            >
              <g>
                <path
                  d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                  fill="#718096"
                  data-original="#000000"
                ></path>
              </g>
            </svg>
          </button>
        </section>
      </template>
    </div>
  </div>
</template>

<script>
/*
  Написать критерии, по которым произведены оценки:

  [x] 6. Наличие в состоянии зависимых данных (5+)
  [ ] 2. При удалении остается подписка на загрузку курсов (5)
  [ ] 3. Количество запросов (5)
  [ ] 4. Запросы напрямую внутри компонента (5)
  [x] 8. При удалении тикера не изменяется localStorage (4)
  [x] 1. Одинаковый код в watch (3) 
  [ ] 9. localStorage и анонимные вкладки (3)
  [ ] 5. Обработка ошибок API (2)
  [ ] 7. График ужасно выглядит, если будет много цен (2)
  [ ] 10. Магические числа (URL, задержка 5000ms, ключ localStorage, количество отображения на странице) (1)

  Параллельно 
  [x] График сломан, если везде одинаковые значения
  [x] При удалении тикера остается выбор

*/
export default {
  name: "App",
  data() {
    return {
      coinsList: [],
      suggestCoins: [],
      isTickerAddedError: false,
      ticker: "",
      filter: "",

      tickers: [],
      selectedTicker: null,

      graph: [],

      page: 1,
      recordsPerPage: 6
    };
  },
  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter(tkr =>
        tkr.name.toLowerCase().includes(this.filter.toLowerCase())
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);

      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }

      return this.graph.map(price => {
        return 5 + ((price - minValue) * 95) / (maxValue - minValue);
      });
    },

    pageStateOptions() {
      return {
        filter: this.fitler,
        page: this.page
      };
    }
  },
  methods: {
    subscribeToUpdates(tickerName) {
      // setInterval(async () => {
      //   const f = await fetch(
      //     `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD&api_key=9c60c6d2022f78e67710e55f58b688115870d7cad053780af466b8614e2efb8b`
      //   );
      //   const data = await f.json();
      //   console.log(data.USD);

      //   this.tickers.find(t => t.name === tickerName).price =
      //     data.USD > 1 ? data.USD.toFixed(2) : data.USD.toPrecision(2);

      //   if (this.selectedTicker?.name === tickerName) {
      //     this.graph.push(data.USD);
      //   }
      // }, 5000);
      this.ticker = "";
      this.suggestCoins = [];
    },
    addTickerToInput({ target }) {
      this.ticker = target.innerText;
      this.addTicker();
    },
    addTicker() {
      const currentTicker = {
        name: this.ticker.toUpperCase(),
        price: "-"
      };

      if (this.checkExistingTickers()) {
        return;
      }

      this.tickers = [...this.tickers, currentTicker];

      this.subscribeToUpdates(currentTicker.name);
      this.filter = "";
    },

    checkExistingTickers() {
      if (
        this.tickers.find(
          el => el.name.toLowerCase() === this.ticker.toLowerCase()
        )
      ) {
        this.isTickerAddedError = true;
        return true;
      }
      this.isTickerAddedError = false;
      return false;
    },
    makeSuggestion() {
      this.isTickerAddedError = false;
      if (!this.ticker) {
        this.suggestCoins = [];
        return;
      }
      let filteredCoins = this.coinsList.filter(coin => {
        return coin.toLowerCase().startsWith(this.ticker.toLowerCase());
      });
      filteredCoins.sort((a, b) => a.length - b.length);

      if (filteredCoins.length > 4) {
        filteredCoins = filteredCoins.slice(0, 4);
      }
      this.suggestCoins = filteredCoins;
    },

    removeTicker(tickerToRemove) {
      this.tickers = this.tickers.filter(t => t !== tickerToRemove);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
    },

    select(ticker) {
      this.selectedTicker = ticker;
    }
  },
  watch: {
    selectedTicker() {
      this.graph = [];
    },

    tickers(newValue, oldValue) {
      localStorage.setItem("crypton", JSON.stringify(this.tickers));
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page--;
      }
    },

    filter() {
      this.page = 1;
    },

    pageStateOptions(newVal) {
      window.history.pushState(
        null,
        document.title,
        `${window.location.pathname}?filter=${newVal.filter}&page=${newVal.page}`
      );
    }
  },
  async created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    const VALID_KEYS = ["filter", "key"];

    VALID_KEYS.forEach(key => {
      if (windowData[key]) {
        this[key] = windowData[key];
      }
    });

    // if (windowData.filter) {
    //   this.fitler = windowData.filter;
    // }

    // if (windowData.page) {
    //   this.page = windowData.page;
    // }

    const allCoins = await fetch(
      "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    )
      .then(data => data.json())
      .then(({ Data: data }) => {
        const coinsSymbols = [];
        for (let key in data) {
          coinsSymbols.push(data[key].Symbol);
        }
        return coinsSymbols;
      })
      .catch(e => console.log(e));

    this.coinsList = allCoins;

    const tickersData = localStorage.getItem("crypton");
    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
    }

    this.tickers.forEach(ticker => this.subscribeToUpdates(ticker.name));
  }
};
</script>
