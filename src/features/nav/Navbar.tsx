import { Link } from "@tanstack/react-router";
import { LogOutIcon, MessageCircle, Pi } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  return (
    <nav className="flex w-full items-center justify-between py-4 px-8">
      <Link to="/">
        <Pi className="h-8 w-8 text-primary" />
      </Link>
      <UserMenu />
    </nav>
  );
}

function UserMenu() {
  const user = useAuthStore((state) => state.user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer h-8 w-8">
          <AvatarImage src={user?.image} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user?.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to="/invites">
          <DropdownMenuItem>
            <MessageCircle className="h-4 w-4 mr-2" />
            Invites
          </DropdownMenuItem>
        </Link>
        <Link to="/logout">
          <DropdownMenuItem variant="destructive">
            <LogOutIcon className="h-4 w-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
