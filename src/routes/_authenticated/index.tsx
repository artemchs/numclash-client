import { axiosClient } from "@/api/client";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["/users/me"],
    queryFn: () => axiosClient.get("/users/me"),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error fetching user data!</div>; // More specific error
  }

  // Display user data or a message if data is not as expected
  return (
    <div>
      <h1>Welcome!</h1>
      <pre>{JSON.stringify(data?.data, null, 2)}</pre>
    </div>
  );
}
