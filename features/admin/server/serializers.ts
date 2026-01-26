import "server-only";

type WithDates = {
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

type NormalizedDates<T extends WithDates> = Omit<T, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string | null;
};

function toIso(value: Date | string | null | undefined): string | null | undefined {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  return value.toISOString();
}

export function serializeExam(exam: { id: string; code: string; name: string }) {
  return {
    id: exam.id,
    code: exam.code,
    name: exam.name,
  };
}

export function serializeSubtest(subtest: { id: string; code: string; name: string; examId: string }) {
  return {
    id: subtest.id,
    code: subtest.code,
    name: subtest.name,
    examId: subtest.examId,
  };
}

export function serializeSubtestWithExam(params: {
  subtest: { id: string; code: string; name: string; examId: string } & WithDates;
  exam: { id: string; code: string; name: string } & WithDates;
}) {
  return {
    id: params.subtest.id,
    code: params.subtest.code,
    name: params.subtest.name,
    examName: params.exam.name,
    exam: serializeExam(params.exam),
  };
}

export function serializeQuestion<T extends WithDates & { id: string }>(question: T): NormalizedDates<T> {
  const { createdAt, updatedAt, ...rest } = question;
  const createdAtIso = toIso(createdAt);
  if (!createdAtIso) {
    throw new Error("Missing createdAt timestamp");
  }

  return {
    ...rest,
    createdAt: createdAtIso,
    updatedAt: toIso(updatedAt) ?? null,
  } as NormalizedDates<T>;
}

export function serializeQuestionWithSubtest<
  TQuestion extends WithDates & { id: string },
  TSubtest extends WithDates & { id: string; code: string; name: string; examId: string },
>(params: { question: TQuestion; subtest: TSubtest }) {
  const questionWithoutSubtest = { ...params.question } as TQuestion & { subtest?: unknown };
  delete questionWithoutSubtest.subtest;

  const serializedQuestion = serializeQuestion(questionWithoutSubtest);
  return {
    ...serializedQuestion,
    subtest: serializeSubtest(params.subtest),
  } as Omit<NormalizedDates<TQuestion>, "subtest"> & {
    subtest: ReturnType<typeof serializeSubtest>;
  };
}

export function serializeQuestionSet<T extends WithDates & { id: string }>(
  questionSet: T,
): NormalizedDates<T> {
  const { createdAt, updatedAt, ...rest } = questionSet;
  const createdAtIso = toIso(createdAt);
  if (!createdAtIso) {
    throw new Error("Missing createdAt timestamp");
  }

  return {
    ...rest,
    createdAt: createdAtIso,
    updatedAt: toIso(updatedAt) ?? null,
  } as NormalizedDates<T>;
}
