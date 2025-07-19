import { AsyncIterableSequencer } from "@/index";

describe("AsyncIterableSequencer", () => {
  it("should sequence syncronous and asyncronous data", async () => {
    const sequencer = new AsyncIterableSequencer<number>();
    sequencer.push([0].values());
    sequencer.push([1, 2, 3].values());
    sequencer.push([4, 5, 6].values());
    setTimeout(() => {
      sequencer.push(delayGenerator(13, 14, 15));
    }, 1);
    sequencer.push(delayGenerator(7, 8, 9));
    sequencer.push(delayGenerator(10, 11, 12));
    sequencer.push(null);
    let index = 0;
    await expect(sequencer.next()).resolves.toEqual({
      done: false,
      value: 0,
    });
    for await (const item of sequencer) {
      expect(item).toEqual(++index);
    }
  });
  it("should not block streams", async () => {
    const sequencer = new AsyncIterableSequencer<number>();
    let timeIndex = 0;
    let maxTime = 0;
    for (let index = 0; index < 10; index++) {
      const timing: number[] = new Array<number>(10).fill(0).map(() => timeIndex++);
      sequencer.push(new DelayStream(...timing));
      maxTime = timing.reduce((total, value) => total + value, 0);
    }
    sequencer.push(null);
    let testIndex = 0;
    const startTime = Date.now();
    for await (const item of sequencer) {
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
