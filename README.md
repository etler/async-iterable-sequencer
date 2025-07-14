# Async Iterable Sequencer

A TypeScript library for dynamically sequencing multiple async iterables implementing the relay pattern. Push iterables to a sequencer and consume them in order as a single async iterable.

## Features

* **Dynamic composition**: Add iterables to the sequencer at runtime, even during consumption
* **Memory efficient**: O(1) memory usage during consumption, independent of data volume
* **Type-safe**: Seamless handling of both sync and async iterables
* **Sequential processing**: Iterables are consumed in the order they were pushed
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

// Push synchronous iterables
sequencer.push([10, 20, 30].values());

// Push asynchronous iterables
sequencer.push(async function* () {
  yield 40;
  yield 50;
  yield 60;
}());

// Signal end of input
sequencer.push(null);

// Consume all values in order
for await (const value of sequencer) {
  console.log(value); // 10, 20, 30, 40, 50, 60
}
```

### Behavior

The sequencer processes iterables in the order they were pushed. Each iterable is fully consumed before moving to the next one. Both synchronous and asynchronous iterables are supported seamlessly and can be pushed in any context.

## API Reference

### Exports

#### `AsyncIterableSequencer<T>`

A class that sequences multiple iterables and exposes them as a single async iterable.

### Types

#### `AnyIterable<T>`

Type that accepts both sync and async iterables.

```typescript
type AnyIterable<T> = AsyncIterable<T> | Iterable<T>
```

### Methods

#### `push(iterator: AnyIterable<T> | null): void`

Adds an iterable to the sequencer. Pass `null` to signal the end of input and close the sequencer.

#### `[Symbol.asyncIterator](): AsyncGenerator<T, void, unknown>`

The sequencer itself is an async iterable, allowing it to be used with `for await` loops.
