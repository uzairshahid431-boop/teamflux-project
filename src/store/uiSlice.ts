import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isSidebarCollapsed: boolean;
  isNavbarHidden: boolean;
}

const initialState: UIState = {
  isSidebarCollapsed: false,
  isNavbarHidden: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setIsNavbarHidden: (state, action: PayloadAction<boolean>) => {
      state.isNavbarHidden = action.payload;
    },
  },
});

export const { setIsSidebarCollapsed, toggleSidebar, setIsNavbarHidden } = uiSlice.actions;
export default uiSlice.reducer;
