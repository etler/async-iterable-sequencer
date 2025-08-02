import { asyncIterableSequencer } from "@/index";

describe("asyncIterableSequencer", () => {
  it("should sequence syncronous and asyncronous data", async () => {
    const { sequence, chain } = asyncIterableSequencer<number>();
    chain([0].values());
    chain([1, 2, 3].values());
    chain([4, 5, 6].values());
    setTimeout(() => {
      chain(delayGenerator(13, 14, 15));
    }, 1);
    chain(delayGenerator(7, 8, 9));
    chain(delayGenerator(10, 11, 12));
    chain(null);
    let index = 0;
    await expect(sequence.next()).resolves.toEqual({
      done: false,
      value: 0,
    });
    for await (const item of sequence) {
      expect(item).toEqual(++index);
    }
  });
  it("should not block streams", async () => {
    const { sequence, chain } = asyncIterableSequencer<number>();
    let timeIndex = 0;
    let maxTime = 0;
    for (let index = 0; index < 10; index++) {
      const timing: number[] = new Array<number>(10).fill(0).map(() => timeIndex++);
      chain(new DelayStream(...timing));
      maxTime = timing.reduce((total, value) => total + value, 0);
    }
    chain(null);
    let testIndex = 0;
    const startTime = Date.now();
    for await (const item of sequence) {
      expect(item).toEqual(testIndex++);
    }
    const totalTime = Date.now() - startTime;
    expect(totalTime / maxTime).toBeLessThan(1.1);
  });
});

async function* delayGenerator(...values: number[]) {
  for (const value of values) {
    yield new Promise<number>((resolve) =>
      setTimeout(() => {
        resolve(value);
      }, value),
    );
  }
}

class DelayStream extends ReadableStream<number> {
  constructor(...values: number[]) {
    const delayIterator = delayGenerator(...values);
    super({
      async start(controller) {
        for await (const value of delayIterator) {
          controller.enqueue(value);
        }
        controller.close();
      },
    });
  }
}
