function ErrorMessage({ title = 'Something went wrong', message, children }) {
  return (
    <div
      className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800"
      role="alert"
    >
      <p className="font-semibold">{title}</p>
      {message && <p className="mt-1 text-sm">{message}</p>}
      {children && <div className="mt-1 text-sm">{children}</div>}
    </div>
  )
}

export default ErrorMessage
