import { Link } from "react-router-dom";
import { Eyebrow } from "@/components/ui/Badge";

interface ErrorPageProps {
  code: number;
  title: string;
  message: string;
}

function ErrorPage({ code, title, message }: ErrorPageProps) {
  return (
    <div className="mx-auto max-w-md py-16 text-center sm:py-24">
      <p className="text-5xl font-extrabold tracking-tight text-ink">{code}</p>
      <Eyebrow className="mt-3">{title}</Eyebrow>
      <p className="mt-3 text-body">{message}</p>
      <Link to="/" className="ui-button ui-button-primary mt-7">
        Go to home
      </Link>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <ErrorPage
      code={404}
      title="Page not found"
      message="The page you're looking for doesn't exist or has been moved."
    />
  );
}

export function UnauthorizedPage() {
  return (
    <ErrorPage
      code={403}
      title="Access denied"
      message="You don't have permission to view this page."
    />
  );
}
