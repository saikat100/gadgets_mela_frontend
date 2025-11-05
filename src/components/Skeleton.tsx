"use client";
import React from "react";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`} />;
}

export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`animate-pulse bg-gray-200 dark:bg-gray-700 h-3 ${i !== lines - 1 ? "mb-2" : ""}`} />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40, className = "" }: { size?: number; className?: string }) {
  return <div className={`animate-pulse rounded-full bg-gray-200 dark:bg-gray-700`} style={{ width: size, height: size }} />;
}

export function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4">
      <Skeleton className="w-full h-40 rounded mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-10 w-1/2 rounded" />
        <Skeleton className="h-10 w-1/2 rounded" />
      </div>
    </div>
  );
}


