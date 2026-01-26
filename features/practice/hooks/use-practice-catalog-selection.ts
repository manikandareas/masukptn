"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  PracticeCatalog,
  PracticeCatalogSearch,
  PracticeCatalogSelection,
  PracticeCatalogTreeNode,
} from "@/features/practice/types";

const parsePracticeCatalogNodeId = (nodeId: string): PracticeCatalogSelection => {
  const [kind, examCode, subtestCode] = nodeId.split(":");
  if (kind === "subtest") {
    return { examCode: examCode ?? "", subtestCode: subtestCode ?? null };
  }
  if (kind === "exam") {
    return { examCode: examCode ?? "", subtestCode: null };
  }
  return { examCode: "", subtestCode: null };
};

const buildPracticeCatalogTree = (catalog: PracticeCatalog): PracticeCatalogTreeNode[] =>
  catalog.exams.map((exam) => {
    const subtestsById = new Map<
      string,
      NonNullable<(typeof exam.questionSets)[number]["subtest"]>
    >();

    exam.questionSets.forEach((set) => {
      if (set.subtest) {
        subtestsById.set(set.subtest.id, set.subtest);
      }
    });

    const subtests = Array.from(subtestsById.values()).sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });

    const examCode = exam.code ?? exam.id;

    return {
      id: `exam:${examCode}`,
      name: exam.name,
      type: "exam" as const,
      children: subtests.map((subtest) => ({
        id: `subtest:${examCode}:${subtest.code ?? subtest.id}`,
        name: subtest.name,
        type: "subtest" as const,
      })),
    };
  });

type UsePracticeCatalogSelectionArgs = {
  catalog?: PracticeCatalog;
  search: PracticeCatalogSearch;
};

export function usePracticeCatalogSelection({
  catalog,
  search,
}: UsePracticeCatalogSelectionArgs) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearch = useCallback(
    (next: PracticeCatalogSearch, options?: { replace?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.exam) {
        params.set("exam", next.exam);
      } else {
        params.delete("exam");
      }

      if (next.subtest) {
        params.set("subtest", next.subtest);
      } else {
        params.delete("subtest");
      }

      const query = params.toString();
      const href = query ? `${pathname}?${query}` : pathname;

      if (options?.replace) {
        router.replace(href);
        return;
      }

      router.push(href);
    },
    [pathname, router, searchParams],
  );

  const defaultExamCode = useMemo(() => {
    if (!catalog?.exams.length) return "";
    const utbkExam = catalog.exams.find((exam) => {
      const examCode = exam.code?.toLowerCase();
      if (examCode === "utbk") return true;
      return exam.name.toLowerCase().includes("utbk");
    });
    return (utbkExam ?? catalog.exams[0]).code ?? catalog.exams[0].id;
  }, [catalog]);

  useEffect(() => {
    if (!catalog?.exams.length || !defaultExamCode) return;

    const exam = search.exam
      ? catalog.exams.find((item) => item.code === search.exam || item.id === search.exam)
      : null;

    if (!search.exam || !exam) {
      updateSearch(
        {
          exam: defaultExamCode,
          subtest: undefined,
        },
        { replace: true },
      );
      return;
    }

    if (search.subtest) {
      const hasSubtest = exam.questionSets.some(
        (set) => set.subtest?.code === search.subtest || set.subtest?.id === search.subtest,
      );
      if (!hasSubtest) {
        updateSearch(
          {
            exam: exam.code ?? exam.id,
            subtest: undefined,
          },
          { replace: true },
        );
      }
    }
  }, [catalog, defaultExamCode, search.exam, search.subtest, updateSearch]);

  const treeData = useMemo(() => (catalog ? buildPracticeCatalogTree(catalog) : []), [catalog]);

  const selection = useMemo(
    () => ({
      examCode: search.exam ?? defaultExamCode,
      subtestCode: search.exam ? search.subtest ?? null : null,
    }),
    [defaultExamCode, search.exam, search.subtest],
  );

  const activeExam = useMemo(() => {
    if (!catalog || !selection.examCode) return null;
    return (
      catalog.exams.find((exam) => exam.code === selection.examCode || exam.id === selection.examCode) ??
      null
    );
  }, [catalog, selection.examCode]);

  const activeSubtest = useMemo(() => {
    if (!selection.subtestCode || !activeExam) return null;
    return (
      activeExam.questionSets.find(
        (set) => set.subtest?.code === selection.subtestCode || set.subtest?.id === selection.subtestCode,
      )?.subtest ?? null
    );
  }, [activeExam, selection.subtestCode]);

  const visibleSets = useMemo(() => {
    if (!activeExam) return [];
    if (!selection.subtestCode) return activeExam.questionSets;
    return activeExam.questionSets.filter(
      (set) => set.subtest?.code === selection.subtestCode || set.subtest?.id === selection.subtestCode,
    );
  }, [activeExam, selection.subtestCode]);

  const selectedNodeId = useMemo(() => {
    if (!selection.examCode) return "";
    if (selection.subtestCode) {
      return `subtest:${selection.examCode}:${selection.subtestCode}`;
    }
    return `exam:${selection.examCode}`;
  }, [selection.examCode, selection.subtestCode]);

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      const nextSelection = parsePracticeCatalogNodeId(nodeId);
      if (!nextSelection.examCode) return;

      const nextSearch: PracticeCatalogSearch = {
        exam: nextSelection.examCode,
        subtest: nextSelection.subtestCode ?? undefined,
      };

      if (nextSearch.exam === search.exam && nextSearch.subtest === search.subtest) {
        return;
      }

      updateSearch(nextSearch);
    },
    [search.exam, search.subtest, updateSearch],
  );

  return {
    treeData,
    selectedNodeId,
    activeExam,
    activeSubtest,
    visibleSets,
    handleSelectNode,
  };
}
