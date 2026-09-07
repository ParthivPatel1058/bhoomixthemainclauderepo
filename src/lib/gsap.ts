import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

/**
 * Single place GSAP plugins are registered.
 *
 * Registration was previously duplicated inside two components' effects.
 * GSAP de-duplicates, so it worked, but the official guidance is to register
 * once at module level rather than anywhere that re-renders — and a single
 * list is also the only way to see at a glance what this app actually pulls
 * in from the library.
 *
 * SplitText is included because every GSAP plugin is free now, Club tier and
 * all. It ships in the public `gsap` package; there is no auth token, private
 * registry or licence key involved, and any instruction to add one is stale.
 */
// useGSAP is itself a plugin and has to be registered like any other.
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

export { gsap, useGSAP, ScrollTrigger, SplitText };
