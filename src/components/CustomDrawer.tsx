import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated
} from 'react-native';
import { 
  DrawerContentScrollView,
  DrawerContentComponentProps
} from '@react-navigation/drawer';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { mockReleases } from '@/src/utils/mock/releases';
import { mockPublishers } from '@/src/utils/mock/publishers';
import { fetchReleases } from '@/src/api/apiEndpoints';
import { ChevronDown, ChevronRight } from 'lucide-react-native';

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const [showReleases, setShowReleases] = useState(false);
  const [showComics, setShowComics] = useState(false);
  const [releases, setReleases] = useState(mockReleases);
  const [publishers, setPublishers] = useState(mockPublishers);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const slideAnimReleases = useState(new Animated.Value(0))[0];
  const slideAnimComics = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Load releases data
    const loadReleases = async () => {
      try {
        setIsLoading(true);
        const response = await fetchReleases();
        
        if (response.data && Array.isArray(response.data)) {
          setReleases(response.data);
        }
      } catch (error) {
        console.log('Error loading releases, using mock data');
        // Keep using mock data
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReleases();
  }, []);

  useEffect(() => {
    // Animate releases submenu
    Animated.timing(slideAnimReleases, {
      toValue: showReleases ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showReleases]);

  useEffect(() => {
    // Animate comics submenu
    Animated.timing(slideAnimComics, {
      toValue: showComics ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showComics]);

  const toggleReleases = () => {
    setShowReleases(!showReleases);
  };

  const toggleComics = () => {
    setShowComics(!showComics);
  };

  const navigateToScreen = (screenName: string, params = {}) => {
    navigation.navigate(screenName, params);
    // Optional: close the drawer after navigation
    // props.navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerHeaderText}>Comic Odyssey</Text>
      </View>

      {/* New Releases with submenu */}
      <View>
        <TouchableOpacity 
          style={styles.drawerMainItem}
          onPress={toggleReleases}
        >
          <View style={styles.drawerItemRow}>
            <Text style={styles.drawerMainItemText}>NEW RELEASES</Text>
            {showReleases ? (
              <ChevronDown size={16} color="#333333" />
            ) : (
              <ChevronRight size={16} color="#333333" />
            )}
          </View>
        </TouchableOpacity>

        {/* Submenu for releases */}
        <Animated.View 
          style={[
            styles.subMenu,
            {
              maxHeight: showReleases ? 500 : 0,
              opacity: slideAnimReleases,
              transform: [{
                translateY: slideAnimReleases.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.subMenuItem}
            onPress={() => navigateToScreen('Home')}
          >
            <Text style={styles.subMenuLabel}>THIS WEEK'S RELEASE</Text>
          </TouchableOpacity>

          {releases.map((release) => (
            <TouchableOpacity 
              key={release.id}
              style={styles.subMenuItem}
              onPress={() => navigateToScreen('Home', { releaseId: release.id })}
            >
              <View style={styles.releaseItem}>
                <Text style={styles.releaseDate}>{release.date}</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{release.count}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>

      {/* Comics with submenu */}
      <View>
        <TouchableOpacity 
          style={styles.drawerMainItem}
          onPress={toggleComics}
        >
          <View style={styles.drawerItemRow}>
            <Text style={styles.drawerMainItemText}>COMICS</Text>
            {showComics ? (
              <ChevronDown size={16} color="#333333" />
            ) : (
              <ChevronRight size={16} color="#333333" />
            )}
          </View>
        </TouchableOpacity>

        {/* Submenu for comics publishers */}
        <Animated.View 
          style={[
            styles.subMenu,
            {
              maxHeight: showComics ? 500 : 0,
              opacity: slideAnimComics,
              transform: [{
                translateY: slideAnimComics.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            }
          ]}
        >
          {publishers.map((publisher) => (
            <TouchableOpacity 
              key={publisher.id}
              style={styles.subMenuItem}
              onPress={() => navigateToScreen('Comics', { publisherId: publisher.id })}
            >
              <Text style={styles.publisherName}>{publisher.name}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>

      {/* Other menu items */}
      <TouchableOpacity 
        style={styles.drawerMainItem}
        onPress={() => navigateToScreen('GraphicNovels')}
      >
        <Text style={styles.drawerMainItemText}>GRAPHIC NOVELS</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.drawerMainItem}
        onPress={() => navigateToScreen('CGC')}
      >
        <Text style={styles.drawerMainItemText}>CGC</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff', // White background
  },
  drawerHeader: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  drawerHeaderText: {
    color: '#333333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  drawerMainItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  drawerItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawerMainItemText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
  },
  subMenu: {
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  subMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  subMenuLabel: {
    color: '#0a2472', // Dark blue
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 5,
  },
  releaseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  releaseDate: {
    color: '#333333',
    fontSize: 13,
  },
  countBadge: {
    backgroundColor: '#02C45A', // Keep green badge
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  countText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  publisherName: {
    color: '#333333',
    fontSize: 13,
  }
});

export default CustomDrawerContent; 