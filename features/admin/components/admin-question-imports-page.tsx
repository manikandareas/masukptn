"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import {
  QuestionImportForm,
  QuestionImportList,
} from "@/features/admin/components";
import { useQuestionImports } from "@/features/admin/hooks/use-question-imports";
import {
  useCreateQuestionImport,
  useProcessQuestionImport,
} from "@/features/admin/hooks/use-question-import-mutations";
import { useAdminExams } from "@/features/admin/hooks/use-question-sets";
import { useAdminSubtests } from "@/features/admin/hooks/use-questions";
import type { QuestionImportFilters } from "@/features/admin/types";

const DEFAULT_LIMIT = 20;

export function AdminQuestionImportsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<QuestionImportFilters>({
    limit: DEFAULT_LIMIT,
    offset: 0,
  });

  const { data, isLoading, error } = useQuestionImports(filters);
  const { data: exams = [] } = useAdminExams();
  const { data: subtests = [] } = useAdminSubtests();

  const createImport = useCreateQuestionImport();
  const processImport = useProcessQuestionImport();

  const imports = data?.imports ?? [];
  const total = data?.total ?? 0;
  const currentPage = Math.floor((filters.offset ?? 0) / DEFAULT_LIMIT) + 1;
  const totalPages = Math.ceil(total / DEFAULT_LIMIT);

  const handlePageChange = (page: number) => {
    setFilters((previous) => ({
      ...previous,
      offset: (page - 1) * DEFAULT_LIMIT,
    }));
  };

  const handleCreateImport = async (formData: FormData) => {
    try {
      const created = await createImport.mutateAsync(formData);
      processImport.mutate(created.id);
      toast.success("Import created. Processing started.");
      router.push(`/admin/imports/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create import");
    }
  };

  const handleRowClick = (id: string) => {
    router.push(`/admin/imports/${id}`);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            OCR_IMPORT
          </p>
          <h1 className="text-2xl font-semibold">Import from PDF</h1>
          <p className="text-sm text-muted-foreground">
            Upload PDF, run OCR, and generate questions with AI before review.
          </p>
        </header>

        <Card>
          <CardContent className="py-5">
            <QuestionImportForm
              exams={exams}
              subtests={subtests}
              onSubmit={handleCreateImport}
              isSubmitting={createImport.isPending}
            />
          </CardContent>
        </Card>

        {error ? (
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="py-4 text-xs text-destructive">
              Failed to load imports. Please try again.
            </CardContent>
          </Card>
        ) : null}

        <QuestionImportList
          imports={imports}
          isLoading={isLoading}
          onRowClick={handleRowClick}
        />

        {totalPages > 1 ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(filters.offset ?? 0) + 1} to{" "}
              {Math.min((filters.offset ?? 0) + DEFAULT_LIMIT, total)} of {total} imports
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
