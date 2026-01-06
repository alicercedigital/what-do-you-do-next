"use client";

import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ANIMATION, CARD_DIMENSIONS } from "@/lib/constants/game";
import type { CardType } from "@/lib/constants/game";

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

  // Common header with image/portrait area
  const renderHeader = () => {
    if (!characterPortrait && !locationImage && !isActive) return null;

    return (
      <div className="relative h-32 bg-secondary/30 overflow-hidden shrink-0">
        {locationImage ? (
          <img
            src={locationImage}
            alt="Location"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary/50 to-secondary/20 flex items-center justify-center">
            <span className="text-muted-foreground/40 text-xs font-mono">
              Location
            </span>
          </div>
        )}

        {/* Active indicator line */}
        <div className="absolute bottom-0 left-0 right-0">
          <AnimatePresence>
            {isActive && (
              <motion.div
                className="h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 relative overflow-hidden"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{
                  scaleX: 0,
                  opacity: 0,
                  transition: { duration: 0.4, ease: "easeInOut" },
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={
                    isNew ? { x: ["100%", "-100%"] } : { x: "100%", opacity: 0 }
                  }
                  transition={
                    isNew
                      ? { x: { duration: 1.5, repeat: 2, ease: "easeInOut" } }
                      : { duration: 0.8 }
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Portrait overlay */}
        {characterPortrait && (
          <div className="absolute top-20 right-3 z-30">
            <div className="w-24 h-24 rounded-full border-4 border-card bg-secondary overflow-hidden shadow-lg">
              <img
                src={characterPortrait}
                alt="Character"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    );
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
        {renderHeader()}
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
