import { useState, useEffect } from "react";
import { axiosClient } from "@/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useWebSocketConnection } from "@/hooks/useWebSocketConnection";
import { AxiosError } from "axios";

// Define expected types based on serverRouter.txt
interface Player {
  id: string;
  name: string;
}

interface MathQuestion {
  id: string;
  gameId: string;
  playerId: string;
  question: string;
  correctAnswer: string;
  answer?: string | null;
  score: number;
  status: "NOT_ANSWERED" | "ANSWERED";
  responseTimeMs?: number | null;
  createdAt: string; // Assuming ISO string format
  updatedAt: string; // Assuming ISO string format
}

interface GameDetails {
  id: string;
  player1Id: string;
  player2Id: string;
  status: "PENDING" | "IN_PROGRESS" | "PLAYER1_WON" | "PLAYER2_WON" | "DRAW";
  questionsType: string; // e.g., 'ARITHMETIC'
  winnerId?: string | null;
  startedAt: string;
  finishedAt?: string | null;
  player1: Player;
  player2: Player;
  questions: MathQuestion[]; // Included in the /games/:gameId response
  winner?: Player | null;
}

interface QuestionResponse {
  id: string;
  question: string;
  // Add other fields if the server returns more
}

interface AnswerResponse {
  roundFinished: boolean;
  gameFinished: boolean;
  // Include resultPayload if gameFinished is true
  gameId?: string;
  status?: GameDetails["status"];
  winner?: Player | null;
  player1?: Player & { score: number; time: number };
  player2?: Player & { score: number; time: number };
}

interface GameFinishedPayload extends AnswerResponse {
  gameFinished: true;
  gameId: string;
  status: GameDetails["status"];
  winner: Player | null;
  player1: Player & { score: number; time: number };
  player2: Player & { score: number; time: number };
}

