MUSICK V3 — PRODUCT DESIGN & FRONTEND REBUILD SPECIFICATION
ROLE
You are the Lead Product Designer, Staff Frontend Architect, UX Researcher, Motion Designer, and Design Systems Engineer for MUSICK.

Your responsibility is NOT to redesign a few screens.

Your responsibility is to create a complete premium music experience that feels production-ready, polished, emotional, immersive, and worthy of being a real consumer product.

Think beyond screens.

Think product.

ABSOLUTE RESTRICTIONS
You are NOT allowed to modify:

Backend

APIs

Express Routes

Controllers

Services

yt-dlp Integration

Streaming Logic

Queue Logic

Search Logic

Authentication Logic

Supabase Queries

Zustand Business Logic

Database Schema

Environment Variables

Existing Features

Everything must continue working exactly as it currently works.

You may only modify:

UI

UX

Layout

Design System

Typography

Motion

Responsiveness

Accessibility

Visual Hierarchy

Interaction Design

PRODUCT VISION
MUSICK should feel like:

Spotify Premium

Apple Music

Arc Browser

Linear

Framer

Raycast

combined into one premium experience.

The user should immediately feel:

This does not look like a student project.

This looks like a real product.

CORE DESIGN PRINCIPLES
1. Music First
Music is the hero.

Not cards.

Not dashboards.

Not statistics.

2. Premium Darkness
Use deep blacks.

#050505
#090909
#0d0d0d
#101010
Avoid grey dashboards.

Avoid corporate SaaS styling.

3. Breathing Space
Every section must have space.

Never crowd content.

Large margins.

Large paddings.

Luxury spacing.

4. Motion Everywhere
Every interaction should feel alive.

No static UI.

USER JOURNEY
APP OPEN
Screen 1
MUSICK INTRO

Duration:

2-3 seconds
Layout:

Center:

MUSICK
FLOW WITH THE SOUND
Background:

Animated radial gradients

Floating particles

Soft ambient glow

Noise texture

Animation:

Logo Fade In
Tagline Fade In
Background Breathing
No buttons.

No interaction.

Pure cinematic experience.

Screen 2
LOADING EXPERIENCE

Duration:

1-2 seconds
Center:

Animated Audio Wave

Effects:

Pulse

Glow

Breathing light

Avoid:

Spinners

Generic loaders

Should feel:

Apple Music meets Arc Browser
Screen 3
AUTHENTICATION EXPERIENCE

Layout
Two-column desktop.

Single-column mobile.

Left Side:

Animated waveform video

Floating gradient lights

Subtle motion

Right Side:

Glass authentication card

Contains:

Login

Signup

Google Auth

Existing auth logic must remain untouched.

MAIN APPLICATION
DESKTOP
Layout:

Sidebar
+
Content Area
+
Persistent Music Player
MOBILE
Layout:

Content
+
Floating Mini Player
+
Bottom Navigation
Sidebar becomes Drawer.

SIDEBAR
Width:

280px
Contains:

Logo

Home

Search

Library

Playlists

Theme Controls

Profile

Visual Style:

Glassmorphism

backdrop-blur
Soft border

Glow

Hover animation

HOME PAGE
Not a dashboard.

A discovery experience.

HERO SECTION
Large greeting:

Good Evening,
What will you play?
Huge typography.

Premium spacing.

Right Side:

Animated Music Visualizer

Not static image.

CTA:

Play Trending
Animated.

Glow.

RECENTLY PLAYED
Horizontal scrolling cards.

Glass cards.

Hover:

Scale
Glow
Lift
MOOD SECTION
Mood Pills:

Focus
Energize
Chill
Sleep
Happy
Workout
Late Night
Effects:

Hover:

Glow
Scale
Active:

Liquid Accent Background
TRENDING SECTION
Cards:

Artwork

Title

Artist

Duration

Hover:

Album zoom
Play overlay
Shadow glow
SEARCH EXPERIENCE
Search must feel instant.

Top:

Massive Search Bar

Search songs, artists, albums...
Below:

Recent Searches

Trending Searches

Genre Pills

Empty State:

Beautiful Illustration

Start exploring music
LIBRARY PAGE
Transform into collection experience.

Sections:

Liked Songs

Recently Played

Playlists

Cards:

Glass

Hover Effects

Sorting Controls

PLAYLIST EXPERIENCE
Modern playlist cover.

Large artwork.

Gradient overlays.

Statistics section.

Play button.

Shuffle button.

NOW PLAYING
Most important screen.

Desktop:

