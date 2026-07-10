import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuestionConfig } from "@/lib/mathEngine/types";
import { useSessionStore } from "@/stores/sessionStore";

const recordSession = vi.fn();
vi.mock("@/stores/statsStore", () => ({
  useStatsStore: { getState: () => ({ recordSession }) },
}));

const CONFIG: QuestionConfig = { activeOperations: ["integer-add-sub"], questionType: "open" };

describe("sessionStore", () => {
  beforeEach(() => {
    recordSession.mockClear();
    useSessionStore.getState().reset();
  });

  it("starts a session in the countdown phase with a pre-generated question", () => {
    useSessionStore.getState().startSession(CONFIG, 60_000, null);
    const state = useSessionStore.getState();
    expect(state.status).toBe("countdown");
    expect(state.currentQuestion).not.toBeNull();
    expect(state.endsAt).toBeNull();
  });

  it("beginRunning transitions countdown -> running and starts the clock", () => {
    useSessionStore.getState().startSession(CONFIG, 60_000, null);
    useSessionStore.getState().beginRunning();
    const state = useSessionStore.getState();
    expect(state.status).toBe("running");
    expect(state.endsAt).not.toBeNull();
  });

  it("beginRunning is a no-op outside the countdown phase", () => {
    useSessionStore.getState().startSession(CONFIG, 60_000, null);
    useSessionStore.getState().beginRunning();
    const endsAtAfterFirstCall = useSessionStore.getState().endsAt;
    useSessionStore.getState().beginRunning();
    expect(useSessionStore.getState().endsAt).toBe(endsAtAfterFirstCall);
  });

  it("ends the session once the question limit is reached (count-first)", () => {
    useSessionStore.getState().startSession(CONFIG, 10 * 60_000, 2); // 10 min, 2 questions
    useSessionStore.getState().beginRunning();
    useSessionStore.getState().submitAnswer("wrong");
    expect(useSessionStore.getState().status).toBe("running");
    useSessionStore.getState().submitAnswer("also wrong");
    expect(useSessionStore.getState().status).toBe("finished");
    expect(useSessionStore.getState().result?.totalCount).toBe(2);
    expect(recordSession).toHaveBeenCalledTimes(1);
  });

  it("ends the session once the duration elapses (time-first)", () => {
    useSessionStore.getState().startSession(CONFIG, -1, 100); // already-expired duration, high question limit
    useSessionStore.getState().beginRunning();
    useSessionStore.getState().tick();
    expect(useSessionStore.getState().status).toBe("finished");
    expect(recordSession).toHaveBeenCalledTimes(1);
  });

  it("endSession is idempotent under a tick()/submitAnswer() race", () => {
    useSessionStore.getState().startSession(CONFIG, -1, 1);
    useSessionStore.getState().beginRunning();
    useSessionStore.getState().submitAnswer("x"); // hits the question limit, calls endSession
    useSessionStore.getState().tick(); // duration is also already expired
    expect(useSessionStore.getState().status).toBe("finished");
    expect(recordSession).toHaveBeenCalledTimes(1);
  });

  it("records correct/incorrect answers and computes the summary", () => {
    useSessionStore.getState().startSession(CONFIG, 60_000, 1);
    useSessionStore.getState().beginRunning();
    const question = useSessionStore.getState().currentQuestion!;
    useSessionStore.getState().submitAnswer(question.answer);
    const result = useSessionStore.getState().result!;
    expect(result.correctCount).toBe(1);
    expect(result.totalCount).toBe(1);
    expect(result.accuracy).toBe(1);
  });

  it("submitAnswer is a no-op during the countdown phase", () => {
    useSessionStore.getState().startSession(CONFIG, 60_000, 1);
    useSessionStore.getState().submitAnswer("x");
    expect(useSessionStore.getState().answeredLog.length).toBe(0);
    expect(useSessionStore.getState().status).toBe("countdown");
  });

  it("submitAnswer is a no-op once the session has finished", () => {
    useSessionStore.getState().startSession(CONFIG, 60_000, 1);
    useSessionStore.getState().beginRunning();
    useSessionStore.getState().submitAnswer("x");
    const answeredLogLength = useSessionStore.getState().answeredLog.length;
    useSessionStore.getState().submitAnswer("y");
    expect(useSessionStore.getState().answeredLog.length).toBe(answeredLogLength);
  });
});
