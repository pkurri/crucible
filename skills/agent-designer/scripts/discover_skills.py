#!/usr/bin/env python3
"""
Discover existing skills that match required capabilities.
Scans the skills manifest and SKILL.md files for semantic matches.
"""

import json
import sys
import os
import re
import argparse
from pathlib import Path
from difflib import SequenceMatcher


def load_manifest(manifest_path: str) -> dict:
    """Load the skills manifest."""
    with open(manifest_path, 'r') as f:
        return json.load(f)


def extract_keywords(text: str) -> set:
    """Extract meaningful keywords from text."""
    # Remove common words
    stop_words = {
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
        'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'could', 'should', 'may', 'might', 'shall', 'can',
        'and', 'or', 'but', 'if', 'while', 'for', 'with', 'to',
        'from', 'by', 'on', 'in', 'at', 'of', 'use', 'when', 'this',
        'that', 'it', 'its', 'they', 'them', 'their', 'we', 'our',
    }
    words = set(re.findall(r'[a-z]+', text.lower()))
    return words - stop_words


def similarity_score(cap: str, skill_text: str) -> float:
    """Calculate similarity between a capability and skill text."""
    cap_keywords = extract_keywords(cap)
    skill_keywords = extract_keywords(skill_text)
    
    if not cap_keywords or not skill_keywords:
        return 0.0
    
    # Exact keyword overlap
    overlap = cap_keywords & skill_keywords
    keyword_score = len(overlap) / max(len(cap_keywords), 1)
    
    # Fuzzy string matching
    fuzzy_score = SequenceMatcher(None, cap.lower(), skill_text.lower()[:200]).ratio()
    
    # Combined score
    return (keyword_score * 0.6) + (fuzzy_score * 0.4)


def discover_skills(capabilities: list, manifest_path: str, threshold: float = 0.15):
    """Find skills matching the required capabilities."""
    manifest = load_manifest(manifest_path)
    skills = manifest.get('skills', [])
    
    results = {
        'reuse': [],      # Direct matches (score > 0.4)
        'compose': [],    # Partial matches (0.2 < score < 0.4)
        'build_new': [],  # Capabilities with no good match
    }
    
    for cap in capabilities:
        best_match = None
        best_score = 0
        matches = []
        
        for skill in skills:
            # Build searchable text from skill
            search_text = ' '.join([
                skill.get('name', ''),
                skill.get('summary', ''),
                ' '.join(skill.get('tags', [])),
            ])
            
            score = similarity_score(cap, search_text)
            
            if score > threshold:
                matches.append({
                    'skill': skill['name'],
                    'score': round(score, 3),
                    'summary': skill.get('summary', '')[:100],
                })
                
                if score > best_score:
                    best_score = score
                    best_match = skill['name']
        
        if best_score > 0.4:
            results['reuse'].append({
                'capability': cap,
                'best_match': best_match,
                'score': round(best_score, 3),
                'alternatives': sorted(matches, key=lambda x: x['score'], reverse=True)[:3],
            })
        elif best_score > 0.2:
            results['compose'].append({
                'capability': cap,
                'partial_matches': sorted(matches, key=lambda x: x['score'], reverse=True)[:3],
            })
        else:
            results['build_new'].append({
                'capability': cap,
                'reason': 'No existing skill matches this capability',
            })
    
    return results


def main():
    parser = argparse.ArgumentParser(description='Discover reusable skills for capabilities')
    parser.add_argument('--capabilities', required=True, help='Comma-separated list of capabilities')
    parser.add_argument('--manifest', required=True, help='Path to skills manifest.json')
    parser.add_argument('--threshold', type=float, default=0.15, help='Minimum similarity threshold')
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    
    args = parser.parse_args()
    capabilities = [c.strip() for c in args.capabilities.split(',')]
    
    results = discover_skills(capabilities, args.manifest, args.threshold)
    
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print("\n🔍 Skill Discovery Results")
        print("=" * 60)
        
        if results['reuse']:
            print("\n✅ REUSE (direct matches):")
            for item in results['reuse']:
                print(f"  • {item['capability']} → {item['best_match']} (score: {item['score']})")
        
        if results['compose']:
            print("\n🔄 COMPOSE (partial matches — combine these):")
            for item in results['compose']:
                matches = ', '.join(m['skill'] for m in item['partial_matches'])
                print(f"  • {item['capability']} → [{matches}]")
        
        if results['build_new']:
            print("\n🆕 BUILD NEW (no existing skill):")
            for item in results['build_new']:
                print(f"  • {item['capability']}")
        
        print(f"\nSummary: {len(results['reuse'])} reuse, "
              f"{len(results['compose'])} compose, "
              f"{len(results['build_new'])} build new")


if __name__ == '__main__':
    main()
