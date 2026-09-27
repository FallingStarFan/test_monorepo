import Link from 'next/link';

const links = [
  { label: '首頁', href: '/' },
  { label: '隱私權政策', href: '/legal/privacy' },
  { label: '服務條款', href: '/legal/terms' },
];

export function FooterBase() {
  return (
    <footer className="border-t border-border bg-background text-foreground">
      <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* 左欄 */}
          <div>
            <Link href="/" className="text-lg font-semibold hover:opacity-80">
              <img
                src="/logo-full.png"
                alt="星凡工作室"
                className="h-20 w-auto hover:opacity-80"
              />
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              用想法與技術，打造好用的產品。
            </p>
          </div>

          {/* 中欄 */}
          <nav aria-label="頁尾導覽" className="md:justify-self-center">
            <h2 className="text-sm font-semibold">網站連結</h2>
            <ul className="mt-3 space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 右欄：之後可以放聯絡方式或社群連結 */}
          <div className="md:justify-self-end" />
        </div>
      </div>
    </footer>
  );
}