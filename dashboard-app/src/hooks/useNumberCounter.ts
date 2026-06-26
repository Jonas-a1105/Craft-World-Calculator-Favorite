import { useEffect, useState } from 'react';
import anime from 'animejs';

/**
 * Custom React hook to smoothly animate a number change using anime.js.
 * @param targetVal The target number to count towards.
 * @returns The current animated integer value.
 */
export function useNumberCounter(targetVal: number): number {
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    const animObj = { val: displayVal };
    const animation = anime({
      targets: animObj,
      val: targetVal,
      round: 1,
      duration: 600,
      easing: 'easeOutQuad',
      update: () => {
        setDisplayVal(animObj.val);
      }
    });

    return () => {
      animation.pause();
    };
  }, [targetVal]);

  return displayVal;
}
