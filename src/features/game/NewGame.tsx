import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, PiIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosClient } from "@/api/client";
import type { AxiosError } from "axios";
import { toast } from "sonner";

export function NewGame() {
  const [email, setEmail] = useState("");
  const [type, setType] = useState("ARITHMETICS");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await axiosClient.post("/games", {
        player2Email: email,
        questionsType: type,
      });
      return response.data;
    },
    onError: (error: AxiosError) => {
      let errorMessage = "An error occurred";
      if (
        error.response?.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    },
    onSuccess: (data) => {
      console.log("Game created successfully");
      console.log(data);
    },
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>New Game</CardTitle>
        <CardDescription>
          Start a new game by selecting the opponent and questions type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Opponent's email address</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              placeholder="nome.cognome@fermielearning.it"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Type</Label>
            <Select onValueChange={setType} defaultValue={type}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue placeholder="Arithmetics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ARITHMETICS">Arithmetics</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!email || isPending}
          onClick={() => mutate()}
        >
          {isPending ? (
            <Loader className="h-4 w-4 mr-2" />
          ) : (
            <PiIcon className="h-4 w-4 mr-2" />
          )}
          Start
        </Button>
      </CardFooter>
    </Card>
  );
}
