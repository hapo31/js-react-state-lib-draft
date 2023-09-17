import { produce } from "immer";

import { Primitive, isPrimitive } from "./typeHelpers";

type TODO = any;

type InitialValue<T extends Primitive> = T | (() => T) | (() => Promise<T>);

type CreateStoreOptions = {
  selectors: TODO;
  mutations: TODO;
};

type SelectorValue = TODO;

type StoreInternal<StoreValue extends Primitive> = {
  storeValue: StoreValue | undefined;
  storeSelectors: TODO;
  storeMutations: TODO;
  selectorCache: Record<string, SelectorValue>;
};

export default function createStore<StoreValue extends Primitive>(
  initialValue: InitialValue<StoreValue>,
  opts: CreateStoreOptions
) {
  const internals: StoreInternal<StoreValue> = {
    selectorCache: {},
    storeSelectors: {},
    storeMutations: {},
    storeValue: undefined,
  };

  resolveInitialValue(internals, initialValue);

  createSelectors(internals, Object.entries(opts.selectors));
  createMutations(internals, Object.entries(opts.mutations));

  return { __internals__: internals };
}

function resolveInitialValue<StoreValue extends Primitive>(
  internals: StoreInternal<StoreValue>,
  initialValue: InitialValue<StoreValue>
) {
  if (typeof initialValue === "function") {
    const resolvedValue = initialValue();

    if (resolvedValue instanceof Promise) {
      resolvedValue.then((v) => (internals.storeValue = v));
    }
  } else if (isPrimitive(initialValue)) {
    internals.storeValue = initialValue;
  } else {
    throw new Error(`Unexpected initial value. ${initialValue}`);
  }
}

function createSelectors<StoreValue extends Primitive>(
  internals: StoreInternal<StoreValue>,
  entries: [
    selectorKey: string,
    selector: (...storeOpts: any) => (...args: any) => any
  ][]
) {
  Object.defineProperties(
    internals.storeSelectors,
    entries.reduce(
      (acc, [key, selector]) => ({
        ...acc,
        [key]: {
          get() {
            return selector({ store: internals.storeValue });
          },
        },
      }),
      {}
    )
  );
}

function createMutations<StoreValue extends Primitive>(
  internals: StoreInternal<StoreValue>,
  entries: [
    mutationKey: string,
    mutation: (...storeOpts: any) => (...args: any) => any
  ][]
) {
  Object.defineProperties(
    internals.storeMutations,
    entries.reduce(
      (acc, [key, mutation]) => ({
        ...acc,
        [key]: {
          get() {
            return produce(
              internals.storeValue,
              mutation({ store: internals.storeValue })
            );
          },
        },
      }),
      {}
    )
  );
}
