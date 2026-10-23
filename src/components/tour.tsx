"use client";

import { composeEventHandlers } from "@radix-ui/primitive";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import type { Scope } from "@radix-ui/react-context";
import { createContextScope } from "@radix-ui/react-context";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Primitive } from "@radix-ui/react-primitive";
import { useLayoutEffect } from "@radix-ui/react-use-layout-effect";
import * as React from "react";
import { useRect } from "../hooks/use-rect";
import { useReducedMotion } from "../hooks/use-reduced-motion";
import { useStepFade } from "../hooks/use-step-fade";
import { useTarget } from "../hooks/use-target";
import { useTourKeys } from "../hooks/use-tour-keys";

type ScopedProps<P> = P & { __scopeTour?: Scope };

/* Motion defaults. Consumers override the duration and ease with the CSS variables below. */
const MOVE_DURATION = "220ms";
const FADE_DURATION = "150ms";
const DEFAULT_EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
const ENTER_SCALE = 0.96;

const DURATION_VAR = "--tour-duration";
const EASE_VAR = "--tour-ease";

const EASE = `var(${EASE_VAR}, ${DEFAULT_EASE})`;

// Safety net: a missing or interrupted transitionend must never leave the card stuck on screen.
const EXIT_SLACK_MS = 100;
const DEFAULT_EXIT_MS = 150;
const PLACEMENT_FALLBACK_MS = 150;

const POPPER_WRAPPER = "[data-radix-popper-content-wrapper]";

type TourDirection = "from-start" | "from-end";

/** Longest duration in a computed `transition-duration` list, in ms. */
function parseDuration(value: string) {
  const longest = value
    .split(",")
    .map((part) => {
      const trimmed = part.trim();

      return trimmed.endsWith("ms")
        ? Number.parseFloat(trimmed)
        : Number.parseFloat(trimmed) * 1000;
    })
    .filter((ms) => Number.isFinite(ms))
    .reduce((max, ms) => Math.max(max, ms), 0);

  return longest > 0 ? longest : DEFAULT_EXIT_MS;
}

/* -------------------------------------------------------------------------------------------------
 * Tour
 * -----------------------------------------------------------------------------------------------*/

const TOUR_NAME = "Tour";

interface TourStep {
  id: string;

  /** CSS selector of the element this step points at. */
  target: string;

  title?: React.ReactNode;
  description?: React.ReactNode;

  /** Which side of the target the card sits on. Defaults to "bottom". */
  side?: "top" | "right" | "bottom" | "left";

  /** How the card aligns along that side. Defaults to "center". */
  align?: "start" | "center" | "end";
}

interface TourContextValue {
  steps: TourStep[];
  index: number;
  step: TourStep;
  isFirst: boolean;
  isLast: boolean;
  open: boolean;

  /** Whether step transitions run at all (the `motion` prop). */
  motion: boolean;

  /** The user asked for reduced motion: no movement, only short opacity fades. */
  reducedMotion: boolean;

  /** Which way the last step change went: forward is "from-start", back is "from-end". */
  direction: TourDirection;

  /** The resolved DOM element for the current step, or null while it is still missing. */
  target: Element | null;

  /** Id the card carries, so the target can point at it. */
  contentId: string;

  titleId: string | undefined;
  descriptionId: string | undefined;
  onTitleIdChange: (id: string | undefined) => void;
  onDescriptionIdChange: (id: string | undefined) => void;

  /** Where focus is relative to the card. Lives here so it survives the card remounting. */
  focus: React.RefObject<FocusState>;

  onNext: () => void;
  onPrevious: () => void;
  onGoTo: (index: number) => void;
  onClose: () => void;
}

interface FocusState {
  /** True once the card has taken its first focus for this opening. */
  opened: boolean;

  /** True while focus is inside the card. */
  within: boolean;
}

const [createTourContext, createTourScope] = createContextScope(TOUR_NAME);
const [TourProvider, useTourContext] = createTourContext<TourContextValue>(TOUR_NAME);

