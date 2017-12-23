# In Progress

_Part of my Learning JavaScript series_

Everything is better with Programmer Art (TM).

The aim is to use plain JavaScript with no toolchain just for learning purposes. Initially everything is HTML and Canvas.

   * let is not available in Safarif9 (would need a transpiler)

May need to look at WebGL as mobile performance is so far quite bad.

Take a look at http://seryckd.github.io/noisy-neighbour/src/index.html

## TODO

* when in acton mode, if click on another player then switch to that one
* key press/button to switch to next player with free action points
* moving opponents heat seeking AI
* field of view
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

## line of sight/field of view
current
- loop through all possible targets checking to see if they are in range

need proper field of view

## collaborative diffusion

[[Paper][http://www.cs.colorado.edu/~ralex/papers/PDF/OOPSLA06antiobjects.pdf]]
WIP
Goal Agents - every player
Pursuer Agents - computer players
Path Environment Agents - hexes with no obstacles
Obstacle Environment Agents - hexes with walls

At the beginning of the computer turn, calculate the diffusion map for each path environment agent.
Each iteration will diffuse the scent of the players 1 path. To enable the computer to see players
5 hexes away run the iteration 5 times.

should Pursuer Agents diffuse the scent
   none - each agent will block the path of another one. great if there is another path to the goal,
       otherwise will cause only a single agent at a time to pursue
   some - each agent will let some of the scent pass. this should result in another path being
          more deserible, but if no other path is available then agents will follow same path
   all -  each agent will have no affect on the diffusion. agents will all follow the same path

diffusion equation

u.center.new = u.center + diffusion.coefficent * sum.neighbours (u.neighbour - u.center)

diffusion.coefficient is [0, 0.5]

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
   
