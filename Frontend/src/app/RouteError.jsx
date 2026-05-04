import { Link, useRouteError } from "react-router-dom";

const RouteError = () => {
  const error = useRouteError();
  const message = error?.message || error?.statusText || "Something went wrong.";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section style={{ maxWidth: 520, width: "100%", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Unable to load this page</h1>
        <p>{message}</p>
        <Link to="/login">Go to login</Link>
      </section>
    </main>
  );
};

export default RouteError;
