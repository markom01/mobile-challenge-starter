import { useThemeColor } from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeInLeft } from "react-native-reanimated";

type Props = {
  onCopy?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
};

export function MessageActions({ onCopy, onLike, onDislike }: Props) {
  const [feedback, setFeedback] = useState<"good" | "bad" | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  }, [isCopied]);

  return (
    <View style={{ flexDirection: "row", gap: 16 }}>
      <Animated.View entering={FadeInLeft.delay(50)}>
        <TouchableOpacity
          onPress={() => {
            setIsCopied(true);
            if (onCopy) {
              onCopy();
            }
          }}
        >
          <Ionicons
            name={isCopied ? "checkmark" : "copy-outline"}
            size={16}
            color={textColor}
          />
        </TouchableOpacity>
      </Animated.View>
      {(feedback === "good" || feedback === null) && (
        <Animated.View entering={FadeInLeft.delay(100)}>
          <TouchableOpacity
            onPress={() => {
              setFeedback("good");
              if (onLike) {
                onLike();
              }
            }}
          >
            <Ionicons
              name={
                feedback === "good" ? "thumbs-up-sharp" : "thumbs-up-outline"
              }
              size={16}
              color={textColor}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
      {(feedback === "bad" || feedback === null) && (
        <Animated.View entering={FadeInLeft.delay(150)}>
          <TouchableOpacity
            onPress={() => {
              setFeedback("bad");
              if (onDislike) {
                onDislike();
              }
            }}
          >
            <Ionicons
              name={
                feedback === "bad" ? "thumbs-down-sharp" : "thumbs-down-outline"
              }
              size={16}
              color={textColor}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
