export const snapTransition = {
  duration: 0.03,
  ease: "linear",
  type: "tween" // Force tween animation, not spring
};

export const professionalTransition = {
  duration: 0.03,
  ease: "linear",
  type: "tween"
};

export const professionalStagger = {
  duration: 0.03,
  ease: "linear",
  staggerChildren: 0.001,
  type: "tween"
};

export const professionalSlide = {
  duration: 0.04,
  ease: "linear",
  type: "tween"
};

export const expandTransition = {
  duration: 0.05,
  ease: "linear",
  type: "tween"
};

export const instantTransition = {
  duration: 0.02,
  ease: "linear",
  type: "tween"
};

// Force no springs anywhere
export const noSpring = {
  type: "tween",
  duration: 0.03,
  ease: "linear"
};