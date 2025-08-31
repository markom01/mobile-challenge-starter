import "@/polyfills";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemedView as View } from "@/components/ThemedView";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor =
    colorScheme === "dark" ? Colors.dark.background : Colors.light.background;
  const baseStyle = { flex: 1, backgroundColor };
  return (
    <>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <SafeAreaProvider>
          {(Platform.OS === "android" && (
            <View style={baseStyle}>
              <RootStack backgroundColor={backgroundColor} />
            </View>
          )) ||
            (Platform.OS === "ios" && (
              <SafeAreaView style={baseStyle}>
                <RootStack backgroundColor={backgroundColor} />
              </SafeAreaView>
            )) || <RootStack backgroundColor={backgroundColor} />}
        </SafeAreaProvider>
      </ThemeProvider>
      <StatusBar style="auto" />
    </>
  );
}

function RootStack({ backgroundColor }: { backgroundColor: string }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              title: "Weather Today",
              headerStyle: { backgroundColor },
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
