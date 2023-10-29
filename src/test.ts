import { createStore, getStore } from "./store/store";

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

const storeIns = getStore(store);

console.log(storeIns);
console.log(storeIns.selector);
console.log(storeIns.mutation);

console.log(storeIns.selector.getHoge());

storeIns.mutation.addHoge(12);

console.log(storeIns.selector.getHoge());
