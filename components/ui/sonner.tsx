"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:backdrop-blur-xl group-[.toaster]:border group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:shadow-2xl group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-primary/90 group-[.toaster]:text-primary-foreground group-[.toaster]:border-primary",
          error:
            "group-[.toaster]:bg-destructive/90 group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive",
          info:
            "group-[.toaster]:bg-blue-500/90 group-[.toaster]:text-white group-[.toaster]:border-blue-400",
          warning:
            "group-[.toaster]:bg-yellow-500/90 group-[.toaster]:text-yellow-950 group-[.toaster]:border-yellow-400",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
