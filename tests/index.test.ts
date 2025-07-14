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
