/* Minimal GA4 helper: loads gtag.js and exposes init + event */

const GA_SRC_BASE = 'https://www.googletagmanager.com/gtag/js?id=';

let isInitialized = false;
let autoTrackingEnabled = false;

function loadGtagScript(measurementId: string): void {
	const existing = document.querySelector<HTMLScriptElement>(`script[src^="${GA_SRC_BASE}"]`);
	if (existing) return;
	const script = document.createElement('script');
	script.async = true;
	script.src = `${GA_SRC_BASE}${encodeURIComponent(measurementId)}`;
	document.head.appendChild(script);
}

export function initAnalytics(): void {
	const measurementId = import.meta.env.VITE_GA_ID as string | undefined;
	if (!measurementId) {
		// GA not configured; skip silently
		return;
	}
	loadGtagScript(measurementId);
	// Define dataLayer and gtag
	(window as any).dataLayer = (window as any).dataLayer || [];
	function gtag(...args: any[]) {
		(window as any).dataLayer.push(args);
	}
	(window as any).gtag = gtag;
	gtag('js', new Date());
	gtag('config', measurementId, { 
		send_page_view: false,
		// Enable cross-domain measurement for checkout domain
		linker: { domains: ['pedir.migusto.com.ar'] }
	});
	isInitialized = true;
}

export function trackPageview(path?: string): void {
	if (!isInitialized) return;
	const measurementId = import.meta.env.VITE_GA_ID as string | undefined;
	if (!measurementId) return;
	const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
	if (!gtag) return;
	gtag('event', 'page_view', {
		page_title: document.title,
		page_location: window.location.href,
		page_path: path ?? window.location.pathname,
	});
}

export function trackEvent(eventName: string, params?: Record<string, any>): void {
	if (!isInitialized) return;
	const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
	if (!gtag) return;
	gtag('event', eventName, params ?? {});
}

// ---- Auto tracking helpers ----
function on(target: Window | Document | Element, type: string, handler: (ev: Event) => void, opts?: boolean | AddEventListenerOptions) {
	target.addEventListener(type as any, handler as any, opts as any);
}

function getClickableLabel(el: Element): string {
	const element = el as HTMLElement;
	const aria = element.getAttribute('aria-label');
	if (aria) return aria;
	const text = element.textContent?.trim();
	if (text) return text.slice(0, 80);
	return element.id || element.getAttribute('name') || element.getAttribute('title') || element.tagName;
}

function isClickable(el: Element | null): el is HTMLElement {
	if (!el) return false;
	const tag = el.tagName.toLowerCase();
	if (tag === 'button' || tag === 'a') return true;
	const role = (el as HTMLElement).getAttribute('role');
	if (role === 'button' || role === 'link') return true;
	return (el as HTMLElement).onclick != null;
}

function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
	let last = 0;
	let queued: any[] | null = null;
	return function(this: any, ...args: any[]) {
		const now = Date.now();
		if (now - last >= ms) {
			last = now;
			fn.apply(this, args);
		} else {
			queued = args;
			setTimeout(() => {
				if (queued && Date.now() - last >= ms) {
					last = Date.now();
					fn.apply(this, queued);
					queued = null;
				}
			}, ms - (now - last));
		}
	} as T;
}

export function enableAutoTracking(): void {
	if (!isInitialized || autoTrackingEnabled) return;
	autoTrackingEnabled = true;

	// 1) Clicks en botones y enlaces
	on(document, 'click', (e: Event) => {
		const target = e.target as Element | null;
		const clickable = target && (isClickable(target) ? target : target?.closest('button, a, [role="button"], [role="link"]'));
		if (!clickable) return;
		const tag = (clickable as HTMLElement).tagName.toLowerCase();
		const href = (clickable as HTMLAnchorElement).href || null;
		const label = getClickableLabel(clickable);
		trackEvent('click', {
			element_tag: tag,
			element_id: (clickable as HTMLElement).id || null,
			element_text: label,
			href,
			page_path: window.location.pathname,
		});
	}, { capture: true });

	// 2) Profundidad de scroll (25,50,75,90,100)
	const milestones = new Set<number>([25, 50, 75, 90, 100]);
	const reached = new Set<number>();
	const sendScrollDepth = throttle(() => {
		const scrollTop = window.scrollY;
		const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
		const winHeight = window.innerHeight;
		const percent = Math.min(100, Math.round(((scrollTop + winHeight) / docHeight) * 100));
		for (const m of Array.from(milestones)) {
			if (percent >= m && !reached.has(m)) {
				reached.add(m);
				trackEvent('scroll_depth', { percent: m, page_path: window.location.pathname });
			}
		}
	}, 1000);
	on(window, 'scroll', sendScrollDepth, { passive: true });
	// fire once on load
	sendScrollDepth();

	// 3) Atención/retención: tiempo activo acumulado y milestones
	let active = document.visibilityState === 'visible' && document.hasFocus();
	let lastActiveTs = active ? performance.now() : 0;
	let engagedMs = 0;
	const attentionMilestones = new Set<number>([10000, 30000, 60000, 120000, 300000]); // 10s,30s,1m,2m,5m

	function markActive() {
		if (!active) {
			active = true;
			lastActiveTs = performance.now();
		}
	}
	function markInactive() {
		if (active) {
			active = false;
			engagedMs += performance.now() - lastActiveTs;
			maybeSendAttention();
		}
	}
	function maybeSendAttention() {
		for (const ms of Array.from(attentionMilestones)) {
			if (engagedMs >= ms) {
				attentionMilestones.delete(ms);
				trackEvent('attention_milestone', { engagement_time_msec: ms, page_path: window.location.pathname });
			}
		}
	}
	// Polling envío cada 10s mientras activo
	setInterval(() => {
		if (!active) return;
		const now = performance.now();
		engagedMs += now - lastActiveTs;
		lastActiveTs = now;
		trackEvent('engagement_ping', { engagement_time_msec: Math.round(engagedMs) });
		maybeSendAttention();
	}, 10000);

	on(window, 'focus', () => markActive());
	on(window, 'blur', () => markInactive());
	on(document, 'visibilitychange', () => {
		if (document.visibilityState === 'visible') markActive();
		else markInactive();
	});
	// Señal de interacción inicial (TTFI)
	let firstInteractionSent = false;
	const sendFirstInteraction = () => {
		if (firstInteractionSent) return;
		firstInteractionSent = true;
		trackEvent('first_interaction', { time_to_first_interaction_ms: Math.round(performance.now()) });
	};
	on(window, 'pointerdown', sendFirstInteraction, { once: true, capture: true });
	on(window, 'keydown', sendFirstInteraction, { once: true, capture: true });

	// 4) Vistas de secciones (opcional: elements con data-section)
	if ('IntersectionObserver' in window) {
		const seen = new Set<Element>();
		const io = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !seen.has(entry.target)) {
					seen.add(entry.target);
					const name = (entry.target as HTMLElement).getAttribute('data-section') || 'unknown';
					trackEvent('section_view', { section: name, page_path: window.location.pathname });
				}
			}
		}, { threshold: [0.5] });
		const candidates = document.querySelectorAll('[data-section]');
		candidates.forEach(el => io.observe(el));
	}
}


