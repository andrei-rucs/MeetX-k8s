import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { SelectedState } from "./selectedSlice.types";


const getInitialState = (): SelectedState => {
    return {
        selectedGroupId: "0",
        selectedTopicId: "0",
        selectedConvId: "0",
        isAdmin: false,
        isPublic: false,
        appRole: false
    };
}

export const selectedSlice = createSlice({
    name: "selected",
    initialState: getInitialState(),
    reducers: {
        setGroup: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                selectedGroupId: action.payload,
                selectedTopicId: "0",
                selectedConvId: "0",
                isAdmin: false,
                isPublic: state.isPublic,
                appRole: state.appRole
            };
        },
        setTopic: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                selectedGroupId: state.selectedGroupId,
                selectedTopicId: action.payload,
                selectedConvId: "0",
                isAdmin: state.isAdmin,
                isPublic: state.isPublic,
                appRole: state.appRole
            };
        },
        setConv: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                selectedGroupId: "0",
                selectedTopicId: "0",
                selectedConvId: action.payload,
                isAdmin: state.isAdmin,
                isPublic: state.isPublic,
                appRole: state.appRole
            };
        },
        setAdmin: (state, action: PayloadAction<boolean>) => {
            return {
                ...state,
                selectedGroupId: state.selectedGroupId,
                selectedTopicId: state.selectedTopicId,
                selectedConvId: state.selectedConvId,
                isAdmin: action.payload,
                isPublic: state.isPublic,
                appRole: state.appRole
            };
        },
        setPublic: (state, action: PayloadAction<boolean>) => {
            return {
                ...state,
                selectedGroupId: state.selectedGroupId,
                selectedTopicId: state.selectedTopicId,
                selectedConvId: state.selectedConvId,
                isAdmin: state.isAdmin,
                isPublic: action.payload,
                appRole: state.appRole
            };
        },
        setAppRole: (state, action: PayloadAction<boolean>) => {
            return {
                ...state,
                selectedGroupId: state.selectedGroupId,
                selectedTopicId: state.selectedTopicId,
                selectedConvId: state.selectedConvId,
                isAdmin: state.isAdmin,
                isPublic: state.isPublic,
                appRole: action.payload
            };
        },
        resetSelected: () => {
            return {
                selectedGroupId: "0",
                selectedTopicId: "0",
                selectedConvId: "0",
                isAdmin: false,
                isPublic: false,
                appRole: false
            };
        },
    }
});

export const {
    setGroup,
    setTopic,
    setConv,
    setAdmin,
    setPublic,
    setAppRole,
    resetSelected
} = selectedSlice.actions;

export const selectedReducer = selectedSlice.reducer;

