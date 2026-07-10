import { beforeEach, describe, expect, it } from "vitest";
import { useConfigStore } from "@/stores/configStore";

describe("configStore.toQuestionConfig", () => {
  beforeEach(() => {
    useConfigStore.setState({
      operations: { add: true, subtract: true, multiply: true, divide: true },
      numberTypes: { integer: true, decimal: false, fraction: false },
      questionType: "open",
      mcqChoiceCount: 4,
    });
  });

  it("includes all integer operations when integer is the only active number type", () => {
    const config = useConfigStore.getState().toQuestionConfig();
    expect(config.activeOperations.sort()).toEqual(["integer-add-sub", "integer-divide", "integer-multiply"].sort());
  });

  it("excludes add-sub when both add and subtract are toggled off", () => {
    useConfigStore.setState({ operations: { add: false, subtract: false, multiply: true, divide: false } });
    const config = useConfigStore.getState().toQuestionConfig();
    expect(config.activeOperations).toEqual(["integer-multiply"]);
  });

  it("maps fraction 'divide' to fraction-conversion (no dedicated fraction-divide generator)", () => {
    useConfigStore.setState({
      numberTypes: { integer: false, decimal: false, fraction: true },
      operations: { add: false, subtract: false, multiply: false, divide: true },
    });
    const config = useConfigStore.getState().toQuestionConfig();
    expect(config.activeOperations).toEqual(["fraction-conversion"]);
  });

  it("combines multiple active number types", () => {
    useConfigStore.setState({ numberTypes: { integer: true, decimal: true, fraction: false } });
    const config = useConfigStore.getState().toQuestionConfig();
    expect(config.activeOperations).toContain("integer-add-sub");
    expect(config.activeOperations).toContain("decimal-add-sub");
  });

  it("produces an empty activeOperations list when everything is off", () => {
    useConfigStore.setState({
      numberTypes: { integer: false, decimal: false, fraction: false },
    });
    const config = useConfigStore.getState().toQuestionConfig();
    expect(config.activeOperations).toEqual([]);
  });

  it("only sets mcqChoiceCount when questionType is mcq", () => {
    useConfigStore.setState({ questionType: "open" });
    expect(useConfigStore.getState().toQuestionConfig().mcqChoiceCount).toBeUndefined();
    useConfigStore.setState({ questionType: "mcq", mcqChoiceCount: 5 });
    expect(useConfigStore.getState().toQuestionConfig().mcqChoiceCount).toBe(5);
  });

  it("threads addSubMode through from the operation toggles", () => {
    useConfigStore.setState({ operations: { add: true, subtract: false, multiply: false, divide: false } });
    expect(useConfigStore.getState().toQuestionConfig().addSubMode).toEqual({ add: true, subtract: false });
  });
});