interface TourProps {
  steps: TourStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Animate the card and spotlight between steps and on open and close. Defaults to true. */
  motion?: boolean;

  children?: React.ReactNode;
}

function Tour(props: ScopedProps<TourProps>) {
  const { __scopeTour, steps, open, onOpenChange, motion = true, children } = props;

  const [index, setIndex] = React.useState(0);
  const [titleId, setTitleId] = React.useState<string | undefined>();
  const [descriptionId, setDescriptionId] = React.useState<string | undefined>();
  const [direction, setDirection] = React.useState<TourDirection>("from-start");
  const [wasOpen, setWasOpen] = React.useState(open);

  const contentId = React.useId();
  const focus = React.useRef<FocusState>({ opened: false, within: false });

  const reducedMotion = useReducedMotion();

  // Restart at the first step on every open. Done while rendering, not in an effect, so the
  // first frame never anchors the card to the previous session's step.
  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) {
      setIndex(0);
      setDirection("from-start");
    }
  }

  const step = steps[index];
  const target = useTarget(open ? step?.target : undefined);

  React.useEffect(() => {
    if (!open) {
      focus.current = { opened: false, within: false };
    }
  }, [open]);

  React.useEffect(() => {
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [target]);

  const openerRef = React.useRef<Element | null>(null);

  // Layout effect: the card's autofocus runs in a passive effect, so the opener must be read first.
  useLayoutEffect(() => {
    if (open) {
      openerRef.current = document.activeElement;
    }
  }, [open]);

  // Passive effect: the card stays mounted while it fades out, and React puts focus back on it at
  // the end of a commit. Restoring any earlier would be undone.
  React.useEffect(() => {
    if (open) {
      return;
    }

    const opener = openerRef.current;

    openerRef.current = null;

    if (opener instanceof HTMLElement && opener.isConnected) {
      opener.focus();
    }
  }, [open]);

  // Stay rendered while closed: Tour.Content owns its exit animation and unmounts itself.
  if (!step) {
    return null;
  }

  const isFirstStep = index === 0;
  const isLastStep = index === steps.length - 1;

  function handleNext() {
    if (isLastStep) {
      onOpenChange(false);

      return;
    }

    setDirection("from-start");
    setIndex(index + 1);
  }

  function handlePrevious() {
    if (index === 0) {
      return;
    }

    setDirection("from-end");
    setIndex(index - 1);
  }

  function handleGoTo(next: number) {
    setDirection(next >= index ? "from-start" : "from-end");
    setIndex(next);
  }

  return (
    <TourProvider
      scope={__scopeTour}
      steps={steps}
      index={index}
      step={step}
      isFirst={isFirstStep}
      isLast={isLastStep}
      open={open}
      motion={motion}
      reducedMotion={reducedMotion}
      direction={direction}
      target={target}
      contentId={contentId}
      titleId={titleId}
      descriptionId={descriptionId}
      onTitleIdChange={setTitleId}
      onDescriptionIdChange={setDescriptionId}
      focus={focus}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onGoTo={handleGoTo}
      onClose={() => onOpenChange(false)}
    >
      {children}
    </TourProvider>
  );
}

Tour.displayName = TOUR_NAME;

/* -------------------------------------------------------------------------------------------------
 * useTour
 * -----------------------------------------------------------------------------------------------*/

/** Read the tour's state from inside `Tour.Root`, e.g. to label the last step's button "Done". */
function useTour(scope?: Scope) {
  const context = useTourContext("useTour", scope);

  return {
    steps: context.steps,
    step: context.step,
    index: context.index,
    isFirst: context.isFirst,
    isLast: context.isLast,
    next: context.onNext,
    previous: context.onPrevious,
    close: context.onClose,
  };
}

