import "intersection-observer";

/**
 * Svelte action type with a generic representation of the optional parameters.
 *
 * See https://svelte.dev/docs#use_action.
 */
interface SvelteAction<T> {
  (
    /** bound element */
    node: HTMLElement,
    /** optional parameters */
    parameters?: T,
  ): {
    destroy?: () => void;
    update?: (parameters: T) => void;
  };
}

/**
 * Overlap action event parameter type.
 */
interface OverlapEventDetail {
  /**
   * Entry representing the element being intersected by target.
   */
  entry: IntersectionObserverEntry;
  /**
   * IntersectionObserver instance attached to the action.
   */
  observer: IntersectionObserver;
}

export const overlap: SvelteAction<IntersectionObserverInit> = function(
  node,
  options,
) {
  let observer: IntersectionObserver;
  const callback: IntersectionObserverCallback = entries =>
    entries.map(entry => {
      if (entry.isIntersecting) {
        // Entering a threshold event
        node.dispatchEvent(
          new CustomEvent<OverlapEventDetail>("enterOverlap", {
            detail: { entry, observer },
          }),
        );
      } else {
        // Leaving a threshold event
        node.dispatchEvent(
          new CustomEvent<OverlapEventDetail>("leaveOverlap", {
            detail: { entry, observer },
          }),
        );
      }
      // Entering or leaving a threshold event
      node.dispatchEvent(
        new CustomEvent<OverlapEventDetail>("overlap", {
          detail: { entry, observer },
        }),
      );
    });
  observer = new IntersectionObserver(callback, options);
  observer.observe(node);

  return {
    destroy(): void {
      observer.unobserve(node);
    },
    update(newOptions): void {
      observer.unobserve(node);
      observer = new IntersectionObserver(callback, newOptions);
      observer.observe(node);
    },
  };
};
