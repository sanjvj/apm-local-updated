import type { ReactNode, FC } from 'react';

export interface LayoutProps {
  children: ReactNode;
  isWide?: boolean;
  className?: string;
  containerClassName?: string;
}

export const Layout: FC<LayoutProps> = ({
  children,
  className = '',
  containerClassName = '',
}) => {
  return (
    <div className={`min-h-screen w-full bg-[var(--ivory)] text-[var(--mahogany)] flex flex-col antialiased ${containerClassName}`}>
      <main className={`w-full flex-1 flex flex-col ${className}`}>
        {children}
      </main>
    </div>
  );
};