/* -------------------------------------------------------------------------------------------------
 * TourContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = "TourContent";

type TourContentElement = React.ComponentRef<typeof PopoverPrimitive.Content>;
type PopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>;
interface TourContentProps extends PopoverContentProps {}

const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function addDescribedBy(element: Element, id: string) {
  const tokens = (element.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);

  if (!tokens.includes(id)) {
    element.setAttribute("aria-describedby", [...tokens, id].join(" "));
  }
}

function removeDescribedBy(element: Element, id: string) {
  const tokens = (element.getAttribute("aria-describedby") ?? "")
    .split(/\s+/)
    .filter((token) => token && token !== id);

  if (tokens.length > 0) {
    element.setAttribute("aria-describedby", tokens.join(" "));
  } else {
    element.removeAttribute("aria-describedby");
  }
}

/**
 * Popover anchored to the current step's target. Renders nothing until the target exists, then
 * stays mounted across steps so the card glides between targets. Do not unmount it yourself
 * between steps: that removes the glide. It also renders a visually hidden live region that
 * announces each step.
 */
const TourContent = React.forwardRef<TourContentElement, TourContentProps>(
  (props: ScopedProps<TourContentProps>, forwardedRef) => {
    const { __scopeTour, onOpenAutoFocus, style, ...contentProps } = props;

    const context = useTourContext(CONTENT_NAME, __scopeTour);

    const [node, setNode] = React.useState<TourContentElement | null>(null);

    // The last target that resolved. A step whose target is briefly missing keeps the card here
    // instead of unmounting it, so the next target re-anchors the same card.
    const anchorRef = React.useRef<Element | null>(null);
    const cardRef = React.useRef<TourContentElement | null>(null);

    const composedRef = useComposedRefs(forwardedRef, setNode, cardRef);

    const [announcement, setAnnouncement] = React.useState("");

    const { target, index, titleId, focus } = context;
    const hasTarget = target !== null;
    const stepCount = context.steps.length;
    const stepTitle = context.step.title;
    const cardId = contentProps.id ?? context.contentId;

    if (target) {
      anchorRef.current = target;
    }

    const wantsOpen = context.open && anchorRef.current !== null;

    // Keep the card mounted while it fades out. Derived during render so there is no frame
    // between `open` flipping and the exit starting.
    const [wasOpen, setWasOpen] = React.useState(wantsOpen);
    const [exiting, setExiting] = React.useState(false);

    if (wantsOpen !== wasOpen) {
      setWasOpen(wantsOpen);
      setExiting(!wantsOpen && context.motion);
    }

    const mounted = wantsOpen || exiting;

    // Popper first places the card off-screen, then at its real spot. Transitioning that first move
    // would fly the card in from off-screen, so transitions start only after the real placement.
    const [placed, setPlaced] = React.useState(false);

    React.useEffect(() => {
      if (!mounted) {
        anchorRef.current = null;
      }
    }, [mounted]);

    useLayoutEffect(() => {
      const wrapper = node?.closest<HTMLElement>(POPPER_WRAPPER);

      if (!wrapper) {
        setPlaced(false);

        return;
      }

      let frame = 0;

      function isPlaced() {
        return !!wrapper && !wrapper.style.transform.includes("-200%");
      }

      function enable() {
        observer.disconnect();
        window.clearTimeout(fallback);
        frame = requestAnimationFrame(() => setPlaced(true));
      }

      const observer = new MutationObserver(() => {
        if (isPlaced()) {
          enable();
        }
      });

      const fallback = window.setTimeout(enable, PLACEMENT_FALLBACK_MS);

      observer.observe(wrapper, { attributes: true, attributeFilter: ["style"] });

      if (isPlaced()) {
        enable();
      }

      return () => {
        observer.disconnect();
        window.clearTimeout(fallback);
        cancelAnimationFrame(frame);
      };
    }, [node]);

    // The glide: Popper moves the wrapper with `transform`, so a transition there animates the
    // card between targets. Reduced motion removes the movement.
    useLayoutEffect(() => {
      const wrapper = node?.closest<HTMLElement>(POPPER_WRAPPER);

      if (!node || !wrapper || !placed || !context.motion || context.reducedMotion) {
        return;
      }

      // The wrapper is portaled above the card, so it cannot inherit variables set on the card.
      const styles = getComputedStyle(node);
      const duration = styles.getPropertyValue(DURATION_VAR).trim() || MOVE_DURATION;
      const ease = styles.getPropertyValue(EASE_VAR).trim() || DEFAULT_EASE;

      wrapper.style.transition = `transform ${duration} ${ease}`;

      return () => {
        wrapper.style.transition = "";
      };
    }, [node, placed, context.motion, context.reducedMotion]);

    // End the exit when the fade finishes, or after a timeout if no transition ever runs.
    React.useEffect(() => {
      if (!exiting || !node) {
        return;
      }

      const card = node;

      function finish() {
        setExiting(false);
      }

      function handleTransitionEnd(event: TransitionEvent) {
        if (event.target === card) {
          finish();
        }
      }

      const duration = parseDuration(getComputedStyle(card).transitionDuration);
      const timeout = window.setTimeout(finish, duration + EXIT_SLACK_MS);

      card.addEventListener("transitionend", handleTransitionEnd);

      return () => {
        window.clearTimeout(timeout);
        card.removeEventListener("transitionend", handleTransitionEnd);
      };
    }, [exiting, node]);

    // Announce once the card has rendered, so the text is read from the title that is on screen.
    React.useEffect(() => {
      if (!hasTarget) {
        return;
      }

      const renderedTitle = titleId ? document.getElementById(titleId)?.textContent : null;
      const title = renderedTitle || (typeof stepTitle === "string" ? stepTitle : "");

      setAnnouncement(`Step ${index + 1} of ${stepCount}${title ? `: ${title}` : ""}`);
    }, [hasTarget, index, stepCount, stepTitle, titleId]);

    // Focus stays on whatever the user was using. Only a focused element that vanished with the step
    // (for example a keyed button) sends focus back to the card.
    // biome-ignore lint/correctness/useExhaustiveDependencies: runs on every step change
    React.useEffect(() => {
      const card = cardRef.current;

      if (focus.current.within && card && !card.contains(document.activeElement)) {
        card.focus({ preventScroll: true });
      }
    }, [index, focus]);

    useTourKeys({
      enabled: hasTarget,
      card: cardRef,
      isFirst: context.isFirst,
      isLast: context.isLast,
      stepCount,
      onNext: context.onNext,
      onPrevious: context.onPrevious,
      onGoTo: context.onGoTo,
      onFocusCard: () => cardRef.current?.focus({ preventScroll: true }),
    });

    React.useEffect(() => {
      if (!target) {
        return;
      }

      addDescribedBy(target, cardId);

      return () => removeDescribedBy(target, cardId);
    }, [target, cardId]);

    function handleOpenAutoFocus(event: Event) {
      onOpenAutoFocus?.(event);

      const prevented = event.defaultPrevented;
      const state = focus.current;

      // Radix would focus the first button. The card itself reads as the dialog, so focus that.
      event.preventDefault();

      const isFirstFocus = !state.opened;

      state.opened = true;

      if (isFirstFocus ? !prevented : state.within) {
        cardRef.current?.focus({ preventScroll: true });
      }
    }

    function handleFocus() {
      focus.current.within = true;
    }

    function handleBlur(event: React.FocusEvent<TourContentElement>) {
      const next = event.relatedTarget;

      if (next instanceof Node && !event.currentTarget.contains(next)) {
        focus.current.within = false;
      }
    }

    if (!mounted) {
      return null;
    }

    // Enter and exit: opacity plus a small scale from the popover's origin. Never from scale(0).
    // Reduced motion keeps the fade and drops the scale.
    const entered = placed && wantsOpen;

    const motionStyle: React.CSSProperties | undefined = context.motion
      ? {
          opacity: entered ? 1 : 0,
          transform: entered || context.reducedMotion ? "none" : `scale(${ENTER_SCALE})`,
          transformOrigin: "var(--radix-popover-content-transform-origin)",
          transition: context.reducedMotion
            ? `opacity var(${DURATION_VAR}, ${FADE_DURATION}) ${EASE}`
            : `opacity var(${DURATION_VAR}, ${FADE_DURATION}) ${EASE}, transform var(${DURATION_VAR}, ${FADE_DURATION}) ${EASE}`,
        }
      : undefined;

    return (
      <>
        <span role="status" aria-live="polite" data-tour-announcer="" style={visuallyHidden}>
          {announcement}
        </span>

        <PopoverPrimitive.Root open>
          <PopoverPrimitive.Anchor virtualRef={anchorRef as React.RefObject<Element>} />

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              side={context.step.side ?? "bottom"}
              align={context.step.align ?? "center"}
              sideOffset={14}
              collisionPadding={12}
              data-step={context.index}
              data-state={wantsOpen ? "open" : "closed"}
              data-motion={context.direction}
              aria-labelledby={context.titleId}
              aria-describedby={context.descriptionId}
              {...contentProps}
              id={cardId}
              style={{ ...motionStyle, ...style }}
              ref={composedRef}
              onOpenAutoFocus={handleOpenAutoFocus}
              onFocus={composeEventHandlers(contentProps.onFocus, handleFocus)}
              onBlur={composeEventHandlers(contentProps.onBlur, handleBlur)}
              onEscapeKeyDown={composeEventHandlers(contentProps.onEscapeKeyDown, context.onClose)}
              onInteractOutside={composeEventHandlers(contentProps.onInteractOutside, (event) =>
                event.preventDefault(),
              )}
            />
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      </>
    );
  },
);