Floating Panel

Mobile:

Full Screen Modal

Contains:

Large Artwork

Track Title

Artist

Playback Controls

Lyrics Button

Queue Button

Waveform

DYNAMIC BACKGROUNDS
When song changes:

Background glow changes.

Example:

Blue artwork

→ blue ambient glow

Red artwork

→ red ambient glow

Green artwork

→ green ambient glow

Use extracted dominant artwork color.

Frontend only.

PLAYER
MUST NEVER RELOAD

Player persists globally.

No route remounting.

No visual flickers.

No UI reset.

Design:

Floating Glass Bar

backdrop-blur
border
glow
Controls:

Previous

Play

Pause

Next

Shuffle

Repeat

Volume

Queue

THEME ENGINE
4 Themes

Theme 1
Mint

#8BCFC6
Default

Theme 2
Ocean

#5FA8FF
Theme 3
Rose

#E89CB0
Theme 4
Gold

#E4C16F
Theme should only affect:

Accent

Active States

Buttons

Glows

Waveforms

Never affect functionality.

Persist in LocalStorage.

MOTION SYSTEM
Use Framer Motion.

Mandatory:

Page transitions

Hover animations

Card entrances

Route transitions

Modal transitions

Waveform animations

Rule:

Elegant > Fancy
Smooth > Fast
Premium > Flashy
MOBILE SPECIFICATION
Must feel like a native app.

Requirements:

Thumb friendly

One-hand usage

Bottom Navigation

Floating Mini Player

Fullscreen Player

Swipe Gestures

Safe Area Support

No Horizontal Scroll

ACCESSIBILITY
Must support:

Keyboard Navigation

Focus States

Screen Readers

Proper Contrast

Touch Targets > 44px

PERFORMANCE
Maintain:

Fast Rendering

Optimized Animations

GPU Accelerated Motion

Minimal Re-renders

Smooth 60FPS Experience

FINAL DELIVERABLE
Provide:

✅ Complete Design System

✅ Tailwind Architecture

✅ Framer Motion Architecture

✅ Theme Engine

✅ Mobile Layout

✅ Tablet Layout

✅ Desktop Layout

✅ Ultrawide Layout

✅ Fullscreen Player

✅ Persistent Player

✅ Reusable Components

✅ Production-Ready Code

FINAL RULE
If any UI, UX, spacing, animation, navigation, hierarchy, responsiveness, accessibility, or visual decision can be improved, improve it automatically.

Your goal is not to redesign MUSICK.

Your goal is to make MUSICK look like a premium product people would willingly pay for. 🚀
REFERENCE IMAGES ATTACHED

The attached images are NOT assets to copy.

They represent the visual direction, atmosphere, spacing,
layout density, motion language, premium aesthetic,
and emotional experience expected from MUSICK.

Use the screenshots as inspiration only.

Do NOT clone them.
Do NOT recreate them pixel-for-pixel.

Instead, create a significantly more polished,
more modern, more responsive,
and more premium version tailored specifically for MUSICK.

The final result should feel like a product that could compete with:

• Spotify Premium
• Apple Music
• Arc Browser
• Linear
• Raycast
• Framer

VISUAL PRIORITY ORDER

1. Mobile Experience
2. Music Player Experience
3. Home Dashboard
4. Search Experience
5. Library
6. Playlist Management
7. Authentication Flow

If design tradeoffs are required,
always prioritize:

• Mobile usability
• Music consumption experience
• Performance
• Visual quality

IMPLEMENTATION REQUIREMENTS

DO NOT GENERATE MOCKUPS.

DO NOT CREATE DESIGN CONCEPTS ONLY.

DIRECTLY IMPLEMENT THE DESIGN
IN THE EXISTING REACT + VITE + TAILWIND CODEBASE.

Reuse existing architecture where possible.

Modify existing components instead of rebuilding functionality.

Preserve:

• Backend
• APIs
• Authentication
• Streaming
• Queue System
• Search Logic
• State Management
• Database Integration

100% functionality must remain intact.

Only improve:

• Visual Design
• User Experience
• Responsiveness
• Animations
• Layout
• Typography
• Accessibility
• Theme System

DESIGN QUALITY STANDARD

Every screen should feel:

Premium
Intentional
Cinematic
Responsive
Production Ready

No generic dashboard layouts.
No placeholder styling.
No unfinished sections.

The application should look like a polished commercial product ready for public launch.

SUCCESS CRITERIA

A user seeing MUSICK for the first time should immediately think:

"This looks like a premium music platform, not a side project."