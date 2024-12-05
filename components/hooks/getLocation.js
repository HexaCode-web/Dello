import { useState, useEffect } from "react";
import * as Location from "expo-location";
export const useGetLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const getLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setError(true);
      return;
    }
    let location = await Location.getCurrentPositionAsync({});

    setLocation(location);
  };
  useEffect(() => {
    const fetchData = async () => {
      await getLocation();
    };
    fetchData();
  }, []);

  return [location, error];
};
