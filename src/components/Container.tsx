import type { FC, ReactNode } from 'react';

export interface ContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export const Container: FC<ContainerProps> = ({ children, className = '', id }) => {
  return (
    <div
      id={id}
      className={`
        w-full mx-auto
        px-5 sm:px-8 lg:px-12 min-[1440px]:px-16
        max-w-none sm:max-w-[720px] lg:max-w-[1080px] min-[1440px]:max-w-[1280px]
        ${className}
      `}
    >
      {children}
    </div>
  );
};