export const Route = createFileRoute("/_authenticated/game/$gameId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { gameId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [answer, setAnswer] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [gameResult, setGameResult] = useState<GameFinishedPayload | null>(
    null
  );

  // --- WebSocket Connection ---
  const { lastMessage } = useWebSocketConnection({
    share: true, // Ensure singleton connection if used elsewhere
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastMessage?.data) {
      try {
        const message = JSON.parse(lastMessage.data as string);
        if (
          message.type === "GAME_FINISHED" &&
          message.payload?.gameId === gameId
        ) {
          console.log("Received GAME_FINISHED via WebSocket:", message.payload);
          setGameResult(message.payload as GameFinishedPayload);
          setIsWaiting(false); // Stop waiting if we receive the final result
          // Optionally invalidate game query to ensure data consistency
          queryClient.invalidateQueries({ queryKey: ["game", gameId] });
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    }
  }, [lastMessage, gameId, queryClient]);

  // --- Fetch Game Details ---
  const {
    data: gameDetails,
    isLoading: isLoadingGame,
    error: gameError,
  } = useQuery<GameDetails>({
    queryKey: ["game", gameId],
    queryFn: async () => {
      try {
        const response = await axiosClient.get(`/games/${gameId}`);
        return response.data.responseObject;
      } catch (error) {
        if (
          error instanceof AxiosError &&
          (error.response?.status === 403 || error.response?.status === 404)
        ) {
          navigate({ to: "/" }); // Redirect if not found or not participant
        }
        throw error; // Re-throw other errors
      }
    },
    refetchOnWindowFocus: false, // Avoid refetching game details too often
  });

  // --- Fetch Current Question ---
  // Assuming the server endpoint /games/:gameId/question now returns { id: string, question: string }
  const {
    data: currentQuestion,
    isLoading: isLoadingQuestion,
    error: questionError,
    refetch: refetchQuestion,
    isFetching: isFetchingQuestion,
  } = useQuery<QuestionResponse>({
    queryKey: ["game", gameId, "question"],
    queryFn: async () => {
      // This fetches the *next* available question for the user or creates one
      const response = await axiosClient.get(`/games/${gameId}/question`);
      // Assuming server now returns { id: '...', question: '...' } in responseObject
      return response.data.responseObject;
    },
    enabled:
      !!gameDetails &&
      !gameResult && // Don't fetch if game is finished
      !isWaiting && // Don't fetch if waiting for opponent
      (gameDetails.status === "IN_PROGRESS" ||
        gameDetails.status === "PENDING"), // Only fetch if game is active
    refetchOnWindowFocus: false,
    retry: 1, // Don't retry endlessly if question fetch fails
  });

  // --- Submit Answer Mutation ---
  const { mutate: submitAnswer, isPending: isSubmitting } = useMutation<
    AnswerResponse, // Expected success response type
    Error, // Expected error type
    { answer: string; questionId: string } // Variables type
  >({
    mutationFn: async ({ answer, questionId }) => {
      const response = await axiosClient.post(
        `/games/${gameId}/question/${questionId}/answer`,
        { answer }
      );
      return response.data.responseObject; // Assuming server wraps response
    },
    onSuccess: (data) => {
      console.log("Answer submitted successfully:", data);
      setAnswer(""); // Clear input field

      // Invalidate game details to get potentially updated status (e.g., PENDING -> IN_PROGRESS)
      queryClient.invalidateQueries({ queryKey: ["game", gameId] });

      if (data.gameFinished) {
        console.log("Game finished after submission:", data);
        // The server response includes the final results
        setGameResult(data as GameFinishedPayload);
        setIsWaiting(false);
      } else if (data.roundFinished) {
        console.log("Player finished rounds, waiting for opponent.");
        setIsWaiting(true);
        // No need to refetch question, player is done
      } else {
        console.log("Round finished, fetching next question.");
        // Game continues, refetch the next question
        queryClient.invalidateQueries({
          queryKey: ["game", gameId, "question"],
        });
        // refetchQuestion(); // Or trigger refetch directly
      }
    },
    onError: (error) => {
      console.error("Error submitting answer:", error);
      // TODO: Show error toast to user
    },
  });

  // --- Event Handlers ---
  const handleSubmit = () => {
    if (!currentQuestion?.id || !answer.trim() || isSubmitting || isWaiting) {
      console.log({
        message: "Invalid submission attempt",
        currentQuestionId: currentQuestion?.id,
        answer,
        isSubmitting,
        isWaiting,
      });
      return;
    }
    submitAnswer({ answer: answer.trim(), questionId: currentQuestion.id });
  };

  // --- UI Rendering Logic ---

  // Loading states
  if (isLoadingGame || (!gameDetails && !gameError)) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading game...</span>
      </div>
    );
  }

  // Error states
  if (gameError) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4 text-destructive">
        Error loading game details. Please try again later.
      </div>
    );
  }
  // Should not happen due to query error handling, but good practice
  if (!gameDetails) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        Game not found or you are not a participant.
      </div>
    );
  }

  // Game Finished State
  if (
    gameResult ||
    ["PLAYER1_WON", "PLAYER2_WON", "DRAW"].includes(gameDetails.status)
  ) {
    // Use gameResult if available (from WS or submission), otherwise use gameDetails for basic info
    const finalStatus = gameResult?.status ?? gameDetails.status;
    const finalWinner = gameResult?.winner ?? gameDetails.winner;
    const player1Result = gameResult?.player1;
    const player2Result = gameResult?.player2;

    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Game Over!</CardTitle>
            <CardDescription>
              Status: {finalStatus?.replace("_", " ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {finalWinner ? (
              <p>Winner: {finalWinner.name}</p>
            ) : (
              <p>It's a Draw!</p>
            )}
            {/* Display detailed scores and times if available from gameResult */}
            {player1Result && (
              <p>
                {gameDetails.player1.name}: Score {player1Result.score}, Time{" "}
                {player1Result.time}ms
              </p>
            )}
            {player2Result && (
              <p>
                {gameDetails.player2.name}: Score {player2Result.score}, Time{" "}
                {player2Result.time}ms
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate({ to: "/" })} className="w-full">
              Back to Lobby
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Waiting for Opponent State
  if (isWaiting) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Waiting for Opponent</CardTitle>
            <CardDescription>
              You have finished your questions. Waiting for your opponent to
              complete the game.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active Game State (Playing)
  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Your Question</CardTitle>
          <CardDescription>Type your answer and click Submit.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="border rounded-md p-4 flex items-center justify-center shadow-xs min-h-32 text-lg font-medium">
              {isLoadingQuestion || isFetchingQuestion ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : questionError ? (
                <span className="text-destructive">
                  Error loading question.
                </span>
              ) : currentQuestion ? (
                <span>{String(currentQuestion.question)}</span>
              ) : (
                <span>No question available yet.</span> // Should be brief
              )}
            </div>
            <Input
              placeholder="Your answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={
                isSubmitting ||
                isLoadingQuestion ||
                isFetchingQuestion ||
                !currentQuestion ||
                isWaiting ||
                !!gameResult
              }
              required
            />
            {questionError && (
              <Button
                type="button"
                variant="outline"
                onClick={() => refetchQuestion()}
                disabled={isFetchingQuestion}
              >
                {isFetchingQuestion ? "Retrying..." : "Retry Loading Question"}
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={
              isSubmitting ||
              isLoadingQuestion ||
              isFetchingQuestion ||
              !currentQuestion ||
              !answer.trim() ||
              isWaiting ||
              !!gameResult
            }
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
