"use client";

import { AnimatePresence, motion } from "framer-motion";

interface CardHeaderImageProps {
  characterPortrait?: string;
  locationImage?: string;
  isActive?: boolean;
  isNew?: boolean;
}

/**
 * Visual decoration component for card headers
 * Handles location images, active indicators, and character portraits
 */
export function CardHeaderImage({
  characterPortrait,
  locationImage,
  isActive = false,
  isNew = false,
}: CardHeaderImageProps) {
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
}
