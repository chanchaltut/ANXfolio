import { MotionEngine } from "@/components/MotionEngine";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://i.ytimg.com" />
      <a className="skip" href="#main">
        Skip to content
      </a>
      {children}
      <div className="cursor" aria-hidden="true" />
      <MotionEngine />
    </>
  );
}
