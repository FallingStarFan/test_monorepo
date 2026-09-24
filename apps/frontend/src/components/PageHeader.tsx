interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-lg opacity-90">{subtitle}</p>
        )}
      </div>
    </header>
  );
}