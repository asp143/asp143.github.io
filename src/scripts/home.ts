type DelayValue = number | ((index: number) => number);
type MotionOptions = Omit<KeyframeAnimationOptions, 'delay'> & {
  delay?: DelayValue;
};
type DotState = 'hidden' | 'homing' | 'resting' | 'rolled';
type PostHogCaptureProps = Record<string, number | string>;
type PostHogClient = {
  capture: (eventName: string, properties?: PostHogCaptureProps) => void;
};

const DEFAULT_EASING = 'cubic-bezier(0.16, 1, 0.3, 1)';

function revealMotionElements() {
  document.querySelectorAll<HTMLElement>('.motion-fade, .motion-letter, .motion-stagger').forEach((element) => {
    element.style.opacity = '1';
    element.style.transform = 'none';
  });
}

function setStatValues() {
  document.querySelectorAll<HTMLElement>('.about-stat-number[data-count]').forEach((element) => {
    element.textContent = `${element.dataset.count ?? '0'}+`;
  });
}

function animateElements(
  targets: Iterable<Element> | ArrayLike<Element>,
  keyframes: PropertyIndexedKeyframes,
  options: MotionOptions = {}
) {
  return Array.from(targets).map((target, index) => {
    const { delay, ...rest } = options;

    return (target as HTMLElement).animate(keyframes, {
      fill: 'forwards',
      easing: DEFAULT_EASING,
      ...rest,
      delay: typeof delay === 'function' ? delay(index) : delay
    });
  });
}

function observeInView(
  target: Element | string,
  callback: (element: Element) => void,
  { amount = 0 }: { amount?: number } = {}
) {
  const elements = typeof target === 'string'
    ? Array.from(document.querySelectorAll(target))
    : [target];

  if (!elements.length) {
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      observer.unobserve(entry.target);
      callback(entry.target);
    });
  }, { threshold: amount });

  elements.forEach((element) => observer.observe(element));
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsElementAnimations = typeof Element.prototype.animate === 'function';

