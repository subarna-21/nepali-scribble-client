import Toast, { ToastType } from "react-native-toast-message";
export function notifyMessage(message: string, type: ToastType) {
  Toast.show({
    type,
    text1: message,
    position: "top",
    visibilityTime: 3000,
    topOffset: 50,
  });
}
