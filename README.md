# In Progress

[Play on GitHub here](http://seryckd.github.io/noisy-neighbour/src/index.html)

_Part of my Learning JavaScript series_

Everything is better with Programmer Art (TM).

The aim is to use plain JavaScript with no toolchain just for learning purposes. Initially everything is HTML and Canvas.

Control
* mouse to click and select
* w, a, s, d to scroll
* space to end turn

Completed
* AI using Collaborative Diffusion
* Click and select control scheme

## TODO

* May need to look at WebGL as mobile performance is so far quite bad.
* line() is selecting cells that are not there. need to find a way to select around the gaps
* can target enemies outside of LoS
* implement different strategies.
*   snipe - prefer to shoot. will move to close to shooting range, but move away if too close
*   swarm - weak range weapons, will usually choose to charge and go to combat
*   
*
* when in acton mode, if click on another player then switch to that one
* key press/button to switch to next player with free action points
* moving opponents heat seeking AI
* field of view (fog of war)
* change the order that computer players move in. maybe the closest first, maybe those that will
  fire first.

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

'n' - show diffusion colour and cell ids

'c' - cause a diffusion (no longer useful but left in)

'w', 'a', 's', 'd' - scroll viewport

## line of sight/field of view
current
- loop through all possible targets checking to see if they are in range

need proper field of view

## collaborative diffusion

[[Paper][http://www.cs.colorado.edu/~ralex/papers/PDF/OOPSLA06antiobjects.pdf]]

Goal Agents - every player
Pursuer Agents - computer players
Path Environment Agents - hexes with no obstacles
Obstacle Environment Agents - hexes with walls

Every time an actor (player or computer) moves or dies recalculate the diffusion map.
The diffusion occurs until the scent stabilizes. This probably has the same effect as
starting from a fresh scent every turn.  Need to look at that eventually.

should Pursuer Agents diffuse the scent
   none - each agent will block the path of another one. great if there is another path to the goal,
       otherwise will cause only a single agent at a time to pursue
   some - each agent will let some of the scent pass. this should result in another path being
          more deserible, but if no other path is available then agents will follow same path
   all -  each agent will have no affect on the diffusion. agents will all follow the same path

## performance improvements

may have a problem with the canvas as it get s cleared and redrawn each time.
look at multiple canvases (http://blog.sklambert.com/html5-canvas-game-the-player-ship/)
or 'dirty rectangles' technique

## concepts

dead bodies
   - actors leave something behind when then die (skull, cross, ..)
   - dead bodies can pile up in a single cell
   - each body gives a movement penatly
   - possibly shooting penalties too
   - maybe bodies jump a cell before landing?
   - grenades/explosions clear bodies

skill tree
   - instead of classes, actors have skill trees they can spend points in

dark
   - dark levels where map is not drawn. Still show players and targetting hexes when moving
   - or level lights up from torches that players and enemies carry


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
   
