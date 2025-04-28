import { useState, useCallback, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import type { Options } from "react-use-websocket";

// Define the shape of the message data if known, otherwise use 'any' or 'unknown'
type MessagePayload = unknown;

interface UseWebSocketConnectionReturn {
  sendMessage: (message: string | object) => void;
  lastMessage: MessageEvent<MessagePayload> | null;
  messageHistory: MessageEvent<MessagePayload>[];
  readyState: ReadyState;
  connectionStatus: string;
}

export function useWebSocketConnection(
  options?: Options
): UseWebSocketConnectionReturn {
  const [messageHistory, setMessageHistory] = useState<
    MessageEvent<MessagePayload>[]
  >([]);

  const {
    sendMessage: wsSendMessage,
    lastMessage,
    readyState,
  } = useWebSocket(import.meta.env.VITE_API_URL, options);

  useEffect(() => {
    if (lastMessage !== null) {
      console.log("[Hook] Received lastMessage:", lastMessage);
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage]);

  const sendMessage = useCallback(
    (message: string | object) => {
      const messageToSend =
        typeof message === "string" ? message : JSON.stringify(message);
      console.log("[Hook] Sending message:", messageToSend);
      wsSendMessage(messageToSend);
    },
    [wsSendMessage]
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return {
    sendMessage,
    lastMessage,
    messageHistory,
    readyState,
    connectionStatus,
  };
}
