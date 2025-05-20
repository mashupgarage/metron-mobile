import NavigationHeader from "@/src/components/navigation-header";
import { useBoundStore } from "@/src/store";
import React, { useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data - replace with real data from your store or API
const stats = {
  year: 2025,
  reservations: 0,
  items: 0,
  pages: 0,
  series: 0,
};

const CollectionScreen = () => {
  const store = useBoundStore();
  useEffect(() => {
    store.setHasSeenCollectionSummary(false);
  }, []);

  return (
    <SafeAreaView>
      <NavigationHeader />
      <FlatList
        data={[]}
        style={{ marginTop: 24, marginHorizontal: 16 }}
        renderItem={() => null}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={() => (
          <View>
            {/* Year in Review Summary Card */}
            {/* {!store.hasSeenCollectionSummary && (
              <View className="bg-white p-4 rounded-lg shadow mb-4">
                <Text className="text-lg font-semibold mb-2">
                  A Message from the Sandman
                </Text>
                <Text className="text-sm mb-2">
                  Hi <Text className="font-bold">{store.user?.full_name}</Text>,
                </Text>
                <Text className="text-sm mb-2">Greetings Earth dweller!</Text>
                <Text className="text-sm mb-2 ">
                  Looks like you had a big year last {stats.year}! 🎉 🥳 You{" "}
                  <Text className="font-bold mb-2">
                    reserved {stats.reservations}
                  </Text>{" "}
                  times with about{" "}
                  <Text className="font-bold">{stats.items}</Text> items.{" "}
                  <Text>That's approximately </Text>
                  <Text className="font-bold">{stats.pages}</Text>
                  <Text> pages </Text>
                  of comic book awesomeness. Do you even read 😁 all of them?
                </Text>
                <Text className="text-sm mb-2">
                  You've collected about{" "}
                  <Text className="font-bold">{stats.series} series</Text> 🧐.
                  You can browse your collections any time.
                </Text>
                <Text className="text-sm mb-2 mt-4">
                  We want to take this opportunity to thank you, for your
                  continued support and patronage. It is because of people like
                  you that we love doing this.
                </Text>

                <Text
                  className="text-md text-right text-blue-500 mt-2"
                  onPress={() => store.setHasSeenCollectionSummary(true)}
                >
                  Dismiss
                </Text>
              </View>
            )} */}
            <View className="mt-4">
              <Text className="text-lg font-semibold mb-2">
                Your Collection
              </Text>
              <View className="flex-row justify-between mb-6">
                {/* Purchased Books Card */}
                <View className="flex-1 bg-blue-50 rounded-lg p-4 mr-2">
                  <View className="items-center">
                    <View className="bg-blue-500 w-10 h-10 rounded-lg items-center justify-center mb-2">
                      <Text className="text-white text-xl">🛍️</Text>
                    </View>
                    <Text className="text-gray-600 text-base">Purchased</Text>
                    <Text className="text-black text-4xl font-bold mt-2">
                      {stats.items}
                    </Text>
                  </View>
                </View>
                {/* Reserved Books Card */}
                <View className="flex-1 bg-purple-50 rounded-lg p-4 ml-2">
                  <View className="items-center">
                    <View className="bg-purple-500 w-10 h-10 rounded-lg items-center justify-center mb-2">
                      <Text className="text-white text-xl">🔖</Text>
                    </View>
                    <Text className="text-gray-600 text-base">Reserved</Text>
                    <Text className="text-black text-4xl font-bold mt-2">
                      {stats.reservations}
                    </Text>
                  </View>
                </View>
              </View>
              <Text className="text-sm text-gray-500 mb-8">
                These are products you've reserved since we launched our
                reservation system. This will help you browse through your
                personal collection, find out what's missing and get a chance to
                complete them by buying or adding to your want list so we can
                fill them in as soon as it becomes available.
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 mt-4 items-center justify-center">
            <Text className="text-gray-500">No collections found.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default CollectionScreen;
