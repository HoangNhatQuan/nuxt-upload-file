import Vue from "vue";
import Vuex, { Store } from "vuex";

Vue.use(Vuex);

export interface RootState {
  snackbar: {
    show: boolean;
    text: string;
    color: string;
  };
}

const createStore = (): Store<RootState> => {
  return new Vuex.Store<RootState>({
    state: {
      snackbar: {
        show: false,
        text: "",
        color: "info",
      },
    },
    mutations: {
      SET_SNACKBAR(state, payload: Partial<RootState["snackbar"]>) {
        state.snackbar = { ...state.snackbar, ...payload };
      },
    },
  });
};

export default createStore;
