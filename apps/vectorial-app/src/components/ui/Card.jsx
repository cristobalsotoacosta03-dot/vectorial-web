export default function Card({ children, className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}

Card.Header = function CardHeader({ children, className = '' }) {
  return <div className={`px-6 pt-6 ${className}`}>{children}</div>
}

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 border-t border-slate-100 dark:border-slate-800 ${className}`}>
      {children}
    </div>
  )
}
