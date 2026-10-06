"use client";

import { composeEventHandlers } from "@radix-ui/primitive";
import type { Scope } from "@radix-ui/react-context";
import { createContextScope } from "@radix-ui/react-context";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useRect } from "../hooks/use-rect";
import { useTarget } from "../hooks/use-target";

type ScopedProps<P> = P & { __scopeTour?: Scope };

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

  /** The resolved DOM element for the current step, or null while it is still missing. */
  target: Element | null;

  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

const [createTourContext, createTourScope] = createContextScope(TOUR_NAME);
const [TourProvider, useTourContext] = createTourContext<TourContextValue>(TOUR_NAME);

interface TourProps {
  steps: TourStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: React.ReactNode;
}

function Tour(props: ScopedProps<TourProps>) {
  const { __scopeTour, steps, open, onOpenChange, children } = props;

  const [index, setIndex] = React.useState(0);

  const step = steps[index];
  const target = useTarget(open ? step?.target : undefined);

  React.useEffect(() => {
    if (open) {
      setIndex(0);
    }
  }, [open]);

  React.useEffect(() => {
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [target]);

  if (!open || !step) {
    return null;
  }

  const isLastStep = index === steps.length - 1;

  function handleNext() {
    if (isLastStep) {
      onOpenChange(false);

      return;
    }

    setIndex(index + 1);
  }

  return (
    <TourProvider
      scope={__scopeTour}
      steps={steps}
      index={index}
      step={step}
      target={target}
      onNext={handleNext}
      onPrevious={() => setIndex(Math.max(0, index - 1))}
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
    isFirst: context.index === 0,
    isLast: context.index === context.steps.length - 1,
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

/** Popover anchored to the current step's target. Renders nothing until the target exists. */
const TourContent = React.forwardRef<TourContentElement, TourContentProps>(
  (props: ScopedProps<TourContentProps>, forwardedRef) => {
    const { __scopeTour, ...contentProps } = props;

    const context = useTourContext(CONTENT_NAME, __scopeTour);

    const anchorRef = React.useRef<Element | null>(null);

    anchorRef.current = context.target;

    if (!context.target) {
      return null;
    }

    return (
      <PopoverPrimitive.Root open>
        <PopoverPrimitive.Anchor virtualRef={anchorRef as React.RefObject<Element>} />

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side={context.step.side ?? "bottom"}
            align={context.step.align ?? "center"}
            sideOffset={14}
            collisionPadding={12}
            data-step={context.index}
            {...contentProps}
            ref={forwardedRef}
            onEscapeKeyDown={composeEventHandlers(contentProps.onEscapeKeyDown, context.onClose)}
            onInteractOutside={composeEventHandlers(contentProps.onInteractOutside, (event) =>
              event.preventDefault(),
            )}
          />
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
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
    const rect = useRect(context.target);

    const maskId = `tour-mask-${React.useId().replace(/:/g, "")}`;

    if (!rect) {
      return null;
    }

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

    return (
      <Primitive.h2 {...titleProps} ref={forwardedRef}>
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

    return (
      <Primitive.p {...descriptionProps} ref={forwardedRef}>
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

    return (
      <Primitive.button
        type="button"
        {...previousProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(props.onClick, context.onPrevious)}
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
