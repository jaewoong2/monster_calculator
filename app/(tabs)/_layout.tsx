import { Asset } from "expo-asset";
import { Image } from "expo-image";
import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const calBluuImage = {
  uri: Asset.fromModule(require("../../assets/images/cal_bluu.png")).uri,
};

const quickBluuImage = {
  uri: Asset.fromModule(require("../../assets/images/quick_bluu.png")).uri,
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarItemStyle: {
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "계산기",
          tabBarIcon: ({ focused }) => (
            <Image
              source={calBluuImage}
              contentFit="contain"
              style={{
                width: 50,
                height: 50,
                opacity: focused ? 1 : 0.4,
                marginBottom: 10,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="quick-calc"
        options={{
          title: "빠른 계산",
          tabBarIcon: ({ focused }) => (
            <Image
              source={quickBluuImage}
              contentFit="contain"
              style={{
                width: 52,
                height: 52,
                opacity: focused ? 1 : 0.4,
                marginBottom: 10,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
