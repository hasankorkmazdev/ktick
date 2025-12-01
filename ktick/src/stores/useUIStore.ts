import { create } from 'zustand';
import { PortfolioItem } from '@/services/api';

interface UIState {
    // Tab State
    activeTab: "watchlist" | "portfolio";
    setActiveTab: (tab: "watchlist" | "portfolio") => void;

    // Portfolio Dialog States
    isEditDialogOpen: boolean;
    editingItem: Partial<PortfolioItem> | null;
    isDeleteDialogOpen: boolean;
    itemToDelete: string | null;

    // Portfolio Dialog Actions
    openEditDialog: (item?: Partial<PortfolioItem>) => void;
    closeEditDialog: () => void;
    openDeleteDialog: (code: string) => void;
    closeDeleteDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    // Tab State
    activeTab: "portfolio",
    setActiveTab: (tab) => set({ activeTab: tab }),

    // Portfolio Dialog States
    isEditDialogOpen: false,
    editingItem: null,
    isDeleteDialogOpen: false,
    itemToDelete: null,

    // Portfolio Dialog Actions
    openEditDialog: (item) => set({
        isEditDialogOpen: true,
        editingItem: item || null
    }),

    closeEditDialog: () => set({
        isEditDialogOpen: false,
        editingItem: null
    }),

    openDeleteDialog: (code) => set({
        isDeleteDialogOpen: true,
        itemToDelete: code
    }),

    closeDeleteDialog: () => set({
        isDeleteDialogOpen: false,
        itemToDelete: null
    }),
}));
