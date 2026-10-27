export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition" data-motion-enter="page">{children}</div>;
}
