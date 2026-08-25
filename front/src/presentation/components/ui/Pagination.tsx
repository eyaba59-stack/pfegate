"use client";

import Icon from "@/presentation/components/ui/Icon";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PageButton({
  page,
  active,
  onClick,
  children,
  disabled,
}: {
  page?: number;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  disabled?: boolean;
}) {
  const base =
    "flex h-8 w-8 items-center justify-center rounded text-body-sm font-medium transition-colors";
  const cls = active
    ? `${base} bg-secondary text-on-secondary`
    : `${base} border border-outline-variant text-on-surface hover:bg-surface-container-high disabled:opacity-50`;

  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled ?? active}>
      {children}
    </button>
  );
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: Array<number | "…"> = [];
  const pushWindow = () => {
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  };
  pushWindow();

  return (
    <div className="flex items-center gap-2">
      <PageButton
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <Icon name="chevron_left" className="text-sm" />
      </PageButton>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-1 text-on-surface-variant">
            ...
          </span>
        ) : (
          <PageButton
            key={p}
            page={p}
            active={p === currentPage}
            onClick={() => onPageChange(p)}
          >
            {p}
          </PageButton>
        )
      )}

      <PageButton disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <Icon name="chevron_right" className="text-sm" />
      </PageButton>
    </div>
  );
}
