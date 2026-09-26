interface CardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function ContentCard({ title, description, children }: CardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}