if (!prefersReducedMotion && supportsElementAnimations) {
  animateElements(
    document.querySelectorAll('.hero-name-letter'),
    { opacity: ['0', '1'], transform: ['translateY(100%)', 'translateY(0)'] },
    { duration: 600, delay: (index) => index * 50 }
  );

  animateElements(
    document.querySelectorAll('.hero .motion-fade'),
    { opacity: ['0', '1'], transform: ['translateY(20px)', 'translateY(0)'] },
    { duration: 800, delay: (index) => 800 + index * 150 }
  );

  const scrollIndicator = document.querySelector<HTMLElement>('.hero-scroll');
  const scrollDot = document.querySelector<HTMLElement>('.scroll-dot');
  const heroPeriod = document.querySelector<HTMLElement>('.hero-period');
  const contactPeriod = document.querySelector<HTMLElement>('.contact-period');
  const hero = document.querySelector<HTMLElement>('.hero');
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.section'));

  if (scrollDot && hero && sections.length > 0) {
    let state: DotState = 'hidden';
    let currentIndex = -1;
    let ticking = false;
    let pulseAnimation: Animation | null = null;
    let rollTimeoutA: number | null = null;
    let rollTimeoutB: number | null = null;
    let homingFrame: number | null = null;
    let returnFrame: number | null = null;

    let dotX = 0;
    let dotY = 0;

    const DOT_SIZE = 10;
    const DOT_RADIUS = DOT_SIZE / 2;
    const DOT_SIDE_GAP = 12;
    const HOMING_SPEED = 0.13;
    const SNAP_THRESHOLD = 0.5;

    function positionDotAt(x: number, y: number) {
      scrollDot.style.left = `${x}px`;
      scrollDot.style.top = `${y}px`;
    }

    function getDotTarget(index: number) {
      const marker = sections[index]?.querySelector<HTMLElement>('.dot-target');
      if (!marker) {
        return { x: window.innerWidth / 2, y: 60 };
      }

      const rect = marker.getBoundingClientRect();
      return {
        x: rect.right + DOT_SIDE_GAP,
        y: rect.top + rect.height * 0.5 - DOT_RADIUS
      };
    }

    function getActiveIndex() {
      let active = 0;

      sections.forEach((section, index) => {
        const marker = section.querySelector<HTMLElement>('.dot-target');
        if (marker) {
          if (marker.getBoundingClientRect().top <= window.innerHeight * 0.75) {
            active = index;
          }
          return;
        }

        if (window.scrollY + window.innerHeight >= section.offsetTop) {
          active = index;
        }
      });

      return Math.min(active, sections.length - 1);
    }

    function clearRollTimeouts() {
      if (rollTimeoutA !== null) {
        window.clearTimeout(rollTimeoutA);
        rollTimeoutA = null;
      }

      if (rollTimeoutB !== null) {
        window.clearTimeout(rollTimeoutB);
        rollTimeoutB = null;
      }
    }

    function cancelHoming() {
      if (homingFrame !== null) {
        cancelAnimationFrame(homingFrame);
        homingFrame = null;
      }

      if (pulseAnimation) {
        pulseAnimation.cancel();
        pulseAnimation = null;
      }
    }

    function cancelReturn() {
      if (returnFrame !== null) {
        cancelAnimationFrame(returnFrame);
        returnFrame = null;
      }
    }

    function resetRolling() {
      clearRollTimeouts();

      if (state === 'rolled') {
        scrollDot.classList.remove('scroll-dot--rolling', 'scroll-dot--settled');
        scrollDot.style.opacity = '';
        if (contactPeriod) {
          contactPeriod.style.opacity = '';
        }
      }
    }

    function startHoming(targetIndex: number) {
      cancelHoming();
      cancelReturn();
      clearRollTimeouts();

      if (targetIndex < sections.length - 1) {
        resetRolling();
      }

      state = 'homing';
      currentIndex = targetIndex;

      const tick = () => {
        const target = getDotTarget(currentIndex);

        dotX += (target.x - dotX) * HOMING_SPEED;
        dotY += (target.y - dotY) * HOMING_SPEED;
        positionDotAt(dotX, dotY);

        if (Math.abs(target.x - dotX) < SNAP_THRESHOLD && Math.abs(target.y - dotY) < SNAP_THRESHOLD) {
          dotX = target.x;
          dotY = target.y;
          positionDotAt(dotX, dotY);
          homingFrame = null;

          pulseAnimation = scrollDot.animate(
            { transform: ['scale(1)', 'scale(1.2)', 'scale(1)'] },
            { duration: 300, easing: DEFAULT_EASING }
          );

          if (currentIndex === sections.length - 1 && contactPeriod) {
            rollTimeoutA = window.setTimeout(() => {
              const periodRect = contactPeriod.getBoundingClientRect();
              const periodCenterX = periodRect.left + periodRect.width / 2;
              const periodCenterY = periodRect.top + periodRect.height / 2;

              scrollDot.classList.add('scroll-dot--rolling');
              positionDotAt(periodCenterX, periodCenterY);

              rollTimeoutB = window.setTimeout(() => {
                scrollDot.classList.add('scroll-dot--settled');
                scrollDot.style.opacity = '0';
                contactPeriod.style.opacity = '1';
                state = 'rolled';
              }, 550);
            }, 200);

            return;
          }

          state = 'resting';
          return;
        }

        homingFrame = requestAnimationFrame(tick);
      };

      homingFrame = requestAnimationFrame(tick);
    }

    const onScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroBottom = hero.offsetHeight * 0.7;

        if (scrollIndicator) {
          const fade = Math.max(1 - scrollY / (window.innerHeight * 0.3), 0);
          scrollIndicator.style.opacity = String(fade);
        }

        if (scrollY <= heroBottom) {
          if (state !== 'hidden') {
            cancelHoming();
            clearRollTimeouts();
            resetRolling();

            if (heroPeriod) {
              heroPeriod.style.opacity = '0';
              cancelReturn();

              const returnTick = () => {
                const heroRect = heroPeriod.getBoundingClientRect();
                const targetX = heroRect.left + heroRect.width / 2;
                const targetY = heroRect.top + heroRect.height / 2;

                dotX += (targetX - dotX) * 0.2;
                dotY += (targetY - dotY) * 0.2;
                positionDotAt(dotX, dotY);

                if (Math.abs(targetX - dotX) < 0.5 && Math.abs(targetY - dotY) < 0.5) {
                  scrollDot.classList.remove('scroll-dot--visible');
                  heroPeriod.style.opacity = '1';
                  returnFrame = null;
                  return;
                }

                returnFrame = requestAnimationFrame(returnTick);
              };

              returnFrame = requestAnimationFrame(returnTick);
            } else {
              scrollDot.classList.remove('scroll-dot--visible');
            }

            state = 'hidden';
            currentIndex = -1;

            if (contactPeriod) {
              contactPeriod.style.opacity = '';
            }
          }

          ticking = false;
          return;
        }

        scrollDot.classList.add('scroll-dot--visible');
        cancelReturn();

        if (heroPeriod) {
          heroPeriod.style.opacity = '0';
        }

        const activeIndex = getActiveIndex();

        if (state === 'hidden') {
          if (heroPeriod) {
            const heroRect = heroPeriod.getBoundingClientRect();
            dotX = heroRect.left + heroRect.width / 2;
            dotY = heroRect.top + heroRect.height / 2;
          } else {
            const target = getDotTarget(activeIndex);
            dotX = target.x;
            dotY = target.y - 100;
          }

          positionDotAt(dotX, dotY);
          startHoming(activeIndex);
          ticking = false;
          return;
        }

        if (state === 'resting') {
          const target = getDotTarget(currentIndex);
          dotX = target.x;
          dotY = target.y;
          positionDotAt(dotX, dotY);

          if (activeIndex !== currentIndex) {
            startHoming(activeIndex);
          }
        } else if (state === 'rolled' && activeIndex < currentIndex) {
          resetRolling();
          scrollDot.classList.add('scroll-dot--visible');
          startHoming(activeIndex);
        } else if (state === 'homing' && activeIndex !== currentIndex) {
          startHoming(activeIndex);
        }

        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  } else if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      const fade = Math.max(1 - window.scrollY / (window.innerHeight * 0.3), 0);
      scrollIndicator.style.opacity = String(fade);
    }, { passive: true });
  }

  document.querySelectorAll('.section').forEach((section) => {
    observeInView(section, () => {
      animateElements(
        section.querySelectorAll('.motion-fade'),
        { opacity: ['0', '1'], transform: ['translateY(20px)', 'translateY(0)'] },
        { duration: 600, delay: (index) => index * 100 }
      );
    }, { amount: 0.1 });
  });

  document.querySelectorAll('.section').forEach((section) => {
    observeInView(section, () => {
      animateElements(
        section.querySelectorAll('.motion-stagger'),
        { opacity: ['0', '1'], transform: ['translateY(16px)', 'translateY(0)'] },
        { duration: 500, delay: (index) => index * 60 }
      );
    }, { amount: 0.05 });
  });

  let statsCounted = false;
  observeInView('#about', () => {
    if (statsCounted) {
      return;
    }

    statsCounted = true;

    document.querySelectorAll<HTMLElement>('.about-stat-number[data-count]').forEach((element) => {
      const target = Number.parseInt(element.dataset.count ?? '0', 10);
      const duration = 1200;
      const start = performance.now();

      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = `${Math.round(eased * target)}+`;

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    });
  }, { amount: 0.2 });

  let contactHighlighted = false;
  observeInView('#contact', () => {
    if (contactHighlighted) {
      return;
    }

    contactHighlighted = true;

    document.querySelectorAll<HTMLElement>('.contact-link').forEach((link, index) => {
      const start = 500 + index * 550;
      window.setTimeout(() => link.classList.add('is-highlighted'), start);
      window.setTimeout(() => link.classList.remove('is-highlighted'), start + 400);
    });
  }, { amount: 0.05 });
} else {
  revealMotionElements();
  setStatValues();
}

