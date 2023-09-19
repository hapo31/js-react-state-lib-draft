import createStore from "./store/store";

const store = createStore(
  {
    hoge: 123,
  },
  {
    selectors: {
      getHoge:
        // @ts-ignore


          ({ store }) =>
          () =>
            store.hoge,
    },
  }
);

console.log(store);
// @ts-ignore
console.log(store.selector.getHoge());
