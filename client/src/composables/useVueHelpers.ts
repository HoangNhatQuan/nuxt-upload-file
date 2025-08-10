import { storeToRefs } from 'pinia';
import {
  ref,
  computed,
  reactive,
  watch,
  watchEffect,
  onMounted,
  onUnmounted,
  nextTick,
  defineEmits,
  defineProps,
  withDefaults,
} from 'vue';

// Mock useToast for now - this should be auto-imported by Nuxt UI
const useToast = () => ({
  add: (options: any) => {
    console.log('Toast:', options);
  },
});

export {
  ref,
  computed,
  reactive,
  watch,
  watchEffect,
  onMounted,
  onUnmounted,
  nextTick,
  defineEmits,
  defineProps,
  withDefaults,
  storeToRefs,
  useToast,
};
