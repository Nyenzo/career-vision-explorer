
import type { Config } from "tailwindcss";

export default {
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				career: {
					blue: '#3b82f6',
					purple: '#8b5cf6',
					indigo: '#6366f1',
					violet: '#a855f7',
					navy: '#1e293b',
					slate: '#64748b',
					light: '#f8fafc'
				},
                // New Visiondrill Palette
                "tertiary-fixed": "#6ffbbe",
                "secondary-fixed-dim": "#b4c5ff",
                "surface-container-highest": "#e0e3e5",
                "on-primary-container": "#eeefff",
                "outline": "#737686",
                "surface": "#f7f9fb",
                "primary-container": "#2563eb",
                "surface-variant": "#e0e3e5",
                "inverse-surface": "#2d3133",
                "on-primary": "#ffffff",
                "on-error-container": "#93000a",
                "secondary-fixed": "#dbe1ff",
                "inverse-on-surface": "#eff1f3",
                "on-tertiary-container": "#bdffdb",
                "on-primary-fixed-variant": "#003ea8",
                "error": "#ba1a1a",
                "surface-container-lowest": "#ffffff",
                "on-error": "#ffffff",
                "on-surface": "#191c1e",
                "outline-variant": "#c3c6d7",
                "surface-container-high": "#e6e8ea",
                "on-background": "#191c1e",
                "secondary-container": "#acbfff",
                "primary-fixed-dim": "#b4c5ff",
                "on-secondary-fixed": "#00174b",
                "tertiary-container": "#007d55",
                "surface-container-low": "#f2f4f6",
                "primary-fixed": "#dbe1ff",
                "on-surface-variant": "#434655",
                "surface-dim": "#d8dadc",
                "tertiary-fixed-dim": "#4edea3",
                "on-tertiary": "#ffffff",
                "surface-container": "#eceef0",
                "on-secondary": "#ffffff",
                "on-tertiary-fixed-variant": "#005236",
                "surface-bright": "#f7f9fb",
                "on-secondary-container": "#394c84",
                "inverse-primary": "#b4c5ff",
                "error-container": "#ffdad6",
                "on-secondary-fixed-variant": "#31447b",
                "tertiary": "#006242",
                "surface-tint": "#0053db",
                "on-primary-fixed": "#00174b",
                "on-tertiary-fixed": "#002113"
			},
            fontFamily: {
                headline: ["Manrope", "sans-serif"],
                body: ["Inter", "sans-serif"],
                label: ["Inter", "sans-serif"]
            },
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide-in': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-in': 'slide-in 0.5s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
