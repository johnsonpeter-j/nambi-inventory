"use client";

import { YarnCategory } from "./YarnCategoryForm";
import YarnCategoryCard from "./YarnCategoryCard";

interface YarnCategoryListProps {
  categories: YarnCategory[];
  loading: boolean;
  onEdit: (category: YarnCategory) => void;
  onDelete: (id: string) => void;
}

export default function YarnCategoryList({
  categories,
  loading,
  onEdit,
  onDelete,
}: YarnCategoryListProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
        <p className="text-slate-500 dark:text-[#92adc9]">Loading...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a232e] rounded-xl shadow-lg dark:shadow-none border border-slate-200 dark:border-[#324d67] p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-[#64748b] mb-4">
          category
        </span>
        <p className="text-slate-500 dark:text-[#92adc9] text-lg mb-2">
          No yarn categories found
        </p>
        <p className="text-slate-400 dark:text-[#64748b] text-sm">
          Click "Add Category" to create your first category
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <YarnCategoryCard
          key={category.id}
          category={category}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}


