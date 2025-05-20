import { create } from "zustand";
import { SportEvent, Bet, EventStatus } from "../types";

interface Store {
  events: SportEvent[];
  userBets: Bet[];
  setEvents: (events: SportEvent[]) => void;
  addBet: (bet: Bet) => void;
  updateEventOdds: (
    eventId: string,
    odds: { teamA: number; teamB: number }
  ) => void;
  updateEventStatus: (
    eventId: string,
    status: EventStatus,
    score?: { teamA: number; teamB: number }
  ) => void;
}

export const useStore = create<Store>((set) => ({
  events: [],
  userBets: [],
  setEvents: (events) => set({ events }),
  addBet: (bet) => set((state) => ({ userBets: [...state.userBets, bet] })),
  updateEventOdds: (eventId, odds) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, odds } : event
      ),
    })),
  updateEventStatus: (eventId, status, score) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === eventId ? { ...event, status, score } : event
      ),
    })),
}));
