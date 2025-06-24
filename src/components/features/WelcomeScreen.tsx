'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Lightbulb, Mic, Camera, Sparkles } from 'lucide-react';

const features = [
	{
		icon: Lightbulb,
		title: 'Discover Recipes',
		description: "Tell me your mood or ingredients, and I'll find the perfect recipe.",
	},
	{
		icon: Mic,
		title: 'Voice Assistant',
		description: 'Go hands-free. Ask me for step-by-step instructions or timers.',
	},
	{
		icon: Camera,
		title: 'Smart Camera',
		description: 'Scan ingredients to add to your pantry or check for safety hazards.',
	},
];

export function WelcomeScreen({ onGetStarted }: { onGetStarted: () => void }) {
	const [hideWelcome, setHideWelcome] = React.useState(false);

	React.useEffect(() => {
		if (
			typeof window !== 'undefined' &&
			localStorage.getItem('hideWelcomeScreen') === 'true'
		) {
			setHideWelcome(true);
			onGetStarted();
		}
	}, [onGetStarted]);

	if (hideWelcome) return null;

	const handleDontShowAgain = () => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('hideWelcomeScreen', 'true');
			setHideWelcome(true);
			onGetStarted();
		}
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-background p-4 animate-fade-in">
			<div className="w-full max-w-xl text-center">
				<div className="flex justify-center items-center gap-3 mb-4 animate-startup-fade-in-up-1">
					<ChefHat className="h-12 w-12 text-primary animate-glow" />
					<h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl">
						CulinAI
					</h1>
				</div>
				<p className="text-base text-muted-foreground max-w-lg mx-auto mb-8 animate-startup-fade-in-up-2">
					Your rebellious AI kitchen partner. I'm here to help you cook amazing
					food, no matter your skill level.
				</p>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-8 animate-startup-fade-in-up-3">
					{features.map((feature, index) => (
						<Card
							key={feature.title}
							className="bg-card/50 border-border/50 animate-startup-fade-in-up-3"
							style={{
								animationDelay: `${index * 150 + 400}ms`,
							}}
						>
							<CardHeader className="p-4">
								<div className="bg-primary/10 text-primary w-10 h-10 rounded-lg flex items-center justify-center mb-2">
									<feature.icon className="h-5 w-5" />
								</div>
								<CardTitle className="text-base font-semibold">
									{feature.title}
								</CardTitle>
							</CardHeader>
							<CardContent className="p-4 pt-0">
								<p className="text-sm text-muted-foreground">
									{feature.description}
								</p>
							</CardContent>
						</Card>
					))}
				</div>

				<Button
					size="lg"
					className="animate-startup-fade-in-up-4 mb-2"
					onClick={onGetStarted}
				>
					<Sparkles className="mr-2 h-5 w-5" />
					Let's Get Cooking!
				</Button>
				<br />
				<Button
					variant="ghost"
					size="sm"
					className="text-xs text-muted-foreground"
					onClick={handleDontShowAgain}
				>
					Don't show this again
				</Button>
			</div>
		</div>
	);
}