TourContent.displayName = CONTENT_NAME;

/* -------------------------------------------------------------------------------------------------
 * TourArrow
 * -----------------------------------------------------------------------------------------------*/

const ARROW_NAME = "TourArrow";

type TourArrowElement = React.ComponentRef<typeof PopoverPrimitive.Arrow>;
type PopoverArrowProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow>;
interface TourArrowProps extends PopoverArrowProps {}

/** Pointer from the card to its target. Place it inside `Tour.Content`; fill it with `fill-*`. */
const TourArrow = React.forwardRef<TourArrowElement, TourArrowProps>(
  (props: ScopedProps<TourArrowProps>, forwardedRef) => {
    const { __scopeTour, ...arrowProps } = props;

    useTourContext(ARROW_NAME, __scopeTour);

    return <PopoverPrimitive.Arrow {...arrowProps} ref={forwardedRef} />;
  },
);

TourArrow.displayName = ARROW_NAME;

/* -------------------------------------------------------------------------------------------------
 * TourSpotlight
 * -----------------------------------------------------------------------------------------------*/

const SPOTLIGHT_NAME = "TourSpotlight";

type TourSpotlightElement = React.ComponentRef<typeof Primitive.svg>;
type PrimitiveSvgProps = React.ComponentPropsWithoutRef<typeof Primitive.svg>;

