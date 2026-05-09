export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-neutral-400 sm:flex-row sm:items-center">
        <p>&copy; {year} Web Projects Gallery</p>
        <nav className="flex items-center gap-5">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-white"
          >
            GitHub
          </a>
          <a
            href="mailto:hello@example.com"
            className="transition hover:text-white"
          >
            Email
          </a>
        </nav>
      </div>
    </footer>
  );
}
