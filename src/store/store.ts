/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/no-invalid-void-type */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import { type Draft, produce } from "immer";

import { type Primitive, isPrimitive } from "./typeHelpers";

type TODO = any;

export type Store<
  TStoreValue extends StoreValue,
  TSelector,
  TMutation extends MutationResultFunction<TStoreValue, any>,
  TSelectors extends Record<string, SelectorType<TStoreValue, TSelector>>,
  TMutations extends Record<string, MutationType<TStoreValue, any, TMutation>>,
> = {
  key: symbol;
  immutable: boolean;
};

type StoreValue = Primitive;

type DefaultValue<T extends Primitive> = T | (() => T) | (() => Promise<T>);

type SelectorArgs<TStoreValue extends StoreValue> = {
  store: TStoreValue;
};

type MutationArgs<TStoreValue extends StoreValue> = {
  storeDraft: Draft<TStoreValue>;
};

type MutationResultFunction<TStoreValue extends StoreValue, Args> = (
  ...args: Args[]
) => TStoreValue | Promise<TStoreValue> | Promise<void> | void;

type SelectorType<TStoreValue extends StoreValue, TResultValue> = (
  args: SelectorArgs<TStoreValue>
) => TResultValue;

type MutationType<
  TStoreValue extends StoreValue,
  TMutationArg,
  TResultFunction extends MutationResultFunction<TStoreValue, TMutationArg>,
> = (args: MutationArgs<TStoreValue>) => TResultFunction;

interface CreateStoreOptions<
  TStoreValue extends StoreValue,
  TSelector extends SelectorType<TStoreValue, any>,
  TMutation extends MutationResultFunction<TStoreValue, any>,
  TSelectors extends Record<string, SelectorType<TStoreValue, TSelector>>,
  TMutations extends Record<string, MutationType<TStoreValue, any, TMutation>>,
> {
  defaultValue: DefaultValue<TStoreValue>;
  selectors: TSelectors;
  mutations?: TMutations;
}

interface StoreInternal<
  TStoreValue extends StoreValue,
  TSelector extends SelectorType<TStoreValue, any>,
  TMutation extends MutationResultFunction<TStoreValue, any>,
  TSelectors extends Record<string, SelectorType<TStoreValue, TSelector>>,
  TMutations extends Record<string, MutationType<TStoreValue, any, TMutation>>,
> {
  storeValue: TStoreValue;
  storeSelectors: TSelectors;
  storeMutations: TMutations;
  // selectorCache: Record<string, SelectorValue>;
  defaultValue: TStoreValue;
}

const internalStoreObjects = new WeakMap<
  Store<any, any, any, any, any>,
  StoreInternal<any, any, any, any, any>
>();
let storeCount = 0;

export function createStore<
  TStoreValue extends StoreValue,
  TSelector extends SelectorType<TStoreValue, any>,
  TMutation extends MutationResultFunction<TStoreValue, any>,
  TSelectors extends Record<string, SelectorType<TStoreValue, TSelector>>,
  TMutations extends Record<string, MutationType<TStoreValue, any, TMutation>>,
>(
  opts: CreateStoreOptions<
    TStoreValue,
    TSelector,
    TMutation,
    TSelectors,
    TMutations
  >
): Store<TStoreValue, TSelector, TMutation, TSelectors, TMutations> {
  const internals: StoreInternal<
    TStoreValue,
    TSelector,
    TMutation,
    TSelectors,
    TMutations
  > = {
    // selectorCache: {},
    storeSelectors: {} as TSelectors,
    storeMutations: {} as TMutations,
    storeValue: undefined as TStoreValue,
    defaultValue: undefined as TStoreValue,
  };

  resolveInitialValue(internals, opts.defaultValue);

  createSelectors(
    internals,
    Object.entries(opts.selectors) as [string, TSelector][]
  );
  if (opts.mutations != null) {
    createMutations(internals, Object.entries(opts.mutations));
  }

  const storeKey = {
    key: Symbol(`store_${storeCount++}`),
    immutable: opts.mutations == null,
  };

  internalStoreObjects.set(storeKey, internals);

  return storeKey;
}

export function getStore<
  TStoreValue extends StoreValue,
  TSelector extends SelectorType<TStoreValue, any>,
  TMutation extends MutationResultFunction<TStoreValue, any>,
  TSelectors extends Record<string, SelectorType<TStoreValue, TSelector>>,
  TMutations extends Record<string, MutationType<TStoreValue, any, TMutation>>,
>(store: Store<TStoreValue, TSelector, TMutation, TSelectors, TMutations>) {
  const storeInstance = internalStoreObjects.get(store);

  if (storeInstance == null) {
    throw new Error("Notfound store");
  }

  return storeInstance;
}

function resolveInitialValue<
  TStoreValue extends StoreValue,
  TSelector extends SelectorType<TStoreValue, any>,
  TMutation extends MutationResultFunction<TStoreValue, any>,
  TSelectors extends Record<string, SelectorType<TStoreValue, TSelector>>,
  TMutations extends Record<string, MutationType<TStoreValue, any, TMutation>>,
>(
  internals: StoreInternal<
    TStoreValue,
    TSelector,
    TMutation,
    TSelectors,
    TMutations
  >,
  initialValue: DefaultValue<TStoreValue>
): TODO {
  if (typeof initialValue === "function") {
    const resolvedValue = initialValue();

    if (resolvedValue instanceof Promise) {
      resolvedValue
        .then((v) => (internals.storeValue = v))
        .catch((e) => {
          throw e;
        });
    }
  } else if (isPrimitive(initialValue)) {
    internals.storeValue = initialValue;
  } else {
    throw new Error(
      `Unexpected initial value. ${JSON.stringify(initialValue)}`
    );
  }
}

function createSelectors<
  TStoreValue extends StoreValue,
  TSelector extends SelectorType<TStoreValue, any>,
  TMutation extends MutationResultFunction<TStoreValue, any>,
  TSelectors extends Record<string, SelectorType<TStoreValue, TSelector>>,
  TMutations extends Record<string, MutationType<TStoreValue, any, TMutation>>,
>(
  internals: StoreInternal<
    TStoreValue,
    TSelector,
    TMutation,
    TSelectors,
    TMutations
  >,
  entries: Array<[string, TSelector]>
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
          enumerable: true,
        },
      }),
      {}
    )
  );
}

function createMutations<
  TStoreValue extends StoreValue,
  TSelector extends SelectorType<TStoreValue, any>,
  TMutation extends MutationResultFunction<TStoreValue, any>,
  TSelectors extends Record<string, SelectorType<TStoreValue, TSelector>>,
  TMutations extends Record<string, MutationType<TStoreValue, any, TMutation>>,
>(
  internals: StoreInternal<
    TStoreValue,
    TSelector,
    TMutation,
    TSelectors,
    TMutations
  >,
  entries: Array<
    [
      mutationKey: string,
      mutation: (...storeOpts: TODO) => (...args: TODO) => TODO,
    ]
  >
): TODO {
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
          enumerable: true,
        },
      }),
      {}
    )
  );
}
