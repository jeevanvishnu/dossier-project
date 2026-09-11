import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  id?: string;
}

export function Section({ children, className = "", containerClassName = "", id }: SectionProps) {
  return (
    <section id={id} className={`py-8 md:py-12 lg:py-14 ${className}`}>
      <div className={`max-w-[1560px] mx-auto px-4 md:px-6 lg:px-8 ${containerClassName}`}>
        {children}
      </div>
    </section>
  );
}
