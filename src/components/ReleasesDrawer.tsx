import React, { useEffect, useRef } from "react"
import {
  Animated,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native"
import { Text } from "./ui/text"
import { X } from "lucide-react-native"
import { useBoundStore } from "../store"

interface ReleaseDate {
  id: number
  date: string
  count: number
}

interface ReleasesDrawerProps {
  visible: boolean
  releaseDates: ReleaseDate[]
  selectedReleaseId: number | null
  onClose: () => void
  onSelectDate: (id: number, date: string) => void
  onShowAllReleases: () => void
}

const ReleasesDrawer: React.FC<ReleasesDrawerProps> = ({
  visible,
  releaseDates,
  selectedReleaseId,
  onClose,
  onSelectDate,
  onShowAllReleases,
}) => {
  const drawerAnimation = useRef(new Animated.Value(-300)).current
  const { theme } = useBoundStore()
  useEffect(() => {
    if (visible) {
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(drawerAnimation, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  return (
    <>
      {visible && (
        <TouchableOpacity
          className='absolute top-0 left-0 right-0 bottom-0 bg-black/50 z-[1]'
          activeOpacity={1}
          onPress={onClose}
        />
      )}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 300,
            backgroundColor: theme.background,
            zIndex: 2,
            transform: [{ translateX: drawerAnimation }],
          },
        ]}
      >
        <SafeAreaView className='flex-1'>
          <View className='p-4 border-b flex-row justify-between items-center'>
            <Text
              style={{ fontFamily: "Inter", color: theme.text }}
              className='text-xl font-bold'
            >
              Release History
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView className='flex-1'>
            <TouchableOpacity
              className='flex-row justify-between items-center p-4'
              onPress={() => {
                onShowAllReleases()
                onClose()
              }}
            >
              <Text
                style={{ fontFamily: "Inter", color: theme.text }}
                className='text-base'
              >
                LATEST RELEASE
              </Text>
            </TouchableOpacity>

            {releaseDates.map((item) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row justify-between items-center p-4 border-b ${
                  item.id === selectedReleaseId ? "bg-primary-50" : ""
                }`}
                style={{
                  backgroundColor: theme.background,
                }}
                onPress={() => {
                  onSelectDate(item.id, item.date)
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter",
                    color: theme.text,
                  }}
                  className='text-base'
                >
                  {item.date}
                </Text>
                <View
                  style={{
                    backgroundColor: theme.primary[500],
                  }}
                  className=' rounded px-2 py-0.5'
                >
                  <Text
                    style={{
                      fontFamily: "Inter",
                      color: "#fff",
                    }}
                  >
                    {item.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </>
  )
}

export default ReleasesDrawer
