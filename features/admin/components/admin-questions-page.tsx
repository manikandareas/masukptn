"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { QuestionFiltersComponent } from "@/features/admin/components/question-filters";
import { QuestionList } from "@/features/admin/components/question-list";
import { useAdminQuestions, useAdminSubtests } from "@/features/admin/hooks/use-questions";
import type { QuestionFilters } from "@/features/admin/types";

const DEFAULT_LIMIT = 20;

export function AdminQuestionsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<QuestionFilters>({
    limit: DEFAULT_LIMIT,
    offset: 0,
  });

  const { data, isLoading, error } = useAdminQuestions(filters);
  const { data: subtests = [], isLoading: subtestsLoading } = useAdminSubtests();

  const questions = (data?.questions ?? []).map((question) => ({
    ...question,
    difficulty: question.difficulty ?? "medium",
  }));
  const total = data?.total ?? 0;
  const currentPage = Math.floor((filters.offset ?? 0) / DEFAULT_LIMIT) + 1;
  const totalPages = Math.ceil(total / DEFAULT_LIMIT);

  const handleFiltersChange = (nextFilters: QuestionFilters) => {
    setFilters(nextFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((previous) => ({
      ...previous,
      offset: (page - 1) * DEFAULT_LIMIT,
    }));
  };

  const handleRowClick = (questionId: string) => {
    router.push(`/admin/questions/${questionId}`);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            QUESTION_MANAGEMENT
          </p>
          <h1 className="text-2xl font-semibold">Questions</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage questions in the question bank.
          </p>
        </header>

        {error ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-xs text-destructive">
              Failed to load questions. Please try again.
            </CardContent>
          </Card>
        ) : null}

        <QuestionFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          subtests={subtests}
          isLoading={subtestsLoading}
        />

        <QuestionList
          questions={questions}
          isLoading={isLoading}
          filters={filters}
          onRowClick={handleRowClick}
        />

        {totalPages > 1 ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(filters.offset ?? 0) + 1} to {Math.min((filters.offset ?? 0) + DEFAULT_LIMIT, total)} of {total}{" "}
              questions
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = index + 1;
                  } else if (currentPage <= 3) {
                    pageNum = index + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + index;
                  } else {
                    pageNum = currentPage - 2 + index;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={pageNum === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          handlePageChange(pageNum);
                        }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    aria-disabled={currentPage === totalPages}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