interface TourSpotlightProps extends PrimitiveSvgProps {
  /** Extra space around the target, in px. */
  padding?: number;

  /** Corner radius of the cut-out, in px. */
  radius?: number;
}

/** Dimmed overlay with a cut-out around the current target. Color it with `text-*` classes. */
const TourSpotlight = React.forwardRef<TourSpotlightElement, TourSpotlightProps>(
  (props: ScopedProps<TourSpotlightProps>, forwardedRef) => {
    const { __scopeTour, padding = 8, radius = 8, style, ...spotlightProps } = props;

    const context = useTourContext(SPOTLIGHT_NAME, __scopeTour);
    const currentRect = useRect(context.target);

    // Hold the last rect while the target is briefly missing, like the card does.
    const lastRectRef = React.useRef<DOMRect | null>(null);

    if (currentRect) {
      lastRectRef.current = currentRect;
    }

    if (!context.open) {
      lastRectRef.current = null;
    }

    const rect = lastRectRef.current;

    const maskId = `tour-mask-${React.useId().replace(/:/g, "")}`;

    if (!rect) {
      return null;
    }

    const cutoutTransition =
      context.motion && !context.reducedMotion
        ? ["x", "y", "width", "height"]
            .map((property) => `${property} var(${DURATION_VAR}, ${MOVE_DURATION}) ${EASE}`)
            .join(", ")
        : undefined;

    return (
      <Primitive.svg
        aria-hidden
        data-tour-spotlight=""
        {...spotlightProps}
        ref={forwardedRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          ...style,
        }}
      >
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />

            <rect
              data-tour-cutout=""
              x={rect.x - padding}
              y={rect.y - padding}
              width={rect.width + padding * 2}
              height={rect.height + padding * 2}
              rx={radius}
              fill="black"
              style={{ transition: cutoutTransition }}
            />
          </mask>
        </defs>

        <rect width="100%" height="100%" fill="currentColor" mask={`url(#${maskId})`} />
      </Primitive.svg>
    );
  },
);

