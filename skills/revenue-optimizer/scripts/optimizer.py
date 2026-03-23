import json
import sys
import argparse

def generate_revenue_report(game_concept, target_platform):
    """
    Generates a revenue optimization report classifying features into FREE and PRO tiers.
    """
    report = {
        "concept": game_concept,
        "platform": target_platform,
        "strategy": {
            "FREE": [
                "Core Gameplay Loop (unrestricted)",
                "Initial 10 tutorial stages",
                "Basic character customization (3 skins)",
                "Global leaderboards access",
                "Daily login rewards (basic)"
            ],
            "PRO": [
                "Exclusive High-Difficulty Levels (Expansions)",
                "Advanced Customization (VFX, 50+ skins)",
                "No Interstitial or Forced Ads",
                "Fast-pass progression (2x XP permanently)",
                "Exclusive Monthly Battle Pass rewards",
                "Guild Leadership privileges",
                "Early access to beta features"
            ],
            "IAP_MODELS": [
                "Consumable: Energy refills, revives",
                "Durable: Unlimited inventory, ad-removal",
                "Subscription: VIP Club, Monthly Loot-box"
            ]
        },
        "monetization_verdict": "Freemium / Hybrid (Recommended)",
        "conversion_triggers": [
            "Level 11 lock-out (Conversion for story content)",
            "Wait-times on crafting (Conversion for time-saving)",
            "Competitive rankings (Conversion for status items)"
        ]
    }
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Revenue Optimizer for Games")
    parser.add_argument("concept", help="The game concept or genre")
    parser.add_argument("--platform", default="mobile", help="Target platform (mobile, web, pc)")
    
    args = parser.parse_args()
    
    result = generate_revenue_report(args.concept, args.platform)
    print(json.dumps(result, indent=2))
