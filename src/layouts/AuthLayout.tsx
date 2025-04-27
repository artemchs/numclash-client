import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Asterisk } from "lucide-react";

export function AuthLayout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="h-[100dvh] w-[100dvw] bg-background flex items-center justify-center p-4">
      <div className="flex flex-col gap-6 items-center justify-center">
        <div className="flex items-center gap-2">
          <Asterisk className="h-8 w-8 text-primary" />
          <h1 className="font-bold text-3xl">numclash</h1>
        </div>
        <Card className="min-w-sm">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
