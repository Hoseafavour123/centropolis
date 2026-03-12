// src/components/ui/toast/use-toast.ts

"use client"

import * as React from "react"
import { ToastProps, ToastState } from "@/types/toast"
import { dispatch, listeners, toast as toastFunction } from "@/lib/toast/toastActions"

export function useToast() {
  const [state, setState] = React.useState<ToastState>({ toasts: [] })

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast: toastFunction,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}