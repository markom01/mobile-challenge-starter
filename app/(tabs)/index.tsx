import { generateAPIUrl } from "@/utils";
import { useChat } from "@ai-sdk/react";
import { Button } from "@react-navigation/elements";
import { DefaultChatTransport, UIDataTypes, UIMessage, UITools } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  View,
  VirtualizedList,
} from "react-native";

export default function App() {
  const [input, setInput] = useState("");
  const { messages, error, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (error) => console.error(error, "ERROR"),
  });

  const getItem = (
    data: UIMessage<unknown, UIDataTypes, UITools>[],
    index: number
  ) => data[index];
  const getItemCount = (data: UIMessage<unknown, UIDataTypes, UITools>[]) =>
    data.length;

  useEffect(() => {
    console.log(JSON.stringify(messages, null, 2));
  }, [messages]);

  if (error) return <Text>{error.message}</Text>;

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        gap: 20,
      }}
    >
      <VirtualizedList
        showsVerticalScrollIndicator={false}
        data={messages}
        getItem={getItem}
        getItemCount={getItemCount}
        renderItem={({ item: m }) => (
          <View style={{ gap: 8, marginBottom: 10, alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return <Text key={`${m.id}-${i}`}>{part.text}</Text>;
                case "tool-weather":
                  return (
                    <Text key={`${m.id}-${i}`}>
                      {JSON.stringify(part, null, 2)}
                    </Text>
                  );
              }
            })}
          </View>
        )}
        style={{ flex: 1 }}
        ListFooterComponent={
          status === "submitted" ? (
            <ActivityIndicator />
          ) : undefined
        }
      />
      <View style={{ flexDirection: "row" }}>
        <TextInput
          style={{ flex: 1, backgroundColor: "white", padding: 8 }}
          placeholder="Say something..."
          value={input}
          onChange={(e) => setInput(e.nativeEvent.text)}
          onSubmitEditing={(e) => {
            e.preventDefault();
                   if (input.trim()) {
            sendMessage({ text: input });
            setInput("");
                   }
          }}
          autoFocus={true}
          editable={status === "ready"}
        />
        {status === "streaming" && (
          <Button disabled={!(status === 'streaming' || status === 'submitted')} onPressIn={stop}>Stop</Button>
        )}
      </View>
    </View>
  );
}
