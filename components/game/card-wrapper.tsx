"use client";

import { Card } from "@/components/ui/card";
import type { CardType } from "@/lib/constants/game";
import { ANIMATION, CARD_DIMENSIONS } from "@/lib/constants/game";
import { cn } from "@/lib/utils";
import { motion, type Transition } from "framer-motion";
import { Handle, Position } from "reactflow";
import { CardHeaderImage } from "./card-header-image";

interface CardWrapperProps {
  children: React.ReactNode;
  type: CardType;
  isNew?: boolean;
  showHandles?: boolean;
  className?: string;
  borderColor?: string;
  // Animation props
  animateFrom?: "left" | "right" | "top" | "bottom";
  // Common card data
  isActive?: boolean;
  characterPortrait?: string;
  locationImage?: string;
}

/**
 * Reusable card wrapper that provides consistent styling, animations, and handles
 * for all game card components
 */
export function CardWrapper({
  children,
  type,
  isNew = false,
  showHandles = true,
  className,
  borderColor,
  animateFrom = "top",
  isActive = false,
  characterPortrait,
  locationImage,
}: CardWrapperProps) {
  const dimensions = CARD_DIMENSIONS[type];

  // Spring transition for consistent animations
  const springTransition: Transition = {
    type: "spring",
    stiffness: ANIMATION.spring.stiffness,
    damping: ANIMATION.spring.damping,
    mass: ANIMATION.spring.mass,
  };

  // Calculate animation initial state based on direction
  const getInitialAnimation = () => {
    const baseProps = {
      scale: ANIMATION.scale.new,
      opacity: ANIMATION.opacity.hidden,
    };

    switch (animateFrom) {
      case "left":
        return { ...baseProps, x: -ANIMATION.y.offset };
      case "right":
        return { ...baseProps, x: ANIMATION.y.offset };
      case "bottom":
        return { ...baseProps, y: ANIMATION.y.offset };
      default: // "top"
        return { ...baseProps, y: ANIMATION.y.offset };
    }
  };

  const animationProps = isNew
    ? {
        initial: getInitialAnimation(),
        animate: {
          scale: ANIMATION.scale.normal,
          opacity: ANIMATION.opacity.visible,
          x: 0,
          y: 0,
        },
        transition: springTransition,
      }
    : {
        initial: false,
        animate: {
          scale: ANIMATION.scale.normal,
          opacity: ANIMATION.opacity.visible,
          x: 0,
          y: 0,
        },
        transition: springTransition,
      };

  return (
    <motion.div {...animationProps} className="relative">
      {showHandles && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            className="!bg-primary !w-3 !h-3 !border-2 !border-background"
          />
          <Handle
            type="source"
            position={Position.Right}
            className="!bg-primary !w-3 !h-3 !border-2 !border-background"
          />
        </>
      )}

      <Card
        className={cn(
          "bg-card border-border shadow-lg shadow-background/50 overflow-hidden flex flex-col relative",
          borderColor,
          className
        )}
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <CardHeaderImage
          characterPortrait={characterPortrait}
          locationImage={locationImage}
          isActive={isActive}
          isNew={isNew}
        />
        {children}
      </Card>
    </motion.div>
  );
}

/**
 * Hook for common card animation patterns
 */
export const useCardAnimations = () => {
  const springTransition: Transition = {
    type: "spring",
    stiffness: ANIMATION.spring.stiffness,
    damping: ANIMATION.spring.damping,
    mass: ANIMATION.spring.mass,
  };

  const getNewCardAnimation = (
    direction: "left" | "right" | "top" | "bottom" = "top"
  ) => {
    const baseInitial = {
      scale: ANIMATION.scale.new,
      opacity: ANIMATION.opacity.hidden,
    };

    const directionProps = {
      left: { x: -ANIMATION.y.offset },
      right: { x: ANIMATION.y.offset },
      bottom: { y: ANIMATION.y.offset },
      top: { y: ANIMATION.y.offset },
    };

    return {
      initial: { ...baseInitial, ...directionProps[direction] },
      animate: {
        scale: ANIMATION.scale.normal,
        opacity: ANIMATION.opacity.visible,
        x: 0,
        y: 0,
      },
      transition: springTransition,
    };
  };

  const getHeaderAnimation = (isNew: boolean) => ({
    initial: isNew ? { x: -10, opacity: 0 } : false,
    animate: { x: 0, opacity: 1 },
    transition: { delay: 0.1 },
  });

  const getContentAnimation = (isNew: boolean, delay: number = 0.2) => ({
    initial: isNew ? { opacity: 0 } : false,
    animate: { opacity: 1 },
    transition: { delay },
  });

  return {
    springTransition,
    getNewCardAnimation,
    getHeaderAnimation,
    getContentAnimation,
  };
};
