export type AnyIterable<T> = AsyncIterable<T> | Iterable<T>;
export type Chainable<T> = AnyIterable<T> | null;
export type Chain<T> = (iterator: Chainable<T>) => void;
export interface AsyncIterableSequencerReturn<T> {
  sequence: AsyncGenerator<T>;
  chain: Chain<T>;
}

export function asyncIterableSequencer<T>(): AsyncIterableSequencerReturn<T> {
  const queue: Promise<Chainable<T>>[] = [];
  let resolver: Chain<T>;
  const next = () => {
    const { promise, resolve } = Promise.withResolvers<Chainable<T>>();
    queue.push(promise);
    resolver = (nextIterator) => {
      next();
      resolve(nextIterator);
    };
  };
  next();
  return {
    sequence: (async function* () {
      let iterator: Chainable<T> | undefined;
      while ((iterator = await queue.shift())) {
        yield* iterator;
      }
    })(),
    chain: (iterator) => {
      resolver(iterator);
    },
  };
}
