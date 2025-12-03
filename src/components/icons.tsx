import type { SVGProps } from "react";

export const Icons = {
  ModishLogo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 2L18 2" />
      <path d="M12 2V22" />
      <path d="M8 22H16" />
      <path d="M12 12L18 7" />
      <path d="M12 12L6 7" />
    </svg>
  ),
};
