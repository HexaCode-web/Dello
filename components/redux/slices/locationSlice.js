// redux/slices/locationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as Location from "expo-location";

let locationSubscription = null;

export const startLocationTracking = createAsyncThunk(
  "location/startLocationTracking",
  async ({ accuracy, timeInterval }, { dispatch, rejectWithValue }) => {
    try {
      // Clear any existing subscription
      if (locationSubscription) {
        locationSubscription.remove();
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return rejectWithValue("Permission to access location was denied");
      }

      // Start watching position
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval,
          distanceInterval: 0, // Set to 0 to ensure updates based on timeInterval
        },
        (newLocation) => {
          // Dispatch an action to update the location
          dispatch(updateLocation(newLocation));
          // console.log(
          //   "Foreground location update:",
          //   newLocation.coords.longitude,
          //   newLocation.coords.latitude
          // );
        }
      );

      return "Location tracking started";
    } catch (err) {
      return rejectWithValue(
        `Failed to start location tracking: ${err.message}`
      );
    }
  }
);

export const stopLocationTracking = createAsyncThunk(
  "location/stopLocationTracking",
  async (_, { rejectWithValue }) => {
    try {
      if (locationSubscription) {
        await locationSubscription.remove();
        locationSubscription = null;
      }
      return "Location tracking stopped";
    } catch (err) {
      return rejectWithValue(
        `Failed to stop location tracking: ${err.message}`
      );
    }
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState: {
    location: null,
    error: null,
    loading: false,
    isTracking: false,
  },
  reducers: {
    updateLocation: (state, action) => {
      state.location = action.payload;
    },
    clearLocation: (state) => {
      state.location = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startLocationTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startLocationTracking.fulfilled, (state) => {
        state.loading = false;
        state.isTracking = true;
      })
      .addCase(startLocationTracking.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
        state.isTracking = false;
      })
      .addCase(stopLocationTracking.fulfilled, (state) => {
        state.isTracking = false;
      });
  },
});

export const { updateLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