const posthog = (window as Window & { posthog?: PostHogClient }).posthog;

if (posthog) {
  const sectionIds = ['hero', 'about', 'projects', 'side-projects', 'writing', 'contact'];
  const viewedSections = new Set<string>();

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const id = entry.target.id;
      if (viewedSections.has(id)) {
        return;
      }

      viewedSections.add(id);
      sectionObserver.unobserve(entry.target);
      posthog.capture('section_viewed', { section: id });
    });
  }, { threshold: 0.3 });

  sectionIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      sectionObserver.observe(element);
    }
  });

  const depthMarks = new Set<number>();
  let depthTicking = false;

  const onScrollDepth = () => {
    if (depthTicking) {
      return;
    }

    depthTicking = true;

    requestAnimationFrame(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrollPercent = Math.round((window.scrollY / docHeight) * 100);

        [25, 50, 75, 100].forEach((mark) => {
          if (scrollPercent >= mark && !depthMarks.has(mark)) {
            depthMarks.add(mark);
            posthog.capture('scroll_depth', { percent: mark });
          }
        });
      }

      depthTicking = false;
    });
  };

  window.addEventListener('scroll', onScrollDepth, { passive: true });

  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
    if (!link) {
      return;
    }

    const href = link.href;

    if (link.closest('#contact')) {
      posthog.capture('contact_clicked', {
        method: link.textContent?.trim().toLowerCase() || href,
        href
      });
      return;
    }

    if (link.closest('#writing')) {
      posthog.capture('writing_clicked', {
        title: link.querySelector('.writing-title')?.textContent?.trim() || href,
        href
      });
      return;
    }

    if (link.closest('#side-projects')) {
      posthog.capture('side_project_clicked', {
        name: link.querySelector('.side-project-name')?.textContent?.trim() || href,
        href
      });
    }
  });
}
