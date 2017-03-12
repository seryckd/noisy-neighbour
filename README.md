# In Progress

_Part of my Learning JavaScript series_

Everything is better with Programmer Art (TM).

## TODO

* _hex grid (done)_
* _input selects grid (done)_
* _cross hairs mark hex cursor is over (done)_
* _scroll it with keys (done)_
* _character moves around grid (done)_
* _player moves towards clicked hex 1 hex at a time (done)_
* _add walls scenery (done)_
* _track movement points (done)_
* _button for end turn (done)_
* _selected overlays (done)_
* _static opponents (done)_
* _target overlays (done)_
* _range combat (done)_
* bug fix melee combat, keep focus on player until no more action points
* grid should be under players
* moving opponents heat seeking AI
* field of view

## JavaScript

let is not available in Safari9
should be using a transpiler but haven't set up a toolchain yet

## control scheme

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
