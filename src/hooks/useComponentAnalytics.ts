import { useEffect, useRef } from 'react';
import { trackEvent } from '../analytics';

export function useComponentAnalytics(componentName: string) {
	const ref = useRef<HTMLElement | null>(null);
	const seenRef = useRef(false);

	useEffect(() => {
		trackEvent('component_mount', { component: componentName });
		return () => {
			trackEvent('component_unmount', { component: componentName });
		};
	}, [componentName]);

	useEffect(() => {
		const el = ref.current;
		if (!el || !('IntersectionObserver' in window)) return;
		const io = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === el && entry.isIntersecting && entry.intersectionRatio >= 0.5 && !seenRef.current) {
					seenRef.current = true;
					trackEvent('component_view', { component: componentName });
				}
			}
		}, { threshold: [0.5] });
		io.observe(el);
		return () => io.disconnect();
	}, [componentName]);

	useEffect(() => {
		const el = ref.current as HTMLElement | null;
		if (!el) return;
		const onClick = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			trackEvent('component_click', {
				component: componentName,
				target_tag: target?.tagName?.toLowerCase(),
				target_id: target?.id || null,
				text: target?.textContent?.trim()?.slice(0, 80) || null,
			});
		};
		el.addEventListener('click', onClick, { capture: true });
		return () => el.removeEventListener('click', onClick, { capture: true } as any);
	}, [componentName]);

	return ref;
}




