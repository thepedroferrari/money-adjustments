// src/hooks/useStore.ts
import { create } from "zustand";
import { createAuthSlice, AuthState } from "../store/auth";
import {
  createDataManagementSlice,
  DataManagementState,
} from "../store/dataManagement";
import {
  createCalculationSlice,
  CalculationState,
} from "../store/calculations";
import { createUserGroupSlice, UserGroupState } from "../store/userGroup";

type StoreState = AuthState &
  DataManagementState &
  CalculationState &
  UserGroupState;

export const useStore = create<StoreState>((...a) => ({
  ...createAuthSlice(...a),
  ...createDataManagementSlice(...a),
  ...createCalculationSlice(...a),
  ...createUserGroupSlice(...a),
}));
