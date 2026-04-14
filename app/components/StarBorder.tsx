"use client";

import React from "react";

type StarBorderOwnProps = {
  className?: string;
  color?: string;
  speed?: string;
  children?: React.ReactNode;
};

type StarBorderProps<T extends React.ElementType = "button"> = {
  as?: T;
} & StarBorderOwnProps &
  Omit<React.ComponentPropsWithoutRef<T>, keyof StarBorderOwnProps | "as">;

export default function StarBorder<T extends React.ElementType = "button">({
  as,
  className = "",
  color = "white",
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T>) {
  const Component = (as ?? "button") as React.ElementType;

  return (
    <Component
      className={`star-border-outer ${className}`}
      style={
        {
          "--sb-color": color,
          "--sb-speed": speed,
        } as React.CSSProperties
      }
      {...props}
    >
      <span className="star-border-glow" />
      <span className="star-border-inner">{children}</span>
    </Component>
  );
}
