import createStore from "./store/store";

const store = createStore({
  defaultValue: {
    hoge: 123,
  },
  selectors: {
    getHoge:
      ({ store }) =>
      () =>
        store.hoge,
  },
  mutations: {
    addHoge:
      ({ storeDraft }) =>
      (count: number) => {
        storeDraft.hoge = storeDraft.hoge + count;
      },
  },
});

console.log(store);
console.log(store.selector);
console.log(store.mutation);

console.log(store.selector.getHoge());

store.mutation.addHoge(12);

console.log(store.selector.getHoge());
