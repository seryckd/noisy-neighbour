In Progress
   
TODO

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
* static opponents
* target overlays
* melee, range combat
* moving opponents heat seeking AI
* 


++ control scheme

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
   


technology
webGL
canvas

   
hexgrid
   hash map of cells
   cell has image, is_passable
   
   hexlibrary
      line, distance, cube, axial


+ Noisy Neighbours


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
	