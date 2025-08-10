// Global type declarations for Vue 3 auto-imports
declare global {
  const ref: (typeof import('vue'))['ref'];
  const computed: (typeof import('vue'))['computed'];
  const reactive: (typeof import('vue'))['reactive'];
  const watch: (typeof import('vue'))['watch'];
  const watchEffect: (typeof import('vue'))['watchEffect'];
  const onMounted: (typeof import('vue'))['onMounted'];
  const onUnmounted: (typeof import('vue'))['onUnmounted'];
  const nextTick: (typeof import('vue'))['nextTick'];
  const defineEmits: (typeof import('vue'))['defineEmits'];
  const defineProps: (typeof import('vue'))['defineProps'];
  const withDefaults: (typeof import('vue'))['withDefaults'];
  const useToast: () => unknown;
  const useUploadFile: () => unknown;
  const storeToRefs: (typeof import('pinia'))['storeToRefs'];
  const useColorMode: () => {
    value: 'light' | 'dark' | 'system';
    preference: 'light' | 'dark' | 'system';
    force: boolean;
  };
}

export {};
