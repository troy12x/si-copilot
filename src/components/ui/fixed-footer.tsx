'use client';
import React from 'react';
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from 'lucide-react';

interface FooterLink {
	title: string;
	href: string;
	icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
	label: string;
	links: FooterLink[];
}

const footerLinks: FooterSection[] = [
	{
		label: 'Product',
		links: [
			{ title: 'Features', href: '#features' },
			{ title: 'Pricing', href: '#pricing' },
			{ title: 'Testimonials', href: '#testimonials' },
			{ title: 'Integration', href: '/' },
		],
	},
	{
		label: 'Company',
		links: [
			{ title: 'FAQs', href: '/faqs' },
			{ title: 'About Us', href: '/about' },
			{ title: 'Privacy Policy', href: '/privacy' },
			{ title: 'Terms of Services', href: '/terms' },
		],
	},
	{
		label: 'Resources',
		links: [
			{ title: 'Blog', href: '/blog' },
			{ title: 'Changelog', href: '/changelog' },
			{ title: 'Brand', href: '/brand' },
			{ title: 'Help', href: '/help' },
		],
	},
	{
		label: 'Social Links',
		links: [
			{ title: 'Facebook', href: '#', icon: FacebookIcon },
			{ title: 'Instagram', href: '#', icon: InstagramIcon },
			{ title: 'Youtube', href: '#', icon: YoutubeIcon },
			{ title: 'LinkedIn', href: '#', icon: LinkedinIcon },
		],
	},
];

export function Footer() {
	return (
		<div className="relative mt-32 overflow-visible">
			{/* White glow effect on the footer - like light casting on the floor */}
			<div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[1000px] h-40 bg-white opacity-20 blur-3xl rounded-full z-0"></div>
			<div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[800px] h-36 bg-white opacity-25 blur-3xl rounded-full z-0"></div>
			<div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[600px] h-32 bg-white opacity-30 blur-2xl rounded-full z-0"></div>
			<div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-96 h-28 bg-white opacity-35 blur-xl rounded-full z-0"></div>
			<div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-64 h-20 bg-white opacity-40 blur-lg rounded-full z-0"></div>
			<div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-40 h-12 bg-white opacity-50 blur-md rounded-full z-0"></div>
			
			{/* Large SI LX text that appears to stand on the footer */}
			<div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
				<h1 className="text-8xl md:text-9xl font-bold tracking-tighter" style={{fontFamily: 'var(--font-quincy), serif', color: '#FFE450'}}>
					SI LX
				</h1>
			</div>
			
			<footer className="relative w-full flex flex-col items-center justify-center border-t px-6 py-12 lg:py-16 pt-24" style={{backgroundColor: '#000', color: '#fff', width: '100%', borderTopLeftRadius: '60px', borderTopRightRadius: '60px', position: 'relative', overflow: 'hidden'}}>
				{/* Subtle gradient lighting effect */}
				<div 
					className="absolute top-0 left-0 right-0 h-40 z-0" 
					style={{
						background: 'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(255,255,255,0) 100%)',
						pointerEvents: 'none'
					}}
				></div>
				
				<div className="bg-foreground/20 absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full blur" />

				<div className="max-w-7xl mx-auto grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
					<div className="space-y-4">
						<div className="text-2xl font-bold text-white" style={{fontFamily: 'var(--font-quincy), serif'}}>
							SI Copilot
						</div>
						<p className="text-muted-foreground mt-8 text-sm md:mt-0">
							© {new Date().getFullYear()} SI Copilot. All rights reserved.
						</p>
					</div>

					<div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-3 xl:col-span-2 xl:mt-0">
						{footerLinks.map((section, index) => (
							<div key={section.label}>
								<div className="mb-10 md:mb-0">
									<h3 className="text-xs font-semibold text-white">{section.label}</h3>
									<ul className="text-muted-foreground mt-4 space-y-2 text-sm">
										{section.links.map((link) => (
											<li key={link.title}>
												<a
													href={link.href}
													className="hover:text-foreground inline-flex items-center transition-all duration-300"
												>
													{link.icon && <link.icon className="mr-1 w-4 h-4" />}
													{link.title}
												</a>
											</li>
										))}
									</ul>
								</div>
							</div>
						))}
					</div>
				</div>
			</footer>
		</div>
	);
}
