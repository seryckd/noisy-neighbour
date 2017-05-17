# In Progress

_Part of my Learning JavaScript series_

Everything is better with Programmer Art (TM).

## TODO

* when in acton mode, if click on another player then switch to that one
* moving opponents heat seeking AI
* field of view

## JavaScript

let is not available in Safari9
should be using a transpiler but haven't set up a toolchain yet

## control scheme

Mode - ACTION, SELECT

mouse move over (SELECT)
  non wall cell - highlight green
  player with >0 action points  - highlight red as selectable
  actor - show stats in dashboard

mouse move over (ACTION)
  non wall cell - highlight green
  reachable cell - show path from source to cell

mouse click (SELECT)
  selectable player - enter ACTION mode, display cells that can be reached and enemies that can be targetted

mouse click (ACTION)
  reachable cells - move to cell
  targetable actors - combat
  anything else - cancel action

click to select unit
  cells that can be moved to with current action points are highlighted with 'can move to' overlay
  cells that contain targets for ranged or close combat are highlighted with 'target' overlay

  as mouse moves over 'can move to' highlighted squares it leaves a trail of breadcrumbs for
  how unit could move

click on 'can move to'
   remove all highlights
   move unit to destination

click on 'target'
   remove all highlights
   perform ranged or close combat

click on something not highlighted
   remove all highlights
   deselect unit

## line of sight/field of view
current
- loop through all possible targets checking to see if they are in range

need proper field of view


technology
webGL
canvas

## concepts

dead bodies
   - actors leave something behind when then die (skull, cross, ..)
   - dead bodies can pile up in a single cell
   - each body gives a movement penatly
   - possibly shooting penalties too
   - maybe bodies jump a cell before landing?

skill tree
   - instead of classes, actors have skill trees they can spend points in

## Noisy Neighbours

Dwarves vs Goblins & friends.
Hex grid.
Turn based.
Action points.
Play as dwarves or goblins

Scenario
	dwarves & goblins both trying to colonize a new mountain.

dwarf classes
	range
		crossbow, less range than bows
	melee
		high toughness  / shield options
	engineer
		drop timed bomb
		larger weapons with longer range than crossbow
			and do more damage


goblin classes
	range
		bow, longer range
	melee
		hand weapons
	assassin
		stealthy
		steals gear
		backstab


neutral
	could also be other things lurking in depths that kill
	both sides.

stories
	+ scouting new areas and stumbling into opponent units
	+ send units in to grab resources from defended area
	+ defend against attacks to settlement
	+ stealth campaigns ?  how to assign xp

skill tree

   instead of classes, consider skills   
   assign points to improve

   range
      - hand crossbow (one handed)
         - crossbow
            - heavy crossbow (two handed)
      - grenade
         - improved accuracy
      - skills
         - deadshot (doesn't miss)
   mining equipment
      - dynamite
         - set trap
         - cave-in

   melee
      - hand axe
         - battle axe (two handed)
      - shield
      - armour
      - parry
   
