import { useFonts } from "expo-font";
import { SpaceGrotesk_500Medium } from "@expo-google-fonts/space-grotesk";

import { AppState, Dimensions, Platform, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View, Animated } from "react-native";
import React, { useState, useRef, useEffect, useContext } from "react";
import { StatusBar } from "expo-status-bar";
import PagerView from "react-native-pager-view";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Components
import TestLaunchData from "./components/pages/TestLaunchData";
import TitleBar from "./components/styled/Titlebar";
import MenuBar from "./components/styled/MenuBar";
import Loading from "./components/styled/Loading";

// Pages
import Settings from "./components/pages/Settings"
import Launches from "./components/pages/Launches";
import ForYou from "./components/pages/ForYou";
import Dashboard from "./components/pages/Dashboard";
import News from "./components/pages/News"


import * as colors from "./components/styles";
import { useSharedValue } from "react-native-reanimated";
import { UserContext } from "./components/data/UserContext";




export default function Index(props) {
  // App Data Variables
  let userContext = useContext(UserContext);
  let appState = useRef(AppState.currentState);
  let [launchData, setLaunchData]= useState(null)
  let [refreshing , setRefreshing] = useState(false);
  let currentPage = useRef(0);
  let menuBarRef = useRef(null);
  
  const pagerRef = useRef(null);
  const pageScrollState = useSharedValue(225);

  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(()=> {
    Animated.loop(
      Animated.sequence([
        Animated.timing(
          fadeAnim,
          {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            delay: 0,
          }
        ),
        Animated.timing(
          fadeAnim,
          {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
            delay: 0,
          }
        )
      ])
    ).start();
  }, [fadeAnim])

  // Subscribe and check app state
  useEffect(()=>{
    const subscription = AppState.addEventListener("change", nextAppState => {
      // console.log("App State", appState.current, nextAppState)
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        console.log("App focused")
        try {
          reloadData()
        } catch(e){
          console.log("Error when reloading data", e)
        }
      }
      else {
        // console.log('App state', nextAppState);
      }
        appState.current = nextAppState;
    })

    return () => {
      subscription.remove();
    }
  }, [])

  // Called whenever userContext is updated
  useEffect(() => {
    if (userContext == null){
      return;
    }


    // Load User Context
    userContext.nav = props.navigation;
    userContext.setPage = setPage;

    // Check first load
    checkFirstLoad();

    fetchData(userContext);

  }, [userContext]);

  async function checkFirstLoad(){
    if (userContext == null){
      return;
    }

    let firstLoad = await userContext.checkFirstLoad();
    console.log("First Load", firstLoad)
    if (firstLoad){
      userContext.nav.navigate("First Load");
    }
  }
  // Function to fetch data
  async function fetchData(userContext) {
    console.log("Fetching Data");
    await userContext.getData().then((data)=> {
      console.log("Returning Data")
      if (data == null){
        console.log("Data is null")
        return true;
      }

      if (JSON.stringify(data) == JSON.stringify(launchData)){
        console.log("Data is the same, don't update")
        return true;
      }

      setLaunchData(data);
    }).catch((error)=>{
      console.log("Error when getting data (Index Page)", error)
      return false;
    })
  }

  // Reload function called with pull down reload gesture
  async function reloadData(){
    fadeAnim.setValue(0)
    setRefreshing(true)

    console.log("Refreshing Page")
    await userContext.forceFetchData().then((data)=> {
      console.log("Returning Data")
      setRefreshing(false)
      
      if (data == null){
        return true;
      }

      if (JSON.stringify(data) == JSON.stringify(launchData)){
        return true;
      }

      setLaunchData(data);
      return true;
    }).catch((error)=>{
      console.log("Error when getting data (Index Page)", error)
      // setRefreshing(false)
      return false;
    })
  }

  // Checks if font is loaded, if the font is not loaded yet, just show a loading screen
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
  });
  if (!fontsLoaded || userContext == null) {
    return <Loading />;
  }


  // Page Change Handling
  // Use to change current page when button pressed
  function setPage(page){
    if (pagerRef.current != null){
      pagerRef.current.setPage(page);
    }
  }

  // Called when the page is scrolling
  // Use to handle animations while page is scrolling (e.g. bottom sliding animation)
  const onPageScrollStateChanged = (state) => {
    // Handle page scroll state changes (e.g., idle, settling, dragging)
    // Example: Log the state change
    // console.log('Page scroll state:', state);
    // Can be 
  };

  const onPageScroll = (state) => {
    // Handle page scroll state changes (e.g., idle, settling, dragging)
    // Example: Log the state change
    // console.log('Page scroll state:', state["nativeEvent"]);
    pageScrollState.value = (state["nativeEvent"]["offset"]+state["nativeEvent"]["position"]) * -150 + 225;
    // Can be 
  }
  // Called when the page is changed
  const onPageSelected = (event) => {
    // Handle page selection
    const { position } = event.nativeEvent;

    // console.log('Page changed to:', position);
    currentPage.current = position;

    if (menuBarRef.current != null){
      menuBarRef.current.updatePage();
    }

  };

  // Returns current page
  function CurrentPage(){
    if (launchData == null) {
      return <Loading />;
    }
    else{
      // Data object fed into all pages
      // Includes current state of app
      let data = {
        launchData: launchData, 
        upcoming: launchData.upcoming,
        previous: launchData.previous,
        pinned: launchData.pinned,
        reloadData: reloadData,
        nav: props.navigation,
        setPage: setPage,
      };
      return (
        <PagerView 
          style={styles.pagerView} 
          initialPage={currentPage.current} 
          orientation="horizontal" 
          ref={pagerRef} 
          onPageScrollStateChanged={onPageScrollStateChanged}
          onPageScroll={onPageScroll}
          onPageSelected={onPageSelected}
        >
          {/* <Settings/>
          <Launches data={data} />
          <ForYou data={data}/>
          <Dashboard data={data} />
          <News data={data}/> */}
          <ForYou data={data}/>
          <Dashboard data={data}/>
          <News data={data}/>
          <Settings />
        </PagerView>
      )
    }
  }

  // Main App View
  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <StatusBar style="light" />
        <TitleBar scrollState={pageScrollState}/>
        <CurrentPage/>
        <MenuBar page={currentPage} setPage={setPage} ref={menuBarRef} />
        {refreshing && 
            <Animated.Text style={[styles.reloadingDataText, {opacity: fadeAnim}]}>Refreshing Data...</Animated.Text>
        }
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
    width: "100%",
    height: "100%",
  },
  pagerView: {
    flex: 1,
    zIndex: 100,
  },
  reloadingDataIndicator:{
    position: "absolute",
    bottom: colors.BOTTOM_BAR_HEIGHT+50,
    // width: "100%",
    height: 5,
    backgroundColor: colors.FOREGROUND,
    zIndex: 1000,
  },
  reloadingDataText:{
    position: "absolute",
    bottom: colors.BOTTOM_BAR_HEIGHT+ 20,

    backgroundColor: colors.BACKGROUND_HIGHLIGHT,
    width: 200,
    // height: 50,
    fontSize: 20,

    borderRadius: 15,
    paddingVertical: 5,

    marginLeft: Dimensions.get("window").width/2-100,
    // width: "100%",
    textAlign: "center",
    color: colors.FOREGROUND,
    fontFamily: colors.FONT,
    zIndex: 10000,
  }

});
