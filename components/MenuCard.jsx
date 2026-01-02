"use client";

export default function MenuCard({ title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start justify-between p-6 sm:p-8 bg-card border rounded-xl hover:shadow-md hover:border-primary transition-all duration-200 text-left w-full"
    >
      <div className="space-y-2 w-full">
        <h3 className="text-lg sm:text-xl font-bold text-foreground">
          {title}
        </h3>

        <p className="text-sm sm:text-base text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-4 text-primary font-semibold text-sm">
        Lihat Selengkapnya →
      </div>
    </button>
  );
}
