"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DURATIONS, EASINGS, SPRINGS, prefersReducedMotion } from "@/lib/motion"
import { useIsMobile } from "@/hooks/useIsMobile"

/* ─── Base Radix primitives ─────────────────────────────────────────────── */

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

/* ─── Motion context (threads `open` state to AnimatePresence) ──────────── */

const DialogOpenContext = React.createContext(false)

/**
 * True for anything rendered inside a DialogContent. In-flow overlays
 * (components/ui/dropdown.tsx) read this to avoid portaling out of the
 * dialog, which the modal layer would treat as an "outside" interaction.
 */
export const DialogContentContext = React.createContext(false)

/**
 * Drop-in replacement for Dialog that threads `open` to FM-animated children.
 * Use this instead of `Dialog` when you need Framer Motion exit animations.
 */
function MotionDialog({
  open,
  onOpenChange,
  children,
  ...props
}: DialogPrimitive.DialogProps & { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <DialogOpenContext.Provider value={open}>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props}>
        {children}
      </DialogPrimitive.Root>
    </DialogOpenContext.Provider>
  )
}

/* ─── FM animation variants ─────────────────────────────────────────────── */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATIONS.fast } },
  exit: { opacity: 0, transition: { duration: DURATIONS.fast } },
}

const desktopContentVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, ...SPRINGS.default },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
}

const mobileContentVariants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: DURATIONS.fast, ease: EASINGS.easeIn },
  },
}

/* ─── Animated overlay ──────────────────────────────────────────────────── */

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay ref={ref} forceMount asChild {...props}>
    <motion.div
      className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm", className)}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    />
  </DialogPrimitive.Overlay>
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/* ─── Animated content (desktop scale-fade / mobile slide-up) ───────────── */

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  /** Hide the default close X button */
  hideClose?: boolean
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, hideClose, onEscapeKeyDown, ...props }, ref) => {
  const open = React.useContext(DialogOpenContext)
  const isMobile = useIsMobile()
  const reduced = prefersReducedMotion()

  // Radix's DismissableLayer listens for Escape on `document` and, unless
  // this callback prevents it, dismisses the dialog. An in-flow dropdown
  // (components/ui/dropdown.tsx) renders inside this same subtree rather
  // than through its own Radix layer, so its own Escape handling can't
  // reliably win a race against this document-level listener — the fix has
  // to live here: if a dropdown menu is currently open anywhere in this
  // dialog, swallow the Escape so only the menu closes on this press.
  //
  // The check is deliberately keyed off an actual open menu/listbox node
  // (DropdownContent only renders one while its dropdown is open), not off
  // event.target's closest `[data-dropdown-id]` — that attribute also sits
  // on the always-present dropdown *wrapper* (trigger + content), so a
  // target-based check would keep matching, and keep swallowing Escape,
  // even after the menu closes and focus lands back on the trigger button.
  const handleEscapeKeyDown = React.useCallback(
    (event: KeyboardEvent) => {
      onEscapeKeyDown?.(event)
      if (event.defaultPrevented) return
      const menuOpen = document.querySelector(
        '[role="listbox"][data-dropdown-id], [role="menu"][data-dropdown-id]',
      )
      if (menuOpen) event.preventDefault()
    },
    [onEscapeKeyDown],
  )

  const variants = isMobile ? mobileContentVariants : desktopContentVariants

  const desktopClasses =
    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg"
  const mobileClasses =
    "fixed inset-x-0 bottom-0 z-50 grid w-full gap-4 border-t bg-background p-6 shadow-lg rounded-t-2xl max-h-[85vh] overflow-y-auto"

  return (
    <AnimatePresence>
      {open && (
        <DialogPortal forceMount>
          <DialogOverlay />
          <DialogPrimitive.Content ref={ref} forceMount asChild onEscapeKeyDown={handleEscapeKeyDown} {...props}>
            <motion.div
              className={cn(isMobile ? mobileClasses : desktopClasses, className)}
              style={!isMobile ? { x: "-50%", y: "-50%" } : undefined}
              variants={reduced ? undefined : variants}
              initial={reduced ? undefined : "hidden"}
              animate={reduced ? undefined : "visible"}
              exit={reduced ? undefined : "exit"}
            >
              {isMobile && (
                <div className="flex justify-center pb-2">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
                </div>
              )}
              <DialogContentContext.Provider value={true}>
                {children}
              </DialogContentContext.Provider>
              {!hideClose && (
                <DialogPrimitive.Close className="absolute end-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </AnimatePresence>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

/* ─── Layout helpers (unchanged from shadcn) ────────────────────────────── */

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-start",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
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
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  MotionDialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
