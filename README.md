# Async Iterable Sequencer

A TypeScript library for dynamically sequencing multiple async iterables implementing the relay pattern. Chain iterables to a sequencer and consume them in order as a single async iterable.

## Features

* **Dynamic composition**: Add iterables to the sequencer at runtime, even during consumption
* **Memory efficient**: O(1) memory usage during consumption, independent of data volume
* **Type-safe**: Seamless handling of both sync and async iterables
* **Sequential processing**: Iterables are consumed in the order they were chained
* **Broadly compatible**: Works with any async iterable including generators, arrays, and streams

## Installation

```bash
npm install async-iterable-buffer
```

```bash
yarn add async-iterable-buffer
```

## Usage

```typescript
import { AsyncIterableSequencer } from 'async-iterable-buffer';

const sequencer = new AsyncIterableSequencer<number>();

// Chain synchronous iterables
sequencer.chain([10, 20, 30].values());

// Chain asynchronous iterables
sequencer.chain(async function* () {
  yield 40;
  yield 50;
  yield 60;
}());

// Signal end of input
sequencer.chain(null);

// Consume all values in order
for await (const value of sequencer) {
  console.log(value); // 10, 20, 30, 40, 50, 60
}
```

### Behavior

The sequencer processes iterables in the order they were chained. Each iterable is fully consumed before moving to the next one. Both synchronous and asynchronous iterables are supported seamlessly and can be chained in any context.

## API Reference

### Exports

#### `asyncIterableSequencer<T>(): AsyncIterableSequencerReturn`

A class that sequences multiple iterables and exposes them as a single async iterable.

### Types

#### `AsyncIterableSequencerReturn`

Type signature of returned object. Includes the `sequence` generator and `chain` function for adding iterables to the `sequence` chain.

`sequence`: A generator that returns the chained iterable contents in order.

`chain`: Chains an iterable to the sequencer. Pass `null` to signal the end of input and end the sequence chain.

```typescript
interface AsyncIterableSequencerReturn<T> {
  sequence: AsyncGenerator<T>;
  chain: Chain<T>;
}
```

#### `AnyIterable<T>`

Type that accepts both sync and async iterables.

```typescript
type AnyIterable<T> = AsyncIterable<T> | Iterable<T>
```

#### `Chainable<T>`

Types that can be called on chain. `null` ends the chain.

```typescript
type Chainable<T> = AnyIterable<T> | null
```

#### `Chain<T>`

Function signature for the chain function.

```typescript
type Chain<T> = (iterator: Chainable<T>) => void;
```

## License

[MIT][license] © [Tim Etler][author]

[license]: LICENSE.md
[author]: https://github.com/etler
