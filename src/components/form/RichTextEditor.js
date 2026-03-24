"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamic import to prevent SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return ({ forwardedRef, ...props }) => <RQ ref={forwardedRef} {...props} />;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] w-full animate-pulse rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800" />
    ),
  }
);

export default function RichTextEditor({ value, onChange }) {
  // Define toolbar modules
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["clean"],
      ],
    }),
    []
  );

  return (
    <div className="rich-text-editor-wrapper bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #d1d5db;
          background-color: #f9fafb;
        }
        .dark .ql-toolbar.ql-snow {
          border-bottom: 1px solid #374151;
          background-color: #1f2937;
        }
        .ql-container.ql-snow {
          border: none;
          min-height: 250px;
          font-size: 0.875rem;
        }
        .dark .ql-snow .ql-stroke {
          stroke: #9ca3af;
        }
        .dark .ql-snow .ql-fill {
          fill: #9ca3af;
        }
        .dark .ql-snow .ql-picker {
          color: #9ca3af;
        }
        .dark .ql-editor {
          color: #e5e7eb;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        placeholder="Enter product description..."
      />
    </div>
  );
}
