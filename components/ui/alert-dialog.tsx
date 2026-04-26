"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { DURATIONS, EASINGS, SPRINGS, prefersReducedMotion } from "@/lib/motion"

/* ─── Base primitives ───────────────────────────────────────────────────── */

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

/* ─── Motion context ────────────────────────────────────────────────────── */

const AlertDialogOpenContext = React.createContext(false)

function MotionAlertDialog({
  open,
  onOpenChange,
  children,
  ...props
}: AlertDialogPrimitive.AlertDialogProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <AlertDialogOpenContext.Provider value={open}>
      <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props}>
        {children}
      </AlertDialogPrimitive.Root>
    </AlertDialogOpenContext.Provider>
  )
}

/* ─── FM variants ───────────────────────────────────────────────────────── */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATIONS.fast } },
  exit: { opacity: 0, transition: { duration: DURATIONS.fast } },
}

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, x: "-50%", y: "-50%" },
  visible: {
    opacity: 1,
    scale: 1,
    x: "-50%",
    y: "-50%",
    transition: { type: "spring" as const, ...SPRINGS.default },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    x: "-50%",
    y: "-50%",
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
}

/* ─── Animated overlay ──────────────────────────────────────────────────── */

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay ref={ref} forceMount asChild {...props}>
    <motion.div
      className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm", className)}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    />
  </AlertDialogPrimitive.Overlay>
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

/* ─── Animated content ──────────────────────────────────────────────────── */

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const open = React.useContext(AlertDialogOpenContext)
  const reduced = prefersReducedMotion()

  return (
    <AnimatePresence>
      {open && (
        <AlertDialogPortal forceMount>
          <AlertDialogOverlay />
          <AlertDialogPrimitive.Content ref={ref} forceMount asChild {...props}>
            <motion.div
              className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
                className
              )}
              variants={reduced ? undefined : contentVariants}
              initial={reduced ? undefined : "hidden"}
              animate={reduced ? undefined : "visible"}
              exit={reduced ? undefined : "exit"}
            >
              {children}
            </motion.div>
          </AlertDialogPrimitive.Content>
        </AlertDialogPortal>
      )}
    </AnimatePresence>
  )
})
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

/* ─── Layout helpers ────────────────────────────────────────────────────── */

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant: "outline" }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
  AlertDialog,
  MotionAlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
