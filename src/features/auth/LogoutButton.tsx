import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { LogOutIcon } from "lucide-react";

export function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  return (
    <Button className="w-full" variant="destructive" onClick={handleLogout}>
      <LogOutIcon className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
}
