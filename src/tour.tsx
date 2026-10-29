"use client";

import { composeEventHandlers } from "@radix-ui/primitive";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import type { Scope } from "@radix-ui/react-context";
import { createContextScope } from "@radix-ui/react-context";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Primitive } from "@radix-ui/react-primitive";
import { useLayoutEffect } from "@radix-ui/react-use-layout-effect";
import * as React from "react";
import { useRect, useTarget, useTourKeys } from "./hooks";
import "./styles.css";
import type { TourProps, TourStep } from "./types";

type ScopedProps<P> = P & { __scopeTour?: Scope };

type TourDirection = "from-start" | "from-end";

/* -------------------------------------------------------------------------------------------------
 * Tour
 * -----------------------------------------------------------------------------------------------*/

const TOUR_NAME = "Tour";

interface TourContextValue {
  steps: TourStep[];
  index: number;
  step: TourStep;
  isFirst: boolean;
  isLast: boolean;
  open: boolean;

  motion: boolean;

  direction: TourDirection;

  /** The resolved DOM element for the current step, or null while it is still missing. */
  target: Element | null;

  contentId: string;

  titleId: string | undefined;
  descriptionId: string | undefined;
  onTitleIdChange: (id: string | undefined) => void;
  onDescriptionIdChange: (id: string | undefined) => void;

  focus: React.RefObject<FocusState>;

  onNext: () => void;
  onPrevious: () => void;
  onGoTo: (index: number) => void;
  onClose: () => void;
}

interface FocusState {
  opened: boolean;

  within: boolean;
}

const [createTourContext, createTourScope] = createContextScope(TOUR_NAME);
const [TourProvider, useTourContext] = createTourContext<TourContextValue>(TOUR_NAME);

function Tour(props: ScopedProps<TourProps>) {
  const { __scopeTour, steps, open, onOpenChange, motion = true, children } = props;

  const [index, setIndex] = React.useState(0);
  const [titleId, setTitleId] = React.useState<string | undefined>();
  const [descriptionId, setDescriptionId] = React.useState<string | undefined>();
  const [direction, setDirection] = React.useState<TourDirection>("from-start");
  const [wasOpen, setWasOpen] = React.useState(open);

  const contentId = React.useId();
  const focus = React.useRef<FocusState>({ opened: false, within: false });

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

  useLayoutEffect(() => {
    if (open) {
      openerRef.current = document.activeElement;
    }
  }, [open]);

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
    const { __scopeTour, onOpenAutoFocus, ...contentProps } = props;

    const context = useTourContext(CONTENT_NAME, __scopeTour);

    const anchorRef = React.useRef<Element | null>(null);
    const cardRef = React.useRef<TourContentElement | null>(null);

    const composedRef = useComposedRefs(forwardedRef, cardRef);

    const [announcement, setAnnouncement] = React.useState("");
    const [wasOpen, setWasOpen] = React.useState(false);
    const [placed, setPlaced] = React.useState(false);

    const { target, index, titleId, focus } = context;
    const hasTarget = target !== null;
    const stepCount = context.steps.length;
    const stepTitle = context.step.title;
    const cardId = contentProps.id ?? context.contentId;

    if (context.open !== wasOpen) {
      setWasOpen(context.open);

      if (context.open) {
        anchorRef.current = null;
      }
    }

    if (target) {
      anchorRef.current = target;
    }

    const open = context.open && anchorRef.current !== null;

    React.useEffect(() => {
      if (!open) {
        setPlaced(false);

        return;
      }

      const frame = requestAnimationFrame(() => setPlaced(true));

      return () => cancelAnimationFrame(frame);
    }, [open]);

    React.useEffect(() => {
      if (!hasTarget) {
        return;
      }

      const renderedTitle = titleId ? document.getElementById(titleId)?.textContent : null;
      const title = renderedTitle || (typeof stepTitle === "string" ? stepTitle : "");

      setAnnouncement(`Step ${index + 1} of ${stepCount}${title ? `: ${title}` : ""}`);
    }, [hasTarget, index, stepCount, stepTitle, titleId]);

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

    return (
      <>
        {open ? (
          <span role="status" aria-live="polite" data-tour-announcer="" style={visuallyHidden}>
            {announcement}
          </span>
        ) : null}

        <PopoverPrimitive.Root open={open}>
          <PopoverPrimitive.Anchor virtualRef={anchorRef as React.RefObject<Element>} />

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              side={context.step.side ?? "bottom"}
              align={context.step.align ?? "center"}
              sideOffset={14}
              collisionPadding={12}
              data-tour-content=""
              data-step={context.index}
              data-motion={context.motion ? context.direction : undefined}
              data-placed={placed ? "" : undefined}
              aria-labelledby={context.titleId}
              aria-describedby={context.descriptionId}
              {...contentProps}
              id={cardId}
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

    return (
      <Primitive.svg
        aria-hidden
        data-tour-spotlight=""
        data-motion={context.motion ? "" : undefined}
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

    const generatedId = React.useId();
    const id = titleProps.id ?? generatedId;
    const { onTitleIdChange } = context;

    useLayoutEffect(() => {
      onTitleIdChange(id);

      return () => onTitleIdChange(undefined);
    }, [id, onTitleIdChange]);

    return (
      <Primitive.h2
        key={context.step.id}
        data-tour-title=""
        data-motion={context.motion ? "" : undefined}
        {...titleProps}
        id={id}
        ref={forwardedRef}
      >
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

    const generatedId = React.useId();
    const id = descriptionProps.id ?? generatedId;
    const { onDescriptionIdChange } = context;

    useLayoutEffect(() => {
      onDescriptionIdChange(id);

      return () => onDescriptionIdChange(undefined);
    }, [id, onDescriptionIdChange]);

    return (
      <Primitive.p
        key={context.step.id}
        data-tour-description=""
        data-motion={context.motion ? "" : undefined}
        {...descriptionProps}
        id={id}
        ref={forwardedRef}
      >
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
  TourSpotlightProps,
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
