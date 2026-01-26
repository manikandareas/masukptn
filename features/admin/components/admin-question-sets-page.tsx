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
import { QuestionSetFiltersComponent } from "@/features/admin/components/question-set-filters";
import { QuestionSetList } from "@/features/admin/components/question-set-list";
import {
  useAdminExams,
  useAdminQuestionSets,
  useAdminSubtestsForSets,
} from "@/features/admin/hooks/use-question-sets";
import type { QuestionSetFilters } from "@/features/admin/types";

const DEFAULT_LIMIT = 20;

export function AdminQuestionSetsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<QuestionSetFilters>({
    limit: DEFAULT_LIMIT,
    offset: 0,
  });

  const { data, isLoading, error } = useAdminQuestionSets(filters);
  const { data: exams = [], isLoading: examsLoading } = useAdminExams();
  const { data: subtests = [], isLoading: subtestsLoading } = useAdminSubtestsForSets();

  const questionSets = data?.questionSets ?? [];
  const total = data?.total ?? 0;
  const currentPage = Math.floor((filters.offset ?? 0) / DEFAULT_LIMIT) + 1;
  const totalPages = Math.ceil(total / DEFAULT_LIMIT);

  const handleFiltersChange = (nextFilters: QuestionSetFilters) => {
    setFilters(nextFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((previous) => ({
      ...previous,
      offset: (page - 1) * DEFAULT_LIMIT,
    }));
  };

  const handleRowClick = (questionSetId: string) => {
    router.push(`/admin/question-sets/${questionSetId}`);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            QUESTION_SET_MANAGEMENT
          </p>
          <h1 className="text-2xl font-semibold">Question Sets</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit, and manage curated question sets for practice.
          </p>
        </header>

        {error ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-xs text-destructive">
              Failed to load question sets. Please try again.
            </CardContent>
          </Card>
        ) : null}

        <QuestionSetFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          exams={exams}
          subtests={subtests}
          isLoading={examsLoading || subtestsLoading}
        />

        <QuestionSetList
          questionSets={questionSets}
          isLoading={isLoading}
          filters={filters}
          onRowClick={handleRowClick}
        />

        {totalPages > 1 ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(filters.offset ?? 0) + 1} to {Math.min((filters.offset ?? 0) + DEFAULT_LIMIT, total)} of {total}{" "}
              question sets
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
