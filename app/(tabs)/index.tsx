import { MessageActions } from "@/components/MessageActions";
import { styles, ThemedText as Text } from "@/components/ThemedText";
import { ThemedView as View } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { generateAPIUrl } from "@/utils";
import { useChat } from "@ai-sdk/react";
import { Button } from "@react-navigation/elements";
import { DefaultChatTransport, UIDataTypes, UIMessage, UITools } from "ai";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { fetch as expoFetch } from "expo/fetch";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  VirtualizedList,
} from "react-native";
import Markdown from "react-native-markdown-display";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeOut,
} from "react-native-reanimated";

interface Message {
  temperature: number;
  location: string;
}

export default function App() {
  const textColor = useThemeColor({}, "text");
  const backgroundSecondaryColor = useThemeColor({}, "backgroundSecondary");

  const [input, setInput] = useState("");

  const listRef =
    useRef<VirtualizedList<UIMessage<Message, UIDataTypes, UITools>>>(null);

  const { messages, error, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (error) => console.error(error, "ERROR"),
  });

  const getItem = (
    data: UIMessage<Message, UIDataTypes, UITools>[],
    index: number
  ) => data[index];

  const getItemCount = (data: UIMessage<Message, UIDataTypes, UITools>[]) =>
    data.length;
  const suggestions = ["What's the weather in Belgrade?", "Novi Sad"];

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [messages.length, status]);

  if (error) return <Text>{error.message}</Text>;

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: Platform.select({
          ios: 20,
          android: keyboardVisible ? 20 : 0,
        }),
        gap: 20,
      }}
    >
      <VirtualizedList
        ref={listRef}
        showsVerticalScrollIndicator={false}
        data={messages}
        getItem={getItem}
        getItemCount={getItemCount}
        renderItem={({ item }) => <AnswerItem item={item} />}
        style={{ flex: 1 }}
        ListFooterComponent={
          status === "submitted" ? (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <ActivityIndicator style={{ alignSelf: "flex-start" }} />
            </Animated.View>
          ) : undefined
        }
      />
      {messages.length === 0 && input === "" && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ alignItems: "flex-end", gap: 12 }}
        >
          {suggestions.map((s: string, idx: number) => (
            <TouchableOpacity
              key={idx}
              style={{
                backgroundColor: backgroundSecondaryColor,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 20,
              }}
              onPress={() => {
                setInput(s);
                send();
              }}
            >
              <Text>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <TextInput
          style={{
            flex: 1,
            backgroundColor: backgroundSecondaryColor,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 20,
            color: textColor,
            ...styles.default,
          }}
          placeholder="Enter location to get the weather for"
          placeholderTextColor={"gray"}
          value={input}
          onChange={(e) => setInput(e.nativeEvent.text)}
          onSubmitEditing={(e) => {
            e.preventDefault();
            send();
          }}
          autoFocus={true}
          editable={status === "ready"}
          numberOfLines={3}
          multiline
        />
        <Button
          variant="filled"
          disabled={status !== "ready" || input === ""}
          onPress={status === "streaming" ? stop : send}
        >
          {status === "streaming" ? "Stop" : "Ok"}
        </Button>
      </View>
    </View>
  );

  function send() {
    if (input.trim()) {
      sendMessage({ text: input });
      setInput("");
    }
  }
}

type TemperatureUnit = "F" | "C";

function AnswerItem({
  item: m,
}: {
  item: UIMessage<Message, UIDataTypes, UITools>;
}) {
  const textColor = useThemeColor({}, "text");
  const backgroundSecondaryColor = useThemeColor({}, "backgroundSecondary");

  const [unit, setUnit] = useState<TemperatureUnit>("F");
  const [temperature, setTemperature] = useState<number | null>(null);

  useEffect(() => {
    const weatherPart = m.parts.find((p) => p.type === "tool-weather");
    if (weatherPart && weatherPart.output?.temperature != null) {
      setTemperature(weatherPart.output.temperature);
    }
  }, [m]);

  const handleSwitchUnit = () => {
    if (temperature == null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    if (unit === "C") {
      setTemperature(convertTemperature(temperature, "F"));
      setUnit("F");
    } else {
      setTemperature(convertTemperature(temperature, "C"));
      setUnit("C");
    }
  };

  return (
    <Animated.View
      entering={m.role === "user" ? FadeInDown : FadeInLeft}
      style={[
        {
          marginBottom: 24,
          alignItems: m.role === "user" ? "flex-end" : "flex-start",
        },
        m.role === "user" && {
          backgroundColor: backgroundSecondaryColor,
          paddingHorizontal: 18,
          borderRadius: 20,
          borderTopRightRadius: 0,
          marginLeft: "auto",
        },
      ]}
    >
      {m.parts.map((part, i) => {
        switch (part.type) {
          case "text":
            return (
              <Markdown
                style={{ body: { color: textColor, ...styles.default } }}
                key={`${m.id}-${i}`}
              >
                {part.text}
              </Markdown>
            );
          case "tool-weather":
            let message = `${
              (part.output as Message)?.location
            }: ${temperature?.toFixed(0)}°${unit}`;
            return (
              <View style={{ gap: 20 }} key={`${m.id}-${i}`}>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Text>{message}</Text>
                </View>

                <MessageActions
                  onCopy={async () => {
                    await Clipboard.setStringAsync(message);
                    Alert.alert("Copied.", message);
                  }}
                />
                <Button onPress={handleSwitchUnit}>
                  {`Switch to °${unit === "C" ? "F" : "C"}`}
                </Button>
              </View>
            );
        }
      })}
    </Animated.View>
  );
}

function convertTemperature(value: number, to: TemperatureUnit): number {
  if (to === "F") {
    return (value * 9) / 5 + 32;
  } else {
    return ((value - 32) * 5) / 9;
  }
}