TourSpotlight.displayName = SPOTLIGHT_NAME;

/* -------------------------------------------------------------------------------------------------
 * TourTitle
 * -----------------------------------------------------------------------------------------------*/

const TITLE_NAME = "TourTitle";

type TourTitleElement = React.ComponentRef<typeof Primitive.h2>;
type PrimitiveHeadingProps = React.ComponentPropsWithoutRef<typeof Primitive.h2>;
interface TourTitleProps extends PrimitiveHeadingProps {}

const TourTitle = React.forwardRef<TourTitleElement, TourTitleProps>(
  (props: ScopedProps<TourTitleProps>, forwardedRef) => {
    const { __scopeTour, children, ...titleProps } = props;

    const context = useTourContext(TITLE_NAME, __scopeTour);

    const ref = React.useRef<TourTitleElement>(null);
    const composedRef = useComposedRefs(forwardedRef, ref);

    useStepFade(ref, context.step.id, context.motion);

    const generatedId = React.useId();
    const id = titleProps.id ?? generatedId;
    const { onTitleIdChange } = context;

    useLayoutEffect(() => {
      onTitleIdChange(id);

      return () => onTitleIdChange(undefined);
    }, [id, onTitleIdChange]);

    return (
      <Primitive.h2 {...titleProps} id={id} ref={composedRef}>
        {children ?? context.step.title}
      </Primitive.h2>
    );
  },
);

TourTitle.displayName = TITLE_NAME;

/* -------------------------------------------------------------------------------------------------
 * TourDescription
 * -----------------------------------------------------------------------------------------------*/

const DESCRIPTION_NAME = "TourDescription";

type TourDescriptionElement = React.ComponentRef<typeof Primitive.p>;
type PrimitiveParagraphProps = React.ComponentPropsWithoutRef<typeof Primitive.p>;
interface TourDescriptionProps extends PrimitiveParagraphProps {}

const TourDescription = React.forwardRef<TourDescriptionElement, TourDescriptionProps>(
  (props: ScopedProps<TourDescriptionProps>, forwardedRef) => {
    const { __scopeTour, children, ...descriptionProps } = props;

    const context = useTourContext(DESCRIPTION_NAME, __scopeTour);

    const ref = React.useRef<TourDescriptionElement>(null);
    const composedRef = useComposedRefs(forwardedRef, ref);

    useStepFade(ref, context.step.id, context.motion);

    const generatedId = React.useId();
    const id = descriptionProps.id ?? generatedId;
    const { onDescriptionIdChange } = context;

    useLayoutEffect(() => {
      onDescriptionIdChange(id);

      return () => onDescriptionIdChange(undefined);
    }, [id, onDescriptionIdChange]);

    return (
      <Primitive.p {...descriptionProps} id={id} ref={composedRef}>
        {children ?? context.step.description}
      </Primitive.p>
    );
  },
);

TourDescription.displayName = DESCRIPTION_NAME;

/* -------------------------------------------------------------------------------------------------
 * TourProgress
 * -----------------------------------------------------------------------------------------------*/

const PROGRESS_NAME = "TourProgress";

type TourProgressElement = React.ComponentRef<typeof Primitive.span>;
type PrimitiveSpanProps = React.ComponentPropsWithoutRef<typeof Primitive.span>;
interface TourProgressProps extends PrimitiveSpanProps {}

