import Vue from "vue";
import Vuex, { Store } from "vuex";
import fileQueueModule from "./modules/fileQueue";
import uploadedFilesModule from "./modules/uploadedFiles";
import uploadServiceModule from "./modules/uploadService";
import authModule from "./modules/auth";

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
    modules: {
      fileQueue: fileQueueModule,
      uploadedFiles: uploadedFilesModule,
      uploadService: uploadServiceModule,
      auth: authModule,
    },
  });
};

export default createStore;
