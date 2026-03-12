import * as React from "react"

export type ToastActionElement = React.ReactElement<{
  altText: string
  onClick: () => void
}>

export interface ToastProps {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface ToastState {
  toasts: ToastProps[]
}

export const TOAST_LIMIT = 5
export const TOAST_REMOVE_DELAY = 5000