const TourProgress = React.forwardRef<TourProgressElement, TourProgressProps>(
  (props: ScopedProps<TourProgressProps>, forwardedRef) => {
    const { __scopeTour, children, ...progressProps } = props;

    const context = useTourContext(PROGRESS_NAME, __scopeTour);

    return (
      <Primitive.span {...progressProps} ref={forwardedRef}>
        {children ?? `${context.index + 1} / ${context.steps.length}`}
      </Primitive.span>
    );
  },
);

TourProgress.displayName = PROGRESS_NAME;

/* -------------------------------------------------------------------------------------------------
 * TourNext
 * -----------------------------------------------------------------------------------------------*/

const NEXT_NAME = "TourNext";

type TourNextElement = React.ComponentRef<typeof Primitive.button>;
type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>;
interface TourNextProps extends PrimitiveButtonProps {}

const TourNext = React.forwardRef<TourNextElement, TourNextProps>(
  (props: ScopedProps<TourNextProps>, forwardedRef) => {
    const { __scopeTour, ...nextProps } = props;

    const context = useTourContext(NEXT_NAME, __scopeTour);

    return (
      <Primitive.button
        type="button"
        {...nextProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(props.onClick, context.onNext)}
      />
    );
  },
);

TourNext.displayName = NEXT_NAME;

/* -------------------------------------------------------------------------------------------------
 * TourPrevious
 * -----------------------------------------------------------------------------------------------*/

const PREVIOUS_NAME = "TourPrevious";

type TourPreviousElement = React.ComponentRef<typeof Primitive.button>;
interface TourPreviousProps extends PrimitiveButtonProps {}

const TourPrevious = React.forwardRef<TourPreviousElement, TourPreviousProps>(
  (props: ScopedProps<TourPreviousProps>, forwardedRef) => {
    const { __scopeTour, ...previousProps } = props;

    const context = useTourContext(PREVIOUS_NAME, __scopeTour);

    function handleClick() {
      if (!context.isFirst) {
        context.onPrevious();
      }
    }

    return (
      <Primitive.button
        type="button"
        aria-disabled={context.isFirst || undefined}
        data-disabled={context.isFirst ? "" : undefined}
        {...previousProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(props.onClick, handleClick)}
      />
    );
  },
);

TourPrevious.displayName = PREVIOUS_NAME;

/* -------------------------------------------------------------------------------------------------
 * TourClose
 * -----------------------------------------------------------------------------------------------*/

const CLOSE_NAME = "TourClose";

type TourCloseElement = React.ComponentRef<typeof Primitive.button>;
interface TourCloseProps extends PrimitiveButtonProps {}

const TourClose = React.forwardRef<TourCloseElement, TourCloseProps>(
  (props: ScopedProps<TourCloseProps>, forwardedRef) => {
    const { __scopeTour, ...closeProps } = props;

    const context = useTourContext(CLOSE_NAME, __scopeTour);

    return (
      <Primitive.button
        type="button"
        {...closeProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(props.onClick, context.onClose)}
      />
    );
  },
);

TourClose.displayName = CLOSE_NAME;

/* -----------------------------------------------------------------------------------------------*/

const Root = Tour;
const Content = TourContent;
const Arrow = TourArrow;
const Spotlight = TourSpotlight;
const Title = TourTitle;
const Description = TourDescription;
const Progress = TourProgress;
const Next = TourNext;
const Previous = TourPrevious;
const Close = TourClose;

export type {
  TourArrowProps,
  TourCloseProps,
  TourContentProps,
  TourDescriptionProps,
  TourNextProps,
  TourPreviousProps,
  TourProgressProps,
  TourProps,
  TourSpotlightProps,
  TourStep,
  TourTitleProps,
};
export {
  Arrow,
  Close,
  Content,
  createTourScope,
  Description,
  Next,
  Previous,
  Progress,
  //
  Root,
  Spotlight,
  Title,
  //
  Tour,
  TourArrow,
  TourClose,
  TourContent,
  TourDescription,
  TourNext,
  TourPrevious,
  TourProgress,
  TourSpotlight,
  TourTitle,
  useTour,
};
