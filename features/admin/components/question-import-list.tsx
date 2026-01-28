"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type QuestionImportListItem = {
  id: string;
  sourceFilename: string;
  draftName?: string | null;
  status: "queued" | "processing" | "ready" | "failed" | "saved";
  createdAt: Date | string;
  processedAt?: Date | string | null;
  savedAt?: Date | string | null;
  questionCount?: number;
  exam?: {
    id: string;
    code: string;
    name: string;
  } | null;
  subtest?: {
    id: string;
    code: string;
    name: string;
  } | null;
};

interface QuestionImportListProps {
  imports: QuestionImportListItem[];
  isLoading?: boolean;
  onRowClick?: (id: string) => void;
}

const statusVariant: Record<QuestionImportListItem["status"], "default" | "secondary" | "outline" | "destructive"> = {
  queued: "outline",
  processing: "secondary",
  ready: "default",
  failed: "destructive",
  saved: "secondary",
};

export function QuestionImportList({
  imports,
  isLoading,
  onRowClick,
}: QuestionImportListProps) {
  const router = useRouter();

  const handleRowClick = (id: string) => {
    if (onRowClick) {
      onRowClick(id);
      return;
    }
    router.push(`/admin/imports/${id}`);
  };

  if (isLoading) {
    return <QuestionImportListSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      {imports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border/60 bg-muted/20 py-10">
          <p className="text-xs text-muted-foreground">No imports yet</p>
        </div>
      ) : (
        <div className="border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>File</TableHead>
                <TableHead>Question Set</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Subtest</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imports.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(item.id)}
                >
                  <TableCell className="text-[11px] font-mono">
                    {item.sourceFilename}
                  </TableCell>
                  <TableCell className="text-[11px]">
                    {item.draftName || "—"}
                  </TableCell>
                  <TableCell>
                    {item.exam ? (
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {item.exam.code}
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.subtest ? (
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {item.subtest.code}
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 text-[10px] font-medium bg-muted/50 rounded">
                      {item.questionCount ?? 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[item.status]} className="text-[10px]">
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {format(new Date(item.createdAt), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function QuestionImportListSkeleton() {
  return (
    <div className="border border-border/60">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>File</TableHead>
            <TableHead>Question Set</TableHead>
            <TableHead>Exam</TableHead>
            <TableHead>Subtest</TableHead>
            <TableHead className="text-center">Questions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-12" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-12" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-5 w-8 mx-auto" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
